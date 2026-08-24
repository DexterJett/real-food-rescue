import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hinweise" };

export default function HinweisePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl">So funktioniert NochGut</h1>
      <div className="mt-8 space-y-8 text-muted">
        <section>
          <h2 className="font-display text-2xl text-foreground">
            Erstmal Liechtenstein
          </h2>
          <p className="mt-2">
            NochGut startet in den Gemeinden Liechtensteins – Vaduz, Schaan,
            Triesen, Balzers und den anderen. Preise sind in Schweizer Franken.
            Abholung und Zahlung nur vor Ort im Laden, bar oder mit Karte. Es
            gibt keine Lieferung und keine Online-Zahlung.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Für Betriebe</h2>
          <p className="mt-2">
            Bäckereien, Metzgereien, Restaurants, Cafés, Hofläden oder Kantinen
            stellen übrige oder nicht mehr ganz makellose Lebensmittel ein:
            Überproduktion, Tagesreste, krummes Gemüse oder MHD-Ware. MHD-Produkte
            werden mit <strong>MHD+</strong> gekennzeichnet. Ein Foto vom Produkt
            hilft enorm. Den kleinen Preis legt ihr selbst fest.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">
            Für Privatpersonen
          </h2>
          <p className="mt-2">
            Du scrollst durch aktuelle Angebote oder filterst nach Gemeinde,
            Kategorie und MHD+. Folge deinem Stammbetrieb oder abonniere Produkte
            wie Brot und Joghurt. Neue Treffer erscheinen in der App und werden
            zusätzlich per E-Mail geschickt – WhatsApp optional, wenn du eine
            Nummer hinterlegst. Nach der Reservierung bekommst du einen Abholcode.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">MHD+</h2>
          <p className="mt-2">
            Das Mindesthaltbarkeitsdatum ist kein Wegwerfdatum. MHD+ markiert
            Ware, deren MHD erreicht oder überschritten ist – oft noch gut,
            bitte selbst prüfen, riechen, kosten. Ein Verbrauchsdatum bei leicht
            verderblicher Ware (z. B. Hackfleisch) ist strenger. Betriebe bleiben
            für Hygiene und Kennzeichnung verantwortlich.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Demo-Zugang</h2>
          <p className="mt-2">
            Zum Ausprobieren: emma@nochgut.de als Privatperson in Vaduz und
            baeckerei@nochgut.de als Bäckerei in Vaduz, Passwort jeweils
            demo1234. Über die Demo-Buttons auf der Anmeldeseite geht es noch
            schneller.
          </p>
        </section>
      </div>
    </div>
  );
}
