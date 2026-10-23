// Vergleich westernprint mit Printful, Printify und Spreadconnect auf den POD-Nischenseiten.
// Vorgabe des Inhabers (23.10.2026): nur Punkte, bei denen westernprint besser dasteht.
// Jede Angabe zu einem Wettbewerber stammt von dessen eigener Hilfe- oder Preisseite, abgerufen am 23.10.2026
// (vergleichende Werbung, § 6 UWG: nachprüfbar, sachlich, nicht irreführend). Quellen unten, bei Änderungen der
// Anbieter Zeile anpassen oder entfernen. Ist die Liste leer, erscheint der ganze Abschnitt nicht.
//
// Bewusst NICHT im Vergleich, weil wir dort nicht klar besser sind (Recherche 23.10.2026):
// Versandkosten für ein einzelnes Shirt (alle drei günstiger), Lieferzeit (Printify mit deutschem Provider und
// Spreadconnect gleich schnell), Produktionszeit gegenüber Spreadconnect (95 % in 48 h), Produktion in Deutschland
// (Printify und Spreadconnect können auch in DE fertigen), Monatsgebühr (bei allen Grundnutzung kostenlos),
// Preis Nackendruck (Printful 0,99 €), Etsy (Printful und Printify haben es schon), Absenderadresse gegenüber Printify.

export const vergleichStand = '23.10.2026, laut den Hilfe- und Preisseiten der Anbieter';

export const vergleichZeilen: { k: string; wp: string; printful: string; printify: string; spreadconnect: string }[] = [
  {
    k: 'Bezahlung',
    wp: 'Eine Rechnung pro Woche, SEPA-Lastschrift, 14 Tage Zahlungsziel, kein Guthaben',
    printful: 'Pro Auftrag über das Printful-Wallet, Aufladung per Kreditkarte oder PayPal',
    printify: 'Pro Auftrag aus dem Printify-Guthaben (Aufladung in USD oder AUD), sonst Karte oder PayPal',
    spreadconnect: 'Pro Auftrag per Kreditkarte oder PayPal',
  },
  {
    k: 'Eigene Verpackung und Beilagen',
    wp: 'Kostenlos: Du lieferst Versandtaschen, Karten oder Sticker an, wir verpacken damit',
    printful: 'Beilagen 0,45 € pro Stück plus Lagergebühr ab 22 € im Monat',
    printify: 'Keine eigenen Beilagen, nur eine von Printify gedruckte Karte',
    spreadconnect: 'Eigenes Branding auf Verpackung und Beilagen derzeit nicht möglich',
  },
  {
    k: 'Kontakt',
    wp: 'Fester Ansprechpartner per WhatsApp, Telefon und E-Mail',
    printful: 'Chat und Kontaktformular, laut Printful kein Telefon-Support',
    printify: 'Chat, zuerst mit einem Bot, und Kontaktformular',
    spreadconnect: 'In der App, per E-Mail und Kontaktformular',
  },
];

export const vergleichQuellen: { name: string; url: string }[] = [
  { name: 'Printful Wallet', url: 'https://help.printful.com/hc/en-us/articles/50264607936785' },
  { name: 'Printful Beilagen', url: 'https://help.printful.com/hc/en-us/articles/50265422104337' },
  { name: 'Printful Lagergebühr', url: 'https://help.printful.com/hc/en-us/articles/50265429550737' },
  { name: 'Printful Support', url: 'https://help.printful.com/hc/en-us/articles/50260066754449' },
  { name: 'Printify Zahlung', url: 'https://help.printify.com/hc/en-us/articles/4483626302609' },
  { name: 'Printify Guthaben', url: 'https://help.printify.com/hc/en-us/articles/4483601124113' },
  { name: 'Printify Beilagen', url: 'https://help.printify.com/hc/en-us/articles/4483630325009' },
  { name: 'Printify Support', url: 'https://help.printify.com/hc/en-us/articles/5391552236305' },
  { name: 'Spreadconnect Zahlung', url: 'https://faq.spreadconnect.app/hc/en-gb/articles/360020906320' },
  { name: 'Spreadconnect Verpackung', url: 'https://faq.spreadconnect.app/hc/en-gb/articles/360020902780' },
  { name: 'Spreadconnect Kontakt', url: 'https://faq.spreadconnect.app/hc/en-gb/articles/360020925719' },
];
