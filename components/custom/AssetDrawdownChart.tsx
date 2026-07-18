'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const ASSETS = [
  { label: 'Bitcoin (BTC)', drawdown: -49, note: 'Peak $126,198 (Oct 2025) → ~$65,000 (Jul 15, 2026)' },
  { label: 'Ethereum (ETH)', drawdown: -60, note: 'Peak ~$4,700 (Oct 2025) → ~$1,890 (Jul 15, 2026)' },
  { label: 'XRP', drawdown: -63, note: 'Peak-to-trough decline → ~$1.10 (Jul 15, 2026)' },
  { label: 'Solana (SOL)', drawdown: -75, note: 'Peak ~$260 (Oct 2025) → ~$77 (Jul 15, 2026), worst of the majors' },
]

export default function AssetDrawdownChart() {
  const data: ChartData<'bar'> = {
    labels: ASSETS.map(a => a.label),
    datasets: [
      {
        data: ASSETS.map(a => a.drawdown),
        backgroundColor: ASSETS.map(a =>
          a.label.startsWith('Bitcoin') ? 'rgba(245,158,11,0.8)' : 'rgba(99,102,241,0.75)'
        ),
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 40,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: false,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `${item.raw}% — ${ASSETS[item.dataIndex].note}`,
        },
      },
    },
    scales: {
      x: {
        min: -80,
        max: 0,
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
        Peak (Oct 2025) to current (Jul 15, 2026)
      </p>
      <p className="font-serif text-xl mb-1 text-gray-900 dark:text-white">
        Bitcoin actually fell the least
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Bitcoin is down roughly{' '}
        <AnimatedNumber value={49} format={v => `${Math.round(v)}%`} startFromZero className="font-semibold text-gray-700 dark:text-gray-300" />
        {' '}from its peak — every major altcoin fell harder
      </p>

      <div className="h-56 sm:h-64">
        <Bar data={data} options={options} />
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-3 leading-relaxed">
        Drawdowns are approximate and rounded, measured from each asset&apos;s October 2025 cycle peak to its July 15, 2026 price. Actual peak and trough timing varies slightly by asset and data source.
      </p>
    </ChartCard>
  )
}
