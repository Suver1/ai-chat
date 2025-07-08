export const isDataChunk = (chunk: string) => {
  return chunk.startsWith('data: ')
}

export const isErrorChunk = (chunk: string) => {
  return chunk.startsWith('event: error')
}

export const parseDataChunk = (chunk: string) => {
  return chunk.replace(/^data: /, '').replace(/\n\n$/, '')
}

export const parseErrorChunk = (chunk: string) => {
  return chunk.replace(/^event: error\ndata: /, '').replace(/\n\n$/, '')
}
