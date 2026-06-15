"use client";
import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

const FB_URL = "https://www.facebook.com/people/Cai-global-solutions-Pvt-Ltd/61587249235797/";
const IG_URL = "https://www.instagram.com/cai_global/";

export default function FloatingCaiAd() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 350) setVisible(true); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!siteConfig.caiAd.enabled || !visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-60 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 overflow-hidden"
      style={{ animation: "slideInUp 0.35s ease-out" }}
    >
      <style>{`@keyframes slideInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Sponsored</p>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-base leading-none -mt-0.5 -mr-0.5"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black shrink-0 text-sm shadow-sm">
            C
          </div>
          <div>
            <p className="font-extrabold text-gray-900 dark:text-white text-xs leading-tight">{siteConfig.caiAd.name}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">caiunity.com</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
          Expert digital marketing to grow your brand online.
        </p>
        <a
          href={siteConfig.caiAd.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block text-center text-xs font-bold py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-colors shadow-sm mb-2"
        >
          Visit caiunity.com →
        </a>
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <a href={FB_URL} target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-semibold text-[#1877F2] hover:underline flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </a>
          <a href={IG_URL} target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
