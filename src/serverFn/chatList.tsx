import { createServerFn } from '@tanstack/react-start'
import { db } from '~/db/connection'
import { chatTable } from '~/db/schema/chat'
import { eq, desc } from 'drizzle-orm'
import { authMiddleware } from './middleware/auth'

export type ChatListItem = {
  chatId: string
  name: string | null
}

export type ChatListResponse = ChatListItem[]

export const getChatList = createServerFn({
  method: 'GET',
  response: 'data',
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id

    const chatListResult: ChatListResponse = await db
      .select({ chatId: chatTable.id, name: chatTable.name })
      .from(chatTable)
      .where(eq(chatTable.userId, userId))
      .orderBy(desc(chatTable.updatedAt))

    return chatListResult
  })
