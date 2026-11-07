# Produktmedien-Import aus Website v20

Die Website referenziert Produktfotos und Originaldatenblätter über `produktdateien.js`. Die Zuordnung wurde aus dem ursprünglichen Website-Archiv abgeleitet.

**Status:** Die Dateizuordnung und technische Daten für 17 Modelle wurden im Repository vorbereitet. Die großen Binärdateien (Fotos/PDFs) werden erst nach einem separaten Upload angezeigt. PDF-Downloadlinks auf der Produktseite sind bis dahin verborgen.

## Medien uploaden
1. Die vorbereiteten Pakete `produktbilder_fuer_github.zip` und `datenblaetter_fuer_github_teil_01.zip` bis `_05.zip` lokal entpacken.
2. Im Repository `StevenHeyn/dein-snackautomat.de` auf dem Branch `main` die Ordner **assets/** und **datenblaetter/** über **Add file → Upload files** hochladen. Beide Verzeichnisse müssen im Repository-Stammverzeichnis liegen, nicht unter einem zusätzlichen Unterordner.
3. Die GitHub Pages Veröffentlichung abwarten. Produktseiten erkennen dann die Bilddateien und zeigen vorhandene PDFs automatisch an.
4. Dateinamen inklusive Groß-/Kleinschreibung unverändert lassen: GitHub Pages unterscheidet beides.
5. Rechte zur öffentlichen Nutzung der Produktfotos und Datenblätter vor der Veröffentlichung prüfen.

Technische Angaben sind aus der früheren Website übernommen und vor einem verbindlichen Angebot modellspezifisch anhand der aktuellen Herstellerunterlagen zu verifizieren. Die aktuell vorhandenen technischen Tabellen decken 17 Modelle ab; für weitere Modelle müssen Daten noch in `technikdaten.js` ergänzt werden.

**Hinweis:** Bitte keine kompletten ZIP-Dateien direkt als Produktbilder ablegen; GitHub Pages kann daraus nicht automatisch einzelne Bilder/PDFs anzeigen.
