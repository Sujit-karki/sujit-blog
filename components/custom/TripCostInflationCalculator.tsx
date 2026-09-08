'use client'

// The 26.5% YoY figure is BLS CPI's airline fares index for the year ended
// June 2026 (released July 14, 2026) — a single national number, not broken
// out by route length or domestic/international. Route-type baselines and
// the month-of-travel seasonal multipliers below are illustrative starting
// points based on typical travel-industry seasonality (summer + December
// holiday peaks, Jan/Feb troughs), not a BLS-published series — the point is
// to make the national YoY figure tangible for a specific trip, not to
// forecast an exact fare. See the post's Sources section for the CPI data.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import LineChart from '@/components/charts/LineChartLazy'

type RouteType = 'Domestic short-haul' | 'Domestic long-haul' | 'International'

const ROUTES: RouteType[] = ['Domestic short-haul', 'Domestic long-haul', 'International']

const ROUTE_BASELINE: Record<RouteType, number> = {
  'Domestic short-haul': 180,
  'Domestic long-haul': 340,
  International: 850,
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SEASON_MULT = [0.95, 0.9, 1.0, 1.0, 1.05, 1.15, 1.25, 1.2, 0.95, 0.95, 1.05, 1.3]

// BLS CPI airline fares index, % change year-over-year (real, published figures).
const CPI_TREND = [
  { month: 'Feb', yoy: 7.1 },
  { month: 'Mar', yoy: 14.9 },
  { month: 'Apr', yoy: 20.7 },
  { month: 'May', yoy: 26.7 },
  { month: 'Jun', yoy: 26.5 },
]
const LATEST_YOY = 26.5 // June 2026, released July 14, 2026

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function TripCostInflationCalculator() {
  const [route, setRoute] = useState<RouteType>('Domestic short-haul')
  const [monthIdx, setMonthIdx] = useState(6) // July
  const [lastYearFare, setLastYearFare] = useState(ROUTE_BASELINE['Domestic short-haul'])

  const { seasonalFare, thisYearEstimate, increase } = useMemo(() => {
    const seasonal = lastYearFare * SEASON_MULT[monthIdx]
    const projected = seasonal * (1 + LATEST_YOY / 100)
    return { seasonalFare: seasonal, thisYearEstimate: projected, increase: projected - seasonal }
  }, [lastYearFare, monthIdx])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · your trip vs. a year ago
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What the CPI airfare jump means for a real trip
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Route type</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {ROUTES.map((r) => (
              <button
                key={r}
                onClick={() => { setRoute(r); setLastYearFare(ROUTE_BASELINE[r]) }}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  route === r
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Month of travel</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{MONTHS[monthIdx]}</b>
          </div>
          <input
            type="range" min={0} max={11} step={1} value={monthIdx}
            onChange={e => setMonthIdx(+e.target.value)}
            className="w-full accent-sky-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Seasonal pattern is illustrative (summer and December holidays run higher) — not a BLS-published monthly series.</p>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>What you&apos;d expect to pay a year ago</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(lastYearFare)}</b>
          </div>
          <input
            type="range" min={80} max={2500} step={10} value={lastYearFare}
            onChange={e => setLastYearFare(+e.target.value)}
            className="w-full accent-sky-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          A {money(seasonalFare)} {route.toLowerCase()} fare last {MONTHS[monthIdx]} would run about{' '}
          <strong className="text-sky-600 dark:text-sky-400">
            <AnimatedNumber value={thisYearEstimate} format={v => money(v)} startFromZero />
          </strong>{' '}
          this year at the national {LATEST_YOY}% airfare CPI increase — roughly <strong>{money(increase)}</strong> more, before you even shop around.
        </p>

        <LineChart
          title="CPI airline fares index, year-over-year change (2026)"
          description="U.S. Bureau of Labor Statistics, Consumer Price Index — airline fares component"
          data={CPI_TREND}
          xKey="month"
          series={[{ key: 'yoy', label: 'YoY change', color: '#0284c7' }]}
          unit="%"
        />

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Trip cost inflation estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Route type</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{route}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Month of travel</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{MONTHS[monthIdx]}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Last year&apos;s fare (seasonal estimate)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(seasonalFare)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">National airfare CPI, YoY (Jun 2026)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">+{LATEST_YOY}%</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">This year&apos;s estimated fare</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(thisYearEstimate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          Applies one national YoY figure to a route- and season-adjusted starting fare — actual pricing varies enormously by airline, route, booking window, and demand. This is not a fare prediction or booking tool.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Estimate only — not financial or travel-booking advice.</p>
      </div>
    </div>
  )
}
