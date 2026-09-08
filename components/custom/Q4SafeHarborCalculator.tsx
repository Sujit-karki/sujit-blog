'use client'

// IRC §6654 safe harbor: pay the smaller of 90% of current-year tax or
// 100% of prior-year tax (110% if prior-year AGI exceeded $150,000).

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function Q4SafeHarborCalculator() {
  const [priorYearTax, setPriorYearTax] = useState(16000)
  const [priorYearAGI, setPriorYearAGI] = useState(120000)
  const [currentYearEstTax, setCurrentYearEstTax] = useState(18000)
  const [paidSoFar, setPaidSoFar] = useState(12000)

  const { currentYearTarget, priorYearTarget, target, q4Due } = useMemo(() => {
    const pct = priorYearAGI > 150000 ? 1.1 : 1.0
    const currentYearTarget = 0.9 * currentYearEstTax
    const priorYearTarget = pct * priorYearTax
    const target = Math.min(currentYearTarget, priorYearTarget)
    const q4Due = Math.max(0, target - paidSoFar)
    return { currentYearTarget, priorYearTarget, target, q4Due }
  }, [priorYearTax, priorYearAGI, currentYearEstTax, paidSoFar])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · calculate your Q4 payment
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What do you actually owe by January 15?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Last year&apos;s total tax</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(priorYearTax)}</b>
          </div>
          <input type="range" min={0} max={500000} step={500} value={priorYearTax} onChange={e => setPriorYearTax(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Last year&apos;s AGI</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(priorYearAGI)}</b>
          </div>
          <input type="range" min={0} max={3000000} step={5000} value={priorYearAGI} onChange={e => setPriorYearAGI(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Estimated tax owed this year</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(currentYearEstTax)}</b>
          </div>
          <input type="range" min={0} max={500000} step={500} value={currentYearEstTax} onChange={e => setCurrentYearEstTax(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Already paid this year (withholding + Q1-Q3)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(paidSoFar)}</b>
          </div>
          <input type="range" min={0} max={500000} step={500} value={paidSoFar} onChange={e => setPaidSoFar(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your safe-harbor target is <strong>{money(target)}</strong> for the year — you owe about{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">{money(q4Due)}</strong> by January 15.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Safe-harbor target</p>
            <AnimatedNumber value={target} format={v => money(v)} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Q4 payment due</p>
            <AnimatedNumber value={q4Due} format={v => money(v)} startFromZero className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400" />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Estimate only, not tax advice; state estimated-tax rules differ.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Q4 safe-harbor estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">90% of current-year tax</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(currentYearTarget)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{priorYearAGI > 150000 ? '110%' : '100%'} of prior-year tax</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(priorYearTarget)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Safe-harbor target (smaller of the two)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(target)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Q4 payment due Jan 15, 2027</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(q4Due)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
