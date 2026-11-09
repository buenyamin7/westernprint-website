# Designer V2: Motiv in echten Zentimetern

Stand 09.11.2026 (live seit 28.10.2026, Schalter `PUBLIC_DESIGNER_V2=1`). Grundlage: Codex-Bauprompt vom 28.10. und die Entscheidungen des Inhabers (siehe unten).

## Was der Kunde bekommt

- **Druckbereich je Kleidergröße:** Er ist gestrichelt auf dem Produktfoto, in cm, mit 1,5 cm Abstand zu Kragen, Kapuze, Bündchen, Knopfleiste, Reißverschluss und Tasche. Knopfleisten und Reißverschlüsse sind schraffiert.
- **Motiv bearbeiten:**
  - Verschieben per Ziehen, Pfeiltasten (0,1 cm, mit Umschalt 1 cm) oder Pfeil-Buttons (0,5 cm). Das Motiv kann den Bereich nicht verlassen.
  - Skalieren per Eckgriff, Regler oder Eingabe der Breite bzw. Höhe in cm (Komma oder Punkt), immer proportional.
  - Keine Drehung, keine Ebenen: ein Motiv je Seite.
- **Hilfen:**
  - Einrasten auf der Mitte und auf „Brust links“, abschaltbar.
  - Startpositionen „Mittig“ und „Brust links“.
  - Waagerecht mittig, Zurücksetzen, Rückgängig/Wiederholen, Lupe auf den Druckbereich.
- **Live-Anzeige:** Breite × Höhe, Abstand zur Kragennaht (bei Hoodies zum Kapuzenansatz bzw. zur Kapuzenspitze), Versatz zur Mitte, Preisstufe und dpi.
- **Kleidergröße wechseln:** Maße und Lage bleiben. Passt das Motiv nicht mehr, erscheint ein Konflikt mit dem Vorschlag „Auf B × H cm verkleinern“. Es wird nie still verkleinert.
- **Auflösung:** Unter 150 dpi kommt ein Hinweis, den der Kunde bestätigen muss. Gesperrt wird nie.
- **Dateien:** PNG und JPG bis 25 MB bzw. 40 Megapixel. Die Maße gelten für das sichtbare Motiv ohne transparente Ränder. Hat ein JPG oder PNG einen Hintergrund, gibt es einen Hinweis.
- **Ohne Motiv:** wie bisher „Motiv nachreichen“. Der Kunde wählt dann eine Preisstufe, die in den Druckbereich passt.
- **Rückseite ohne Rückenfoto (Stedman):** schematische Silhouette, klar beschriftet.
- **Handy:** Die Vorschau bleibt beim Scrollen oben sichtbar, Felder mit 16 px, Griffe und Buttons ab 44 px.

### Größe sichtbar machen (Stufe 2, 09.11.2026)

Anlass: Kundinnen (z. B. Familiensets) konnten nicht einschätzen, wie groß der Druck in echt wirkt. Siehe `~/Desktop/Claude/Output/designer-echte-groesse/BRIEFING.md`.

- **Größe unter der Bühne:** Die Leiste unter dem Foto sagt immer, auf welcher Kleidergröße die Vorschau zeigt („Vorschau auf Größe M“). Ohne gewählte Größe: „Noch keine Größe gewählt. Vorschau auf XL“ (mittlere Größe) mit Knopf „Größe wählen“.
- **Vergleichsumriss:** In derselben Leiste lässt sich ein DIN-A4-Blatt (21 × 29,7 cm) oder ein Handy (ca. 7 × 15 cm) im selben Maßstab auf das Textil legen, ausgerichtet an Motiv bzw. Druckfläche.
- **Vorschläge „Klein / Mittel / Groß / Maximal“** über den Feldern: typische Breiten für Erwachsene M (vorne: Klein 10 cm Brust links, Mittel 25, Groß 28; hinten: Klein 10 cm im Nacken 3 cm unter der Kragennaht, Mittel 28, Groß 32; Maximal = größte Breite an dieser Stelle). Sie wachsen und schrumpfen mit der halben Brustweite der gewählten Größe (Faktor halbe Brustweite / 52 cm, auf 0,5 cm gerundet), passen immer in den Druckbereich und zeigen Maße und Preisstufe. Danach bleiben die cm frei editierbar. Werte in `SUGGESTIONS` im Kern.
- **Größenvergleich:** Unter dem Druckschritt zeigt eine kleine Grafik die kleinste, die gewählte und die größte Größe (nur Größen, die es in der Farbe gibt) im selben Maßstab, Kragennaht auf einer Linie. Das Textil wächst, Motiv bzw. geplante Druckgröße bleibt gleich groß. Darunter je Größe, welchen Anteil der Brustbreite das Motiv einnimmt, oder „passt so nicht“.

Nicht gebaut (braucht erst eine Entscheidung): „Druck mitwachsen lassen“ für Familiensets (Stufe 3) und Korrekturabzug aus Shop-Bestellungen (Stufe 4).

## Preise

Unverändert. Die Preisstufe ergibt sich aus dem sichtbaren Motiv, hoch oder quer (freigegeben 28.10.):

