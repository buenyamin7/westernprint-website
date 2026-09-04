// Central site data. Change contact details, prices and links here.
export const site = {
  name: 'westernprint',
  legalName: 'westernprint GmbH',
  url: 'https://westernprint.de',
  tagline: 'Print-on-Demand Druckerei aus Oberhausen',
  phone: '+49 176 55412198',
  phoneHref: 'tel:+4917655412198',
  whatsapp: 'https://wa.me/4917655412198',
  email: 'info@westernprint.de',
  address: { street: 'Schenkendorfstraße 45', zip: '46047', city: 'Oberhausen', country: 'Deutschland' },
  instagram: 'https://www.instagram.com/westernprint.de',
  tiktok: 'https://www.tiktok.com/@westernprint.de',
  // Shop bleibt bei Shopify. Nach dem Domain-Umzug hier auf https://shop.westernprint.de umstellen.
  shopUrl: 'https://westernprint.de/collections/produkte',
  portalUrl: 'https://westernprint.de/account/login',
  // Formular-Endpoint (z. B. Formspree "https://formspree.io/f/xxxx"). Leer = Anfrage geht per WhatsApp raus.
  formEndpoint: '',
  ogImage: '/og-default.jpg',
};

export const nav = [
  { label: 'Print-on-Demand', href: '/print-on-demand' },
  { label: 'Großauflagen', href: '/grossauflagen' },
  { label: 'Druckverfahren', href: '/druckverfahren' },
  { label: 'Preise', href: '/preise' },
  { label: 'Über uns', href: '/ueber-uns' },
];

export const stats = [
  { value: '80.000+', label: 'belieferte Endkunden' },
  { value: '1 Mio. €', label: 'Umsatz unserer Partner-Shops' },
  { value: '5 Jahre', label: 'Print-on-Demand Erfahrung' },
  { value: '1-3 Tage', label: 'Versand innerhalb Deutschlands' },
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
    q: 'Wie funktioniert Print-on-Demand mit westernprint?',
    a: 'Du verbindest deinen Shopify-Shop mit unserer App oder unserem Kundenportal. Geht eine Bestellung ein, drucken, verpacken und versenden wir neutral in deinem Namen an deinen Kunden.',
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
    q: 'Wie läuft die Abrechnung bei Print-on-Demand?',
    a: 'Feste Preise pro Produkt inklusive Druck. Du bekommst wöchentlich eine Abrechnung über alle produzierten Artikel. Keine Einrichtungsgebühr, kein Mindestumsatz.',
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
