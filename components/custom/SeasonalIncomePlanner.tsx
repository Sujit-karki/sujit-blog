'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const SE_TAX_PCT = 15.3

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function SeasonalIncomePlanner() {
  const [hourlyWage, setHourlyWage] = useState(18)
  const [hoursPerWeek, setHoursPerWeek] = useState(25)
  const [weeks, setWeeks] = useState(8)
  const [is1099, setIs1099] = useState(false)

  const result = useMemo(() => {
    const gross = hourlyWage * hoursPerWeek * weeks
    const taxSetAside = is1099 ? (gross * SE_TAX_PCT) / 100 : 0
    const takeHome = gross - taxSetAside
    return { gross, taxSetAside, takeHome }
  }, [hourlyWage, hoursPerWeek, weeks, is1099])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · seasonal work income
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What a seasonal gig actually pays out
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Hourly wage</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(hourlyWage)}/hr</b>
          </div>
          <input type="range" min={7.25} max={40} step={0.25} value={hourlyWage} onChange={(e) => setHourlyWage(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Hours per week</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{hoursPerWeek}</b>
          </div>
          <input type="range" min={5} max={50} step={1} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Weeks worked</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{weeks}</b>
          </div>
          <input type="range" min={2} max={16} step={1} value={weeks} onChange={(e) => setWeeks(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIs1099(false)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium border transition-colors ${!is1099 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            W-2 employee
          </button>
          <button
            onClick={() => setIs1099(true)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium border transition-colors ${is1099 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            1099 gig / contract
          </button>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Gross seasonal income:{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.gross} format={money} startFromZero />
          </strong>
          {is1099 && (
            <>
              . Set aside roughly{' '}
              <strong className="text-red-500 dark:text-red-400">
                <AnimatedNumber value={result.taxSetAside} format={money} startFromZero />
              </strong>{' '}
              for self-employment tax, leaving{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={result.takeHome} format={money} startFromZero />
              </strong>
              .
            </>
          )}
        </p>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">
              {is1099 ? 'Take-home after SE tax set-aside' : 'Gross pay (before income tax withholding)'}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">{money(is1099 ? result.takeHome : result.gross)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${is1099 ? Math.min(100, (result.takeHome / result.gross) * 100) : 100}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          W-2 pay still has income tax and payroll tax withheld by the employer — this models the SE-tax-specific gap for 1099 income. Not a substitute for a real tax estimate.
        </p>
      </div>
    </div>
  )
}
