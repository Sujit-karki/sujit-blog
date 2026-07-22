'use client'

// Defaults: avg individual card balance $6,519 (LendingTree, Q1 2026 NY Fed data);
// avg APR 21.00% across all accounts (Federal Reserve G.19, Q1 2026).

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

interface PayoffResult {
  months: number | null
  totalInterest: number
}

function payoff(balance: number, aprPct: number, payment: number): PayoffResult {
  const r = aprPct / 100 / 12
  const firstInterest = balance * r
  if (payment <= firstInterest) return { months: null, totalInterest: Infinity }

  let bal = balance
  let months = 0
  let totalPaid = 0
  while (bal > 0 && months < 720) {
    const interest = bal * r
    const principal = Math.min(payment - interest, bal)
    bal -= principal
    totalPaid += principal + interest
    months++
  }
  return { months, totalInterest: totalPaid - balance }
}

export default function DebtPayoffCalculator() {
  const [balance, setBalance] = useState(6519)
  const [apr, setApr] = useState(21)
  const [payment, setPayment] = useState(250)

  const scenarios = useMemo(() => {
    const base = payoff(balance, apr, payment)
    const plus50 = payoff(balance, apr, payment + 50)
    const plus100 = payoff(balance, apr, payment + 100)
    return [
      { key: 'base', label: `${money(payment)}/mo`, ...base },
      { key: 'plus50', label: `${money(payment + 50)}/mo`, ...plus50 },
      { key: 'plus100', label: `${money(payment + 100)}/mo`, ...plus100 },
    ]
  }, [balance, apr, payment])

  const finiteInterests = scenarios.map(s => s.totalInterest).filter(v => Number.isFinite(v)) as number[]
  const worstInterest = finiteInterests.length ? Math.max(...finiteInterests) : 1
  const base = scenarios[0]
  const plus50 = scenarios[1]
  const saved = Number.isFinite(base.totalInterest) && Number.isFinite(plus50.totalInterest)
    ? base.totalInterest - plus50.totalInterest
    : 0

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · run your own balance
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How long is your card actually going to take?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Card balance</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(balance)}</b>
          </div>
          <input
            type="range" min={500} max={30000} step={100} value={balance}
            onChange={e => setBalance(+e.target.value)}
            className="w-full accent-red-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>APR</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{apr.toFixed(1)}%</b>
          </div>
          <input
            type="range" min={10} max={30} step={0.5} value={apr}
            onChange={e => setApr(+e.target.value)}
            className="w-full accent-red-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Monthly payment</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(payment)}</b>
          </div>
          <input
            type="range" min={25} max={1500} step={25} value={payment}
            onChange={e => setPayment(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          {base.months === null ? (
            <>At {money(payment)}/mo, you&apos;re barely covering interest — this balance <strong className="text-red-500 dark:text-red-400">never gets paid off</strong>. Raise the payment.</>
          ) : (
            <>
              At {money(payment)}/mo, you&apos;re debt-free in{' '}
              <strong>{base.months} months</strong> and pay about{' '}
              <strong className="text-red-500 dark:text-red-400">{money(base.totalInterest)}</strong> in interest.
              {saved > 0 && (
                <> Adding $50/mo saves about <strong className="text-emerald-600 dark:text-emerald-400">{money(saved)}</strong>.</>
              )}
            </>
          )}
        </p>

        {scenarios.map(s => (
          <div key={s.key} className="mb-4">
            <div className="flex justify-between font-mono text-[12px] mb-1.5">
              <span className="text-gray-500 dark:text-gray-400">
                {s.label} — {s.months === null ? 'never pays off' : `${s.months} months`}
              </span>
              <span className={`font-medium ${Number.isFinite(s.totalInterest) && s.totalInterest === Math.min(...finiteInterests) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                {Number.isFinite(s.totalInterest) ? (
                  <AnimatedNumber value={s.totalInterest} format={v => money(v) + ' interest'} startFromZero />
                ) : (
                  'n/a'
                )}
              </span>
            </div>
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg transition-all duration-500 ${
                  Number.isFinite(s.totalInterest) && s.totalInterest === Math.min(...finiteInterests)
                    ? 'bg-emerald-600 dark:bg-emerald-500'
                    : 'bg-red-500 dark:bg-red-400'
                }`}
                style={{
                  width: Number.isFinite(s.totalInterest)
                    ? `${Math.max(4, (s.totalInterest / worstInterest) * 100)}%`
                    : '100%',
                }}
              />
            </div>
          </div>
        ))}

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Standard amortization at a fixed payment, ignoring new charges, fees, or promotional rates. Defaults reflect the Q1 2026 average card balance ($6,519) and average APR (21.00%) — LendingTree/NY Fed and Federal Reserve G.19. Your card&apos;s actual minimum-payment formula may differ from a fixed dollar amount.
        </p>
      </div>
    </div>
  )
}
