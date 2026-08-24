import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function main() {
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
    },
  });

  const baker = await prisma.user.create({
    data: {
      email: "baeckerei@nochgut.de",
      name: "Klaus Sonnenschein",
      role: "PRODUCER",
      passwordHash,
      producer: {
        create: {
          businessName: "Bäckerei Sonnenschein",
          type: "BAKERY",
          description:
            "Familienbäckerei in Kreuzberg. Abends retten wir Brot, Brötchen und Kuchen, statt sie wegzuwerfen.",
          street: "Oranienstraße 42",
          zip: "10969",
          city: "Berlin",
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
            "Handwerksmetzgerei. Wurst und Fleisch, das heute nicht mehr in die Auslage soll, geben wir vergünstigt ab.",
          street: "Bergmannstraße 18",
          zip: "10961",
          city: "Berlin",
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
            "Saisonale Küche. Tagesgerichte und Vorspeisen, die nicht mehr auf die Karte kommen, retten wir am Abend.",
          street: "Kollwitzstraße 9",
          zip: "10405",
          city: "Berlin",
          pickupHint: "Abholung am Nebeneingang, Hofseite.",
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
            "Krummes Gemüse, reife Tomaten und Joghurt kurz vor dem MHD – alles noch gut, nur nicht mehr regalschön.",
          street: "Pappelallee 12",
          zip: "10437",
          city: "Berlin",
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
          "Zwei große Körnerbrote, heute gebacken, aber nicht mehr ganz knusprig in der Kruste. Noch hervorragend für Toast, Bruschetta oder Semmelknödel.",
        category: "BREAD",
        condition: "SURPLUS",
        originalPriceCents: 480,
        rescuePriceCents: 200,
        quantity: 4,
        reservedCount: 1,
        pickupStart: hoursFromNow(1),
        pickupEnd: hoursFromNow(6),
        status: "ACTIVE",
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
      },
    }),
    prisma.listing.create({
      data: {
        producerId: bakerId,
        title: "Apfelkuchen-Stücke",
        description:
          "Blechkuchen, der nicht mehr in die Auslage soll. Saftig, etwas weicher Belag, am selben Tag backen lassen.",
        category: "SWEETS",
        condition: "LEFTOVER",
        originalPriceCents: 320,
        rescuePriceCents: 120,
        quantity: 6,
        pickupStart: hoursFromNow(3),
        pickupEnd: hoursFromNow(8),
        status: "ACTIVE",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: butcherId,
        title: "Aufschnitt-Teller",
        description:
          "Gemischter Aufschnitt vom heutigen Schnitt. Kühl lagern und zeitnah verbrauchen. Kein MHD-Problem, nur zu viel aufgeschnitten.",
        category: "MEAT",
        condition: "SURPLUS",
        originalPriceCents: 890,
        rescuePriceCents: 390,
        quantity: 3,
        pickupStart: hoursFromNow(1),
        pickupEnd: hoursFromNow(5),
        status: "ACTIVE",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: butcherId,
        title: "Bratwurst-Packung",
        description:
          "Frische Bratwurst, MHD morgen. Durchgegart oder gut gekühlt noch einsetzbar. Bitte selbst prüfen.",
        category: "MEAT",
        condition: "BEST_BEFORE",
        originalPriceCents: 640,
        rescuePriceCents: 280,
        quantity: 5,
        pickupStart: hoursFromNow(2),
        pickupEnd: hoursFromNow(6),
        status: "ACTIVE",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: restaurantId,
        title: "Pasta-Box des Tages",
        description:
          "Tagliatelle mit Gemüsesugo, frisch gekocht, aber nicht mehr für den Abend servicefähig. Zum Mitnehmen, aufwärmen, genießen.",
        category: "READY_MEALS",
        condition: "LEFTOVER",
        originalPriceCents: 1450,
        rescuePriceCents: 590,
        quantity: 6,
        pickupStart: hoursFromNow(4),
        pickupEnd: hoursFromNow(9),
        status: "ACTIVE",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: restaurantId,
        title: "Grüner Salat mit Grillgemüse",
        description:
          "Vorspeisen, die nach dem Mittagsservice übrig sind. Knackig bis weich, Dressing separat.",
        category: "PRODUCE",
        condition: "LEFTOVER",
        originalPriceCents: 780,
        rescuePriceCents: 300,
        quantity: 4,
        pickupStart: hoursFromNow(3),
        pickupEnd: hoursFromNow(8),
        status: "ACTIVE",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: farmId,
        title: "Krumme Möhren & Paprika",
        description:
          "Krummes, fleckiges Gemüse vom Feld. Geschmacklich einwandfrei, optisch nicht regalwürdig. Perfekt für Suppe, Ofengemüse oder Saft.",
        category: "PRODUCE",
        condition: "IMPERFECT",
        originalPriceCents: 450,
        rescuePriceCents: 150,
        quantity: 10,
        pickupStart: hoursFromNow(0.5),
        pickupEnd: hoursFromNow(10),
        status: "ACTIVE",
      },
    }),
    prisma.listing.create({
      data: {
        producerId: farmId,
        title: "Naturjoghurt Becher",
        description:
          "Bio-Joghurt, MHD heute oder morgen. Geschlossen, gekühlt. Vor dem Essen riechen und prüfen.",
        category: "DAIRY",
        condition: "BEST_BEFORE",
        originalPriceCents: 220,
        rescuePriceCents: 80,
        quantity: 12,
        pickupStart: hoursFromNow(1),
        pickupEnd: hoursFromNow(8),
        status: "ACTIVE",
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
        body: "Laugenstangen-Mischung (Brot & Backwaren) ist jetzt zum Retten da.",
        read: false,
      },
      {
        userId: emma.id,
        listingId: listings[8].id,
        title: "Neues Angebot: Milchprodukte",
        body: "Bio-Hofladen Müller bietet Naturjoghurt Becher an.",
        read: false,
      },
    ],
  });

  console.log("Seed fertig. Demo-Logins:");
  console.log("  Privatperson: emma@nochgut.de / demo1234");
  console.log("  Bäckerei:     baeckerei@nochgut.de / demo1234");
  console.log("  Metzgerei:    metzgerei@nochgut.de / demo1234");
  console.log("  Restaurant:   olive@nochgut.de / demo1234");
  console.log("  Hofladen:     hofladen@nochgut.de / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