| Stufe | bis (cm) |
|---|---|
| Brust (nur vorne) | 12 × 12 |
| A6 | 10,5 × 14,8 |
| A5 | 14,8 × 21 |
| A4 | 21 × 29,7 |
| A3+ | 33 × 48 |

**Kinder- und Babygrößen (28.10.):** gleiche Stufen und gleiche Preise wie bei Erwachsenen, die Maße schrumpfen mit dem Textil (auch der Ärmeldruck, z. B. Baby 6–12 Monate max. 4,5 × 4,5 cm statt 8 × 8): Faktor = halbe Brustweite / 52 cm (Erwachsene M), höchstens 1, auf 0,5 cm gerundet. Beispiel Baby Changer 6–12 Monate (Faktor 0,57): A6 6 × 8,5, Brust 7 × 7, A5 8,5 × 12, A4 12 × 17, A3+ 19 × 27,5 cm. Der Faktor steht je Größe als `tariffScale` in print-areas.json, Shop und Kasse rechnen damit.

Toleranz 0,5 mm, damit eine echte A4-Datei (2480 × 3508 px, bei 21 cm Breite 29,704 cm hoch) A4 bleibt. Die Aufschläge selbst stehen wie bisher in `PRINT_SIZES` (Shop) bzw. `catalog.js` (Kasse). V2 setzt nur `sizeFront`/`sizeBack` aus den cm. Die Kasse rechnet die Stufe nach und lehnt Abweichungen ab.

## Dateien

| Datei | Inhalt |
|---|---|
| `src/lib/designer-core/core.mjs` | Gemeinsamer Rechenkern (Shop + Kasse): cm in Hundertstel-cm, Preisstufen, Prüfung Druckbereich, Verschieben/Einpassen, dpi, Serverprüfung `verifyPlacement` |
| `src/scripts/designer-v2.ts` | Oberfläche im Browser (Zustand, Bühne, Felder, Warenkorb) |
| `src/components/shop/DesignerStage.astro`, `DesignerPanel.astro` | Markup und Stil |
| `src/data/designer/size-charts.json` | Hersteller-Maßtabellen (Stanley/Stella Produktdatenblatt, Stedman Garment Sizes), Abruf 28.10. |
| `src/data/designer/packshots.json` | Automatisch vermessene Produktfotos (`measure-packshots.py`) |
| `src/data/designer/packshot-overrides.json` | Von Hand gesetzte Kragennaht, Taschen, Knopfleisten, Reißverschlüsse |
| `src/data/designer/color-fix.json` | Ausgleich je Farbfoto auf das Referenzfoto (`register-colors.py`), wird in print-areas.json übernommen |
| `src/data/designer/approvals.json` | Freigegebene Produkte (nur diese sind bestellbar) |
| `src/data/designer/print-areas.json` | Ergebnis: Druckbereiche je Produkt/Größe/Seite (`build-print-areas.mjs`) |
| `src/data/designer/coverage.txt` | Abdeckungsbericht: was fehlt, was gesperrt ist |

Daten neu bauen: `python3 scripts/designer/measure-packshots.py && python3 scripts/designer/register-colors.py && node scripts/designer/build-print-areas.mjs`, danach `node scripts/designer/sync-to-checkout.mjs <Pfad zu westernprint-checkout>` (kopiert Kern + Druckbereiche in den Kassen-Worker; `--check` vergleicht nur). Kontrollbogen je Farbe: `python3 scripts/designer/color-check.py ZIELORDNER` (Rückgabe 1, wenn ein Farbfoto über dem Ziel liegt). Neue Farbfotos brauchen immer `register-colors.py`, sonst gilt für sie kein Ausgleich.

## Regeln für den Druckbereich (vom Inhaber freizugeben)

- **Breite:** halbe Brustweite minus je Seite max(3 cm, 12 % der halben Brustweite). Bei Tanktops zusätzlich durch die Armausschnitte begrenzt. Höchstens 40 cm (Presse).
- **Oben:** 1,5 cm unter der Kragennaht. Bei Hoodies vorne unter dem Kapuzenansatz, hinten unter der Kapuzenspitze (die Kapuze liegt auf dem Rücken).
- **Unten:** Rückenlänge minus Abstand Schulter bis Kragennaht minus Saum (T-Shirts 2,5 cm; Bündchen: Erwachsene 6, Kinder 4,5, Baby 3,5 cm) minus 1,5 cm. Bei Hoodies zusätzlich 1,5 cm über der Kängurutasche. Höchstens 50 cm.
- **Knopfleiste und Reißverschluss:** gesperrt, plus 1,5 cm Abstand.
- **Startplatzierung:** mittig, Oberkante 7 cm unter der Kragennaht (Hoodie 4 cm), 25 cm breit (vorne) bzw. 28 cm (hinten). Brust links 10 cm breit, 5 cm unter der Kragennaht. Kinder und Baby anteilig kleiner.

