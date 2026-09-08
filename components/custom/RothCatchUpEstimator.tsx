'use client'

// SECURE 2.0 mandatory Roth catch-up: FICA wage threshold indexed to $150,000
// for 2026 (from the statutory $145,000) per IRS Notice 2025-67 (Nov 13, 2025).

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

const BRACKETS = [10, 12, 22, 24, 32, 35, 37]
const THRESHOLD = 150000

export default function RothCatchUpEstimator() {
  const [age, setAge] = useState(55)
  const [ficaWages, setFicaWages] = useState(160000)
  const [catchUp, setCatchUp] = useState(8000)
  const [bracket, setBracket] = useState(32)

  const catchUpCap = age >= 60 && age <= 63 ? 11250 : 8000

  const { subject, upfrontTax } = useMemo(() => {
    const isSubject = age >= 50 && ficaWages > THRESHOLD
    const amount = Math.min(catchUp, catchUpCap)
    return {
      subject: isSubject,
      upfrontTax: isSubject ? amount * (bracket / 100) : 0,
    }
  }, [age, ficaWages, catchUp, catchUpCap, bracket])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · check your own exposure
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Are you subject to the mandatory Roth catch-up in 2026?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Your age in 2026</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{age}</b>
          </div>
          <input
            type="range" min={50} max={75} step={1} value={age}
            onChange={e => setAge(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>2025 FICA wages (this employer)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(ficaWages)}</b>
          </div>
          <input
            type="range" min={0} max={400000} step={5000} value={ficaWages}
            onChange={e => setFicaWages(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Catch-up amount you plan to contribute</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(Math.min(catchUp, catchUpCap))}</b>
          </div>
          <input
            type="range" min={0} max={catchUpCap} step={250} value={Math.min(catchUp, catchUpCap)}
            onChange={e => setCatchUp(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {catchUpCap === 11250 ? "Age 60-63 'super catch-up' limit: $11,250" : 'Standard 50+ catch-up limit: $8,000'}
          </p>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Marginal federal tax bracket</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{bracket}%</b>
          </div>
          <input
            type="range" min={0} max={BRACKETS.length - 1} step={1}
            value={BRACKETS.indexOf(bracket)}
            onChange={e => setBracket(BRACKETS[+e.target.value])}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          {subject ? (
            <>
              At {money(ficaWages)} in FICA wages, your catch-up is{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">mandatory Roth</strong>. You&apos;ll pay about{' '}
              <strong>{money(upfrontTax)}</strong> upfront on {money(Math.min(catchUp, catchUpCap))} of catch-up contributions.
            </>
          ) : (
            <>
              At {money(ficaWages)} in FICA wages, you&apos;re <strong className="text-emerald-700 dark:text-emerald-400">not subject</strong> to the rule — your catch-up can still be pre-tax if you want.
            </>
          )}
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Subject to Roth catch-up?</p>
            <p className={`font-serif text-2xl font-bold ${subject ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {subject ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Upfront tax on Roth catch-up</p>
            <AnimatedNumber
              value={upfrontTax}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Estimate only — not financial or tax advice.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Roth catch-up estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">2025 FICA wages</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(ficaWages)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">2026 threshold</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(THRESHOLD)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Subject to rule</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{subject ? 'Yes' : 'No'}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Catch-up amount</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(Math.min(catchUp, catchUpCap))}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Marginal bracket</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{bracket}%</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Upfront tax if Roth</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(upfrontTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
