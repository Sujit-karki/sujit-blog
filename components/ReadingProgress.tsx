"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const article = document.getElementById("article-body");
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrolled = -top;
      const total = height - windowH;
      setProgress(total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[200] bg-transparent">
      <div
        className="h-full bg-emerald-500 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
