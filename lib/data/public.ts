import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { barbers, businessSettings, customers, reviews, services } from '@/lib/schema'

export async function getServices() {
  return db.select().from(services).orderBy(services.name)
}

export async function getActiveBarbers() {
  return db.select().from(barbers).where(eq(barbers.status, 'active')).orderBy(barbers.createdAt)
}

export async function getReviews() {
  return db.select({
    id: reviews.id,
    name: customers.name,
    text: reviews.comment,
    rating: reviews.rating,
    createdAt: reviews.createdAt,
  }).from(reviews).innerJoin(customers, eq(reviews.customerId, customers.id)).orderBy(desc(reviews.createdAt))
}

export async function getBusinessSettings() {
  const rows = await db.select().from(businessSettings)
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}
