# Sicherheits-, Datenschutz- und Abmahnrisiko-Audit: dein-snackautomat.de

**Prüfdatum:** 16.11.2026  
**Gegenstand:** Öffentliches GitHub-Repository `StevenHeyn/dein-snackautomat.de` (39 HTML-Seiten und damit verbundene CSS-, JS-, Dokument-/Bilddateien), GitHub Pages Domain, Kontaktformular, Stripe-Funktionen, Academy/Supabase, regionales SEO und Standortanalyse.  
**Methode:** Quellcode-/Konfigurationsprüfung, SQL-Metadaten der Academy-RLS, automatisierter HTTP-Header-Test an Startseite und Kontakt, rechtliche Erstprüfung anhand amtlicher Quellen. Kein externer Penetrationstest, kein DDoS-Test, keine Umgehung von Zugangskontrollen, kein Checkout mit echten Zahlungen.  
**Wertung:** Technisches Risiko (bewertet nach Eintrittswahrscheinlichkeit und Wirkung) ist nicht gleich juristische Rechtswidrigkeit. Keine anwaltliche Freigabe und keine absolute Ausfallsicherheit.

## A. Wichtigste Befunde

| ID | Risiko | Schwere | Nachweis / Status | Empfohlene Maßnahme |
|---|---|---|---|---|
| H-01 | **GitHub Pages darf laut GitHub nicht als kostenloser Host für primär kommerzielle E-Commerce-Websites eingesetzt werden** | **Kritisch, Betrieb** | Produkt-/B2B-Shop auf GitHub Pages, CNAME `dein-snackautomat.de`. GitHub-Nutzungsbedingungen siehe Quellen | Gewerblichen Host (vorhandenes IONOS oder gleichwertig) als Primärhost verwenden. GitHub als Quellcode/CI behalten. DNS/SSL vor Umschaltung prüfen, Backup/Rollback festlegen. Kein ungeprüfter DNS-Wechsel. |
| H-02 | **Kein DDoS-/Bot-Schutz auf Anwendungsebene nachweisbar** | Hoch | Statischer Host, externe Web3Forms-/Geodaten-APIs, keine eigene WAF/Rate-Limits konfiguriert | Hosting mit CDN/WAF, Request-Limits, Bot-Schutz, Caching und Monitoring. API-/Formular-Ratenbegrenzung server-/providerseitig, nicht nur im Browser |
| H-03 | **Sicherheitsheader fehlen** | Mittel bis hoch | Github-Action `security-header-audit.yml`: HTTP 200, Startseite und Kontakt ohne CSP, HSTS, X-Content-Type-Options und Referrer-Policy | Nach Hosting-Freigabe Header auf Webserver/CDN setzen; CSP erst in Report-only-Modus testen und auf Inline-Skripte, Supabase, Stripe und Karten abstimmen. Keine blinde CSP, die Shop/Login zerstört |
| H-04 | **Serverless-Webhook/Checkout mit begrenzbarer Last** | Mittel | Webhook las bisher Stream ohne Anwendungs-Größenlimit, Checkout akzeptierte beliebig lange Artikelkennungen | **Behoben im GitHub-Code:** Webhook max. 256 KiB, Checkout max. 32 KiB (deklarierter Content-Length) und Artikel-ID max. 180 Zeichen. Zusätzlicher serverseitiger Proxy-Body-Limit und IP-Rate-Limit nötig. Keine bestätigte aktive Stripe-Live-API |
| H-05 | **Stripe-Return-URL täuschte sichere Bestellung an** | Hoch, Recht/Prozess | `checkout-erfolg.html` zeigte „Vielen Dank für deine Bestellung!“, ohne serverseitigen Beleg eines bezahlten Auftrags. Webhook protokolliert Ereignisse nur | **Behoben:** Statusseite behauptet keinen Zahlungserfolg und verweist auf verifizierbare Bestätigung. Vor Aktivierung echter Zahlungen: persistent gespeicherte Bestellung, Webhook-Idempotenz, Zustellung, Statusabgleich, Rechnungs-/Versandprozess |
| H-06 | **Web3Forms-Empfänger, Spam-Limits und Posteingang ungeprüft** | Hoch, Verfügbarkeit von Leads | Formular mit öffentlich nutzbarem Access Key und Hidden-Botcheck. Web3Forms-Schlüssel ist kein geheimer Server-Token. Provider kann blockieren oder an falsches Postfach routen | Im Web3Forms-Konto Zielpostfach `info@dein-snackautomat.de`, zulässige Domains, Bot-Schutz und Limits bestätigen. Eindeutige kontrollierte Testmail + bestätigter Eingang. **Behoben im Frontend:** Timeout nach 15 Sekunden, differenzierter Hinweis „vom Anbieter akzeptiert ≠ Postfach empfangen“ |
| H-07 | **Öffentliche Academy nutzt Supabase-Projekt mit weiteren Portal-Tabellen** | Mittel, Mandantentrennung | `academy-config.js` publiziert erlaubten `sb_publishable_`-Key; dieselbe Datenbank enthält zahlreiche `vp_*`-Tabellen. Academy-`academy_entitlements` RLS live: **aktiviert**, Lesepolicy nur für eigenes Konto | Vollständige RLS-/RPC-/Storage-Prüfung, MFA für Admins, Provider-Ratelimits, getrennte Projekte für voneinander unabhängige Apps erwägen. Publishable Key ist kein Passwort; Secret/Service-Role nie im Frontend |
| H-08 | **Supply-Chain/CDN-Risiko** | Mittel | `academy.js` importiert Supabase über externes CDN mit Major-Version `@2`, ohne feste Dateiversion/SRI | Nach Funktionsabgleich Paketversion fixieren bzw. geprüfte Version selbst bundeln, Dependency-Updates und Dependabot aktivieren |
| H-09 | **Datenquellen Standortanalyse extern und teils unzuverlässig** | Mittel, Verfügbarkeit/Datenschutz | Photon, Overpass und externer ArcGIS-Spiegel; HTTP-Ausfälle konnten im Livebetrieb auftreten | Eigener Cache/API-Gateway mit Rate-Limit + Quellennachweis, ansonsten manueller Fallback. Keine gekauften Kaufkraftdaten ohne Verwendungsrecht. Datenschutzhinweise für tatsächliche Instanzen/Empfänger prüfen |
| H-10 | **Veröffentlichungs-Workflows** | Niedrig bis mittel | Qualitäts- und Live-Prüfungen benötigten keinen Schreibzugriff | **Behoben:** `permissions: contents: read` in beiden Prüf-Workflows. Bilder-Umwandlungsworkflow braucht `contents: write` für Commit, muss auf Vertrauen der Maintainer und Abhängigkeiten geprüft werden |
| H-11 | **Öffentliches Repository und öffentliche Waren-/Service-Daten** | Mittel, Geschäftsgeheimnisse | `academy-schema.sql`, `api/checkout.js`, Herstellerdaten und Teilekataloge sind im öffentlichen Repo einsehbar; Teilepreise/Preisformeln sind nicht vertraulich | Einkaufspreise, Verträge und interne Kalkulationen nur in privater Datenbank/Repo pflegen. Bereits veröffentlichte Geheimnisse wären zu rotieren. Öffentliche Browser-Keys sind nur eingeschränkt unbedenklich |

