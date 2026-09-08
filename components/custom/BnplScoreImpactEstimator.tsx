'use client'

// Illustrative BNPL score-impact model. FICO's joint study with Affirm (500,000+
// consumers) found on-time BNPL use moved scores within ±10 points for 85%+ of
// users; missed payments carry a larger downside, similar to any delinquency.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

export default function BnplScoreImpactEstimator() {
  const [bnplLoans, setBnplLoans] = useState(3)
  const [onTime, setOnTime] = useState(true)
  const [startingScore, setStartingScore] = useState(690)

  const { estimated, delta } = useMemo(() => {
    const delta = onTime ? Math.min(10, 2 * bnplLoans) : -Math.min(15, 4 * bnplLoans)
    const estimated = Math.min(850, Math.max(300, startingScore + delta))
    return { estimated, delta }
  }, [bnplLoans, onTime, startingScore])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · illustrative BNPL score impact
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How might BNPL activity move your score?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Open BNPL loans</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{bnplLoans}</b>
          </div>
          <input
            type="range" min={0} max={20} step={1} value={bnplLoans}
            onChange={e => setBnplLoans(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Starting score</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{startingScore}</b>
          </div>
          <input
            type="range" min={300} max={850} step={5} value={startingScore}
            onChange={e => setStartingScore(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button" onClick={() => setOnTime(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${onTime ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
          >
            Paid on time
          </button>
          <button
            type="button" onClick={() => setOnTime(false)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!onTime ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
          >
            Missed a payment
          </button>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Estimated score: <strong className={delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            {estimated}
          </strong>{' '}
          ({delta >= 0 ? '+' : ''}{delta} points)
        </p>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
          <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Estimated new score</p>
          <AnimatedNumber
            value={estimated}
            format={v => Math.round(v).toString()}
            startFromZero
            className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Illustrative only — FICO&apos;s study found impacts within ±10 points for 85%+ of on-time users; your result
          depends on your full credit file. Not credit advice.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">BNPL score impact estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Starting score</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{startingScore}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Open BNPL loans</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{bnplLoans}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Payment status</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{onTime ? 'On time' : 'Missed payment'}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Estimated new score</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{estimated}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
