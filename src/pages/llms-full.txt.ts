// /llms-full.txt: ausführliche Textfassung für KI-Systeme, Ergänzung zu public/llms.txt.
// Wird beim Build aus den Datendateien erzeugt, damit Preise, Fragen, Zielgruppen und Bewertungen
// hier immer denselben Stand haben wie auf den Seiten:
//   src/data/preise.ts (Preistabellen), src/data/site.ts (Kontakt, allgemeine FAQ),
//   src/data/zielgruppen.ts (/fuer/<slug>), src/data/bewertungen.ts (/bewertungen).
// Ausnahme: /fuer/abschlussklassen und /fuer/streetwear-brands haben eigene Seiten mit eigenen
// Inhalten und FAQ. Für sie steht hier nur ein Verweis, damit keine abweichenden Aussagen entstehen.
// Versand: 4,90 € laut Versandbedingungen (vom Inhaber bestätigt 28.09.2026).
import type { APIRoute } from 'astro';
import { site, faqs, oeffnungszeiten } from '../data/site';
import { STAND, tabellen, zusatz } from '../data/preise';
import { zielgruppen } from '../data/zielgruppen';
import { bewertungen, rezensionen } from '../data/bewertungen';
import { gitDates, formatDateDe } from '../lib/lastmod.mjs';

export const prerender = true;

const QUELLEN = [
  'src/pages/llms-full.txt.ts',
  'src/data/site.ts',
  'src/data/preise.ts',
  'src/data/zielgruppen.ts',
  'src/data/bewertungen.ts',
];

/** "21.09.2026" -> "2026-09-21" */
const isoAusDe = (d: string) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
};

// Letzte Aktualisierung wie Sitemap und Stand-Zeile: letzter Commit der Quelldateien.
// Ohne git der jüngste Datenstand (Bewertungen oder Preise), bewusst kein Builddatum.
function letzteAktualisierung(): string {
  const git = gitDates(QUELLEN)?.modified;
  const daten = [bewertungen.stand, isoAusDe(STAND)].filter((d): d is string => Boolean(d)).sort().at(-1);
  return formatDateDe(git ?? daten) ?? '';
}

// Indexierbare Seiten außerhalb von /fuer/<slug> (die stehen unter "Zielgruppen"). Ortsseiten zuerst.
// Neue Seite in der Sitemap? Hier eine Zeile ergänzen. /sample ist noindex und fehlt deshalb.
const SEITEN: [string, string][] = [
  ['/textildruck-oberhausen', 'Textildruck in Oberhausen: Adresse, Abholung und Ablauf vor Ort'],
  ['/textildruck-ruhrgebiet', 'Textildruck im Ruhrgebiet: Entfernung und Lieferung für Essen, Duisburg, Mülheim, Bottrop und weitere Städte'],
  ['/', 'Startseite'],
  ['/was-kostet-textildruck', 'Was kostet Textildruck: Preisbeispiele netto für 1, 10, 25, 50 und 100 Stück'],
  ['/druckverfahren', 'Druckverfahren: DTF, DTG und Sublimation im Vergleich, Ausstattung der Produktion'],
  ['/grossauflagen', 'Großauflagen: Textildruck ab 50 Stück'],
  ['/textilien', 'Textilien: Sortiment und Marken'],
  ['/print-on-demand', 'Print-on-Demand: Fulfillment für Shopify-Shops'],
  ['/b2b-partner', 'B2B-Partner: White-Label-Fulfillment für Shops ab 50 Bestellungen am Tag'],
  ['/shop', 'Shop: Textilien mit eigenem Motiv bedrucken, ab 1 Stück'],
  ['/bewertungen', 'Bewertungen: Google-Rezensionen von westernprint'],
  ['/pflege-bedruckter-textilien', 'Pflege bedruckter Textilien: Pflegeanleitung für DTF- und DTG-Drucke'],
  ['/versand', 'Versand und Zahlung: DHL, Abholung in Oberhausen, Zahlungsarten'],
  ['/ueber-uns', 'Über uns: westernprint und der Inhaber Bünyamin Dursun'],
  ['/kontakt', 'Kontakt: Angebot innerhalb von 24 Stunden an Werktagen'],
  ['/fuer', 'Für wen wir drucken: Übersicht aller Zielgruppen-Seiten'],
  ['/impressum', 'Impressum'],
  ['/datenschutz', 'Datenschutz'],
  ['/agb', 'AGB'],
  ['/widerruf', 'Widerruf'],
];

// Zielgruppen mit eigener Seite unter src/pages/fuer/ (wie der Filter in getStaticPaths von fuer/[slug].astro).
// Ihre sichtbaren Angebote und FAQ stehen dort, nicht in zielgruppen.ts. Darum hier nur ein Verweis statt Intro und FAQ.
const EIGENE_SEITE = new Set(['abschlussklassen', 'streetwear-brands']);

