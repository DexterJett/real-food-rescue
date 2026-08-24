# NochGut – Lebensmittel retten

Web-App, die **Lebensmittelhersteller** (Bäckereien, Metzgereien, Restaurants, Hofläden, …) mit **Privatpersonen** verbindet. Betriebe stellen übrige, abgelaufene oder nur leicht unperfekte Lebensmittel zu einem selbst gewählten kleinen Preis ein. Privatpersonen stöbern, folgen ihrem Stammbetrieb und bekommen Mitteilungen zu ausgewählten Produkten.

Das Repo war leer – dieses MVP ist der erste lauffähige Stand.

## Was schon geht

- Zwei Rollen: **Privatperson** und **Hersteller**
- Angebote mit Kategorie, Zustand, Preis, Menge und Abholfenster
- Entdecken, Suchen, Filtern
- Folgen („mein Bäcker“) und Produkt-Abos (Brot, Joghurt, Gemüse, …)
- Mitteilungen, wenn ein passendes Angebot erscheint
- Reservieren mit Abholcode, Stornieren, Abholung bestätigen
- Deutsche Oberfläche, Demo-Daten in Berlin

## Was bewusst noch fehlt

- Keine Lieferung, nur Abholung vor Ort
- Keine Online-Zahlung (bar/Karte im Laden)
- Noch keine E-Mail- oder Push-Mitteilungen, nur in der App
- Noch keine Karte / Umkreis-Suche
- SQLite lokal, kein Produktions-Hosting

## Starten unter Windows

Voraussetzung: [Node.js 22](https://nodejs.org/) (LTS).

Im Projektordner (PowerShell oder Eingabeaufforderung):

```bat
copy .env.example .env
npm install
npm run db:setup
npm run dev
```

Dann im Browser: [http://localhost:3000](http://localhost:3000)

## Demo-Konten

Passwort jeweils `demo1234`:

| Rolle | E-Mail |
| --- | --- |
| Privatperson (folgt der Bäckerei, Abo Brot & Joghurt) | `emma@nochgut.de` |
| Bäckerei Sonnenschein | `baeckerei@nochgut.de` |
| Metzgerei Huber | `metzgerei@nochgut.de` |
| Restaurant Grüne Olive | `olive@nochgut.de` |
| Bio-Hofladen Müller | `hofladen@nochgut.de` |

Auf der Anmeldeseite gibt es zusätzlich Demo-Buttons.

## Nützliche Befehle

```bat
npm run dev
npm test
npm run lint
npm run db:setup
```

`db:setup` legt die SQLite-Datei neu an und spielt die Demo-Daten ein. Die Datei liegt unter `prisma/dev.db` und gehört nicht ins Git.

## Technik

- Next.js (App Router), TypeScript, Tailwind CSS
- Prisma + SQLite
- Sessions per httpOnly-Cookie (JWT)

## Produktannahmen für den Start

Diese Punkte sind erstmal so gewählt, damit wir schnell etwas Anfassbares haben. Sie können wir als Nächstes anpassen:

- Eine Stadt zuerst (Demo: Berlin)
- Hersteller bestimmen den Rettungspreis selbst
- MHD-Ware und optisch unperfektes Gemüse sind erlaubt, Verbrauchsdatum bleibt Verantwortung des Betriebs
- Mitteilungen entstehen nur für gefolgte Betriebe oder abonnierte Kategorien
