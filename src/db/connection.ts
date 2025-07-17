import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'

if (
  !process.env.DATABASE_URL ||
  !process.env.DATABASE_URL.startsWith('postgres://')
) {
  throw new Error('Env required: DATABASE_URL')
}

export const db = drizzle(process.env.DATABASE_URL)
