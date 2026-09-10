// Central site data. Change contact details, prices and links here.
export const site = {
  name: 'westernprint',
  legalName: 'westernprint GmbH',
  url: 'https://westernprint.de',
  tagline: 'Textildruck aus Oberhausen',
  phone: '+49 176 55412198',
  phoneHref: 'tel:+4917655412198',
  whatsapp: 'https://wa.me/4917655412198',
  email: 'info@westernprint.de',
  address: { street: 'Schenkendorfstraße 45', zip: '46047', city: 'Oberhausen', country: 'Deutschland' },
  instagram: 'https://www.instagram.com/westernprint.de',
  tiktok: 'https://www.tiktok.com/@westernprint.de',
  // Shop bleibt bei Shopify. Nach dem Domain-Umzug hier auf https://shop.westernprint.de umstellen.
  shopUrl: '/shop',
  // Kassen-Worker (Cloudflare). Nach dem Deploy hier die Worker-URL eintragen.
  checkoutApi: 'https://westernprint-checkout.westernprint-checkout.workers.dev',
  // Formular-Endpoint (z. B. Formspree "https://formspree.io/f/xxxx"). Leer = Anfrage geht per WhatsApp raus.
  formEndpoint: 'https://westernprint-checkout.westernprint-checkout.workers.dev/kontakt',
  // Motiv-Uploads im Shop: Cloudinary (kostenlos). Leer = Datei wird nach der Bestellung angefordert.
  cloudinary: { cloudName: 'c5unvw6r', uploadPreset: 'westernprint' },
  ogImage: '/og-default.jpg',
  // Google Ads Conversion-Tag. id = 'AW-XXXXXXXXXX' aus dem Google-Ads-Konto, conversions = Labels je Aktion.
  // Leer lassen = kein Tag, kein Banner, Seite bleibt cookielos.
  googleAds: { id: 'AW-17529116277', conversions: { lead: 'hJN4CIXNlfIcEPWsxKZB', whatsapp: 'ntGqCIjNlfIcEPWsxKZB' } },
};

export type NavChild = { label: string; href: string; hint?: string };
export type NavItem = { label: string; href: string; children?: NavChild[]; groups?: { title: string; items: NavChild[] }[]; cta?: { label: string; href: string; text: string } };

