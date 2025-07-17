import { create } from 'zustand'
import { ChatListItem, ChatListResponse } from '~/serverFn/chatList'

interface ChatListState {
  chatList: ChatListResponse
  isLoading: boolean
  error: unknown
  setChatList: (chatList: ChatListResponse) => void
  addToChatList: (chat: ChatListItem) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: unknown) => void
}

export const useChatListStore = create<ChatListState>((set) => ({
  chatList: [],
  isLoading: false,
  error: undefined,
  setChatList: (chatList: ChatListResponse) => set({ chatList }),
  addToChatList: (chat: ChatListItem) =>
    set((state) => ({ chatList: [chat, ...state.chatList] })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
