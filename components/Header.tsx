import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import { siteConfig, categories, slugifyCategory } from "@/lib/site-config";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
        >
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
            $
          </span>
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Contact
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNav categories={categories} />
        </div>
      </div>

      {/* Category bar */}
      <div className="border-t border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0.5 h-9 w-max min-w-full">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${slugifyCategory(cat)}`}
                className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition-colors whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
