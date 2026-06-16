'use client'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

interface Post { slug: string; title: string; category: string }

interface Props { posts: Post[] }

export default function NewsTicker({ posts }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.style.animationPlayState = paused ? 'paused' : 'running'
  }, [paused])

  if (!posts.length) return null

  const doubled = [...posts, ...posts]

  return (
    <div
      className="relative w-full overflow-hidden bg-emerald-600 dark:bg-emerald-700 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Latest posts ticker"
    >
      <div className="flex items-stretch">
        {/* LIVE badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-white/15 backdrop-blur-sm z-10 border-r border-white/20">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Latest</span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={trackRef}
            className="flex items-center gap-0 ticker-track"
            style={{ width: 'max-content' }}
          >
            {doubled.map((post, i) => (
              <Link
                key={`${post.slug}-${i}`}
                href={`/posts/${post.slug}`}
                className="flex items-center gap-2 px-6 py-2.5 whitespace-nowrap text-sm font-medium hover:text-white/80 transition-colors group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full group-hover:bg-white/30 transition-colors">
                  {post.category}
                </span>
                <span className="group-hover:underline underline-offset-2">{post.title}</span>
                <span className="text-white/40 text-xs mx-2">•</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
