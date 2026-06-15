import { siteConfig } from "@/lib/site-config";

type AdVariant = "sidebar" | "banner" | "inline" | "spotlight" | "card-grid" | "social-follow" | "ticker";

interface CaiGlobalAdProps {
  variant?: AdVariant;
  className?: string;
}

const FB_URL = "https://www.facebook.com/people/Cai-global-solutions-Pvt-Ltd/61587249235797/";
const IG_URL = "https://www.instagram.com/cai_global/";

export default function CaiGlobalAd({ variant = "sidebar", className = "" }: CaiGlobalAdProps) {
  if (!siteConfig.caiAd.enabled) return null;

  const { url, name, tagline } = siteConfig.caiAd;

  /* ── TICKER ─────────────────────────────────────────── */
  if (variant === "ticker") {
    const msg = `🚀 ${name} — ${tagline} Visit caiunity.com ✦ SEO • Social Media • Content Strategy • Paid Ads ✦ Follow us on Facebook & Instagram ✦ Grow your brand with ${name} ✦`;
    return (
      <div className={`w-full bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-700 text-white text-xs font-medium py-2 overflow-hidden ${className}`}>
        <div className="flex whitespace-nowrap" style={{ animation: "ticker 30s linear infinite" }}>
          <span className="pr-8">{msg}</span>
          <span className="pr-8">{msg}</span>
          <span className="pr-8">{msg}</span>
        </div>
        <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}`}</style>
      </div>
    );
  }

  /* ── BANNER ─────────────────────────────────────────── */
  if (variant === "banner") {
    return (
      <div className={`border-t border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-950/5 via-teal-950/5 to-emerald-950/5 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 shrink-0">
              Sponsored
            </span>
            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                C
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{name}</span>
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                — {tagline}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={FB_URL} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Facebook</a>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer"
              className="text-xs text-pink-600 dark:text-pink-400 hover:underline font-medium">Instagram</a>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <a href={url} target="_blank" rel="noopener noreferrer sponsored"
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              Visit Us →
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── INLINE ─────────────────────────────────────────── */
  if (variant === "inline") {
    return (
      <div className={`my-8 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/25 dark:to-teal-950/25 overflow-hidden ${className}`}>
        <div className="flex items-center gap-4 p-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl font-black shadow-md">
            C
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
              Sponsored
            </p>
            <p className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">
              {name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
              {tagline}
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-1.5">
            <a href={url} target="_blank" rel="noopener noreferrer sponsored"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors whitespace-nowrap shadow-sm">
              Visit Us →
            </a>
            <div className="flex items-center justify-center gap-2">
              <a href={FB_URL} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium">FB</a>
              <span className="text-gray-300 dark:text-gray-600 text-[10px]">·</span>
              <a href={IG_URL} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-pink-600 dark:text-pink-400 hover:underline font-medium">IG</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── SPOTLIGHT ──────────────────────────────────────── */
  if (variant === "spotlight") {
    return (
      <div className={`my-10 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white p-8 sm:p-10 ${className}`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300 mb-3">
          Sponsored Partner
        </p>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white text-2xl font-black shrink-0">
            C
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold mb-1">{name}</h3>
            <p className="text-emerald-200 text-sm">caiunity.com</p>
          </div>
        </div>
        <p className="text-emerald-100 leading-relaxed mb-6 max-w-2xl">
          {tagline} Expert-led SEO, social media management, content strategy, and paid advertising — everything you need to grow your brand online.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md">
            Visit caiunity.com →
          </a>
          <a href={FB_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </a>
          <a href={IG_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            Instagram
          </a>
        </div>
      </div>
    );
  }

  /* ── CARD-GRID ──────────────────────────────────────── */
  if (variant === "card-grid") {
    return (
      <div className={`rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-5 flex flex-col ${className}`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Partner Spotlight
        </p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm">
            C
          </div>
          <div>
            <p className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">{name}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">caiunity.com</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-4">
          {tagline} SEO, social media, content strategy, and paid ads — all in one place.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm mb-2">
          Visit caiunity.com →
        </a>
        <div className="flex items-center justify-center gap-4">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </a>
          <a href={IG_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400 hover:underline font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            Instagram
          </a>
        </div>
      </div>
    );
  }

  /* ── SOCIAL-FOLLOW ──────────────────────────────────── */
  if (variant === "social-follow") {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden ${className}`}>
        <div className="h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500" />
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Follow Our Partner
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black shrink-0">
              C
            </div>
            <div>
              <p className="font-extrabold text-gray-900 dark:text-white text-sm">{name}</p>
              <a href={url} target="_blank" rel="noopener noreferrer sponsored"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                caiunity.com
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            Follow us for digital marketing tips, business growth strategies, and industry insights.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a href={FB_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </a>
            <a href={IG_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs font-bold transition-opacity hover:opacity-90">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              Instagram
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── SIDEBAR (default) ──────────────────────────────── */
  return (
    <div className={`rounded-xl border border-emerald-200 dark:border-emerald-800/60 overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

      <div className="bg-white dark:bg-gray-900 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          Powered by CAI Global Solutions
        </p>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md">
            C
          </div>
          <div>
            <p className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">
              {name}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Digital Marketing Solutions
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
          {tagline} SEO, social media, content strategy — all in one place.
        </p>

        <a href={url} target="_blank" rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md mb-4">
          Visit caiunity.com →
        </a>

        <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#1877F2] dark:hover:text-[#1877F2] transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </a>
          <a href={IG_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
