'use client'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

type Size = 'leaderboard' | 'rectangle' | 'halfpage' | 'banner' | 'square'

interface Props {
  size?: Size
  href?: string
  label?: string
  headline?: string
  subtext?: string
  ctaText?: string
  accentColor?: string
  className?: string
}

const dimensions: Record<Size, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90,  label: '728×90' },
  rectangle:   { w: 300, h: 250, label: '300×250' },
  halfpage:    { w: 300, h: 600, label: '300×600' },
  banner:      { w: 468, h: 60,  label: '468×60'  },
  square:      { w: 250, h: 250, label: '250×250' },
}

export default function CaiGlobalAd({
  size = 'rectangle',
  href = 'https://caiunity.com',
  label = 'Advertisement',
  headline = 'Grow Your Business Digitally',
  subtext = 'Expert digital marketing, SEO & performance ads that convert.',
  ctaText = 'Learn More →',
  accentColor = '#059669',
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const dim = dimensions[size]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const isLeaderboard = size === 'leaderboard' || size === 'banner'

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
      style={{ maxWidth: dim.w, width: '100%' }}
    >
      <span className="absolute top-1.5 left-2 text-[9px] font-semibold uppercase tracking-widest text-white/50 z-10 select-none">
        {label}
      </span>

      <Link
        href={href}
        target="_blank"
        rel="noopener sponsored"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block"
        aria-label={headline}
      >
        <div
          className={`relative flex ${isLeaderboard ? 'flex-row items-center gap-6 px-8' : 'flex-col items-start justify-between p-6'} transition-transform duration-300 ease-out`}
          style={{
            minHeight: dim.h,
            background: `linear-gradient(135deg, ${accentColor}ee 0%, #0d9488cc 50%, #0369a1cc 100%)`,
            transform: hovered ? 'scale(1.015)' : 'scale(1)',
          }}
        >
          {/* Animated blobs */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
              style={{ background: '#fff', animation: 'caiPulse 4s ease-in-out infinite' }}
            />
            <div
              className="absolute bottom-0 -left-8 w-32 h-32 rounded-full opacity-10 blur-2xl"
              style={{ background: '#fff', animation: 'caiPulse 6s ease-in-out infinite reverse' }}
            />
          </div>

          {/* Logo pill */}
          <div className={`flex items-center gap-2 ${isLeaderboard ? '' : 'mb-auto'}`}>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white text-xs font-bold tracking-wide">CAI Global</span>
            </div>
          </div>

          {/* Copy */}
          <div className={`z-10 ${isLeaderboard ? 'flex-1' : 'mt-4'}`}>
            <h4 className={`font-extrabold text-white leading-tight ${isLeaderboard ? 'text-lg' : 'text-xl mb-1'}`}>
              {headline}
            </h4>
            {!isLeaderboard && (
              <p className="text-white/80 text-sm leading-relaxed mt-1">{subtext}</p>
            )}
          </div>

          {/* CTA */}
          <div
            className={`z-10 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 transition-all duration-200 ${
              isLeaderboard ? '' : 'mt-5 self-start'
            }`}
            style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}
          >
            <span className="text-white text-sm font-bold whitespace-nowrap">{ctaText}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
