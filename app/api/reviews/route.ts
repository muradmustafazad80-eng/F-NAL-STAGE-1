import { NextResponse } from 'next/server'
import { getReviews } from '@/lib/data/public'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    return NextResponse.json(await getReviews())
  } catch (error) {
    console.error('GET /api/reviews', error)
    return NextResponse.json({ success: false, error: 'Rəylər yüklənmədi.' }, { status: 500 })
  }
}
