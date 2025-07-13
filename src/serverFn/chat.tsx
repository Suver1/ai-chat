import { createServerFn } from '@tanstack/react-start'
import { GoogleGenAI } from '@google/genai'
import z from 'zod/v4'

import Anthropic from '@anthropic-ai/sdk'
import { ModelName, modelNames } from '~/constants/ai-models'
import { eq } from 'drizzle-orm'
import { db } from '~/db/connection'
import { messagesTable } from '~/db/schema'
import { extractTextAndSummary } from '~/utils/string'
import { notFound } from '@tanstack/react-router'

type Content = {
  type: 'text'
  text: string
}

type Message = {
  role: 'user' | 'model'
  content: Content[]
}

type Messages = Message[]

type GeminiContent = {
  text: string
}

type GeminiMessages = {
  role: 'user' | 'model'
  parts: GeminiContent[]
}[]

type AnthropicContent = {
  type: 'text'
  text: string
}

type AnthropicMessages = {
  role: 'user' | 'assistant'
  content: AnthropicContent[]
}[]

const messagesSchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.array(
      z.object({
        type: z.literal('text'),
        text: z.string(),
      })
    ),
  })
)

const messagesToGeminiContents = (messages: Messages): GeminiMessages => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: msg.content.map((part) => ({ text: part.text })),
  }))
}

const messagesToAnthropicMessages = (messages: Messages): AnthropicMessages => {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content.map((part) => ({
      type: part.type,
      text: part.text,
    })),
  }))
}

const getResponseByModel = (
  model: ModelName,
  messages: Messages,
  signal: AbortSignal
) => {
  if (model === 'gemini-2.5-flash') {
    const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] })
    return ai.models.generateContentStream({
      model,
      contents: messagesToGeminiContents(messages),
      config: {
        abortSignal: signal,
        maxOutputTokens: 400,
        temperature: 0.3,
      },
    })
  } else if (model === 'claude-3-5-haiku-20241022') {
    const ai = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
    return ai.messages.stream(
      {
        model,
        max_tokens: 400,
        temperature: 0.3,
        messages: messagesToAnthropicMessages(messages),
      },
      {
        signal,
      }
    )
  }
  throw new Error(`Unsupported model: ${model}`)
}

// async function main() {
//   const response = await ai.models.generateContent({
//     model: 'gemini-2.0-flash',
//     contents: 'How does AI work?',
//   })
//   console.log(response.text)

//   const msg = await anthropic.messages.create({
//     model: 'claude-3-5-haiku-20241022',
//     max_tokens: 200,
//     temperature: 0.3,
//     messages: [],
//   })
//   console.log(msg)
// }

// await main()

export const messageSchema = z.string().trim().min(1, 'Message is required')

export const userIdSchema = z.object({
  userId: z.uuidv4(),
})

const modelSchema = z.enum(modelNames, {
  error: 'Invalid model name',
})

export const existingChatSchema = z.object({
  chatId: z.uuidv4(),
  model: modelSchema,
  message: messageSchema,
})

