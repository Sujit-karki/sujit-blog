import { cacheLife } from 'next/cache'

export interface MarketAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  sparkline: number[]
  type: 'crypto' | 'index'
}

const ASSETS = [
  { ticker: 'SPY',     id: 'sp500',       symbol: 'SPY', name: 'S&P 500',  type: 'index'  as const },
  { ticker: 'BTC-USD', id: 'bitcoin',     symbol: 'BTC', name: 'Bitcoin',  type: 'crypto' as const },
  { ticker: 'ETH-USD', id: 'ethereum',    symbol: 'ETH', name: 'Ethereum', type: 'crypto' as const },
  { ticker: 'SOL-USD', id: 'solana',      symbol: 'SOL', name: 'Solana',   type: 'crypto' as const },
  { ticker: 'BNB-USD', id: 'binancecoin', symbol: 'BNB', name: 'BNB',      type: 'crypto' as const },
]

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
const YF_HEADERS = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }

async function fetchLiveMarketData(): Promise<MarketAsset[]> {
  'use cache'
  cacheLife('market')

  const results = await Promise.allSettled(
    ASSETS.map(a =>
      fetch(`${YF_BASE}/${a.ticker}?interval=1h&range=1d`, { headers: YF_HEADERS })
    )
  )

  const assets: MarketAsset[] = []

  for (let i = 0; i < ASSETS.length; i++) {
    const meta = ASSETS[i]
    const result = results[i]
    if (result.status !== 'fulfilled' || !result.value.ok) continue

    try {
      const json = await result.value.json()
      const r = json?.chart?.result?.[0]
      if (!r) continue

      const closes: number[] = (r.indicators?.quote?.[0]?.close ?? []).filter(
        (v: unknown): v is number => typeof v === 'number'
      )
      if (closes.length < 2) continue

      const price = closes[closes.length - 1]
      const open = closes[0]

      assets.push({
        id: meta.id,
        symbol: meta.symbol,
        name: meta.name,
        price,
        change24h: ((price - open) / open) * 100,
        sparkline: closes,
        type: meta.type,
      })
    } catch { /* ignore */ }
  }

  return assets
}

export async function GET() {
  const assets = await fetchLiveMarketData()
  return Response.json({ assets, ts: Date.now() })
}
