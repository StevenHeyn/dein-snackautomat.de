"use strict";
(function(){
 const input=document.getElementById("wissen-search"),reset=document.getElementById("wissen-reset"),status=document.getElementById("wissen-status"),empty=document.getElementById("wissen-empty");
 const cards=[...document.querySelectorAll("#wissen-results .card")], buttons=[...document.querySelectorAll(".category")];
 let active="Alle";
 const normalize=s=>String(s||"").toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g," ").trim();
 const indexed=cards.map(card=>({card,search:normalize(card.dataset.search)}));
 function render(){
   const words=normalize(input.value).split(" ").filter(Boolean);
   const diagnosis=document.getElementById("wissen-diagnosis-link");
   if(diagnosis) diagnosis.href="fehlerdiagnose.html"+(input.value.trim()?"?q="+encodeURIComponent(input.value.trim().slice(0,120)):"");
   let shown=0;
   for(const item of indexed){
     const visible=(active==="Alle"||item.card.dataset.category===active)&&words.every(w=>item.search.includes(w));
     item.card.hidden=!visible;if(visible)shown++;
   }
   empty.hidden=shown!==0;
   status.textContent=shown+" von "+cards.length+" Beiträgen angezeigt"+(active==="Alle"?"":" · "+active)+".";
   buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.category===active)));
 }
 input.addEventListener("input",render);
 buttons.forEach(b=>b.addEventListener("click",()=>{active=b.dataset.category;render()}));
 document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.query;active="Alle";render();input.focus()}));
 reset.addEventListener("click",()=>{input.value="";active="Alle";render();input.focus()});
 const params=new URLSearchParams(location.search);
 if(params.has("q"))input.value=(params.get("q")||"").slice(0,120);
 render();
})();
