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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const STATES = [
  { state: 'Montana', fee: 35 },
  { state: 'Kentucky', fee: 40 },
  { state: 'Arkansas', fee: 45 },
  { state: 'Colorado', fee: 50 },
  { state: 'New Mexico', fee: 50 },
  { state: 'California', fee: 70 },
  { state: 'Delaware', fee: 110 },
  { state: 'Florida', fee: 125 },
  { state: 'New York', fee: 200 },
  { state: 'Texas', fee: 300 },
  { state: 'Nevada', fee: 425 },
  { state: 'Massachusetts', fee: 500 },
]

const AVG = 132

export default function LLCFeesChart() {
  const data: ChartData<'bar'> = {
    labels: STATES.map(s => s.state),
    datasets: [
      {
        data: STATES.map(s => s.fee),
        backgroundColor: STATES.map(s =>
          s.fee <= AVG ? 'rgba(5,150,105,0.75)' : 'rgba(245,158,11,0.75)'
        ),
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: false,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `$${item.raw} one-time filing fee`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45, minRotation: 45 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(107,114,128,0.1)' },
        ticks: { color: '#6b7280', font: { size: 10 }, callback: v => `$${v}` },
        border: { display: false },
      },
    },
  }

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        14x difference, same paperwork
      </p>
      <p className="font-serif text-xl mb-1 text-gray-900 dark:text-white">
        LLC filing fees by state
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        National average: <span className="font-semibold text-gray-700 dark:text-gray-300">${AVG}</span> · lowest: Montana ($35) · highest: Massachusetts ($500)
      </p>

      <div className="h-64 sm:h-72">
        <Bar data={data} options={options} />
      </div>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(5,150,105,0.75)' }} />
          At or below average
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(245,158,11,0.75)' }} />
          Above average
        </span>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-3 leading-relaxed">
        One-time formation filing fee only. Some states add ongoing costs on top — California, for example, charges an $800 annual franchise tax regardless of the LLC&apos;s income, separate from its $70 filing fee. Always check your specific state&apos;s ongoing requirements before forming.
      </p>
    </div>
  )
}
