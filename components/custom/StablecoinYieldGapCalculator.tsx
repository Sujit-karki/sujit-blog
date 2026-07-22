'use client'

// Issuer reserve yield ~4.3% — midpoint of BlackRock BUIDL's reported ~4-4.5% (2026).
// HYSA benchmark 4.15% — Forbright Bank, cited in the Fed-rate-hike 2026 post (Bankrate/NerdWallet).
// Stablecoin holder yield is 0% by design: the GENIUS Act bars payment-stablecoin
// issuers from paying interest to holders.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const ISSUER_YIELD = 4.3
const HYSA_YIELD = 4.15

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function grow(balance: number, aprPct: number, months: number): number {
  const r = aprPct / 100 / 12
  return balance * (Math.pow(1 + r, months) - 1)
}

export default function StablecoinYieldGapCalculator() {
  const [balance, setBalance] = useState(5000)
  const [months, setMonths] = useState(12)

  const result = useMemo(() => {
    const issuerEarned = grow(balance, ISSUER_YIELD, months)
    const hysaForgone = grow(balance, HYSA_YIELD, months)
    const best = Math.max(issuerEarned, hysaForgone, 1)
    return { issuerEarned, hysaForgone, best }
  }, [balance, months])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · the GENIUS Act yield gap
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Who actually earns the yield on your stablecoins?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Balance held in stablecoins</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(balance)}</b>
          </div>
          <input
            type="range" min={500} max={50000} step={500} value={balance}
            onChange={e => setBalance(+e.target.value)}
            className="w-full accent-purple-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Months held</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{months} mo</b>
          </div>
          <input
            type="range" min={1} max={36} step={1} value={months}
            onChange={e => setMonths(+e.target.value)}
            className="w-full accent-purple-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Parking {money(balance)} in a stablecoin for {months} months hands the issuer about{' '}
          <strong className="text-purple-600 dark:text-purple-400">
            <AnimatedNumber value={result.issuerEarned} format={money} startFromZero />
          </strong>{' '}
          in yield — money the GENIUS Act says legally can&apos;t come to you. The same balance in a
          high-yield savings account would have earned <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.hysaForgone} format={money} startFromZero />
          </strong> instead.
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">What you earn holding a stablecoin — 0% by law</span>
            <span className="font-medium text-gray-900 dark:text-white">$0</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-lg transition-all duration-500" style={{ width: '4%' }} />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">What the issuer earns off your reserves (~{ISSUER_YIELD}%, e.g. BUIDL)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.issuerEarned)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-purple-600 dark:bg-purple-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.issuerEarned / result.best) * 100)}%` }}
            />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">What a top HYSA would&apos;ve paid you (~{HYSA_YIELD}%)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.hysaForgone)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.hysaForgone / result.best) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Illustrative, monthly-compounded estimate. Issuer yield approximates BlackRock BUIDL&apos;s reported 2026 range; HYSA yield matches the top nationally available rate cited in our Fed-rate-hike coverage. Actual reserve income, HYSA rates, and your own opportunity cost will vary — not investment advice.
        </p>
      </div>
    </div>
  )
}
