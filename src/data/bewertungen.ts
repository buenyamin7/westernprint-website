// Echte Google-Bewertungen des westernprint-Unternehmensprofils.
// Stand 28.09.2026, abgelesen im Google-Unternehmensprofil (Geschäftscode 10833066176156066406).
//
// WICHTIG: Hier gehören ausschließlich Rezensionen hinein, die tatsächlich
// öffentlich auf Google stehen. Nichts erfinden, nichts umformulieren.
// Bei gekürzten Zitaten `gekuerzt: true` setzen, dann wird ein Auslassungszeichen
// gesetzt und auf das Google-Profil verlinkt.

export const bewertungen = {
  /** Durchschnitt und Anzahl, wie sie im Google-Profil stehen. */
  schnitt: 5,
  anzahl: 17,
  quelle: 'Google',
  profilUrl: 'https://www.google.com/maps?cid=475747385609305411', // eindeutige Profil-ID (cid), vom Inhaber am 29.09.2026 geliefert
  stand: '2026-09-28',
};

export interface Rezension {
  name: string;
  rolle?: string;
  datum: string;
  text: string;
  gekuerzt?: boolean;
  /** schema.org-Typ des Verfassers im Review-Markup (/bewertungen). Standard: Person. Firmenprofile: Organization. */
  autorTyp?: 'Person' | 'Organization';
}

export const rezensionen: Rezension[] = [
  {
    name: 'Djamila El Nasser',
    rolle: 'Local Guide',
    datum: 'vor 7 Monaten',
    text: 'Schnelle und einfache Kommunikation, Qualität und Preis Leistung stimmen ebenfalls. Beeindruckt hat mich der nette Kundenservice und die schnelle Bearbeitung.',
  },
  {
    name: 'Irina Reichenborn',
    rolle: 'Shop-Betreiberin',
    datum: 'vor 2 Jahren',
    text: 'Endlich eine POD-Druckerei, die alle Anforderungen erfüllt! Nach einer herben Enttäuschung von meiner bisherigen (großen) POD Druckerei bin ich mit meinem Unternehmen zu Westernprint gewechselt und es war die beste Entscheidung.',
    gekuerzt: true,
  },
  {
    name: 'Rohrreinigung RAK',
    rolle: 'Arbeitskleidung mit Logo',
    autorTyp: 'Organization',
    datum: 'vor einem Jahr',
    text: 'Von Anfang an war die Kommunikation mit Herrn Dursun super. Ich habe ihm mitgeteilt, dass ich für mein Unternehmen nach passender Arbeitskleidung samt Beflockung suche, und war mit dem Ergebnis äußerst überrascht.',
    gekuerzt: true,
  },
  {
    name: 'Züleyha Ocak',
    rolle: 'Fleeceweste und Pullover mit eigenem Logo',
    datum: 'vor 2 Wochen',
    text: 'Ich bin wirklich sehr zufrieden! Ich habe eine Fleeceweste und einen Pullover mit meinem eigenen Logo bedrucken lassen.',
    gekuerzt: true,
  },
  {
    name: 'Vallerie Oswald',
    rolle: 'Einzelstück über WhatsApp',
    datum: 'vor 6 Tagen',
    text: 'Ich habe über den WhatsApp Kontakt eine Anfrage bei westernprint für ein einzelnes bedrucktes T-Shirt gestellt.',
    gekuerzt: true,
  },
  {
    name: 'Tuana Ergun',
    rolle: 'Personalisiertes Geschenk',
    datum: 'vor 7 Tagen',
    text: 'Ich war auf der Suche nach einer Textildruckerei für ein personalisiertes Geschenk und bin über TikTok auf ihn aufmerksam geworden.',
    gekuerzt: true,
  },
];
