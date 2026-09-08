import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import { siteConfig, authorSameAs } from "@/lib/site-config";
import { researchPosts } from "@/lib/research-config";
import { datasets, ZENODO_CONCEPT_DOI } from "@/lib/datasets-config";

const TITLE = "Work With Me";
const DESCRIPTION =
  "I build datasets that do not exist yet — extracted from filings, government series and documents that resist scraping — and the calculators and analysis that make them useful.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${siteConfig.url}/work-with-me` },
  openGraph: {
    type: "profile",
    url: `${siteConfig.url}/work-with-me`,
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
  },
};

// What I can point at, rather than what I could claim. Every number here is
// derived from the repository so the page cannot drift from reality: counting
// the datasets is the difference between "extensive experience" and a figure a
// reader can check in one click.
const datasetCount = Object.keys(datasets).length;
const researchCount = researchPosts.length;

const SERVICES = [
  {
    title: "Datasets that do not exist yet",
    body: "The interesting number is usually the one nobody has compiled. I pull it out of primary documents — SEC filings, government statistical series, published policies — and hand back clean rows with the extraction code and the source quote attached to each figure.",
    evidence: {
      label: "Platform take rates, from eight companies' annual reports",
      href: "/posts/platform-take-rates-2026",
    },
  },
  {
    title: "Model evaluation you can reproduce",
    body: "Benchmarks for language models, run as measurements rather than demos: fixed seeds, explicit context length, repetitions to separate a reliable answer from a lucky one, and the failed runs published alongside the good ones. If a result cannot survive being re-run, it is not a result.",
    evidence: {
      label: "320 generations testing whether naming an account changes the answer",
      href: "/posts/ai-account-choice-names-2026",
    },
  },
  {
    title: "Calculators and data visualisation",
    body: "Interactive tools that make a trade-off legible in dollars, and charts that argue a point instead of decorating one. Every chart ships a data-table fallback, so it works for screen readers and for anything parsing the page.",
    evidence: { label: "The tools on this site", href: "/tools" },
  },
  {
    title: "Analysis written by a person",
    body: "A model can produce a dataset. It cannot notice that a filing's discussion quotes one segment's volume while its revenue is consolidated, which is the kind of error that quietly becomes a published number. I write the analysis, and the method section says exactly how each figure was checked.",
    evidence: { label: "How the work is checked", href: "/methodology" },
  },
];

export default function WorkWithMePage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: TITLE }];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    url: `${siteConfig.url}/work-with-me`,
    jobTitle: siteConfig.author.credentials,
    email: siteConfig.social.email,
    knowsAbout: siteConfig.author.knowsAbout,
    sameAs: authorSameAs,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3">
          {TITLE}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl">
          I build datasets that do not exist yet, and the analysis that makes them worth having.
        </p>

        {/* Evidence before the pitch. Anyone can describe themselves as
            rigorous; the point of leading with counts and a DOI is that all of
            it is one click from being checked. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { n: researchCount, label: "original-data posts" },
            { n: datasetCount, label: "published datasets" },
            { n: "DOI", label: "archived and citable" },
            { n: "100%", label: "code public" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                {stat.n}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3">
          <h2>What I do</h2>
          <p>
            Most analysis restates numbers someone else compiled. The work on this site does the
            opposite: every figure in the{" "}
            <Link href="/research">research section</Link> comes from a script in a public
            repository, run against primary sources, with the raw rows published alongside the
            conclusion. That is the same thing I do on commissioned work.
          </p>
          <p>
            The datasets behind this site are archived and citable at{" "}
            <a
              href={ZENODO_CONCEPT_DOI}
              className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
              rel="noopener"
            >
              {ZENODO_CONCEPT_DOI.replace("https://doi.org/", "doi.org/")}
            </a>
            , released under CC BY 4.0, with the harness that produced them under MIT. You can read
            the code before deciding whether to trust the numbers — which is the point.
          </p>
        </div>

        <div className="space-y-5 mt-8">
          {SERVICES.map((service) => (
            <section
              key={service.title}
              className="rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {service.title}
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                {service.body}
              </p>
              <Link
                href={service.evidence.href}
                className="text-sm font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
              >
                {service.evidence.label}
              </Link>
            </section>
          ))}
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-3">
          <h2>How a project usually starts</h2>
          <p>
            Send the question, not the specification. &ldquo;What do delivery platforms actually
            keep?&rdquo; is a better brief than a schema, because the shape of the dataset should
            follow from the question rather than the other way round. I will tell you whether the
            data can be got at all — sometimes it cannot, and finding that out early is worth more
            than a hopeful estimate.
          </p>
          <p>
            You get the cleaned dataset, the code that produced it, and a written method covering
            what was checked and what the numbers cannot support. Scope and timing depend on what
            the sources allow, so those are worth a short conversation rather than a number on a
            page.
          </p>

          <h2>Get in touch</h2>
          <p>
            Email{" "}
            <a
              href={`mailto:${siteConfig.social.email}?subject=Data%20project`}
              className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
            >
              {siteConfig.social.email}
            </a>{" "}
            with the question you want answered and any deadline you are working to. If it is easier
            to start from the existing work, the{" "}
            <Link href="/research">research section</Link> is the fastest way to see how a finished
            piece reads, and{" "}
            <a
              href={siteConfig.social.github}
              className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
              rel="noopener"
            >
              the repository
            </a>{" "}
            shows how it was built.
          </p>
        </div>
      </div>
    </>
  );
}