/** Reiner Text: HTML-Reste und doppelte Leerzeichen entfernen. */
const text = (t: string) => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
/** Tabellenzelle: senkrechte Striche maskieren. */
const zelle = (t: string) => text(t).replace(/\|/g, '\\|');
const url = (pfad: string) => `${site.url}${pfad}`;

// Gesperrte Aussagen: ungeklärt oder nicht belegt. Auf ihren Seiten bleiben sie stehen,
// hier werden sie nicht weiterverbreitet. Absätze verlieren nur den betroffenen Satz,
// FAQ-Einträge entfallen ganz (sonst bleiben Antworten mit losen Bezügen wie "damit" zurück).
const GESPERRT: RegExp[] = [
  /wasch\w*[^.]*\b60\s*(°|grad)|\b60\s*(°|grad)[^.]*wasch/i, // Waschtemperatur 60 Grad
  /an den (messe)?stand\b/i, // Lieferung an den Messestand
  /fahren wir[^.]*selbst|bringen die teile/i, // Selbst zur Messe fahren, Teile an den Stand bringen
  /miriam/i, // Fallbeispiel "Miriam"
];
const gesperrt = (t: string) => GESPERRT.some((re) => re.test(t));
// Sätze trennen, ohne nach Abkürzungen wie "z. B." oder "ca." zu schneiden.
const ABKUERZUNG = /\b(z\. B|u\. a|d\. h|ca|bzw|inkl|zzgl|ggf|evtl|Nr)\.$/;
function saetze(t: string): string[] {
  const teile = text(t).split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"])/);
  const out: string[] = [];
  for (const teil of teile) {
    if (out.length && ABKUERZUNG.test(out[out.length - 1])) out[out.length - 1] += ` ${teil}`;
    else out.push(teil);
  }
  return out;
}
const absatz = (t: string) => saetze(t).filter((satz) => !gesperrt(satz)).join(' ');
const erlaubt = <T extends { q: string; a: string }>(liste: T[]) => liste.filter((f) => !gesperrt(`${f.q} ${f.a}`));

