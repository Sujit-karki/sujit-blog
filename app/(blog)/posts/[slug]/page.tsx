import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatDate } from "@/lib/posts";
import { siteConfig, slugifyCategory } from "@/lib/site-config";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import AuthorBio from "@/components/AuthorBio";
import RelatedPosts from "@/components/RelatedPosts";
import ReadingProgress from "@/components/ReadingProgress";
import CaiGlobalAd from "@/components/ads/CaiGlobalAd";
import GoogleAdSense from "@/components/ads/GoogleAdSense";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${siteConfig.url}/posts/${slug}`;
  const img = post.coverImage ?? "/og-default.jpg";
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author, url: `${siteConfig.url}/about` }],
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: siteConfig.name,
      images: [{ url: img, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [`${siteConfig.url}/about`],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [{ url: img, alt: post.title }],
    },
  };
}

export const dynamicParams = false;

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { default: PostContent } = await import(`@/content/posts/${slug}.mdx`);
  const related = getRelatedPosts(slug, post.category);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: post.category, href: `/category/${slugifyCategory(post.category)}` },
    { label: post.title },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteConfig.url}/posts/${slug}`,
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
      url: `${siteConfig.url}/about`,
      jobTitle: siteConfig.author.credentials,
      knowsAbout: siteConfig.author.knowsAbout,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/posts/${slug}` },
    keywords: post.tags?.join(", "),
    articleSection: post.category,
    inLanguage: "en-US",
    ...(post.coverImage && { image: `${siteConfig.url}${post.coverImage}` }),
  };

  const faqJsonLd = post.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems, siteConfig.url);

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10 xl:gap-14">
          {/* Main article */}
          <div className="min-w-0">
            {/* Post header */}
            <header className="mb-8">
              <Link
                href={`/category/${slugifyCategory(post.category)}`}
                className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:underline mb-3"
              >
                {post.category}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                {post.title}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                {post.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 pb-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {siteConfig.author.avatarInitial}
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <time dateTime={post.date}>Published {formatDate(post.date)}</time>
                {post.updated && post.updated !== post.date && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <time dateTime={post.updated} className="text-emerald-600 dark:text-emerald-400">
                      Updated {formatDate(post.updated)}
                    </time>
                  </>
                )}
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>{post.readingTime} min read</span>
              </div>
            </header>

            {/* In-content top ad */}
            <div className="mb-8 ad-reveal ad-label relative">
              <GoogleAdSense slot="1122334455" format="horizontal" />
            </div>

            {/* Article body */}
            <article
              id="article-body"
              className="prose prose-gray dark:prose-invert prose-lg max-w-none
                prose-headings:font-extrabold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:leading-[1.8] prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-li:leading-relaxed prose-ul:my-4 prose-ol:my-4"
            >
              <PostContent />
            </article>

            {/* Mid-article CAI ad */}
            <div className="my-8">
              <CaiGlobalAd
                size="leaderboard"
                headline="CAI Global — Finance Marketing Experts"
                ctaText="Work with Us →"
                className="ad-reveal w-full"
              />
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <AuthorBio />

            <RelatedPosts posts={related} category={post.category} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Table of contents */}
              {post.toc && post.toc.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                    Table of Contents
                  </h3>
                  <nav aria-label="Table of contents">
                    <ol className="space-y-1.5">
                      {post.toc.map((item) => (
                        <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                          <a
                            href={`#${item.id}`}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors leading-snug block"
                          >
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>
              )}

              {/* Sidebar CAI ad */}
              <CaiGlobalAd
                size="rectangle"
                headline="Finance Marketing by CAI Global"
                subtext="Campaigns that convert for finance & crypto brands."
                ctaText="Get in Touch →"
                className="ad-reveal"
              />

              {/* Sidebar AdSense */}
              <div className="ad-label relative">
                <GoogleAdSense
                  slot="5566778899"
                  format="rectangle"
                  style={{ minHeight: 250 }}
                />
              </div>

            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
