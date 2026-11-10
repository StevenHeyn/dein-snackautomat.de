/* Modellnavigation für SandenVendo-Ersatzteile.
   Eindeutige Treffer: Modellbezeichnung wird ausdrücklich in der Artikelbeschreibung genannt.
   Baureihentreffer: G-Snack/G-Drink ohne eindeutige Modellzuordnung; Passung prüfen.
   Unbekannte Zuordnungen bleiben ausschließlich im vollständigen Gesamtkatalog. */
(function(){
"use strict";
const db=window.VENDING_SPARE_PARTS||(window.VENDING_SPARE_PARTS={});
const all=db["SandenVendo – Ersatzteil-Gesamtkatalog"];
if(!Array.isArray(all))return;
const configs=[
 {label:"G-Snack SM6", exact:/\bSM6\b/i, family:/\bG[-\s]?Snack\b/i, size:"6"},
 {label:"G-Snack SM8", exact:/\bSM8\b/i, family:/\bG[-\s]?Snack\b/i, size:"8"},
 {label:"G-Snack SMX", exact:/\bSMX\b/i, family:/\bG[-\s]?Snack\b/i, size:"X"},
 {label:"G-Snack Budget BS8", exact:/\bBS8\b|G[-\s]?Snack\s+Budget|Budget\s+Snack/i, family:/\bG[-\s]?Snack\b/i,size:"8"},
 {label:"G-Drink DM9", exact:/\bDM9\b/i, family:/\bG[-\s]?Drink\b/i,size:"9"},
 {label:"G-Drink DT9", exact:/\bDT9\b/i, family:/\bG[-\s]?Drink\b/i,size:"9"}
];
const specific=/\b(?:SM6|SM8|SMX|SD6|SD8|SDX|SC6|SC8|ST6|ST8|STX|GSF6|GSF8|HS6|HS8|BS8|SS6|SS8|SSX|EV6|EV8|EVX|DM6|DM9|DT6|DT9|DV9|DR9|GF6|GF9)\b|Budget\s+Snack|G[-\s]?Snack\s+Budget/i;
// Zuordnungen durch externe Ersatzteilverzeichnisse und Artikelnummernlisten belegt.
// Die Hinweise sind ausführungsspezifisch und ersetzen keine Prüfung der Seriennummer.
const confirmed={
 "G-Snack SM6":{"141478-5":"Für G-Snack Indoor bis 12/2021 laut Teilezuordnung; Steuerungsvariante und Seriennummer prüfen."},
 "G-Snack SM8":{"141478-5":"Für G-Snack Indoor bis 12/2021 laut Teilezuordnung; Steuerungsvariante und Seriennummer prüfen."},
 "G-Snack SMX":{"141478-5":"Für G-Snack Indoor bis 12/2021 laut Teilezuordnung; Steuerungsvariante und Seriennummer prüfen."},
 "G-Drink DM9":{"143896-2":"Im Ersatzteilkatalog DM9 geführt; Ausführung und Seriennummer prüfen.","144520":"Im Ersatzteilkatalog DM9 geführt; Ausführung und Seriennummer prüfen.","144519":"Im Ersatzteilkatalog DM9 geführt; Ausführung und Seriennummer prüfen."}
};
const explicitNumber=(name,type)=>{const m=name.match(type==="snack"?/\bG[-\s]?Snack\s+(6|8|X)\b/i:/\bG[-\s]?Drink\s+(6|9)\b/i);return m?m[1].toUpperCase():null};
for(const cfg of configs){
 const groups=[];
 for(const base of all){
  const exact=[],family=[];
  for(const p of base.items){
   const name=p.name||"";
   if(cfg.exact.test(name)||confirmed[cfg.label]?.[p.code]){
    exact.push({...p,fitHint:confirmed[cfg.label]?.[p.code]||"Modell ausdrücklich in der Artikelbezeichnung genannt; Baujahr und Ausführung prüfen.",fitLevel:"exact"});
    continue;
   }
   if(!cfg.family.test(name)||specific.test(name))continue;
   const n=explicitNumber(name,cfg.label.includes("G-Drink")?"drink":"snack");
   if(n&&n!==cfg.size)continue;
   family.push({...p,fitHint:"Baureihentreffer, nicht für dieses Modell bestätigt. Passung anhand Artikelnummer und Seriennummer prüfen.",fitLevel:"family"});
  }
  if(exact.length)groups.push({number:base.number+"-M",name:base.name+" · Modellnennung",items:exact,fitLevel:"exact"});
  if(family.length)groups.push({number:base.number+"-B",name:base.name+" · Baureihe / Passung prüfen",items:family,fitLevel:"family"});
 }
 db["SandenVendo "+cfg.label]=groups;
}
// Diese Verzeichnisse helfen bei der Suche, ohne unsichere Teile einzelnen Geräten zuzuordnen.
function familyCatalog(label,rx,exclude){
 const groups=[];
 for(const base of all){
  const items=base.items.filter(p=>rx.test(p.name||"")&&!exclude.test(p.name||"")).map(p=>({...p,fitLevel:"family",fitHint:"Baureihe genannt. Exaktes Modell und Seriennummer vor Bestellung prüfen."}));
  if(items.length)groups.push({number:base.number+"-A",name:base.name,items,fitLevel:"family"});
 }
 db["SandenVendo "+label]=groups;
}
familyCatalog("G-Snack · weitere Modelle / Baureihenteile",/\bG[-\s]?Snack\b/i,/(?!x)x/);
familyCatalog("G-Drink · weitere Modelle / Baureihenteile",/\bG[-\s]?Drink\b/i,/(?!x)x/);
})();
