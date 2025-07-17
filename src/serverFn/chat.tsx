import { createServerFn } from '@tanstack/react-start'
import z from 'zod/v4'

import { modelNames } from '~/constants/ai-models'
import { eq } from 'drizzle-orm'
import { db } from '~/db/connection'
import { chatTable } from '~/db/schema/chat'
import { extractTextAndSummary } from '~/utils/string'
import { notFound } from '@tanstack/react-router'
import { Message, messagesSchema } from './utils/internal'
import { getAdapterForModel } from './utils/provider'
import { messageSchema, userIdSchema } from '~/utils/input'
import { SUMMARY_PROMPT } from '~/constants/summary'

const modelSchema = z.enum(modelNames, {
  error: 'Invalid model name',
})

const existingChatSchema = z.object({
  chatId: z.uuidv4(),
  model: modelSchema,
  message: messageSchema,
})

export const generateChatId = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data) => {
    return userIdSchema.parse(data)
  })
  .handler(async ({ data: { userId } }) => {
    const chatId = crypto.randomUUID()
    console.log('Generating new chat ID:', chatId)
    await db.insert(chatTable).values({
      id: chatId,
      userId,
    })
    return chatId
  })

const chatIdSchema = z.object({
  chatId: z.uuidv4(),
})
const chatByIdResponseSchema = z.object({
  chatId: z.uuidv4(),
  name: z.string().nullable(),
  messages: messagesSchema,
})
type ChatByIdResponse = z.infer<typeof chatByIdResponseSchema>

export const getChatById = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data) => {
    return chatIdSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const chatId = data.chatId

    const chatResult = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.id, chatId))
    const chat = chatResult[0]
    if (!chat) {
      throw notFound()
    }

    const response: ChatByIdResponse = {
      chatId: chat.id,
      name: chat.name,
      messages: messagesSchema.nullable().parse(chat.messages) || [],
    }
    return response
  })

const messageToDbMessage = (
  message: string,
  role: Message['role']
): Message => {
  return {
    role,
    content: [{ type: 'text', text: message }],
  }
}

const appendToDbMessages = async (
  chatId: string,
  history: Message[],
  summary?: string
) => {
  const name = summary && summary.length > 0 ? { name: summary } : {}
  return await db
    .update(chatTable)
    .set({
      messages: messagesSchema.parse(history),
      ...name,
    })
    .where(eq(chatTable.id, chatId))
}

export const postMessage = createServerFn({
  method: 'POST',
  response: 'raw',
})
  .validator((formData) => {
    if (!(formData instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    console.log('Validate', Object.fromEntries(formData.entries()))
    return existingChatSchema.parse(Object.fromEntries(formData.entries()))
  })
  .handler(async ({ signal, data }) => {
    console.log('Received message:', data)
    const chatId = data.chatId

    // get chat history from db
    const chatResult = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.id, chatId))
    const chat = chatResult[0]

    const history = chat.messages as Message[] | null
    console.log('Chat history:', history)
    let messages: Message[] = []
    let messagesWithSummary: Message[] | undefined = undefined
    if (!history || history.length === 0) {
      messages = [messageToDbMessage(data.message, 'user')]

      messagesWithSummary = [
        messageToDbMessage(SUMMARY_PROMPT + ' ' + data.message, 'user'),
      ]
    } else {
      messages = [...history, messageToDbMessage(data.message, 'user')]
    }

    await appendToDbMessages(chatId, messages)

    const messagesForAi = messagesWithSummary || messages

    let stream: ReadableStream<any>

    const adapter = getAdapterForModel(data.model)
    stream = new ReadableStream({
      async start(controller) {
        let textToStore = ''
        try {
          await adapter.streamChunks(messagesForAi, signal, (chunk) => {
            if (signal.aborted) {
              console.warn('Stream aborted, closing controller')
              controller.close()
              return
            }
            console.log('Received streamChunk:', chunk)
            if (chunk.type === 'text') {
              controller.enqueue(new TextEncoder().encode(chunk.data))
              textToStore += chunk.data
            }
          })
        } catch (err) {
          controller.enqueue(
            new TextEncoder().encode(`event: error\ndata: ${String(err)}\n\n`)
          )
        } finally {
          if (textToStore.length > 0) {
            console.log('Appending message to db:', textToStore)

            const [textWithoutSummary, summary] =
              extractTextAndSummary(textToStore)
            const newHistory = [
              ...messages,
              messageToDbMessage(textWithoutSummary, 'model'),
            ]
            await appendToDbMessages(chatId, newHistory, summary)
          }
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  })
