interface KeyTakeawaysProps {
  items: string[];
  title?: string;
}

export default function KeyTakeaways({ items, title = "Key Takeaways" }: KeyTakeawaysProps) {
  return (
    <div className="not-prose my-8 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-400 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          {title}
        </h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-emerald-900 dark:text-emerald-100">
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
