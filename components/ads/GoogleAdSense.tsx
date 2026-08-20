'use client'
import { useEffect, useId } from 'react'
import { ADS_ENABLED } from '@/lib/ads-config'

interface Props {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid'
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window { adsbygoogle: unknown[] }
}

// Reserve roughly the height AdSense will fill in, so the slot doesn't
// collapse-then-expand and shift content around it (a top CLS contributor).
const DEFAULT_MIN_HEIGHT: Record<NonNullable<Props['format']>, number> = {
  auto: 250,
  rectangle: 250,
  horizontal: 100,
  vertical: 600,
  fluid: 250,
}

export default function GoogleAdSense({ slot, format = 'auto', className = '', style }: Props) {
  const uid = useId()

  useEffect(() => {
    if (!ADS_ENABLED) return
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {}
  }, [uid])

  const reservedStyle = { minHeight: DEFAULT_MIN_HEIGHT[format], ...style }

  if (!ADS_ENABLED) return null

  return (
    <div className={`overflow-hidden ${className}`} style={reservedStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8604899547572044"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
