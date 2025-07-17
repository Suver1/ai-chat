import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

if (
  !process.env.DATABASE_URL ||
  !process.env.DATABASE_URL.startsWith('postgres://')
) {
  throw new Error('Env required: DATABASE_URL')
}

console.log(
  'Drizzle config loaded with DATABASE_URL:',
  process.env.DATABASE_URL
)

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
