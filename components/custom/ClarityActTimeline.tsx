'use client'

// Static, data-driven timeline of verified CLARITY Act (H.R. 3633) milestones.
// Status current as of August 14, 2026 — re-verify against congress.gov before relying on it.

const MILESTONES = [
  { date: '2025-07-17', label: 'House passes CLARITY Act', detail: '294–134, bipartisan vote on H.R. 3633.' },
  { date: '2025-09–2026-02', label: 'Senate Banking Committee markup', detail: 'Committee advances a version 15–9.' },
  { date: '2026-03-17', label: 'SEC & CFTC jointly classify 16 assets', detail: 'First formal "digital commodity" classification, done without CLARITY being law.' },
  { date: '2026-07-22', label: 'Merged Senate text released', detail: 'A combined 600+ page draft circulates in the Senate.' },
  { date: '2026-08-08', label: 'Senate adjourns without a vote', detail: 'Majority Leader Thune files cloture on the motion to proceed just before summer recess.' },
  { date: '2026-09-15', label: 'Scheduled cloture vote', detail: 'Procedural vote only — does not pass the bill. Needs 60 votes; Republicans hold 53 seats.' },
]

export default function ClarityActTimeline() {
  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Timeline · CLARITY Act (H.R. 3633)
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        Where the bill actually stands
      </p>

      <ol className="relative border-l-2 border-emerald-200 dark:border-emerald-900 pl-6 space-y-6">
        {MILESTONES.map((m, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-emerald-600 dark:bg-emerald-400 ring-4 ring-gray-50 dark:ring-gray-900/60" />
            <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400">{m.date}</p>
            <p className="font-serif text-base font-bold text-gray-900 dark:text-white">{m.label}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{m.detail}</p>
          </li>
        ))}
      </ol>

      <p className="text-xs text-gray-400 mt-6">
        Status current as of drafting (August 14, 2026) — verify against congress.gov before relying on it.
      </p>

      <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <caption className="sr-only">CLARITY Act milestones — data table</caption>
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Milestone</th>
            </tr>
          </thead>
          <tbody>
            {MILESTONES.map((m, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{m.date}</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{m.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
