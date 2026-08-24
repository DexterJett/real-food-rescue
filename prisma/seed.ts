import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await prisma.outboundMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.categorySubscription.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.producerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const emma = await prisma.user.create({
    data: {
      email: "emma@nochgut.de",
      name: "Emma Richter",
      role: "CONSUMER",
      passwordHash,
      phone: "+4232345678",
      notifyEmail: true,
      notifyWhatsapp: true,
    },
  });

  const baker = await prisma.user.create({
    data: {
      email: "baeckerei@nochgut.de",
      name: "Klaus Sonnenschein",
      role: "PRODUCER",
      passwordHash,
      phone: "+4232371111",
      notifyEmail: true,
      producer: {
        create: {
          businessName: "Bäckerei Sonnenschein",
          type: "BAKERY",
          description:
            "Familienbäckerei am Städtle in Vaduz. Abends retten wir Brot, Brötchen und Kuchen, statt sie wegzuwerfen.",
          street: "Städtle 17",
          zip: "9490",
          city: "Vaduz",
          pickupHint: "Eingang neben dem Café, bitte Abholcode nennen.",
        },
      },
    },
    include: { producer: true },
  });

  const butcher = await prisma.user.create({
    data: {
      email: "metzgerei@nochgut.de",
      name: "Anna Huber",
      role: "PRODUCER",
      passwordHash,
      producer: {
        create: {
          businessName: "Metzgerei Huber",
          type: "BUTCHER",
          description:
            "Handwerksmetzgerei in Schaan. Wurst und Fleisch, das heute nicht mehr in die Auslage soll, geben wir vergünstigt ab.",
          street: "Landstrasse 88",
          zip: "9494",
          city: "Schaan",
          pickupHint: "An der Theke, hintere Tür.",
        },
      },
    },
    include: { producer: true },
  });

  const restaurant = await prisma.user.create({
    data: {
      email: "olive@nochgut.de",
      name: "Lina Costa",
      role: "PRODUCER",
      passwordHash,
      producer: {
        create: {
          businessName: "Restaurant Grüne Olive",
          type: "RESTAURANT",
          description:
            "Saisonale Küche in Vaduz. Tagesgerichte, die nicht mehr auf die Karte kommen, retten wir am Abend.",
          street: "Städtle 5",
          zip: "9490",
          city: "Vaduz",
          pickupHint: "Abholung am Nebeneingang zur Äule.",
        },
      },
    },
    include: { producer: true },
  });

  const farm = await prisma.user.create({
    data: {
      email: "hofladen@nochgut.de",
      name: "Tom Müller",
      role: "PRODUCER",
      passwordHash,
      producer: {
        create: {
          businessName: "Bio-Hofladen Müller",
          type: "FARM_SHOP",
          description:
            "Krummes Gemüse, reife Tomaten und Joghurt mit MHD+ – alles noch gut, nur nicht mehr regalschön. In Triesen.",
          street: "Dorfstrasse 12",
          zip: "9495",
          city: "Triesen",
          pickupHint: "Hofladenkasse, Papiertüte mitnehmen.",
        },
      },
    },
    include: { producer: true },
  });

  const bakerId = baker.producer!.id;
  const butcherId = butcher.producer!.id;
  const restaurantId = restaurant.producer!.id;
  const farmId = farm.producer!.id;

  const listings = await prisma.$transaction([
    prisma.listing.create({
      data: {
        producerId: bakerId,
        title: "Körnerbrot vom Nachmittag",
        description:
          "Zwei grosse Körnerbrote, heute gebacken, aber nicht mehr ganz knusprig in der Kruste. Noch hervorragend für Toast oder Knödel.",
        category: "BREAD",
        condition: "SURPLUS",
        originalPriceCents: 480,
        rescuePriceCents: 200,
        quantity: 4,
        reservedCount: 1,
        pickupStart: hoursFromNow(1),
        pickupEnd: hoursFromNow(6),
        status: "ACTIVE",
        imagePath: "/seed/brot.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: bakerId,
        title: "Laugenstangen-Mischung",
        description:
          "Laugenstangen und Brezeln vom heutigen Verkauf. Weich, salzig, sofort essen oder einfrieren.",
        category: "BREAD",
        condition: "LEFTOVER",
        originalPriceCents: 350,
        rescuePriceCents: 150,
        quantity: 8,
        pickupStart: hoursFromNow(2),
        pickupEnd: hoursFromNow(7),
        status: "ACTIVE",
        imagePath: "/seed/laugen.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: bakerId,
        title: "Apfelkuchen-Stücke",
        description:
          "Blechkuchen, der nicht mehr in die Auslage soll. Saftig, etwas weicher Belag.",
        category: "SWEETS",
        condition: "LEFTOVER",
        originalPriceCents: 320,
        rescuePriceCents: 120,
        quantity: 6,
        pickupStart: hoursFromNow(3),
        pickupEnd: hoursFromNow(8),
        status: "ACTIVE",
        imagePath: "/seed/kuchen.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: butcherId,
        title: "Aufschnitt-Teller",
        description:
          "Gemischter Aufschnitt vom heutigen Schnitt. Kühl lagern und zeitnah verbrauchen.",
        category: "MEAT",
        condition: "SURPLUS",
        originalPriceCents: 890,
        rescuePriceCents: 390,
        quantity: 3,
        pickupStart: hoursFromNow(1),
        pickupEnd: hoursFromNow(5),
        status: "ACTIVE",
        imagePath: "/seed/aufschnitt.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: butcherId,
        title: "Bratwurst-Packung",
        description:
          "Frische Bratwurst, MHD gestern. Durchgegart oder gut gekühlt noch einsetzbar. Bitte selbst prüfen.",
        category: "MEAT",
        condition: "BEST_BEFORE",
        originalPriceCents: 640,
        rescuePriceCents: 280,
        quantity: 5,
        pickupStart: hoursFromNow(2),
        pickupEnd: hoursFromNow(6),
        status: "ACTIVE",
        imagePath: "/seed/wurst.svg",
        mhdPlus: true,
        bestBeforeDate: daysFromNow(-1),
      },
    }),
    prisma.listing.create({
      data: {
        producerId: restaurantId,
        title: "Pasta-Box des Tages",
        description:
          "Tagliatelle mit Gemüsesugo, frisch gekocht, aber nicht mehr für den Abend servicefähig.",
        category: "READY_MEALS",
        condition: "LEFTOVER",
        originalPriceCents: 1450,
        rescuePriceCents: 590,
        quantity: 6,
        pickupStart: hoursFromNow(4),
        pickupEnd: hoursFromNow(9),
        status: "ACTIVE",
        imagePath: "/seed/pasta.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: restaurantId,
        title: "Grüner Salat mit Grillgemüse",
        description:
          "Vorspeisen, die nach dem Mittagsservice übrig sind. Dressing separat.",
        category: "PRODUCE",
        condition: "LEFTOVER",
        originalPriceCents: 780,
        rescuePriceCents: 300,
        quantity: 4,
        pickupStart: hoursFromNow(3),
        pickupEnd: hoursFromNow(8),
        status: "ACTIVE",
        imagePath: "/seed/salat.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: farmId,
        title: "Krumme Möhren & Paprika",
        description:
          "Krummes, fleckiges Gemüse vom Feld. Geschmacklich einwandfrei, optisch nicht regalwürdig.",
        category: "PRODUCE",
        condition: "IMPERFECT",
        originalPriceCents: 450,
        rescuePriceCents: 150,
        quantity: 10,
        pickupStart: hoursFromNow(0.5),
        pickupEnd: hoursFromNow(10),
        status: "ACTIVE",
        imagePath: "/seed/gemuese.svg",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: farmId,
        title: "Naturjoghurt Becher",
        description:
          "Bio-Joghurt, MHD heute. Geschlossen, gekühlt. Vor dem Essen riechen und prüfen.",
        category: "DAIRY",
        condition: "BEST_BEFORE",
        originalPriceCents: 220,
        rescuePriceCents: 80,
        quantity: 12,
        pickupStart: hoursFromNow(1),
        pickupEnd: hoursFromNow(8),
        status: "ACTIVE",
        imagePath: "/seed/joghurt.svg",
        mhdPlus: true,
        bestBeforeDate: daysFromNow(0),
      },
    }),
  ]);

  await prisma.follow.create({
    data: { userId: emma.id, producerId: bakerId },
  });
  await prisma.categorySubscription.createMany({
    data: [
      { userId: emma.id, category: "BREAD" },
      { userId: emma.id, category: "DAIRY" },
    ],
  });

  await prisma.reservation.create({
    data: {
      listingId: listings[0].id,
      userId: emma.id,
      quantity: 1,
      pickupCode: "K7B2",
      status: "ACTIVE",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: emma.id,
        listingId: listings[1].id,
        title: "Neu bei Bäckerei Sonnenschein",
        body: "Laugenstangen-Mischung (Brot & Backwaren) ist jetzt zum Retten da. Zahlung nur vor Ort.",
        read: false,
      },
      {
        userId: emma.id,
        listingId: listings[8].id,
        title: "Neues Angebot: Milchprodukte",
        body: "Bio-Hofladen Müller bietet Naturjoghurt Becher MHD+ an. Zahlung nur vor Ort.",
        read: false,
      },
    ],
  });

  await prisma.outboundMessage.createMany({
    data: [
      {
        userId: emma.id,
        listingId: listings[8].id,
        channel: "EMAIL",
        to: emma.email,
        subject: "Neues Angebot: Milchprodukte · NochGut Liechtenstein",
        body: "Bio-Hofladen Müller bietet Naturjoghurt Becher MHD+ an. Zahlung nur vor Ort.\n\nBetrieb: Bio-Hofladen Müller, Triesen\nZahlung nur vor Ort (bar oder Karte im Laden).",
        status: "DEMO",
        error: "SMTP nicht konfiguriert",
      },
      {
        userId: emma.id,
        listingId: listings[8].id,
        channel: "WHATSAPP",
        to: emma.phone!,
        subject: "WhatsApp",
        body: "NochGut: Neues Angebot: Milchprodukte\nBio-Hofladen Müller bietet Naturjoghurt Becher MHD+ an. Zahlung nur vor Ort.",
        status: "DEMO",
        error: "WhatsApp/Twilio nicht konfiguriert",
      },
    ],
  });

  console.log("Seed fertig. Demo-Logins (Liechtenstein):");
  console.log("  Privatperson: emma@nochgut.de / demo1234");
  console.log("  Bäckerei:     baeckerei@nochgut.de / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
