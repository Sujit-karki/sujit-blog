import Link from "next/link";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

export default async function Footer() {
  'use cache'
  cacheLife('max')

  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Get new posts in your inbox</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No spam, unsubscribe anytime.</p>
          </div>
          <div className="w-full md:w-auto md:min-w-[360px]">
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3 group" aria-label={siteConfig.name}>
              <span className="logo-wrap inline-flex items-center">
                <Image
                  src="/logo.png"
                  alt={siteConfig.name}
                  width={90}
                  height={33}
                  className="logo-img object-contain h-7 w-auto"
                />
              </span>
              <span className="text-lg font-black tracking-tighter uppercase gradient-text transition-all duration-300 group-hover:scale-105">
                Lampard
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Categories
            </p>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/category/${slugifyCategory(cat)}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Site
            </p>
            <ul className="space-y-2">
              {[
                { label: "Research", href: "/research" },
                { label: "Tools", href: "/tools" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "RSS Feed", href: "/feed.xml" },
                { label: "Sitemap", href: "/sitemap.xml" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Trust &amp; Legal
            </p>
            <ul className="space-y-2">
              {[
                { label: "Editorial Policy", href: "/editorial-policy" },
                { label: "Methodology", href: "/methodology" },
                { label: "Corrections", href: "/corrections" },
                { label: "AI Disclosure", href: "/ai-disclosure" },
                { label: "Disclaimer", href: "/disclaimer" },
                { label: "Privacy Policy", href: "/privacy-policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
          <p>&copy; {year} {siteConfig.name}. All rights reserved.</p>
          <p>
            Content for educational purposes only.{" "}
            <Link href="/disclaimer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline underline-offset-2">
              See disclaimer.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
