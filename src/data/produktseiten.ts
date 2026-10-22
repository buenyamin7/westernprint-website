import { STAND, tabellen, zusatz } from './preise';
import { KLASSENPREIS_AB, modell as abschlussModell, euro as abschlussEuro } from './abschluss';

// Produktseiten /<slug>-bedrucken-lassen: Hoodies, T-Shirts, Pullover (seit 22.10.2026).
// Seite: src/pages/[produkt]-bedrucken-lassen.astro. Zielgruppe sind Firmen, Schulen, Vereine und Teams, die 10 bis 200 Stück
// auf einmal bestellen. Deshalb stehen die Staffelpreise ganz oben, nicht das Einzelstück.
//
// Regeln:
// - Preise nur über die Helfer unten aus src/data/preise.ts (netto und brutto, mit Stand). Nie Zahlen hart eintragen.
// - Drei Modelle je Seite in dieser Reihenfolge: Stedman als Empfehlung (günstig), Build Your Brand, Stanley/Stella (Bio).
// - Keine Stickerei, kein Siebdruck, kein Gratis-Muster, keine Abholung bewerben. Versand per DHL deutschlandweit.
// - Abschlussklassen haben eigene Klassenpreise (abschluss.ts), hier nur verlinken und den Klassenpreis nennen.

export const MENGEN = [1, 10, 50, 100, 200];

function tabelle(anfang: string) {
  const t = tabellen.find((tb) => tb.t.startsWith(anfang + ' ('));
  if (!t) throw new Error(`${anfang} fehlt in preise.ts`);
  return t;
}

const cent = (p: string) => {
  const m = p.match(/(\d+),(\d{2})/);
  if (!m) throw new Error(`Preis nicht lesbar: ${p}`);
  return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
};
const euro = (c: number) => `${Math.floor(c / 100).toLocaleString('de-DE')},${String(c % 100).padStart(2, '0')} €`;
/** Netto -> brutto: netto x 1,19, kaufmännisch auf Cent gerundet. */
export const brutto = (p: string) => euro(Math.round((cent(p) * 119) / 100));

/** Nettopreis pro Stück aus preise.ts, z. B. nettoPreis('Hoodie', 10) -> '18,25 €'. Fehlt die Staffel, bricht der Build ab. */
export function nettoPreis(anfang: string, menge: number): string {
  const z = tabelle(anfang).zeilen.find(([x]) => parseInt(x, 10) === menge);
  if (!z) throw new Error(`Keine Staffel ${menge} Stück für ${anfang}`);
  return z[1];
}
/** nb('Hoodie', 10) -> '18,25 € netto (21,72 € brutto)' */
export const nb = (anfang: string, menge: number) => `${nettoPreis(anfang, menge)} netto (${brutto(nettoPreis(anfang, menge))} brutto)`;
/** Gesamtsumme für stueck Teile zum Staffelpreis der Menge: summeNb('Hoodie', 10, 20) -> '365,00 € netto (434,35 € brutto)' */
export function summeNb(anfang: string, staffel: number, stueck: number): string {
  const n = cent(nettoPreis(anfang, staffel)) * stueck;
  return `${euro(n)} netto (${euro(Math.round((n * 119) / 100))} brutto)`;
}
/** 'Hoodie (Stedman Classic Hoodie, 280 g)' -> 'Stedman Classic Hoodie, 280 g' */
export const modellText = (anfang: string) => tabelle(anfang).t.match(/\((.+)\)/)?.[1] ?? '';

function zusatzPosten(name: string) {
  const z = zusatz.find((x) => x.t.startsWith(name));
  if (!z) throw new Error(`Zusatzleistung "${name}" fehlt in preise.ts`);
  return z;
}
/** zusatzNb('Zweite Druckseite') -> 'ab 4,00 € netto (4,76 € brutto)' */
export const zusatzNb = (name: string) => `${zusatzPosten(name).p} netto (${brutto(zusatzPosten(name).p)} brutto)`;
export const zusatzZeile = (name: string) => ({ t: zusatzPosten(name).t, p: zusatzPosten(name).p, brutto: brutto(zusatzPosten(name).p), d: zusatzPosten(name).d });

export const PREIS_STAND = STAND;

export interface Modell {
  /** Anfang des Tabellentitels in preise.ts, z. B. 'Hoodie', 'Hoodie Bio'. */
  tabelle: string;
  name: string;
  marke: string;
  tag: string;
  spec: string;
  img: string;
  empfehlung?: boolean;
}

