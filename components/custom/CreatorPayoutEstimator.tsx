'use client'

// RPM ranges are illustrative midpoints assembled from third-party creator
// trackers (Lenos, Learning Revolution, TikTok payout guides — see post
// sources), not official rates published by YouTube, TikTok, or Meta. None
// of the three platforms publishes an official per-view rate. Actual payouts
// vary by audience country, watch time, seasonality, and ad demand, and can
// move a lot month to month even for the same channel.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import LineChart from '@/components/charts/LineChartLazy'

type Platform = 'YouTube' | 'TikTok' | 'Instagram'

const PLATFORMS: Platform[] = ['YouTube', 'TikTok', 'Instagram']

// RPM ($ per 1,000 views), indexed by niche level 0 (lowest) to 4 (highest).
const RPM_TABLE: Record<Platform, number[]> = {
  YouTube: [1, 2.5, 4, 6.5, 10],
  TikTok: [0.4, 0.6, 0.8, 1.0, 1.2],
  Instagram: [0.02, 0.04, 0.06, 0.09, 0.12],
}

const NICHE_LABELS = [
  'Music / gaming / comedy',
  'Vlogs / lifestyle',
  'Education / how-to',
  'Tech / business',
  'Finance / investing',
]

const VIEW_BREAKPOINTS = [10_000, 50_000, 100_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000]

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function views(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return v.toString()
}

export default function CreatorPayoutEstimator() {
  const [platform, setPlatform] = useState<Platform>('YouTube')
  const [nicheLevel, setNicheLevel] = useState(2)
  const [monthlyViews, setMonthlyViews] = useState(250_000)

  const rpm = RPM_TABLE[platform][nicheLevel]

  const { payout, series } = useMemo(() => {
    const p = (monthlyViews / 1000) * rpm
    const s = VIEW_BREAKPOINTS.map((v) => ({
      views: views(v),
      Payout: Math.round((v / 1000) * rpm),
    }))
    return { payout: p, series: s }
  }, [monthlyViews, rpm])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · rough monthly payout estimate
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What would your views actually be worth?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Platform</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  platform === p
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {platform === 'Instagram' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Instagram has no standing per-view payout — its Reels bonus program has been invite-only and mostly paused for U.S. creators since early 2023. This is a rough, historical-rate estimate, not a live program.
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Monthly views</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{views(monthlyViews)}</b>
          </div>
          <input
            type="range" min={10_000} max={10_000_000} step={10_000} value={monthlyViews}
            onChange={e => setMonthlyViews(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Content niche</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{NICHE_LABELS[nicheLevel]}</b>
          </div>
          <input
            type="range" min={0} max={4} step={1} value={nicheLevel}
            onChange={e => setNicheLevel(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Advertiser demand (and RPM) is consistently higher in finance/business content and lower in music, gaming, and comedy.</p>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At an estimated <strong>{money(rpm)}</strong> RPM on {platform}, {views(monthlyViews)} views/month is roughly{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={payout} format={v => money(v)} startFromZero />/month
          </strong>
          {' '}before taxes and any platform holds.
        </p>

        <LineChart
          title={`Estimated monthly payout by view count — ${platform}, ${NICHE_LABELS[nicheLevel]}`}
          description={`At today's slider settings (${money(rpm)} per 1,000 views). Real RPM swings with audience country, season, and ad demand.`}
          data={series}
          xKey="views"
          series={[{ key: 'Payout', label: 'Estimated payout ($)', color: '#059669' }]}
          unit="$"
        />

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Creator payout estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Platform</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{platform}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Niche</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{NICHE_LABELS[nicheLevel]}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Estimated RPM (per 1,000 views)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(rpm)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Monthly views</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{views(monthlyViews)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Estimated monthly payout</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(payout)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          RPM ranges are illustrative midpoints from third-party creator trackers, not official platform data — YouTube, TikTok, and Meta do not publish per-view rates. Ignores brand deals, affiliate income, tips, and platform fees/holds, which for most working creators matter more than ad-share payouts.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Estimate only — not financial or tax advice.</p>
      </div>
    </div>
  )
}
