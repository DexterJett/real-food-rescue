"use client";

import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-foreground"
      >
        Abmelden
      </button>
    </form>
  );
}
