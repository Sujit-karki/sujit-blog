'use client'

// Illustrates the 1099-DA basis gap: 2025 forms report gross proceeds only,
// so filing without your own cost-basis records overstates the taxable gain.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function CryptoBasisGapEstimator() {
  const [proceeds, setProceeds] = useState(100000)
  const [costBasis, setCostBasis] = useState(40000)
  const [holdingLongTerm, setHoldingLongTerm] = useState(true)
  const [ltRate, setLtRate] = useState(15)
  const [stRate, setStRate] = useState(24)

  const { taxIfProceedsOnly, taxOnActualGain, overpaymentAvoided, gain } = useMemo(() => {
    const rate = (holdingLongTerm ? ltRate : stRate) / 100
    const actualGain = Math.max(0, proceeds - costBasis)
    const proceedsOnlyTax = proceeds * rate
    const actualTax = actualGain * rate
    return {
      gain: actualGain,
      taxIfProceedsOnly: proceedsOnlyTax,
      taxOnActualGain: actualTax,
      overpaymentAvoided: proceedsOnlyTax - actualTax,
    }
  }, [proceeds, costBasis, holdingLongTerm, ltRate, stRate])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · check your own basis gap
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much would filing from a $0-basis 1099-DA cost you?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Gross proceeds (1099-DA)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(proceeds)}</b>
          </div>
          <input type="range" min={0} max={500000} step={5000} value={proceeds} onChange={e => setProceeds(+e.target.value)} className="w-full accent-violet-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your actual cost basis</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(costBasis)}</b>
          </div>
          <input type="range" min={0} max={500000} step={5000} value={costBasis} onChange={e => setCostBasis(+e.target.value)} className="w-full accent-violet-600" />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {[{ v: true, label: 'Long-term' }, { v: false, label: 'Short-term' }].map(opt => (
              <button
                key={String(opt.v)}
                onClick={() => setHoldingLongTerm(opt.v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  holdingLongTerm === opt.v
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {holdingLongTerm ? (
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              LT rate
              <select value={ltRate} onChange={e => setLtRate(+e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white text-sm">
                {[0, 15, 20].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </label>
          ) : (
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              ST rate
              <input type="number" min={0} max={37} value={stRate} onChange={e => setStRate(+e.target.value)} className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white text-sm" />%
            </label>
          )}
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your actual gain is <strong>{money(gain)}</strong>. Filing from the form&apos;s $0 basis would tax you on all {money(proceeds)} —
          correcting it with your own records avoids overpaying by about{' '}
          <strong className="text-violet-600 dark:text-violet-400">{money(overpaymentAvoided)}</strong>.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Tax if filed from $0 basis</p>
            <AnimatedNumber value={taxIfProceedsOnly} format={money} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Tax on actual gain</p>
            <AnimatedNumber value={taxOnActualGain} format={money} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Overpayment avoided</p>
            <AnimatedNumber value={overpaymentAvoided} format={money} startFromZero className="font-serif text-xl font-bold text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Estimate only — not financial or tax advice.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Crypto basis gap — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Proceeds</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(proceeds)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Cost basis</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(costBasis)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Actual gain</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(gain)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Rate applied</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{holdingLongTerm ? ltRate : stRate}%</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Tax if $0 basis</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(taxIfProceedsOnly)}</td></tr>
              <tr><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Tax on actual gain</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(taxOnActualGain)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
