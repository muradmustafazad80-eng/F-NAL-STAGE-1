import { NextResponse } from 'next/server'
import { getActiveBarbers } from '@/lib/data/public'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    return NextResponse.json(await getActiveBarbers())
  } catch (error) {
    console.error('GET /api/barbers', error)
    return NextResponse.json({ success: false, error: 'Ustalar yüklənmədi.' }, { status: 500 })
  }
}
