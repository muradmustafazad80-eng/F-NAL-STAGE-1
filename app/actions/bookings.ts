'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { barbers, bookings, customers, services } from '@/lib/schema'

const bookingSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  dateTime: z.string().datetime({ local: true }),
})

export type CreateBookingInput = z.infer<typeof bookingSchema>

type BookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string; code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR' }

export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Rezervasiya məlumatları düzgün deyil.', code: 'VALIDATION_ERROR' }

  const dateTime = new Date(parsed.data.dateTime)
  if (Number.isNaN(dateTime.getTime()) || dateTime <= new Date()) {
    return { success: false, error: 'Rezervasiya vaxtı keçmiş tarix ola bilməz.', code: 'VALIDATION_ERROR' }
  }

  try {
    const [service, barber] = await Promise.all([
      db.select({ id: services.id }).from(services).where(eq(services.id, parsed.data.serviceId)).limit(1),
      db.select({ id: barbers.id }).from(barbers).where(eq(barbers.id, parsed.data.barberId)).limit(1),
    ])

    if (!service[0]) return { success: false, error: 'Seçilmiş xidmət tapılmadı.', code: 'NOT_FOUND' }
    if (!barber[0]) return { success: false, error: 'Seçilmiş usta tapılmadı.', code: 'NOT_FOUND' }

    const normalizedPhone = parsed.data.customerPhone.replace(/\D/g, '')
    const existingCustomer = await db.select({ id: customers.id }).from(customers).where(eq(customers.phone, normalizedPhone)).limit(1)
    let customerId = existingCustomer[0]?.id

    if (customerId) {
      await db.update(customers).set({ name: parsed.data.customerName }).where(eq(customers.id, customerId))
    } else {
      const created = await db.insert(customers).values({ name: parsed.data.customerName, phone: normalizedPhone }).returning({ id: customers.id })
      customerId = created[0].id
    }

    const created = await db.insert(bookings).values({
      customerId,
      barberId: parsed.data.barberId,
      serviceId: parsed.data.serviceId,
      dateTime,
      status: 'pending',
    }).returning({ id: bookings.id })

    return { success: true, bookingId: created[0].id }
  } catch (error) {
    console.error('createBooking', error)
    return { success: false, error: 'Rezervasiya qeyd edilərkən server xətası baş verdi.', code: 'SERVER_ERROR' }
  }
}
