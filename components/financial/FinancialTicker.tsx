'use client'

import { useEffect, useRef, useState } from 'react'
import type { MarketAsset } from '@/app/api/market-data/route'

interface MarketResponse {
  assets: MarketAsset[]
  ts: number
}

function formatPrice(price: number, type: MarketAsset['type']): string {
  if (price >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: type === 'crypto' && price < 1 ? 4 : 2,
  }).format(price)
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return null
  const sample = data.length > 24 ? data.slice(-24) : data
  const min = Math.min(...sample)
  const max = Math.max(...sample)
  const range = max - min || 1
  const W = 52
  const H = 20
  const pts = sample
    .map((v, i) => {
      const x = (i / (sample.length - 1)) * W
      const y = H - ((v - min) / range) * (H - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="shrink-0 opacity-80"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TickerItem({ asset }: { asset: MarketAsset }) {
  const positive = asset.change24h >= 0
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 shrink-0 border-r border-white/10 group cursor-default">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white/70 transition-colors">
        {asset.symbol}
      </span>
      <span className="text-sm font-semibold text-white tabular-nums">
        {formatPrice(asset.price, asset.type)}
      </span>
      <MiniSparkline data={asset.sparkline} positive={positive} />
      <span
        className={`text-[11px] font-bold tabular-nums ${
          positive ? 'text-emerald-300' : 'text-red-300'
        }`}
      >
        {positive ? '▲' : '▼'}&nbsp;{Math.abs(asset.change24h).toFixed(2)}%
      </span>
    </div>
  )
}

function TickerSkeleton() {
  return (
    <div className="flex items-center gap-6 px-5 py-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 shrink-0">
          <div className="skeleton h-2.5 w-8 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
          <div className="skeleton h-2.5 w-14 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function FinancialTicker() {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/market-data')
        if (res.ok) {
          const json: MarketResponse = await res.json()
          setAssets(json.assets)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.style.animationPlayState = paused ? 'paused' : 'running'
  }, [paused])

  const doubled = [...assets, ...assets]

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-950 border-b border-gray-800/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Live market prices"
      role="region"
    >
      <div className="flex items-stretch">
        {/* LIVE badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 z-10 border-r border-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap select-none">
            Live
          </span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <TickerSkeleton />
          ) : assets.length === 0 ? null : (
            <div
              ref={trackRef}
              className="flex ticker-track"
              style={{ width: 'max-content' }}
              aria-hidden="true"
            >
              {doubled.map((asset, i) => (
                <TickerItem key={`${asset.id}-${i}`} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