// Hauptnavigation mit Untermenüs (Desktop: Hover/Fokus, Mobil: Akkordeon).
export const nav: NavItem[] = [
  {
    label: 'Leistungen', href: '/druckverfahren',
    groups: [
      { title: 'Druckverfahren', items: [
        { label: 'DTF-Druck', href: '/druckverfahren', hint: 'Kräftige Farben, jede Stoffart, ab 1 Stück' },
        { label: 'DTG-Druck', href: '/druckverfahren', hint: 'Fotorealistisch auf Baumwolle' },
        { label: 'Sublimation', href: '/druckverfahren', hint: 'Allover auf Polyester und Sportbekleidung' },
        { label: 'Verfahren vergleichen', href: '/druckverfahren#vergleich', hint: 'Welches Verfahren wofür?' },
      ] },
      { title: 'Auftragsarten', items: [
        { label: 'Großauflagen ab 50 Stück', href: '/grossauflagen', hint: 'Staffelpreise, Korrekturabzug, fester Liefertermin' },
        { label: 'Textildruck Oberhausen', href: '/textildruck-oberhausen', hint: 'Vor Ort im Ruhrgebiet, Abholung möglich' },
        { label: 'Textilien und Marken', href: '/textilien', hint: 'Stanley/Stella, BYB, Neutral, JHK' },
        { label: 'Muster bestellen', href: '/sample', hint: 'Ein Stück mit deinem Motiv testen' },
      ] },
    ],
    cta: { label: 'Angebot in 24 Stunden', href: '/kontakt', text: 'Motiv und Stückzahl schicken, wir antworten mit festem Preis und Liefertermin.' },
  },
  {
    label: 'Print-on-Demand', href: '/print-on-demand',
    groups: [
      { title: 'Für Shop-Betreiber', items: [
        { label: 'Fulfillment für Shopify', href: '/print-on-demand', hint: 'Drucken, verpacken, versenden in 1-3 Tagen' },
        { label: 'Unsere Shopify-App', href: '/print-on-demand#app', hint: 'Installieren, designen, verkaufen' },
        { label: 'B2B-Partner werden', href: '/b2b-partner', hint: 'Konditionen für Agenturen und Wiederverkäufer' },
        { label: 'Eigene Brand gründen', href: '/textilien#brand-gruenden', hint: 'Ohne Lager, ohne Mindestmenge' },
      ] },
    ],
    cta: { label: 'Muster anfordern', href: '/sample', text: 'Erst anfassen, dann entscheiden: Ein Sample mit deinem Motiv.' },
  },
  {
    label: 'Für wen', href: '/fuer',
    groups: [
      { title: 'Schule & Bildung', items: [
        { label: 'Abschlussklassen', href: '/fuer/abschlussklassen' },
        { label: 'Kitas und Schulen', href: '/fuer/kitas-und-schulen' },
        { label: 'Hochschulen', href: '/fuer/hochschulen-und-fachschaften' },
      ] },
      { title: 'Vereine & Gemeinden', items: [
        { label: 'Sportvereine und Teams', href: '/fuer/sportvereine' },
        { label: 'Vereine und Ehrenamt', href: '/fuer/vereine-und-ehrenamt' },
        { label: 'Feuerwehr und Rettung', href: '/fuer/feuerwehr-und-rettungsdienst' },
        { label: 'Kirchen, Moscheen, Kultur', href: '/fuer/moscheen-und-kulturvereine' },
      ] },
      { title: 'Betriebe & Gewerbe', items: [
        { label: 'Handwerksbetriebe', href: '/fuer/handwerksbetriebe' },
        { label: 'Firmen und Büro', href: '/fuer/firmen-und-buero' },
        { label: 'Gastro und Hotels', href: '/fuer/restaurants-und-cafes' },
        { label: 'Fitness und Kampfsport', href: '/fuer/fitness-und-kampfsport' },
      ] },
      { title: 'Marken & Events', items: [
        { label: 'Streetwear-Brands', href: '/fuer/streetwear-brands' },
        { label: 'Bands, Künstler, Creator', href: '/fuer/bands-und-kuenstler' },
        { label: 'Events und Festivals', href: '/fuer/events-und-festivals' },
        { label: 'JGA und Feiern', href: '/fuer/jga-und-feiern' },
      ] },
    ],
  },
  {
    label: 'Shop', href: '/shop',
    groups: [
      { title: 'Kategorien', items: [
        { label: 'T-Shirts', href: '/shop?kategorie=T-Shirts' },
        { label: 'Hoodies', href: '/shop?kategorie=Hoodies' },
        { label: 'Sweatshirts', href: '/shop?kategorie=Sweatshirts' },
        { label: 'Polos', href: '/shop?kategorie=Polos' },
        { label: 'Jacken', href: '/shop?kategorie=Jacken' },
        { label: 'Tank Tops', href: '/shop?kategorie=Tank%20Tops' },
      ] },
      { title: 'Weitere', items: [
        { label: 'Kinder', href: '/shop?kategorie=Kinder' },
        { label: 'Baby', href: '/shop?kategorie=Baby' },
        { label: 'Taschen', href: '/shop?kategorie=Taschen' },
        { label: 'Accessoires', href: '/shop?kategorie=Accessoires' },
        { label: 'Alle Produkte', href: '/shop' },
      ] },
    ],
    cta: { label: 'Warenkorb', href: '/warenkorb', text: 'Ab 1 Stück, Motiv hochladen, Vorschau sehen, bestellen.' },
  },
  { label: 'Über uns', href: '/ueber-uns' },
];

export const stats = [
  { value: '80.000+', label: 'bedruckte Textilien' },
  { value: 'Ab 1 Stück', label: 'ohne Mindestmenge' },
  { value: '24 h', label: 'bis zum Angebot' },
  { value: '1-3 Tage', label: 'Produktion und Versand' },
];

export const testimonials = [
  {
    quote: 'Vor zwei Jahren von einem großen deutschen Anbieter gewechselt. Support persönlicher, Lieferzeiten spürbar schneller, Druckqualität konstant top.',
    name: 'Julia M.',
    role: 'Inhaberin eines Shopify-Shops',
  },
  {
    quote: 'Vier Jahre mit einem asiatischen Dropshipper gearbeitet. Seit dem Wechsel hat sich mein Retourenanteil halbiert und Kunden loben wieder die Qualität.',
    name: 'Tim R.',
    role: 'POD-Shop-Betreiber',
  },
  {
    quote: 'Seit 2022 dabei: zuverlässig, erreichbar und fair. Sie denken wirklich mit und gehen auf Wünsche ein. So funktioniert Partnerschaft.',
    name: 'Mehmet A.',
    role: 'Betreiber eines Merch-Shops',
  },
];

