# Formularabnahme und Go/No-Go – dein-snackautomat.de

Stand: 14.11.2026. **Status: VORBEREITET, NICHT BESTANDEN / NO-GO FÜR ABSCHLIESSENDE FACHLICHE ABNAHME.** Dieser Status ist kein Hinweis auf einen nachgewiesenen Formularfehler, sondern auf fehlenden Zustellnachweis.

## Bekannte technische Grundlage
- Öffentliche Kontaktseite: https://dein-snackautomat.de/kontakt.html
- Formulardienst: Web3Forms, POST an `https://api.web3forms.com/submit`.
- Der Zugangsschlüssel ist in der HTML-Konfiguration vorhanden; hier aus Sicherheitsgründen nicht noch einmal ausgeschrieben.
- Vorgesehene Kontakt- und Empfängeradresse: **info@dein-snackautomat.de**.
- Pflichtfelder im aktuellen Code: Unternehmen, Name, E-Mail, Thema, Nachricht und Bestätigung der gewerblichen Anfrage. Telefon ist optional.
- JavaScript sendet per `fetch` und zeigt einen Erfolgshinweis bei `HTTP 2xx` und `result.success === true`; sonst eine Fehlermeldung. Ein erfolgreicher Web3Forms-API-Aufruf ist **kein** Nachweis, dass die E-Mail im vorgesehenen Postfach angekommen ist.
- Empfängerzuordnung kann nur im Web3Forms-Konto oder durch einen kontrollierten Posteingangsabgleich geprüft werden.

## Formular-Testfall F-01: tatsächliche Mailzustellung

1. Im Web3Forms-Konto die Empfängeradresse des **bereits auf der Kontaktseite verwendeten** Zugangsschlüssels prüfen. Screenshot oder Vermerk der angezeigten Empfängeradresse dokumentieren. Keine Schlüsseländerung ohne tatsächlichen Grund.
2. Öffentliche Kontaktseite im privaten Browserfenster öffnen.
3. Einmalige, unkritische Testdaten benutzen:
   - Unternehmen: `Website-QA / keine Kundenanfrage`
   - Name: `Formular-Test`
   - E-Mail: eine vom Testenden kontrollierte, gültige Absenderadresse
   - Thema: `Sonstige Anfrage`
   - Nachricht: `ABNAHMETEST DS-20261114-F01 – bitte nicht bearbeiten; Bestätigung der Zustellung an info@dein-snackautomat.de.`
   - Gewerblichkeitsbestätigung nur ankreuzen, wenn die Testperson tatsächlich für das Unternehmen handelt.
4. Genau einmal absenden. Im Browser prüfen: kein Konsolenfehler, Ladezustand endet, Erfolgshinweis erscheint nur nach erfolgreicher API-Antwort; HTTP-Status und die API-Erfolgsmeldung notieren, **ohne** Schlüssel oder persönliche Daten in den Bericht zu kopieren.
5. Den tatsächlichen Posteingang von **info@dein-snackautomat.de** einschließlich Spam/Junk prüfen; im empfangenen Nachrichtentext die eindeutige Testkennung suchen. Uhrzeit, Empfangsadresse und vollständige Felder (Unternehmen, Name, Thema, Nachricht) gegen die Sendung abgleichen.
6. Mit einem zweiten Test die Übergabe der Parameter prüfen: `kontakt.html?thema=Full-Service&quelle=versorgung`; kontrollieren, ob Thema und Anfrage-Herkunft korrekt gesetzt sind. Bei Fehlern keine weitere unkontrollierte Testmail versenden.
7. Die Fehlerbehandlung prüfen, ohne echte Anfragen zu beschädigen: im Browser lokal den Netzwerkzugriff auf `api.web3forms.com` blockieren und absenden. Erwartet: klare Fehlermeldung und wieder bedienbarer Button. Niemals am produktiven Zugangsschlüssel manipulieren.

## Nachweismatrix
| Prüffeld | Soll | Ist / Nachweis | Ergebnis |
| --- | --- | --- | --- |
| Web3Forms-Empfänger | Der verwendete Schlüssel ist `info@dein-snackautomat.de` zugeordnet | Kontoansicht fehlt | OFFEN |
| Pflichtfeld-Validierung | Leere oder ungültige Angaben verhindern Absenden | Browserdurchlauf fehlt | OFFEN |
| Technischer API-Versand | `2xx` und `success: true` | Kein kontrollierter Test gesendet | OFFEN |
| E-Mail-Zustellung | Testkennung `DS-20261114-F01` im richtigen Posteingang sichtbar | Mailbox-Nachweis fehlt | OFFEN |
| Berater-/Quellenübergabe | Thema, Quelle und Nachricht korrekt | End-to-End-Test fehlt | OFFEN |
| Fehlerfall | Verständlicher Hinweis, erneuter Versuch möglich | Browserdurchlauf fehlt | OFFEN |

## Verbindliche Freigaberegel
**GO für den Formularteil nur**, wenn sowohl die Web3Forms-Zuordnung **als auch** der tatsächliche Eingang eines eindeutigen Testfalls bei `info@dein-snackautomat.de` bestätigt sind und Pflichtfelder, Anfrageübergabe sowie Fehlerfall bestanden haben.

**NO-GO / ungeprüft**, wenn eine dieser Bedingungen aussteht. Kein stillschweigendes Hochstufen von „API akzeptiert“ auf „Mail zugestellt“.

## Gesamtabnahme der Website
Die Formularabnahme ist nur einer von fünf Pflichtpunkten:
1. Formular einschließlich tatsächlicher Mailzustellung: **OFFEN**.
2. Kioskplaner einschließlich Maße, Kollisionen und Anfrageexport in einem Browser: **OFFEN**.
3. Standortanalyse mit Live-Adresse und manuellem Fallback: **OFFEN**.
4. Mobile und Desktop: Sicht- und Bedienungsprüfung: **OFFEN**.
5. Sitemap, zentrale SEO-Metadaten und öffentliche Erreichbarkeit: automatisierte Teilprüfungen bestanden; **vollständiger SEO-Browsercheck OFFEN**.

Der aktuelle technische GitHub-Pages- und Live-HTTP-Erfolg bleibt unabhängig davon bestehen. IONOS/DNS werden hierfür nicht verändert.
