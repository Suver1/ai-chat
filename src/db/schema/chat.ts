import { pgTable, timestamp, varchar, jsonb, text } from 'drizzle-orm/pg-core'
import { user as userTable } from './auth'

export const chatTable = pgTable('chat', {
  id: varchar({ length: 36 }).primaryKey().notNull(), // uuid
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }),
  messages: jsonb(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})
