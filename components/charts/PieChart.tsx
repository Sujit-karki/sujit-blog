"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useIsDark } from "./useIsDark";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface PieSlice {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  title: string;
  description?: string;
  data: PieSlice[];
  unit?: string;
  height?: number;
}

const PALETTE = ["#059669", "#f59e0b", "#6366f1", "#0d9488", "#ef4444", "#8b5cf6"];

export default function PieChart({ title, description, data, unit = "", height = 320 }: PieChartProps) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";

  const chartData: ChartData<"doughnut"> = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((d, i) => d.color ?? PALETTE[i % PALETTE.length]),
        borderWidth: 0,
        // Stands in for Recharts' paddingAngle: a hairline gap between slices.
        spacing: 2,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    // Recharts used innerRadius 55% / outerRadius 85% of the container.
    cutout: "55%",
    radius: "85%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: textColor, boxWidth: 12, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: isDark ? "#111827" : "#ffffff",
        titleColor: isDark ? "#f1f5f9" : "#111827",
        bodyColor: isDark ? "#f1f5f9" : "#111827",
        borderColor: gridColor,
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (item) => `${item.label}: ${item.formattedValue}${unit}`,
        },
      },
    },
  };

  return (
    <figure className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <figcaption className="mb-4">
        <p className="font-serif text-lg text-gray-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </figcaption>

      <div style={{ height }}>
        <Doughnut
          data={chartData}
          options={options}
          role="img"
          aria-label={`${title} — doughnut chart`}
        />
      </div>

      {/* Visible data-table fallback. Chart.js draws to <canvas>, which is opaque
          to screen readers and to anything without JS, so this table is the
          accessible representation of the data — not a nicety. */}
      <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{title} — data table</caption>
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                Category
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                Value{unit ? ` (${unit})` : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{d.label}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                  {d.value}
                  {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
