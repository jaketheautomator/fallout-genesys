"use strict";
const categoryFiles = ['weapons','armor','gear','mounts','vehicles','attachments'];
function csvRecords(src) {
 const rows=[];let row=[],field='',q=false;
 for(let i=0;i<src.length;i++){let c=src[i];if(q){if(c==='"'&&src[i+1]==='"'){field+='"';i++;}else if(c==='"')q=false;else field+=c;}else if(c==='"')q=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}
 if(row.length||field){row.push(field.replace(/\r$/,''));rows.push(row);}
 const head=rows.shift();return rows.filter(r=>r.some(v=>v.trim())).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]||''])));
}
function safe(s) {return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
(async()=>{
 const kind=document.body.dataset.catalog;
 const output=document.getElementById('catalog-results'),query=document.getElementById('catalog-query');
 try {
  const files=kind==='perks'?['data/perks.csv']:categoryFiles.map(f=>`data/equipment/${f}.csv`);
  const groups=await Promise.all(files.map(async f=>{const r=await fetch(f);if(!r.ok)throw new Error(f+' HTTP '+r.status);return csvRecords(await r.text()).map(item=>({...item,group:f.split('/').pop().replace('.csv','')}));}));
  const items=groups.flat();
  function render(){const needle=query.value.toLowerCase();const selected=items.filter(item=>Object.values(item).some(v=>String(v).toLowerCase().includes(needle)));
   output.innerHTML=selected.map(item=>`<article class="catalog-card"><h3>${safe(item.name||item.id)}</h3><p>${safe(item.description||item.effect||'')}</p><small>${safe(item.group)}${item.tier?' · Tier '+safe(item.tier):''}${item.price?' · '+safe(item.price)+' Caps':''}${item.rarity?' · Rarity '+safe(item.rarity):''}</small></article>`).join('')||'<p>No results.</p>';
  }
  query.addEventListener('input',render);render();
 }catch(err){output.textContent='Unable to load catalog: '+err.message;}
})();
