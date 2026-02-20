import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Header } from "@/components/layout/Header";
import { HeroBackground } from "@/components/home/HeroBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nebibs",
  description: "My personal lab for learning, building, and reflecting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          <div className="fixed inset-0 -z-10">
            <HeroBackground />
          </div>
          <div className="relative z-0">
            <Header />
            {children}
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
