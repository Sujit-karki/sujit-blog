interface ProsConsProps {
  pros: string[];
  cons: string[];
  prosTitle?: string;
  consTitle?: string;
}

export default function ProsCons({
  pros,
  cons,
  prosTitle = "Pros",
  consTitle = "Cons",
}: ProsConsProps) {
  return (
    <div className="not-prose my-8 grid sm:grid-cols-2 gap-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="font-bold text-emerald-800 dark:text-emerald-300">{prosTitle}</h4>
        </div>
        <ul className="space-y-2.5">
          {pros.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-900 dark:text-emerald-100">
              <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-red-50 dark:bg-red-950/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h4 className="font-bold text-red-800 dark:text-red-300">{consTitle}</h4>
        </div>
        <ul className="space-y-2.5">
          {cons.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-red-900 dark:text-red-100">
              <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
