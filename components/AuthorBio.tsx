import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

interface AuthorBioProps {
  showLink?: boolean;
}

export default function AuthorBio({ showLink = true }: AuthorBioProps) {
  const { author } = siteConfig;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 mt-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
        About the Author
      </p>
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shrink-0">
          <Image
            src={author.avatarImage}
            alt={author.name}
            fill
            sizes="48px"
            className="object-cover"
            style={{ objectPosition: "50% 60%" }}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-gray-900 dark:text-white">{author.name}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {author.credentials}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            {author.bio}
          </p>
          {showLink && (
            <Link
              href="/about"
              className="text-sm font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:no-underline"
            >
              Read full bio →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
