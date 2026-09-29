// Preisbeispiele westernprint: netto zzgl. 19 % MwSt., ein Druck (Brust ODER Rücken), Textil inklusive.
// Einzige Quelle für /was-kostet-textildruck (Tabellen, generierte Antwortsätze, JSON-LD)
// und /llms-full.txt. Bei Preisänderungen hier ändern und STAND anpassen.
// Hier stehen nur Nettopreise. Den Bruttopreis (netto x 1,19, auf Cent gerundet) rechnet die Seite selbst aus.
// Ausnahme: Posten mit istBrutto (Versand) sind schon Endpreise inkl. MwSt. und werden nicht umgerechnet.
// Die statischen FAQ-Antworten auf /was-kostet-textildruck und public/llms.txt dann mitprüfen.

export const STAND = '21.09.2026';

export const tabellen: { t: string; d: string; zeilen: [string, string][] }[] = [
  {
    t: 'T-Shirt Basic (Stedman Classic-T, 155 g)',
    d: 'Der günstige Klassiker für Vereine, Events und Give-aways.',
    zeilen: [['1 Stück', '17,90 €'], ['10 Stück', '12,90 €'], ['25 Stück', '10,90 €'], ['50 Stück', '9,40 €'], ['100 Stück', '8,40 €']],
  },
  {
    t: 'T-Shirt Bio (Stanley/Stella Creator 2.0, 180 g)',
    d: 'Bio-Baumwolle, GOTS, weicher Griff. Für Brands und Firmen, die auf Qualität achten.',
    zeilen: [['1 Stück', '19,90 €'], ['10 Stück', '14,90 €'], ['25 Stück', '12,90 €'], ['50 Stück', '11,40 €'], ['100 Stück', '10,40 €']],
  },
  {
    t: 'Poloshirt (Stedman Classic Polo, 170 g)',
    d: 'Für Standpersonal, Werkstatt, Gastro und Empfang.',
    zeilen: [['1 Stück', '22,90 €'], ['10 Stück', '17,90 €'], ['25 Stück', '15,90 €'], ['50 Stück', '14,50 €'], ['100 Stück', '13,40 €']],
  },
  {
    t: 'Hoodie (Stedman Classic Hoodie, 280 g)',
    d: 'Abschlussklassen, Teams, Merch. Auch als Sweatjacke möglich.',
    zeilen: [['1 Stück', '29,90 €'], ['10 Stück', '24,90 €'], ['25 Stück', '22,90 €'], ['50 Stück', '21,40 €'], ['100 Stück', '19,90 €']],
  },
];

export const zusatz: { t: string; p: string; d: string; istBrutto?: boolean }[] = [
  { t: 'Zweite Druckseite', p: 'ab 3,50 €', d: 'Vorne und hinten bedruckt, zum Beispiel Logo vorne, großes Motiv hinten.' },
  { t: 'Nackenprint statt Herstelleretikett', p: '3,00 €', d: 'Dein Logo mit Größenangabe direkt ins Textil gedruckt.' },
  { t: 'Namen und Rückennummern', p: 'ab 5,90 €', d: 'Jedes Teil einzeln, Liste mit Name, Nummer und Größe reicht.' },
  { t: 'Ärmeldruck oder kleines Zusatzmotiv', p: 'ab 2,52 €', d: 'Zum Beispiel Sponsor am Ärmel oder Schriftzug am Saum.' },
  { t: 'Einrichtung, Sieb, Datencheck', p: '0,00 €', d: 'Wir berechnen keine Einrichtungskosten und keine Druckvorbereitung.' },
  // Versandkosten wie an der Kasse (Kassen-Worker): Endpreis inkl. MwSt., ab 500 € Warenwert versandkostenfrei.
  { t: 'Versand innerhalb Deutschlands', p: '4,90 €', d: 'DHL mit Sendungsverfolgung, versandkostenfrei ab 500 € Warenwert (brutto). Abholung in Oberhausen ist kostenlos.', istBrutto: true },
];
