'use client'

// Models a quarterly repurchase gate on an interval fund / non-traded BDC:
// if total redemption requests exceed the fund's quarterly ceiling, each
// investor's request is prorated instead of paid in full.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function IntervalGateExitCalculator() {
  const [investment, setInvestment] = useState(50000)
  const [gatePct, setGatePct] = useState(5)
  const [totalRequestsPct, setTotalRequestsPct] = useState(12)

  const { redeemedThisQuarter, quartersToExit, prorated } = useMemo(() => {
    const prorated = totalRequestsPct > gatePct
    const fraction = prorated ? gatePct / totalRequestsPct : 1
    const redeemedThisQuarter = investment * fraction
    const quartersToExit = prorated ? Math.ceil(totalRequestsPct / gatePct) : 1
    return { redeemedThisQuarter, quartersToExit, prorated }
  }, [investment, gatePct, totalRequestsPct])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · model a repurchase gate
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        If everyone rushes for the exit at once, how much of yours gets out?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your investment</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(investment)}</b>
          </div>
          <input
            type="range" min={0} max={2000000} step={5000} value={investment}
            onChange={e => setInvestment(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Fund&apos;s quarterly repurchase gate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{gatePct}% of NAV</b>
          </div>
          <input
            type="range" min={1} max={10} step={0.5} value={gatePct}
            onChange={e => setGatePct(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Total redemption requests this quarter</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{totalRequestsPct}% of NAV</b>
          </div>
          <input
            type="range" min={1} max={100} step={1} value={totalRequestsPct}
            onChange={e => setTotalRequestsPct(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          {prorated ? (
            <>
              Requests exceed the gate, so you&apos;d get about{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{money(redeemedThisQuarter)}</strong> this
              quarter — full exit would take roughly{' '}
              <strong>{quartersToExit} quarter{quartersToExit === 1 ? '' : 's'}</strong> if the queue stays this long.
            </>
          ) : (
            <>
              Requests are under the gate, so you&apos;d get your{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">full {money(investment)}</strong> back this quarter.
            </>
          )}
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Redeemed this quarter</p>
            <AnimatedNumber
              value={redeemedThisQuarter}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Est. quarters to full exit</p>
            <AnimatedNumber
              value={quartersToExit}
              format={v => Math.round(v).toString()}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Simplified model — actual proration rules, NAV changes, and manager top-ups vary by fund. Not investment advice.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Interval fund gate exit — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Your investment</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(investment)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Quarterly gate</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{gatePct}% of NAV</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Total requests</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{totalRequestsPct}% of NAV</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Redeemed this quarter</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(redeemedThisQuarter)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Est. quarters to full exit</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{quartersToExit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
