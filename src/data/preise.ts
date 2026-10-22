// Preisbeispiele westernprint: netto zzgl. 19 % MwSt., ein Druck vorne (Logo oder Motiv auf der Brust), Textil inklusive.
// Einzige Quelle für /was-kostet-textildruck (Tabellen, generierte Antwortsätze, JSON-LD), /fuer/handwerksbetriebe,
// die Stadtseiten (src/data/staedte.ts), /textildruck-oberhausen, /textildruck-ruhrgebiet und /llms-full.txt.
// Bei Preisänderungen hier ändern und STAND anpassen. Hier stehen nur Nettopreise. Den Bruttopreis (netto x 1,19,
// auf Cent gerundet) rechnen die Seiten selbst aus. Ausnahme: Posten mit istBrutto (Versand) sind schon Endpreise.
// Die festen Sätze in src/data/zielgruppen.ts, den Branchen-Seiten und public/llms.txt dann mitprüfen.
//
// Rechenweg (Regel des Inhabers vom 14.10.2026, EK aus der POD-App-Datenbank, abgelesen am 22.10.2026, Größen bis XXL):
//   Stückpreis = Einkaufspreis des Textils + Aufschlag für Druck und Arbeit.
//   Aufschlag bei einem Druck vorne: 1 Stück +12,00 | 10 Stück +8,00 | 50 Stück +6,50 | 100 Stück +5,50 | 200 Stück +5,00
//   (Spalte "nur Brust" der Staffel). Großer Rückendruck bis 30 x 40 cm statt vorne: bis 25 Stück gleich, ab 50 Stück +1,00,
//   ab 100 Stück +1,50 (Spalte "nur Rücken"). Beides steht so im Angebot, die Website liegt also nie über dem Angebot.
//   Zweite Druckseite (vorne und hinten): +6,00 bei 1 bis 10 Stück, +4,00 ab 11, +4,50 ab 50, +5,00 ab 100 Stück. Nacken und Ärmel je +3,00.
//   Genau 10 Stück bekommen schon den Preis ab 11 Stück, deshalb gibt es keine eigene Zeile für 25 Stück.
//   EK (Standardfarben): Classic-T 2,10 | Creator 2.0 4,15 | BY102 5,95 | Classic Polo 5,22 | Classic Sweatshirt 8,09 |
//   Classic Hoodie 10,25 | Styler 15,75 | Lux Softshell 26,89. Größen ab 3XL und melierte Stanley/Stella-Farben (Heather)
//   haben einen höheren EK, der Aufpreis steht im Angebot.

export const STAND = '22.10.2026';

