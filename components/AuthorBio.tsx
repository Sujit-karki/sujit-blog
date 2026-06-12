import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

interface AuthorBioProps {
  showLink?: boolean;
}

export default function AuthorBio({ showLink = true }: AuthorBioProps) {
  const { author } = siteConfig;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 mt-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
        About the Author
      </p>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
          {author.avatarInitial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-gray-900 dark:text-white">{author.name}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {author.credentials}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            {author.bio}
          </p>
          {showLink && (
            <Link
              href="/about"
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Read full bio →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
