"use client";

import { useTransition } from "react";
import { toggleFollowAction } from "@/lib/actions/social";

export function FollowButton({
  producerId,
  following,
}: {
  producerId: string;
  following: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => toggleFollowAction(producerId))}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        following
          ? "border border-line bg-card text-foreground"
          : "bg-brand text-white hover:bg-brand-dark"
      }`}
    >
      {pending ? "…" : following ? "Folgst du" : "Folgen"}
    </button>
  );
}
