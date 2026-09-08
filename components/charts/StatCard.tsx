"use client";

import AnimatedNumber from "@/components/custom/AnimatedNumber";

// MDX content is server-rendered, so props passed to this client component
// must be serializable — a preset name, not a formatter function.
type StatFormat = "number" | "currency" | "percent";

interface StatCardProps {
  label: string;
  value: number;
  format?: StatFormat;
  decimals?: number;
  sublabel?: string;
}

const FORMATTERS: Record<StatFormat, (v: number, decimals: number) => string> = {
  number: (v, d) => v.toLocaleString("en-US", { maximumFractionDigits: d }),
  currency: (v, d) => `$${v.toLocaleString("en-US", { maximumFractionDigits: d })}`,
  percent: (v, d) => `${v.toFixed(d)}%`,
};

export default function StatCard({
  label,
  value,
  format = "number",
  decimals = 0,
  sublabel,
}: StatCardProps) {
  return (
    <div className="not-prose inline-flex flex-col gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 px-5 py-4 my-2 mr-3">
      <span className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <AnimatedNumber
        value={value}
        format={(v) => FORMATTERS[format](v, decimals)}
        startFromZero
        className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
      />
      {sublabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</span>
      )}
    </div>
  );
}
