// Print-on-Demand-Nischenseiten unter /print-on-demand/<slug>.
//
// Freigabe des Inhabers am 23.10.2026: eigene POD-Seiten je Nische, mit Produkten und App-Preisen.
// Das weicht bewusst von der Regel vom 17.10. ab (keine Produktpreise auf /print-on-demand und /etsy-print-on-demand).
// Mit ZEIGE_PREISE = false verschwinden alle Preise auf den Nischenseiten, der Rest bleibt.
//
// Preise = Produktionspreis der POD-App, netto zzgl. MwSt., abgelesen am 23.10.2026 mit dem Code der App
// (~/dev/westernprint-pod: getStStEntryForCreate / referenceEkFromVariants + lib/pricing calculateUnitPrice):
//   Textil-EK (Referenzfarbe Schwarz, sonst Median) + 7,00 € erste Druckseite + 5,00 € zweite Seite (vorne UND hinten)
//   + 3,00 € Nacken oder Ärmel. Kein Textilaufschlag. Größen ab 3XL und melierte Farben können mehr kosten,
//   der genaue Preis steht im Designer der App.
// Versand wie /print-on-demand: DE 5,00 €, AT 7,00 €, EU 7,50 €, CH 9,00 € netto pro Bestellung, +1,50 € je volle 3 Artikel.
// Kindergrößen immer mit Alter (Regel des Inhabers vom 23.10.2026).

export const ZEIGE_PREISE = true;
export const PREIS_STAND = '23.10.2026';

export type PodProdukt = {
  name: string;
  marke: string;
  art: string;
  groessen: string;
  einSeite: number;
  zweiSeiten: number;
  bild?: string;
};

// Produkte einmal definieren, die Nischen wählen daraus.
const P = {
  changer: { name: 'Changer 2.0', marke: 'Stanley/Stella', art: 'Sweatshirt, Bio-Baumwolle', groessen: 'XXS bis 4XL', einSeite: 19.86, zweiSeiten: 24.86, bild: '/img/products/changer-2-0-natural-raw.jpg' },
  miniChanger: { name: 'Mini Changer 2.0', marke: 'Stanley/Stella', art: 'Kinder-Sweatshirt, Bio-Baumwolle', groessen: '3–4 bis 12–13 Jahre (98/104 bis 152/158)', einSeite: 14.17, zweiSeiten: 19.17, bild: '/img/products/mini-changer-2-0-eco-heather.jpg' },
  babyChanger: { name: 'Baby Changer', marke: 'Stanley/Stella', art: 'Baby-Sweatshirt, Bio-Baumwolle', groessen: '6–12 bis 24–36 Monate', einSeite: 14.14, zweiSeiten: 19.14, bild: '/img/products/baby-changer-natural-raw.jpg' },
  creator: { name: 'Creator 2.0', marke: 'Stanley/Stella', art: 'T-Shirt, Bio-Baumwolle', groessen: 'XXS bis 5XL', einSeite: 11.15, zweiSeiten: 16.15, bild: '/img/products/creator-2-0-white.jpg' },
  creatorLs: { name: 'Creator 2.0 Long Sleeve', marke: 'Stanley/Stella', art: 'Langarmshirt, Bio-Baumwolle', groessen: 'XXS bis 5XL', einSeite: 11.34, zweiSeiten: 16.34 },
  miniCreator: { name: 'Mini Creator 2.0', marke: 'Stanley/Stella', art: 'Kinder-T-Shirt, Bio-Baumwolle', groessen: '3–4 bis 12–13 Jahre (98/104 bis 152/158)', einSeite: 10.05, zweiSeiten: 15.05, bild: '/img/products/mini-creator-2-0-heather-grey.jpg' },
  babyCreator: { name: 'Baby Creator', marke: 'Stanley/Stella', art: 'Baby-T-Shirt, Bio-Baumwolle', groessen: '0–6 bis 24–36 Monate', einSeite: 9.94, zweiSeiten: 14.94, bild: '/img/products/baby-creator-white.jpg' },
  babyBody: { name: 'Baby Body', marke: 'Stanley/Stella', art: 'Baby-Body, Bio-Baumwolle', groessen: '0–3 bis 18–24 Monate', einSeite: 10.99, zweiSeiten: 15.99, bild: '/img/products/baby-body-white.jpg' },
  cruiser: { name: 'Cruiser 2.0', marke: 'Stanley/Stella', art: 'Hoodie, Bio-Baumwolle', groessen: 'XXS bis 5XL', einSeite: 23.75, zweiSeiten: 28.75, bild: '/img/products/cruiser-2-0-heather-grey.jpg' },
  miniCruiser: { name: 'Mini Cruiser 2.0', marke: 'Stanley/Stella', art: 'Kinder-Hoodie, Bio-Baumwolle', groessen: '3–4 bis 12–13 Jahre (98/104 bis 152/158)', einSeite: 18.55, zweiSeiten: 23.55 },
  drummer: { name: 'Drummer 2.0', marke: 'Stanley/Stella', art: 'Hoodie, Bio-Baumwolle', groessen: 'XXS bis 5XL', einSeite: 20.55, zweiSeiten: 25.55, bild: '/img/products/drummer-2-0-black.jpg' },
  tote: { name: 'Tote Bag', marke: 'Stanley/Stella', art: 'Stofftasche, Bio-Baumwolle', groessen: 'Einheitsgröße', einSeite: 9.94, zweiSeiten: 14.94 },
  classicT: { name: 'Classic-T', marke: 'Stedman', art: 'T-Shirt, 155 g', groessen: 'XXS bis 5XL', einSeite: 9.10, zweiSeiten: 14.10, bild: '/img/products/classic-t-white.jpg' },
  classicPolo: { name: 'Classic Polo', marke: 'Stedman', art: 'Poloshirt, 170 g', groessen: 'S bis 5XL', einSeite: 12.22, zweiSeiten: 17.22, bild: '/img/products/classic-polo-black-opal.jpg' },
  classicSweat: { name: 'Classic Sweatshirt', marke: 'Stedman', art: 'Sweatshirt, 280 g', groessen: 'XS bis 5XL', einSeite: 15.09, zweiSeiten: 20.09 },
  classicHoodie: { name: 'Classic Hoodie', marke: 'Stedman', art: 'Hoodie, 280 g', groessen: 'XS bis 5XL', einSeite: 17.25, zweiSeiten: 22.25, bild: '/img/products/classic-hoodie-black-opal.jpg' },
  by102: { name: 'Heavy Oversize Tee BY102', marke: 'Build Your Brand', art: 'Oversize-T-Shirt, schwer', groessen: 'XXS bis 5XL', einSeite: 12.95, zweiSeiten: 17.95, bild: '/img/products/byb-by102-black.webp' },
  by391: { name: 'Loose Fit Tee BY391', marke: 'Build Your Brand', art: 'Loose-Fit-T-Shirt', groessen: 'S bis 5XL', einSeite: 11.95, zweiSeiten: 16.95 },
  by011: { name: 'Heavy Hoody BY011', marke: 'Build Your Brand', art: 'Hoodie, schwer', groessen: 'XS bis 5XL', einSeite: 20.95, zweiSeiten: 25.95, bild: '/img/products/byb-by011-black.webp' },
} satisfies Record<string, PodProdukt>;

