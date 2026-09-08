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
    // React's development build needs eval() for debugging features (it
    // reconstructs callstacks across environments); production React never
    // calls eval(). Turbopack's HMR client also opens a WebSocket back to the
    // dev server. Both are dev-only concessions — the production CSP stays
    // strict, since these headers ship to real visitors.
    const isDev = process.env.NODE_ENV === "development";
    const scriptSrc = [
      "script-src 'self' 'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      "https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net",
      // sodar2.js is served from ep2.adtrafficquality.google. Allowing the
      // domain in connect-src only was a half-fix: the fetch was permitted but
      // loading the script itself still violated script-src, so the console
      // error persisted on every page carrying an ad.
      "https://*.adtrafficquality.google",
    ].join(" ");
    const connectSrc = [
      "connect-src 'self'",
      ...(isDev ? ["ws://localhost:* http://localhost:*"] : []),
      "https://api.buttondown.email https://*.googlesyndication.com https://*.doubleclick.net",
      // AdSense's ad-traffic-quality endpoints. Omitting these does not break
      // the page visibly — it produces a console CSP violation on every ad
      // impression while the slot still renders, which is exactly the kind of
      // silent ad-serving fault that goes unnoticed for months. Found by the
      // Lighthouse best-practices audit, not by looking at the site.
      "https://ep1.adtrafficquality.google https://*.adtrafficquality.google",
    ].join(" ");

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google",
      "font-src 'self' data:",
      connectSrc,
      // AdSense's fraud checks frame three origins, and allowing one at a
      // time simply moves the console error to the next: sodar frames
      // ep2.adtrafficquality.google (which it also scripts and fetches from,
      // hence the same domain in script-src and connect-src), and the ad
      // loader frames www.google.com. All are documented AdSense requirements.
      "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.google.com",
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