export const faqs = [
  {
    q: 'Gibt es eine Mindestbestellmenge?',
    a: 'Nein. Wir produzieren ab 1 Stück. Für Großauflagen ab 50 Stück gibt es Staffelpreise und ein individuelles Angebot.',
  },
  {
    q: 'Wie schnell bekomme ich ein Angebot?',
    a: 'Innerhalb von 24 Stunden an Werktagen, meist schneller. Du bekommst einen festen Preis, einen Korrekturabzug mit deinem Motiv auf dem Textil und einen Liefertermin.',
  },
  {
    q: 'Kann ich eigene Textilien anliefern?',
    a: 'Ja. Wir bedrucken auch angelieferte Ware, dann zahlst du nur den Druck. Wir empfehlen 2 bis 3 Prozent Reserve, für Materialfehler an beigestellter Ware haften wir nicht.',
  },
  {
    q: 'Wie schnell wird geliefert?',
    a: 'Innerhalb Deutschlands in der Regel in 1 bis 3 Werktagen, auch im Weihnachtsgeschäft. Europaweit meist in 3 bis 5 Tagen.',
  },
  {
    q: 'Welche Druckverfahren nutzt ihr?',
    a: 'DTF (Direct to Film) für Farbverläufe und alle Textilien, DTG (Direct to Garment) für fotorealistische Einzelstücke, Sublimation für Tassen und Accessoires. Alles auf Epson-Maschinen in Oberhausen.',
  },
  {
    q: 'Welche Textilien bedruckt ihr?',
    a: 'Standard ist Stanley/Stella (Bio-Baumwolle, GOTS-zertifiziert). Dazu Stedman und auf Anfrage weitere Marken. Eigene Textilien kannst du uns zusenden.',
  },
  {
    q: 'Welches Dateiformat braucht ihr?',
    a: 'Am besten PNG mit transparentem Hintergrund in 300 dpi oder eine vektorisierte PDF. Wir prüfen jede Datei vor dem Druck und melden uns, wenn etwas nicht passt.',
  },
  {
    q: 'Wie bezahle ich?',
    a: 'Einzelstücke im Shop per PayPal, Klarna, Kreditkarte oder Überweisung. Aufträge auf Angebot per Vorkasse oder Rechnung, Firmen und Vereine auf Rechnung nach Absprache.',
  },
  {
    q: 'Macht ihr auch Print-on-Demand für Shops?',
    a: 'Ja, als eigenes Angebot für Shop-Betreiber: Wir drucken und versenden deine Bestellungen neutral in deinem Namen. Alle Infos auf der Seite Print-on-Demand.',
  },
];

export const podPrices = [
  { name: 'Crafter', type: 'Unisex T-Shirt', sku: 'STTU170', price: '10,47 €' },
  { name: 'Creator 2.0', type: 'Unisex T-Shirt', sku: 'STTU169', price: '11,65 €' },
  { name: 'Breezer', type: 'Oversized T-Shirt', sku: 'STTU964', price: '12,20 €' },
  { name: 'Muser', type: 'Damen T-Shirt', sku: 'STTW172', price: '11,45 €' },
  { name: 'Drummer 2.0', type: 'Unisex Hoodie', sku: 'STSU168', price: '21,45 €' },
  { name: 'Chaser', type: 'Oversized Hoodie', sku: 'STSU077', price: '23,65 €' },
  { name: 'Stanley Coaster', type: 'Polo-Shirt', sku: 'STPM224', price: '14,30 €' },
  { name: 'Mover 2.0', type: 'Jogger', sku: 'STBU185', price: '24,59 €' },
  { name: 'Mini Creator 2.0', type: 'Kids T-Shirt', sku: 'STTK184', price: '11,05 €' },
  { name: 'Baby Creator', type: 'Baby T-Shirt', sku: 'STTB918', price: '10,97 €' },
  { name: 'Baby Body', type: 'Baby Body', sku: 'STUB103', price: '10,99 €' },
  { name: 'Tote Bag', type: 'Beutel', sku: 'STAU760', price: '9,97 €' },
  { name: 'Stanley Stancer', type: 'Tanktop', sku: 'STTM961', price: '10,97 €' },
  { name: 'Stanley Quester', type: 'Softshell', sku: 'STJM240', price: '20,55 €' },
];

export const shipping = [
  { region: 'Deutschland', price: '5 €' },
  { region: 'Österreich', price: '7 €' },
  { region: 'EU (übrige Länder)', price: '9 €' },
  { region: 'Schweiz', price: '9 €' },
];

export const products = [
  { name: 'Crafter', type: 'Unisex T-Shirt', img: '/img/prod-crafter.jpg' },
  { name: 'Muser', type: 'Damen T-Shirt', img: '/img/prod-muser.jpg' },
  { name: 'Breezer', type: 'Oversized T-Shirt', img: '/img/prod-breezer.jpg' },
  { name: 'Drummer 2.0', type: 'Unisex Hoodie', img: '/img/prod-drummer.jpg' },
  { name: 'Chaser', type: 'Oversized Hoodie', img: '/img/prod-chaser.jpg' },
  { name: 'Radder 2.0', type: 'Sweatshirt', img: '/img/prod-radder.jpg' },
  { name: 'Stanley Coaster', type: 'Polo-Shirt', img: '/img/prod-coaster.jpg' },
  { name: 'Mover 2.0', type: 'Jogger', img: '/img/prod-mover.jpg' },
];
