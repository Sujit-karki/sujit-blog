'use client'

import { useState } from 'react'

const SEED = 1000
const GROWTH_RATE = 0.07

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function futureValueAnnuity(pmt: number, years: number, rate: number): number {
  if (rate === 0) return pmt * years
  return pmt * ((Math.pow(1 + rate, years) - 1) / rate)
}

export default function TrumpVs529Calculator() {
  const [contribution, setContribution] = useState(2000)
  const [years, setYears] = useState(18)
  const [bracket, setBracket] = useState(22)

  const contribFV = futureValueAnnuity(contribution, years, GROWTH_RATE)
  const seedFV = SEED * Math.pow(1 + GROWTH_RATE, years)

  const trumpTotal = contribFV + seedFV
  const basis = contribution * years
  const taxableAtWithdrawal = trumpTotal - basis
  const trumpSpendable = basis + taxableAtWithdrawal * (1 - bracket / 100)

  const plan529Spendable = contribFV // no seed, but 100% tax-free for qualified education expenses

  const max = Math.max(trumpSpendable, plan529Spendable)
  const diff = Math.abs(plan529Spendable - trumpSpendable)
  const the529Wins = plan529Spendable >= trumpSpendable

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · set your situation
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Trump Account vs. 529, spendable for college
      </p>

      {/* Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your annual contribution</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(contribution)}</b>
          </div>
          <input
            type="range" min={0} max={5000} step={250} value={contribution}
            onChange={e => setContribution(+e.target.value)}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Years until your kid needs it</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{years}</b>
          </div>
          <input
            type="range" min={1} max={18} step={1} value={years}
            onChange={e => setYears(+e.target.value)}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Tax bracket when withdrawn</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{bracket}%</b>
          </div>
          <input
            type="range" min={10} max={32} step={1} value={bracket}
            onChange={e => setBracket(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
      </div>

      {/* Result */}
      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-xl sm:text-2xl leading-snug mb-4 text-gray-900 dark:text-white">
          {the529Wins ? (
            <>The <strong className="text-emerald-600 dark:text-emerald-400">529 plan</strong> wins — by about {money(diff)} spendable for college, even after the Trump Account&apos;s free {money(SEED)} seed.</>
          ) : (
            <>The <strong className="text-blue-600 dark:text-blue-400">Trump Account</strong> edges ahead by about {money(diff)} — the free seed is outweighing a small contribution over a short horizon.</>
          )}
        </p>

        {/* 529 bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">529 plan — tax-free for qualified education</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(plan529Spendable)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${(plan529Spendable / max) * 100}%` }}
            />
          </div>
        </div>

        {/* Trump Account bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Trump Account — after ordinary-income tax</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(trumpSpendable)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-500"
              style={{ width: `${(trumpSpendable / max) * 100}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          {`Both sides assume the same ${money(contribution)}/yr contribution growing at 7% annually. The Trump Account also gets a one-time ${money(SEED)} government seed, but its basis (your contributions) is the only part that comes out tax-free — the seed and all growth are taxed as ordinary income at your chosen bracket. The 529's qualified education withdrawals are 100% tax-free, with no seed money of its own.`}
        </p>
      </div>
    </div>
  )
}
