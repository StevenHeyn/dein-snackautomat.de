# Website-Optimierung: Bestandsprüfung, Maßnahmen und Abnahmeprotokoll
Stand: 14.11.2026 | Projekt: dein-snackautomat.de | GitHub: StevenHeyn/dein-snackautomat.de | Hosting: IONOS (beibehalten)

## Leitlinie und Positionierung
Positionierung: **Vom realen Aufstellort zur passenden Gerätetechnik, Betriebsform und Ersatzteilversorgung**. Die Website unterstützt vier Absichten: Versorgung für Unternehmen, Kauf/Eigenbetrieb, 24/7-Kioskplanung sowie Reparatur/Ersatzteile. Technik, Varianten, Kosten und regionale Betreuung werden ausdrücklich erst bei Beleg bzw. Angebot verbindlich dargestellt.

## Wettbewerbsvergleich (externe Webrecherche; keine übernommenen Werbeaussagen)
| Wettbewerber | Belegbare Online-Stärken | Für uns abgeleiteter Hebel |
| --- | --- | --- |
| Selecta (bundesweit) | Gerätefilter für Automaten, Beratungsfragen zu Nutzerzahl, Standort, Betreuungsform; Full-Service und Miet-/Kaufmodelle auf separaten Seiten | Einfacher eigener Empfehlungsweg mit sinnvollen Pflichtfeldern, Leistungen nach Gebiet klar trennen |
| Dallmayr Vending & Office (bundesweit) | Branchenspezifische Kundenwege, modularer Betriebsservice, sichtbare Referenzen und Kontakt-CTA | Eigenständige Wege für Unternehmen, Aufsteller und Kioskgründer |
| Automatenland (Gerätehandel) | Hersteller-/Gerätekonfigurator mit Größenwahl, Zahlungsoptionen und konkreten Bestell-/Beratungsschritten | Exakte Varianten statt pauschaler Outdoor-/Preisangaben; geführter Vergleich und Anfrageübergabe |
| CA-VENDING (regional vernetztes Unternehmen) | Bedarfsanalyse, Planung, Betrieb und Service in einem nachvollziehbaren Prozess | Kundenweg von Standortplanung zu Angebot und transparenten Folgeschritten |
| snack-hh.de (Hamburg) | Regionale Full-Service-Kommunikation, Gerätetypen, unmittelbare Kontaktmöglichkeit | Regionale Leistungen nur dort darstellen, wo tatsächliche Verfügbarkeit bestätigt ist |

Quellen: https://www.selecta.com/de/de/unsere-dienstleistungen/faq-produkte-und-dienstleistungen ; https://www.dallmayr.com/de/automaten/ ; https://konfigurator.automatenland.de/ ; https://www.ca-vending.de/ ; https://www.snack-hh.de/ . Dies ist ein öffentlich sichtbarer Funktionsvergleich, keine vollständige technische Messung von Wettbewerberwebsites.

## Bestandsbefunde
- Bestehend und erhalten: IONOS/GitHub, B2B-Formular über Web3Forms, Sortiment/Shop mit Ersatzteilnummernsuche (SandenVendo/Necta), originale Referenzbilddateien, Produktdaten und Unterlagen, 2D-/3D-Planer auf separatem Vercel-Projekt, 24/7-Standortscreening, die vorhandenen 15 regionalen Seiten und Search-Console-Sitemap.
- Produktdaten enthalten teilweise modellübergreifende Beschreibungen und sind ausdrücklich nicht für alle Varianten belegt. Auf `produkt.html` existiert bereits eine variantenspezifische Tabelle aus `VENDING_VARIANT_DETAILS`. Diese nicht durch generische Maße ersetzen.
- Die 15 Regional-Landingpages enthalten teils ähnliche Strukturen; Indexierung ist keine Erfolgsgarantie. Keine zusätzlichen Stadtseiten generieren, bevor regionale Nachweise / Nutzwert und Search-Console-Signale geprüft sind.
- Website ist statisch; die öffentliche OSM-Konkurrenzrecherche verwendet Drittanbieter-Endpunkte und bleibt bei CORS/Überlastung potenziell störanfällig.
- Die Web3Forms-`access_key` ist in der Webseite hinterlegt. **Der tatsächliche, in Web3Forms konfigurierte Empfänger `info@dein-snackautomat.de` konnte ohne Anbieterzugang oder Zustelltest nicht verifiziert werden.**
- Automatische Kaufkraftdaten ohne nachgewiesene Nutzungsrechte nicht verwenden.
- Im Kiosk-Konfigurator werden Herstellermaße, Fluchtwege, Bedien-/Wartungsflächen, Kollisionserkennung und Anfrageexport noch nicht vollständig unabhängig verifiziert.
- Webbrowser-/PageSpeed-Messwerte, echte Mobile-Screenshots und aktuelle Search-Console-Berichte waren in dieser Sitzung nicht abrufbar.
- Eine tatsächliche IONOS-Publikation der jüngsten Änderungen wurde noch nicht im Browser bestätigt.

