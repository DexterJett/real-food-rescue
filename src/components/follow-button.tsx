"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowAction } from "@/lib/actions/social";

export function FollowButton({
  producerId,
  following,
}: {
  producerId: string;
  following: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useOptimistic(following);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          setActive(!active);
          await toggleFollowAction(producerId);
          router.refresh();
        })
      }
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active
          ? "border border-line bg-card text-foreground"
          : "bg-brand text-white hover:bg-brand-dark"
      }`}
    >
      {pending ? "…" : active ? "Folgst du" : "Folgen"}
    </button>
  );
}
