import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items
      .filter((item) => item.href)
      .map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
        item: `${siteUrl}${item.href}`,
      })),
  };
}
