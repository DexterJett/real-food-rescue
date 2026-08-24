import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { FollowButton } from "@/components/follow-button";
import { ListingCard } from "@/components/listing-card";
import {
  producerTypeLabel,
  type ProducerType,
} from "@/lib/catalog";

export const metadata: Metadata = { title: "Hersteller" };
export const dynamic = "force-dynamic";

export default async function ProducerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const producer = await prisma.producerProfile.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "ACTIVE", pickupEnd: { gt: new Date() } },
        include: { producer: true },
        orderBy: { pickupEnd: "asc" },
      },
      _count: { select: { followers: true } },
    },
  });
  if (!producer) notFound();

  const following = user
    ? Boolean(
        await prisma.follow.findUnique({
          where: { userId_producerId: { userId: user.id, producerId: id } },
        }),
      )
    : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="text-sm text-muted">
          {producerTypeLabel[producer.type as ProducerType]}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">{producer.businessName}</h1>
            <p className="mt-2 max-w-2xl text-muted">{producer.description}</p>
            <p className="mt-3 text-sm">
              {producer.street}, {producer.zip} {producer.city}
            </p>
            <p className="mt-1 text-sm text-muted">
              {producer._count.followers} folgen diesem Betrieb
            </p>
          </div>
          {user?.role === "CONSUMER" ? (
            <FollowButton producerId={producer.id} following={following} />
          ) : null}
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl">Aktuelle Angebote</h2>
      {producer.listings.length === 0 ? (
        <p className="mt-4 text-muted">Gerade nichts zu retten.</p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {producer.listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
