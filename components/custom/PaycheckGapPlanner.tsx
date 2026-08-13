'use client'

// Models the cash-flow gap during a federal funding lapse, not a legal or
// benefits calculator. Back pay is guaranteed under the Government Employee
// Fair Treatment Act once a lapse ends, but only once it ends — the gap
// modeled here is the real household risk. Not financial advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import BarChart from '@/components/charts/BarChartLazy'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function PaycheckGapPlanner() {
  const [netPaycheck, setNetPaycheck] = useState(3889)
  const [weeksLapse, setWeeksLapse] = useState(6)
  const [emergencyFund, setEmergencyFund] = useState(5000)
  const [essentialWeekly, setEssentialWeekly] = useState(1200)

  const result = useMemo(() => {
    const missedPay = netPaycheck * (weeksLapse / 2)
    const essentialSpend = essentialWeekly * weeksLapse
    const shortfall = essentialSpend - emergencyFund
    const weeksFundLasts = essentialWeekly > 0 ? emergencyFund / essentialWeekly : 0
    return { missedPay, essentialSpend, shortfall, weeksFundLasts }
  }, [netPaycheck, weeksLapse, emergencyFund, essentialWeekly])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · shutdown cash-flow gap
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How long would your runway actually last?
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Net paycheck (biweekly)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(netPaycheck)}</b>
          </div>
          <input type="range" min={500} max={10000} step={50} value={netPaycheck} onChange={(e) => setNetPaycheck(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Weeks of lapse</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{weeksLapse}</b>
          </div>
          <input type="range" min={0} max={12} step={1} value={weeksLapse} onChange={(e) => setWeeksLapse(+e.target.value)} className="w-full accent-red-500" />
          <p className="text-xs text-gray-400 mt-1">The 2025 shutdown ran 6 weeks (43 days) — the longest in modern history.</p>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Emergency fund on hand</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(emergencyFund)}</b>
          </div>
          <input type="range" min={0} max={30000} step={250} value={emergencyFund} onChange={(e) => setEmergencyFund(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Essential spending per week</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(essentialWeekly)}</b>
          </div>
          <input type="range" min={200} max={3000} step={50} value={essentialWeekly} onChange={(e) => setEssentialWeekly(+e.target.value)} className="w-full accent-red-500" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          A {weeksLapse}-week lapse means{' '}
          <strong className="text-red-600 dark:text-red-400">
            <AnimatedNumber value={result.missedPay} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          in missed paychecks. Your emergency fund covers about{' '}
          <strong>
            <AnimatedNumber value={result.weeksFundLasts} format={(v) => v.toFixed(1) + ' weeks'} startFromZero />
          </strong>{' '}
          of essential spending, leaving a gap of{' '}
          <strong className={result.shortfall > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
            <AnimatedNumber value={Math.abs(result.shortfall)} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          {result.shortfall > 0 ? 'short' : 'in surplus'}.
        </p>

        <BarChart
          title="Essential spending vs. emergency fund over the lapse"
          description="All back pay arrives once the lapse ends — this is the gap you'd need to bridge until then."
          data={[
            { item: 'Essential spending', Dollars: Math.round(result.essentialSpend) },
            { item: 'Emergency fund', Dollars: Math.round(emergencyFund) },
            { item: 'Missed paychecks', Dollars: Math.round(result.missedPay) },
          ]}
          xKey="item"
          series={[{ key: 'Dollars', label: 'Dollars', color: '#f59e0b' }]}
          unit="$"
          colorByCategory
        />

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Federal employees and back-pay-eligible contractors generally receive full back pay once a lapse ends under the Government Employee Fair Treatment Act — but not until then. Estimate only, not financial advice.
        </p>
      </div>
    </div>
  )
}
