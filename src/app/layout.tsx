import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nebibs",
  description: "Welcome to Nebibs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <a href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Nebibs
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <a href="/" className="transition hover:text-zinc-900 dark:hover:text-zinc-50">Home</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
