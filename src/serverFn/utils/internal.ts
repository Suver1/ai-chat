import z from 'zod/v4'

type Content = {
  type: 'text'
  text: string
}

export type Message = {
  role: 'user' | 'model'
  content: Content[]
}

export const messagesSchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.array(
      z.object({
        type: z.literal('text'),
        text: z.string(),
      })
    ),
  })
)
