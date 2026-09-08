'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default function FlipMarginCalculator() {
  const [sellPrice, setSellPrice] = useState(100)
  const [cost, setCost] = useState(60)
  const [feePct, setFeePct] = useState(13.6)
  const [shipping, setShipping] = useState(8)

  const result = useMemo(() => {
    const fees = (sellPrice * feePct) / 100 + 0.4
    const netProfit = sellPrice - cost - fees - shipping
    const seTax = Math.max(netProfit, 0) * 0.153
    const takeHome = netProfit - seTax
    const marginPct = sellPrice > 0 ? (takeHome / sellPrice) * 100 : 0
    return { fees, netProfit, seTax, takeHome, marginPct }
  }, [sellPrice, cost, feePct, shipping])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · what a flip actually pays
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        True margin after fees, shipping, and tax
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Sale price</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(sellPrice)}</b>
          </div>
          <input type="range" min={10} max={1000} step={5} value={sellPrice} onChange={(e) => setSellPrice(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>What you paid for it</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(cost)}</b>
          </div>
          <input type="range" min={0} max={800} step={5} value={cost} onChange={(e) => setCost(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Marketplace fee</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{feePct.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={20} step={0.1} value={feePct} onChange={(e) => setFeePct(+e.target.value)} className="w-full accent-red-500" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Shipping cost</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(shipping)}</b>
          </div>
          <input type="range" min={0} max={50} step={0.5} value={shipping} onChange={(e) => setShipping(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          That &quot;sticker profit&quot; of {money(sellPrice - cost)} shrinks to{' '}
          <strong className={result.takeHome >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400 dark:text-red-400'}>
            <AnimatedNumber value={result.takeHome} format={money} startFromZero />
          </strong>{' '}
          after fees, shipping, and self-employment tax — a true margin of{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.marginPct} format={(v) => v.toFixed(1) + '%'} />
          </strong>
          .
        </p>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Take-home vs. sale price</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.takeHome)} / {money(sellPrice)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${result.takeHome >= 0 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-500 dark:bg-red-400'}`}
              style={{ width: `${Math.min(100, Math.max(0, (result.takeHome / sellPrice) * 100))}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
          Fees vary by marketplace and category — confirm the current schedule before pricing a real listing. Assumes net profit is taxed at the full 15.3% self-employment rate; your actual rate may differ.
        </p>
      </div>
    </div>
  )
}
