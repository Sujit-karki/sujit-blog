'use client'

// Defaults reflect FactSet Earnings Insight's Q3 2026 estimates as reported
// in mid-2026 — analyst estimates that move weekly as companies report.
// Check the current FactSet Earnings Insight report before citing a figure.
// Not investment advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

export default function EarningsGrowthVsPriceViz() {
  const [epsGrowthQ3, setEpsGrowthQ3] = useState(27.4)
  const [revGrowthQ3, setRevGrowthQ3] = useState(11.3)
  const [forwardPE, setForwardPE] = useState(20.0)
  const [avgPE, setAvgPE] = useState(19.0)

  const result = useMemo(() => {
    const valuationPremiumPct = avgPE > 0 ? ((forwardPE - avgPE) / avgPE) * 100 : 0
    return { valuationPremiumPct }
  }, [forwardPE, avgPE])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · earnings vs. valuation
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Is the market pricing in growth that hasn&apos;t shown up yet?
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Projected EPS growth (YoY)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{epsGrowthQ3.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={50} step={0.1} value={epsGrowthQ3} onChange={(e) => setEpsGrowthQ3(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Projected revenue growth (YoY)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{revGrowthQ3.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={30} step={0.1} value={revGrowthQ3} onChange={(e) => setRevGrowthQ3(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Forward 12-month P/E</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{forwardPE.toFixed(1)}</b>
          </div>
          <input type="range" min={10} max={35} step={0.1} value={forwardPE} onChange={(e) => setForwardPE(+e.target.value)} className="w-full accent-indigo-500" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>10-year average P/E</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{avgPE.toFixed(1)}</b>
          </div>
          <input type="range" min={10} max={35} step={0.1} value={avgPE} onChange={(e) => setAvgPE(+e.target.value)} className="w-full accent-gray-500" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          A forward P/E of {forwardPE.toFixed(1)} versus a 10-year average of {avgPE.toFixed(1)} means the market is paying a{' '}
          <strong className={result.valuationPremiumPct > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
            <AnimatedNumber value={Math.abs(result.valuationPremiumPct)} format={(v) => v.toFixed(1) + '%'} />
          </strong>{' '}
          {result.valuationPremiumPct > 0 ? 'premium' : 'discount'} to its historical multiple.
        </p>

        <BarChart
          title="Projected growth: earnings vs. revenue"
          description="Analyst estimates as of the report date — these move weekly as companies report."
          data={[
            { metric: 'EPS growth', Percent: Number(epsGrowthQ3.toFixed(1)) },
            { metric: 'Revenue growth', Percent: Number(revGrowthQ3.toFixed(1)) },
          ]}
          xKey="metric"
          series={[{ key: 'Percent', label: 'YoY growth (%)', color: '#059669' }]}
          unit="%"
        />

        <BarChart
          title="Forward P/E vs. 10-year average"
          data={[
            { metric: 'Forward P/E', Ratio: Number(forwardPE.toFixed(1)) },
            { metric: '10-yr average P/E', Ratio: Number(avgPE.toFixed(1)) },
          ]}
          xKey="metric"
          series={[{ key: 'Ratio', label: 'P/E ratio', color: '#6366f1' }]}
          colorByCategory
        />

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Analyst estimates, not guarantees — actual reported earnings routinely beat or miss projections. A high forward P/E doesn&apos;t predict a correction on any particular timeline. Not investment advice.
        </p>
      </div>
    </div>
  )
}
