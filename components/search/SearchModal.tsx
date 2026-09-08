"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { useSearchIndex } from "./useSearchIndex";
import { useFuseSearch } from "./useFuseSearch";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const reduce = useReducedMotion();

  const index = useSearchIndex();
  const results = useFuseSearch(index, query);

  function closeModal() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        closeModal();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function goTo(slug: string) {
    closeModal();
    router.push(`/posts/${slug}`);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      goTo(results[activeIndex].slug);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-block text-[10px] font-mono border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-500 dark:text-gray-400">
          &#8984;K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.15 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[100]"
              onClick={closeModal}
            />
            <m.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={{ opacity: 0, y: reduce ? 0 : -12, scale: reduce ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : -12, scale: reduce ? 1 : 0.98 }}
              transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
              className="fixed left-1/2 top-24 -translate-x-1/2 w-[min(560px,92vw)] z-[101] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search posts…"
                  className="w-full py-3.5 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400 focus:outline-none"
                />
                <kbd className="text-[10px] font-mono border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-500 dark:text-gray-400 shrink-0">
                  Esc
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto py-2">
                {query.trim() && results.length === 0 && (
                  <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                )}
                {results.map((r, i) => (
                  <button
                    key={r.slug}
                    onClick={() => goTo(r.slug)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 ${
                      i === activeIndex
                        ? "bg-emerald-50 dark:bg-emerald-950/40"
                        : ""
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {r.category}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {r.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {r.description}
                    </span>
                  </button>
                ))}
              </div>

              {query.trim() && results.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
                  <button
                    onClick={() => {
                      const q = query;
                      closeModal();
                      router.push(`/search?q=${encodeURIComponent(q)}`);
                    }}
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
                  >
                    View all results for &ldquo;{query}&rdquo; →
                  </button>
                </div>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
