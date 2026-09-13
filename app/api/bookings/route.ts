import { NextResponse } from 'next/server'
import { createBooking } from '@/app/actions/bookings'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await createBooking(body)
    return NextResponse.json(result, { status: result.success ? 201 : result.code === 'VALIDATION_ERROR' ? 400 : result.code === 'NOT_FOUND' ? 404 : 500 })
  } catch (error) {
    console.error('POST /api/bookings', error)
    return NextResponse.json({ success: false, error: 'Sorğu düzgün deyil.', code: 'VALIDATION_ERROR' }, { status: 400 })
  }
}
