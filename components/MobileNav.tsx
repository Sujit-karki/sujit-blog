"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { slugifyCategory } from "@/lib/site-config";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface MobileNavProps {
  categories: readonly string[];
}

export default function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dur = reduce ? 0 : 0.22;
  const itemDur = reduce ? 0 : 0.18;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.15 }}
              className="fixed inset-0 top-[85px] bg-black/20 dark:bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Slide-down panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: { duration: dur } }}
              exit={{ opacity: 0, height: 0, transition: { duration: reduce ? 0 : 0.16 } }}
              className="absolute left-0 right-0 top-full bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-hidden"
            >
              <nav className="max-w-7xl mx-auto px-4 py-4">
                <ul className="space-y-1 mb-4">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { duration: itemDur, delay: reduce ? 0 : i * 0.04 },
                      }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">
                    Categories
                  </p>
                  <ul className="grid grid-cols-2 gap-1">
                    {categories.map((cat, i) => (
                      <motion.li
                        key={cat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: {
                            duration: itemDur,
                            delay: reduce ? 0 : (navLinks.length + i) * 0.04,
                          },
                        }}
                      >
                        <Link
                          href={`/category/${slugifyCategory(cat)}`}
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        >
                          {cat}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
