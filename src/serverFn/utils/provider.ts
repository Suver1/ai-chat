import { ModelName } from '~/constants/ai-models'
import { Message } from './internal'
import { AnthropicAdapter } from './anthropic'
import Anthropic from '@anthropic-ai/sdk'
import { GeminiAdapter } from './gemini'
import { GoogleGenAI } from '@google/genai'

export function getAdapterForModel(model: ModelName) {
  if (model.startsWith('claude-'))
    return new AnthropicAdapter(
      new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] }),
      model
    )
  if (model.startsWith('gemini-'))
    return new GeminiAdapter(
      new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] }),
      model
    )
  throw new Error('Unsupported model: ' + model)
}

export type AIChunk = {
  type: 'text' // | 'image' | 'json'
  data: string // | Buffer | object
}

export interface AIProviderAdapter {
  streamChunks(
    messages: Message[],
    signal: AbortSignal,
    onChunk: (chunk: AIChunk) => void
  ): Promise<void>
}