## B. Rechtliche Risikoanalyse

| ID | Thema | Befund / Risiko | Handlung |
|---|---|---|---|
| R-01 | **Impressum (§ 5 DDG)** | `impressum.html` enthält H & K Projekt UG (haftungsbeschränkt), postalische Anschrift, Geschäftsführung, Telefon, `info@dein-snackautomat.de`, Registergericht/-nummer und USt-ID. **Formale Vollständigkeit plausibel**, aber Richtigkeit von HRB, Geschäftsführer und USt-ID nicht beim Register/BZSt bestätigt | Bei Handelsregister/BZSt abgleichen und Änderungen dokumentieren; auf allen Seiten ohne Umwege erreichbar halten |
| R-02 | **Datenschutz/DSGVO** | `datenschutz.html` beschreibt GitHub, Web3Forms, Supabase, Karten-/Zensusdienste; teils unbestätigte Aussagen zu Web3Forms-Speicherfristen, Standardvertragsklauseln und konkreten Empfängern. **Widersprüchlicher Zukunftshinweis zu Karten jetzt korrigiert** | AV-Verträge/DPA, Unterauftragnehmer, Speicherfristen, Drittstaatentransfers, Löschverfahren und Rechtsgrundlagen tatsächlich belegen, Datenschutzhinweise anwaltlich prüfen |
| R-03 | **Cookies / TDDDG § 25** | Warenkorb in `localStorage`, Academy-Login speichert Session. Keine erkennbaren Marketing-Tracker im statisch geprüften Hauptcode; Drittanbieter-Datenabrufe sind gesondert zu beurteilen | Funktionale Erforderlichkeit nachweisen, vor nicht notwendigen Trackern/Cookies Einwilligung einholen. Keine pauschale Behauptung „Cookiebanner immer nötig/unnötig“ |
| R-04 | **Copyright, Herstellerfotos, Logos, PDF-Kataloge** | Im öffentlichen Repository **39 Hersteller-/technische PDFs (rund 97 MB) und 92 Bilddateien** inkl. Necta/SandenVendo-Produktfotos und 10 Referenz-HEICs/JPEGs. Aus dem Besitz einer Datei folgt **keine** Lizenz zur öffentlichen Weiterveröffentlichung | Rechteverzeichnis pro Datei: Urheber, Herkunft, Nutzungsrecht, Bearbeitung, kommerzielle Webseitenveröffentlichung, Attribution, Laufzeit, Markenfreigaben. Ohne Lizenz schriftliche Freigabe oder eigenes Foto/Link zum offiziellen PDF statt Kopie |
| R-05 | **Marken und Kundenreferenzen** | Herstellernamen zur sachlichen Produkterklärung häufig möglich; fremde Logos/Referenznamen benötigen berechtigte Verwendung, Persönlichkeits- und Hausrechte ggf. zusätzlich | Keine erfundenen Kundenlogos, Bewertungen oder Partnerstatus; Einwilligung/Freigabe für Namensnennung und konkrete Objektbilder dokumentieren |
| R-06 | **B2B-Preise und Verbraucheransprache** | Site erklärt ausschließlich B2B, aber öffentliche Inhalte, Nettopreise, Versand-/Montagekosten und potenzieller Checkout müssen tatsächlich zum Verkaufsmodell passen. Formular-Checkbox schützt alleine nicht vor Verbraucherkäufen | Verbindliche B2B-Prüfung im Checkout/Bestellprozess, klare Netto-/USt-/Versandangaben, AGB/Vertragsbedingungen auf Geschäftsmodell abstimmen. Bei Verbrauchern gelten PAngV und Fernabsatzrecht anders |
| R-07 | **GPSR / Produkt- und Elektrogerätesicherheit** | Automatische Geräteinformationen sind nicht für jede Modellvariante nachgewiesen; Herstellerangaben, EU-Verantwortliche, Identifikatoren und erforderliche Sicherheitsinformationen können je nach Produkt-/Zielgruppe erforderlich sein | Produktdaten-/CE-/Hersteller-/Warnhinweiskette je Verkaufskategorie prüfen, besonders Importgeräte und gebrauchte Maschinen. GPSR gilt im relevanten Anwendungsbereich, zusätzlich können harmonisierte Elektrogerätepflichten eingreifen |
| R-08 | **AGB, Vertragsannahme und Stripe** | Kein `agb.html` gefunden; eine AGB-Datei ist nicht für jedes unverbindliche B2B-Anfrageformular zwingend. Für echtes Shop-Checkout entstehen jedoch detaillierte Informations-, Zahlungs- und Vertragspflichten | Vor Aktivierung von Stripe nach tatsächlichem B2B-/B2C-Modell geprüfte Verkaufsbedingungen, Bestellprozess, Rechnungs-/Versandregeln und Kundendienst ergänzen; keine Auszahlung/Bestellbestätigung nur anhand Return-URL |
| R-09 | **EU-OS-Plattform** | Die EU-OS-Plattform wurde zum **20.07.2025** eingestellt. Alte verpflichtend wirkende OS-Plattform-Links sind zu entfernen; in geprüften Rechtstexten keine solche alte Verlinkung gefunden | VSBG-Pflichten separat anhand des tatsächlichen Betriebsmodells prüfen |
| R-10 | **Barrierefreiheit / BFSG** | Öffentliche Verkaufs-/Elektronischer-Geschäftsverkehr-Funktionen können je nach tatsächlich angesprochenen Verbrauchern und Kleinstunternehmens-Ausnahme unter BFSG fallen | Verbraucherbezug, Unternehmensgröße und anwendbare Pflichten klären; unabhängig davon Tastatur, Kontrast, Formulare und mobile Bedienung verbessern |
| R-11 | **Regionale SEO-Seiten** | 15 Stadtseiten können bei dünnem Austausch von Ortsnamen unter Doorway-/Scaled-Content-Regeln fallen, selbst wenn keine direkte Abmahnung vorliegt | Echte regionale Belege und Nutzen; keine erfundenen Niederlassungen, Lieferzeiten oder ortsbezogenen Serviceversprechen. Indexierung in Search Console beobachten |
| R-12 | **Ladenöffnungszeiten, Alterskontrolle** | Verkauf von altersbeschränkten Artikeln und 24/7-Automatenkioske unterliegen je nach Land, Standort und Ware unterschiedlichen Regeln | Keine pauschalen 24/7-/Jugendschutz-Genehmigungszusagen, vor rechtsverbindlichen Angaben Behördenregelungen und tatsächliche Altersprüfung verifizieren |

