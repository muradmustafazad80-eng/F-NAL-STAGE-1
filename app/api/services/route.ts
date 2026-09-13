import { NextResponse } from 'next/server'
import { getServices } from '@/lib/data/public'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    return NextResponse.json(await getServices())
  } catch (error) {
    console.error('GET /api/services', error)
    return NextResponse.json({ success: false, error: 'Xidmətlər yüklənmədi.' }, { status: 500 })
  }
}
