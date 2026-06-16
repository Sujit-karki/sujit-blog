'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { AiSummaryData, Sentiment } from '@/lib/ai-summary'

interface SentimentConfig {
  label: string
  icon: string
  textColor: string
  barColor: string
  bgClass: string
  borderClass: string
}

const SENTIMENT: Record<Sentiment, SentimentConfig> = {
  bullish: {
    label: 'Bullish',
    icon: '↑',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
    bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/20',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
  },
  bearish: {
    label: 'Bearish',
    icon: '↓',
    textColor: 'text-red-600 dark:text-red-400',
    barColor: 'bg-red-500',
    bgClass: 'bg-red-50/80 dark:bg-red-950/20',
    borderClass: 'border-red-200 dark:border-red-800/60',
  },
  neutral: {
    label: 'Neutral',
    icon: '→',
    textColor: 'text-amber-600 dark:text-amber-400',
    barColor: 'bg-amber-500',
    bgClass: 'bg-amber-50/80 dark:bg-amber-950/20',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
  },
}

export default function AiSummaryCard({ data }: { data: AiSummaryData }) {
  const [open, setOpen] = useState(true)
  const reduce = useReducedMotion()
  const cfg = SENTIMENT[data.sentiment]

  return (
    <div
      className={`rounded-2xl border ${cfg.borderClass} ${cfg.bgClass} overflow-hidden mb-8 not-prose`}
    >
      {/* ── Header / toggle ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 group text-left"
        aria-expanded={open}
        aria-controls="ai-summary-body"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="text-white text-[11px] font-black leading-none">AI</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              AI Summary
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
              Key takeaways &amp; market sentiment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-3 shrink-0">
          <span
            className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.borderClass} ${cfg.textColor} bg-white/60 dark:bg-gray-900/50`}
          >
            {cfg.icon}&nbsp;{cfg.label}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: 'easeInOut' }}
            className="text-gray-400 text-sm"
            aria-hidden="true"
          >
            ↓
          </motion.span>
        </div>
      </button>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="ai-summary-body"
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: reduce ? 0 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: reduce ? 0 : 0.2 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 border-t border-gray-200/60 dark:border-gray-700/40 space-y-5">
              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {/* Sentiment meter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Sentiment
                    </span>
                    <span className={`text-[11px] font-black ${cfg.textColor}`}>
                      {cfg.icon}&nbsp;{data.sentimentScore}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${cfg.barColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.sentimentScore}%` }}
                      transition={{
                        duration: reduce ? 0 : 0.8,
                        delay: reduce ? 0 : 0.15,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${cfg.textColor}`}>{cfg.label}</p>
                </div>

                {/* Impact score */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Impact Score
                    </span>
                    <span className="text-[11px] font-black text-violet-600 dark:text-violet-400">
                      {data.impactScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.impactScore / 10) * 100}%` }}
                      transition={{
                        duration: reduce ? 0 : 0.8,
                        delay: reduce ? 0 : 0.25,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Portfolio relevance</p>
                </div>
              </div>

              {/* Takeaways */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Key Takeaways
                </p>
                <ol className="space-y-2.5">
                  {data.takeaways.map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: reduce ? 0 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: reduce ? 0 : 0.35,
                        delay: reduce ? 0 : 0.1 + i * 0.08,
                        ease: 'easeOut',
                      }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0 text-violet-600 dark:text-violet-400 text-[10px] font-black">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {point}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-gray-400 dark:text-gray-600 border-t border-gray-200/60 dark:border-gray-700/40 pt-3">
                AI-generated summary · Not financial advice · For educational purposes only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
