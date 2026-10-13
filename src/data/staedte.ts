import { oeffnungszeiten } from './site';
import { STAND, tabellen, zusatz } from './preise';
import { KLASSENPREIS_AB } from './abschluss';

// Eigene Stadtseiten /textildruck-<slug> für die direkten Nachbarstädte (seit Oktober 2026).
// Seite: src/pages/textildruck-[stadt].astro. Die übrigen Städte bleiben Abschnitte auf /textildruck-ruhrgebiet.
//
// Regeln für die Texte (Inhaber, 13.10.2026):
// - Jede Stadt hat eigene Schwerpunkte, eigene Fragen und eigene Formulierungen. Keine Kopie mit ausgetauschtem
//   Stadtnamen, Google wertet fast gleiche Stadtseiten als Füllseiten ab. Texte bitte nicht angleichen.
// - westernprint sitzt nur in Oberhausen. Keine Adresse, keine Filiale und kein Laden in der Stadt erfinden.
// - Entfernungen wie auf /textildruck-ruhrgebiet: Straßenkilometer von der Schenkendorfstraße 45 bis zur Stadtmitte,
//   berechnet am 28.09.2026 mit OpenStreetMap (Mülheim 9,0 | Bottrop 9,7 | Duisburg 12,5 | Essen 15,7).
//   Fahrzeiten und Autobahnen ebenfalls von dort. Messe Essen rund 15 km wie auf /fuer/messen-und-aussteller.
// - Preise nur über nb() und zusatzNb() aus src/data/preise.ts, netto und brutto, mit Stand. Bevorzugt 1 und 10 Stück.
//   Keine Mengenschwelle bei 50 Stück nennen: ab 1 Stück, Staffelpreise ab 10, je mehr, desto günstiger.
// - Lieferung: kein Lieferversprechen, keine Gratis-Lieferung, kein Express. Erlaubt: Abholung in Oberhausen
//   ist möglich, Versand per DHL.
// - Nicht anbieten: Sublimation auf Textil, Stickerei, Siebdruck, Gratis-Muster. Keine Kunden- oder Vereinsnamen.

export type Modell = 'basic' | 'bio' | 'polo' | 'hoodie';
const PREFIX: Record<Modell, string> = { basic: 'T-Shirt Basic', bio: 'T-Shirt Bio', polo: 'Poloshirt', hoodie: 'Hoodie' };

function tabelle(m: Modell) {
  const t = tabellen.find((tb) => tb.t.startsWith(PREFIX[m]));
  if (!t) throw new Error(`${PREFIX[m]} fehlt in preise.ts`);
  return t;
}

