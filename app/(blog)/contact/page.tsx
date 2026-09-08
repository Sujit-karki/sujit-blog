import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} — questions, feedback, or collaboration inquiries.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Contact" }];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Every other route emits this; contact rendered the visual breadcrumb
          without the matching JSON-LD, so it was the one page missing from the
          Breadcrumbs enhancement report. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Contact</h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          {siteConfig.name} is written by one person — {siteConfig.author.name} — so
          every message here reaches me directly, and I answer them myself.
        </p>
      </header>

      <div className="grid gap-5 mb-8">
        {siteConfig.social.email && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Email</h2>
            </div>
            <a href={`mailto:${siteConfig.social.email}`} className="text-emerald-700 dark:text-emerald-400 hover:underline text-sm">
              {siteConfig.social.email}
            </a>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Response time</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            I usually reply within 2–3 business days, and I read everything even when
            I don&apos;t. For press or media enquiries, include your publication and your
            deadline in the first message — it moves you to the front of the queue.
          </p>
        </div>
      </div>

      <section className="space-y-8 text-[0.95rem] text-gray-700 dark:text-gray-300 leading-[1.75]">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Found a mistake?
          </h2>
          <p className="mb-4">
            This is the message I most want to get. Every post here is built on
            numbers, and numbers go stale or turn out wrong. If you think a figure is
            off, email me with the post title and the specific claim — you don&apos;t
            need to be polite about it, and you don&apos;t need to be certain.
          </p>
          <p>
            Corrections get made in the open. When a post changes materially, the
            change is logged on the{" "}
            <Link href="/corrections" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              corrections page
            </Link>{" "}
            with what the post said before, what it says now, and who caught it. That
            log is public whether the error was flagged by a reader or found in-house,
            and the post itself carries an updated date rather than being quietly
            edited.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            What I can&apos;t help with
          </h2>
          <p className="mb-4">
            I&apos;m not a licensed financial adviser, and nothing on this site is
            personal financial advice. I can&apos;t tell you whether to buy a specific
            stock, how to allocate your particular portfolio, or what to do about your
            own tax situation — not because I&apos;m being cagey, but because giving
            individual advice without knowing your full circumstances would be worse
            than useless. The{" "}
            <Link href="/disclaimer" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              disclaimer
            </Link>{" "}
            sets out the boundary properly.
          </p>
          <p>
            What I will happily do is explain how a calculation works, point you at the
            source behind a number, or tell you which of my own assumptions I&apos;m
            least confident in.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Working together
          </h2>
          <p>
            Freelance research, data work, and writing enquiries are welcome — rates,
            availability, and the kind of brief that suits this work are on the{" "}
            <Link href="/work-with-me" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              work with me
            </Link>{" "}
            page. If you want to know who you&apos;d be hiring first, the{" "}
            <Link href="/about" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              about page
            </Link>{" "}
            covers the background, and{" "}
            <Link href="/methodology" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline">
              methodology
            </Link>{" "}
            covers how the research actually gets done. I don&apos;t accept sponsored
            posts or paid links.
          </p>
        </div>
      </section>

    </div>
  );
}
