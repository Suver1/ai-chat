import z from 'zod/v4'

export const modelNames = [
  'gemini-2.5-flash',
  'claude-3-5-haiku-20241022',
] as const

export const modelNameSchema = z.enum(modelNames)

export const models = [
  { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
  { name: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku' },
] as const

export type ModelName = (typeof models)[number]['name']
