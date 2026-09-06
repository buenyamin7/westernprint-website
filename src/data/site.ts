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
};

export const nav = [
  { label: 'Für wen', href: '/fuer' },
  { label: 'Druckverfahren', href: '/druckverfahren' },
  { label: 'Großauflagen', href: '/grossauflagen' },
  { label: 'Textilien', href: '/textilien' },
  { label: 'Print-on-Demand', href: '/print-on-demand' },
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
