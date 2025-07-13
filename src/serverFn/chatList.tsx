import { createServerFn } from '@tanstack/react-start'
import { userIdSchema } from './chat'
import { db } from '~/db/connection'
import { messagesTable } from '~/db/schema'
import { eq, desc } from 'drizzle-orm'

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
      .select({ chatId: messagesTable.id, name: messagesTable.name })
      .from(messagesTable)
      .where(eq(messagesTable.userId, userId))
      .orderBy(desc(messagesTable.updatedAt))

    return chatListResult
  })
