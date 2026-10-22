// Preisbeispiele westernprint: netto zzgl. 19 % MwSt., ein Druck (Brust oder Rücken, bis 30 x 40 cm), Textil inklusive.
// Einzige Quelle für /was-kostet-textildruck (Tabellen, generierte Antwortsätze, JSON-LD), /fuer/handwerksbetriebe,
// die Stadtseiten (src/data/staedte.ts), /textildruck-oberhausen, /textildruck-ruhrgebiet und /llms-full.txt.
// Bei Preisänderungen hier ändern und STAND anpassen. Hier stehen nur Nettopreise. Den Bruttopreis (netto x 1,19,
// auf Cent gerundet) rechnen die Seiten selbst aus. Ausnahme: Posten mit istBrutto (Versand) sind schon Endpreise.
// Die festen Sätze in src/data/zielgruppen.ts, den Branchen-Seiten und public/llms.txt dann mitprüfen.
//
// Rechenweg (Regel des Inhabers vom 14.10.2026, EK aus der POD-App-Datenbank, abgelesen am 22.10.2026, Größen bis XXL):
//   Stückpreis = Einkaufspreis des Textils + Aufschlag für Druck und Arbeit.
//   Aufschlag bei einem Druck: 1 Stück +12,00 | 10 Stück +8,00 | 50 Stück +7,50 | 100 Stück +7,00 | 200 Stück +6,50
//   (Spalte "nur Rücken bis 30 x 40" der Staffel, damit kein Angebot über dem Preis auf der Website liegt;
//   ein kleines Brustlogo ist ab 50 Stück 1,00 bis 1,50 € günstiger und steht so im Angebot).
//   Zweite Druckseite: +6,00 bei 1 bis 10 Stück, +4,00 ab 11 Stück, +3,50 ab 50 Stück. Nacken und Ärmel je +3,00.
//   Genau 10 Stück bekommen schon den Preis ab 11 Stück, deshalb gibt es keine eigene Zeile für 25 Stück.
//   EK (Standardfarben): Classic-T 2,10 | Creator 2.0 4,15 | BY102 5,95 | Classic Polo 5,22 | Classic Sweatshirt 8,09 |
//   Classic Hoodie 10,25 | Styler 15,75 | Lux Softshell 26,89. Größen ab 3XL und melierte Stanley/Stella-Farben (Heather)
//   haben einen höheren EK, der Aufpreis steht im Angebot.

export const STAND = '22.10.2026';

