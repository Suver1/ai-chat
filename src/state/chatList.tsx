import { create } from 'zustand'
import { ChatListItem, ChatListResponse } from '~/serverFn/chatList'

interface ChatListState {
  chatList: ChatListResponse
  setChatList: (chatList: ChatListResponse) => void
  addToChatList: (chat: ChatListItem) => void
}

export const useChatListStore = create<ChatListState>((set) => ({
  chatList: [],
  setChatList: (chatList: ChatListResponse) => set({ chatList }),
  addToChatList: (chat: ChatListItem) =>
    set((state) => ({ chatList: [chat, ...state.chatList] })),
}))
