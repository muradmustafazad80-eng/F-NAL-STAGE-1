import { relations } from 'drizzle-orm'
import { boolean, integer, numeric, pgTable, text, timestamp, index, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
})

export const customers = pgTable('Customer', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
}, (t) => [index('Customer_userId_idx').on(t.userId)])

export const barbers = pgTable('Barber', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').unique(),
  name: text('name').notNull(),
  image: text('image').notNull(),
  specialty: text('specialty').notNull(),
  experience: text('experience').notNull().default(''),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
}, (t) => [index('Barber_status_idx').on(t.status)])

export const services = pgTable('Service', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(''),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
})

export const bookings = pgTable('Booking', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customerId').notNull(),
  barberId: uuid('barberId').notNull(),
  serviceId: uuid('serviceId').notNull(),
  dateTime: timestamp('dateTime', { withTimezone: false }).notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
}, (t) => [
  index('Booking_customerId_idx').on(t.customerId),
  index('Booking_barberDateTime_idx').on(t.barberId, t.dateTime),
  index('Booking_serviceId_idx').on(t.serviceId),
  index('Booking_status_idx').on(t.status),
])

export const reviews = pgTable('Review', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customerId').notNull(),
  barberId: uuid('barberId').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
}, (t) => [index('Review_barberId_idx').on(t.barberId), index('Review_createdAt_idx').on(t.createdAt)])

export const payments = pgTable('Payment', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('bookingId').notNull().unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('unpaid'),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
})

export const loyalty = pgTable('Loyalty', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customerId').notNull().unique(),
  points: integer('points').notNull().default(0),
  updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
})

export const campaigns = pgTable('Campaign', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  discountPct: integer('discountPct').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  endDate: timestamp('endDate', { withTimezone: false }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
})

export const businessSettings = pgTable('BusinessSetting', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: false }).notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ one }) => ({
  customer: one(customers, { fields: [users.id], references: [customers.userId] }),
  barber: one(barbers, { fields: [users.id], references: [barbers.userId] }),
}))

export const customersRelations = relations(customers, ({ many, one }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  bookings: many(bookings),
  reviews: many(reviews),
  loyalty: one(loyalty),
}))

export const barbersRelations = relations(barbers, ({ many, one }) => ({
  user: one(users, { fields: [barbers.userId], references: [users.id] }),
  bookings: many(bookings),
  reviews: many(reviews),
}))

export const servicesRelations = relations(services, ({ many }) => ({ bookings: many(bookings) }))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(customers, { fields: [bookings.customerId], references: [customers.id] }),
  barber: one(barbers, { fields: [bookings.barberId], references: [barbers.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  payment: one(payments),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  customer: one(customers, { fields: [reviews.customerId], references: [customers.id] }),
  barber: one(barbers, { fields: [reviews.barberId], references: [barbers.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}))

export const loyaltyRelations = relations(loyalty, ({ one }) => ({
  customer: one(customers, { fields: [loyalty.customerId], references: [customers.id] }),
}))
