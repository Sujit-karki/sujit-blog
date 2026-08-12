'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function ContributionLimitMaxPlanner() {
  const [annualLimit, setAnnualLimit] = useState(25000)
  const [alreadyContributed, setAlreadyContributed] = useState(0)
  const [paychecksLeft, setPaychecksLeft] = useState(20)

  const result = useMemo(() => {
    const remaining = Math.max(0, annualLimit - alreadyContributed)
    const perPaycheck = paychecksLeft > 0 ? remaining / paychecksLeft : 0
    return { remaining, perPaycheck }
  }, [annualLimit, alreadyContributed, paychecksLeft])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · pace your contributions
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much per paycheck to hit the limit
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Annual limit target</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(annualLimit)}</b>
          </div>
          <input type="range" min={5000} max={35000} step={250} value={annualLimit} onChange={(e) => setAnnualLimit(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Already contributed this year</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(alreadyContributed)}</b>
          </div>
          <input type="range" min={0} max={30000} step={250} value={alreadyContributed} onChange={(e) => setAlreadyContributed(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Paychecks remaining this year</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{paychecksLeft}</b>
          </div>
          <input type="range" min={1} max={26} step={1} value={paychecksLeft} onChange={(e) => setPaychecksLeft(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          With{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.remaining} format={money} startFromZero />
          </strong>{' '}
          left to contribute over {paychecksLeft} paychecks, that&apos;s{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.perPaycheck} format={(v) => money(v) + '/paycheck'} startFromZero />
          </strong>
          .
        </p>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Progress toward the limit</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {money(alreadyContributed)} / {money(annualLimit)}
            </span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (alreadyContributed / annualLimit) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          The 2027 limit shown as a default is a Milliman forecast — the IRS typically confirms the official figure in November. Don&apos;t set payroll elections around a projection alone once the real number is out.
        </p>
      </div>
    </div>
  )
}
