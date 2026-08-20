// Set true to bring ad units back after AdSense re-approval. Off during
// review: a YMYL site under review should present as content-first, and ad
// units near thin pages or interactive calculators add policy risk for no
// benefit while nothing is being served against this account anyway. The
// verification/loader script in app/layout.tsx stays in <head> regardless —
// only rendered <ins> ad units (and the wrapper divs that label them "Ad")
// are gated by this flag.
//
// Lives here, not in components/ads/GoogleAdSense.tsx, because that
// component is 'use client' — a Server Component importing a plain const
// from a client-boundary module doesn't reliably get the real value across
// that boundary. Server page templates should import ADS_ENABLED from here.
export const ADS_ENABLED = false;
