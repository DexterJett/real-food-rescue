"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

type NavLink = { href: string; label: string; badge?: number };

export function MobileNav({
  links,
  userName,
  signedIn,
}: {
  links: NavLink[];
  userName: string | null;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Menü"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-line p-2 text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-16 border-b border-line bg-card px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium"
              >
                {link.label}
                {link.badge ? ` (${link.badge})` : ""}
              </Link>
            ))}
            {signedIn ? (
              <>
                <p className="text-sm text-muted">{userName}</p>
                <form action={logoutAction}>
                  <button type="submit" className="text-sm font-semibold text-accent">
                    Abmelden
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/anmelden" onClick={() => setOpen(false)}>
                  Anmelden
                </Link>
                <Link
                  href="/registrieren"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-brand"
                >
                  Mitmachen
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