export interface Produktseite {
  slug: string;
  name: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  image: string;
  imageAlt: string;
  introFrage: string;
  intro: string;
  modelle: Modell[];
  zielgruppenTitel: string;
  zielgruppenText: string;
  zielgruppen: { icon: string; t: string; d: string; href: string; cta: string }[];
  /** Namen von Zusatzleistungen aus preise.ts (Anfang von zusatz[].t). */
  zusatz: string[];
  faqs: { q: string; a: string }[];
  serviceType: string;
  llms: string;
}

const S = PREIS_STAND;
const abschlussHoodie = abschlussModell('classic-hoodie');
const abschlussShirt = abschlussModell('classic-t');

const RECHNUNG = 'Ihr bekommt eine Rechnung der westernprint GmbH mit ausgewiesener Umsatzsteuer. Neue Kunden zahlen vorab per Überweisung, für Stammkunden ist Zahlung auf Rechnung nach Absprache möglich. Die Rechnung geht auf Wunsch an die Firma, die Schule, den Förderverein oder den Verein.';
const LIEFERZEIT = 'Das Angebot kommt an Werktagen innerhalb von 24 Stunden, mit festem Stückpreis und Liefertermin. Nach eurer Freigabe des Korrekturabzugs ist eine Serie in 5 bis 7 Werktagen fertig, Einzelstücke in 1 bis 3 Werktagen. Danach geht die Ware per DHL mit Sendungsnummer raus, deutschlandweit.';
const WASCHEN = 'Ja. Wir drucken per DTF, deckend auf hellen und dunklen Stoffen, dehnbar und waschfest. Das Verfahren nutzen wir auch für Arbeitskleidung, die täglich gewaschen wird. Waschen bei 30 Grad auf links, ohne Weichspüler, nicht in den Trockner.';

