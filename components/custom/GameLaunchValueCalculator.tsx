'use client'

// Rough, illustrative unit-economics model for a AAA game launch. Ignores
// platform revenue splits by title, tax, currency mix, refunds, and any
// post-launch recurring spend (GTA Online-style microtransactions) that in
// reality dwarfs the base-game sale over a long tail. Treat every output
// here as a napkin-math sketch, not a real P&L.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'
import LineChart from '@/components/charts/LineChartLazy'

function moneyB(v: number): string {
  return '$' + (v / 1000).toFixed(2) + 'B'
}
function moneyM(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US') + 'M'
}
function units(v: number): string {
  return v.toFixed(0) + 'M units'
}

// Illustrative assumption: roughly how much of gross revenue survives
// platform storefront cuts, distribution, and non-development marketing
// spend before it counts as "profit" against the dev+marketing budget.
// Real deals vary by publisher size, platform, and region — this is a
// simplification, not Take-Two's actual reported margin structure.
const ILLUSTRATIVE_NET_TAKE_RATE = 0.7

// Approximate, rounded GTA V cumulative units-sold curve by year since its
// September 2013 launch, compiled from widely reported public shipment
// milestones (not exact quarterly figures — treat as illustrative shape).
const GTA_V_CURVE_M = [34, 60, 70, 75, 90, 100, 110, 120, 140, 150, 165, 185, 205, 230]
const GTA_V_LIFETIME_M = 230

export default function GameLaunchValueCalculator() {
  const [unitsM, setUnitsM] = useState(100)
  const [price, setPrice] = useState(79.99)
  const [budgetM, setBudgetM] = useState(2000)

  const { grossRevenueM, breakevenUnitsM, profitM, series } = useMemo(() => {
    const gross = unitsM * price
    const breakeven = budgetM / price
    const netRevenue = gross * ILLUSTRATIVE_NET_TAKE_RATE
    const profit = netRevenue - budgetM
    const scale = unitsM / GTA_V_LIFETIME_M
    const s = GTA_V_CURVE_M.map((v, y) => ({
      year: y === 0 ? 'Launch yr' : `Yr ${y}`,
      'GTA V (actual, approx.)': v,
      'This game (your assumption)': Math.round(v * scale),
    }))
    return { grossRevenueM: gross, breakevenUnitsM: breakeven, profitM: profit, series: s }
  }, [unitsM, price, budgetM])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · napkin-math only
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What would a AAA launch need to sell to pencil out?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Units sold assumption</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{units(unitsM)}</b>
          </div>
          <input
            type="range" min={5} max={250} step={5} value={unitsM}
            onChange={e => setUnitsM(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Price point</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">${price.toFixed(2)}</b>
          </div>
          <input
            type="range" min={39.99} max={99.99} step={10} value={price}
            onChange={e => setPrice(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">GTA VI&apos;s confirmed standard price is $79.99; Ultimate Edition is $99.99.</p>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Estimated dev + marketing budget</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{moneyM(budgetM)}</b>
          </div>
          <input
            type="range" min={500} max={3000} step={50} value={budgetM}
            onChange={e => setBudgetM(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            $2B is a media-reported estimate for GTA VI, not a figure confirmed in Take-Two&apos;s own filings.
          </p>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Estimated gross revenue</p>
            <AnimatedNumber
              value={grossRevenueM}
              format={v => moneyB(v)}
              startFromZero
              className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Breakeven units</p>
            <AnimatedNumber
              value={breakevenUnitsM}
              format={v => units(v)}
              startFromZero
              className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Rough profit estimate</p>
            <AnimatedNumber
              value={profitM}
              format={v => (v < 0 ? '−' : '') + moneyB(Math.abs(v))}
              startFromZero
              className={`font-serif text-xl sm:text-2xl font-bold ${profitM < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}
            />
          </div>
        </div>

        <LineChart
          title="Cumulative units sold: your assumption vs. GTA V's actual curve"
          description="GTA V's curve is an approximate, rounded shape from public shipment milestones. The comparison line scales that same shape to your units-sold assumption — it is illustrative, not a prediction of how any future title would actually ramp."
          data={series}
          xKey="year"
          series={[
            { key: 'GTA V (actual, approx.)', label: 'GTA V (actual, approx.)', color: '#6366f1' },
            { key: 'This game (your assumption)', label: 'This game (your assumption)', color: '#059669' },
          ]}
          unit="M"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
          Gross revenue is units × price, before any platform, distribution, tax, or currency effects. The profit estimate assumes a made-up {Math.round(ILLUSTRATIVE_NET_TAKE_RATE * 100)}% of gross revenue survives storefront cuts and non-development marketing costs — a simplification, not Take-Two&apos;s real margin structure — and it ignores years of post-launch spending inside the game (GTA Online-style microtransactions), which is where a lot of the real money has historically been made.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Estimate only — not financial or investment advice.</p>
      </div>
    </div>
  )
}