function markdown(): string {
  const schnitt = bewertungen.schnitt.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const bewertungStand = formatDateDe(bewertungen.stand) ?? '';
  const bewertungSatz = `westernprint hat ${schnitt} von 5 Sternen bei ${bewertungen.anzahl} ${bewertungen.quelle}-Bewertungen (Stand ${bewertungStand}).`;
  const z: string[] = [];

  // Kopf
  z.push(
    `# ${site.legalName}: Textildruck und Print-on-Demand aus Oberhausen`,
    '',
    `> Ausführliche Textfassung von westernprint.de für KI-Systeme. Die Kurzfassung steht unter [llms.txt](${url('/llms.txt')}).`,
    '',
    `Letzte Aktualisierung: ${letzteAktualisierung()}`,
    '',
    '## Firma und Kontakt',
    '',
    // "2021" ist das Gründungsjahr von westernprint, nicht der GmbH: darum nicht direkt unter der Firmenzeile.
    '- westernprint gibt es seit 2021, gegründet von Bünyamin Dursun in Oberhausen',
    `- Firma: ${site.legalName}`,
    `- Adresse: ${site.address.street}, ${site.address.zip} ${site.address.city} (Marienviertel), ${site.address.country}`,
    '- Handelsregister: HRB 38060, Amtsgericht Duisburg',
    '- Geschäftsführer und Gründer: Bünyamin Dursun',
    `- Telefon: ${site.phone}`,
    `- WhatsApp: ${site.whatsapp}`,
    `- E-Mail: ${site.email}`,
    `- Website: ${site.url}`,
    `- Öffnungszeiten (Erreichbarkeit und Abholung): ${oeffnungszeiten.kurz}`,
    '',
  );

  // Produktion und Kennzahlen
  z.push(
    '## Produktion',
    '',
    'westernprint druckt in der eigenen Produktion in Oberhausen. Die Verfahren sind DTF und DTG, dazu Sublimation. ' +
      'Für DTG setzt westernprint die Epson SureColor F2100 und F2200 ein. Die maximale DTG-Druckfläche beträgt 40 x 50 cm. ' +
      'Dunkle Textilien werden für DTG auf einer Pretreat-Maschine vorbehandelt und auf der Heißpresse fixiert. ' +
      'DTF-Transfers kommen auf der Heißpresse auf das Textil. ' +
      'Produziert wird in Oberhausen, versendet wird deutschlandweit mit DHL und Sendungsnummer.',
    '',
    'Textilmarken: Stanley/Stella, Stedman, Build Your Brand und Urban Classics.',
    '',
    '## Kennzahlen',
    '',
    '- Über 80.000 belieferte Endkunden seit 2021. Das sind Endkunden der Partner-Shops (Print-on-Demand), die westernprint direkt beliefert hat.',
    '- Über 1 Mio. € Umsatz haben unsere Partner-Shops seit 2021 mit Produkten aus unserer Produktion gemacht.',
    `- ${bewertungSatz}`,
    '',
  );

  // Ablauf
  z.push(
    '## Ablauf und Lieferzeiten',
    '',
    '- Druck ab 1 Stück, Staffelpreise ab 10 Stück, Großauflagen ab 50 Stück.',
    '- Keine Einrichtungskosten. Mischgrößen ohne Aufpreis.',
    '- Angebot innerhalb von 24 Stunden an Werktagen.',
    '- Vor dem Druck kommt ein Korrekturabzug zur Freigabe.',
    '- Einzelstücke sind in 1 bis 3 Werktagen fertig. Serien brauchen 5 bis 7 Werktage nach Freigabe.',
    `- Versand innerhalb Deutschlands 4,90 € mit DHL und Sendungsnummer oder kostenlose Abholung in Oberhausen. Details: [Versand und Zahlung](${url('/versand')})`,
    '- Druckdaten bleiben für Nachbestellungen gespeichert.',
    '',
    '## Print-on-Demand für Shopify',
    '',
    'westernprint bindet Shopify-Shops über die eigene App "westernprint POD" an. Die Installation der App ist kostenlos. ' +
      `App: [westernprint POD im Shopify App Store](https://apps.shopify.com/pod-westerprint). Mehr dazu: [Print-on-Demand](${url('/print-on-demand')})`,
    '',
  );

  // Preise
  z.push(
    '## Preise',
    '',
    `Alle Preise netto zzgl. 19 % MwSt., Stand ${STAND}. Ein Druck (Brust oder Rücken), Textil inklusive. ` +
      `Quelle: [Was kostet Textildruck](${url('/was-kostet-textildruck')})`,
    '',
  );
  for (const t of tabellen) {
    z.push(`### ${text(t.t)}`, '', text(t.d), '', '| Menge | Preis pro Stück (netto zzgl. MwSt.) |', '| --- | --- |');
    for (const [menge, preis] of t.zeilen) z.push(`| ${zelle(menge)} | ${zelle(preis)} |`);
    z.push('');
  }
  // Versand separat unter der Tabelle, weil die Tabelle netto ist.
  const zusatzOhneVersand = zusatz.filter((x) => !/versand/i.test(x.t));
  z.push(`### Zusatzleistungen (netto zzgl. MwSt., Stand ${STAND})`, '', '| Leistung | Preis | Hinweis |', '| --- | --- | --- |');
  for (const x of zusatzOhneVersand) z.push(`| ${zelle(x.t)} | ${zelle(x.p)} | ${zelle(x.d)} |`);
  z.push('', `Versand innerhalb Deutschlands: ${(zusatz.find((x) => /versand/i.test(x.t)) ?? { p: '4,90 €' }).p} mit DHL und Sendungsnummer. Die Abholung in Oberhausen ist kostenlos.`, '');

  // Pflege
  z.push(
    '## Pflege bedruckter Textilien',
    '',
    `30 Grad waschen, auf links gedreht, kein Weichspüler, nicht in den Trockner. Ausführlich: [Pflege bedruckter Textilien](${url('/pflege-bedruckter-textilien')})`,
    '',
  );

  // Allgemeine FAQ
  z.push('## Häufige Fragen', '');
  for (const f of erlaubt(faqs)) z.push(`### ${text(f.q)}`, '', text(f.a), '');

  // Seiten: jede indexierbare Seite mit einer Zeile Zweck, die Ortsseiten zuerst.
  z.push('## Seiten', '');
  for (const [pfad, zweck] of SEITEN) z.push(`- [${zweck.split(':')[0]}](${url(pfad)})${zweck.includes(':') ? `:${zweck.slice(zweck.indexOf(':') + 1)}` : ''}`);
  z.push('');

  // Zielgruppen
  z.push('## Zielgruppen', '', `Jede Zielgruppe hat eine eigene Seite. Übersicht: [Für wen wir drucken](${url('/fuer')})`, '');
  for (const g of zielgruppen) {
    if (EIGENE_SEITE.has(g.slug)) {
      z.push(`### ${text(g.name)}`, '', `Alle Angaben und häufigen Fragen stehen auf der eigenen Seite: ${url(`/fuer/${g.slug}`)}`, '');
      continue;
    }
    z.push(`### ${text(g.name)}`, '', `URL: ${url(`/fuer/${g.slug}`)}`, '', absatz(g.intro), '');
    for (const f of erlaubt(g.faqs)) z.push(`#### ${text(f.q)}`, '', text(f.a), '');
  }

  // Bewertungen
  z.push(
    '## Bewertungen',
    '',
    `${bewertungSatz} Alle Rezensionen stehen öffentlich im [Google-Unternehmensprofil](${bewertungen.profilUrl}). ` +
      `Eine Auswahl steht unter [westernprint.de/bewertungen](${url('/bewertungen')}). Gekürzte Zitate sind mit […] gekennzeichnet.`,
    '',
  );
  for (const r of rezensionen) {
    z.push(`### ${text(r.name)}${r.rolle ? ` (${text(r.rolle)})` : ''}`, '', `> ${text(r.text)}${r.gekuerzt ? ' […]' : ''}`, '');
  }

  return z.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export const GET: APIRoute = () =>
  new Response(markdown(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
