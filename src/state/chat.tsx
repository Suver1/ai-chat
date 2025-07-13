import { create } from 'zustand'
import { models } from '~/constants/ai-models'

type Role = 'user' | 'model'

interface History {
  role: Role
  text: string
}

interface ChatState {
  model: (typeof models)[number]['name']
  history: History[]
  isLoading: boolean
  name: string
  setName: (name: string) => void
  setIsLoading: (isLoading: boolean) => void
  initHistory: (messages: History[]) => void
  addMessage: (message: string) => void
  appendMessage: (textChunk: string) => void
  stripSummary: () => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  model: 'gemini-2.5-flash',
  history: [],
  isLoading: false,
  name: '',
  setName: (name) => set({ name }),
  setIsLoading: (isLoading) => set({ isLoading }),
  initHistory: (messages: History[]) => set({ history: messages }),
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
  stripSummary: () =>
    set((state) => {
      const newHistory = [...state.history]
      console.log('newHistory', newHistory)
      const lastHistory = newHistory.pop()
      console.log('lastHistory', lastHistory)
      if (!lastHistory?.text) {
        return state
      }
      if (lastHistory?.text.includes('```summary:')) {
        console.log("text.includes('```summary:')", true)
        const parts = lastHistory.text.split('```summary:')
        lastHistory.text = parts[0].trim()
      }

      newHistory.push(lastHistory)
      console.log('newHistory', newHistory)
      return { history: newHistory }
    }),
  clearMessages: () => set({ history: [] }),
}))
