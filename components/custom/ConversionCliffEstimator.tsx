'use client'

// IRMAA tier thresholds and surcharge amounts below are commonly-cited public
// estimates (income-lab, ustax.tools) and are explicitly UNVERIFIED against
// CMS's official 2026 tables as of this writing — treat every dollar figure
// here as a placeholder pending CMS confirmation, not a citable number.
// IRMAA uses a two-year MAGI lookback, so a conversion made this year can
// raise premiums two years out. Not tax or Medicare advice.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

type Filing = 'single' | 'mfj'

// [MAGI threshold, annual Part B+D surcharge per person] — PLACEHOLDER figures.
const TIERS_SINGLE: [number, number][] = [
  [0, 0],
  [109000, 888],
  [137000, 2220],
  [171000, 3552],
  [205000, 4884],
  [500000, 5328],
]
const TIERS_MFJ: [number, number][] = TIERS_SINGLE.map(([t, s]) => [t === 0 ? 0 : t * 2, s])

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function tierFor(magi: number, tiers: [number, number][]) {
  let current = tiers[0]
  for (const t of tiers) {
    if (magi >= t[0]) current = t
  }
  return current
}

export default function ConversionCliffEstimator() {
  const [magiBefore, setMagiBefore] = useState(130000)
  const [conversion, setConversion] = useState(50000)
  const [marginalRate, setMarginalRate] = useState(22)
  const [filing, setFiling] = useState<Filing>('single')

  const result = useMemo(() => {
    const tiers = filing === 'single' ? TIERS_SINGLE : TIERS_MFJ
    const newMagi = magiBefore + conversion
    const conversionTax = conversion * (marginalRate / 100)
    const beforeTier = tierFor(magiBefore, tiers)
    const afterTier = tierFor(newMagi, tiers)
    const irmaaFlag = afterTier[0] > beforeTier[0]
    const addedSurcharge = Math.max(0, afterTier[1] - beforeTier[1])
    return { newMagi, conversionTax, irmaaFlag, addedSurcharge, afterTier }
  }, [magiBefore, conversion, marginalRate, filing])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · Roth conversion + IRMAA
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Does this conversion push you over an IRMAA cliff?
      </p>

      <div className="mb-2 rounded-lg border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Placeholder tier data</p>
        <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">IRMAA thresholds and surcharges shown are commonly-cited estimates, not confirmed against CMS&apos;s official tables. Verify at medicare.gov before relying on this.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 my-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>MAGI before conversion</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(magiBefore)}</b>
          </div>
          <input type="range" min={0} max={400000} step={1000} value={magiBefore} onChange={(e) => setMagiBefore(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Roth conversion amount</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(conversion)}</b>
          </div>
          <input type="range" min={0} max={200000} step={1000} value={conversion} onChange={(e) => setConversion(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Marginal tax rate</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{marginalRate}%</b>
          </div>
          <input type="range" min={10} max={37} step={1} value={marginalRate} onChange={(e) => setMarginalRate(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">Filing status</p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {(['single', 'mfj'] as Filing[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiling(f)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${filing === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {f === 'mfj' ? 'Married filing jointly' : 'Single'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Converting {money(conversion)} costs about{' '}
          <strong>
            <AnimatedNumber value={result.conversionTax} format={(v) => money(v)} startFromZero />
          </strong>{' '}
          in tax this year and brings your MAGI to {money(result.newMagi)}.{' '}
          {result.irmaaFlag ? (
            <>
              That crosses an IRMAA tier — expect roughly{' '}
              <strong className="text-red-600 dark:text-red-400">
                <AnimatedNumber value={result.addedSurcharge} format={(v) => money(v) + '/yr'} startFromZero />
              </strong>{' '}
              in added Medicare premium surcharge, starting two years from now.
            </>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">This stays within your current IRMAA tier — no added surcharge modeled.</span>
          )}
        </p>

        <div className="overflow-x-auto mt-2 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Conversion cliff estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Conversion tax (this year)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(result.conversionTax)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">MAGI after conversion</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(result.newMagi)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Crosses an IRMAA tier?</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{result.irmaaFlag ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Added surcharge (2 years out, per person)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(result.addedSurcharge)}/yr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          A Roth conversion is irreversible since the TCJA eliminated recharactization. IRMAA applies a two-year MAGI lookback, so 2026 income affects 2028 premiums. Not tax or Medicare advice — verify current thresholds at medicare.gov.
        </p>
      </div>
    </div>
  )
}
