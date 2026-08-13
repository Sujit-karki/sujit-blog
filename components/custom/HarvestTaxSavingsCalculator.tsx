'use client'

// IRS rules modeled: unlimited gain offsetting, up to $3,000/yr ($1,500 MFS)
// of net capital loss deductible against ordinary income, unlimited
// carryforward of the remainder. See IRS capital-loss guidance (Topic 409 /
// Pub. 550) — cited in this post's Sources block. Not tax advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function HarvestTaxSavingsCalculator() {
  const [stGains, setStGains] = useState(4000)
  const [ltGains, setLtGains] = useState(5000)
  const [stLosses, setStLosses] = useState(10000)
  const [ltLosses, setLtLosses] = useState(0)
  const [marginalRate, setMarginalRate] = useState(24)
  const [ltcgRate, setLtcgRate] = useState(15)

  const result = useMemo(() => {
    const netST = stGains - stLosses
    const netLT = ltGains - ltLosses
    let taxableST = 0
    let taxableLT = 0
    let ordinaryDeduction = 0
    let carryforward = 0

    if (netST >= 0 && netLT >= 0) {
      taxableST = netST
      taxableLT = netLT
    } else if (netST < 0 && netLT < 0) {
      const totalLoss = -(netST + netLT)
      ordinaryDeduction = Math.min(3000, totalLoss)
      carryforward = totalLoss - ordinaryDeduction
    } else if (netST < 0 && netLT >= 0) {
      const crossOffset = Math.min(netLT, -netST)
      taxableLT = netLT - crossOffset
      const remainderLoss = -netST - crossOffset
      ordinaryDeduction = Math.min(3000, remainderLoss)
      carryforward = remainderLoss - ordinaryDeduction
    } else {
      const crossOffset = Math.min(netST, -netLT)
      taxableST = netST - crossOffset
      const remainderLoss = -netLT - crossOffset
      ordinaryDeduction = Math.min(3000, remainderLoss)
      carryforward = remainderLoss - ordinaryDeduction
    }

    const taxBefore = stGains * (marginalRate / 100) + ltGains * (ltcgRate / 100)
    const taxAfter =
      taxableST * (marginalRate / 100) +
      taxableLT * (ltcgRate / 100) -
      ordinaryDeduction * (marginalRate / 100)
    const taxSaved = Math.max(0, taxBefore - taxAfter)

    return { taxBefore, taxAfter: Math.max(0, taxAfter), taxSaved, ordinaryDeduction, carryforward }
  }, [stGains, ltGains, stLosses, ltLosses, marginalRate, ltcgRate])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · tax-loss harvesting
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What harvesting your losses actually saves you
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Short-term gains</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(stGains)}</b>
          </div>
          <input type="range" min={0} max={50000} step={500} value={stGains} onChange={(e) => setStGains(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Long-term gains</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(ltGains)}</b>
          </div>
          <input type="range" min={0} max={50000} step={500} value={ltGains} onChange={(e) => setLtGains(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Short-term losses to harvest</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(stLosses)}</b>
          </div>
          <input type="range" min={0} max={50000} step={500} value={stLosses} onChange={(e) => setStLosses(+e.target.value)} className="w-full accent-red-500" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Long-term losses to harvest</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(ltLosses)}</b>
          </div>
          <input type="range" min={0} max={50000} step={500} value={ltLosses} onChange={(e) => setLtLosses(+e.target.value)} className="w-full accent-red-500" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Marginal tax rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{marginalRate}%</b>
          </div>
          <input type="range" min={10} max={37} step={1} value={marginalRate} onChange={(e) => setMarginalRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Long-term capital gains rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{ltcgRate}%</b>
          </div>
          <input type="range" min={0} max={20} step={5} value={ltcgRate} onChange={(e) => setLtcgRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Harvesting these losses cuts your federal tax bill from{' '}
          <strong>{money(result.taxBefore)}</strong> to{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.taxAfter} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          — a savings of{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.taxSaved} format={(v) => money(v)} startFromZero />
          </strong>
          {result.carryforward > 0 && (
            <>, plus {money(result.carryforward)} of unused losses carried forward to next year</>
          )}
          .
        </p>

        <BarChart
          title="Federal tax owed: before vs. after harvesting"
          description="Illustrative — assumes the marginal and long-term capital gains rates entered above apply to every dollar."
          data={[
            { scenario: 'Before harvest', Tax: Math.round(result.taxBefore) },
            { scenario: 'After harvest', Tax: Math.round(result.taxAfter) },
          ]}
          xKey="scenario"
          series={[{ key: 'Tax', label: 'Federal tax owed ($)', color: '#059669' }]}
          unit="$"
        />

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Tax-loss harvesting estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Ordinary-income deduction claimed</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(result.ordinaryDeduction)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Loss carried forward to next year</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(result.carryforward)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Estimated tax saved</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(result.taxSaved)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Simplified federal-only model — ignores state taxes, the net investment income tax, AMT, and the 30-day wash-sale rule, which can disallow a loss entirely if you repurchase a substantially identical security. Estimate only — not tax advice.
        </p>
      </div>
    </div>
  )
}
