'use client'

// 2026 SALT deduction cap: $40,400 (MFJ/single) / $20,200 (MFS), phasing down
// 30% of MAGI above $505,000 ($252,500 MFS), floor $10,000 ($5,000 MFS).
// Per OBBBA (2025) and IRS inflation figures verified August 2026.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

type Status = 'mfj' | 'single' | 'mfs'

const FILING_LABELS: Record<Status, string> = {
  mfj: 'Married filing jointly',
  single: 'Single',
  mfs: 'Married filing separately',
}

export default function SaltCapWindowCalculator() {
  const [salt, setSalt] = useState(35000)
  const [magi, setMagi] = useState(505000)
  const [status, setStatus] = useState<Status>('mfj')

  const { cap, floor, threshold, reduced, allowed } = useMemo(() => {
    const cap = status === 'mfs' ? 20200 : 40400
    const floor = status === 'mfs' ? 5000 : 10000
    const threshold = status === 'mfs' ? 252500 : 505000
    const reduced = Math.max(floor, cap - 0.3 * Math.max(0, magi - threshold))
    const allowed = Math.min(salt, reduced)
    return { cap, floor, threshold, reduced, allowed }
  }, [salt, magi, status])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · estimate your 2026 SALT deduction
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much of your SALT can you actually deduct?
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(FILING_LABELS) as Status[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatus(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              status === key
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-emerald-400'
            }`}
          >
            {FILING_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your total state &amp; local taxes paid</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(salt)}</b>
          </div>
          <input
            type="range" min={0} max={150000} step={1000} value={salt}
            onChange={e => setSalt(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Modified AGI</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(magi)}</b>
          </div>
          <input
            type="range" min={0} max={2000000} step={5000} value={magi}
            onChange={e => setMagi(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Of your {money(salt)} in SALT, you can deduct{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{money(allowed)}</strong> in 2026 — your cap
          at this MAGI is {money(reduced)}.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Your effective SALT cap</p>
            <AnimatedNumber
              value={reduced}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Amount you can deduct</p>
            <AnimatedNumber
              value={allowed}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Estimate only — not tax advice. 2026 figures per OBBBA; verify against IRS instructions before filing.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">SALT cap window — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Filing status</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{FILING_LABELS[status]}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Base 2026 cap</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(cap)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Phase-down starts at MAGI</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(threshold)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Floor</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(floor)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Your effective cap</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(reduced)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Amount you can deduct</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(allowed)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
