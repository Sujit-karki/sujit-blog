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
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const SURPRISE = [
  { label: 'AI-hardware exporters', sub: 'Taiwan, Korea, Thailand, Malaysia', value: 4.4 },
  { label: 'Rest of world', sub: 'Everyone else', value: -0.3 },
]

const FORECASTS = [
  { label: 'Malaysia', value: 4.7 },
  { label: 'China', value: 4.6 },
  { label: 'India', value: 6.4 },
  { label: 'Korea', value: 2.6 },
  { label: 'US', value: 2.3 },
  { label: 'Global', value: 3.0 },
  { label: 'Euro area', value: 0.6 },
]

function makeGradient(canvasCtx: CanvasRenderingContext2D, chartArea: { left: number; right: number }, colorA: string, colorB: string) {
  const gradient = canvasCtx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
  gradient.addColorStop(0, colorA)
  gradient.addColorStop(1, colorB)
  return gradient
}

export default function GrowthDivergenceChart() {
  const surpriseData: ChartData<'bar'> = {
    labels: SURPRISE.map(s => s.label),
    datasets: [
      {
        data: SURPRISE.map(s => s.value),
        backgroundColor: (ctx: ScriptableContext<'bar'>) => {
          const { chart, dataIndex } = ctx
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return 'rgba(99,102,241,0.7)'
          const positive = SURPRISE[dataIndex]?.value >= 0
          return positive
            ? makeGradient(canvasCtx, chartArea, 'rgba(5,150,105,0.55)', 'rgba(16,185,129,0.95)')
            : makeGradient(canvasCtx, chartArea, 'rgba(239,68,68,0.55)', 'rgba(220,38,38,0.95)')
        },
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 44,
      },
    ],
  }

  const forecastData: ChartData<'bar'> = {
    labels: FORECASTS.map(f => f.label),
    datasets: [
      {
        data: FORECASTS.map(f => f.value),
        backgroundColor: (ctx: ScriptableContext<'bar'>) => {
          const { chart } = ctx
          const { ctx: canvasCtx, chartArea } = chart
          if (!chartArea) return 'rgba(99,102,241,0.7)'
          return makeGradient(canvasCtx, chartArea, 'rgba(99,102,241,0.55)', 'rgba(79,70,229,0.95)')
        },
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 32,
      },
    ],
  }

  const baseOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
      delay: (ctx) => (ctx.type === 'data' ? ctx.dataIndex * 120 : 0),
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: false,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: { label: item => `${item.raw}%` },
      },
    },
    scales: {
      x: {
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
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        IMF World Economic Outlook, July 2026
      </p>
      <p className="font-serif text-xl mb-1 text-gray-900 dark:text-white">
        The AI-hardware growth divergence
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        AI-hardware exporters beat Q1 2026 growth forecasts by{' '}
        <AnimatedNumber value={4.4} format={v => `+${v.toFixed(1)}pp`} startFromZero className="font-semibold text-emerald-700 dark:text-emerald-400" />
        {' '}while the rest of the world missed by{' '}
        <AnimatedNumber value={-0.3} format={v => `${v.toFixed(1)}pp`} startFromZero className="font-semibold text-red-600 dark:text-red-400 dark:text-red-400" />
      </p>

      <div className="h-28">
        <Bar data={surpriseData} options={baseOptions} />
      </div>

      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mt-6 mb-3">
        2026 GDP growth forecasts by economy
      </p>
      <div className="h-64">
        <Bar data={forecastData} options={baseOptions} />
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
        Seasonally adjusted annualized growth surprise, Q1 2026 (top four net exporters of AI-related hardware: Taiwan, Korea, Thailand, Malaysia). Country forecasts are IMF July 2026 WEO update figures; euro area is a midpoint approximation. Source: IMF, July 8, 2026.
      </p>
    </ChartCard>
  )
}
