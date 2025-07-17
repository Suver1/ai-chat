import { create } from 'zustand'
import { models } from '~/constants/ai-models'
import { SUMMARY_START } from '~/constants/summary'

type Role = 'user' | 'model'

interface History {
  role: Role
  text: string
}

interface ChatState {
  model: (typeof models)[number]['name']
  history: History[]
  isLoading: boolean
  error: unknown
  name: string
  setName: (name: string) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: unknown) => void
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
  error: undefined,
  name: '',
  setName: (name) => set({ name }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
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
      const lastHistory = newHistory.pop()
      if (!lastHistory?.text) {
        return state
      }
      if (lastHistory?.text.includes(SUMMARY_START)) {
        const parts = lastHistory.text.split(SUMMARY_START)
        lastHistory.text = parts[0].trim()
      }

      newHistory.push(lastHistory)
      return { history: newHistory }
    }),
  clearMessages: () => set({ history: [] }),
}))
