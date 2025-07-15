import { GenerateContentResponse, GoogleGenAI } from '@google/genai'
import { AIChunk, AIProviderAdapter } from './provider'
import { ModelName } from '~/constants/ai-models'
import { Message } from './internal'

type GeminiContent = {
  text: string
}

export type GeminiMessage = {
  role: 'user' | 'model'
  parts: GeminiContent[]
}

const messagesToGeminiContents = (messages: Message[]): GeminiMessage[] => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: msg.content.map((part) => ({ text: part.text })),
  }))
}

export const handleGeminiChunk = (chunk: GenerateContentResponse) => {
  return chunk.text || ''
}

export class GeminiAdapter implements AIProviderAdapter {
  private ai: GoogleGenAI
  private model: ModelName

  constructor(ai: GoogleGenAI, model: ModelName) {
    this.ai = ai
    this.model = model
  }
  async streamChunks(
    messages: Message[],
    signal: AbortSignal,
    onChunk: (chunk: AIChunk) => void
  ) {
    const response = await this.ai.models.generateContentStream({
      model: this.model,
      contents: messagesToGeminiContents(messages),
      config: {
        maxOutputTokens: 1024,
        abortSignal: signal,
        temperature: 0.3,
      },
    })
    for await (const chunk of response) {
      if (signal.aborted) return
      const text = handleGeminiChunk(chunk)
      if (text) onChunk({ type: 'text', data: text })
    }
  }
}