## Prioritäten und überprüfbare Fertig-Kriterien

| Priorität | Aufgabe | Status 14.11.2026 | Fertig-Kriterium / Prüfung |
|---|---|---|---|
| P0 | Vier Kundenwege | **Code umgesetzt** (`automatenloesungen.html`, Homepage-Einstiege) | Jeder der vier CTA führt zu relevantem Inhalt und abschließend zu Kontakt/Shop/Planer, auf Mobile und Desktop |
| P0 | Geführter Automatenberater | **Code umgesetzt** (`automatenberater.html`) | Pflichtfelder validiert; Gründe und fehlende Fakten sichtbar; CTA übernimmt Auswahl ins Kontaktformular; keine erfundene Modellfreigabe |
| P0 | Kontaktformular & regionale Anfragen | **Code verbessert** (`kontakt.html`) | Erfolgreicher Anbieter-API-Versand, manuell bestätigter Mail-Eingang an `info@dein-snackautomat.de`; Ausfall zeigt Fehlermeldung; Produkt-, Stadt- und Standortdaten bleiben lesbar |
| P0 | Web3Forms-Empfänger | **Extern abhängig** | In Web3Forms den bestehenden Zugangsschlüssel prüfen und Empfänger `info@dein-snackautomat.de` bestätigen; echte Testmail an diese Mailbox |
| P1 | Produktseiten | **Grundlage umgesetzt** (`produkt.html`) | Für jedes aktiv beworbene Hauptmodell: Ausführung, Einsatz, H×B×T, Anschluss, Gewicht, Zahlungsoptionen, Zubehör und Zustand jeweils mit Herstellerquelle; unbekannt = „auf Anfrage“ |
| P1 | G-Snack-Outdoor-Varianten | **Herstellerdaten ergänzt** (`snackautomat-outdoor.html`) | Vergleich SM6 OD, SM8 OD und SMX OD mit Datensatz aus G-Snack-Outdoor-Datenblatt, keine Übertragung der Maße auf Indoor/Ausführung ohne Dach |
| P1 | Standortanalyse | **Fallbacks und Hinweise verbessert** | Adresssuche + Umkreisrecherche für drei echte Testadressen; bei Ausfall weiterhin manuelle Eingaben; Score-Datenabdeckung transparent; OSM-Zeitpunkt dokumentiert |
| P1 | Wirtschaftlichkeitsrechner | **Code umgesetzt** (`automaten-wirtschaftlichkeit.html`) | Netto-/Bruttoumsatz, Wareneinsatz, Fixkosten, Zahlgebühren, Schwund, eigene Arbeitszeit und 3 Sensitivitätsszenarien mit automatischer Neuberechnung |
| P1 | Regional-SEO Audit | **Teilweise, weitere Prüfung offen** | Indexierte URLs mit Search Console abgleichen; jede Stadtseite hat eigenständigen Mehrwert/Belege; gleiche Suchabsicht nicht in konkurrierenden URLs; ggf. zusammenführen/noindex |
| P1 | Datenschutz Drittanbieter | **Hinweis ergänzt; Rechtsprüfung offen** | Technisch tatsächliche Dienste, Provider, Übermittlung, Einwilligung/Art. 6 DSGVO und Drittlandregelung durch zuständige Stelle geprüft |
| P2 | Ersatzteile | **Bestehende Suche erhalten** | Suche nach Artikelnummer/Modell/Baugruppe mit 5 Testfällen je Hersteller; unklare Kompatibilität fragt Modell/Seriennummer/Foto |
| P2 | Kiosk-Planer | **Bestehend, Funktionstest offen** | 2D/3D, Tür/Fenster/Wand, echte Maße, Kollisionen, freie Bedien-/Wartungsfläche und Anfrageexport in echten Browsertests prüfen |
| P2 | Performance & Accessibility | **Messung offen** | PageSpeed Insights mobil + Desktop; tatsächliche Web-Vitals dokumentiert; Tastenfokus, Kontraste, mobile Navigation und Touch-Nutzung geprüft |
| P2 | Referenzen | **Bestand erhalten; Freigaben offen** | Bilder/Texte einer echten Installation zugeordnet; Fremdlogos/Kundennamen nur mit Veröffentlichungsfreigabe |
| P2 | Preis-/Liefertransparenz | **Anfragehinweise vorhanden** | Je Produkt bestätigte Nettopreise/zzgl. USt., Lieferkosten, Zustand, Lieferzeit und Verfügbarkeit oder klar „auf Anfrage“ |
| P2 | Zahlungs-/Altersprüfung | **Detailprüfung offen** | Hersteller-/Terminal-Kompatibilität, Verträge, Gebühren, Alterssystem und offizielle Rechtslage abhängig vom Sortiment verifiziert |

