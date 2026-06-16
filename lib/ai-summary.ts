import { cacheLife } from 'next/cache'
import { getPostBySlug } from '@/lib/posts'
import type { Post } from '@/lib/posts'

export type Sentiment = 'bullish' | 'bearish' | 'neutral'

export interface AiSummaryData {
  slug: string
  sentiment: Sentiment
  sentimentScore: number
  impactScore: number
  takeaways: string[]
}

const CATEGORY_TAKEAWAYS: Record<string, string[]> = {
  Investing: [
    'Portfolio diversification across uncorrelated assets reduces drawdown risk during market corrections.',
    'Time in the market consistently outperforms market timing for long-term compounding growth.',
    'Understanding expense ratios and tax drag can meaningfully improve net annualized returns.',
  ],
  'Personal Finance': [
    'Automating savings before discretionary spending eliminates the behavioral drag of manual budgeting.',
    'A 3–6 month emergency fund in a high-yield account is the foundation of any financial plan.',
    'Tracking your net worth monthly creates accountability and surfaces optimization opportunities early.',
  ],
  Crypto: [
    'Position sizing in high-volatility assets should reflect your actual risk tolerance, not conviction alone.',
    'On-chain metrics and developer activity often lead price action by weeks in emerging protocols.',
    'Cold-storage custody and hardware wallets are non-negotiable for holdings above your loss threshold.',
  ],
  'Side Hustles': [
    'Income diversification reduces single-employer risk and accelerates debt payoff timelines significantly.',
    'Tax-efficient structure selection (LLC vs sole prop) from day one prevents costly restructuring later.',
    'Productizing a skill into scalable digital assets compounds earnings without linear time commitment.',
  ],
  'Market Analysis': [
    'Macro regime shifts — rate cycles, credit spreads — drive sector rotations more than individual earnings.',
    'Technical levels gain significance when aligned with volume profiles and institutional positioning.',
    'Sentiment extremes (VIX spikes, put/call ratios) are historically superior contrarian entry signals.',
  ],
}

const BULLISH_SIGNALS = [
  'gain', 'bull', 'growth', 'profit', 'rise', 'rally', 'buy', 'opportunity',
  'invest', 'return', 'upside', 'strong', 'positive', 'outperform', 'record',
]
const BEARISH_SIGNALS = [
  'bear', 'risk', 'loss', 'decline', 'crash', 'down', 'sell', 'avoid',
  'debt', 'inflation', 'recession', 'danger', 'warning', 'weak', 'caution',
]

function buildFallback(slug: string, post: Post): AiSummaryData {
  const text = `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase()
  const bullScore = BULLISH_SIGNALS.filter(kw => text.includes(kw)).length
  const bearScore = BEARISH_SIGNALS.filter(kw => text.includes(kw)).length

  let sentiment: Sentiment
  let sentimentScore: number
  if (bullScore > bearScore) {
    sentiment = 'bullish'
    sentimentScore = Math.min(90, 58 + bullScore * 6)
  } else if (bearScore > bullScore) {
    sentiment = 'bearish'
    sentimentScore = Math.max(15, 42 - bearScore * 6)
  } else {
    sentiment = 'neutral'
    sentimentScore = 50
  }

  const takeaways =
    CATEGORY_TAKEAWAYS[post.category] ?? [
      `Understanding ${post.category.toLowerCase()} fundamentals is the first step to informed decisions.`,
      'Data-driven analysis consistently outperforms emotional or anecdotal reasoning in finance.',
      'Risk management and position sizing matter as much as selecting the right opportunity.',
    ]

  const impactScore = Math.min(9.5, 4.5 + bullScore * 0.35 + post.tags.length * 0.18)

  return { slug, sentiment, sentimentScore, impactScore, takeaways }
}

async function callClaudeApi(post: Post): Promise<AiSummaryData | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const prompt = `Analyze this personal finance article and respond ONLY with valid JSON — no markdown fences, no commentary.

Title: ${post.title}
Description: ${post.description}
Category: ${post.category}
Tags: ${post.tags.join(', ')}

Return exactly this JSON structure:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "sentimentScore": <integer 0-100>,
  "impactScore": <number 1.0-10.0 with one decimal>,
  "takeaways": [
    "<concise actionable insight 1 (≤20 words)>",
    "<concise actionable insight 2 (≤20 words)>",
    "<concise actionable insight 3 (≤20 words)>"
  ]
}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''
    // Strip any accidental code fences before parsing
    const clean = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(clean) as Omit<AiSummaryData, 'slug'>
    return { slug: post.slug, ...parsed }
  } catch {
    return null
  }
}

export async function getAiSummary(slug: string): Promise<AiSummaryData> {
  'use cache'
  cacheLife('max')

  const post = getPostBySlug(slug)
  if (!post) {
    return {
      slug,
      sentiment: 'neutral',
      sentimentScore: 50,
      impactScore: 5.0,
      takeaways: [
        'Research your investment options thoroughly before committing capital.',
        'Understand the risks associated with any financial product or strategy.',
        'Consult a qualified financial advisor for personalized guidance.',
      ],
    }
  }

  const aiResult = await callClaudeApi(post)
  return aiResult ?? buildFallback(slug, post)
}
