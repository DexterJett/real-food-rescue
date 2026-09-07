import Link from "next/link";
import { Leaf } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileNav } from "./mobile-nav";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const user = await getSessionUser();
  const unread = user
    ? await prisma.notification.count({
        where: { userId: user.id, read: false },
      })
    : 0;

  const links = user
    ? [
        { href: "/entdecken", label: "Entdecken" },
        ...(user.role === "CONSUMER"
          ? [
              { href: "/favoriten", label: "Mein Bäcker" },
              { href: "/reservierungen", label: "Reservierungen" },
              { href: "/mitteilungen", label: "Mitteilungen", badge: unread },
              { href: "/konto", label: "Konto" },
            ]
          : [
              { href: "/dashboard", label: "Betrieb" },
              { href: "/mitteilungen", label: "Mitteilungen", badge: unread },
              { href: "/konto", label: "Konto" },
            ]),
      ]
    : [
        { href: "/entdecken", label: "Angebote" },
        { href: "/hinweise", label: "So geht's" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-brand">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-card">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-xl tracking-tight text-foreground">
            NochGut
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-muted hover:text-foreground"
            >
              {link.label}
              {"badge" in link && link.badge ? (
                <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/anmelden"
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                Anmelden
              </Link>
              <Link
                href="/registrieren"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Mitmachen
              </Link>
            </>
          )}
        </div>

        <MobileNav
          links={links}
          userName={user?.name ?? null}
          signedIn={Boolean(user)}
        />
      </div>
    </header>
  );
}
