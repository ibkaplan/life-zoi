"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { dataMode, dataModeSummary } from "@/lib/mode";
import { DisclaimerBlock } from "@/components/ui";
import { UserDataProvider } from "@/components/user-data-provider";
import { Wordmark } from "@/components/wordmark";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "My Profile" },
  { href: "/assessment", label: "Lifestyle Assessment" },
  { href: "/what-if", label: "WHAT IF?" },
  { href: "/progress", label: "Progress" },
  { href: "/recommendations", label: "Guidance" },
  { href: "/settings", label: "Settings" },
] as const;

const mobile = [
  { href: "/dashboard", label: "Home" },
  { href: "/assessment", label: "Assess" },
  { href: "/what-if", label: "What if?" },
  { href: "/progress", label: "Progress" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <UserDataProvider>
      <div className="min-h-full md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
          Skip to content
        </a>
        <aside className="hidden border-r border-line bg-surface/80 md:flex md:min-h-screen md:flex-col md:px-4 md:py-6">
          <Wordmark href="/dashboard" />
          <nav aria-label="Primary" className="mt-8 grid gap-1">
            <NavLinks />
          </nav>
          <p className="mt-auto pt-8 text-sm leading-relaxed text-muted">{dataModeSummary(dataMode)}</p>
        </aside>
        <div className="min-w-0 pb-24 md:pb-8">
          <div className="border-b border-line bg-sand/80 px-4 py-3 md:px-8">
            <p className="text-sm font-semibold text-ink">Local development mode</p>
            <p className="text-sm text-muted">{dataModeSummary(dataMode)}</p>
          </div>
          <main id="main" className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-5xl px-4 pb-4 md:px-8">
            <DisclaimerBlock />
          </footer>
        </div>
        <MobileBar />
      </div>
    </UserDataProvider>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`min-h-11 rounded-2xl px-3 py-2 font-semibold ${active ? "bg-sage text-forest" : "text-ink hover:bg-bg"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function MobileBar() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-2 py-2 md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {mobile.map((link) => {
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-2xl px-1 text-center text-sm font-semibold ${active ? "bg-sage text-forest" : "text-ink"}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" className="flex min-h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold" onClick={() => dialogRef.current?.showModal()}>
            More
          </button>
        </li>
      </ul>
      <dialog ref={dialogRef} aria-label="More destinations">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">More</h2>
            <button type="button" className="min-h-11 rounded-full px-3 font-semibold" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </div>
          <ul className="mt-3 grid gap-2">
            {[
              ["/profile", "My Profile"],
              ["/recommendations", "Guidance"],
              ["/settings", "Settings"],
              ["/privacy", "Privacy"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href as "/profile"} className="flex min-h-11 items-center rounded-2xl bg-sage px-3 font-semibold text-forest" onClick={() => dialogRef.current?.close()}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </nav>
  );
}
