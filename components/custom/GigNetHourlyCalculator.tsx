'use client'

// Gross hourly default ($15.03 with bonuses) and miles/hour reflect Gridwise's
// 2026 GPS-tracked driver report (~101,709 drivers), not IRS or platform data.
// Mileage rate defaults to the IRS business rate effective July 1, 2026
// (76¢/mile, Announcement 2026-11). Self-employment tax modeled at a flat
// 15.3% on net earnings after the mileage deduction. Not tax advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default function GigNetHourlyCalculator() {
  const [grossHourly, setGrossHourly] = useState(15.03)
  const [milesPerHour, setMilesPerHour] = useState(12)
  const [mileageRate, setMileageRate] = useState(0.76)
  const [marginalRate, setMarginalRate] = useState(12)
  const [hoursPerWeek, setHoursPerWeek] = useState(20)

  const result = useMemo(() => {
    const deductionPerHour = milesPerHour * mileageRate
    const taxableIncomePerHour = Math.max(0, grossHourly - deductionPerHour)
    const taxPerHour = taxableIncomePerHour * (0.153 + marginalRate / 100)
    const netHourly = Math.max(0, grossHourly - taxPerHour)
    const annualDeduction = deductionPerHour * hoursPerWeek * 52
    return { deductionPerHour, taxPerHour, netHourly, annualDeduction }
  }, [grossHourly, milesPerHour, mileageRate, marginalRate, hoursPerWeek])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · gig driver net pay
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Your real hourly, after mileage and self-employment tax
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Gross pay per hour</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(grossHourly)}</b>
          </div>
          <input type="range" min={5} max={40} step={0.25} value={grossHourly} onChange={(e) => setGrossHourly(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Miles driven per hour</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{milesPerHour}</b>
          </div>
          <input type="range" min={0} max={30} step={1} value={milesPerHour} onChange={(e) => setMilesPerHour(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>IRS mileage rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(mileageRate)}/mi</b>
          </div>
          <input type="range" min={0.6} max={0.85} step={0.01} value={mileageRate} onChange={(e) => setMileageRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Marginal income-tax rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{marginalRate}%</b>
          </div>
          <input type="range" min={0} max={37} step={1} value={marginalRate} onChange={(e) => setMarginalRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div className="sm:col-span-2">
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Hours driven per week</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{hoursPerWeek}</b>
          </div>
          <input type="range" min={1} max={60} step={1} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At {money(grossHourly)}/hr gross, the mileage deduction and a 15.3% self-employment tax bring your real take-home to{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.netHourly} format={(v) => money(v) + '/hr'} startFromZero />
          </strong>
          . At {hoursPerWeek} hrs/week, your mileage deduction is worth{' '}
          <strong>
            <AnimatedNumber value={result.annualDeduction} format={(v) => '$' + Math.round(v).toLocaleString('en-US')} startFromZero />
          </strong>{' '}
          a year off your taxable income.
        </p>

        <BarChart
          title="Gross vs. net hourly pay"
          description="Net = gross minus estimated self-employment and income tax after the mileage deduction."
          data={[
            { item: 'Gross/hr', Dollars: Number(grossHourly.toFixed(2)) },
            { item: 'Tax + SE tax/hr', Dollars: Number(result.taxPerHour.toFixed(2)) },
            { item: 'Net/hr', Dollars: Number(result.netHourly.toFixed(2)) },
          ]}
          xKey="item"
          series={[{ key: 'Dollars', label: 'Dollars per hour', color: '#0d9488' }]}
          unit="$"
          colorByCategory
        />

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Ignores vehicle depreciation beyond the standard mileage rate, insurance, phone costs, and state tax. Gridwise&apos;s GPS-tracked data is a third-party dataset, not government or platform-reported pay. Not tax advice.
        </p>
      </div>
    </div>
  )
}
