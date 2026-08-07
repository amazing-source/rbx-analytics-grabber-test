import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Hanken Grotesk: a clean humanist grotesque, close in spirit to Roblox's
// Builder Sans. Tabular figures keep the metric numbers aligned.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Indigo · LiveOps Analytics",
  description: "Creator Dashboard analytics, pulled and compared for owned Roblox games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hanken.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
