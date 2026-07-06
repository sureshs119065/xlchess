import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display face: Fraunces — a sharp, high-contrast serif with real
// character, used for the headline only. It reads closer to a
// tournament plaque or a printed chess column than a generic
// grotesque, which is the point: this is a game with 1,500 years
// of print history behind it.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Body face: Inter — quiet, legible, gets out of the way.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Utility face: IBM Plex Mono — used exclusively for algebraic
// notation, move counters, and stats. Chess notation (e4, Nf3, O-O)
// is monospace in every real broadcast overlay and PGN file, so this
// isn't a stylistic flourish, it's the subject's own vernacular.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XLChess — Build the Future of Online Chess",
  description:
    "A complete chess platform to play, learn, compete, and grow. Watch a live demo of the Evergreen Game and start your first match in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="bg-ink-900 font-body text-paper-100 antialiased">
        {children}
      </body>
    </html>
  );
}
