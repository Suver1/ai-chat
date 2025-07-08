import { create } from 'zustand'

const models = [
  { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
] as const

type Role = 'user' | 'model'

interface History {
  role: Role
  text: string
}

interface ChatState {
  model: (typeof models)[number]['name']
  history: History[]
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  addMessage: (message: string) => void
  appendMessage: (textChunk: string) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  model: 'gemini-2.5-flash',
  history: [],
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  addMessage: (message) =>
    set((state) => ({
      history: [...state.history, { role: 'user', text: message }],
    })),

  appendMessage: (textChunk) =>
    set((state) => {
      console.log('Appending message chunk:', textChunk)
      const lastMessage = state.history[state.history.length - 1]
      if (!lastMessage || lastMessage.role !== 'model') {
        // Add a new model message
        return {
          history: [...state.history, { role: 'model', text: textChunk }],
        }
      } else {
        // Update the last model message immutably
        return {
          history: [
            ...state.history.slice(0, -1),
            { ...lastMessage, text: lastMessage.text + textChunk },
          ],
        }
      }
    }),
  clearMessages: () => set({ history: [] }),
}))
