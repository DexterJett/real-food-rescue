"use client";

import { useTransition } from "react";
import {
  CATEGORIES,
  categoryEmoji,
  categoryLabel,
  type Category,
} from "@/lib/catalog";
import { toggleCategoryAction } from "@/lib/actions/social";

export function CategoryToggles({ selected }: { selected: string[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category: Category) => {
        const active = selected.includes(category);
        return (
          <button
            key={category}
            type="button"
            disabled={pending}
            onClick={() => start(() => toggleCategoryAction(category))}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              active
                ? "bg-brand text-white"
                : "border border-line bg-card text-muted hover:text-foreground"
            }`}
          >
            {categoryEmoji[category]} {categoryLabel[category]}
          </button>
        );
      })}
    </div>
  );
}