## C. Bereits durchgeführte risikominimierende Änderungen

- `api/stripe-webhook.js`: begrenzt den eingelesenen Request-Body auf 256 KiB; übergroße Requests werden mit HTTP 413 zurückgewiesen.
- `api/checkout.js`: prüft deklarierte Body-Länge (32 KiB) und begrenzt Artikel-ID-Längen. **Proxy-/Providergrenze und Rate-Limits fehlen weiterhin**.
- `checkout-erfolg.html`: keine irreführende automatische Bestell- oder Zahlungsbestätigung mehr; Direktlinks zu Impressum und Datenschutz ergänzt.
- `kontakt.html`: nach 15 Sekunden Timeout mit Wiederherstellung des Buttons und vorsichtigem Hinweis, dass API-Annahme noch keinen E-Mail-Eingang beweist.
- `24-7-kiosk-planer/standortcheck.html`: direkter Link zu Impressum und Datenschutz.
- `datenschutz.html`: widersprüchliche Aussage zu angeblich nur künftigen Kartendiensten korrigiert.
- `impressum.html` / `datenschutz.html`: `noindex,follow` statt `noindex,nofollow`, damit die gesetzlichen Informationen und ihre Links nicht bewusst von Crawlern abgeschnitten werden.
- `.github/workflows/website-quality.yml` und `.github/workflows/public-site-check.yml`: Tokenrechte auf `contents: read` eingeschränkt.
- `scripts/check-site.mjs`: Schutzprüfung auf versehentlich ins Repository eingecheckte Stripe-/Supabase-/GitHub-Secret-Keys und Private Keys.
- `.github/workflows/security-header-audit.yml`: tatsächlich ausgelieferte HTTP-Header geprüft. **Startseite und Kontakt: HTTP 200, CSP/HSTS/X-Content-Type-Options/Referrer-Policy fehlen**.

