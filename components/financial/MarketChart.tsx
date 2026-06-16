'use client'

import dynamic from 'next/dynamic'

const MarketChartClient = dynamic(
  () => import('@/components/financial/MarketChartClient'),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="skeleton h-2.5 w-24 rounded mb-2" />
          <div className="skeleton h-5 w-32 rounded" />
        </div>
        <div className="flex gap-1 px-3 pt-2.5 pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-12 rounded-full" />
          ))}
        </div>
        <div className="h-40 m-3 skeleton rounded-xl" />
      </div>
    ),
  }
)

interface Props {
  compact?: boolean
}

export default function MarketChart({ compact }: Props) {
  return <MarketChartClient compact={compact} />
}
