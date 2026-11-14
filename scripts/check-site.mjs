import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root=process.cwd();
const ignored=new Set([".git","node_modules",".vercel"]);
function walk(dir="") {
  const result=[];
  for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const p=path.posix.join(dir,entry.name);
    if(entry.isDirectory())result.push(...walk(p));
    else result.push(p);
  }
  return result;
}
const files=walk(), paths=new Set(files), htmlFiles=files.filter(f=>f.endsWith(".html")), errors=[];
function err(file,detail){errors.push(file+": "+detail)}
function normalize(file,reference){
 let url=reference.replaceAll("&amp;","&").trim();
 if(!url||/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|#|\/\/)/i.test(url))return null;
 if(/[{}]/.test(url))return null;
 url=url.split(/[?#]/)[0];
 try{url=decodeURIComponent(url)}catch{}
 const directory=url.startsWith("/")?"":path.posix.dirname(file);
 let target=path.posix.normalize(path.posix.join(directory,url));
 if(target.endsWith("/"))target+="index.html";
 if(!path.posix.extname(target)&&!paths.has(target))target=path.posix.join(target,"index.html");
 return target;
}
for(const p of htmlFiles){
 const content=fs.readFileSync(p,"utf8");
 if(!/<h1\b/i.test(content))err(p,"H1 missing");
 for(const m of content.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gis)){
  const ref=m[2],target=normalize(p,ref);
  if(target&&!paths.has(target))err(p,"missing local target "+target+" (from "+ref.slice(0,90)+")");
 }
 for(const m of content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  const attributes=m[1]||"",code=m[2]||"";
  if(/\btype\s*=\s*["']application\/ld\+json["']/i.test(attributes)){
   try{JSON.parse(code)}catch(e){err(p,"invalid JSON-LD: "+e.message)}continue;
  }
  if(code.trim()){
   try{new vm.Script(code,{filename:p})}catch(e){err(p,"invalid inline JS: "+e.message)}
  }
 }
}
const sitemap=fs.readFileSync("sitemap.xml","utf8");
const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll("&amp;","&"));
if(sitemapUrls.length===0)err("sitemap.xml","missing URLs");
for(const u of sitemapUrls){
 try{
  const url=new URL(u);
  if(url.hostname!=="dein-snackautomat.de")err("sitemap.xml","unexpected domain: "+u);
  let rel=url.pathname.slice(1)||"index.html";
  if(rel.endsWith("/"))rel+="index.html";
  if(!paths.has(rel))err("sitemap.xml","missing target "+rel);
 }catch{err("sitemap.xml","invalid URL "+u)}
}
const contact=fs.readFileSync("kontakt.html","utf8");
if(!contact.includes('mailto:info@dein-snackautomat.de'))err("kontakt.html","missing official contact mail link");
if(!contact.includes('https://api.web3forms.com/submit'))err("kontakt.html","contact API not present");
if(!contact.includes('name="access_key"'))err("kontakt.html","Web3Forms key field missing");
const report={html:htmlFiles.length,files:files.length,sitemap:sitemapUrls.length,errorCount:errors.length,errors:errors.slice(0,100)};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exit(1);
