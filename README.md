# westernprint.de (neue Website)

Marketing-Website der westernprint GmbH, gebaut mit Astro (statisch, kein Server nötig). Design-Vorbild: stoff3.de, umgesetzt mit westernprint-Grün als Akzent.

## Struktur

| Seite | Datei | Ersetzt alte Shopify-URL |
|---|---|---|
| Startseite | `src/pages/index.astro` | `/` |
| Print-on-Demand Fulfillment | `src/pages/print-on-demand.astro` | `/pages/pod-druckverfahren-fulfillment` |
| B2B-Partner (50+ Orders/Tag) | `src/pages/b2b-partner.astro` | `/pages/b2b-pod-anfragen` |
| Großauflagen | `src/pages/grossauflagen.astro` | `/pages/grossbestellung` |
| Druckverfahren | `src/pages/druckverfahren.astro` | `/pages/druckverfahren-und-textilanbieter` |
| Preise | `src/pages/preise.astro` | `/pages/pod-preise` |
| Textilien | `src/pages/textilien.astro` | `/pages/bestellen` |
| Über uns | `src/pages/ueber-uns.astro` | `/pages/uber-uns` |
| Kontakt | `src/pages/kontakt.astro` | `/pages/contact` |
| Impressum, Datenschutz, AGB, Widerruf, Versand | `src/pages/*.astro` + `src/content/legal/*.html` | `/pages/...` |

Alle Weiterleitungen stehen in `public/_redirects` (Netlify, Cloudflare Pages) und `vercel.json` (Vercel).

## Wo was geändert wird

- **Kontaktdaten, Navigation, Preise, Bewertungen, FAQ, Produkte:** `src/data/site.ts`
- **Farben, Schrift, Abstände, Buttons:** `src/styles/global.css`
- **Rechtstexte:** `src/content/legal/*.html` (1:1 von der alten Seite übernommen)
- **Bilder:** `public/img/` (Hero: echter Drucker-Frame aus dem Badeyez-Spot, Galerie: Druckmuster-Fotos, Produkte: Stanley/Stella-Mockups aus Shopify)

## Kontaktformular

`site.formEndpoint` in `src/data/site.ts` ist leer. Dann öffnet das Formular WhatsApp mit einer vorausgefüllten Nachricht.
Für echte E-Mail-Zustellung einen Endpoint eintragen, z. B. Formspree (`https://formspree.io/f/<id>`) oder Web3Forms. Das Formular sendet JSON per POST.

## Lokal starten

```bash
npm install
npm run dev
```

Build: `npm run build` (Ausgabe in `dist/`).

## Deployment (empfohlen: Cloudflare Pages oder Vercel, kostenlos)

1. Projekt in ein Git-Repo pushen.
2. Bei Cloudflare Pages / Vercel importieren. Build-Befehl `npm run build`, Ausgabeordner `dist`.
3. Domain-Umzug:
   - Shopify bekommt die Subdomain `shop.westernprint.de` (Shopify Admin > Einstellungen > Domains).
   - `westernprint.de` zeigt per DNS auf das neue Hosting.
   - In `src/data/site.ts` `shopUrl` und `portalUrl` auf `https://shop.westernprint.de/...` umstellen.
4. Google Search Console: neue Sitemap `https://westernprint.de/sitemap-index.xml` einreichen.

## SEO

Jede Seite hat Titel, Meta-Description, Canonical, Open Graph, JSON-LD (LocalBusiness, FAQ auf Startseite und POD-Seite). Sitemap und robots.txt werden automatisch erzeugt.
