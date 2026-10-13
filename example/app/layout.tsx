import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";
import "./globals.css";

export const metadata: Metadata = {
  title: `Get a quote | ${BUSINESS.name}`,
  description: BUSINESS.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
