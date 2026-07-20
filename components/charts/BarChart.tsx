"use client";

import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useIsDark } from "./useIsDark";

export interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

export interface BarChartProps {
  title: string;
  description?: string;
  data: Record<string, number | string>[];
  xKey: string;
  series: BarSeries[];
  unit?: string;
  height?: number;
  /** Per-bar colors for a single-series chart (e.g. highlighting one category) */
  colorByCategory?: boolean;
}

const PALETTE = ["#059669", "#6366f1", "#f59e0b", "#ef4444", "#0d9488"];

export default function BarChart({
  title,
  description,
  data,
  xKey,
  series,
  unit = "",
  height = 320,
  colorByCategory = false,
}: BarChartProps) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <figure className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <figcaption className="mb-4">
        <p className="font-serif text-lg text-gray-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </figcaption>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart
            data={data}
            accessibilityLayer
            margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis tick={{ fill: textColor, fontSize: 12 }} tickLine={false} axisLine={false} unit={unit} />
            <Tooltip
              contentStyle={{
                background: isDark ? "#111827" : "#ffffff",
                border: `1px solid ${gridColor}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: isDark ? "#f1f5f9" : "#111827" }}
              cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
            />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color ?? PALETTE[i % PALETTE.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {colorByCategory &&
                  data.map((_, di) => (
                    <Cell key={`cell-${di}`} fill={PALETTE[di % PALETTE.length]} />
                  ))}
              </Bar>
            ))}
          </RBarChart>
        </ResponsiveContainer>
      </div>

      {/* Visible data-table fallback: readable without JS/canvas, and screen-reader friendly
          alongside Recharts' own accessibilityLayer keyboard nav on the chart itself. */}
      <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{title} — data table</caption>
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                {xKey}
              </th>
              {series.map((s) => (
                <th
                  key={s.key}
                  className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
                >
                  {s.label}
                  {unit ? ` (${unit})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{row[xKey]}</td>
                {series.map((s) => (
                  <td key={s.key} className="px-3 py-2 text-gray-600 dark:text-gray-300">
                    {row[s.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
