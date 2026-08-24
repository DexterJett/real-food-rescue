import Link from "next/link";
import type { Listing, ProducerProfile } from "@prisma/client";
import {
  categoryEmoji,
  categoryLabel,
  conditionLabel,
  type Category,
  type Condition,
} from "@/lib/catalog";
import { formatMoney, formatPickupWindow } from "@/lib/format";
import { discountPercent, remainingQuantity } from "@/lib/listing-utils";
import { ListingPhoto } from "./listing-photo";
import { MhdPlusBadge } from "./mhd-plus-badge";

type CardListing = Listing & { producer: ProducerProfile };

export function ListingCard({ listing }: { listing: CardListing }) {
  const remaining = remainingQuantity(listing);
  const discount = discountPercent(
    listing.originalPriceCents,
    listing.rescuePriceCents,
  );
  const category = listing.category as Category;
  const condition = listing.condition as Condition;

  return (
    <Link
      href={`/angebote/${listing.id}`}
      prefetch={false}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_8px_30px_rgba(28,43,36,0.04)] transition hover:-translate-y-0.5 hover:border-brand/30"
    >
      <div className="relative">
        <ListingPhoto
          src={listing.imagePath}
          alt={listing.title}
          category={listing.category}
          className="h-44 w-full"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <MhdPlusBadge
            mhdPlus={listing.mhdPlus}
            bestBeforeDate={listing.bestBeforeDate}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="rounded-full bg-soft px-3 py-1 text-sm">
            {categoryEmoji[category]} {categoryLabel[category]}
          </span>
          {discount > 0 ? (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
              −{discount} %
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-2xl leading-tight group-hover:text-brand">
          {listing.title}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {listing.producer.businessName} · {listing.producer.city} LI
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-foreground/80">
          {listing.description}
        </p>
        <div className="mt-auto pt-5">
          <p className="text-xs uppercase tracking-wide text-muted">
            {conditionLabel[condition]} · {remaining} übrig
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-brand">
              {formatMoney(listing.rescuePriceCents)}
            </span>
            <span className="text-sm text-muted line-through">
              {formatMoney(listing.originalPriceCents)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