## Technische Umsetzungen dieser Runde
1. `automatenloesungen.html`, `beratung.css`: Kundengruppen-spezifische Kauf-, Full-Service-, Kiosk- und Service-Einstiege.
2. `automatenberater.html`: erklärbarer Kategorieberater mit Standort, Sortiment, Nutzerzahl, Platz, Budget und Betriebsform; keine angeblich verifizierten Geräteempfehlungen.
3. `automaten-wirtschaftlichkeit.html`: zusätzlicher frei editierbarer Rechner inkl. Arbeitszeit, Umsatzsteuer und dreier Szenarien.
4. `index.html`: zielgruppenspezifische Einstiege und Wirtschaftlichkeits-CTA.
5. `kontakt.html`: Beraterdaten in vorhandenes Web3Forms-Formular übernehmen; defekte Zeilenumbrüche repariert; echte Dropdown-Optionen „Full-Service“, „24/7-Kiosk“ und „Hanse Vend Smart“ ergänzt.
6. `produkt.html`: technische Kauffragen, Zubehör, Zahlungsvertrag, Einbringung, Varianten-/Zustandsunsicherheit erklärt.
7. `snackautomat-outdoor.html`: geprüfte Datenblatt-Referenzwerte für G-Snack SM6, SM8 und SMX OD (H/B/T, Masse, maximale Auswahlen).
8. `24-7-kiosk-planer/standortcheck.html`: GET-/POST-Versuch und mehrere Overpass-Endpunkte, bei Datenausfall weiterarbeiten ohne fingierte Wettbewerbssignale.
9. `datenschutz.html`: transparente Information über freiwilligen Adress- und Kartendatenabruf; rechtliche Freigabe bleibt extern.
10. `sitemap.xml`: 3 neue qualifizierte Seiten aufgenommen.

## Konkrete Abnahmetests für Veröffentlichung
- IONOS: neuer Commit erscheint im Livesystem; `/automatenloesungen.html`, `/automatenberater.html`, `/automaten-wirtschaftlichkeit.html` und `/snackautomat-outdoor.html` ergeben 200.
- Testkette: Startseite → Berater → „Snacks“, „Indoor“, „Eigenbetrieb“ → Kontakt; Nachricht enthält alle Auswahlfelder in separaten Zeilen.
- Testkette: Full-Service-Anfrage → Kontakt; Thema auswählbar, korrektes Pflichtfeldverhalten.
- Testkette: Standortanalyse für echte Adresse → Karte/POI; ggf. klarer Fehler und manuelle Weiterverwendung; anschließend Anfrageübernahme.
- Formular: Freiwilliger Test mit eigener Firmenadresse, Web3Forms-Antwort erfolgreich **und gesondert Eingang in Mailbox bestätigt**.
- Ersatzteile: Artikelnummer bekannt/teilweise/fehlerhaft; Hersteller- und Variantenzuordnung prüfen.
- SEO: neue Sitemap 111 URL-Blöcke; robots.txt, Canonicals und Indexierungsstatus nach Deployment prüfen.
- Mobile: iPhone/Safari, Android/Chrome, Tablet und Desktop: Fokus, Navigation, Layout, touchfähige Buttons, Konfiguratorhöhe, Formularthemen.
- Performance: Bildgewichte, Cache-Header und Core Web Vitals gegen gemessene Basiswerte vergleichen.

## Externe Abhängigkeiten
- Web3Forms: Empfänger-Adresse und Versandtests; ggf. Zugangsschlüssel neu ausstellen oder Empfängerkonto bestätigen.
- IONOS: aktuelles Deployment und reale HTTP-Statuscodes.
- Lizenzierte Kaufkraft/Geo-API: aktuelle Datenquelle und Veröffentlichungsrechte.
- Vercel-Kiosk-Studio: eigenständiger Code-/Funktionszugang und Browserabnahme. Das Vercel-Projekt `dein-snackautomat-kiosk-studio` existiert mit letztem Deployment-Status READY, was **keinen** fachlichen Funktionstest ersetzt.
- Referenz-/Kundenfreigaben für Logos und Namen.
- Rechtliche Prüfung zu Datenschutz, Warenangebot, Alterskontrolle und regionalem Ladenöffnungsrecht.

## SEO-Hinweis
Google untersagt Doorway-Seiten mit nur geringfügig geänderten Städtenamen. Besonders die vorhandenen 15 Stadtseiten müssen mit echter Relevanz und redaktioneller Prüfung gepflegt werden. Quelle: https://developers.google.com/search/docs/essentials/spam-policies .

**Qualitätsstatus:** Code-/Datei-Prüfungen bestanden, aber keine Aussage über vollständige Produktionsbereitschaft, Rankings oder ROI ohne End-to-End- und Browser-Messungen.
