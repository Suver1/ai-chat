import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import z from 'zod/v4'
import Chat from '~/components/chat/Chat'
import ChatMessages from '~/components/chat/ChatMessages'
import Menu from '~/components/menu/Menu'
import { getChatById } from '~/serverFn/chat'
import { getChatList } from '~/serverFn/chatList'
import { useChatStore } from '~/state/chat'
import { useChatListStore } from '~/state/chatList'

export const Route = createFileRoute('/$')({
  ssr: 'data-only',
  component: Home,
  loader: async ({ location }) => {
    const chatList = await getChatList({
      data: { userId: '2f643d7f-ffe9-4b0a-87ba-40198838805a' },
    })

    if (!location.pathname.includes('/chat/')) {
      return { chatList }
    }
    const chatId = z.uuidv4().parse(location.pathname.split('/').pop())
    const chat = await getChatById({ data: { chatId } })

    return { chatList, chat }
  },
})

function Home() {
  const state = Route.useLoaderData()
  const initHistory = useChatStore((state) => state.initHistory)
  const setChatList = useChatListStore((state) => state.setChatList)

  useEffect(() => {
    if (state?.chatList) {
      setChatList(state.chatList)
      console.log('Chat list loaded:', state.chatList)
    }
    if (state?.chat) {
      initHistory(
        state.chat.messages.map((message) => ({
          role: message.role,
          text: message.content.map((part) => part.text).join(''),
        }))
      )
      console.log('Chat loaded:', state.chat)
    } else {
      console.log('No chat data available')
    }
  }, [state?.chat, state?.chatList])

  return (
    <div className="flex">
      <aside className="w-60 h-svh">
        <div className="h-full bg-sidebar-background bg-sidebar-foreground">
          <Menu />
        </div>
      </aside>
      <main className="relative flex-1">
        <div className="absolute bottom-0 top-0 w-full bg-chat-background bg-chat-foreground">
          <div className="absolute overflow-y-scroll inset-0">
            <div className="mx-auto flex w-full flex-col h-svh max-w-3xl">
              <div className="" style={{ paddingBottom: 160 }}>
                <ChatMessages />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full z-2 pr-4">
          <div className="relative max-w-3xl mx-auto">
            <Chat />
          </div>
        </div>
      </main>
    </div>
  )
}
