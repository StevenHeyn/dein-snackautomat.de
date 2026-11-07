import "./academy-config.js";
const config=window.VENDING_ACADEMY_CONFIG||{};
const courses=[
{slug:"grundlagen",title:"Automaten richtig bedienen",category:"basic",icon:"▦",desc:"Von den ersten Schritten am Gerät bis zur sicheren Bedienung im Tagesgeschäft.",modules:"Grundlagen · Vorschau"},
{slug:"befuellung",title:"Befüllung & Reinigung",category:"basic",icon:"◈",desc:"Produktpflege, sinnvoller Warenmix und einfache Hygieneroutinen für den Betrieb.",modules:"Praxis · Vorschau"},
{slug:"kartenzahlung",title:"Kartenzahlung im Alltag",category:"basic",icon:"▣",desc:"Die wichtigsten Grundlagen zu bargeldlosen Zahlungen und typischen Rückfragen.",modules:"Zahlung · Vorschau"},
{slug:"mdb",title:"MDB & Zahlungssysteme",category:"expert",icon:"⌘",desc:"Schnittstellen, Konfiguration und systematische Fehlersuche an Zahlungsgeräten.",modules:"Technik · Geplant"},
{slug:"fehlerdiagnose",title:"Erweiterte Fehlerdiagnose",category:"expert",icon:"⚒",desc:"Fehlermeldungen eingrenzen, Komponenten prüfen und Störungen dokumentieren.",modules:"Service · Geplant"},
{slug:"kuehltechnik",title:"Kühlung & Wartung",category:"expert",icon:"❄",desc:"Technische Grundlagen, Prävention und Diagnose häufiger Kühlprobleme.",modules:"Technik · Geplant"},
{slug:"standorte",title:"Standorte erfolgreich gewinnen",category:"business",icon:"◎",desc:"Vom Erstkontakt bis zur Standortvereinbarung: Akquise für Automatenbetreiber.",modules:"Business · Geplant"},
{slug:"wirtschaftlichkeit",title:"Umsatz & Rentabilität",category:"business",icon:"↗",desc:"Warenkorb, Kosten, Deckungsbeiträge und eine realistische Automatenkalkulation.",modules:"Business · Geplant"},
{slug:"flottenmanagement",title:"Flottenmanagement",category:"business",icon:"▥",desc:"Routen, Telemetrie, Bestände und standardisierte Prozesse sinnvoll verknüpfen.",modules:"Business · Geplant"}
];
const categoryLabels={basic:"BASIC",expert:"EXPERT",business:"BUSINESS"};
const grid=document.querySelector("#course-grid");
const filters=[...document.querySelectorAll(".filter")];
function renderCourses(category="alle"){
 grid.replaceChildren();
 for(const course of courses.filter(x=>category==="alle"||x.category===category)){
  const article=document.createElement("article");article.className="course-card";
  const vis=document.createElement("div");vis.className="course-visual";
  const type=document.createElement("span");type.className="course-type";type.textContent=categoryLabels[course.category];
  const icon=document.createElement("div");icon.className="course-icon";icon.textContent=course.icon;
  vis.append(type,icon);
  const body=document.createElement("div");body.className="course-body";
  const title=document.createElement("h3");title.textContent=course.title;
  const desc=document.createElement("p");desc.textContent=course.desc;
  const meta=document.createElement("div");meta.className="course-meta";
  const a=document.createElement("b");a.textContent=course.category==="basic"?"Für Käufer: Basic Lifetime":"Kostenpflichtige Freischaltung";
  const b=document.createElement("span");b.textContent="In Vorbereitung";
  meta.append(a,b);body.append(title,desc,meta);article.append(vis,body);grid.append(article);
 }
}
filters.forEach(b=>b.addEventListener("click",()=>{filters.forEach(x=>x.classList.toggle("active",x===b));renderCourses(b.dataset.category)}));renderCourses();
const configured=Boolean(config.supabaseUrl&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl)&&config.supabasePublishableKey);
const setup=document.getElementById("setup-msg"),authWrap=document.getElementById("auth-wrap"),memberWrap=document.getElementById("member-wrap"),status=document.getElementById("auth-status");
let supabase=null,mode="login";
const setStatus=(message)=>{status.textContent=message};
if(configured){
 try{
 const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
 supabase=createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
 setup.hidden=true;authWrap.hidden=false;
 const {data:{session}}=await supabase.auth.getSession();
 await updateSession(session);
 supabase.auth.onAuthStateChange((_event,session)=>{void updateSession(session)});
 }catch(err){setup.textContent="Die Anmeldung ist momentan nicht erreichbar. Bitte versuche es später erneut.";setStatus("Verbindungsfehler")}
}else{
 setup.textContent="Mitgliederkonten sind noch nicht aktiviert. Die Academy ist derzeit eine Vorschau, ohne Registrierung, Bezahlung oder Videozugriff.";
}
async function updateSession(session){
 const user=session?.user;
 memberWrap.hidden=!user;authWrap.hidden=Boolean(user);
 if(!user)return;
 document.getElementById("member-email").textContent=user.email||"Angemeldetes Mitglied";
 const output=document.getElementById("member-status");output.replaceChildren();
 const note=document.createElement("p");note.textContent="Mitgliedskonto aktiv. Für den kostenlosen Basic-Lifetime-Zugang muss eure Kundenberechtigung bestätigt werden.";output.append(note);
 try{
 const {data, error}=await supabase.from("academy_entitlements").select("scope,course_slug").eq("user_id",user.id);
 if(error)throw error;
 const statusLine=document.createElement("p");
 const basic=data?.some(x=>x.scope==="basic_lifetime");
 statusLine.textContent=basic?"✓ Basic Academy: lebenslang freigeschaltet":"Basic Academy: Noch keine Freischaltung";
 output.append(statusLine);
 const experts=(data||[]).filter(x=>x.scope==="course").map(x=>x.course_slug).filter(Boolean);
 if(experts.length){const item=document.createElement("p");item.textContent="Freigeschaltete Expertenkurse: "+experts.join(", ");output.append(item)}
 }catch(e){const note=document.createElement("p");note.textContent="Deine Berechtigungen konnten noch nicht geladen werden.";output.append(note)}
}
document.querySelectorAll("[data-auth]").forEach(button=>button.addEventListener("click",()=>{
 mode=button.dataset.auth;document.querySelectorAll("[data-auth]").forEach(b=>b.classList.toggle("current",b===button));
 document.getElementById("panel-title").textContent=mode==="login"?"Willkommen zurück.":"Business-Konto erstellen.";
 document.getElementById("auth-submit").textContent=mode==="login"?"Anmelden":"Registrieren";
 document.querySelector("#auth-form [name=password]").autocomplete=mode==="login"?"current-password":"new-password";
 setStatus("");
}));
document.getElementById("auth-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!supabase)return;
 const form=e.currentTarget,btn=document.getElementById("auth-submit");
 if(!form.reportValidity())return;
 const email=form.elements.email.value.trim(),password=form.elements.password.value;
 btn.disabled=true;setStatus("Bitte warten …");
 try{
 const result=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
 if(result.error)throw result.error;
 if(mode==="register")setStatus("Registrierung angelegt. Bitte bestätige gegebenenfalls den Link in deiner E-Mail. Basic Lifetime wird erst nach Kundenprüfung freigeschaltet.");
 else setStatus("Erfolgreich angemeldet.");
 }catch(error){setStatus("Anmeldung nicht möglich. Bitte Zugangsdaten und E-Mail-Bestätigung prüfen.")}
 finally{btn.disabled=false;btn.textContent=mode==="login"?"Anmelden":"Registrieren";}
});
document.getElementById("logout").addEventListener("click",async()=>{if(!supabase)return;await supabase.auth.signOut();setStatus("Du bist abgemeldet.")});
