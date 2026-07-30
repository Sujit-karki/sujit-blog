'use client'

// Treasuries are exempt from state (not federal) income tax; bank interest is
// fully taxable — so the "same" headline yield isn't the same after-tax yield.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
function pct(v: number): string {
  return `${v.toFixed(2)}%`
}

export default function TreasuryVsBankYieldCalculator() {
  const [treasuryYield, setTreasuryYield] = useState(4.48)
  const [bankYield, setBankYield] = useState(4.0)
  const [federalBracket, setFederalBracket] = useState(24)
  const [stateRate, setStateRate] = useState(5.0)
  const [principal, setPrincipal] = useState(10000)

  const { afterTaxTreasury, afterTaxBank, dollarDiff } = useMemo(() => {
    const treasury = treasuryYield * (1 - federalBracket / 100)
    const bank = bankYield * (1 - federalBracket / 100 - stateRate / 100)
    return {
      afterTaxTreasury: treasury,
      afterTaxBank: bank,
      dollarDiff: (principal * (treasury - bank)) / 100,
    }
  }, [treasuryYield, bankYield, federalBracket, stateRate, principal])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · compare after-tax yield
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Treasury vs. bank account: what do you actually keep?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Treasury yield</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{treasuryYield.toFixed(2)}%</b>
          </div>
          <input type="range" min={0} max={10} step={0.01} value={treasuryYield} onChange={e => setTreasuryYield(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Bank / CD yield</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{bankYield.toFixed(2)}%</b>
          </div>
          <input type="range" min={0} max={10} step={0.01} value={bankYield} onChange={e => setBankYield(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Federal bracket</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{federalBracket}%</b>
          </div>
          <input type="range" min={0} max={37} step={1} value={federalBracket} onChange={e => setFederalBracket(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>State tax rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{stateRate.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={15} step={0.5} value={stateRate} onChange={e => setStateRate(+e.target.value)} className="w-full accent-sky-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Principal</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(principal)}</b>
          </div>
          <input type="range" min={0} max={1000000} step={5000} value={principal} onChange={e => setPrincipal(+e.target.value)} className="w-full accent-sky-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          After tax, the Treasury yields <strong className="text-sky-600 dark:text-sky-400">{pct(afterTaxTreasury)}</strong> versus{' '}
          <strong>{pct(afterTaxBank)}</strong> for the bank account — on {money(principal)}, that&apos;s about{' '}
          <strong className={dollarDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            {money(Math.abs(dollarDiff))} {dollarDiff >= 0 ? 'more' : 'less'}
          </strong>{' '}
          per year with the Treasury.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">After-tax Treasury yield</p>
            <AnimatedNumber value={afterTaxTreasury} format={pct} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">After-tax bank yield</p>
            <AnimatedNumber value={afterTaxBank} format={pct} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Annual after-tax difference</p>
            <AnimatedNumber value={dollarDiff} format={v => money(v)} startFromZero className="font-serif text-xl font-bold text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Estimate only — not financial or tax advice.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Treasury vs. bank yield — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Treasury yield</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{pct(treasuryYield)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Bank yield</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{pct(bankYield)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">After-tax Treasury</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{pct(afterTaxTreasury)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">After-tax bank</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{pct(afterTaxBank)}</td></tr>
              <tr><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Annual $ difference</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(dollarDiff)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
