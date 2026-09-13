'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, Check, Crown } from 'lucide-react'
import { GlowButton } from '@/components/glow-button'

type Service = { id: string; name: string; price: string | number; duration: number }
type Barber = { id: string; name: string; specialty: string }
type Result = { done: boolean; name: string }

export function ReservationSection() {
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result>({ done: false, name: '' })

  useEffect(() => {
    Promise.all([fetch('/api/services'), fetch('/api/barbers')])
      .then(async ([servicesRes, barbersRes]) => {
        const [servicesData, barbersData] = await Promise.all([servicesRes.json(), barbersRes.json()])
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setBarbers(Array.isArray(barbersData) ? barbersData : [])
      })
      .catch(() => { setServices([]); setBarbers([]) })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const date = String(formData.get('date') || '')
    const time = String(formData.get('time') || '')
    const serviceId = String(formData.get('serviceId') || '')
    const barberId = String(formData.get('barberId') || '')

    if (!date || !time || !serviceId || !barberId) {
      alert('Zəhmət olmasa bütün sahələri doldurun!')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, customerPhone: phone, barberId, serviceId, dateTime: `${date}T${time}:00` }),
      })
      const bookingRes = await res.json()
      if (bookingRes.success) setResult({ done: true, name })
      else alert(bookingRes.error || 'Rezervasiya yaradıla bilmədi.')
    } catch {
      alert('Serverlə əlaqə qurmaq mümkün olmadı.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() { setResult({ done: false, name: '' }) }

  return (
    <section id="rezervasiya" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="inline-flex w-fit items-center gap-2 text-xs font-medium tracking-[0.3em] text-primary"><CalendarCheck className="size-4" aria-hidden="true" />REZERVASİYA</span>
              <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl">Yerinizi indi ayırın</h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">Formu doldurun, komandamız təsdiq üçün sizinlə əlaqə saxlasın. Növbədə gözləmədən premium xidmət.</p>
              <ul className="mt-8 space-y-3">
                {['Onlayn və sürətli qeydiyyat', 'Uyğun vaxt seçimi', 'Təsdiq zəngi'].map((t) => <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground"><Check className="size-4 text-primary" aria-hidden="true" />{t}</li>)}
                <li className="flex items-center gap-3 text-sm text-primary"><Crown className="size-4" aria-hidden="true" />Premium xidmət təcrübəsi</li>
              </ul>
            </div>
            <div className="border-t border-border/60 bg-card/60 p-8 md:border-l md:border-t-0 md:p-12">
              {result.done ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex size-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary"><Check className="size-7" aria-hidden="true" /></span>
                  <h3 className="mt-6 font-serif text-2xl font-semibold">Təşəkkür edirik, {result.name}!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Rezervasiyanız qəbul edildi. Komandamız təsdiq üçün sizinlə əlaqə saxlayacaq.</p>
                  <GlowButton onClick={reset} className="mt-8 border border-primary/50 bg-background/40 px-6 py-3 text-sm font-medium tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary">YENİ REZERVASİYA</GlowButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div><label htmlFor="name" className="mb-2 block text-sm text-muted-foreground">Ad, Soyad</label><input id="name" name="name" required placeholder="Adınızı daxil edin" className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /></div>
                  <div><label htmlFor="phone" className="mb-2 block text-sm text-muted-foreground">Telefon</label><input id="phone" name="phone" type="tel" required placeholder="+994 __ ___ __ __" className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label htmlFor="date" className="mb-2 block text-sm text-muted-foreground">Tarix</label><input id="date" name="date" type="date" required className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" /></div><div><label htmlFor="time" className="mb-2 block text-sm text-muted-foreground">Vaxt</label><input id="time" name="time" type="time" required className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary" /></div></div>
                  <div><label htmlFor="serviceId" className="mb-2 block text-sm text-muted-foreground">Xidmət</label><select id="serviceId" name="serviceId" required disabled={loading || services.length === 0} className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary">{services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.price} AZN</option>)}</select></div>
                  <div><label htmlFor="barberId" className="mb-2 block text-sm text-muted-foreground">Usta</label><select id="barberId" name="barberId" required disabled={loading || barbers.length === 0} className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary">{barbers.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.specialty}</option>)}</select></div>
                  <GlowButton type="submit" full disabled={submitting || loading || services.length === 0 || barbers.length === 0} className="bg-primary px-6 py-3.5 text-sm font-medium tracking-widest text-primary-foreground transition-opacity hover:opacity-90">{submitting ? 'GÖNDƏRİLİR...' : 'TƏSDİQ ET'}</GlowButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