export type PodNische = {
  slug: string;
  kurz: string; // Name in Listen und Breadcrumb
  title: string; // <title>, ohne " | westernprint"
  description: string;
  eyebrow: string;
  h1: string; // darf <span class='hl'> enthalten
  lede: string;
  bild: string;
  bildAlt: string;
  antwort: string; // zitierfähiger Absatz direkt unter dem Hero
  zielgruppe: string; // für Schema audience
  ideen: { icon: string; t: string; d: string }[];
  produkte: PodProdukt[];
  produkteIntro: string;
  besonderheiten: { icon: string; t: string; d: string }[];
  faqs: { q: string; a: string }[];
};

export const nischen: PodNische[] = [
  {
    slug: 'familie-und-kinder',
    kurz: 'Familie, Kinder und Partnerlook',
    title: 'Print-on-Demand für Familienshirts und Partnerlook',
    description: 'Print-on-Demand für Familien-Sets: Mama, Papa, Kind und Baby im selben Stoff und in derselben Farbe. Bio-Baumwolle, Personalisierung ab 1 Stück, gedruckt in Oberhausen.',
    eyebrow: 'Print-on-Demand für Familien-Sets',
    h1: "Print-on-Demand für Familienshirts. <span class='hl'>Mama, Papa, Kind und Baby aus einer Serie.</span>",
    lede: 'Du verkaufst Partnerlook, Geschwister-Sets oder personalisierte Familienpullis. Wir drucken jede Bestellung einzeln in Oberhausen, in Erwachsenen-, Kinder- und Babygrößen aus derselben Stanley/Stella-Serie, und schicken sie neutral in deinem Namen.',
    bild: '/img/products/baby-changer-model.jpg',
    bildAlt: 'Kleinkind im hellgrauen Baby Changer Sweatshirt von Stanley/Stella, sitzend auf hellem Boden',
    antwort: 'Für Familien-Sets passt die Changer-Familie von Stanley/Stella: Changer 2.0 für Erwachsene, Mini Changer 2.0 für Kinder von 3 bis 13 Jahren und Baby Changer für 6 bis 36 Monate, im selben Bio-Baumwoll-Sweat und in gemeinsamen Farben wie Natural Raw. westernprint druckt jede Bestellung einzeln per DTF oder DTG, auch mit Namen pro Bestellung, und versendet in 1 bis 3 Werktagen neutral per DHL.',
    zielgruppe: 'Shops für Familien- und Partnerlook-Kleidung',
    ideen: [
      { icon: 'users-three', t: 'Partnerlook-Sets', d: 'Mama und Mini, Papa und Mini, die ganze Familie im selben Motiv. Der Käufer bestellt die Größen einzeln, wir drucken alles in einem Paket.' },
      { icon: 'baby', t: 'Geburt und Geschwister', d: 'Bodys mit Namen und Geburtsdatum, „Großer Bruder“-Shirts, Baby-Ankündigungen. Bodys gibt es ab 0 Monaten.' },
      { icon: 'pencil-simple-line', t: 'Personalisiert mit Namen', d: 'Familienname mit Jahreszahl, Vornamen aller Kinder, Initialen auf dem Ärmel. Jede Datei kommt pro Bestellung, wir drucken ab 1 Stück.' },
      { icon: 'snowflake', t: 'Weihnachts-Familienpullis', d: 'Das stärkste Quartal für Familien-Sets. Wir produzieren auch in der Black Week und im Dezember in 1 bis 3 Werktagen.' },
    ],
    produkte: [P.changer, P.miniChanger, P.babyChanger, P.creator, P.miniCreator, P.babyCreator, P.babyBody, P.cruiser, P.miniCruiser],
    produkteIntro: 'Die Changer- und Creator-Serien gibt es in Erwachsenen-, Kinder- und Babygrößen. Viele Farben, zum Beispiel Natural Raw, Heather Grey und French Navy, laufen durch alle Größen, so passt das Set farblich zusammen.',
    besonderheiten: [
      { icon: 'ruler', t: 'Kindergrößen mit Alter', d: 'Mini-Größen von 3–4 Jahren (98/104) bis 12–13 Jahren (152/158), Baby von 0–3 bis 24–36 Monaten. Für Kinder- und Babyprodukte legst du im Designer eine eigene, kleinere Motivbreite in Zentimetern fest.' },
      { icon: 'leaf', t: 'Bio-Baumwolle mit Nachweis', d: 'Stanley/Stella ist GOTS-zertifiziert, OEKO-TEX Standard 100 und Mitglied der Fair Wear Foundation. Das ist für Eltern beim Kauf oft entscheidend.' },
      { icon: 'check-circle', t: 'Freigabe bei Personalisierung', d: 'Personalisierte Bestellungen drucken wir erst, wenn die Datei da ist. In der Shopify-App gibst du die fertige Datei vor dem Druck im Portal frei, zum Beispiel aus Teeinblue.' },
    ],
    faqs: [
      { q: 'Welche Textilien passen für Familien-Sets?', a: 'Am besten die Changer-Familie von Stanley/Stella: Changer 2.0 für Erwachsene, Mini Changer 2.0 für Kinder von 3–4 bis 12–13 Jahren und Baby Changer für 6–12 bis 24–36 Monate. Für T-Shirts gibt es dasselbe mit Creator 2.0, Mini Creator 2.0 und Baby Creator, dazu den Baby Body ab 0–3 Monaten. Alle aus Bio-Baumwolle, in gemeinsamen Farben.' },
      { q: 'Was kostet ein Familien-Set in der Produktion?', a: 'Produktionspreis netto mit einem Druck: Changer 2.0 19,86 €, Mini Changer 2.0 14,17 €, Baby Changer 14,14 €, Creator 2.0 11,15 €, Baby Body 10,99 €. Ein Set aus zwei Erwachsenen-Pullis, einem Kinder- und einem Baby-Pulli liegt also bei 68,03 € netto plus 6,50 € Versand innerhalb Deutschlands. Keine Grundgebühr, kein Abo.' },
      { q: 'Kann jedes Teil einen anderen Namen bekommen?', a: 'Ja. Jedes Teil wird einzeln gedruckt, deshalb kann jedes Teil ein eigenes Motiv oder einen eigenen Namen haben. In der Shopify-App kommen personalisierte Dateien pro Bestellung, zum Beispiel aus Teeinblue, und du gibst sie vor dem Druck frei.' },
      { q: 'Wie werden die Kindergrößen angegeben?', a: 'Mit Alter und Körpergröße: 3–4 Jahre (98/104), 5–6 Jahre (110/116), 7–8 Jahre (122/128), 9–11 Jahre (134/146) und 12–13 Jahre (152/158). Babygrößen in Monaten, beim Body von 0–3 bis 18–24 Monaten, beim Baby Changer von 6–12 bis 24–36 Monaten.' },
      { q: 'Kommen alle Teile einer Bestellung in einem Paket?', a: 'Ja. Eine Bestellung mit mehreren Größen drucken wir zusammen und verschicken sie in einem Paket. Versand innerhalb Deutschlands 5,00 € netto pro Bestellung, je volle 3 Artikel kommen 1,50 € dazu.' },
    ],
  },
  {
    slug: 'haustiere',
    kurz: 'Haustier-Motive',
    title: 'Print-on-Demand für Haustier-Shirts und Tierporträts',
    description: 'Print-on-Demand für Haustier-Motive: Hundemama-Shirts, Tierporträts vom Foto, Katzen-Hoodies. Fotos per DTG auf Baumwolle, ab 1 Stück, gedruckt in Oberhausen.',
    eyebrow: 'Print-on-Demand für Haustier-Motive',
    h1: "Print-on-Demand für Haustier-Motive. <span class='hl'>Vom Tierfoto bis zum Hundemama-Shirt.</span>",
    lede: 'Du verkaufst Tierporträts, Hunde- und Katzenmotive oder Shirts mit dem Namen des Haustiers. Wir drucken jede Bestellung einzeln, Fotos per DTG direkt in die Baumwolle, und schicken sie neutral in deinem Namen.',
    bild: '/img/druck-makro.jpg',
    bildAlt: 'Nahaufnahme eines Drucks auf grau meliertem Shirt, jede Masche und die matte Druckoberfläche sichtbar',
    antwort: 'Für Haustier-Motive mit Fotos ist DTG die beste Wahl: Der Druck geht direkt in die Baumwolle, feine Fellstrukturen und Verläufe bleiben erhalten. westernprint druckt Tierporträts, Namen und Sprüche ab 1 Stück auf Stanley/Stella Creator 2.0, Changer 2.0 und Cruiser 2.0, prüft jede Datei vor dem Druck und versendet in 1 bis 3 Werktagen neutral per DHL.',
    zielgruppe: 'Shops für Haustier-Motive und Tierporträts',
    ideen: [
      { icon: 'camera', t: 'Tierporträt vom Foto', d: 'Der Käufer lädt ein Foto hoch, du lieferst die fertige Datei, wir drucken. Auf heller Baumwolle per DTG fotorealistisch.' },
      { icon: 'paw-print', t: 'Hundemama, Katzenpapa', d: 'Sprüche mit Name und Rasse, Pfotenabdrücke, Rassen-Illustrationen. Klassiker mit hoher Wiederkaufrate.' },
      { icon: 'heart', t: 'Gedenk-Motive', d: 'Erinnerung an ein verstorbenes Tier, mit Name und Daten. Personalisiert und ab 1 Stück.' },
      { icon: 'tote', t: 'Taschen und Langarm', d: 'Tote Bags für Gassi-Zubehör und Langarmshirts für die kalte Jahreszeit, im selben Design wie das Shirt.' },
    ],
    produkte: [P.creator, P.creatorLs, P.changer, P.cruiser, P.drummer, P.tote, P.classicT],
    produkteIntro: 'Für Fotos und feine Details empfehlen wir helle Baumwolle mit DTG, für kräftige Grafiken und dunkle Textilien DTF. Beides wählst du je Produkt im Designer.',
    besonderheiten: [
      { icon: 'image', t: 'DTG für Fotos', d: 'Auf heller Baumwolle druckt DTG direkt in die Faser. Fell, Augen und Schatten bleiben fein, der Druck fühlt sich weich an.' },
      { icon: 'magnifying-glass', t: 'Jede Datei wird geprüft', d: 'Vor dem Druck prüfen wir Auflösung und Freistellung. Ist ein Foto zu klein oder der Hintergrund nicht sauber entfernt, melden wir uns, bevor wir drucken.' },
      { icon: 'pencil-simple-line', t: 'Name pro Bestellung', d: 'Tiername, Rasse, Geburtsdatum: Personalisierte Dateien kommen pro Bestellung. In der Shopify-App gibst du sie vor dem Druck frei.' },
    ],
    faqs: [
      { q: 'Druckt ihr Tierfotos fotorealistisch?', a: 'Ja, per DTG auf heller Baumwolle, zum Beispiel auf dem Creator 2.0 von Stanley/Stella. Wichtig ist ein freigestelltes Foto als PNG mit transparentem Hintergrund in 300 dpi in Druckgröße. Auf dunklen Textilien drucken wir per DTF, auch dann bleiben Fotos sauber, der Druck liegt aber als dünne Schicht auf dem Stoff.' },
      { q: 'Was kostet ein Haustier-Shirt in der Produktion?', a: 'Creator 2.0 mit einem Druck 11,15 € netto, Changer 2.0 Sweatshirt 19,86 €, Cruiser 2.0 Hoodie 23,75 €, Tote Bag 9,94 €. Versand innerhalb Deutschlands 5,00 € netto pro Bestellung. Keine Grundgebühr, keine Mindestmenge.' },
      { q: 'Wer entfernt den Hintergrund vom Tierfoto?', a: 'Die Druckdatei lieferst du, also mit entferntem Hintergrund. Wir prüfen jede Datei vor dem Druck und sagen Bescheid, wenn die Auflösung nicht reicht oder Reste vom Hintergrund zu sehen sind.' },
      { q: 'Wie schnell ist ein personalisiertes Shirt beim Käufer?', a: 'Produktion 1 bis 3 Werktage ab Eingang der fertigen Datei, dann DHL. In Deutschland ist das Paket in der Regel 3 bis 5 Werktage nach der Bestellung beim Käufer.' },
    ],
  },
  {
    slug: 'vereine-und-fans',
    kurz: 'Vereins- und Fanshops',
    title: 'Print-on-Demand für Vereinsshops und Fanartikel',
    description: 'Print-on-Demand für Vereins- und Fanshops: Mitglieder und Fans bestellen online, wir drucken jedes Teil einzeln, auch mit Name und Nummer. Ohne Lager, ohne Sammelbestellung.',
    eyebrow: 'Print-on-Demand für Vereine und Fans',
    h1: "Print-on-Demand für Vereins- und Fanshops. <span class='hl'>Kein Lager, keine Sammelbestellung.</span>",
    lede: 'Mitglieder, Eltern und Fans bestellen selbst in eurem Online-Shop, wann sie wollen. Wir drucken jedes Teil einzeln in Oberhausen, auch mit Name und Rückennummer, und schicken es direkt nach Hause.',
    bild: '/img/vereinskleidung-trikots.jpg',
    bildAlt: 'Fünf bedruckte Trikots mit Namen und Rückennummern auf dem Werkstatttisch',
    antwort: 'Ein Vereinsshop mit Print-on-Demand braucht kein Lager und keine Sammelbestellung: Jedes Mitglied bestellt in Größe und mit Namen nach Wahl, westernprint druckt das Teil einzeln und versendet es per DHL. Gut geeignet sind die Stedman-Klassiker Classic-T ab 9,10 € und Classic Hoodie ab 17,25 € Produktionspreis netto, beide bis 5XL. Produktion in 1 bis 3 Werktagen.',
    zielgruppe: 'Vereine, Fanclubs und Fanshop-Betreiber',
    ideen: [
      { icon: 'shirt-folded', t: 'Vereinskollektion', d: 'T-Shirt, Hoodie, Polo und Sweat mit Vereinslogo. Mitglieder bestellen das ganze Jahr, ohne Bestellfrist und ohne Restposten.' },
      { icon: 'number-circle-seven', t: 'Name und Nummer', d: 'Rückendruck mit Name und Nummer pro Bestellung. Als zweite Druckseite für 5,00 € netto zusätzlich.' },
      { icon: 'megaphone', t: 'Fanclub- und Ultra-Merch', d: 'Eigene Motive für Fanclubs, Auswärtsfahrten, Choreos. Kleine Auflagen ab 1 Stück, nachbestellbar.' },
      { icon: 'trophy', t: 'Saison- und Event-Shirts', d: 'Aufstieg, Jubiläum, Turnier: Das Motiv geht online, sobald es fertig ist, ohne Vorproduktion.' },
    ],
    produkte: [P.classicT, P.classicPolo, P.classicSweat, P.classicHoodie, P.creator, P.miniCreator, P.cruiser],
    produkteIntro: 'Die Stedman-Klassiker sind preisstark und gehen bis 5XL. Für die Jugendabteilung gibt es Kindergrößen, für den Premium-Hoodie Stanley/Stella aus Bio-Baumwolle.',
    besonderheiten: [
      { icon: 'storefront', t: 'Eigener Shop, keine Kasse im Verein', d: 'Über die Shopify-App läuft der Shop des Vereins mit unserer Produktion. Das Geld geht an den Shop, wir rechnen nur Produktion und Versand ab.' },
      { icon: 'arrows-clockwise', t: 'Nachbestellen ohne Restposten', d: 'Neues Mitglied, neue Größe: Einzelteile kosten dasselbe wie die erste Bestellung. Nichts liegt im Vereinsheim herum.' },
      { icon: 'shield-check', t: 'Rechte am Logo', d: 'Wir drucken Vereinslogos und eigene Motive. Wappen und Marken Dritter, zum Beispiel von Profivereinen, nur mit deren Erlaubnis.' },
    ],
    faqs: [
      { q: 'Wie funktioniert ein Vereinsshop mit Print-on-Demand?', a: 'Der Verein betreibt einen Shopify-Shop und verbindet ihn mit unserer kostenlosen App „westernprint POD“. Mitglieder bestellen und bezahlen im Shop, die Bestellung kommt automatisch zu uns, wir drucken und schicken sie direkt an das Mitglied. Der Verein zahlt uns einmal pro Woche Produktion und Versand der bestellten Teile per SEPA-Lastschrift.' },
      { q: 'Was kostet ein Vereinsshirt in der Produktion?', a: 'Stedman Classic-T mit Vereinslogo vorne 9,10 € netto, Classic Polo 12,22 €, Classic Sweatshirt 15,09 €, Classic Hoodie 17,25 €. Mit Name und Nummer auf dem Rücken kommen 5,00 € dazu. Versand innerhalb Deutschlands 5,00 € netto pro Bestellung.' },
      { q: 'Wir brauchen 50 Hoodies auf einmal. Geht das auch?', a: 'Ja, aber dafür ist unsere Großauflage günstiger als Print-on-Demand. Für eine Sammelbestellung bekommst du Staffelpreise ab 10 und ab 50 Stück, siehe Großauflagen. Print-on-Demand lohnt sich für alles, was danach einzeln nachbestellt wird.' },
      { q: 'Druckt ihr Wappen von Profivereinen?', a: 'Nur mit Erlaubnis des Rechteinhabers. Eigene Vereinslogos, Fanclub-Motive und eigene Designs drucken wir ab 1 Stück.' },
    ],
  },
  {
    slug: 'bands-und-creator',
    kurz: 'Bands, Creator und Podcasts',
    title: 'Merch on Demand für Bands, Creator und Podcasts',
    description: 'Merch on Demand für Bands, YouTuber, Streamer und Podcasts: Heavy Oversize Tees, Hoodies und Taschen mit großem Rückendruck und Nackenprint, ab 1 Stück, gedruckt in Deutschland.',
    eyebrow: 'Merch on Demand',
    h1: "Merch on Demand für Bands, Creator und Podcasts. <span class='hl'>Drop online, wir drucken.</span>",
    lede: 'Du verkaufst Merch an deine Community und willst kein Lager voller falscher Größen. Wir drucken jede Bestellung einzeln, mit großem Rückendruck und deinem Logo im Nacken, und schicken sie neutral in deinem Namen.',
    bild: '/img/streetwear-trio.jpg',
    bildAlt: 'Drei Personen in bedruckten Shirts',
    antwort: 'Merch on Demand heißt: Fans bestellen im Shop, westernprint druckt jedes Teil einzeln in Oberhausen und versendet es per DHL, ohne Vorproduktion und ohne Restposten. Für Band- und Creator-Merch passen Heavy Oversize Tees von Build Your Brand ab 12,95 € und Hoodies ab 17,25 € Produktionspreis netto, mit Rückendruck bis 38 cm Breite und Nackenprint statt Herstelleretikett.',
    zielgruppe: 'Bands, Musiker, Content Creator, Streamer und Podcasts',
    ideen: [
      { icon: 'music-notes', t: 'Tour- und Album-Merch', d: 'Tourdaten auf dem Rücken, Albumcover vorne. Neue Daten gehen online, ohne alte Shirts abschreiben zu müssen.' },
      { icon: 'video-camera', t: 'Creator- und Streamer-Drops', d: 'Limitierte Drops für deine Community. Der Shop verkauft, wir drucken nach Bestellung, auch wenn an einem Abend 100 Bestellungen kommen.' },
      { icon: 'microphone', t: 'Podcast-Merch', d: 'Insider-Sprüche, Logo, Episoden-Zitate. Tote Bags und Hoodies für die Hörer, ohne Startkapital.' },
      { icon: 'tag', t: 'Eigenes Label im Nacken', d: 'Dein Logo im Nacken statt Herstelleretikett, ab dem ersten Teil. Viele Build-Your-Brand-Modelle kommen ohne Etikett.' },
    ],
    produkte: [P.by102, P.by391, P.by011, P.classicT, P.classicHoodie, P.creator, P.cruiser, P.tote],
    produkteIntro: 'Heavy Oversize von Build Your Brand für den Streetwear-Look, Stedman für günstigen Konzert-Merch, Stanley/Stella für Bio-Baumwolle. Nackenprint kostet 3,00 € netto zusätzlich.',
    besonderheiten: [
      { icon: 'arrows-out', t: 'Großer Rückendruck', d: 'Rückenmotive bis 38 cm Breite beim T-Shirt. Die exakte Zone je Textil zeigt der Designer, die Breite stellst du in Zentimetern ein.' },
      { icon: 'clock', t: 'Auch wenn der Drop knallt', d: 'Produktion in 1 bis 3 Werktagen, Kapazität für 50 Bestellungen am Tag. Planst du einen großen Drop, sag uns vorher Bescheid.' },
      { icon: 'package', t: 'Dein Verpackungsmaterial', d: 'Gebrandete Versandtaschen, Sticker, Danke-Karten lieferst du an, wir verpacken damit. Neutral ohne westernprint-Logo ist Standard.' },
    ],
    faqs: [
      { q: 'Was ist Merch on Demand?', a: 'Merch on Demand ist Print-on-Demand für Fanartikel: Ein Shirt oder Hoodie wird erst gedruckt, wenn ein Fan es im Shop gekauft hat. Du brauchst kein Lager, keine Vorkasse und hast keine Restposten. Wir drucken in Oberhausen und versenden per DHL direkt an den Fan.' },
      { q: 'Was kostet Band-Merch in der Produktion?', a: 'Produktionspreis netto mit einem Druck: Heavy Oversize Tee BY102 12,95 €, Stedman Classic-T 9,10 €, Classic Hoodie 17,25 €, Heavy Hoody BY011 20,95 €, Tote Bag 9,94 €. Zweite Druckseite 5,00 €, Nackenprint 3,00 €. Versand innerhalb Deutschlands 5,00 € netto pro Bestellung.' },
      { q: 'Kann ich vor dem Drop ein Muster bestellen?', a: 'Ja. Muster bestellst du im Portal der App zum Produktionspreis, ohne Umweg über deinen Shop. So siehst du Stoff, Farbe und Druck, bevor der Drop online geht.' },
      { q: 'Was passiert, wenn an einem Tag sehr viele Bestellungen kommen?', a: 'Wir schaffen rund 50 Bestellungen am Tag in 1 bis 3 Werktagen. Planst du einen großen Drop, sag uns Termin und erwartete Menge vorher, dann legen wir Rohware bereit.' },
    ],
  },
  {
    slug: 'berufe',
    kurz: 'Berufe-Shirts',
    title: 'Print-on-Demand für Berufe-Shirts und Sprüche',
    description: 'Print-on-Demand für Berufe-Shirts: Pflege, Kita, Schule, Handwerk, Büro. Sprüche-Shirts und Hoodies ab 1 Stück, personalisiert mit Namen, gedruckt in Oberhausen.',
    eyebrow: 'Print-on-Demand für Berufe-Shirts',
    h1: "Print-on-Demand für Berufe-Shirts. <span class='hl'>Für Pflege, Kita, Schule und Handwerk.</span>",
    lede: 'Du verkaufst Sprüche-Shirts für Pflegekräfte, Erzieherinnen, Lehrkräfte oder Handwerker, als Geschenk zum Abschied oder zur Rente. Wir drucken jede Bestellung einzeln und schicken sie neutral in deinem Namen.',
    bild: '/img/packtisch.jpg',
    bildAlt: 'Frisch bedruckte Shirts auf dem Packtisch mit Klebeband, Schere und Versandkarton',
    antwort: 'Berufe-Shirts sind ein Geschenke-Markt: Abschied, Rente, Examen, Dankeschön an die Kita. westernprint druckt solche Sprüche-Shirts und Hoodies ab 1 Stück, auf Wunsch mit dem Namen des Beschenkten, auf Stedman Classic-T ab 9,10 € oder Stanley/Stella Creator 2.0 ab 11,15 € Produktionspreis netto. Versand in 1 bis 3 Werktagen neutral per DHL.',
    zielgruppe: 'Shops für Berufe-Shirts und Geschenkideen',
    ideen: [
      { icon: 'first-aid-kit', t: 'Pflege und Medizin', d: 'Sprüche für Pflegekräfte, Hebammen, Rettungsdienst. Beliebt zum Examen und als Team-Geschenk auf Station.' },
      { icon: 'chalkboard-teacher', t: 'Kita und Schule', d: 'Danke-Shirts für Erzieherinnen und Lehrkräfte zum Abschied, mit den Namen der Kinder auf dem Rücken.' },
      { icon: 'wrench', t: 'Handwerk', d: 'Meister, Azubi, Feierabend: Sprüche-Shirts und Hoodies für Handwerker, auch mit Firmenname.' },
      { icon: 'confetti', t: 'Rente und Jobwechsel', d: '„Rentner 2026“, „Ab heute im Ruhestand“: Einmalige Geschenke, personalisiert mit Namen und Datum.' },
    ],
    produkte: [P.classicT, P.creator, P.classicPolo, P.classicSweat, P.classicHoodie, P.changer, P.cruiser],
    produkteIntro: 'Stedman für günstige Spruch-Shirts mit guter Marge, Stanley/Stella für Bio-Baumwolle. Damen-Schnitte gibt es bei beiden Marken, die Auswahl siehst du im Designer der App.',
    besonderheiten: [
      { icon: 'users', t: 'Namen der Kinder oder Kollegen', d: 'Vorne der Spruch, hinten alle Namen: Die zweite Druckseite kostet 5,00 € netto zusätzlich, pro Bestellung mit eigener Datei.' },
      { icon: 'calendar-check', t: 'Termingeschenke', d: 'Abschied und Rente haben ein Datum. Produktion 1 bis 3 Werktage, beim Käufer in der Regel 3 bis 5 Werktage nach der Bestellung.' },
      { icon: 'info', t: 'Kein Arbeitsschutz', d: 'Berufe-Shirts sind Freizeit- und Geschenkartikel. Schutzkleidung mit Norm, zum Beispiel Warnschutz, bedrucken wir als Einzelauftrag, nicht im Print-on-Demand.' },
    ],
    faqs: [
      { q: 'Was kostet ein Berufe-Shirt in der Produktion?', a: 'Stedman Classic-T mit einem Druck 9,10 € netto, Stanley/Stella Creator 2.0 11,15 €, Classic Hoodie 17,25 €. Mit Namen auf dem Rücken kommen 5,00 € für die zweite Seite dazu. Versand innerhalb Deutschlands 5,00 € netto pro Bestellung.' },
      { q: 'Kann der Käufer einen Namen eingeben?', a: 'Ja. Personalisierte Bestellungen kommen mit eigener Datei pro Bestellung, in Shopify zum Beispiel über Teeinblue. Du gibst die fertige Datei vor dem Druck im Portal frei, wir drucken ab 1 Stück.' },
      { q: 'Gibt es Damen-Schnitte?', a: 'Ja, bei Stedman und Stanley/Stella. Welche Modelle es als Damen-Schnitt gibt, siehst du im Designer der App.' },
      { q: 'Druckt ihr auch Arbeitskleidung mit Firmenlogo?', a: 'Ja, aber das läuft als normaler Auftrag mit Staffelpreisen, nicht über Print-on-Demand. Mehr dazu auf der Seite für Handwerksbetriebe.' },
    ],
  },
  {
    slug: 'geschenke-und-hochzeit',
    kurz: 'Personalisierte Geschenke, Hochzeit und JGA',
    title: 'Print-on-Demand für personalisierte Geschenke und JGA',
    description: 'Print-on-Demand für personalisierte Geschenke: Hochzeit, JGA, Jahrestag, Geburt, Oma und Opa. Namen und Daten pro Bestellung, ab 1 Stück, gedruckt in Deutschland.',
    eyebrow: 'Print-on-Demand für Geschenkideen',
    h1: "Print-on-Demand für personalisierte Geschenke. <span class='hl'>Jeder Name, jedes Datum, ab 1 Stück.</span>",
    lede: 'Du verkaufst Geschenke mit Namen, Datum oder Koordinaten: zur Hochzeit, zum JGA, zum Jahrestag oder für Oma und Opa. Wir drucken jedes Stück einzeln und schicken es neutral in deinem Namen.',
    bild: '/img/products/changer-2-0-model.jpg',
    bildAlt: 'Person im Changer 2.0 Sweatshirt von Stanley/Stella vor hellem Hintergrund',
    antwort: 'Personalisierte Geschenke leben von Einzelstücken: Jeder Käufer hat einen anderen Namen, ein anderes Datum. westernprint druckt jede Bestellung einzeln per DTF oder DTG, auf T-Shirts ab 9,10 €, Sweatshirts ab 15,09 €, Hoodies ab 17,25 €, Baby-Bodys ab 10,99 € und Tote Bags ab 9,94 € Produktionspreis netto. Produktion in 1 bis 3 Werktagen, auch vor Weihnachten.',
    zielgruppe: 'Shops für personalisierte Geschenke',
    ideen: [
      { icon: 'heart', t: 'Paare und Jahrestage', d: 'Paar-Hoodies mit Datum, Koordinaten des ersten Treffens, „Mr & Mrs“ mit Nachnamen.' },
      { icon: 'champagne', t: 'JGA und Hochzeit', d: '„Team Braut“ mit Namen auf dem Rücken, Trauzeugen-Shirts, Hochzeitsdatum. Mehrere Teile pro Bestellung in einem Paket.' },
      { icon: 'baby', t: 'Geburt und Taufe', d: 'Bodys mit Namen, Gewicht und Geburtsdatum. Ab 0 Monaten, aus Bio-Baumwolle.' },
      { icon: 'gift', t: 'Oma, Opa und Familie', d: 'Enkel-Namen auf dem Pulli, Familienstammbaum, Fotos. Das Geschenk, das jedes Jahr wieder bestellt wird.' },
    ],
    produkte: [P.classicT, P.creator, P.creatorLs, P.changer, P.classicHoodie, P.cruiser, P.babyBody, P.tote],
    produkteIntro: 'Für den Preis-Einstieg Stedman, für Geschenke mit Wertigkeit Stanley/Stella aus Bio-Baumwolle. Fotos und Verläufe auf heller Baumwolle per DTG.',
    besonderheiten: [
      { icon: 'check-circle', t: 'Datei-Freigabe vor dem Druck', d: 'Personalisierte Bestellungen bleiben angehalten, bis die Datei da ist. In der Shopify-App gibst du sie im Portal frei, zum Beispiel aus Teeinblue.' },
      { icon: 'snowflake', t: 'Auch im Weihnachtsgeschäft', d: 'Produktion 1 bis 3 Werktage, auch in der Black Week und im Dezember. Für dich heißt das: längere Bestellfristen vor Weihnachten als bei Anbietern mit Vorlauf.' },
      { icon: 'envelope-simple', t: 'Deine Karte im Paket', d: 'Grußkarten, Sticker oder eigene Versandtaschen lieferst du an, wir legen sie bei. Kein westernprint-Logo im Paket.' },
    ],
    faqs: [
      { q: 'Was kostet ein personalisiertes Geschenk in der Produktion?', a: 'Produktionspreis netto mit einem Druck: Stedman Classic-T 9,10 €, Creator 2.0 11,15 €, Changer 2.0 Sweatshirt 19,86 €, Classic Hoodie 17,25 €, Baby Body 10,99 €, Tote Bag 9,94 €. Zweite Seite 5,00 €, Ärmel oder Nacken 3,00 €. Versand innerhalb Deutschlands 5,00 € netto pro Bestellung.' },
      { q: 'Wie kommt der Name des Käufers auf das Shirt?', a: 'Du lieferst pro Bestellung die fertige Druckdatei, in Shopify zum Beispiel automatisch über Teeinblue. Die Bestellung bleibt angehalten, bis du die Datei im Portal freigibst. Dann drucken wir in 1 bis 3 Werktagen.' },
      { q: 'Bis wann muss vor Weihnachten bestellt werden?', a: 'Produktion 1 bis 3 Werktage plus DHL-Laufzeit, in Deutschland meist 1 bis 2 Werktage. Den genauen letzten Bestelltag für Weihnachten 2026 sagen wir dir rechtzeitig, damit du ihn in deinem Shop ankündigen kannst.' },
      { q: 'Kann ich mehrere JGA-Shirts mit verschiedenen Namen in eine Bestellung packen?', a: 'Ja. Jedes Teil wird einzeln gedruckt, jedes mit eigenem Namen. Alle Teile einer Bestellung kommen in einem Paket, je volle 3 Artikel kosten 1,50 € netto Versand mehr.' },
    ],
  },
];

export const nischeBySlug = (slug: string) => nischen.find((n) => n.slug === slug);
