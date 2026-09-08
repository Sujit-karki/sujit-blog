import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate, formatDateShort } from "@/lib/posts";
import { slugifyCategory } from "@/lib/site-config";
import { THEME_STYLES, type ThemeName } from "@/lib/category-theme";

interface PostCardProps {
  post: Post;
  featured?: boolean;
  theme?: ThemeName;
  variant?: "default" | "compact" | "horizontal";
}

export default function PostCard({ post, featured = false, theme = "emerald", variant = "default" }: PostCardProps) {
  const categoryHref = `/category/${slugifyCategory(post.category)}`;

  if (featured) {
    const { gradient, shadow } = THEME_STYLES[theme];
    return (
      <article className={`group relative rounded-2xl overflow-hidden ${gradient} text-white shadow-xl ${shadow} card-hover h-full`}>
        <Link href={`/posts/${post.slug}`} className="block p-6 sm:p-7 lg:p-8 h-full flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-white/70 text-xs">{post.readingTime} min read</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-3 group-hover:text-white/90 transition-colors">
            {post.title}
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-6 line-clamp-3">
            {post.description}
          </p>
          <div className="mt-auto flex items-center gap-3 text-sm text-white/70">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              {post.author.charAt(0)}
            </div>
            <span className="font-semibold text-white">{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </Link>
        {/* Subtle shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 card-hover">
        <div className="min-w-0 flex-1">
          <Link
            href={categoryHref}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline mb-1 block"
          >
            {post.category}
          </Link>
          <Link href={`/posts/${post.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <time dateTime={post.date}>{formatDateShort(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden card-hover flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <Link
          href={categoryHref}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline mb-2 block w-fit"
        >
          {post.category}
        </Link>
        <Link href={`/posts/${post.slug}`} className="flex-1 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
            {post.description}
          </p>
          <div className="mt-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="font-medium text-gray-600 dark:text-gray-400">{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>{formatDateShort(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </Link>
      </div>
    </article>
  );
}
