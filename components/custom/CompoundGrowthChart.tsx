'use client'

import { useState, useRef } from 'react'

const RATE = 0.075
const RM = RATE / 12
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

function computeSeries(pmt: number, Y: number) {
  const cash: number[] = [], lump: number[] = [], both: number[] = []
  for (let y = 0; y <= Y; y++) {
    const g = Math.pow(1 + RM, 12 * y)
    const L = 1000 * g
    const A = pmt > 0 ? pmt * ((g - 1) / RM) : 0
    cash.push(1000)
    lump.push(L)
    both.push(L + A)
  }
  return { cash, lump, both }
}

export default function CompoundGrowthChart() {
  const [pmt, setPmt] = useState(100)
  const [years, setYears] = useState(30)
  const [hoverY, setHoverY] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const series = computeSeries(pmt, years)
  const yMax = niceCeil(series.both[years])

  const toX = (y: number) => PAD_L + (y / years) * PLOT_W
  const toYc = (v: number) => PAD_T + PLOT_H - (v / yMax) * PLOT_H

  const pathD = (arr: number[]) =>
    arr.map((v, y) => `${y === 0 ? 'M' : 'L'}${toX(y).toFixed(1)} ${toYc(v).toFixed(1)}`).join(' ')

  const getHoverYear = (clientX: number): number => {
    if (!svgRef.current) return 0
    const r = svgRef.current.getBoundingClientRect()
    const px = (clientX - r.left) / r.width * W
    return Math.max(0, Math.min(years, Math.round(((px - PAD_L) / PLOT_W) * years)))
  }

  const payoffCards = [
    { label: 'Cash, not invested', color: '#9ba6b2', val: series.cash[years] },
    { label: '$1,000 invested once', color: '#16795a', val: series.lump[years] },
    { label: '$1,000 + monthly', color: '#b9852a', val: series.both[years] },
  ]

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · drag to explore
      </p>
      <p className="font-serif text-xl mb-4 text-gray-900 dark:text-white">
        What your $1,000 can become
      </p>

      {/* SVG chart */}
      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto overflow-visible"
          aria-label="Compound growth chart"
        >
          {/* Grid lines + y-axis labels */}
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

          {/* X-axis labels */}
          {[0, Math.round(years / 2), years].map(yy => (
            <text
              key={yy} x={toX(yy)} y={H - 12}
              textAnchor="middle"
              style={{ fontFamily: 'monospace', fontSize: 11, fill: '#9ba6b2' }}
            >
              {yy}y
            </text>
          ))}

          {/* Series lines */}
          <path d={pathD(series.cash)} fill="none" stroke="#9ba6b2" strokeWidth={2.5} strokeDasharray="2 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD(series.lump)} fill="none" stroke="#16795a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD(series.both)} fill="none" stroke="#b9852a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover indicator */}
          {hoverY !== null && (
            <>
              <line
                x1={toX(hoverY)} y1={PAD_T} x2={toX(hoverY)} y2={PAD_T + PLOT_H}
                stroke="#15202b" strokeWidth={1} strokeDasharray="3 3" opacity={0.35}
              />
              <circle cx={toX(hoverY)} cy={toYc(series.cash[hoverY])} r={4} fill="#9ba6b2" stroke="white" strokeWidth={2} />
              <circle cx={toX(hoverY)} cy={toYc(series.lump[hoverY])} r={4} fill="#16795a" stroke="white" strokeWidth={2} />
              <circle cx={toX(hoverY)} cy={toYc(series.both[hoverY])} r={5} fill="#b9852a" stroke="white" strokeWidth={2} />
            </>
          )}

          {/* Invisible hit area for mouse/touch */}
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

        {/* Tooltip */}
        {hoverY !== null && (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white rounded-lg px-3 py-2 text-xs font-mono whitespace-nowrap shadow-xl z-10"
            style={{
              left: `${(toX(hoverY) / W) * 100}%`,
              top: `${(toYc(series.both[hoverY]) / H) * 100}%`,
              transform: 'translate(-50%, -110%)',
            }}
          >
            <div className="opacity-70 mb-1">Year {hoverY}</div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#b9852a' }} />
              {fmtFull(series.both[hoverY])}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#16795a' }} />
              {fmtFull(series.lump[hoverY])}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#9ba6b2' }} />
              {fmtFull(series.cash[hoverY])}
            </div>
          </div>
        )}
      </div>

      {/* Slider controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Added each month</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">${pmt}</b>
          </div>
          <input
            type="range" min={0} max={300} step={25} value={pmt}
            onChange={e => setPmt(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Years invested</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{years}</b>
          </div>
          <input
            type="range" min={10} max={40} step={1} value={years}
            onChange={e => setYears(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      {/* Payoff readout */}
      <div className="grid grid-cols-3 gap-px mt-5 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
        {payoffCards.map(({ label, color, val }) => (
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
        Assumes a 7.5% average annual return, compounded monthly — roughly the long-run average of a broad U.S. stock index. Markets don&apos;t move in straight lines; this shows the math of staying invested, not a guarantee.
      </p>
    </div>
  )
}
