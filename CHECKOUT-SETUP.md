# Checkout / Stripe – Einrichtung (H&K Projekt UG)

Status: **Vorbereitung, nicht live**. Solange `checkout-config.js` eine leere API-Adresse enthält, bleibt das bisherige **unverbindliche Anfrageformular** unverändert aktiv. Niemals geheime API-Schlüssel in GitHub ablegen.

## Architektur

- Bestehende Shopseite: GitHub Pages `https://dein-snackautomat.de/shop.html`
- Zahlungsserver: Vercel Node Functions `api/checkout.js` und `api/stripe-webhook.js`
- Stripe-hosted Checkout sammelt Zahlungsart und Rechnungsdaten.
- Das Backend prüft alle Positionen aus den vorhandenen Ersatzteil-JS-Katalogen selbst, berechnet den Listenpreis vor 25 % Händlerrabatt und berechnet bei Ersatzteilen **einmalig 13,00 € Versand + 2,50 € Verpackung netto**.
- Banküberweisung (SEPA-Überweisung) muss separat in Stripe aktiviert und auf tatsächliche Stripe-Checkout-Eignung geprüft werden; sie ist **noch nicht eingebaut**.
- PayPal wird nur angezeigt, wenn Stripe die Zahlungsmethode für dieses konkrete Unternehmen freischaltet und sie bei der jeweiligen Bestellung verfügbar ist.

## Noch erforderlich vor Live-Schaltung

1. Vercel-Projekt aus dem vorhandenen GitHub-Repository importieren; GitHub Pages bleibt als Website bestehen.
2. In Vercel **verschlüsselte Umgebungsvariablen** setzen:
   - `STRIPE_SECRET_KEY`: Zunächst `sk_test_...` zum Testen, später `sk_live_...`
   - `STRIPE_TAX_RATE_ID`: Stripe Tax Rate für 19 % **exklusive** Umsatzsteuer (zum Testen/Live jeweils passende Rate). **Alternativ** `STRIPE_AUTOMATIC_TAX=true` nur bei entsprechend eingerichteter Stripe-Tax-Konfiguration.
   - `STRIPE_WEBHOOK_SECRET`: Webhook-Signaturschlüssel von Stripe für `https://<Vercel-Domain>/api/stripe-webhook`.
   - `STORE_ORIGIN=https://dein-snackautomat.de`.
3. Stripe-Dashboard: Karten, Wallets, PayPal (falls für H&K Projekt UG geeignet) und separat SEPA-Überweisung prüfen/aktivieren. SEPA-Überweisung ist im vorbereiteten Code nicht automatisch enthalten.
4. Stripe-Webhooks `checkout.session.completed`, `checkout.session.async_payment_succeeded` und `checkout.session.async_payment_failed` auf die API-URL konfigurieren. Signaturprüfung und Zustellung mit Testevents verifizieren; bei Vercel muss der **unveränderte Rohkörper** verarbeitet werden.
5. **Vor der echten Live-Schaltung:** zuverlässige, dauerhafte Bestellspeicherung mit Wiederholungs-/Idempotenzschutz, Verkäufer-Benachrichtigung, Zahlungsstatus, Retouren-/Storno-/Erstattungsablauf und Bestätigungsmails anbinden. Der vorbereitete Webhook protokolliert Events nur zu Testzwecken; er ist **noch keine produktive Bestellverwaltung**.
6. Rechtliche Texte und Checkout-Angaben aktualisieren: Verkaufsbedingungen, Datenschutz (Stripe/Hosting), korrekte B2B-Bestellfunktion, Lieferzeiten, Zahlungs-/Versandkosten, Umsatzsteuer, Rechnungsangaben, ggf. Widerrufs-/Verbraucherschutzabgrenzung. Bitte fachlich prüfen lassen.
7. Mit `sk_test_` mehrere Testzahlungen/Abbrüche, falsche Artikel/Preise, Mengenlimits, Lieferadresse und Webhook prüfen. Erst dann in `checkout-config.js` die **öffentliche** API-URL wie `https://<Vercel-Domain>/api/checkout` eintragen und GitHub Pages veröffentlichen. Stripe Live-Schlüssel nie über Chat/GitHub übertragen.

## Wichtige Einschränkungen

- Kein Betrag wird aus dem Browser übernommen; nur IDs und Mengen (1–30) werden akzeptiert.
- Preise werden in der Serverfunktion aus den versionierten Katalogen berechnet.
- Versand im vorbereiteten Checkout ist auf Lieferadressen innerhalb Deutschlands begrenzt, wenn Ersatzteile bestellt werden.
- Die Steuerberechnung muss vor Live-Schaltung zum tatsächlichen Liefer-/Leistungsort und Kundentyp passen; die bloße B2B-Angabe ersetzt keine Umsatzsteuerprüfung.
- Shop-Cart ist im Browser lokal gespeichert und wird erst durch die Stripe-Weiterleitung verarbeitet.
- Die Online-Zahlung ist absichtlich **nicht freigeschaltet**, bis Vercel und Stripe vollständig getestet und der Bestellprozess betriebssicher sind.
