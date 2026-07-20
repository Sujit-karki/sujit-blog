'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const WEEKS_PER_MONTH = 4.33
const SE_TAX_RATE = 0.153 // flat reserve estimate — actual SE tax applies to 92.35% of net earnings

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function SideHustleROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [hourlyRate, setHourlyRate] = useState(40)
  const [toolCosts, setToolCosts] = useState(40)

  const result = useMemo(() => {
    const grossMonthly = hoursPerWeek * hourlyRate * WEEKS_PER_MONTH
    const afterTools = Math.max(0, grossMonthly - toolCosts)
    const taxReserve = afterTools * SE_TAX_RATE
    const netMonthly = afterTools - taxReserve

    return { grossMonthly, afterTools, taxReserve, netMonthly }
  }, [hoursPerWeek, hourlyRate, toolCosts])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · real monthly math
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What's actually left after tools and taxes
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Hours / week</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{hoursPerWeek}</b>
          </div>
          <input
            type="range" min={1} max={40} step={1} value={hoursPerWeek}
            onChange={e => setHoursPerWeek(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Target hourly rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(hourlyRate)}</b>
          </div>
          <input
            type="range" min={10} max={200} step={5} value={hourlyRate}
            onChange={e => setHourlyRate(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Monthly tool costs</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(toolCosts)}</b>
          </div>
          <input
            type="range" min={0} max={300} step={10} value={toolCosts}
            onChange={e => setToolCosts(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-4">
        <div>
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Gross monthly revenue</span>
            <span className="font-medium text-gray-900 dark:text-white">
              <AnimatedNumber value={result.grossMonthly} format={money} startFromZero />
            </span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-lg transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">After tool costs (−{money(toolCosts)})</span>
            <span className="font-medium text-gray-900 dark:text-white">
              <AnimatedNumber value={result.afterTools} format={money} startFromZero />
            </span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.afterTools / result.grossMonthly) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Set aside for self-employment tax (15.3%)</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              −<AnimatedNumber value={result.taxReserve} format={money} startFromZero />
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Real monthly take-home</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
              <AnimatedNumber value={result.netMonthly} format={money} startFromZero />
            </span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.netMonthly / result.grossMonthly) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-4">
        Illustrative only. Assumes 4.33 weeks/month and a flat 15.3% self-employment tax reserve on revenue after tool costs — a conservative estimate since actual SE tax applies to 92.35% of net earnings and you may also owe regular income tax on top. Ignores marketplace fees (Upwork 0–15%, Fiverr 20%) and quarterly estimated payment timing. Set aside the reserve as you earn, not at tax time.
      </p>
    </div>
  )
}
