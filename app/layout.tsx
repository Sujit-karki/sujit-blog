import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./(blog)/globals.css";
import { siteConfig, authorSameAs } from "@/lib/site-config";
import { MotionProvider } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Headlines only. Body copy, tables, chart labels and UI stay on the sans:
// this site is mostly figures, and a serif fighting dense numeric columns
// would cost more than the editorial character it buys. The weight range is
// declared so headings can go to 700 without the browser synthesising a bold.
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "personal finance",
    "investing",
    "market analysis",
    "cryptocurrency",
    "budgeting",
    "financial independence",
    "index funds",
    "ETF",
    "macroeconomics",
  ],
  authors: [{ name: siteConfig.author.name, url: `${siteConfig.url}/about` }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/api/og", alt: siteConfig.name }],
    ...(siteConfig.social.twitter ? { site: `@${siteConfig.social.twitter}`, creator: `@${siteConfig.social.twitter}` } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    types: { "application/rss+xml": `${siteConfig.url}/feed.xml` },
  },
  category: "Finance",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon-512.png` },
  founder: {
    "@type": "Person",
    name: siteConfig.author.name,
    url: `${siteConfig.url}/about`,
    jobTitle: siteConfig.author.credentials,
    knowsAbout: siteConfig.author.knowsAbout,
    sameAs: authorSameAs,
  },
  sameAs: authorSameAs,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  publisher: { "@id": `${siteConfig.url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Theme init — runs before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <meta name="theme-color" content="#059669" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0c0f14" media="(prefers-color-scheme: dark)" />
<script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
        />
        <link rel="alternate" type="application/rss+xml" title={`${siteConfig.name} RSS`} href={`${siteConfig.url}/feed.xml`} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <MotionProvider>{children}</MotionProvider>
        <SpeedInsights />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8604899547572044"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
      {/* GA4. Gated on the env var so a missing ID is a no-op rather than a
          broken tag. Search Console measures Google search only; the referral
          traffic a dataset launch produces is invisible without this. The
          component defers the loader until after hydration.
          The CSP in next.config.mjs must allow googletagmanager.com and
          google-analytics.com, or this fails silently — the page renders
          normally and no hit is ever sent. */}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
