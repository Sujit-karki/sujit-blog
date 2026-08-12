'use client'

// Default hold ~10% derived from AGA's 2025 State of the States report:
// $16.96B sportsbook revenue on a $166.94B handle (Aug 2026).

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function BettingHoldCostCalculator() {
  const [perBet, setPerBet] = useState(25)
  const [betsPerWeek, setBetsPerWeek] = useState(5)
  const [weeks, setWeeks] = useState(18)
  const [holdPct, setHoldPct] = useState(10)

  const result = useMemo(() => {
    const handle = perBet * betsPerWeek * weeks
    const expectedLoss = (handle * holdPct) / 100
    return { handle, expectedLoss }
  }, [perBet, betsPerWeek, weeks, holdPct])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · a season of betting
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What the house edge costs you over a season
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Average bet size</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(perBet)}</b>
          </div>
          <input type="range" min={5} max={500} step={5} value={perBet} onChange={(e) => setPerBet(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Bets per week</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{betsPerWeek}</b>
          </div>
          <input type="range" min={1} max={30} step={1} value={betsPerWeek} onChange={(e) => setBetsPerWeek(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Weeks (season length)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{weeks}</b>
          </div>
          <input type="range" min={1} max={22} step={1} value={weeks} onChange={(e) => setWeeks(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Sportsbook hold</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{holdPct}%</b>
          </div>
          <input type="range" min={2} max={20} step={0.5} value={holdPct} onChange={(e) => setHoldPct(+e.target.value)} className="w-full accent-red-500" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Across the season you&apos;d wager{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.handle} format={money} startFromZero />
          </strong>
          , and at a {holdPct}% hold the house keeps roughly{' '}
          <strong className="text-red-500 dark:text-red-400">
            <AnimatedNumber value={result.expectedLoss} format={money} startFromZero />
          </strong>{' '}
          of it on average — win or lose on any single bet.
        </p>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Total season handle</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.handle)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-lg transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Expected loss to the hold</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.expectedLoss)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-red-500 dark:bg-red-400 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (result.expectedLoss / result.handle) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Models the average industry hold (AGA, 2025: ~10%). Any single bet can win or lose regardless — this is what the math says happens on average, over volume. Not betting advice.
        </p>
      </div>
    </div>
  )
}