/** 'T-Shirt Basic (Stedman Classic-T, 155 g)' -> 'T-Shirt Basic (Stedman Classic-T)' */
export function modell(m: Modell): string {
  const t = tabelle(m).t;
  const teile = t.match(/^(.+?) \(([^,]+),/);
  return teile ? `${teile[1]} (${teile[2]})` : t;
}

const cent = (p: string) => {
  const m = p.match(/(\d+),(\d{2})/);
  if (!m) throw new Error(`Preis nicht lesbar: ${p}`);
  return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
};
const euro = (c: number) => `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')} €`;
/** Netto -> brutto: netto x 1,19, kaufmännisch auf Cent gerundet. '17,90 €' -> '21,30 €' */
export const brutto = (p: string) => euro(Math.round((cent(p) * 119) / 100));

/** Nettopreis pro Stück aus preise.ts, z. B. netto('basic', 10) -> '12,90 €'. Fehlt die Staffel, bricht der Build ab. */
export function netto(m: Modell, menge: number): string {
  const z = tabelle(m).zeilen.find(([x]) => parseInt(x, 10) === menge);
  if (!z) throw new Error(`Keine Staffel ${menge} Stück für ${tabelle(m).t}`);
  return z[1];
}

/** nb('basic', 1) -> '17,90 € netto (21,30 € brutto)' */
export const nb = (m: Modell, menge: number) => `${netto(m, menge)} netto (${brutto(netto(m, menge))} brutto)`;

function zusatzPosten(name: string) {
  const z = zusatz.find((x) => x.t.startsWith(name));
  if (!z) throw new Error(`Zusatzleistung "${name}" fehlt in preise.ts`);
  if (z.istBrutto) throw new Error(`"${name}" ist ein Bruttopreis, hier nur Nettoposten verwenden`);
  return z;
}

/** zusatzNb('Namen und Rückennummern') -> 'ab 5,90 € netto (7,02 € brutto)' */
export function zusatzNb(name: string): string {
  const z = zusatzPosten(name);
  return `${z.p} netto (${brutto(z.p)} brutto)`;
}

export const PREIS_STAND = STAND;

export interface Stadt {
  /** URL: /textildruck-<slug> */
  slug: string;
  name: string;
  /** Straßenkilometer bis zur Stadtmitte, gerundet wie auf /textildruck-ruhrgebiet. */
  km: number;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  image: string;
  imageAlt: string;
  /** h2 über dem Antwortabsatz, als Frage, wie Leute sie stellen. */
  introFrage: string;
  /** Antwortabsatz, 70 bis 110 Wörter: wo westernprint sitzt, wie weit es ist, was es kostet. */
  intro: string;
  schwerpunkteTitel: string;
  schwerpunkteText: string;
  schwerpunkte: { icon: string; t: string; d: string; href: string; cta: string }[];
  preiseTitel: string;
  preiseText: string;
  preise: { m: Modell; menge: number }[];
  /** Namen von Zusatzleistungen aus preise.ts (Anfang von zusatz[].t). */
  zusatz?: string[];
  wegTitel: string;
  weg: string;
  faqTitel: string;
  faqs: { q: string; a: string }[];
  serviceType: string;
  /** Kurzbeschreibung für die Seitenliste in /llms-full.txt. */
  llms: string;
  /** Vorauswahl im Anfrageformular. */
  topic?: string;
}

const S = PREIS_STAND;

export const staedte: Stadt[] = [
  {
    slug: 'muelheim-an-der-ruhr', name: 'Mülheim an der Ruhr', km: 9,
    title: 'T-Shirts bedrucken in Mülheim an der Ruhr: ab 1 Stück aus Oberhausen',
    description: 'Einzelne T-Shirts, JGA-Shirts und Vereinstrikots für Mülheim an der Ruhr. Gedruckt in Oberhausen, rund 9 km entfernt, Einzelstücke in 1 bis 3 Werktagen fertig.',
    eyebrow: 'Textildruck für Mülheim an der Ruhr',
    h1: "T-Shirts für Mülheim bedrucken, <span class='hl'>schon ab einem Stück.</span>",
    lede: 'Ein Geschenk, Shirts für den Junggesellenabschied oder ein Trikot für den Verein: westernprint druckt direkt nebenan in Oberhausen. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig.',
    image: '/img/druck-makro.jpg',
    imageAlt: 'Nahaufnahme eines Drucks auf grau meliertem Shirt',
    introFrage: 'Wo kann ich in Mülheim an der Ruhr ein einzelnes T-Shirt bedrucken lassen?',
    intro: `Direkt nebenan: westernprint sitzt in Oberhausen, in der Schenkendorfstraße 45, rund 9 km von der Mülheimer Innenstadt. Einen Laden in Mülheim gibt es nicht, gedruckt wird in der eigenen Werkstatt. Eine Mindestmenge auch nicht. Ein ${modell('basic')} mit deinem Motiv kostet einzeln ${nb('basic', 1)}, Stand ${S}. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig. Für Gruppen wie JGA, Geburtstag oder Verein gelten ab 10 Stück Staffelpreise. Das fertige Shirt holst du in Oberhausen ab, oder es kommt per DHL zu dir nach Mülheim.`,
    schwerpunkteTitel: 'Vom einzelnen Shirt bis zum Vereinstrikot',
    schwerpunkteText: 'Kleine Mengen sind bei westernprint kein Sonderfall. Ein einzelnes Shirt ist ein normaler Auftrag, eine Feier oder ein Verein genauso.',
    schwerpunkte: [
      { icon: 'gift', t: 'Einzelstücke und Geschenke',
        d: 'Ein Shirt mit Foto, Spruch oder Namen zum Geburtstag, ein Hoodie als Geschenk: Bestellen kannst du ab 1 Stück, per WhatsApp, über das Formular oder direkt im Shop. Fotos und Motive mit vielen Farben druckt westernprint per DTG auf Baumwolle. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig.',
        href: '/fuer/hochzeiten-und-familie', cta: 'Personalisierte Shirts und Geschenke' },
      { icon: 'confetti', t: 'JGA, Geburtstag und Feiern',
        d: `Team Braut, Team Bräutigam oder der runde Geburtstag: Jedes Shirt bekommt auf Wunsch einen eigenen Namen, eine Liste mit Name und Größe reicht. Ein Name kostet ${zusatzNb('Namen und Rückennummern')} pro Shirt. Vor dem Druck seht ihr alle Namen im Korrekturabzug.`,
        href: '/fuer/jga-und-feiern', cta: 'Shirts für JGA und Feiern' },
      { icon: 'soccer-ball', t: 'Trikots und Vereinsshirts',
        d: 'Für Mülheimer Vereine druckt westernprint Vereinslogo, Namen und Nummern per DTF, das hält auch auf Funktionsware aus Polyester. Kommt ein neues Teammitglied dazu, wird ein einzelnes Teil nachgedruckt, die Druckdaten bleiben gespeichert. Die Rechnung geht an den Verein.',
        href: '/fuer/sportvereine', cta: 'Trikots und Vereinskleidung' },
    ],
    preiseTitel: 'Was kostet ein einzelnes bedrucktes Shirt?',
    preiseText: 'Einzelpreise für ein Stück mit deinem Motiv, dazu der Preis für Gruppen ab 10 Stück.',
    preise: [{ m: 'basic', menge: 1 }, { m: 'bio', menge: 1 }, { m: 'hoodie', menge: 1 }, { m: 'basic', menge: 10 }],
    zusatz: ['Namen und Rückennummern'],
    wegTitel: 'Von Mülheim nach Oberhausen',
    weg: `Mülheim an der Ruhr grenzt direkt an Oberhausen. Von der Mülheimer Innenstadt sind es rund 9 km bis zur Werkstatt in der Schenkendorfstraße 45, mit dem Auto etwa 20 Minuten. Abholung in Oberhausen ist möglich, ${oeffnungszeiten.text}, nach kurzer Absprache per WhatsApp oder Telefon. Sonst kommt dein Shirt per DHL mit Sendungsnummer.`,
    faqTitel: 'Fragen aus Mülheim an der Ruhr',
    faqs: [
      { q: 'Druckt ihr auch nur ein einziges Shirt?', a: `Ja. westernprint druckt ab 1 Stück und ohne Einrichtungskosten. Ein ${modell('basic')} mit einem Druck kostet einzeln ${nb('basic', 1)}, ein ${modell('bio')} ${nb('bio', 1)}, Stand ${S}. Dein Motiv schickst du per WhatsApp oder Formular, einzelne Shirts kannst du auch direkt im Shop gestalten.` },
      { q: 'Wie schnell ist ein Einzelstück für Mülheim fertig?', a: 'Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig. Danach holst du das Shirt in Oberhausen ab, rund 9 km von der Mülheimer Innenstadt, oder es geht per DHL zu dir. Hast du einen festen Termin, etwa einen Geburtstag, schreib ihn gleich in die Anfrage.' },
      { q: 'Was kosten JGA-Shirts mit Namen?', a: `Ein ${modell('basic')} mit einem Druck kostet bei 10 Stück ${nb('basic', 10)} pro Stück, Stand ${S}. Ein eigener Name pro Shirt kostet ${zusatzNb('Namen und Rückennummern')} zusätzlich. Gemischte Größen kosten keinen Aufpreis.` },
      { q: 'Ab wie vielen Shirts wird es günstiger?', a: `Ab 10 Stück gelten Staffelpreise, und je mehr Shirts ihr bestellt, desto günstiger wird das einzelne Shirt. Ein ${modell('basic')} mit einem Druck kostet bei 10 Stück ${nb('basic', 10)}, bei 25 Stück ${nb('basic', 25)} pro Stück, Stand ${S}. Große Mengen druckt westernprint ebenfalls.` },
      { q: 'Kann ein neues Teammitglied einzeln ein Shirt nachbestellen?', a: 'Ja. Vereinslogo, Schrift und Positionen bleiben bei westernprint gespeichert. Das neue Teammitglied bekommt sein Shirt einzeln, mit Name und Nummer im gleichen Stil wie der Rest der Mannschaft. Eigene Trikots könnt ihr mitbringen, vorher prüfen wir das Material. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig.' },
      { q: 'Kann ich ein Foto auf ein Shirt drucken lassen?', a: `Ja. Fotos und Motive mit vielen Farben druckt westernprint per DTG direkt auf Baumwolle, zum Beispiel auf das ${modell('bio')}. Schick das Foto in möglichst hoher Auflösung. Jede Datei wird vor dem Druck geprüft, und du bekommst Bescheid, wenn etwas nicht passt.` },
    ],
    serviceType: 'Textildruck, Einzelstücke, JGA-Shirts, Vereinskleidung',
    llms: 'Einzelstücke ab 1 Stück, JGA-Shirts und Vereinstrikots, gedruckt in Oberhausen, rund 9 km von Mülheim',
    topic: 'Einzelstück / Kleinserie',
  },
  {
    slug: 'bottrop', name: 'Bottrop', km: 10,
    title: 'Trikots und T-Shirts bedrucken in Bottrop: Textildruck aus Oberhausen',
    description: 'Trikots mit Namen und Nummern, Abschlusspullis und Schul-Shirts für Bottrop. Gedruckt in Oberhausen, rund 10 km über die A42. Ab 1 Stück, Staffelpreise ab 10.',
    eyebrow: 'Textildruck für Bottrop',
    h1: "Trikots mit Namen und Nummern für Bottrop. <span class='hl'>Und Abschlussshirts für die ganze Stufe.</span>",
    lede: 'Für Vereine, Schulen und Abschlussklassen aus Bottrop druckt westernprint Trikots, Trainingsshirts, Hoodies und Klassen-Shirts, jedes Teil auf Wunsch mit eigenem Namen. Die Werkstatt in Oberhausen liegt rund 10 km entfernt.',
    image: '/img/vereinskleidung-trikots.jpg',
    imageAlt: 'Fünf bedruckte Trikots mit Namen und Rückennummern auf dem Werkstatttisch',
    introFrage: 'Wo lassen Vereine in Bottrop Trikots mit Namen und Nummern bedrucken?',
    intro: `Wer in Bottrop Trikots mit Namen und Nummern sucht, findet westernprint nicht in Bottrop selbst, sondern rund 10 km entfernt in Oberhausen, Schenkendorfstraße 45. Der Weg führt über die A42. In der Werkstatt bekommt jedes Trikot oder Trainingsshirt auf Wunsch Vereinslogo, Namen und Rückennummer. Eine Liste mit Name, Nummer und Größe reicht. Gedruckt wird per DTF, das hält auch auf Funktionsware aus Polyester. Namen und Rückennummern kosten ${zusatzNb('Namen und Rückennummern')} pro Teil, Stand ${S}. Bestellen könnt ihr ab 1 Stück, ab 10 Stück gelten Staffelpreise. Abholung in Oberhausen ist möglich, Versand per DHL ebenso.`,
    schwerpunkteTitel: 'Namen, Nummern, Namenslisten: Vereine und Schulen aus Bottrop',
    schwerpunkteText: 'Wenn jedes Teil anders beschriftet wird, spielt der Digitaldruck seine Stärke aus. Jedes Shirt kann einen eigenen Namen tragen, ohne Einrichtungskosten.',
    schwerpunkte: [
      { icon: 'soccer-ball', t: 'Trikots mit Namen und Nummern',
        d: 'Für Fußball, Handball oder Kampfsport druckt westernprint Vereinslogo, Sponsor, Rückennummer und Namen, jedes Teil einzeln nach eurer Liste. Die Vorgaben eures Verbands für Nummerngröße und Werbeflächen schickt ihr am besten gleich mit. Der Korrekturabzug zeigt alle Positionen in Zentimetern, bevor gedruckt wird.',
        href: '/fuer/sportvereine', cta: 'Trikots und Vereinskleidung' },
      { icon: 'graduation-cap', t: 'Abschlusspullis und Abi-Shirts',
        d: `Motto vorne, alle Namen hinten: Für Abschlussklassen aus Bottrop druckt westernprint Hoodies und T-Shirts mit Namensliste. Bestellen geht ab 1 Stück, ab ${KLASSENPREIS_AB} Stück gilt der Klassenpreis. Motto und Namensliste setzt westernprint für Abschlussklassen kostenlos, gedruckt wird erst nach eurer schriftlichen Bestätigung.`,
        href: '/fuer/abschlussklassen', cta: 'Abschlusspullis mit Namensliste' },
      { icon: 'backpack', t: 'Kitas und Schulen',
        d: 'Schul-Shirts fürs Sportfest, Kita-Abschluss-Shirts oder Hoodies fürs Kollegium, in Größen von 0 Monaten bis 5XL. Eine Größenliste pro Klasse reicht, Mischgrößen kosten keinen Aufpreis. Die Rechnung geht auf Wunsch an Schule oder Förderverein.',
        href: '/fuer/kitas-und-schulen', cta: 'Kita- und Schul-Shirts' },
    ],
    preiseTitel: 'Was kosten Vereinsshirts mit Namen und Nummern?',
    preiseText: 'Preisbeispiele pro Stück mit einem Druck, Textil inklusive. Namen und Nummern kommen pro Teil dazu. Die Preise für Abschlusspullis stehen auf der Seite für Abschlussklassen.',
    preise: [{ m: 'basic', menge: 1 }, { m: 'basic', menge: 10 }, { m: 'hoodie', menge: 1 }, { m: 'hoodie', menge: 10 }, { m: 'basic', menge: 100 }],
    zusatz: ['Namen und Rückennummern', 'Zweite Druckseite'],
    wegTitel: 'Von Bottrop nach Oberhausen',
    weg: `Bottrop liegt rund 10 km von der Werkstatt in der Schenkendorfstraße 45 entfernt, ein kurzer Weg über die A42. Abholung in Oberhausen ist möglich, ${oeffnungszeiten.text}, nach kurzer Absprache. Bei Sammelbestellungen für Mannschaft oder Stufe packt westernprint die Teile nach eurer Liste. Auf Wunsch geht die Bestellung per DHL an Verein oder Schule.`,
    faqTitel: 'Fragen von Vereinen und Schulen aus Bottrop',
    faqs: [
      { q: 'Wie bestellt ein Verein aus Bottrop Trikots mit Namen?', a: 'Ihr schickt Vereinslogo, Sponsorenlogos und eine Liste mit Name, Nummer und Größe pro Spielerin oder Spieler. Das Angebot kommt an Werktagen innerhalb von 24 Stunden, danach bekommt ihr einen Korrekturabzug mit allen Namen und Nummern. Nach eurer Freigabe ist die Serie in 5 bis 7 Werktagen fertig.' },
      { q: 'Was kosten Namen und Rückennummern?', a: `Namen und Rückennummern kosten ${zusatzNb('Namen und Rückennummern')} pro Teil, zusätzlich zum Stückpreis. Ein ${modell('basic')} mit einem Druck kostet bei 10 Stück ${nb('basic', 10)} pro Stück, Stand ${S}. Einrichtungskosten fallen nicht an, und je mehr Teile der Verein bestellt, desto günstiger wird das einzelne Shirt.` },
      { q: 'Hält der Druck auf Trikots aus Polyester?', a: 'Ja. westernprint druckt per DTF. Der Druck ist dehnbar und bleibt auch auf Funktionsware aus Polyester haften, wenn das Trikot beim Spiel gedehnt wird. Eigene Trikots könnt ihr anliefern. Nennt vorher kurz das Material, dann prüfen wir die Eignung.' },
      { q: 'Gibt es für Abschlussklassen eine Mindestmenge?', a: `Nein. Abschlusspullis und Abi-Shirts gibt es ab 1 Stück, ab ${KLASSENPREIS_AB} Stück gilt der Klassenpreis. Nachzügler bestellen später einzeln nach, zum Preis für 1 bis ${KLASSENPREIS_AB - 1} Stück, die Druckdaten bleiben gespeichert. Alle Preise stehen auf der Seite für Abschlussklassen.` },
      { q: 'Wer bekommt die Rechnung bei einer Schulbestellung?', a: 'Zuerst bekommt ihr ein Angebot, das ihr freigebt. Die Rechnung der westernprint GmbH geht dann nach Absprache an die Schule, den Förderverein oder die Elternvertretung. Bei Abschlussklassen bestellt eine volljährige Person oder der Förderverein.' },
      { q: 'Können wir die Trikots in Oberhausen abholen?', a: `Ja. Abholung in der Schenkendorfstraße 45 in Oberhausen ist möglich, ${oeffnungszeiten.text}, nach kurzer Absprache. Von Bottrop sind es rund 10 km über die A42. Sonst geht die Bestellung per DHL mit Sendungsnummer an den Verein.` },
    ],
    serviceType: 'Textildruck, Trikots mit Namen und Nummern, Abschlussshirts, Schul-Shirts',
    llms: 'Trikots mit Namen und Nummern, Abschlusspullis und Schul-Shirts, gedruckt in Oberhausen, rund 10 km von Bottrop',
  },
  {
    slug: 'duisburg', name: 'Duisburg', km: 13,
    title: 'Arbeitskleidung bedrucken in Duisburg: Textildruck aus Oberhausen',
    description: 'Arbeitskleidung mit Firmenlogo für Duisburger Betriebe und Handwerk, auch auf eure eigene Workwear. Gedruckt in Oberhausen, rund 13 km entfernt, ab 1 Stück.',
    eyebrow: 'Textildruck für Duisburg',
    h1: "Arbeitskleidung mit Logo für Duisburg. <span class='hl'>Auch auf eure eigene Workwear.</span>",
    lede: 'Für Handwerksbetriebe, Werkstätten und Dienstleister aus Duisburg bedruckt westernprint T-Shirts, Polos, Hoodies und mitgebrachte Arbeitskleidung mit Firmenlogo. Gedruckt wird per DTF in Oberhausen.',
    image: '/img/workwear-team-halle.jpg',
    imageAlt: 'Team in dunkelblauen Poloshirts mit Firmenlogo und Arbeitshosen in der Werkhalle',
    introFrage: 'Wer bedruckt in Duisburg Arbeitskleidung mit Firmenlogo?',
    intro: `Die Werkstatt von westernprint liegt in Oberhausen, in der Schenkendorfstraße 45, rund 13 km von der Duisburger Innenstadt. Über die A40 sind es etwa 20 Minuten, in Duisburg selbst gibt es keinen Standort. Aus dieser Werkstatt kommt Arbeitskleidung mit Firmenlogo für Duisburger Betriebe, gedruckt per DTF. Das hält auch auf Polyester und Mischgewebe. Neben T-Shirts, Polos und Hoodies aus dem Sortiment bedruckt westernprint auch Workwear, die ihr mitbringt, dann zahlt ihr nur den Druck. Ein ${modell('basic')} mit Logo kostet einzeln ${nb('basic', 1)}, bei 10 Stück ${nb('basic', 10)} pro Stück, Stand ${S}.`,
    schwerpunkteTitel: 'Arbeitskleidung für Duisburger Betriebe',
    schwerpunkteText: 'Vom Handwerksbetrieb bis zum Dienstleister: das Logo auf Shirt, Polo, Hoodie oder auf der Arbeitskleidung, die ihr schon habt.',
    schwerpunkte: [
      { icon: 'wrench', t: 'Handwerk: Logo auf Brust, Rücken und Ärmel',
        d: `Für Elektriker, SHK, Maler, Dachdecker und Werkstätten druckt westernprint das Firmenlogo auf Brust oder Rücken, auf Wunsch zusätzlich Telefonnummer oder Webadresse. Ein zweiter Druck kostet ${zusatzNb('Zweite Druckseite')} pro Teil, ein Ärmeldruck ${zusatzNb('Ärmeldruck')}. Neue Gesellen und Azubis bekommen ihr Teil einzeln nachbestellt.`,
        href: '/fuer/handwerksbetriebe', cta: 'Arbeitskleidung mit Firmenlogo' },
      { icon: 'coat-hanger', t: 'Mitgebrachte Arbeitskleidung bedrucken',
        d: 'Ihr habt schon Jacken, Polos oder Hosen von eurem Workwear-Händler? Bringt sie in Oberhausen vorbei oder schickt sie, ihr zahlt dann nur den Druck. Nennt vorher das Material, westernprint prüft, ob es sich für DTF eignet. Plant 2 bis 3 Prozent Reserve ein, für Materialfehler an angelieferter Ware haftet westernprint nicht.',
        href: '#anfrage', cta: 'Material und Menge anfragen' },
      { icon: 'storefront', t: 'Dienstleister, Praxen und Läden',
        d: `Für Reinigungsfirmen, Sicherheitsdienste, Praxen, Autohäuser und Läden bedruckt westernprint Polos und Shirts mit Logo, ab 1 Stück. Auch drei Polos sind ein normaler Auftrag. Ein ${modell('polo')} mit einem Druck kostet bei 10 Stück ${nb('polo', 10)} pro Stück, Stand ${S}.`,
        href: '/fuer/einzelhandel-und-dienstleister', cta: 'Team-Kleidung für Dienstleister' },
    ],
    preiseTitel: 'Was kostet Arbeitskleidung mit Logo?',
    preiseText: 'Preisbeispiele pro Stück mit einem Logo, Textil inklusive. Für Rücken und Ärmel kommen die Zusatzdrucke dazu. Bei mitgebrachter Workwear zahlt ihr nur den Druck, den Preis nennt das Angebot.',
    preise: [{ m: 'basic', menge: 1 }, { m: 'basic', menge: 10 }, { m: 'polo', menge: 1 }, { m: 'polo', menge: 10 }, { m: 'hoodie', menge: 10 }],
    zusatz: ['Zweite Druckseite', 'Ärmeldruck'],
    wegTitel: 'Von Duisburg nach Oberhausen',
    weg: `Aus der Duisburger Innenstadt sind es rund 13 km bis zur Werkstatt, über die A40 etwa 20 Minuten. Eigene Arbeitskleidung könnt ihr vorbeibringen oder schicken. Abholung der fertigen Teile in Oberhausen ist möglich, ${oeffnungszeiten.text}, nach kurzer Absprache. Sonst geht die Ware per DHL mit Sendungsnummer in den Betrieb.`,
    faqTitel: 'Fragen von Betrieben aus Duisburg',
    faqs: [
      { q: 'Können wir unsere eigene Arbeitskleidung bedrucken lassen?', a: 'Ja. westernprint bedruckt angelieferte Workwear, ihr zahlt dann nur den Druck. Nennt vorher das Material. Wir prüfen die Eignung für DTF und sagen ehrlich, wenn etwas nicht hält. Für Materialfehler an angelieferter Ware haftet westernprint nicht, plant deshalb 2 bis 3 Prozent Reserve ein.' },
      { q: 'Hält der Druck auf Arbeitskleidung aus Polyester oder Mischgewebe?', a: 'Ja. DTF-Druck ist dehnbar und waschfest und hält auch auf Polyester, Softshell und Mischgewebe. Damit der Druck lange hält, wascht ihr die Teile auf links gedreht und ohne Weichspüler.' },
      { q: 'Was kostet ein T-Shirt oder Polo mit Firmenlogo?', a: `Ein ${modell('basic')} mit einem Druck kostet einzeln ${nb('basic', 1)} und bei 10 Stück ${nb('basic', 10)} pro Stück. Ein ${modell('polo')} kostet einzeln ${nb('polo', 1)}, bei 10 Stück ${nb('polo', 10)}. Stand ${S}, Einrichtungskosten fallen nicht an.` },
      { q: 'Können wir für neue Mitarbeiter einzelne Teile nachbestellen?', a: 'Ja. westernprint speichert die Druckdaten eures Logos. Ein neuer Mitarbeiter bekommt sein Shirt oder seinen Hoodie einzeln, mit dem gleichen Druck wie das übrige Team. Einzelstücke sind in der Regel in 1 bis 3 Werktagen fertig.' },
      { q: 'Wie lange dauert Arbeitskleidung für das ganze Team?', a: 'Das Angebot kommt an Werktagen innerhalb von 24 Stunden. Nach Freigabe des Korrekturabzugs ist die Serie in 5 bis 7 Werktagen fertig. Mischgrößen kosten keinen Aufpreis. Danach holt ihr die Teile in Oberhausen ab, oder sie gehen per DHL in den Betrieb.' },
      { q: 'Bekommen wir eine Rechnung mit ausgewiesener Umsatzsteuer?', a: 'Ja. Ihr bekommt eine Rechnung der westernprint GmbH mit ausgewiesener Umsatzsteuer für eure Buchhaltung. Die Preise im Angebot stehen netto und brutto.' },
    ],
    serviceType: 'Textildruck, Arbeitskleidung mit Logo, Bedrucken angelieferter Workwear',
    llms: 'Arbeitskleidung mit Logo für Betriebe und Handwerk, auch auf mitgebrachte Workwear, gedruckt in Oberhausen, rund 13 km von Duisburg',
  },
  {
    slug: 'essen', name: 'Essen', km: 16,
    title: 'T-Shirts bedrucken in Essen: Textildruck aus Oberhausen',
    description: 'T-Shirts und Polos für Essen: Messekleidung für die Messe Essen, Firmenkleidung und Vereinsshirts. Gedruckt in Oberhausen, rund 16 km entfernt, ab 1 Stück.',
    eyebrow: 'Textildruck für Essen',
    h1: "T-Shirts und Polos für Essen bedrucken. <span class='hl'>Gedruckt in Oberhausen, 16 km entfernt.</span>",
    lede: 'Polos fürs Standpersonal auf der Messe Essen, Firmenkleidung fürs Team und Shirts für den Verein. westernprint druckt in eigener Produktion in Oberhausen, ab 1 Stück und ohne Einrichtungskosten.',
    image: '/img/workwear-stange.jpg',
    imageAlt: 'Poloshirts, Softshelljacken und Hoodie mit Firmenlogo auf einer Kleiderstange',
    introFrage: 'Wo kann ich in Essen T-Shirts bedrucken lassen?',
    intro: `Für Essen druckt westernprint T-Shirts, Polos und Hoodies in der eigenen Werkstatt in Oberhausen, Schenkendorfstraße 45. Von der Essener Innenstadt sind es rund 16 km, über die A40 etwa 20 Minuten. Eine Filiale in Essen gibt es nicht. Gedruckt wird für Aussteller der Messe Essen, für Firmen und für Vereine. Bestellen könnt ihr ab 1 Stück, ab 10 Stück gelten Staffelpreise. Ein ${modell('polo')} mit einem Druck kostet einzeln ${nb('polo', 1)}, bei 10 Stück ${nb('polo', 10)} pro Stück, Stand ${S}. Das Angebot kommt an Werktagen innerhalb von 24 Stunden.`,
    schwerpunkteTitel: 'Messe, Firma, Verein: was westernprint für Essen druckt',
    schwerpunkteText: 'Drei Schwerpunkte für Essen. Zu jedem gibt es eine eigene Seite mit Ablauf, Preisen und Antworten auf häufige Fragen.',
    schwerpunkte: [
      { icon: 'presentation', t: 'Messe Essen: Polos fürs Standpersonal',
        d: 'Die Messe Essen liegt rund 15 km von der Werkstatt entfernt. Aussteller bekommen Poloshirts, T-Shirts und Hoodies mit Firmenlogo, für Vertrieb, Technik und Aufbau auch als unterschiedliche Varianten in einem Auftrag. Eine Serie ist 5 bis 7 Werktage nach Freigabe des Korrekturabzugs fertig, plant die Bestellung deshalb vor dem Aufbau ein. Versand per DHL an Firma oder Messeadresse.',
        href: '/fuer/messen-und-aussteller', cta: 'Messekleidung für Aussteller' },
      { icon: 'buildings', t: 'Firmenkleidung für Essener Unternehmen',
        d: `Polos, Hoodies und T-Shirts mit Logo fürs Büro, den Empfang oder das Teamevent. Wer auf Bio-Baumwolle Wert legt, nimmt das ${modell('bio')}. Eine Größenliste reicht, Mischgrößen kosten keinen Aufpreis. Kommt jemand Neues ins Team, bestellt ihr ein einzelnes Teil nach, die Druckdaten bleiben gespeichert.`,
        href: '/fuer/firmen-und-buero', cta: 'Firmenkleidung mit Logo' },
      { icon: 'users-three', t: 'Vereine aus Essen',
        d: 'Shirts, Polos und Hoodies mit Vereinslogo für Chor, Musikzug, Förderverein oder Ehrenamt. Die Rechnung geht an den Verein. Ab 10 Stück gelten Staffelpreise, und je mehr Teile ihr bestellt, desto günstiger wird das einzelne Shirt.',
        href: '/fuer/vereine-und-ehrenamt', cta: 'Kleidung für Vereine' },
    ],
    preiseTitel: 'Was kosten Polos und Shirts mit Logo für Essen?',
    preiseText: 'Preisbeispiele für Messestand, Büro und Verein, pro Stück mit einem Druck, Textil inklusive.',
    preise: [{ m: 'polo', menge: 1 }, { m: 'polo', menge: 10 }, { m: 'bio', menge: 1 }, { m: 'bio', menge: 10 }, { m: 'hoodie', menge: 10 }],
    zusatz: ['Zweite Druckseite'],
    wegTitel: 'Von Essen nach Oberhausen',
    weg: `Aus der Essener Innenstadt seid ihr über die A40 in etwa 20 Minuten an der Werkstatt in der Schenkendorfstraße 45. Abholung in Oberhausen ist möglich, ${oeffnungszeiten.text}, nach kurzer Absprache per WhatsApp oder Telefon. Wer nicht abholen möchte, bekommt die Ware per DHL mit Sendungsnummer, Aussteller auch an die Messeadresse.`,
    faqTitel: 'Fragen aus Essen',
    faqs: [
      { q: 'Gibt es westernprint auch in Essen?', a: 'Nein, eine Filiale in Essen gibt es nicht. westernprint druckt in der eigenen Werkstatt in Oberhausen, Schenkendorfstraße 45, rund 16 km von der Essener Innenstadt. Anfragen aus Essen laufen per WhatsApp, Telefon, Mail oder Formular. Die Ware geht per DHL nach Essen, Abholung in Oberhausen ist möglich.' },
      { q: 'Wir stellen auf der Messe Essen aus. Wann sollten wir die Standkleidung bestellen?', a: 'Rechnet vom Aufbautag rückwärts. Das Angebot kommt an Werktagen innerhalb von 24 Stunden, danach bekommt ihr einen Korrekturabzug zur Freigabe. Eine Serie ist 5 bis 7 Werktage nach Freigabe fertig, dazu kommt der Versand per DHL. Wer früh anfragt, hat Luft für Änderungen am Logo.' },
      { q: 'Was kostet ein Poloshirt mit Logo für den Messestand?', a: `Ein ${modell('polo')} mit einem Druck kostet einzeln ${nb('polo', 1)} und bei 10 Stück ${nb('polo', 10)} pro Stück, Stand ${S}. Einrichtungskosten fallen nicht an. Ein zweiter Druck, etwa Logo vorne und Webadresse hinten, kostet ${zusatzNb('Zweite Druckseite')} pro Teil.` },
      { q: 'Können Vertrieb und Standbau unterschiedliche Shirts bekommen?', a: 'Ja. Unterschiedliche Varianten, etwa Polos für den Vertrieb und T-Shirts für den Aufbau, laufen in einem Auftrag. Mischgrößen kosten keinen Aufpreis. Alle Varianten seht ihr vor dem Druck im Korrekturabzug.' },
      { q: 'Druckt ihr Firmenkleidung für Essener Büros auch in kleinen Mengen?', a: `Ja, ab 1 Stück. Drei Hoodies fürs Team sind ein normaler Auftrag. Ab 10 Stück gelten Staffelpreise: Ein ${modell('hoodie')} mit einem Druck kostet bei 10 Stück ${nb('hoodie', 10)} pro Stück, Stand ${S}. Für neue Kolleginnen und Kollegen bestellt ihr später einzelne Teile nach.` },
      { q: 'Stellt ihr die Rechnung an unseren Verein?', a: 'Ja. Die Rechnung der westernprint GmbH geht an den Verein, mit allen Angaben für die Vereinskasse. Shirts, Polos und Hoodies mit Vereinslogo gibt es ab 1 Stück, ab 10 Stück gelten Staffelpreise. Den Korrekturabzug gebt ihr vor dem Druck frei.' },
    ],
    serviceType: 'Textildruck, Messekleidung, Firmenkleidung, Vereinskleidung',
    llms: 'Messekleidung für Aussteller der Messe Essen, Firmenkleidung und Vereinsshirts, gedruckt in Oberhausen, rund 16 km von Essen',
  },
];

/** Preiszeilen für die Seite: Modell, Menge, netto und brutto. */
export function preisZeilen(s: Stadt) {
  const modelle = s.preise.map(({ m, menge }) => ({
    t: modell(m),
    menge: menge === 1 ? 'einzeln' : `bei ${menge} Stück`,
    netto: netto(m, menge),
    brutto: brutto(netto(m, menge)),
  }));
  const extra = (s.zusatz ?? []).map((name) => {
    const z = zusatzPosten(name);
    return { t: z.t, menge: 'pro Teil zusätzlich', netto: z.p, brutto: brutto(z.p) };
  });
  return [...modelle, ...extra];
}
