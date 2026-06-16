'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)

export default function CodeBlock({ children }: Props) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  function handleCopy() {
    const text = preRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => { /* clipboard unavailable */ }
    )
  }

  return (
    <div className="relative group my-6">
      <pre
        ref={preRef}
        className="bg-gray-950 text-gray-100 rounded-xl p-5 overflow-x-auto text-sm border border-gray-800 leading-relaxed"
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        className={`
          absolute top-3 right-3
          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          text-[11px] font-bold uppercase tracking-wider select-none
          transition-all duration-200
          opacity-0 group-hover:opacity-100 focus-visible:opacity-100
          ${
            copied
              ? 'bg-emerald-600 text-white scale-95'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }
        `}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}
