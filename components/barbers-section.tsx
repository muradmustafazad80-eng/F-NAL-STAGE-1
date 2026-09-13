'use client'

import { useEffect, useState } from 'react'
import { Scissors } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

type Barber = { id: string; name: string; specialty: string; image: string }

export function BarbersSection() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/barbers').then((res) => res.json()).then((data) => setBarbers(Array.isArray(data) ? data : [])).catch(() => setBarbers([])).finally(() => setLoading(false))
  }, [])

  return (
    <section id="ustalar" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading eyebrow="KOMANDA" title="Sənətinə aşiq ustalar" description="Hər biri öz sahəsində illərlə formalaşmış təcrübəyə malik peşəkarlar." />
        {loading ? <p className="mt-16 text-center text-muted-foreground">Yüklənir...</p> : (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((b) => (
              <article key={b.id} className="group overflow-hidden rounded-lg border border-border/60 bg-card">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={b.image || '/placeholder.svg'} alt={`${b.name} — ${b.specialty}`} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/70 px-3 py-1 text-[10px] tracking-widest text-primary"><Scissors className="size-3" aria-hidden="true" />PEŞƏKAR USTA</span>
                </div>
                <div className="flex items-center justify-between p-6">
                  <div><h3 className="font-serif text-lg font-semibold">{b.name}</h3><p className="mt-1 text-sm text-primary">{b.specialty}</p></div>
                  <a href="#" aria-label={`${b.name} Instagram profili`} className="inline-flex items-center justify-center rounded-sm border border-border px-3 py-2 text-xs tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary">IG</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
