/* Fallout equipment stage; original category CSVs are provisional. */
"use strict";
const EQUIPMENT_FILES = {weapon:'weapons',armor:'armor',gear:'gear',mount:'mounts',vehicle:'vehicles',attachment:'attachments'};
const EQUIPMENT_LABELS = {weapon:'Weapons',armor:'Armor',gear:'General Gear',mount:'Mounts',vehicle:'Vehicles',attachment:'Attachments'};
let falloutEquipment=[];
let equipmentLoadError='';
let equipmentInstanceCounter=0;
let equipmentContainerCounter=0;
const STARTER_COMBAT_SKILLS = ["big_guns","energy_weapons","melee_weapons","small_guns","unarmed","throwing"];
const equipmentUI={openCategories:new Set(),openPanels:new Set(['package','armor','inventory'])};
function equipmentCsvParse(src) {
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<src.length;i++) {const c=src[i];if(quoted){if(c==='"'&&src[i+1]==='"'){field+='"';i++;}else if(c==='"'){quoted=false;}else field+=c;}else if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}
  if(row.length||field){row.push(field.replace(/\r$/,''));rows.push(row);}
  const headers=(rows.shift()||[]).map(s=>s.trim());
  return rows.filter(r=>r.some(s=>s.trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));
}
function equipmentNum(v) {return v===''||v==null?null:Number.isFinite(Number(v))?Number(v):null;}
async function loadFalloutEquipment() {
  try {
    const groups=await Promise.all(Object.entries(EQUIPMENT_FILES).map(async ([category,file])=>{
      const response=await fetch(`data/equipment/${file}.csv`);
      if(!response.ok)throw new Error(`${file}.csv: HTTP ${response.status}`);
      return equipmentCsvParse(await response.text()).map(row=>({ ...row,category, price:equipmentNum(row.price), encumbrance:equipmentNum(row.encumbrance),rarity:equipmentNum(row.rarity),soak:equipmentNum(row.soak),defense:equipmentNum(row.defense),hardPoints:equipmentNum(row.hardPoints),hardPointCost:equipmentNum(row.hardPointCost),purchasable:!['false','0','no'].includes(String(row.purchasable||'').toLowerCase()) }));
    }));
    falloutEquipment=groups.flat();equipmentLoadError='';
  }catch(err){equipmentLoadError=err.message;console.error('Equipment catalog:',err);}
  if(creation.currentStep==='equipment')render();
}
function itemById(id){return falloutEquipment.find(item=>item.id===id);}
function equipmentSpent(){return creation.equipment.reduce((sum,e)=>sum+(itemById(e.id)?.price||0),0);}
function equipmentCaps(){return currentOrigin().startingCaps-equipmentSpent();}
function containerById(id){return creation.containers.find(c=>c.id===id);}
function containerQuantityEnc(entries){
  const normal=entries.reduce((sum,e)=>sum+((itemById(e.id)?.encumbrance||0)>0?(itemById(e.id).encumbrance||0):0),0);
  const zero=entries.filter(e=>(itemById(e.id)?.encumbrance||0)===0).length;
  return normal+Math.floor(zero/10);
}
function containerEncumbrance(container){
  let total=containerQuantityEnc(creation.equipment.filter(e=>(e.containerId??0)===container.id));
  if(/back[\s-]*pack/i.test(container.name))total=Math.max(0,total-4);
  return total;
}
function equipmentEncumbrance(){
  return creation.containers.filter(c=>!c.stowed).reduce((sum,c)=>sum+containerEncumbrance(c),0);
}
function equipmentThreshold(){return 5+creation.ranks.str+creation.equipment.reduce((sum,e)=>sum+((!containerById(e.containerId??0)?.stowed&&e.id==='backpack')?4:0),0);}
function equipmentArmor(){return creation.equipment.find(e=>e.instanceId===creation.equippedArmor&&itemById(e.id)?.category==='armor');}
function canBuyEquipment(item){return item&&item.purchasable&&item.price!==null&&item.price>=0&&item.price<=equipmentCaps();}
function buyEquipment(id){const item=itemById(id);if(!canBuyEquipment(item))return;creation.equipment.push({instanceId:++equipmentInstanceCounter,id,containerId:0,source:'purchased'});rerenderEquipment();}
function refundEquipment(instanceId){const index=creation.equipment.findIndex(e=>e.instanceId===instanceId);if(index===-1)return;if(creation.equippedArmor===instanceId)creation.equippedArmor=null;creation.equipment.splice(index,1);rerenderEquipment();}
function addEquipmentContainer(){creation.containers.push({id:++equipmentContainerCounter,name:'Container',stowed:false});rerenderEquipment();}
function removeEquipmentContainer(id){if(id===0)return;const c=containerById(id);if(!c)return;creation.equipment.forEach(e=>{if((e.containerId??0)===id)e.containerId=0;});creation.containers=creation.containers.filter(x=>x.id!==id);rerenderEquipment();}
function renameEquipmentContainer(id,name){const c=containerById(id);if(c&&id!==0){c.name=name;render();}}
function setEquipmentContainerStowed(id,stowed){const c=containerById(id);if(c){c.stowed=stowed;rerenderEquipment();}}
function moveEquipmentItem(instanceId,containerId){const e=creation.equipment.find(x=>x.instanceId===instanceId);if(e&&containerById(containerId)){e.containerId=containerId;rerenderEquipment();}}
function starterPackageIds(){
  const starter=currentOrigin().starterEquipment;
  if(!starter)return [];
  const combat=STARTER_COMBAT_SKILLS.filter(id=>creation.skills[id]?.tag==='tagrank');
  const choices=combat.length?combat:[starter.fallbackSkill||'small_guns'];
  const noncombat=Object.keys(creation.skills).filter(id=>!STARTER_COMBAT_SKILLS.includes(id)&&creation.skills[id].tag!=='none');
  return [starter.armor,...choices.map(id=>starter.weapons?.[id]),...noncombat.map(id=>starter.taggedSkillItems?.[id])].filter(Boolean);
}
function starterPackage(){
  const ids=starterPackageIds(),items=ids.map(itemById);
  const valid=items.length===ids.length&&items.every(it=>it&&it.price!==null&&it.price>=0&&it.purchasable);
  const price=valid?items.reduce((n,it)=>n+it.price,0):null;
  return {ids,items,valid,price};
}
function canBuyStarterPackage(){const p=starterPackage();return p.valid&&p.ids.length>0&&p.price<=equipmentCaps();}
function buyStarterPackage(){
  if(!canBuyStarterPackage())return;
  const p=starterPackage();
  p.ids.forEach(id=>creation.equipment.push({instanceId:++equipmentInstanceCounter,id,containerId:0,source:'starter'}));
  rerenderEquipment();
}
function equipmentCategoryCard(item){
  const price=item.price===null?'Not normally purchasable':`${item.price.toLocaleString('en-US')} Caps`;
  const details=[];
  if(item.category==='weapon')details.push(item.skill||'',item.damage?`Damage ${item.damageType==='brawn-plus'?'+':''}${item.damage}`:'',item.critical?`Crit ${item.critical}`:'',item.range||'');
  if(item.category==='armor')details.push(`Soak ${item.soak??0}`,`Defense ${item.defense??0}`);
  if(item.encumbrance!==null)details.push(`Enc ${item.encumbrance}`);
  if(item.hardPoints!==null)details.push(`HP ${item.hardPoints}`);
  if(item.hardPointCost!==null)details.push(`HP Cost ${item.hardPointCost}`);
  if(item.qualities)details.push(item.qualities);
  const info=details.filter(Boolean).join(' · ');
  return `<div class="equipment-catalog-card"><h5>${escapeHtml(item.name)}</h5><p>${escapeHtml(info)}</p><p>${escapeHtml(item.effect||'')}</p><p><strong>Price:</strong> ${price}</p><p><strong>Rarity:</strong> ${item.rarity??'—'}</p>${item.purchasable?`<button type="button" data-equipment-buy="${escapeHtml(item.id)}" ${canBuyEquipment(item)?'':'disabled'}>Buy</button>`:''}</div>`;
}
function equipmentDetails(id,title,content,category=false){const isOpen=(category?equipmentUI.openCategories:equipmentUI.openPanels).has(id);return `<details ${category?'class="equipment-catalog-category"':''} data-equipment-details="${escapeHtml(id)}" data-category="${category?'1':'0'}" ${isOpen?'open':''}><summary>${title}</summary><div class="equipment-section-content">${content}</div></details>`;}
function renderEquipmentStep(){
  if(equipmentLoadError)return `<section class="equipment-step"><h2>Equipment</h2><p class="perk-error">${escapeHtml(equipmentLoadError)}</p></section>`;
  const armor=equipmentArmor();const equipped=armor?itemById(armor.id):null;
  const ownedArmor=creation.equipment.filter(e=>itemById(e.id)?.category==='armor');
  const spent=equipmentSpent(),remaining=equipmentCaps();
  const summary=`<div class="equipment-summary"><p><strong>Starting Wealth</strong>${currentOrigin().startingCaps.toLocaleString('en-US')} Caps</p><p><strong>Spent</strong>${spent.toLocaleString('en-US')} Caps</p><p><strong>Remaining</strong>${remaining.toLocaleString('en-US')} Caps</p><p><strong>Encumbrance</strong>${equipmentEncumbrance()} / ${equipmentThreshold()}</p><p><strong>Weapon Hard Points</strong>0 / 0</p><p><strong>Armor Hard Points</strong>0 / ${equipped?.hardPoints||0}</p></div>`;
  const packageData=starterPackage();
  const packageContents=packageData.items.map(item=>`<li>${escapeHtml(item?.name||'Unavailable item')}</li>`).join('');
  const packageSection=equipmentDetails('package','Starting Package',`<p>Based on ${escapeHtml(currentOrigin().name)} and current Tag+Rank combat selections. Noncombat tagged-skill bonus items are not defined yet.</p><ul>${packageContents}</ul><p><strong>Total cost:</strong> ${packageData.price===null?'Unavailable':packageData.price.toLocaleString('en-US')+' Caps'}</p><button type="button" data-buy-package ${canBuyStarterPackage()?'':'disabled'}>Purchase Starting Package</button>`);
  const armorSection=equipmentDetails('armor','Equipped Armor',`<label>Armor: <select data-equipment-armor><option value="">None</option>${ownedArmor.map(e=>`<option value="${e.instanceId}" ${e.instanceId===creation.equippedArmor?'selected':''}>${escapeHtml(itemById(e.id).name)}</option>`).join('')}</select></label><p><strong>Armor Soak:</strong> ${equipped?.soak||0}</p><p><strong>Armor Defense:</strong> ${equipped?.defense||0}</p>${equipped?`<p>Currently wearing: ${escapeHtml(equipped.name)}</p>`:''}`);
  const inventoryContent=creation.containers.map(container=>{
    const entries=creation.equipment.filter(e=>(e.containerId??0)===container.id);
    const header=`<div class="equipment-container-header"><label>${container.id===0?'<strong>Pockets</strong>':`<input type="text" data-container-name="${container.id}" value="${escapeHtml(container.name)}" aria-label="Container name">`}</label><span>Enc ${containerEncumbrance(container)}</span><label><input type="checkbox" data-container-stowed="${container.id}" ${container.stowed?'checked':''}> Stowed</label>${container.id===0?'':`<button type="button" data-container-remove="${container.id}">Remove Container</button>`}</div>`;
    const rows=entries.map(e=>{const item=itemById(e.id);if(!item)return '';return `<div class="equipment-inventory-row"><div class="equipment-inventory-name"><strong>${escapeHtml(item.name)}</strong>${e.instanceId===creation.equippedArmor?' (Equipped)':''}${e.source==='starter'?' · Starter Package':''}</div><div class="equipment-inventory-details">${escapeHtml(EQUIPMENT_LABELS[item.category])}${item.encumbrance!==null?` · Enc ${item.encumbrance}`:''}${item.price!==null?` · ${item.price.toLocaleString('en-US')} Caps`:''}</div><label>Container <select data-item-container="${e.instanceId}">${creation.containers.map(c=>`<option value="${c.id}" ${c.id===(e.containerId??0)?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></label><button type="button" data-equipment-refund="${e.instanceId}">Refund ${item.price===null?'':item.price.toLocaleString('en-US')+' Caps'}</button></div>`;}).join('');
    return `<div class="equipment-container">${header}${rows||'<p>No items in this container.</p>'}</div>`;
  }).join('');
  const inventory=equipmentDetails('inventory',`Inventory (${creation.equipment.length})`,inventoryContent+'<button type="button" data-container-add>+ Add Container</button>');
  const catalogs=Object.entries(EQUIPMENT_LABELS).map(([cat,title])=>{
    const entries=falloutEquipment.filter(item=>item.category===cat && item.subtype!=='service');
    if(!entries.length)return '';
    return equipmentDetails(cat,`${title} (${entries.length})`,entries.map(equipmentCategoryCard).join(''),true);
  }).join('');
  return `<section class="equipment-step"><h2>Equipment</h2>${summary}<div id="starting-package-section">${packageSection}</div><div id="equipped-armor-section">${armorSection}</div><div id="equipment-inventory-section">${inventory}</div><div id="equipment-catalog-section"><h3>Equipment Catalog</h3>${catalogs}</div></section>`;
}
function rerenderEquipment(){render();}
