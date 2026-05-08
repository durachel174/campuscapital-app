"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/programs/cs", label: "CS Trends" },
  { href: "/programs/ai", label: "AI Programs" },
  { href: "/tuition", label: "Tuition" },
  { href: "/universities", label: "Universities" },
  { href: "/report", label: "Report" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-6 py-3">
        <Link href="/" className="mr-6 text-sm font-semibold tracking-tight text-white">
          CampusCapital
        </Link>
        {links.map(({ href, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
