'use client'

// OBBBA auto-loan interest deduction: $10,000 annual cap, phases out $200 per
// $1,000 of MAGI above $100k single / $200k joint (zero at +$50k over).

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function firstYearInterest(loanAmount: number, aprPct: number, termMonths: number): number {
  const r = aprPct / 100 / 12
  if (r === 0) return 0
  const payment = (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths))
  let balance = loanAmount
  let interest = 0
  const months = Math.min(12, termMonths)
  for (let i = 0; i < months; i++) {
    const monthInterest = balance * r
    interest += monthInterest
    balance -= payment - monthInterest
  }
  return interest
}

export default function CarLoanInterestDeductionCalculator() {
  const [loanAmount, setLoanAmount] = useState(40000)
  const [apr, setApr] = useState(7.0)
  const [termMonths, setTermMonths] = useState(60)
  const [filingStatus, setFilingStatus] = useState<'single' | 'mfj'>('single')
  const [magi, setMagi] = useState(90000)
  const [bracket, setBracket] = useState(22)

  const { interest, cappedInterest, deductible, taxSaving, reduction } = useMemo(() => {
    const interestVal = firstYearInterest(loanAmount, apr, termMonths)
    const capped = Math.min(interestVal, 10000)
    const threshold = filingStatus === 'mfj' ? 200000 : 100000
    const over = Math.max(0, magi - threshold)
    const reductionVal = Math.ceil(over / 1000) * 200
    const deductibleVal = Math.max(0, capped - reductionVal)
    return {
      interest: interestVal,
      cappedInterest: capped,
      reduction: reductionVal,
      deductible: deductibleVal,
      taxSaving: deductibleVal * (bracket / 100),
    }
  }, [loanAmount, apr, termMonths, filingStatus, magi, bracket])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · run your own loan
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What is the car-loan interest deduction actually worth to you?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Loan amount</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(loanAmount)}</b>
          </div>
          <input type="range" min={0} max={150000} step={1000} value={loanAmount} onChange={e => setLoanAmount(+e.target.value)} className="w-full accent-orange-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>APR</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{apr.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={30} step={0.5} value={apr} onChange={e => setApr(+e.target.value)} className="w-full accent-orange-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Loan term</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{termMonths} months</b>
          </div>
          <input type="range" min={12} max={96} step={6} value={termMonths} onChange={e => setTermMonths(+e.target.value)} className="w-full accent-orange-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>MAGI</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(magi)}</b>
          </div>
          <input type="range" min={0} max={400000} step={5000} value={magi} onChange={e => setMagi(+e.target.value)} className="w-full accent-orange-600" />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {(['single', 'mfj'] as const).map(fs => (
              <button
                key={fs}
                onClick={() => setFilingStatus(fs)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  filingStatus === fs
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                }`}
              >
                {fs === 'single' ? 'Single' : 'Married filing jointly'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            Bracket
            <select
              value={bracket}
              onChange={e => setBracket(+e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white text-sm"
            >
              {[10, 12, 22, 24, 32, 35, 37].map(b => (
                <option key={b} value={b}>{b}%</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your first-year interest is about <strong>{money(interest)}</strong>. After the {money(10000)} cap
          {reduction > 0 && <> and a {money(reduction)} phase-out reduction</>}, you can deduct{' '}
          <strong className="text-orange-600 dark:text-orange-400">{money(deductible)}</strong> — worth roughly{' '}
          <strong>{money(taxSaving)}</strong> in actual tax savings.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">First-year interest</p>
            <AnimatedNumber value={interest} format={money} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Deductible after phase-out</p>
            <AnimatedNumber value={deductible} format={money} startFromZero className="font-serif text-xl font-bold text-orange-600 dark:text-orange-400" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Estimated tax saving</p>
            <AnimatedNumber value={taxSaving} format={money} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Estimate only — not financial or tax advice.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Car loan interest deduction — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Loan terms</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(loanAmount)} @ {apr.toFixed(1)}% / {termMonths}mo</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">First-year interest</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(interest)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Cap applied</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(cappedInterest)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Phase-out reduction</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(reduction)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Deductible</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(deductible)}</td></tr>
              <tr><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Tax saving</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(taxSaving)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
