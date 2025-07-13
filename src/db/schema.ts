import { pgTable, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: varchar({ length: 36 }).primaryKey().notNull(), // uuid
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export const messagesTable = pgTable('messages', {
  id: varchar({ length: 36 }).primaryKey().notNull(), // uuid
  userId: varchar({ length: 36 }) // uuid
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
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
