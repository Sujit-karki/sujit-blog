'use client'

import { useState, useMemo } from 'react'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

interface YearRow {
  year: number
  rateCents: number
  annual: number
}

export default function ElectricBillProjector() {
  const [monthlyKwh, setMonthlyKwh] = useState(900)
  const [currentRateCents, setCurrentRateCents] = useState(18.2)
  const [annualIncreasePct, setAnnualIncreasePct] = useState(5)
  const [years, setYears] = useState(3)

  const result = useMemo(() => {
    const rows: YearRow[] = []
    for (let n = 1; n <= years; n++) {
      const rateCents = currentRateCents * Math.pow(1 + annualIncreasePct / 100, n - 1)
      const annual = monthlyKwh * 12 * (rateCents / 100)
      rows.push({ year: n, rateCents, annual })
    }
    const currentAnnual = rows[0]?.annual ?? 0
    const finalAnnual = rows[rows.length - 1]?.annual ?? 0
    const cumulativeIncrease = rows.reduce((sum, r) => sum + (r.annual - currentAnnual), 0)
    return { rows, currentAnnual, finalAnnual, cumulativeIncrease }
  }, [monthlyKwh, currentRateCents, annualIncreasePct, years])

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · project your own bill
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What rising rates do to your annual electric bill
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Monthly usage</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {monthlyKwh.toLocaleString('en-US')} kWh
            </b>
          </div>
          <input
            type="range" min={100} max={5000} step={50} value={monthlyKwh}
            onChange={(e) => setMonthlyKwh(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Current rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {currentRateCents.toFixed(1)}¢/kWh
            </b>
          </div>
          <input
            type="range" min={5} max={50} step={0.1} value={currentRateCents}
            onChange={(e) => setCurrentRateCents(+e.target.value)}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Assumed annual rate increase</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {annualIncreasePct}%
            </b>
          </div>
          <input
            type="range" min={0} max={15} step={0.5} value={annualIncreasePct}
            onChange={(e) => setAnnualIncreasePct(+e.target.value)}
            className="w-full accent-red-500"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Years to project</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {years} {years === 1 ? 'year' : 'years'}
            </b>
          </div>
          <input
            type="range" min={1} max={10} step={1} value={years}
            onChange={(e) => setYears(+e.target.value)}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-5">
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">This year</p>
          <AnimatedNumber
            value={result.currentAnnual}
            format={money}
            startFromZero
            className="font-serif text-lg sm:text-xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Year {years}
          </p>
          <AnimatedNumber
            value={result.finalAnnual}
            format={money}
            startFromZero
            className="font-serif text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Cumulative increase</p>
          <AnimatedNumber
            value={result.cumulativeIncrease}
            format={money}
            startFromZero
            className="font-serif text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 block"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <caption className="sr-only">Projected annual electric bill by year</caption>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Year</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Rate (¢/kWh)</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Annual bill</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.year} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.year}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.rateCents.toFixed(1)}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{money(r.annual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
        Estimate only; actual rates vary by utility, rate plan, and usage. Applies a constant annual increase compounded each year — real rate changes come in uneven steps set by state regulators.
      </p>
    </ChartCard>
  )
}