export const newChatSchema = z.object({
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
    await db.insert(messagesTable).values({
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
      .from(messagesTable)
      .where(eq(messagesTable.id, chatId))
    const chat = chatResult[0]
    if (!chat) {
      throw notFound()
    }

    const response: ChatByIdResponse = {
      chatId: chat.id,
      name: chat.name,
      messages: messagesSchema.parse(chat.messages),
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
  history: Messages,
  summary?: string
) => {
  const name = summary && summary.length > 0 ? { name: summary } : {}
  return await db
    .update(messagesTable)
    .set({
      messages: messagesSchema.parse(history),
      ...name,
    })
    .where(eq(messagesTable.id, chatId))
}

export const postMessage = createServerFn({
  method: 'POST',
  response: 'raw',
})
  .validator((formData) => {
    if (!(formData instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    return existingChatSchema.parse(Object.fromEntries(formData.entries()))
  })
  .handler(async ({ signal, data }) => {
    console.log('Received message:', data)

    const chatId = data.chatId

    // get chat history from db
    const chatResult = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, chatId))
    const chat = chatResult[0]

    const history = chat.messages as Messages
    let messages: Messages = []
    let messagesWithSummary: Messages | undefined = undefined
    if (!history) {
      messages = [messageToDbMessage(data.message, 'user')]

      const summaryMessage =
        'In addition to your response for the user question below, end your response with a short one-sentence (ideally 2-4 words) summary of the conversation so far to be used in a heading. Put it in the following schema: ```summary: <summary>```'
      messagesWithSummary = [
        messageToDbMessage(summaryMessage + data.message, 'user'),
      ]
    } else {
      messages = [...history, messageToDbMessage(data.message, 'user')]
    }

    // write chat message to db
    await appendToDbMessages(chatId, messages)
    // generate message with history for the selected model

    // call ai and stream

    // const response = getResponseByModel(data.model, messages, signal)

    // const response = getResponseByModel(
    //   'claude-3-5-haiku-20241022',
    //   messages,
    //   signal
    // )
    // response is type Promise<AsyncGenerator<GenerateContentResponse, any, any>> | MessageStream

    const messagesForAi = messagesWithSummary || messages

    const ai = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })
    // if isNew prepend messages with "In addition to your response for the
    // user question below, provide a short one-sentence summary
    // of the conversation. Put the summary in the
    // following schema: ```summary: <summary>```"

    const response = ai.messages.stream(
      {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
        temperature: 0.3,
        messages: messagesToAnthropicMessages(messagesForAi),
      },
      {
        signal,
      }
    )
    // response is type MessageStream

    const handleAnthropicChunk = (
      chunk: Anthropic.Messages.RawMessageStreamEvent
    ) => {
      if (
        chunk.type === 'content_block_start' &&
        chunk.content_block.type === 'text'
      ) {
        return chunk.content_block.text
      } else if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        return chunk.delta.text
      }
      return ''
    }

    const stream = new ReadableStream({
      async start(controller) {
        let textToStore = ''
        try {
          for await (const chunk of response) {
            // On response: Add output to chat history in db
            console.debug('Received chunk:', chunk)
            let text = handleAnthropicChunk(chunk)
            if (!text || text.length === 0) {
              console.log('Received empty text, skipping')
              continue
            }
            controller.enqueue(new TextEncoder().encode(`data: ${text}\n\n`))
            textToStore += text
            if (signal.aborted) break
          }
        } catch (err) {
          controller.enqueue(
            new TextEncoder().encode(`event: error\ndata: ${String(err)}\n\n`)
          )
        } finally {
          console.log('textToStore:', textToStore)
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

    // return streamed response to client
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })

    // return new Response(`Chat ID: ${chatId}`)

    // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    // const response = await ai.models.generateContentStream({
    //   model: 'gemini-2.0-flash',
    //   contents: message,
    //   config: {
    //     maxOutputTokens: 200,
    //     abortSignal: signal,
    //   },
    // })

    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       for await (const chunk of response) {
    //         controller.enqueue(
    //           new TextEncoder().encode(`data: ${chunk.text}\n\n`)
    //         )
    //         if (signal.aborted) break
    //       }
    //     } catch (err) {
    //       controller.enqueue(
    //         new TextEncoder().encode(`event: error\ndata: ${String(err)}\n\n`)
    //       )
    //     } finally {
    //       controller.close()
    //     }
    //   },
    // })
    // return new Response(stream, {
    //   headers: {
    //     'Content-Type': 'text/event-stream',
    //     'Cache-Control': 'no-cache',
    //     Connection: 'keep-alive',
    //   },
    // })
  })

export const streamEvents = createServerFn({
  method: 'GET',
  response: 'raw',
}).handler(async ({ signal }) => {
  // Create a ReadableStream to send chunks of data
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial response immediately
      controller.enqueue(new TextEncoder().encode('Connection established\n'))

      let count = 0
      const interval = setInterval(() => {
        // Check if the client disconnected
        if (signal.aborted) {
          clearInterval(interval)
          controller.close()
          return
        }

        // Send a data chunk
        controller.enqueue(
          new TextEncoder().encode(
            `Event ${++count}: ${new Date().toISOString()}\n`
          )
        )

        // End after 10 events
        if (count >= 10) {
          clearInterval(interval)
          controller.close()
        }
      }, 1000)

      // Ensure we clean up if the request is aborted
      signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  // Return a streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})
