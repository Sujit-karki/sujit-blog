'use client'

// QCD limit for 2026 is $111,000 per person (IRS Notice 2025-67). RMD divisors
// are the IRS Uniform Lifetime Table (Treas. Reg. §1.401(a)(9)-9, effective 2022+).

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

const QCD_LIMIT_2026 = 111000

// IRS Uniform Lifetime Table divisors, ages 73-90
const DIVISORS: Record<number, number> = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
  81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7,
  89: 12.9, 90: 12.2,
}

const RATES = [12, 22, 24, 32, 35, 37]

export default function QcdRmdSavingsCalculator() {
  const [iraBalance, setIraBalance] = useState(500000)
  const [age, setAge] = useState(75)
  const [qcdAmount, setQcdAmount] = useState(30000)
  const [rate, setRate] = useState(22)

  const { rmd, divisor, qcdApplied, taxSaved, remainingRmd } = useMemo(() => {
    const clampedAge = Math.min(90, Math.max(73, age))
    const divisor = DIVISORS[clampedAge]
    const rmd = iraBalance / divisor
    const qcdApplied = Math.min(qcdAmount, QCD_LIMIT_2026)
    const taxSaved = qcdApplied * (rate / 100)
    const remainingRmd = Math.max(0, rmd - qcdApplied)
    return { rmd, divisor, qcdApplied, taxSaved, remainingRmd }
  }, [iraBalance, age, qcdAmount, rate])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · estimate your QCD tax savings
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much does a QCD save you versus taking your RMD as income?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>IRA balance (Dec 31 prior year)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(iraBalance)}</b>
          </div>
          <input type="range" min={0} max={5000000} step={10000} value={iraBalance} onChange={e => setIraBalance(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your age this year</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{age}</b>
          </div>
          <input type="range" min={73} max={90} step={1} value={age} onChange={e => setAge(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>QCD amount to charity</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(qcdAmount)}</b>
          </div>
          <input type="range" min={0} max={111000} step={1000} value={qcdAmount} onChange={e => setQcdAmount(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Marginal federal tax bracket</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{rate}%</b>
          </div>
          <input type="range" min={0} max={RATES.length - 1} step={1} value={RATES.indexOf(rate)} onChange={e => setRate(RATES[+e.target.value])} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your RMD is {money(rmd)}. A {money(qcdApplied)} QCD saves about{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{money(taxSaved)}</strong> versus taking it as taxable income.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">This year&apos;s RMD</p>
            <AnimatedNumber value={rmd} format={v => money(v)} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Federal tax saved via QCD</p>
            <AnimatedNumber value={taxSaved} format={v => money(v)} startFromZero className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Estimate only, not tax advice; QCD must go directly from your IRA custodian to a qualifying charity. Divisor: {divisor} (IRS Uniform Lifetime Table).
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">QCD and RMD estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">IRA balance</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(iraBalance)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Uniform Lifetime divisor (age {age})</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{divisor}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">This year&apos;s RMD</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(rmd)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">QCD applied (2026 limit $111,000)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(qcdApplied)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">RMD still to take as income</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(remainingRmd)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Federal tax saved via QCD</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(taxSaved)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
