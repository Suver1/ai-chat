import z from 'zod/v4'

export const messageSchema = z.string().trim().min(1, 'Message is required')

export const userIdSchema = z.object({
  userId: z.uuidv4(),
})
