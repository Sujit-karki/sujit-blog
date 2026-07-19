'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartData, ChartOptions, ScriptableContext } from 'chart.js'
import ChartCard from './ChartCard'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

// Illustrative approximate IT-sector look-through weight per fund — not a
// precise holdings-level analysis. Used to visualize relative tilt only.
const FUNDS = [
  { label: 'S&P 500 core (SPY)', weight: 33, note: 'Plain cap-weighted index' },
  { label: 'Mid-Cap (IJH)', weight: 18, note: 'S&P MidCap 400' },
  { label: 'Ex-Top-100 (XOEF)', weight: 15, note: 'Top 100 companies removed' },
  { label: 'Equal Weight (RSP)', weight: 14, note: 'Every name ~0.2%' },
  { label: "Developed Int'l (VEA)", weight: 9, note: '~4,000 non-US companies' },
  { label: 'Value (VTV)', weight: 9, note: 'Financials, energy, healthcare tilt' },
  { label: 'Dividend Aristocrats (NOBL)', weight: 9, note: '25+ years of raises' },
].sort((a, b) => b.weight - a.weight)

export default function FundTechExposureChart() {
  const data: ChartData<'bar'> = {
    labels: FUNDS.map(f => f.label),
    datasets: [
      {
        data: FUNDS.map(f => f.weight),
        backgroundColor: (ctx: ScriptableContext<'bar'>) => {
          const { chart, dataIndex } = ctx
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return 'rgba(99,102,241,0.7)'
          const isCore = dataIndex === 0
          const gradient = canvasCtx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
          if (isCore) {
            gradient.addColorStop(0, 'rgba(239,68,68,0.55)')
            gradient.addColorStop(1, 'rgba(220,38,38,0.95)')
          } else {
            gradient.addColorStop(0, 'rgba(5,150,105,0.55)')
            gradient.addColorStop(1, 'rgba(16,185,129,0.95)')
          }
          return gradient
        },
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 30,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 850,
      easing: 'easeOutQuart',
      delay: (ctx) => (ctx.type === 'data' ? ctx.dataIndex * 90 : 0),
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: false,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `${item.raw}% — ${FUNDS[item.dataIndex].note}`,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 36,
        grid: { color: 'rgba(107,114,128,0.1)' },
        ticks: { color: '#6b7280', font: { size: 10 }, callback: v => `${v}%` },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
        border: { display: false },
      },
    },
  }

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Approximate IT-sector look-through weight
      </p>
      <p className="font-serif text-xl mb-4 text-gray-900 dark:text-white">
        Every satellite fund owns less tech than your core
      </p>

      <div className="h-72 sm:h-80">
        <Bar data={data} options={options} />
      </div>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(220,38,38,0.85)' }} />
          Market-cap core
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(16,185,129,0.85)' }} />
          Tech-diluting satellites
        </span>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-3 leading-relaxed">
        Illustrative, not a precise holdings-level analysis — for comparing relative tilt only. XOEF&apos;s figure is a rough estimate since it launched July 2025 and its sector mix will drift as it grows.
      </p>
    </ChartCard>
  )
}
