import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mathlet | Tamil Nadu Mathematics",
  description: "Learn Tamil Nadu State Board Mathematics for Classes 6–12.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
