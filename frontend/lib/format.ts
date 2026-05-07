export const fmt = {
  currency: (v: number | null | undefined, digits = 0) =>
    v == null ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits }).format(v),

  pct: (v: number | null | undefined, digits = 1) =>
    v == null ? "N/A" : `${v.toFixed(digits)}%`,

  number: (v: number | null | undefined) =>
    v == null ? "N/A" : new Intl.NumberFormat("en-US").format(Math.round(v)),

  compact: (v: number | null | undefined) =>
    v == null ? "N/A" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v),

  score: (v: number | null | undefined) =>
    v == null ? "—" : v.toFixed(1),
};

export const ARCHETYPE_COLOR: Record<string, string> = {
  "Prestige Fortress": "#6366f1",   // indigo
  "Expansion Player": "#f59e0b",    // amber
  "Regional Value": "#10b981",      // emerald
  "Tuition Dependent": "#ef4444",   // red
};

export const ARCHETYPE_BG: Record<string, string> = {
  "Prestige Fortress": "bg-indigo-100 text-indigo-800",
  "Expansion Player": "bg-amber-100 text-amber-800",
  "Regional Value": "bg-emerald-100 text-emerald-800",
  "Tuition Dependent": "bg-red-100 text-red-800",
};
