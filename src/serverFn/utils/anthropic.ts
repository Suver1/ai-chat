import Anthropic from '@anthropic-ai/sdk'

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
