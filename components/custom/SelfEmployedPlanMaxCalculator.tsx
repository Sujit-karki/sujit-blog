'use client'

// Solo 401(k) vs SEP IRA max-contribution comparison for 2026.
// Both share the $72,000 §415(c) ceiling; Solo 401(k) reaches it faster on
// modest income via the $24,500 employee deferral + catch-up.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

const OVERALL_CAP = 72000
const EMPLOYEE_DEFERRAL = 24500

export default function SelfEmployedPlanMaxCalculator() {
  const [netIncome, setNetIncome] = useState(60000)
  const [age, setAge] = useState(40)

  const { sepMax, soloMax, catchUp } = useMemo(() => {
    // Adjust net SE earnings for the deductible half of self-employment tax,
    // the standard simplified approach used by most solo-401k/SEP calculators.
    const adjNet = Math.max(0, netIncome - netIncome * 0.9235 * 0.153 * 0.5)
    const sepMax = Math.min(OVERALL_CAP, 0.25 * adjNet)
    const catchUp = age >= 60 && age <= 63 ? 11250 : age >= 50 ? 8000 : 0
    const employeeDeferral = Math.min(EMPLOYEE_DEFERRAL, netIncome)
    const employerShare = 0.25 * adjNet
    const soloMax = Math.min(OVERALL_CAP, employeeDeferral + employerShare) + catchUp
    return { sepMax, soloMax, catchUp }
  }, [netIncome, age])

  const gap = soloMax - sepMax

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · see which plan lets you save more
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Solo 401(k) vs SEP IRA: your 2026 max contribution
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Net self-employment income</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(netIncome)}</b>
          </div>
          <input
            type="range" min={0} max={500000} step={5000} value={netIncome}
            onChange={e => setNetIncome(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your age</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{age}</b>
          </div>
          <input
            type="range" min={18} max={80} step={1} value={age}
            onChange={e => setAge(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          {catchUp > 0 && (
            <p className="text-xs text-gray-400 mt-1">Includes a {money(catchUp)} Solo 401(k) catch-up at your age.</p>
          )}
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At {money(netIncome)} of net income, a Solo 401(k) lets you save{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{money(gap)} more</strong> than a SEP IRA this year.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">SEP IRA max</p>
            <AnimatedNumber
              value={sepMax}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Solo 401(k) max</p>
            <AnimatedNumber
              value={soloMax}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Estimate only, not tax advice; assumes a sole proprietor / single-member LLC. S-corp math differs.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Solo 401(k) vs SEP IRA max contribution — data table</caption>
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Net income</th>
                <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">SEP IRA max</th>
                <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Solo 401(k) max</th>
              </tr>
            </thead>
            <tbody>
              {[40000, 60000, 120000, 200000].map((income) => {
                const adj = Math.max(0, income - income * 0.9235 * 0.153 * 0.5)
                const sep = Math.min(OVERALL_CAP, 0.25 * adj)
                const solo = Math.min(OVERALL_CAP, Math.min(EMPLOYEE_DEFERRAL, income) + 0.25 * adj) + catchUp
                return (
                  <tr key={income} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{money(income)}</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(sep)}</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(solo)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
