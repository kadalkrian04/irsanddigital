export type ThemeConfig = {
  id: string;
  name: string;
  accentHex: string;
  outerBg: string;
  sectionAltBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
};

export const THEMES: Record<string, ThemeConfig> = {
  "jawa-maroon": {
    id: "jawa-maroon",
    name: "Jawa Maroon (Adat Jawa Krem & Marun)",
    accentHex: "#7E2530",
    outerBg: "bg-[#E6DEC8]",
    sectionAltBg: "bg-[#F4EADB]",
    cardBorder: "border-[#D8C5B0]",
    badgeBg: "bg-[#7E2530]/10",
    badgeText: "text-[#7E2530]",
  },
  "classic-gold": {
    id: "classic-gold",
    name: "Classic Gold (Putih & Emas)",
    accentHex: "#8B6F47",
    outerBg: "bg-stone-100",
    sectionAltBg: "bg-stone-50",
    cardBorder: "border-stone-200",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
  },
  "royal-blue": {
    id: "royal-blue",
    name: "Royal Blue (Putih & Biru Elegan)",
    accentHex: "#1D4ED8",
    outerBg: "bg-slate-100",
    sectionAltBg: "bg-blue-50/50",
    cardBorder: "border-blue-100",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  "sage-minimal": {
    id: "sage-minimal",
    name: "Sage Minimalist (Putih & Hijau Sage)",
    accentHex: "#4D7C5D",
    outerBg: "bg-emerald-50/40",
    sectionAltBg: "bg-emerald-50/50",
    cardBorder: "border-emerald-100",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
  },
};

export function getTheme(themeId?: string): ThemeConfig {
  return THEMES[themeId || "jawa-maroon"] || THEMES["jawa-maroon"];
}