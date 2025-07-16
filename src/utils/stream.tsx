export const isErrorChunk = (chunk: string) => {
  return chunk.startsWith('event: error')
}

export const parseErrorChunk = (chunk: string) => {
  return chunk.replace(/^event: error\ndata: /, '').replace(/\n\n$/, '')
}
