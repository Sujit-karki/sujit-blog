'use client'

import { useState } from 'react'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function BudgetCalculator() {
  const [income, setIncome] = useState(5000)
  const [wantsPct, setWantsPct] = useState(30)
  const [savingsPct, setSavingsPct] = useState(20)

  const needsPct = Math.max(0, 100 - wantsPct - savingsPct)
  const needs = (income * needsPct) / 100
  const wants = (income * wantsPct) / 100
  const savings = (income * savingsPct) / 100
  const isClassic = needsPct === 50 && wantsPct === 30 && savingsPct === 20

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · set your situation
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Split your monthly income
      </p>

      {/* Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Monthly take-home income</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(income)}</b>
          </div>
          <input
            type="range" min={2000} max={12000} step={100} value={income}
            onChange={e => setIncome(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Wants</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{wantsPct}%</b>
          </div>
          <input
            type="range" min={10} max={40} step={1} value={wantsPct}
            onChange={e => setWantsPct(+e.target.value)}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Savings &amp; debt payoff</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{savingsPct}%</b>
          </div>
          <input
            type="range" min={5} max={40} step={1} value={savingsPct}
            onChange={e => setSavingsPct(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
      </div>

      {/* Result */}
      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-xl sm:text-2xl leading-snug mb-4 text-gray-900 dark:text-white">
          {isClassic ? (
            <>That&apos;s the <strong>classic 50/30/20 split.</strong></>
          ) : (
            <>Your split is <strong>{needsPct}/{wantsPct}/{savingsPct}</strong> — needs, wants, savings.</>
          )}
        </p>

        {/* Needs bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Needs — {needsPct}%</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(needs)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${needsPct}%` }}
            />
          </div>
        </div>

        {/* Wants bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Wants — {wantsPct}%</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(wants)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-500"
              style={{ width: `${wantsPct}%` }}
            />
          </div>
        </div>

        {/* Savings bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Savings &amp; debt — {savingsPct}%</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(savings)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-amber-500 dark:bg-amber-400 rounded-lg transition-all duration-500"
              style={{ width: `${savingsPct}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          {isClassic
            ? 'Elizabeth Warren\'s original rule: 50% needs, 30% wants, 20% savings and debt payoff.'
            : 'Drag the sliders back to 30% wants and 20% savings to see the classic split.'}
          {' '}Needs is whatever is left after wants and savings.
        </p>
      </div>
    </div>
  )
}
