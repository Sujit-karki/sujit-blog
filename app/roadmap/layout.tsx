import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/(blog)/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lampard | Strategic Roadmap & Market Intelligence",
  description: "A comprehensive strategic report on building a world-class financial blog using Next.js 16, MDX, and performance-driven SEO.",
  robots: { index: false, follow: true },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
