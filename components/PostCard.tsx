import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate, formatDateShort } from "@/lib/posts";
import { slugifyCategory } from "@/lib/site-config";

interface PostCardProps {
  post: Post;
  featured?: boolean;
  variant?: "default" | "compact" | "horizontal";
}

export default function PostCard({ post, featured = false, variant = "default" }: PostCardProps) {
  const categoryHref = `/category/${slugifyCategory(post.category)}`;

  if (featured) {
    return (
      <article className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg hover:shadow-xl transition-shadow">
        <Link href={`/posts/${post.slug}`} className="block p-8 sm:p-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-emerald-200 text-xs">{post.readingTime} min read</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-4 group-hover:text-emerald-100 transition-colors">
            {post.title}
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed mb-6 max-w-2xl line-clamp-3">
            {post.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-emerald-200">
            <span className="font-semibold text-white">{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
        <div className="min-w-0 flex-1">
          <Link href={categoryHref} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-1 block">
            {post.category}
          </Link>
          <Link href={`/posts/${post.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <time dateTime={post.date}>{formatDateShort(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <Link href={categoryHref} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-2 block w-fit">
          {post.category}
        </Link>
        <Link href={`/posts/${post.slug}`} className="flex-1 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
            {post.description}
          </p>
          <div className="mt-auto flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
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
