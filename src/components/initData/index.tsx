import { PropsWithChildren, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { getChatById } from '~/serverFn/chat'
import { getChatList } from '~/serverFn/chatList'
import { useChatStore } from '~/state/chat'
import { useChatListStore } from '~/state/chatList'
import z from 'zod/v4'
import { useSession } from '~/auth/authClient'

export default function InitData({ children }: PropsWithChildren) {
  const location = useLocation()
  const setChatListLoading = useChatListStore((state) => state.setIsLoading)
  const setChatListError = useChatListStore((state) => state.setError)
  const setChatList = useChatListStore((state) => state.setChatList)
  const initHistory = useChatStore((state) => state.initHistory)
  const setChatIsLoading = useChatStore((state) => state.setIsLoading)
  const setChatError = useChatStore((state) => state.setError)
  const session = useSession()

  const {
    data: chatList,
    error: chatListError,
    isLoading: isChatListLoading,
  } = useQuery({
    queryKey: ['chatList'],
    queryFn: () => getChatList(),
    retry: 0,
    enabled: !!session?.data?.user?.id,
  })

  const {
    data: chat,
    error: chatError,
    isLoading: isChatLoading,
  } = useQuery({
    queryKey: ['chat', location.pathname],
    queryFn: () => {
      const chatId = z.uuidv4().parse(location.pathname.split('/').pop())
      return getChatById({ data: { chatId } })
    },
    enabled: location.pathname.includes('/chat/') && !!session?.data?.user?.id,
    retry: 0,
  })

  useEffect(() => {
    if (chatList) {
      console.log('Chat list loaded:', chatList)
      setChatList(chatList)
    }
    setChatListLoading(isChatListLoading)
    setChatListError(chatListError)
    if (chatListError) {
      console.error(chatListError)
    }
  }, [chatList, isChatListLoading, chatListError])

  useEffect(() => {
    if (chat) {
      console.log('Chat loaded:', chat)
      initHistory(
        chat.messages.map((message) => ({
          role: message.role,
          text: message.content.map((part) => part.text).join(''),
        }))
      )
    }
    setChatIsLoading(isChatLoading)
    setChatError(chatError)
    if (chatError) {
      console.error(chatError)
    }
  }, [chat, isChatLoading, chatError])

  return children
}
