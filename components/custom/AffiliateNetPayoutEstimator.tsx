'use client'

// Default 13% commission and 6% platform referral fee reflect 2026 US TikTok
// Shop creator-economy reporting (Hamstergarage/Dashboardly); these are
// third-party estimates, not rates TikTok itself publishes as guarantees.
// Actual commission is set per-product by the seller and varies widely.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import PieChart from '@/components/charts/PieChartLazy'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function AffiliateNetPayoutEstimator() {
  const [price, setPrice] = useState(45)
  const [commissionPct, setCommissionPct] = useState(13)
  const [videosMonth, setVideosMonth] = useState(12)
  const [avgViews, setAvgViews] = useState(20000)
  const [convRate, setConvRate] = useState(0.5)
  const [returnRate, setReturnRate] = useState(20)
  // Fixed, not user-adjustable — TikTok Shop's platform referral fee isn't
  // seller/creator-negotiable the way commission is.
  const platformFee = 6

  const result = useMemo(() => {
    const orders = videosMonth * avgViews * (convRate / 100)
    const grossCommission = orders * price * (commissionPct / 100)
    const lostToReturns = grossCommission * (returnRate / 100)
    const afterReturns = grossCommission - lostToReturns
    const lostToPlatformFee = afterReturns * (platformFee / 100)
    const netMonthly = afterReturns - lostToPlatformFee
    const effectiveCostOfSale = grossCommission > 0 ? ((grossCommission - netMonthly) / grossCommission) * 100 : 0
    return { orders, grossCommission, lostToReturns, lostToPlatformFee, netMonthly, effectiveCostOfSale }
  }, [price, commissionPct, videosMonth, avgViews, convRate, returnRate, platformFee])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · TikTok Shop affiliate payout
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What you actually keep, not the headline commission
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Product price</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(price)}</b>
          </div>
          <input type="range" min={5} max={200} step={1} value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Commission rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{commissionPct}%</b>
          </div>
          <input type="range" min={0} max={50} step={1} value={commissionPct} onChange={(e) => setCommissionPct(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Videos posted / month</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{videosMonth}</b>
          </div>
          <input type="range" min={1} max={60} step={1} value={videosMonth} onChange={(e) => setVideosMonth(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Average views / video</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{avgViews.toLocaleString('en-US')}</b>
          </div>
          <input type="range" min={500} max={500000} step={500} value={avgViews} onChange={(e) => setAvgViews(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Conversion rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{convRate.toFixed(2)}%</b>
          </div>
          <input type="range" min={0.05} max={3} step={0.05} value={convRate} onChange={(e) => setConvRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Return rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{returnRate}%</b>
          </div>
          <input type="range" min={0} max={50} step={1} value={returnRate} onChange={(e) => setReturnRate(+e.target.value)} className="w-full accent-red-500" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Roughly {result.orders.toFixed(1)} orders/month would generate{' '}
          <strong>{money(result.grossCommission)}</strong> in gross commission, but after returns and the platform&apos;s {platformFee}% referral fee, you&apos;d keep{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.netMonthly} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          — an effective cost of sale near{' '}
          <strong>
            <AnimatedNumber value={result.effectiveCostOfSale} format={(v) => v.toFixed(1) + '%'} />
          </strong>
          .
        </p>

        <PieChart
          title="Where your gross commission actually goes"
          data={[
            { label: 'You keep', value: Math.round(result.netMonthly), color: '#059669' },
            { label: 'Lost to returns', value: Math.round(result.lostToReturns), color: '#ef4444' },
            { label: 'Platform referral fee', value: Math.round(result.lostToPlatformFee), color: '#6b7280' },
          ]}
          unit="$"
        />

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Assumes a fixed 6% platform referral fee and third-party-estimated commission/return rates — TikTok does not publish these as guarantees, and per-product commissions vary. Ignores income tax. Not financial advice.
        </p>
      </div>
    </div>
  )
}
