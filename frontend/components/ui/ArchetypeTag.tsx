"use client";
import { ARCHETYPE_BG } from "@/lib/format";

export function ArchetypeTag({ archetype }: { archetype: string }) {
  const cls = ARCHETYPE_BG[archetype] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {archetype}
    </span>
  );
}
