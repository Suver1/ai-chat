import { createServerFn } from '@tanstack/react-start'
import { db } from '~/db/connection'
import { chatTable } from '~/db/schema/chat'
import { eq, desc } from 'drizzle-orm'
import z from 'zod/v4'

const userIdSchema = z.object({
  userId: z.uuidv4(),
})

export type ChatListItem = {
  chatId: string
  name: string | null
}

export type ChatListResponse = ChatListItem[]

export const getChatList = createServerFn({
  method: 'GET',
  response: 'data',
})
  .validator((data) => {
    return userIdSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const userId = data.userId

    const chatListResult: ChatListResponse = await db
      .select({ chatId: chatTable.id, name: chatTable.name })
      .from(chatTable)
      .where(eq(chatTable.userId, userId))
      .orderBy(desc(chatTable.updatedAt))

    return chatListResult
  })
