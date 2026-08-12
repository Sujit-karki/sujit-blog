'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default function MedicareColaOffsetCalculator() {
  const [monthlyBenefit, setMonthlyBenefit] = useState(2071)
  const [colaPct, setColaPct] = useState(3.2)
  // Held fixed — the 2026 confirmed premium and the 2027 Trustees projection.
  const partBnow = 202.9
  const partBnext = 209.5

  const result = useMemo(() => {
    const grossRaise = (monthlyBenefit * colaPct) / 100
    const partBincrease = partBnext - partBnow
    const netRaise = grossRaise - partBincrease
    return { grossRaise, partBincrease, netRaise }
  }, [monthlyBenefit, colaPct, partBnow, partBnext])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · COLA vs. Part B
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What&apos;s left of your raise after Part B
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Current monthly benefit</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(monthlyBenefit)}</b>
          </div>
          <input type="range" min={800} max={5000} step={10} value={monthlyBenefit} onChange={(e) => setMonthlyBenefit(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>COLA (projected)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{colaPct.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={8} step={0.1} value={colaPct} onChange={(e) => setColaPct(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          A {colaPct.toFixed(1)}% COLA adds{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.grossRaise} format={(v) => money(v) + '/mo'} startFromZero />
          </strong>
          , but the projected Part B increase of{' '}
          <strong className="text-red-500 dark:text-red-400">
            <AnimatedNumber value={result.partBincrease} format={(v) => money(v) + '/mo'} startFromZero />
          </strong>{' '}
          eats into it, leaving a net raise of{' '}
          <strong className={result.netRaise >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            <AnimatedNumber value={result.netRaise} format={(v) => money(v) + '/mo'} startFromZero />
          </strong>
          .
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Gross COLA raise</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.grossRaise)}/mo</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Net raise after Part B increase</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.netRaise)}/mo</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${result.netRaise >= 0 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-500 dark:bg-red-400'}`}
              style={{ width: `${Math.min(100, Math.max(0, (result.netRaise / Math.max(result.grossRaise, 1)) * 100))}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          The 2027 Part B premium is a Trustees Report projection — CMS confirms the actual figure around November. IRMAA surcharges for higher earners aren&apos;t included here.
        </p>
      </div>
    </div>
  )
}