export const produktseiten: Produktseite[] = [
  {
    slug: 'hoodies', name: 'Hoodies',
    title: `Hoodies bedrucken lassen ab ${nettoPreis('Hoodie', 200)} netto, 1 bis 200 Stück`,
    description: `Hoodies mit Logo oder Motiv bedrucken lassen: Classic Hoodie ab ${nettoPreis('Hoodie', 200)} netto bei 200 Stück, ${nettoPreis('Hoodie', 10)} ab 10 Stück, dazu Heavy Hoody und Cruiser 2.0. DTF-Druck in Oberhausen, Versand deutschlandweit, Angebot in 24 Stunden.`,
    eyebrow: 'Hoodies bedrucken lassen',
    h1: "Hoodies bedrucken lassen. <span class='hl'>Ab 1 Stück, Staffelpreise ab 10.</span>",
    lede: `Hoodies mit Logo, Motto oder Namensliste für Firmen, Schulen, Vereine und Teams. Ein Classic Hoodie mit einem Druck kostet bei 10 Stück ${nettoPreis('Hoodie', 10)} netto pro Stück, bei 100 Stück ${nettoPreis('Hoodie', 100)}. Gedruckt in Oberhausen, verschickt per DHL in ganz Deutschland.`,
    image: '/img/streetwear-group.jpg',
    imageAlt: 'Vier junge Leute in bedruckbaren Oversize-Hoodies',
    introFrage: 'Was kostet es, Hoodies bedrucken zu lassen?',
    intro: `Bei westernprint kostet ein Hoodie mit einem Druck ${nb('Hoodie', 1)} als Einzelstück, ${nb('Hoodie', 10)} pro Stück ab 10 Stück, ${nb('Hoodie', 50)} ab 50 Stück und ${nb('Hoodie', 100)} ab 100 Stück, Stand ${S}. Das ist der Stedman Classic Hoodie mit 280 g/m², Textil und Druck inklusive, ohne Einrichtungskosten. Der Heavy Hoody von Build Your Brand kostet ab 10 Stück ${nb('Hoodie Heavy', 10)}, der Cruiser 2.0 von Stanley/Stella aus Bio-Baumwolle ${nb('Hoodie Bio', 10)}. Gedruckt wird per DTF in der eigenen Werkstatt in Oberhausen. Serien sind 5 bis 7 Werktage nach Freigabe des Korrekturabzugs fertig und gehen per DHL in ganz Deutschland raus. Mischgrößen und Mischfarben kosten keinen Aufpreis, Firmen, Schulen und Vereine bekommen eine Rechnung mit ausgewiesener Umsatzsteuer.`,
    modelle: [
      { tabelle: 'Hoodie', name: 'Classic Hoodie', marke: 'Stedman', tag: 'Unsere Empfehlung', spec: '280 g/m², Kängurutasche, XS bis 5XL, 11 Farben', img: '/img/products/classic-hoodie-black-opal.webp', empfehlung: true },
      { tabelle: 'Hoodie Heavy', name: 'Heavy Hoody BY011', marke: 'Build Your Brand', tag: 'Schwer, Regular Fit', spec: '300 g/m², bis 5XL, über 30 Farben', img: '/img/products/byb-by011-black.webp' },
      { tabelle: 'Hoodie Bio', name: 'Cruiser 2.0', marke: 'Stanley/Stella', tag: 'Bio-Baumwolle, Premium', spec: '350 g/m², GOTS, doppellagige Kapuze, über 50 Farben', img: '/img/products/cruiser-2-0-black-flat.webp' },
    ],
    zielgruppenTitel: 'Wer bei uns Hoodies bedrucken lässt',
    zielgruppenText: 'Die meisten Bestellungen kommen als Sammelbestellung: eine Liste mit Größen, ein Korrekturabzug, ein Paket, eine Rechnung.',
    zielgruppen: [
      { icon: 'graduation-cap', t: 'Abschlussklassen', d: `Motto vorne, alle Namen hinten, Mischgrößen ohne Aufpreis. Für Abschlussklassen gibt es eigene Klassenpreise ab ${KLASSENPREIS_AB} Stück mit Druck vorne und hinten, zum Beispiel ${abschlussEuro(abschlussHoodie.preisAb10)} € brutto für den Classic Hoodie. Das Design ist dort kostenlos.`, href: '/fuer/abschlussklassen', cta: 'Abschluss-Hoodies mit Klassenpreisen' },
      { icon: 'buildings', t: 'Firmen und Büro', d: 'Firmenlogo auf der Brust, auf Wunsch Claim oder Webadresse auf dem Rücken. Größenliste pro Person, einzeln nachbestellbar, Rechnung mit ausgewiesener Umsatzsteuer.', href: '/fuer/firmen-und-buero', cta: 'Firmenkleidung mit Logo' },
      { icon: 'users', t: 'Vereine und Teams', d: 'Vereins-Hoodies mit Logo, Sponsor, Namen und Nummern, jedes Teil einzeln nach eurer Liste. Die Rechnung geht an den Verein.', href: '/fuer/sportvereine', cta: 'Vereinskleidung mit Namen' },
      { icon: 'backpack', t: 'Schulen und Hochschulen', d: 'Hoodies fürs Kollegium, die Klassenfahrt, den Jahrgang oder die Fachschaft, in Größen von 0 Monaten bis 5XL. Rechnung an Schule, Förderverein oder Fachschaft.', href: '/fuer/hochschulen-und-fachschaften', cta: 'Hoodies für Fachschaften' },
    ],
    zusatz: ['Großer Rückendruck statt Brustdruck', 'Zweite Druckseite', 'Namen und Rückennummern', 'Nackenprint', 'Ärmeldruck'],
    faqs: [
      { q: 'Was kosten 20 Hoodies mit Logo?', a: `20 Stedman Classic Hoodies mit einem Druck kosten ${summeNb('Hoodie', 10, 20)}, also ${nb('Hoodie', 10)} pro Stück, Stand ${S}. Dazu kommt der Versand per DHL. 20 Cruiser 2.0 von Stanley/Stella kosten ${summeNb('Hoodie Bio', 10, 20)}. Ein zweiter Druck auf dem Rücken kostet ${zusatzNb('Zweite Druckseite')} pro Hoodie zusätzlich.` },
      { q: 'Was kosten 50 oder 100 Hoodies?', a: `Ab 50 Stück kostet der Classic Hoodie ${nb('Hoodie', 50)} pro Stück, ab 100 Stück ${nb('Hoodie', 100)} und ab 200 Stück ${nb('Hoodie', 200)}. 100 Classic Hoodies mit einem Druck kosten damit ${summeNb('Hoodie', 100, 100)}, Stand ${S}. Einrichtungskosten fallen nicht an.` },
      { q: 'Was kostet ein einzelner Hoodie mit eigenem Motiv?', a: `Ein einzelner Classic Hoodie mit einem Druck kostet ${nb('Hoodie', 1)}, der Cruiser 2.0 ${nb('Hoodie Bio', 1)}, Stand ${S}. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig. Einzelne Hoodies kannst du auch direkt im Shop gestalten und bestellen.` },
      { q: 'Welchen Hoodie sollen wir nehmen?', a: 'Für Vereine, Schulen und Firmen empfehlen wir den Stedman Classic Hoodie: 280 g/m², Größen XS bis 5XL, der beste Preis. Wer einen schwereren Stoff will, nimmt den Heavy Hoody von Build Your Brand mit 300 g/m². Wer Bio-Baumwolle und Premium-Qualität will, nimmt den Cruiser 2.0 von Stanley/Stella mit 350 g/m² und GOTS-Zertifikat. Alle drei gibt es in gemischten Größen und Farben in einer Bestellung.' },
      { q: 'Gibt es eine Mindestmenge?', a: 'Nein. Wir drucken Hoodies ab 1 Stück. Ab 10 Stück gilt der Staffelpreis, ab 50, 100 und 200 Stück wird es jeweils günstiger. Mischgrößen und Mischfarben kosten keinen Aufpreis.' },
      { q: 'Wie lange dauert es?', a: LIEFERZEIT },
      { q: 'Bekommen Firma, Schule oder Verein eine Rechnung?', a: RECHNUNG },
      { q: 'Können wir vorne und hinten drucken lassen?', a: `Ja. Eine zweite Druckseite kostet ${zusatzNb('Zweite Druckseite')} pro Hoodie, zum Beispiel Logo vorne und großes Motiv oder Namensliste hinten. Ein Nackenprint statt Herstelleretikett kostet ${zusatzNb('Nackenprint')}, ein Ärmeldruck ${zusatzNb('Ärmeldruck')}.` },
      { q: 'Hält der Druck auf dem Hoodie?', a: WASCHEN },
      { q: 'Können wir später einzelne Hoodies nachbestellen?', a: 'Ja. Eure Druckdaten bleiben gespeichert. Neue Mitarbeitende, neue Mitglieder oder Nachzügler bekommen ihren Hoodie einzeln, mit demselben Druck wie der Rest. Einzelstücke sind in 1 bis 3 Werktagen fertig.' },
      { q: 'Könnt ihr vorher ein Muster machen?', a: 'Ja, ein Muster ist ab 1 Stück möglich, zum Preis für ein Einzelstück. Für Serien reicht meist der Korrekturabzug: Vor dem Druck seht ihr euer Motiv mit den genauen Maßen auf dem Hoodie und gebt frei.' },
    ],
    serviceType: 'Textildruck auf Hoodies, Firmen-Hoodies, Vereins-Hoodies, Abschluss-Hoodies',
    llms: 'Hoodies mit Logo bedrucken lassen: Preise für 1, 10, 50, 100 und 200 Stück, Classic Hoodie, Heavy Hoody BY011 und Cruiser 2.0',
  },
  {
    slug: 't-shirts', name: 'T-Shirts',
    title: `T-Shirts bedrucken lassen ab ${nettoPreis('T-Shirt Basic', 200)} netto, 1 bis 200 Stück`,
    description: `T-Shirts mit Logo bedrucken lassen: Basic-Shirt ab ${nettoPreis('T-Shirt Basic', 200)} netto bei 200 Stück, ${nettoPreis('T-Shirt Basic', 10)} ab 10 Stück, dazu Bio-Shirt und Heavy Oversize. DTF und DTG in Oberhausen, Versand deutschlandweit, Angebot in 24 Stunden.`,
    eyebrow: 'T-Shirts bedrucken lassen',
    h1: "T-Shirts bedrucken lassen. <span class='hl'>Ab 1 Stück, ab 10 mit Staffelpreis.</span>",
    lede: `T-Shirts mit Logo, Motiv, Namen oder Nummern für Firmen, Vereine, Schulen und Events. Ein Basic-Shirt mit einem Druck kostet bei 10 Stück ${nettoPreis('T-Shirt Basic', 10)} netto pro Stück, bei 100 Stück ${nettoPreis('T-Shirt Basic', 100)}. Gedruckt in Oberhausen, verschickt per DHL in ganz Deutschland.`,
    image: '/img/packtisch.jpg',
    imageAlt: 'Frisch bedruckte Shirts auf dem Packtisch mit Klebeband, Schere und Versandkarton',
    introFrage: 'Was kostet es, T-Shirts bedrucken zu lassen?',
    intro: `Bei westernprint kostet ein T-Shirt mit einem Druck ${nb('T-Shirt Basic', 1)} als Einzelstück, ${nb('T-Shirt Basic', 10)} pro Stück ab 10 Stück, ${nb('T-Shirt Basic', 50)} ab 50 Stück, ${nb('T-Shirt Basic', 100)} ab 100 Stück und ${nb('T-Shirt Basic', 200)} ab 200 Stück, Stand ${S}. Das ist das Stedman Classic-T mit 155 g/m², Textil und Druck inklusive, ohne Einrichtungskosten. Das Bio-Shirt Creator 2.0 von Stanley/Stella kostet ab 10 Stück ${nb('T-Shirt Bio', 10)}, das Heavy Oversize Tee von Build Your Brand ${nb('T-Shirt Heavy Oversize', 10)}. Gedruckt wird per DTF, Fotos und feine Verläufe auf Baumwolle per DTG, in der eigenen Werkstatt in Oberhausen. Serien sind 5 bis 7 Werktage nach Freigabe fertig und gehen per DHL in ganz Deutschland raus. Mischgrößen kosten keinen Aufpreis, Namen und Nummern druckt westernprint einzeln pro Teil.`,
    modelle: [
      { tabelle: 'T-Shirt Basic', name: 'Classic-T', marke: 'Stedman', tag: 'Unsere Empfehlung', spec: '155 g/m², XXS bis 5XL, 34 Farben, Damen und Unisex', img: '/img/products/classic-t-black-opal.webp', empfehlung: true },
      { tabelle: 'T-Shirt Heavy Oversize', name: 'Heavy Oversize Tee BY102', marke: 'Build Your Brand', tag: 'Schwer, Boxy', spec: '240 g/m², tiefe Schulter, über 40 Farben', img: '/img/products/byb-by102-black.webp' },
      { tabelle: 'T-Shirt Bio', name: 'Creator 2.0', marke: 'Stanley/Stella', tag: 'Bio-Baumwolle', spec: '180 g/m², GOTS, über 50 Farben, Kinder- und Babygrößen', img: '/img/products/creator-2-0-black-flat.webp' },
    ],
    zielgruppenTitel: 'Wer bei uns T-Shirts bedrucken lässt',
    zielgruppenText: 'Vom Firmenshirt bis zum Sponsorenlauf: eine Größenliste, ein Korrekturabzug, ein Paket. Für jede Gruppe gibt es eine eigene Seite mit Ablauf und Antworten.',
    zielgruppen: [
      { icon: 'wrench', t: 'Firmen und Handwerk', d: 'Firmenlogo auf Brust oder Rücken, Telefonnummer oder Webadresse dazu. Einzeln nachbestellbar für neue Mitarbeitende, eigene Arbeitskleidung könnt ihr anliefern.', href: '/fuer/handwerksbetriebe', cta: 'Arbeitskleidung mit Firmenlogo' },
      { icon: 'users', t: 'Vereine und Teams', d: `Vereinslogo, Sponsor, Namen und Rückennummern, jedes Teil einzeln nach Liste. Namen und Nummern kosten ${zusatzNb('Namen und Rückennummern')} pro Teil. Der Druck hält auch auf Funktionsware aus Polyester.`, href: '/fuer/sportvereine', cta: 'Trikots und Vereinsshirts' },
      { icon: 'backpack', t: 'Kitas und Schulen', d: `Schul-Shirts, Kita-Abschluss und Klassenfahrt, Größen ab 0 Monaten bis 5XL, auf Wunsch mit dem Namen jedes Kindes. Für Abschlussklassen gibt es Klassenpreise mit Druck vorne und hinten, zum Beispiel ${abschlussEuro(abschlussShirt.preisAb10)} € brutto für das Classic-T.`, href: '/fuer/kitas-und-schulen', cta: 'Kita- und Schul-Shirts' },
      { icon: 'confetti', t: 'Events, Firmenlauf, Feiern', d: 'Laufshirts mit Firmenlogo und Teamname, Crew-Shirts fürs Festival, Shirts für JGA und Geburtstag. Ein Motiv, viele Größen, fester Termin.', href: '/fuer/firmenlauf-und-sponsorenlauf', cta: 'Laufshirts und Event-Shirts' },
    ],
    zusatz: ['Großer Rückendruck statt Brustdruck', 'Zweite Druckseite', 'Namen und Rückennummern', 'Ärmeldruck', 'Nackenprint'],
    faqs: [
      { q: 'Was kosten 50 T-Shirts mit Logo?', a: `50 Stedman Classic-T mit einem Druck kosten ${summeNb('T-Shirt Basic', 50, 50)}, also ${nb('T-Shirt Basic', 50)} pro Stück, Stand ${S}. Dazu kommt der Versand per DHL. 50 Bio-Shirts Creator 2.0 kosten ${summeNb('T-Shirt Bio', 50, 50)}. Ein zweiter Druck auf dem Rücken kostet ${zusatzNb('Zweite Druckseite')} pro Shirt zusätzlich.` },
      { q: 'Was kosten 100 T-Shirts mit Logo?', a: `100 Classic-T mit einem Druck kosten ${summeNb('T-Shirt Basic', 100, 100)}, also ${nb('T-Shirt Basic', 100)} pro Stück. Ab 200 Stück sind es ${nb('T-Shirt Basic', 200)} pro Stück. Stand ${S}, Einrichtungskosten fallen nicht an.` },
      { q: 'Was kostet ein einzelnes T-Shirt mit eigenem Motiv?', a: `Ein einzelnes Classic-T mit einem Druck kostet ${nb('T-Shirt Basic', 1)}, das Bio-Shirt Creator 2.0 ${nb('T-Shirt Bio', 1)}, Stand ${S}. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig und lassen sich auch direkt im Shop gestalten.` },
      { q: 'Basic-Shirt oder Bio-Shirt?', a: 'Das Stedman Classic-T ist der günstige Klassiker für Vereine, Events und Give-aways, 155 g/m², Größen XXS bis 5XL. Das Creator 2.0 von Stanley/Stella ist aus GOTS-zertifizierter Bio-Baumwolle, 180 g/m², weicher im Griff, mit Kinder- und Babygrößen in derselben Farbe. Wer schweren Stoff und einen weiten Schnitt will, nimmt das Heavy Oversize Tee von Build Your Brand mit 240 g/m².' },
      { q: 'Könnt ihr Namen und Nummern auf jedes Shirt drucken?', a: `Ja. Jedes Shirt bekommt seinen eigenen Namen oder seine Nummer, eine Liste mit Name, Nummer und Größe reicht. Das kostet ${zusatzNb('Namen und Rückennummern')} pro Teil zusätzlich zum Stückpreis.` },
      { q: 'Können wir eigene T-Shirts anliefern?', a: 'Ja. Angelieferte Shirts bedrucken wir, dann zahlt ihr nur den Druck. Nennt vorher kurz das Material, wir prüfen die Eignung. Plant 2 bis 3 Prozent Reserve ein, für Materialfehler an angelieferter Ware haften wir nicht.' },
      { q: 'Gibt es eine Mindestmenge?', a: 'Nein. Wir drucken T-Shirts ab 1 Stück. Ab 10 Stück gilt der Staffelpreis, ab 50, 100 und 200 Stück wird es jeweils günstiger. Mischgrößen und Mischfarben kosten keinen Aufpreis.' },
      { q: 'Wie lange dauert es?', a: LIEFERZEIT },
      { q: 'Bekommen Firma, Schule oder Verein eine Rechnung?', a: RECHNUNG },
      { q: 'DTF oder DTG: Was bekommen wir?', a: 'Standard ist DTF: kräftige, deckende Farben auf hellen und dunklen Shirts, auch auf Mischgewebe und Polyester, dehnbar und waschfest. Fotos und feine Verläufe drucken wir per DTG direkt in die Baumwollfaser. Wir wählen nach Motiv und Textil und sagen euch im Angebot, was wir nehmen.' },
      { q: 'Hält der Druck beim Waschen?', a: WASCHEN },
    ],
    serviceType: 'Textildruck auf T-Shirts, Firmen-Shirts, Vereinsshirts, Schul-Shirts, Event-Shirts',
    llms: 'T-Shirts mit Logo bedrucken lassen: Preise für 1, 10, 50, 100 und 200 Stück, Classic-T, Heavy Oversize Tee BY102 und Creator 2.0',
  },
  {
    slug: 'pullover', name: 'Pullover',
    title: `Pullover bedrucken lassen ab ${nettoPreis('Sweatshirt', 200)} netto, 1 bis 200 Stück`,
    description: `Pullover und Sweatshirts mit Logo oder Namensliste bedrucken lassen: Classic Sweatshirt ab ${nettoPreis('Sweatshirt', 200)} netto bei 200 Stück, ${nettoPreis('Sweatshirt', 10)} ab 10 Stück, Changer 2.0 aus Bio-Baumwolle, Abschlusspullis mit Klassenpreis. DTF-Druck in Oberhausen, Versand deutschlandweit.`,
    eyebrow: 'Pullover bedrucken lassen',
    h1: "Pullover bedrucken lassen. <span class='hl'>Sweatshirts ohne Kapuze, ab 1 Stück.</span>",
    lede: `Rundhals-Sweatshirts mit Logo, Motto oder Namensliste für Abschlussklassen, Firmen, Chöre und Vereine. Ein Classic Sweatshirt mit einem Druck kostet bei 10 Stück ${nettoPreis('Sweatshirt', 10)} netto pro Stück, bei 100 Stück ${nettoPreis('Sweatshirt', 100)}. Mit Kapuze geht es auf der Hoodie-Seite weiter.`,
    image: '/img/druck-outside.jpg',
    imageAlt: 'Mehrfarbiger DTF-Druck mit Bergmotiv auf grau meliertem Sweatshirt',
    introFrage: 'Was kostet es, Pullover bedrucken zu lassen?',
    intro: `Bei westernprint kostet ein Pullover mit einem Druck ${nb('Sweatshirt', 1)} als Einzelstück, ${nb('Sweatshirt', 10)} pro Stück ab 10 Stück, ${nb('Sweatshirt', 50)} ab 50 Stück und ${nb('Sweatshirt', 100)} ab 100 Stück, Stand ${S}. Das ist das Stedman Classic Sweatshirt mit 280 g/m², ein Rundhals-Sweater ohne Kapuze, Textil und Druck inklusive. Der Changer 2.0 von Stanley/Stella aus Bio-Baumwolle kostet ab 10 Stück ${nb('Sweatshirt Bio', 10)}, der Classic Hoodie mit Kapuze ${nb('Hoodie', 10)}. Abschlussklassen bekommen eigene Klassenpreise ab ${KLASSENPREIS_AB} Stück mit Druck vorne und hinten, das Design ist dort kostenlos. Gedruckt wird per DTF in Oberhausen, Serien sind 5 bis 7 Werktage nach Freigabe fertig und gehen per DHL in ganz Deutschland raus.`,
    modelle: [
      { tabelle: 'Sweatshirt', name: 'Classic Sweatshirt', marke: 'Stedman', tag: 'Unsere Empfehlung', spec: '280 g/m², Rundhals, XS bis 5XL, 11 Farben', img: '/img/products/classic-sweatshirt-black-opal.webp', empfehlung: true },
      { tabelle: 'Hoodie', name: 'Classic Hoodie', marke: 'Stedman', tag: 'Mit Kapuze', spec: '280 g/m², Kängurutasche, XS bis 5XL, 11 Farben', img: '/img/products/classic-hoodie-black-opal.webp' },
      { tabelle: 'Sweatshirt Bio', name: 'Changer 2.0', marke: 'Stanley/Stella', tag: 'Bio-Baumwolle', spec: '350 g/m², GOTS, über 40 Farben, auch Kinder- und Babygrößen', img: '/img/products/changer-2-0-black-flat.webp' },
    ],
    zielgruppenTitel: 'Wer bei uns Pullover bedrucken lässt',
    zielgruppenText: 'Der Rundhals-Sweater ist der Pullover für alle, die keine Kapuze wollen: Chöre, Büros, Fachschaften und Abschlussjahrgänge.',
    zielgruppen: [
      { icon: 'graduation-cap', t: 'Abschlussklassen', d: `Abschlusspullis mit Motto vorne und Namensliste hinten. Klassenpreis ab ${KLASSENPREIS_AB} Stück, zum Beispiel ${abschlussEuro(abschlussHoodie.preisAb10)} € brutto für den Classic Hoodie inklusive beider Drucke, Design kostenlos.`, href: '/fuer/abschlussklassen', cta: 'Abschlusspullis mit Klassenpreisen' },
      { icon: 'buildings', t: 'Firmen und Büro', d: 'Sweatshirts mit Logo fürs Team, den Messestand oder das Homeoffice-Paket. Größenliste pro Person, Rechnung mit ausgewiesener Umsatzsteuer, einzeln nachbestellbar.', href: '/fuer/firmen-und-buero', cta: 'Firmenkleidung mit Logo' },
      { icon: 'music-notes', t: 'Chöre, Musikzüge, Ehrenamt', d: 'Ein Motiv für die ganze Gruppe, gemischte Größen ohne Aufpreis, Rechnung an den Verein. Auch kleine Mengen ab 10 Stück sind ein normaler Auftrag.', href: '/fuer/vereine-und-ehrenamt', cta: 'Kleidung für Vereine' },
      { icon: 'student', t: 'Hochschulen und Fachschaften', d: 'Fachschafts-Pullover und Semester-Merch als Sammelbestellung per Größenliste, Nachbestellung für neue Semester mit denselben Druckdaten.', href: '/fuer/hochschulen-und-fachschaften', cta: 'Pullover für Fachschaften' },
    ],
    zusatz: ['Großer Rückendruck statt Brustdruck', 'Zweite Druckseite', 'Namen und Rückennummern', 'Nackenprint', 'Ärmeldruck'],
    faqs: [
      { q: 'Was kosten 30 Pullover mit Logo?', a: `30 Stedman Classic Sweatshirts mit einem Druck kosten ${summeNb('Sweatshirt', 10, 30)}, also ${nb('Sweatshirt', 10)} pro Stück, Stand ${S}. Dazu kommt der Versand per DHL. 30 Changer 2.0 von Stanley/Stella kosten ${summeNb('Sweatshirt Bio', 10, 30)}.` },
      { q: 'Was kosten Abschlusspullis für die ganze Stufe?', a: `Für Abschlussklassen gelten eigene Klassenpreise ab ${KLASSENPREIS_AB} Stück, mit Motto vorne und Namensliste hinten: der Stedman Classic Hoodie kostet ${abschlussEuro(abschlussHoodie.preisAb10)} € brutto pro Stück, das Classic-T ${abschlussEuro(abschlussShirt.preisAb10)} € brutto, Design inklusive. Alle Modelle und das Rechenbeispiel stehen auf der Seite für Abschlussklassen.` },
      { q: 'Sweatshirt oder Hoodie?', a: `Das Sweatshirt hat einen Rundhals ohne Kapuze und ist etwas günstiger: ${nb('Sweatshirt', 10)} ab 10 Stück gegenüber ${nb('Hoodie', 10)} für den Classic Hoodie. Beide haben 280 g/m² und dieselben Farben. Für Chöre, Büros und Auftritte wird meist das Sweatshirt genommen, für Jahrgänge und Vereine der Hoodie. Ihr könnt beides in einer Bestellung mischen.` },
      { q: 'Was kostet ein einzelner Pullover mit Motiv?', a: `Ein einzelnes Classic Sweatshirt mit einem Druck kostet ${nb('Sweatshirt', 1)}, der Changer 2.0 ${nb('Sweatshirt Bio', 1)}, Stand ${S}. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig.` },
      { q: 'Könnt ihr eine Namensliste auf den Rücken drucken?', a: `Ja. Schickt die Namen als Excel-, Word- oder Textdatei, wir setzen sie sauber auf den Rücken. Als zweite Druckseite kostet das ${zusatzNb('Zweite Druckseite')} pro Pullover. Bei Abschlussklassen ist der Druck vorne und hinten im Klassenpreis schon drin.` },
      { q: 'Gibt es eine Mindestmenge?', a: 'Nein. Wir drucken Pullover ab 1 Stück. Ab 10 Stück gilt der Staffelpreis, ab 50, 100 und 200 Stück wird es jeweils günstiger. Mischgrößen und Mischfarben kosten keinen Aufpreis.' },
      { q: 'Wie lange dauert es?', a: LIEFERZEIT },
      { q: 'Bekommen Firma, Schule oder Verein eine Rechnung?', a: RECHNUNG },
      { q: 'Hält der Druck auf dem Pullover?', a: WASCHEN },
      { q: 'Können wir später einzelne Pullover nachbestellen?', a: 'Ja. Eure Druckdaten bleiben gespeichert, Nachzügler bekommen ihren Pullover einzeln mit demselben Druck. Einzelstücke sind in 1 bis 3 Werktagen fertig.' },
    ],
    serviceType: 'Textildruck auf Pullovern und Sweatshirts, Abschlusspullis, Firmen-Sweatshirts, Chor-Pullover',
    llms: 'Pullover und Sweatshirts mit Logo bedrucken lassen: Preise für 1, 10, 50, 100 und 200 Stück, Classic Sweatshirt, Classic Hoodie und Changer 2.0, Abschlusspullis mit Klassenpreis',
  },
];
