import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  cacheLife: {
    // 30-second revalidation window for live market data
    market: {
      stale: 30,
      revalidate: 30,
      expire: 3600,
    },
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // No remotePatterns: every next/image usage in this codebase (logo, post
  // coverImage) is a local /public asset. A wildcard hostname here would let
  // the image optimizer fetch and proxy any attacker-supplied HTTPS URL
  // through this domain — add a specific hostname if a post ever needs one.
  async redirects() {
    return [
      // Content audit (Aug 2026): thin, superseded by the deeper post below.
      {
        source: "/posts/bitcoin-market-analysis-2026",
        destination: "/posts/bitcoin-crash-2026-buy-or-wait",
        permanent: true,
      },
      // Orphaned standalone HTML in public/ that duplicated the MDX post at
      // /posts/how-to-invest-first-1000 (unlinked, absent from the sitemap, but
      // crawlable). File removed; this folds any existing crawl equity into the
      // canonical post instead of leaving a 404.
      {
        source: "/how-to-invest-first-1000.html",
        destination: "/posts/how-to-invest-first-1000",
        permanent: true,
      },
    ];
  },
  async headers() {
    // CSP scoped to what this site actually loads: next/font self-hosts
    // (no fonts.googleapis.com at runtime), market data is fetched
    // server-side in the API route (not a browser connect-src concern), and
    // the only genuine third-party origins are AdSense (script/frame/img —
    // present even while ad *units* are disabled, since the account
    // verification loader in <head> stays) and the Buttondown newsletter API.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.googlesyndication.com https://*.doubleclick.net",
      "font-src 'self' data:",
      "connect-src 'self' https://api.buttondown.email https://*.googlesyndication.com https://*.doubleclick.net",
      "frame-src https://*.googlesyndication.com https://*.doubleclick.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.buttondown.email",
      "frame-ancestors 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
