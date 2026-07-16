'use client'

import { useState, useRef } from 'react'

const RATE: number = 0.07
const SEED = 1000
const ANNUAL = 5000
const YEARS = 18
const W = 720, H = 380
const PAD_L = 58, PAD_R = 14, PAD_T = 14, PAD_B = 34
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B

function niceCeil(v: number): number {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  let m: number
  if (n <= 1) m = 1
  else if (n <= 2) m = 2
  else if (n <= 2.5) m = 2.5
  else if (n <= 5) m = 5
  else m = 10
  return m * p
}

function fmtFull(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function fmtK(v: number): string {
  if (v >= 1000) {
    const k = v / 1000
    return '$' + (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')) + 'k'
  }
  return '$' + Math.round(v)
}

function computeSeries(bracket: number) {
  const balance: number[] = [], basis: number[] = [], spendable: number[] = []
  for (let y = 0; y <= YEARS; y++) {
    const seedG = SEED * Math.pow(1 + RATE, y)
    const contribG = RATE === 0 ? ANNUAL * y : ANNUAL * ((Math.pow(1 + RATE, y) - 1) / RATE)
    const bal = seedG + contribG
    const bas = ANNUAL * y
    const taxable = bal - bas
    balance.push(bal)
    basis.push(bas)
    spendable.push(bas + taxable * (1 - bracket / 100))
  }
  return { balance, basis, spendable }
}

export default function GrowthVsSpendableChart() {
  const [bracket, setBracket] = useState(22)
  const [hoverY, setHoverY] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const series = computeSeries(bracket)
  const yMax = niceCeil(series.balance[YEARS])

  const toX = (y: number) => PAD_L + (y / YEARS) * PLOT_W
  const toYc = (v: number) => PAD_T + PLOT_H - (v / yMax) * PLOT_H

  const pathD = (arr: number[]) =>
    arr.map((v, y) => `${y === 0 ? 'M' : 'L'}${toX(y).toFixed(1)} ${toYc(v).toFixed(1)}`).join(' ')

  const getHoverYear = (clientX: number): number => {
    if (!svgRef.current) return 0
    const r = svgRef.current.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    return Math.max(0, Math.min(YEARS, Math.round(((px - PAD_L) / PLOT_W) * YEARS)))
  }

  const readout = [
    { label: 'Balance (nominal)', color: '#9ba6b2', val: series.balance[YEARS] },
    { label: 'Basis, never taxed', color: '#2563eb', val: series.basis[YEARS] },
    { label: 'Actually spendable', color: '#b9852a', val: series.spendable[YEARS] },
  ]

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · hover to explore, $5,000/yr maxed out
      </p>
      <p className="font-serif text-xl mb-4 text-gray-900 dark:text-white">
        The headline balance isn&apos;t the spendable balance
      </p>

      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto overflow-visible"
          aria-label="Trump Account nominal balance vs. actually spendable amount after tax"
        >
          {[0, 1, 2, 3, 4].map(t => {
            const val = (yMax * t) / 4
            const gy = toYc(val)
            return (
              <g key={t}>
                <line x1={PAD_L} y1={gy} x2={W - PAD_R} y2={gy} stroke="#e3e8e5" strokeWidth={1} />
                <text
                  x={PAD_L - 8} y={gy + 3}
                  textAnchor="end"
                  style={{ fontFamily: 'monospace', fontSize: 11, fill: '#9ba6b2' }}
                >
                  {fmtK(val)}
                </text>
              </g>
            )
          })}

          {[0, Math.round(YEARS / 2), YEARS].map(yy => (
            <text
              key={yy} x={toX(yy)} y={H - 12}
              textAnchor="middle"
              style={{ fontFamily: 'monospace', fontSize: 11, fill: '#9ba6b2' }}
            >
              {yy}y
            </text>
          ))}

          <path d={pathD(series.balance)} fill="none" stroke="#9ba6b2" strokeWidth={2.5} strokeDasharray="2 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD(series.basis)} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD(series.spendable)} fill="none" stroke="#b9852a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {hoverY !== null && (
            <>
              <line
                x1={toX(hoverY)} y1={PAD_T} x2={toX(hoverY)} y2={PAD_T + PLOT_H}
                stroke="#15202b" strokeWidth={1} strokeDasharray="3 3" opacity={0.35}
              />
              <circle cx={toX(hoverY)} cy={toYc(series.balance[hoverY])} r={4} fill="#9ba6b2" stroke="white" strokeWidth={2} />
              <circle cx={toX(hoverY)} cy={toYc(series.basis[hoverY])} r={4} fill="#2563eb" stroke="white" strokeWidth={2} />
              <circle cx={toX(hoverY)} cy={toYc(series.spendable[hoverY])} r={5} fill="#b9852a" stroke="white" strokeWidth={2} />
            </>
          )}

          <rect
            x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onMouseMove={e => setHoverY(getHoverYear(e.clientX))}
            onMouseLeave={() => setHoverY(null)}
            onTouchStart={e => e.touches[0] && setHoverY(getHoverYear(e.touches[0].clientX))}
            onTouchMove={e => e.touches[0] && setHoverY(getHoverYear(e.touches[0].clientX))}
          />
        </svg>

        {hoverY !== null && (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white rounded-lg px-3 py-2 text-xs font-mono whitespace-nowrap shadow-xl z-10"
            style={{
              left: `${(toX(hoverY) / W) * 100}%`,
              top: `${(toYc(series.balance[hoverY]) / H) * 100}%`,
              transform: 'translate(-50%, -110%)',
            }}
          >
            <div className="opacity-70 mb-1">Year {hoverY}</div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#9ba6b2' }} />
              {fmtFull(series.balance[hoverY])}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#b9852a' }} />
              {fmtFull(series.spendable[hoverY])}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#2563eb' }} />
              {fmtFull(series.basis[hoverY])}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
          <span>Tax bracket when withdrawn</span>
          <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{bracket}%</b>
        </div>
        <input
          type="range" min={10} max={32} step={1} value={bracket}
          onChange={e => setBracket(+e.target.value)}
          className="w-full accent-amber-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-px mt-5 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
        {readout.map(({ label, color, val }) => (
          <div key={label} className="bg-white dark:bg-gray-900 p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mb-2">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="hidden sm:inline leading-tight">{label}</span>
            </div>
            <div className="font-serif text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {fmtFull(val)}
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-3 leading-relaxed">
        Models a maxed-out $5,000/yr contribution plus the $1,000 seed, growing at 7% annually for 18 years. &quot;Actually spendable&quot; applies your chosen ordinary-income tax rate to everything above your basis (contributions) — the gap between the grey and gold lines is the tax bill the headline balance doesn&apos;t show you.
      </p>
    </div>
  )
}
