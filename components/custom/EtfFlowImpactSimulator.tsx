'use client'

// Simplified, illustrative-only ETF flow model. Real Bitcoin price moves are
// driven by many overlapping factors (macro rates, leverage/derivatives,
// sentiment, dollar strength) and spot-ETF flows are, at best, one
// correlated input among those — not a standalone price-setting mechanism.
// The "price impact" figure here exists to make the scale of a flow number
// tangible, not to predict or explain real BTC price action.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import LineChart from '@/components/charts/LineChartLazy'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function moneyM(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}B`
  return `${sign}$${Math.round(abs)}M`
}

// Illustrative-only: a rough, made-up "feel" for how a $1B cumulative net
// flow might loosely associate with a price move, purely so the numbers on
// screen have some scale. This is NOT a statistically fitted elasticity.
const ILLUSTRATIVE_SENSITIVITY_PCT_PER_BILLION = 1.2

export default function EtfFlowImpactSimulator() {
  const [dailyFlow, setDailyFlow] = useState(-150) // $M/day, negative = net outflow
  const [days, setDays] = useState(10)
  const [startPrice, setStartPrice] = useState(64700)

  const { cumulativeFlowM, impactPct, estPrice, series } = useMemo(() => {
    const cum = dailyFlow * days
    const impact = (cum / 1000) * ILLUSTRATIVE_SENSITIVITY_PCT_PER_BILLION
    const price = startPrice * (1 + impact / 100)
    const s = Array.from({ length: days + 1 }, (_, d) => ({
      day: `Day ${d}`,
      'Cumulative flow': Math.round(dailyFlow * d),
    }))
    return { cumulativeFlowM: cum, impactPct: impact, estPrice: price, series: s }
  }, [dailyFlow, days, startPrice])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · simplified illustration, not a forecast
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What would a run of ETF flow days &quot;mean&quot; in scale?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Daily net flow (negative = outflow)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {moneyM(dailyFlow)}/day
            </b>
          </div>
          <input
            type="range" min={-1000} max={1000} step={25} value={dailyFlow}
            onChange={e => setDailyFlow(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Consecutive trading days</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{days}</b>
          </div>
          <input
            type="range" min={1} max={30} step={1} value={days}
            onChange={e => setDays(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Starting BTC price</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(startPrice)}</b>
          </div>
          <input
            type="range" min={40000} max={100000} step={500} value={startPrice}
            onChange={e => setStartPrice(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Cumulative net flow</p>
            <AnimatedNumber
              value={cumulativeFlowM}
              format={v => moneyM(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
              Illustrative price after {days}d
            </p>
            <AnimatedNumber
              value={estPrice}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {impactPct >= 0 ? '+' : ''}{impactPct.toFixed(1)}% vs. starting price (illustrative only)
            </p>
          </div>
        </div>

        <LineChart
          title="Sample cumulative flow trend"
          description={`Illustrative accumulation of a ${moneyM(dailyFlow)}/day flow over ${days} days — a made-up sample series to visualize scale, not live or historical data.`}
          data={series}
          xKey="day"
          series={[{ key: 'Cumulative flow', label: 'Cumulative flow ($M)', color: dailyFlow < 0 ? '#ef4444' : '#059669' }]}
          unit="M"
        />

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">ETF flow impact estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Daily net flow</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{moneyM(dailyFlow)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Consecutive days</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{days}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Cumulative net flow</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{moneyM(cumulativeFlowM)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Starting BTC price</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(startPrice)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Illustrative price after {days}d</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(estPrice)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          This is a simplified illustration, not a forecasting or causal model. ETF flows and BTC price have moved together at times, but flows do not mechanically set the price the way this slider implies — they are one input among leverage, macro rates, and sentiment that all move together. Treat the &quot;illustrative price&quot; purely as a way to feel the scale of the dollar figures, never as a prediction.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Estimate only — not financial or tax advice. Not investment advice. Crypto is highly volatile.
        </p>
      </div>
    </div>
  )
}
