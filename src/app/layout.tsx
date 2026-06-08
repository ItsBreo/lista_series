import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WatchList — Series & Movies Tracker",
  description:
    "Track the TV series and movies you watch together as a couple. Keep progress, rate, and organize your watchlist.",
  keywords: ["watchlist", "series tracker", "movie tracker", "couples", "TV shows"],
  openGraph: {
    title: "WatchList — Series & Movies Tracker",
    description: "Track the TV series and movies you watch together.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
