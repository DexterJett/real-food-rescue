import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { AccountForm } from "@/components/account-form";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Konto" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/anmelden");
  const params = await searchParams;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      phone: true,
      notifyEmail: true,
      notifyWhatsapp: true,
    },
  });
  if (!profile) redirect("/anmelden");

  const outbound = await prisma.outboundMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Konto & Mitteilungen</h1>
      <p className="mt-2 mb-8 text-muted">
        NochGut startet in Liechtenstein. Zahlung nur vor Ort. Hier stellst du
        E-Mail und WhatsApp ein.
      </p>
      <AccountForm
        email={profile.email}
        phone={profile.phone}
        notifyEmail={profile.notifyEmail}
        notifyWhatsapp={profile.notifyWhatsapp}
        saved={params.ok === "1"}
      />

      <section className="mt-12">
        <h2 className="font-display text-2xl">Postausgang</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          E-Mails und WhatsApp-Nachrichten, die NochGut verschickt hat – oder im
          Demo-Modus vorbereitet hat, solange SMTP/Twilio nicht gesetzt sind.
        </p>
        {outbound.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-card p-6 text-muted">
            Noch keine Nachrichten. Folge einem Betrieb oder warte auf ein neues
            Angebot.
          </p>
        ) : (
          <ul className="space-y-3">
            {outbound.map((item) => (
              <li
                key={item.id}
                className="rounded-3xl border border-line bg-card p-4"
              >
                <p className="text-xs uppercase tracking-wide text-muted">
                  {item.channel === "EMAIL" ? "E-Mail" : "WhatsApp"} ·{" "}
                  {item.status === "SENT"
                    ? "gesendet"
                    : item.status === "FAILED"
                      ? "fehlgeschlagen"
                      : "Demo / vorbereitet"}{" "}
                  · {formatDateTime(item.createdAt)}
                </p>
                <p className="mt-1 font-semibold">{item.subject}</p>
                <p className="mt-1 text-sm text-muted">an {item.to}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
