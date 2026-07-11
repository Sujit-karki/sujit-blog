import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { siteConfig, slugifyCategory } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `Meet ${siteConfig.author.name} — ${siteConfig.author.credentials.toLowerCase()} covering personal finance, investing, and market analysis.`,
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    type: "profile",
    url: `${siteConfig.url}/about`,
    title: `About ${siteConfig.author.name} | ${siteConfig.name}`,
    description: siteConfig.author.bio,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.author.name,
  url: `${siteConfig.url}/about`,
  jobTitle: siteConfig.author.credentials,
  description: siteConfig.author.bio,
  knowsAbout: siteConfig.author.knowsAbout,
  worksFor: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
};

export default function AboutPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About" }];
  return (
    <>
      <script type="application/ld+json" async dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>

        {/* Author hero */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 sm:p-10 mb-10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-black shrink-0">
              {siteConfig.author.avatarInitial}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">{siteConfig.author.name}</h1>
              <p className="text-emerald-100 font-medium mb-4">{siteConfig.author.credentials}</p>
              <p className="text-emerald-50 leading-relaxed max-w-xl">{siteConfig.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Site mission */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {siteConfig.name}</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              I&apos;m {siteConfig.author.name}, and I write {siteConfig.name}, an independent
              personal finance and market analysis publication. My mission is to demystify
              financial markets and help everyday people make smarter, more informed money
              decisions — without the jargon and hidden agendas that plague mainstream
              financial media.
            </p>
            <p>
              Every article is thoroughly researched using primary sources: central bank
              communications, official government data, peer-reviewed economic research,
              and SEC filings. Where I express opinions, I label them clearly. Where I
              cite data, I link to the original source.
            </p>
            <p>
              I hold myself to the highest E-E-A-T (Experience, Expertise,
              Authoritativeness, Trustworthiness) standards — the same standards Google applies
              to YMYL (Your Money or Your Life) content. Finance content carries real-world
              consequences, and I take that responsibility seriously.
            </p>
          </div>
        </section>

        {/* What I cover */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">What I Cover</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { cat: "Investing", desc: "Index funds, ETFs, stock analysis, and long-term portfolio building." },
              { cat: "Personal Finance", desc: "Budgeting, saving, debt management, and building financial security." },
              { cat: "Crypto", desc: "Cryptocurrency market analysis, Bitcoin research, and DeFi explained." },
              { cat: "Side Hustles", desc: "Practical strategies for building additional income streams." },
              { cat: "Market Analysis", desc: "Macroeconomic research, Fed policy, and global market trends." },
            ].map((item) => (
              <Link
                key={item.cat}
                href={`/category/${slugifyCategory(item.cat)}`}
                className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.cat}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Get in Touch</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Questions, collaboration requests, or feedback? I&apos;d love to hear from you.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            Contact us →
          </Link>
        </section>

        {/* Disclaimer */}
        <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-6">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-2">Financial Disclaimer</h2>
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            All content on {siteConfig.name} is for educational and informational purposes only.
            Nothing published here constitutes financial advice, investment advice, or a recommendation
            to buy or sell any security. Always consult with a qualified financial advisor.{" "}
            <Link href="/disclaimer" className="underline font-medium">Read full disclaimer</Link>
          </p>
        </section>
      </div>
    </>
  );
}
