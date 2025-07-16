import Anthropic from '@anthropic-ai/sdk'
import { AIChunk, AIProviderAdapter } from './provider'
import { ModelName } from '~/constants/ai-models'
import { Message } from './internal'

type AnthropicContent = {
  type: 'text'
  text: string
}

export type AnthropicMessage = {
  role: 'user' | 'assistant'
  content: AnthropicContent[]
}

const messagesToAnthropicMessages = (
  messages: Message[]
): AnthropicMessage[] => {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content.map((part) => ({
      type: part.type,
      text: part.text,
    })),
  }))
}

export const handleAnthropicChunk = (
  chunk: Anthropic.Messages.RawMessageStreamEvent
) => {
  if (
    chunk.type === 'content_block_start' &&
    chunk.content_block.type === 'text'
  ) {
    return chunk.content_block.text
  } else if (
    chunk.type === 'content_block_delta' &&
    chunk.delta.type === 'text_delta'
  ) {
    return chunk.delta.text
  }
  return ''
}

export class AnthropicAdapter implements AIProviderAdapter {
  private ai: Anthropic
  private model: ModelName

  constructor(ai: Anthropic, model: ModelName) {
    this.ai = ai
    this.model = model
  }
  async streamChunks(
    messages: Message[],
    signal: AbortSignal,
    onChunk: (chunk: AIChunk) => void
  ) {
    const response = this.ai.messages.stream(
      {
        model: this.model,
        max_tokens: 8192,
        temperature: 0.3,
        messages: messagesToAnthropicMessages(messages),
      },
      { signal }
    )
    for await (const chunk of response) {
      const text = handleAnthropicChunk(chunk)
      if (text) onChunk({ type: 'text', data: text })
    }
  }
}
