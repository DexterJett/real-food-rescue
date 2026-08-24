# NochGut – Lebensmittel retten in Liechtenstein

Web-App, die **Lebensmittelhersteller** (Bäckereien, Metzgereien, Restaurants, Hofläden, …) mit **Privatpersonen** verbindet. Betriebe stellen übrige, MHD+ oder nur leicht unperfekte Lebensmittel zu einem selbst gewählten kleinen Preis in **CHF** ein. Privatpersonen stöbern, folgen ihrem Stammbetrieb und bekommen Mitteilungen in der App, per **E-Mail** und optional per **WhatsApp**.

Startgebiet: **Liechtenstein**. Zahlung **nur vor Ort**.

## Was schon geht

- Zwei Rollen: **Privatperson** und **Hersteller**
- Angebote mit Foto, Kategorie, Zustand, MHD+-Kennzeichnung, Preis in CHF, Menge und Abholfenster
- Entdecken nach Gemeinde, Kategorie und MHD+
- Folgen („mein Bäcker“) und Produkt-Abos
- Mitteilungen in der App, per E-Mail und WhatsApp
- Reservieren mit Abholcode, Zahlung nur im Laden

## Starten unter Windows

Voraussetzung: [Node.js 22](https://nodejs.org/) (LTS).

```bat
copy .env.example .env
npm install
npm run db:setup
npm run dev
```

Dann im Browser: [http://localhost:3000](http://localhost:3000)

## Demo-Konten

Passwort jeweils `demo1234`:

| Rolle | E-Mail | Ort |
| --- | --- | --- |
| Privatperson (folgt der Bäckerei, Abo Brot & Joghurt, WhatsApp an) | `emma@nochgut.de` | Vaduz |
| Bäckerei Sonnenschein | `baeckerei@nochgut.de` | Vaduz |
| Metzgerei Huber | `metzgerei@nochgut.de` | Schaan |
| Restaurant Grüne Olive | `olive@nochgut.de` | Vaduz |
| Bio-Hofladen Müller | `hofladen@nochgut.de` | Triesen |

## E-Mail und WhatsApp

Ohne SMTP/Twilio speichert NochGut die Nachrichten im **Konto-Postausgang** (Status „Demo“). So siehst du den Inhalt, ohne Provider-Schlüssel.

Echte Zustellung:

- E-Mail: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` in `.env`
- WhatsApp: Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`)

## Nützliche Befehle

```bat
npm run dev
npm test
npm run lint
npm run db:setup
```