export const tabellen: { t: string; d: string; zeilen: [string, string][] }[] = [
  {
    t: 'T-Shirt Basic (Stedman Classic-T, 155 g)',
    d: 'Der günstige Klassiker für Vereine, Events und Give-aways.',
    zeilen: [['1 Stück', '14,10 €'], ['10 Stück', '10,10 €'], ['50 Stück', '9,60 €'], ['100 Stück', '9,10 €'], ['200 Stück', '8,60 €']],
  },
  {
    t: 'T-Shirt Bio (Stanley/Stella Creator 2.0, 180 g)',
    d: 'Bio-Baumwolle, GOTS, weicher Griff. Für Brands und Firmen, die auf Qualität achten.',
    zeilen: [['1 Stück', '16,15 €'], ['10 Stück', '12,15 €'], ['50 Stück', '11,65 €'], ['100 Stück', '11,15 €'], ['200 Stück', '10,65 €']],
  },
  {
    t: 'T-Shirt Heavy Oversize (Build Your Brand Heavy Oversize Tee BY102, 240 g)',
    d: 'Schwerer Stoff, tiefe Schulter, Boxy-Schnitt. Der Streetwear-Blank für Brands und Merch.',
    zeilen: [['1 Stück', '17,95 €'], ['10 Stück', '13,95 €'], ['50 Stück', '13,45 €'], ['100 Stück', '12,95 €'], ['200 Stück', '12,45 €']],
  },
  {
    t: 'Poloshirt (Stedman Classic Polo, 170 g)',
    d: 'Für Standpersonal, Werkstatt, Gastro und Empfang.',
    zeilen: [['1 Stück', '17,22 €'], ['10 Stück', '13,22 €'], ['50 Stück', '12,72 €'], ['100 Stück', '12,22 €'], ['200 Stück', '11,72 €']],
  },
  {
    t: 'Sweatshirt (Stedman Classic Sweatshirt, 280 g)',
    d: 'Rundhals-Sweater für Firmen, Vereine und Teams, die keine Kapuze wollen.',
    zeilen: [['1 Stück', '20,09 €'], ['10 Stück', '16,09 €'], ['50 Stück', '15,59 €'], ['100 Stück', '15,09 €'], ['200 Stück', '14,59 €']],
  },
  {
    t: 'Hoodie (Stedman Classic Hoodie, 280 g)',
    d: 'Abschlussklassen, Teams, Merch. Auch als Sweatjacke möglich.',
    zeilen: [['1 Stück', '22,25 €'], ['10 Stück', '18,25 €'], ['50 Stück', '17,75 €'], ['100 Stück', '17,25 €'], ['200 Stück', '16,75 €']],
  },
  {
    t: 'Hemd (Stanley/Stella Styler, Bio-Baumwolle)',
    d: 'Für Empfang, Vertrieb und Messestand, wenn es gepflegter als ein Polo sein soll.',
    zeilen: [['1 Stück', '27,75 €'], ['10 Stück', '23,75 €'], ['50 Stück', '23,25 €'], ['100 Stück', '22,75 €'], ['200 Stück', '22,25 €']],
  },
  {
    t: 'Softshelljacke (Stedman Lux Softshell, 250 g)',
    d: 'Für Außendienst, Baustelle und Messe, mit Logo auf Brust oder Rücken.',
    zeilen: [['1 Stück', '38,89 €'], ['10 Stück', '34,89 €'], ['50 Stück', '34,39 €'], ['100 Stück', '33,89 €'], ['200 Stück', '33,39 €']],
  },
];

export const zusatz: { t: string; p: string; d: string; istBrutto?: boolean }[] = [
  { t: 'Zweite Druckseite', p: 'ab 3,50 €', d: 'Vorne und hinten bedruckt, zum Beispiel Logo vorne, großes Motiv hinten. 6,00 € bei 1 bis 10 Stück, 4,00 € ab 11 Stück, 3,50 € ab 50 Stück pro Teil.' },
  { t: 'Nackenprint statt Herstelleretikett', p: '3,00 €', d: 'Dein Logo mit Größenangabe direkt ins Textil gedruckt.' },
  { t: 'Namen und Rückennummern', p: 'ab 5,90 €', d: 'Jedes Teil einzeln, Liste mit Name, Nummer und Größe reicht.' },
  { t: 'Ärmeldruck oder kleines Zusatzmotiv', p: '3,00 €', d: 'Zum Beispiel Sponsor am Ärmel oder Schriftzug am Saum.' },
  { t: 'Einrichtung, Sieb, Datencheck', p: '0,00 €', d: 'Wir berechnen keine Einrichtungskosten und keine Druckvorbereitung.' },
  // Versandkosten wie an der Kasse (Kassen-Worker): Endpreis inkl. MwSt., ab 500 € Warenwert versandkostenfrei.
  // Aufträge auf Angebot (Rechnung): 6,95 € netto pro Paket, wie in allen Angeboten seit 07.10.2026.
  { t: 'Versand innerhalb Deutschlands', p: '4,90 €', d: 'Im Shop per DHL mit Sendungsverfolgung, versandkostenfrei ab 500 € Warenwert (brutto). Bei Aufträgen auf Angebot 6,95 € netto (8,27 € brutto) pro Paket. Abholung in Oberhausen ist kostenlos.', istBrutto: true },
];
