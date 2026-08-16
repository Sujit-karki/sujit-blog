import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  cacheLife: {
    // 30-second revalidation window for live market data
    market: {
      stale: 30,
      revalidate: 30,
      expire: 3600,
    },
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // No remotePatterns: every next/image usage in this codebase (logo, post
  // coverImage) is a local /public asset. A wildcard hostname here would let
  // the image optimizer fetch and proxy any attacker-supplied HTTPS URL
  // through this domain — add a specific hostname if a post ever needs one.
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
