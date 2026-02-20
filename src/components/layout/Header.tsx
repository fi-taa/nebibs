"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/learning", label: "Learning" },
  { href: "/experiments", label: "Experiments" },
  { href: "/service", label: "Service" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-card-bg/95 backdrop-blur dark:border-gray-800">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white"
        >
          Nebibs
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`transition-all duration-150 ${
                  isActive
                    ? "text-primary dark:text-secondary"
                    : "hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
