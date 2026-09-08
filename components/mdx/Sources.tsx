interface SourceItem {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
}

interface SourcesProps {
  items: SourceItem[];
}

export default function Sources({ items }: SourcesProps) {
  return (
    <div className="not-prose my-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
        Sources &amp; References
      </h3>
      <ol className="space-y-2">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-gray-500 dark:text-gray-400 shrink-0 w-5 text-right">{i + 1}.</span>
            <div className="min-w-0">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline font-medium break-words"
              >
                {s.title}
              </a>
              {(s.publisher || s.date) && (
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}— {[s.publisher, s.date].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
