'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocItem } from '@/lib/posts'

interface Props {
  toc: TocItem[]
}

export default function TocObserver({ toc }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!toc.length) return

    const ids = toc.map(item => item.id)

    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-96px 0px -68% 0px', threshold: 0 }
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [toc])

  if (!toc.length) return null

  return (
    <nav aria-label="Table of contents">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
        Table of Contents
      </h3>
      <ol className="relative space-y-1.5">
        {/* Rail */}
        <span
          className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />

        {toc.map(item => {
          const active = activeId === item.id
          return (
            <li
              key={item.id}
              className={`relative ${item.level === 3 ? 'pl-8' : 'pl-4'}`}
            >
              {/* Active indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1 h-[calc(100%-4px)] w-px bg-emerald-500 rounded-full"
                  aria-hidden="true"
                />
              )}
              <a
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                className={`block text-sm leading-snug transition-all duration-150 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {item.title}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
