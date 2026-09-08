import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDateShort } from "@/lib/posts";

interface RelatedPostsProps {
  posts: Post[];
  category: string;
}

export default function RelatedPosts({ posts, category }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-5">
        More in {category}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1.5">
              {post.category}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <time dateTime={post.date}>{formatDateShort(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
