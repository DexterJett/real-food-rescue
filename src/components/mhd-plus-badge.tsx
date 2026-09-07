import { formatDate } from "@/lib/format";

export function MhdPlusBadge({
  mhdPlus,
  bestBeforeDate,
  className = "",
}: {
  mhdPlus: boolean;
  bestBeforeDate?: Date | null;
  className?: string;
}) {
  if (!mhdPlus) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wide text-white ${className}`}
    >
      MHD+
      {bestBeforeDate ? ` · ${formatDate(bestBeforeDate)}` : ""}
    </span>
  );
}