**Farbfotos (Stufe 1, 09.11.2026):** Die Kalibrierung (`pxPerCm`, `originPx`) ist am Referenzfoto je Ansicht gemessen (`views.*.image`). Die Fotos der anderen Farben sind teils anders gerahmt: Ohne Ausgleich zeigte die Vorschau bei 373 von 1.218 Farbfotos mehr als 2 % falschen Maßstab oder mehr als 1 cm falsche Kragennaht, im schlimmsten Fall 18 % und 6,8 cm (Roller Verdant Green). `register-colors.py` gleicht deshalb jedes Farbfoto auf das Referenzfoto ab, über die Mittellinie: Kragen bzw. Kapuze oben und Saum unten an der Mitte liegen danach genau übereinander, die Mitte am Kragen ebenso. Der Maßstab kommt damit aus der Länge wie die Kalibrierung selbst. Ergebnis je Foto `[s, dx, dy]` (Farbfoto × s + Versatz = Referenzfoto) in `views[ansicht].colorFix[foto]`; die schematische Rückseite nutzt den Ausgleich von vorne. Shop: `calForColor()` im Kern, für Bühne, Ziehen, Lupe, Größenvergleich und das Mockup im Warenkorb. Die cm (Druckbereich, Motiv, Preisstufe) ändern sich dadurch nicht, deshalb prüft die Kasse unverändert (`verifyPlacement` arbeitet nur in cm).

Bewusst nicht wie `register()` im Korrekturabzug (Abgleich der ganzen Silhouette): Rund 240 Farbfotos sind anders gerendert (Schultern, Kapuze, Ärmel anders gelegt, z. B. Drummer 2.0 Blue Ice). Dort zog der Silhouetten-Abgleich den Maßstab um bis zu 8 % weg und richtete am Ärmelbündchen statt am Saum aus. Der Kontrollbogen nennt diese Fotos als Hinweis („anders gerendert“); Kragennaht und Länge sitzen auch dort.

**Maßstab der Vorschau:** Die Produktfotos zeigen das Textil wie getragen (räumlich). Zur Seite hin wird der Stoff deshalb verkürzt abgebildet: Breite zu Länge im Foto ca. 0,6 statt 0,73 laut Maßtabelle. Der Maßstab kommt daher aus der Länge (Breitenmaßstab × k, k je Produkt aus Rundhals-Ansichten, sonst Median der Marke) und gilt einheitlich für Foto, Druckbereich und Motiv. In der Mitte, wo gedruckt wird, stimmen die cm. Für den Druck gelten ohnehin die cm aus der Bestellung, nicht das Foto.

## Bestellung

Die Warenkorbzeile behält alle bisherigen Felder (alte Bestellungen bleiben lesbar) und bekommt `v2`:

```json
{ "size": "6-12 M", "front": { "side": "front", "frame": "collar", "preset": "center", "upload": "https://res.cloudinary.com/c5unvw6r/…png",
  "widthCm": 14.2, "heightCm": 9.47, "centerXCm": 0, "topYCm": 4, "px": { "w": 1400, "h": 1000, "bx": 100, "by": 100, "bw": 1200, "bh": 800 }, "dpi": 215, "ack": [] }, "back": null }
```

**Die Kasse prüft:**
- Produkt freigegeben, Kleidergröße passt.
- Druckbereich und Höhe passend zur Breite und zu den Pixeln.
- Preisstufe stimmt.
- dpi-Hinweis bestätigt.
- Datei liegt im eigenen Cloudinary-Konto, und die Pixel passen zur Datei (Cloudinary `e_trim/fl_getinfo`). Die sichtbare Fläche darf nicht kleiner angegeben sein, als Cloudinary sie zuschneidet.

In „Positionen“ steht dann zum Beispiel: `Vorne A6 @ 14,2 x 9,5 cm, Oberkante 4,0 cm unter der Kragennaht, mittig, 215 dpi`. Mit `DESIGNER_V2_FIELD` (Name eines Airtable-Langtextfelds) speichert die Kasse zusätzlich alle geprüften Daten als JSON.

## Schalter

- **Shop-Build:** `PUBLIC_DESIGNER_V2=1` schaltet V2 für die 42 Oberteile ein. Ohne den Schalter bleibt alles wie bisher.
- **Nur lokal:** `PUBLIC_DESIGNER_V2_ALLOW_ESTIMATED=1` (Shop) bzw. `DESIGNER_V2_ALLOW_ESTIMATED=1` (Kasse) lassen nicht freigegebene Druckbereiche zum Testen zu.
- **Taschen, Mütze, Lätzchen, Hosen:** bleiben beim bisherigen Designer.

## Offen

- **Freigabe der Druckbereiche** durch den Inhaber (`approvals.json`), Baby/Kinder an 1–2 Mustern nachmessen.
- **Airtable-Feld** für die JSON-Druckdaten anlegen (optional).
- **Produktionsdatei mit 300 dpi aus den cm erzeugen:** heute macht das `westernprint-ops/druckvorbereitung.py`; V2 liefert dafür die cm.
- **Geräte und Screenreader:** auf echten Handys (iOS Safari, Android Chrome) und mit VoiceOver/NVDA prüfen.
- **POD-App-Designer** auf denselben Kern umstellen (nach dem Shop).
