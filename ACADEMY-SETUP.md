# Vending Academy – technische Ersteinrichtung

## Status
Die Website `academy.html` und der Kurskatalog sind online darstellbar. Ohne Backend-Verbindung ist der Login deaktiviert. **Es werden noch keine Videos verkauft oder abgespielt.** Die neun Kurskarten sind Entwürfe und keine veröffentlichten Schulungen.

## 1. Supabase-Projekt
1. Unter https://supabase.com ein neues Projekt anlegen (EU-Region nach Möglichkeit auswählen).
2. Authentication → Providers → Email aktivieren; E-Mail-Bestätigung einschalten.
3. In den Auth-URL-Einstellungen die endgültige Academy-URL als zulässige Redirect-URL hinzufügen.
4. Im SQL Editor `academy-schema.sql` ausführen.
5. In `academy-config.js` ausschließlich `supabaseUrl` und den **publishable/anon key** eintragen. **Niemals service_role / secret key in GitHub speichern.**

## 2. Rollen und Lifetime-Zugang
- Die öffentliche Registrierung verifiziert NICHT automatisch, ob jemand tatsächlich Automatenkunde ist.
- Kundenberechtigungen werden erst nach Prüfung eines Kaufs manuell über den Supabase SQL Editor vergeben.
- RLS lässt Benutzer nur ihre eigenen Berechtigungen lesen; keine Selbstfreischaltung.
- `basic_lifetime` besitzt bewusst kein Ablaufdatum.
- Expertenkurse benötigen später eine separate `course`-Berechtigung.

## 3. Vor einem echten Kursverkauf
- Zahlungsanbieter (z. B. Stripe Checkout) und **serverseitige** Payment-Webhooks integrieren. Niemals nach einer Browser-Weiterleitung ohne geprüften Webhook freischalten.
- Private Video-Hosting-Lösung mit zeitlich begrenztem Wiedergabetoken, serverseitiger Prüfung der Berechtigung.
- Datenschutz, Auftragsverarbeitung, Datenspeicherung, B2B-Kursvertragsbedingungen und Abrechnung prüfen.
- Verfügbare Kursinhalte/Preise hinzufügen; keine Platzhalter als verkaufbare Kurse bewerben.
- Backups, Datenschutzrechte, Kontolöschung und Supportprozess testen.

## Rechtliches
Die Academy ist als B2B-Angebot gekennzeichnet, aber eine Checkbox oder Selbstauskunft allein verifiziert keinen Unternehmerstatus. Vor Käufen ist eine passende Prüfung notwendig. „Lebenslang“ ist ein Leistungsversprechen, dessen genaue Bedingungen rechtlich abgestimmt werden sollten. Bis dahin keine verbindlichen Lifetime-Kursverkäufe ankündigen.
