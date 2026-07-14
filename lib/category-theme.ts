export type ThemeName = "emerald" | "violet" | "sunset" | "ocean" | "gold";

export const THEME_STYLES: Record<ThemeName, { gradient: string; shadow: string }> = {
  emerald: { gradient: "hero-gradient", shadow: "shadow-emerald-900/20" },
  violet: { gradient: "hero-gradient-violet", shadow: "shadow-violet-900/20" },
  sunset: { gradient: "hero-gradient-sunset", shadow: "shadow-orange-900/20" },
  ocean: { gradient: "hero-gradient-ocean", shadow: "shadow-sky-900/20" },
  gold: { gradient: "hero-gradient-gold", shadow: "shadow-amber-900/20" },
};

const CATEGORY_THEME: Record<string, ThemeName> = {
  Investing: "emerald",
  Crypto: "violet",
  "Personal Finance": "sunset",
  "Market Analysis": "ocean",
  "Side Hustles": "gold",
};

export function themeForCategory(category: string): ThemeName {
  return CATEGORY_THEME[category] ?? "emerald";
}
