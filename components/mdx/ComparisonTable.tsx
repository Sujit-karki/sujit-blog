interface ComparisonTableProps {
  headers: string[];
  rows: string[][];
  caption?: string;
  highlightCol?: number; // 0-indexed column to highlight (usually the "winner")
}

export default function ComparisonTable({
  headers,
  rows,
  caption,
  highlightCol,
}: ComparisonTableProps) {
  return (
    <div className="not-prose my-8">
      {caption && (
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          {caption}
        </p>
      )}
      <div tabIndex={0} className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap ${
                    highlightCol === i
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                      : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 text-gray-600 dark:text-gray-300 ${
                      ci === 0 ? "font-medium text-gray-800 dark:text-gray-200" : ""
                    } ${
                      highlightCol === ci
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-medium"
                        : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
