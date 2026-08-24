import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hinweise" };

export default function HinweisePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl">So funktioniert NochGut</h1>
      <div className="mt-8 space-y-8 text-muted">
        <section>
          <h2 className="font-display text-2xl text-foreground">Für Betriebe</h2>
          <p className="mt-2">
            Bäckereien, Metzgereien, Restaurants, Cafés, Hofläden oder Kantinen
            stellen übrige oder nicht mehr ganz makellose Lebensmittel ein:
            Überproduktion, Tagesreste, krummes Gemüse oder Ware am
            Mindesthaltbarkeitsdatum. Den kleinen Preis legt ihr selbst fest.
            Privatpersonen reservieren und holen vor Ort ab.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">
            Für Privatpersonen
          </h2>
          <p className="mt-2">
            Du scrollst durch aktuelle Angebote oder filterst nach Kategorie.
            Folge deinem Stammbetrieb („mein Bäcker“) oder abonniere Produkte
            wie Brot und Joghurt. Neue Treffer erscheinen unter Mitteilungen.
            Nach der Reservierung bekommst du einen Abholcode.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">
            Lebensmittelrecht, kurz und klar
          </h2>
          <p className="mt-2">
            Das Mindesthaltbarkeitsdatum (MHD) ist kein Wegwerfdatum. Viele
            Produkte sind danach noch essbar – prüfen, riechen, kosten. Ein
            Verbrauchsdatum bei leicht verderblicher Ware (z. B. Hackfleisch)
            ist strenger. NochGut ist ein MVP zum Ausprobieren, kein
            Rechtsratgeber. Betriebe bleiben für Hygiene und Kennzeichnung
            verantwortlich.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Demo-Zugang</h2>
          <p className="mt-2">
            Zum Ausprobieren gibt es fertige Konten: emma@nochgut.de als
            Privatperson und baeckerei@nochgut.de als Bäckerei, Passwort jeweils
            demo1234. Über die Demo-Buttons auf der Anmeldeseite geht es noch
            schneller.
          </p>
        </section>
      </div>
    </div>
  );
}
