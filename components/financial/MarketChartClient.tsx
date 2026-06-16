'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { ChartData, ChartOptions, ScriptableContext } from 'chart.js'
import type { MarketAsset } from '@/app/api/market-data/route'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Props {
  compact?: boolean
}

interface MarketResponse {
  assets: MarketAsset[]
  ts: number
}

function formatUSD(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: price >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: price >= 1000 ? 2 : price >= 1 ? 2 : 4,
  }).format(price)
}

const COLORS: Record<string, { grad0: string; grad1: string; line: string }> = {
  sp500:       { grad0: 'rgba(16,185,129,0.35)',  grad1: 'rgba(16,185,129,0.02)',  line: '#10b981' },
  bitcoin:     { grad0: 'rgba(245,158,11,0.35)',  grad1: 'rgba(245,158,11,0.02)',  line: '#f59e0b' },
  ethereum:    { grad0: 'rgba(99,102,241,0.35)',  grad1: 'rgba(99,102,241,0.02)',  line: '#6366f1' },
  solana:      { grad0: 'rgba(20,184,166,0.35)',  grad1: 'rgba(20,184,166,0.02)',  line: '#14b8a6' },
  binancecoin: { grad0: 'rgba(234,179,8,0.35)',   grad1: 'rgba(234,179,8,0.02)',   line: '#eab308' },
}
const FALLBACK_COLOR = COLORS.sp500

export default function MarketChartClient({ compact = false }: Props) {
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/market-data')
      .then(r => r.json())
      .then((j: MarketResponse) => {
        setAssets(j.assets)
        setActiveId(j.assets[0]?.id ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active = assets.find(a => a.id === activeId)
  const pal = COLORS[activeId] ?? FALLBACK_COLOR
  const positive = (active?.change24h ?? 0) >= 0

  const pts = active?.sparkline ?? []
  const labels = pts.map((_, i) => {
    const hoursAgo = pts.length - 1 - i
    return hoursAgo === 0 ? 'Now' : `${hoursAgo}h`
  })

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        data: pts,
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: pal.line,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        borderColor: pal.line,
        borderWidth: 2,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return pal.grad0
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, pal.grad0)
          gradient.addColorStop(1, pal.grad1)
          return gradient
        },
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        titleColor: '#6b7280',
        bodyColor: '#f9fafb',
        padding: 10,
        displayColors: false,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          title: items => `${items[0]?.label ?? ''}`,
          label: item => formatUSD(typeof item.raw === 'number' ? item.raw : 0),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 }, maxTicksLimit: compact ? 4 : 7 },
        border: { display: false },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(107,114,128,0.08)' },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          callback: v => formatUSD(Number(v)),
          maxTicksLimit: 5,
        },
        border: { display: false },
      },
    },
  }

  const chartH = compact ? 'h-36 sm:h-40' : 'h-52 sm:h-64'

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
            Market Overview
          </p>
          {active ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                {formatUSD(active.price)}
              </span>
              <span
                className={`text-xs font-bold ${
                  positive ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {positive ? '▲' : '▼'}&nbsp;{Math.abs(active.change24h).toFixed(2)}%
              </span>
              <span className="text-[10px] text-gray-400">24h</span>
            </div>
          ) : (
            <div className="skeleton h-5 w-28 rounded mt-1" />
          )}
        </div>
        {active && (
          <span className="text-lg font-black text-gray-200 dark:text-gray-700 select-none">
            {active.symbol}
          </span>
        )}
      </div>

      {/* Asset tabs */}
      <div className="flex gap-1 px-3 pt-2.5 pb-1 overflow-x-auto scrollbar-none">
        {assets.map(a => (
          <button
            key={a.id}
            onClick={() => setActiveId(a.id)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
              activeId === a.id
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {a.symbol}
          </button>
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-12 rounded-full shrink-0" />
          ))}
      </div>

      {/* Chart */}
      <div className={`relative ${chartH} px-3 pb-3`}>
        {loading ? (
          <div className="h-full skeleton rounded-xl" />
        ) : pts.length > 1 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="h-full flex items-center justify-center text-xs text-gray-400">
            No data available
          </p>
        )}
      </div>

      <p className="px-4 pb-2.5 text-[9px] text-gray-400 dark:text-gray-600 select-none">
        7-day sparkline · refreshes every 30s · not financial advice
      </p>
    </div>
  )
}