## D. Priorisierte To-dos bis belastbare Produktionsfreigabe

**P0: Sofort**
1. **Hosting:** Nicht beim kommerziellen B2B-Shop auf GitHub Pages bleiben; bestehenden IONOS-Webspace auf geeigneten Tarif/Setup, DNS, SSL und Rollback prüfen. **Domain nicht ohne kontrollierten Wechsel umschalten.**
2. **Copyright:** 39 PDFs/92 Bilder nach Rechtekette prüfen. Ungeklärte Hersteller-/Fremddateien von öffentlicher Auslieferung nehmen oder durch offizielle Quellenlinks/selbst erstellte Fotos ersetzen.
3. **Zahlungen:** Checkout deaktiviert lassen, bis Bestellungen dauerhaft gespeichert, geprüft und per signiertem Stripe-Webhook verarbeitet werden und verbindliche Vertragsunterlagen vorliegen.
4. **Web3Forms:** Empfänger `info@dein-snackautomat.de`, Domain-Autorisierung, Spamschutz, Kontingente und tatsächlichen Maileingang mit eindeutiger Testkennung bestätigen.

**P1: Vor größeren Besucherzahlen**
5. WAF/CDN/Rate-Limits, HTTPS/HSTS, CSP (zunächst Report-Only), MIME-Schutz und Referrer-Policy beim künftigen Host konfigurieren.
6. Einzigartige MFA für GitHub, IONOS, Stripe, Supabase, E-Mail und Web3Forms; nur notwendige Berechtigungen, Backup- und Wiederherstellungstest. Keine Passwörter oder Tokens in Tickets/Repos.
7. Academy und weitere `vp_*`-Datenbanktabellen auf RLS/RPC/Storage-Policies prüfen und gegebenenfalls getrennte Supabase-Projekte einsetzen.
8. Datenschutz und Impressum mit echten Provider-DPAs/Handelsregisterdaten abgleichen. B2B-Bestellbedingungen und Produktkennzeichnung vor Zahlungsaktivierung prüfen.

