import { GenerateContentResponse } from '@google/genai'

export const handleGeminiChunk = (chunk: GenerateContentResponse) => {
  return chunk.text || ''
}
