'use client'

import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

type Review = { id: string; name: string; text: string; rating: number }

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/reviews').then((res) => res.json()).then((data) => setReviews(Array.isArray(data) ? data : [])).catch(() => setReviews([])).finally(() => setLoading(false)) }, [])

  return (
    <section id="reyler" className="scroll-mt-20 border-y border-border/60 bg-card/40 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading eyebrow="RƏYLƏR" title="Müştərilərimiz nə deyir" description="Real müştəri rəyləri və xidmət təcrübələri." />
        {loading ? <p className="mt-16 text-center text-muted-foreground">Yüklənir...</p> : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {reviews.map((r) => <figure key={r.id} className="relative rounded-lg border border-border/60 bg-card p-8"><Quote className="absolute right-6 top-6 size-8 text-primary/20" aria-hidden="true" /><div className="flex items-center gap-0.5 text-primary">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-4 fill-current" aria-hidden="true" />)}</div><blockquote className="mt-4 text-pretty leading-relaxed text-foreground/90">“{r.text}”</blockquote><figcaption className="mt-6 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-serif text-sm font-semibold text-primary">{r.name.charAt(0)}</span><span className="text-sm font-medium">{r.name}</span></figcaption></figure>)}
          </div>
        )}
      </div>
    </section>
  )
}
