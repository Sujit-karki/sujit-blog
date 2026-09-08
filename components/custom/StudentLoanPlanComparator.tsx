'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

// RAP (effective Jul 1, 2026, OBBBA): monthly payment is a graduated share of AGI,
// modeled here as marginal $10k brackets from 1% up to 10% at $100k+, minus $50/dependent,
// with a $10/month floor and a 360-payment (30-yr) forgiveness clock.
// This is a simplified public approximation, not the servicer's exact formula — see disclaimer below.
const RAP_BRACKETS = [
  { upTo: 10000, rate: 0.01 },
  { upTo: 20000, rate: 0.02 },
  { upTo: 30000, rate: 0.03 },
  { upTo: 40000, rate: 0.04 },
  { upTo: 50000, rate: 0.05 },
  { upTo: 60000, rate: 0.06 },
  { upTo: 70000, rate: 0.07 },
  { upTo: 80000, rate: 0.08 },
  { upTo: 90000, rate: 0.09 },
  { upTo: Infinity, rate: 0.10 },
]

const RAP_FLOOR = 10
const RAP_DEPENDENT_CREDIT = 50
const STANDARD_RATE = 0.0653 // representative federal Direct Loan rate
const IBR_POVERTY_BASE = 15650 // approx 2026 HHS poverty guideline, household of 1
const IBR_POVERTY_PER_EXTRA = 5500 // approx increment per additional household member

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function rapAnnual(agi: number): number {
  let total = 0
  let prevCap = 0
  for (const bracket of RAP_BRACKETS) {
    const capped = Math.min(agi, bracket.upTo)
    if (capped > prevCap) {
      total += (capped - prevCap) * bracket.rate
      prevCap = capped
    }
    if (agi <= bracket.upTo) break
  }
  return total
}

function ibrMonthly(agi: number, householdSize: number): number {
  const povertyLine = IBR_POVERTY_BASE + IBR_POVERTY_PER_EXTRA * Math.max(0, householdSize - 1)
  const discretionary = Math.max(0, agi - 1.5 * povertyLine)
  return (discretionary * 0.10) / 12
}

function standardMonthly(balance: number, years: number): number {
  const r = STANDARD_RATE / 12
  const n = years * 12
  if (r === 0) return balance / n
  return (balance * r) / (1 - Math.pow(1 + r, -n))
}

export default function StudentLoanPlanComparator() {
  const [balance, setBalance] = useState(35000)
  const [income, setIncome] = useState(45000)
  const [dependents, setDependents] = useState(0)

  const result = useMemo(() => {
    const rapMonthlyRaw = rapAnnual(income) / 12 - RAP_DEPENDENT_CREDIT * dependents
    const rap = Math.max(RAP_FLOOR, rapMonthlyRaw)

    const ibr = ibrMonthly(income, dependents + 1)
    const standard = standardMonthly(balance, 10)

    const plans = [
      { key: 'rap', label: 'RAP (30-yr)', value: rap },
      { key: 'ibr', label: 'IBR (legacy IDR, ~20–25-yr)', value: ibr },
      { key: 'standard', label: 'Standard (10-yr fixed)', value: standard },
    ]
    const lowest = Math.min(...plans.map(p => p.value))
    const highest = Math.max(...plans.map(p => p.value))

    return { rap, ibr, standard, plans, lowest, highest }
  }, [balance, income, dependents])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · RAP vs. IBR vs. Standard
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Which repayment plan actually costs you less?
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Loan balance</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(balance)}</b>
          </div>
          <input
            type="range" min={5000} max={150000} step={1000} value={balance}
            onChange={e => setBalance(+e.target.value)}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Annual income (AGI)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(income)}</b>
          </div>
          <input
            type="range" min={10000} max={150000} step={1000} value={income}
            onChange={e => setIncome(+e.target.value)}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Dependents</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{dependents}</b>
          </div>
          <input
            type="range" min={0} max={6} step={1} value={dependents}
            onChange={e => setDependents(+e.target.value)}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-4">
        {result.plans.map(plan => (
          <div key={plan.key}>
            <div className="flex justify-between font-mono text-[12px] mb-1.5">
              <span className="text-gray-500 dark:text-gray-400">{plan.label}</span>
              <span className={`font-medium ${plan.value === result.lowest ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                <AnimatedNumber value={plan.value} format={v => money(v) + '/mo'} startFromZero />
              </span>
            </div>
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg transition-all duration-500 ${plan.value === result.lowest ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                style={{ width: `${Math.max(4, (plan.value / result.highest) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
        Simplified public estimate only — not your servicer&apos;s official calculation. RAP models the 1–10% AGI schedule as marginal $10k brackets, minus $50/month per dependent, with a $10/month floor; IBR approximates 10% of discretionary income above 150% of the poverty line; Standard assumes a 10-year fixed amortization at ~6.53%. Real IBR/Standard/RAP terms vary by loan type, filing status, and servicer — confirm your exact payment at studentaid.gov.
      </p>
    </div>
  )
}
