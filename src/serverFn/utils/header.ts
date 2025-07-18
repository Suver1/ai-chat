import { getHeaders } from '@tanstack/react-start/server'

export const objectToHeaders = (headers: ReturnType<typeof getHeaders>) => {
  return new Headers(
    Object.entries(headers).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  )
}