**P2: Laufende Sicherheit**
9. Auf bewährte Versionen gepinnte externe Bibliotheken, Dependency-Updates und Code-Review-Pflicht für `main`.
10. Automatisches Monitoring von HTTP-Verfügbarkeit, Formularfehlern und Deploymentstatus; Alarmwege und Rollback-Plan.
11. Nach Umzug Browserabnahme für Shop, Checkout, Academy, Standortanalyse und Kioskstudio sowie Mobile/Barrierefreiheit.
12. Herstellerunterlagen, CE/EU-Verantwortliche und Sicherheitsinformationen je Variante belegen.

## E. Quellen (amtlich / Betreiber)

- GitHub Pages Nutzungseinschränkungen: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub Terms für Pages: https://docs.github.com/de/site-policy/github-terms/github-terms-for-additional-products-and-features
- DDG § 5 Impressum: https://www.gesetze-im-internet.de/ddg/__5.html
- UrhG §§ 13, 19a, 72: https://www.gesetze-im-internet.de/urhg/BJNR012730965.html
- DSGVO Art. 13 und 32: https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu
- TDDDG § 25: https://www.gesetze-im-internet.de/ttdsg/__25.html
- PAngV § 3 und § 6: https://www.gesetze-im-internet.de/pangv_2022/
- GPSR Art. 19: https://eur-lex.europa.eu/eli/reg/2023/988/oj/deu
- BFSG: https://www.gesetze-im-internet.de/bfsg/
- EU-OS-Plattform eingestellt: https://eur-lex.europa.eu/eli/reg/2024/3228/oj/deu
- GitHub Actions HTTPS-Header-Test: https://github.com/StevenHeyn/dein-snackautomat.de/actions/workflows/security-header-audit.yml

**Abschlussstatus: Keine Hinweise auf einen bereits erfolgreichen Angriff im geprüften Material, aber ein unzureichendes Betriebs-/Rechts-Risikoprofil. Die wichtigste Aufgabe ist ein kontrollierter Wechsel vom kommerziell ungeeigneten GitHub-Pages-Hosting und die dokumentierte Copyright-Freigabe. Keine garantierte Schutzwirkung gegen DDoS oder eine „abmahnsichere“ Zusage ohne externe Vertrags-/Rechtebelege und anwaltliche Prüfung.**
