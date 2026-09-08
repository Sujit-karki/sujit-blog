"use client";

import { useState } from "react";

interface EmbedSnippetProps {
  url: string;
  title: string;
}

export default function EmbedSnippet({ url, title }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="${url}" title="${title}" width="100%" height="720" style="border:1px solid #e5e7eb;border-radius:12px;" loading="lazy"></iframe>`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }

  return (
    <div className="not-prose rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-5">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Embed this tool on your site</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Free to embed — just copy the snippet below and paste it into your page.
      </p>
      <div className="relative group">
        <pre tabIndex={0} className="bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed">
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          className={`absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