export const tabellen: { t: string; d: string; zeilen: [string, string][] }[] = [
  {
    t: 'T-Shirt Basic (Stedman Classic-T, 155 g)',
    d: 'Der günstige Klassiker für Vereine, Events und Give-aways.',
    zeilen: [['1 Stück', '14,10 €'], ['10 Stück', '10,10 €'], ['50 Stück', '8,60 €'], ['100 Stück', '7,60 €'], ['200 Stück', '7,10 €']],
  },
  {
    t: 'T-Shirt Bio (Stanley/Stella Creator 2.0, 180 g)',
    d: 'Bio-Baumwolle, GOTS, weicher Griff. Für Brands und Firmen, die auf Qualität achten.',
    zeilen: [['1 Stück', '16,15 €'], ['10 Stück', '12,15 €'], ['50 Stück', '10,65 €'], ['100 Stück', '9,65 €'], ['200 Stück', '9,15 €']],
  },
  {
    t: 'T-Shirt Heavy Oversize (Build Your Brand Heavy Oversize Tee BY102, 240 g)',
    d: 'Schwerer Stoff, tiefe Schulter, Boxy-Schnitt. Der Streetwear-Blank für Brands und Merch.',
    zeilen: [['1 Stück', '17,95 €'], ['10 Stück', '13,95 €'], ['50 Stück', '12,45 €'], ['100 Stück', '11,45 €'], ['200 Stück', '10,95 €']],
  },
  {
    t: 'Poloshirt (Stedman Classic Polo, 170 g)',
    d: 'Für Standpersonal, Werkstatt, Gastro und Empfang.',
    zeilen: [['1 Stück', '17,22 €'], ['10 Stück', '13,22 €'], ['50 Stück', '11,72 €'], ['100 Stück', '10,72 €'], ['200 Stück', '10,22 €']],
  },
  {
    t: 'Sweatshirt (Stedman Classic Sweatshirt, 280 g)',
    d: 'Rundhals-Sweater für Firmen, Vereine und Teams, die keine Kapuze wollen.',
    zeilen: [['1 Stück', '20,09 €'], ['10 Stück', '16,09 €'], ['50 Stück', '14,59 €'], ['100 Stück', '13,59 €'], ['200 Stück', '13,09 €']],
  },
  {
    t: 'Hoodie (Stedman Classic Hoodie, 280 g)',
    d: 'Abschlussklassen, Teams, Merch. Auch als Sweatjacke möglich.',
    zeilen: [['1 Stück', '22,25 €'], ['10 Stück', '18,25 €'], ['50 Stück', '16,75 €'], ['100 Stück', '15,75 €'], ['200 Stück', '15,25 €']],
  },
  // EK Build Your Brand Heavy Hoody BY011 13,95 (alle Farben gleich), Stanley/Stella Cruiser 2.0 16,75 und Changer 2.0 12,86 (Standardfarben).
  {
    t: 'Hoodie Heavy (Build Your Brand Heavy Hoody BY011, 300 g)',
    d: 'Schwerer Stoff, Regular Fit, bis 5XL. Für Teams und Brands, die mehr Gewicht wollen.',
    zeilen: [['1 Stück', '25,95 €'], ['10 Stück', '21,95 €'], ['50 Stück', '20,45 €'], ['100 Stück', '19,45 €'], ['200 Stück', '18,95 €']],
  },
  {
    t: 'Hoodie Bio (Stanley/Stella Cruiser 2.0, 350 g)',
    d: 'Bio-Baumwolle, GOTS, doppellagige Kapuze. Der Premium-Hoodie für Firmen und Abschlussklassen.',
    zeilen: [['1 Stück', '28,75 €'], ['10 Stück', '24,75 €'], ['50 Stück', '23,25 €'], ['100 Stück', '22,25 €'], ['200 Stück', '21,75 €']],
  },
  {
    t: 'Sweatshirt Bio (Stanley/Stella Changer 2.0, 350 g)',
    d: 'Bio-Baumwolle, GOTS, schwerer Rundhals-Sweater. Beliebt für Familien-Sets und Firmen.',
    zeilen: [['1 Stück', '24,86 €'], ['10 Stück', '20,86 €'], ['50 Stück', '19,36 €'], ['100 Stück', '18,36 €'], ['200 Stück', '17,86 €']],
  },
  {
    t: 'Hemd (Stanley/Stella Styler, Bio-Baumwolle)',
    d: 'Für Empfang, Vertrieb und Messestand, wenn es gepflegter als ein Polo sein soll.',
    zeilen: [['1 Stück', '27,75 €'], ['10 Stück', '23,75 €'], ['50 Stück', '22,25 €'], ['100 Stück', '21,25 €'], ['200 Stück', '20,75 €']],
  },
  {
    t: 'Softshelljacke (Stedman Lux Softshell, 250 g)',
    d: 'Für Außendienst, Baustelle und Messe, mit Logo auf der Brust.',
    zeilen: [['1 Stück', '38,89 €'], ['10 Stück', '34,89 €'], ['50 Stück', '33,39 €'], ['100 Stück', '32,39 €'], ['200 Stück', '31,89 €']],
  },
];

export const zusatz: { t: string; p: string; d: string; istBrutto?: boolean }[] = [
  { t: 'Zweite Druckseite', p: 'ab 4,00 €', d: 'Vorne und hinten bedruckt, zum Beispiel Logo vorne, großes Motiv hinten. 6,00 € bei 1 bis 10 Stück, 4,00 € ab 11 Stück, 4,50 € ab 50 Stück, 5,00 € ab 100 Stück pro Teil.' },
  { t: 'Großer Rückendruck statt Brustdruck', p: 'ab 1,00 €', d: 'Motiv bis 30 x 40 cm auf dem Rücken statt vorne: bis 25 Stück ohne Aufpreis, ab 50 Stück 1,00 €, ab 100 Stück 1,50 € pro Teil.' },
  { t: 'Nackenprint statt Herstelleretikett', p: '3,00 €', d: 'Dein Logo mit Größenangabe direkt ins Textil gedruckt.' },
  { t: 'Namen und Rückennummern', p: 'ab 5,90 €', d: 'Jedes Teil einzeln, Liste mit Name, Nummer und Größe reicht.' },
  { t: 'Ärmeldruck oder kleines Zusatzmotiv', p: '3,00 €', d: 'Zum Beispiel Sponsor am Ärmel oder Schriftzug am Saum.' },
  { t: 'Einrichtung, Sieb, Datencheck', p: '0,00 €', d: 'Wir berechnen keine Einrichtungskosten und keine Druckvorbereitung.' },
  // Versandkosten wie an der Kasse (Kassen-Worker): Endpreis inkl. MwSt., ab 500 € Warenwert versandkostenfrei.
  // Aufträge auf Angebot (Rechnung): 6,95 € netto pro Paket, wie in allen Angeboten seit 07.10.2026.
  { t: 'Versand innerhalb Deutschlands', p: '4,90 €', d: 'Im Shop per DHL mit Sendungsverfolgung, versandkostenfrei ab 500 € Warenwert (brutto). Bei Aufträgen auf Angebot 6,95 € netto (8,27 € brutto) pro Paket. Abholung in Oberhausen ist kostenlos.', istBrutto: true },
];
