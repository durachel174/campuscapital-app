import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusCapital — Higher Education Market Intelligence",
  description: "Universities as business entities: enrollment trends, tuition economics, financial health.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
