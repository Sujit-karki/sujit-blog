import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const alt = "Post cover image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? siteConfig.name;
  const category = post?.category ?? siteConfig.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {siteConfig.author.avatarInitial}
          </div>
          <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              alignSelf: "flex-start",
              color: "#6ee7b7",
              fontSize: 22,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {category}
          </span>
          <span
            style={{
              color: "white",
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ display: "flex", color: "rgba(255,255,255,0.65)", fontSize: 22 }}>
          {siteConfig.author.name} · {siteConfig.author.credentials}
        </div>
      </div>
    ),
    { ...size }
  );
}
