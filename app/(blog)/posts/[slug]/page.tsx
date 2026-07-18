import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatDate } from "@/lib/posts";
import { siteConfig, slugifyCategory } from "@/lib/site-config";
import Breadcrumb, { buildBreadcrumbJsonLd } from "@/components/Breadcrumb";
import AuthorBio from "@/components/AuthorBio";
import RelatedPosts from "@/components/RelatedPosts";
import ReadingProgress from "@/components/ReadingProgress";
import GoogleAdSense from "@/components/ads/GoogleAdSense";
import TocObserver from "@/components/TocObserver";
import MarketChart from "@/components/financial/MarketChart";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import { THEME_STYLES, themeForCategory } from "@/lib/category-theme";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${siteConfig.url}/posts/${slug}`;
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
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [`${siteConfig.url}/about`],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

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
    // Next generates the file-convention og:image at a content-hashed path we
    // can't predict here, so JSON-LD points at the stable generated fallback instead.
    image: `${siteConfig.url}/api/og`,
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
  const { gradient, shadow } = THEME_STYLES[themeForCategory(post.category)];

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
            {/* Hero image — only renders when a post sets coverImage */}
            {post.coverImage && (
              <div className="relative mb-6 overflow-hidden rounded-2xl shadow-xl aspect-[1200/630]">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  unoptimized={post.coverImage.endsWith(".svg")}
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Post header — animated gradient hero, themed by category */}
            <header className={`relative overflow-hidden rounded-2xl mb-8 text-white shadow-xl ${gradient} ${shadow}`}>
              <div className="relative p-6 sm:p-8 lg:p-10">
                <Link
                  href={`/category/${slugifyCategory(post.category)}`}
                  className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/30 transition-colors mb-4"
                >
                  {post.category}
                </Link>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4 max-w-3xl">
                  {post.title}
                </h1>
                <p className="text-lg text-white/85 leading-relaxed mb-5 max-w-2xl">
                  {post.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70 pt-5 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                      {siteConfig.author.avatarInitial}
                    </div>
                    <span className="font-medium text-white">{post.author}</span>
                  </div>
                  <span className="text-white/30">|</span>
                  <time dateTime={post.date}>Published {formatDate(post.date)}</time>
                  {post.updated && post.updated !== post.date && (
                    <>
                      <span className="text-white/30">|</span>
                      <time dateTime={post.updated} className="text-white font-medium">
                        Updated {formatDate(post.updated)}
                      </time>
                    </>
                  )}
                  <span className="text-white/30">|</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
              {/* Subtle shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
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

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 mt-8">
              <p className="font-bold text-gray-900 dark:text-white mb-1">Get new posts in your inbox</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                No spam, unsubscribe anytime.
              </p>
              <NewsletterSignup />
            </div>

            <AuthorBio />

            <RelatedPosts posts={related} category={post.category} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Live market chart */}
              <MarketChart compact />

              {/* Interactive Table of Contents */}
              {post.toc && post.toc.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
                  <TocObserver toc={post.toc} />
                </div>
              )}

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
