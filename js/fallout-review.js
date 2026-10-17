/* Review and portable character files. Format version 1; no Roll20 import is implied. */
"use strict";
const REVIEW_FORMAT = 'fallout-genesys-character';
const REVIEW_VERSION = 1;
const reviewNumber = n => Number.isFinite(Number(n)) ? Number(n) : 0;
const reviewEsc = value => escapeHtml(value);
function reviewValidation() {
  const issues = [];
  if (!currentOrigin()?.enabled) issues.push(['origin', 'Select an available Origin.']);
  if (picksAvailable('tag') !== 0 || picksAvailable('tagrank') !== 0)
    issues.push(['skills', `Complete your Tag selections (${picksAvailable('tag')} Tag and ${picksAvailable('tagrank')} Tag+Rank remaining).`]);
  if (Object.values(creation.ranks).filter(n=>n===1).length>1 || Object.values(creation.ranks).some(n=>!Number.isInteger(n)||n<1||n>5))
    issues.push(['special','SPECIAL ranks are out of range.']);
  if (FALLOUT_SKILLS.some(s=>!['none','tag','tagrank'].includes(creation.skills[s.id]?.tag)||!Number.isInteger(creation.skills[s.id]?.purchased)||creation.skills[s.id]?.purchased<0||skillRank(s.id)>MAX_SKILL_RANK))
    issues.push(['skills','One or more skills have invalid ranks or Tag selections.']);
  if (xpSpent()>effectiveStartingXP()) issues.push(['special','XP spending exceeds available XP.']);
  if (!pyramidValid() || !prerequisitesValid()) issues.push(['perks','Perk prerequisites or pyramid are invalid.']);
  if (equipmentCaps()<0) issues.push(['equipment','Equipment costs exceed available Caps.']);
  if (['backpack','footlocker'].some(id=>creation.equipment.filter(e=>e.id===id).length>1)) issues.push(['equipment','Only one Backpack and one Footlocker may be owned.']);
  if (creation.equipment.some(e=>!containerById(e.containerId??0))) issues.push(['equipment','Some equipment is assigned to a missing container.']);
  if (creation.equippedArmor!==null && !equipmentArmor()) issues.push(['equipment','Selected armor is not in inventory.']);
  if (perkDataError || equipmentLoadError || !falloutPerks.length || !falloutEquipment.length)
    issues.push(['equipment','The Perks or Equipment catalog has not finished loading.']);
  return issues;
}
function renderReview() {
  const origin=currentOrigin(), money=n=>Number(n).toLocaleString('en-US');
  const issues=reviewValidation();
  const special=[...FALLOUT_RULES.special.map(s=>({name:s.name,initial:s.id.toUpperCase().slice(0,1),value:FALLOUT_RULES.score[creation.ranks[s.id]]+(origin.specialModifiers?.[s.id]||0)})),{name:'Luck',initial:'L',value:creation.luckMax}];
  const equipped=equipmentArmor(), armor=equipped?itemById(equipped.id):null;
  const derived=[['Wound Threshold',10+creation.ranks.str],['Strain Threshold',10+creation.ranks.end],['Soak',creation.ranks.str + Number(armor?.soak||0)],['Ward',creation.ranks.end + Number(armor?.ward||0)],['Armor Defense',armor?.defense||0],['Encumbrance',`${equipmentEncumbrance()} / ${equipmentThreshold()}`]];
  const skillGroups=['General','Combat','Social','Knowledge'].map(group=>`<div class="review-skill-group"><h4>${group}</h4><div class="review-skill-grid">${FALLOUT_SKILLS.filter(s=>s.group===group).map(s=>`<div class="review-skill"><span>${reviewEsc(s.name)} <small>${s.stat.toUpperCase()}</small>${creation.skills[s.id].tag!=='none'?` <em>${creation.skills[s.id].tag==='tagrank'?'Tag+Rank':'Tag'}</em>`:''}</span><strong>${skillRank(s.id)}</strong></div>`).join('')}</div></div>`).join('');
  const perks=[1,2,3,4,5].map(tier=>{
    const owned=purchasedPerksAtTier(tier);
    return owned.length?`<h4>Tier ${tier}</h4><div class="review-cards">${owned.map(({perk,rank})=>`<article><strong>${reviewEsc(perk.name)}${perk.ranked?` (Rank ${rank})`:''}</strong><small>${reviewEsc(perk.activation)}</small><p>${reviewEsc(perk.description)}</p></article>`).join('')}</div>`:'';
  }).join('')||'<p>No Perks purchased.</p>';
  const containers=creation.containers.map(c=>{
    const items=creation.equipment.filter(e=>(e.containerId??0)===c.id);
    return `<div class="review-container"><h4>${reviewEsc(c.name)} <small>${c.kind==='footlocker'?'Settlement storage · unavailable while traveling':c.stowed?'Stowed':`Enc ${containerEncumbrance(c)}`}</small></h4>${items.length?`<ul>${items.map(e=>{const item=itemById(e.id);return `<li>${reviewEsc(item?.name||e.id)}${e.instanceId===creation.equippedArmor?' (Equipped)':''}</li>`;}).join('')}</ul>`:'<p>Empty</p>'}</div>`;
  }).join('');
  const armament=creation.equipment.filter(e=>itemById(e.id)?.category==='weapon');
  return `<section class="review-step"><h2>Review</h2><p>Review the completed character, then export a JSON file to save or reload this build.</p>
    <div class="review-overview"><div><h3>${reviewEsc(creation.name.trim()||'Wastelander')}</h3><p>${reviewEsc(origin.name)}</p></div><div><strong>${money(equipmentCaps())} Caps</strong><small>Remaining</small></div></div>
    <div class="review-resources"><div><strong>${effectiveStartingXP()}</strong><small>Starting XP</small></div><div><strong>${xpSpent()}</strong><small>Spent XP</small></div><div><strong>${effectiveStartingXP()-xpSpent()}</strong><small>Remaining XP</small></div></div>
    <details open><summary>SPECIAL &amp; Statistics</summary><div class="review-section"><div class="review-special">${special.map(s=>`<div title="${reviewEsc(s.name)}"><span>${s.initial}</span><strong>${s.value}</strong><small>${reviewEsc(s.name)}</small></div>`).join('')}</div><div class="review-stats">${derived.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>${(origin.abilities||[]).map(a=>`<p><strong>${reviewEsc(a.name)}:</strong> ${reviewEsc(a.description)}</p>`).join('')}</div></details>
    <details open><summary>Skills</summary><div class="review-section">${skillGroups}</div></details>
    <details open><summary>Perks</summary><div class="review-section">${perks}</div></details>
    <details open><summary>Equipment &amp; Inventory</summary><div class="review-section"><p><strong>Equipped Armor:</strong> ${reviewEsc(armor?.name||'None')}${armor?` · Soak ${armor.soak||0} · Ward ${armor.ward||0} · Defense ${armor.defense||0}`:''}</p><h4>Weapons</h4>${armament.length?`<ul>${armament.map(e=>{const w=itemById(e.id);return `<li>${reviewEsc(w.name)} · ${reviewEsc(w.skill||'')} · Damage ${reviewEsc(w.damage||'—')} · Crit ${reviewEsc(w.critical||'—')}</li>`;}).join('')}</ul>`:'<p>No weapons owned.</p>'}<h4>Containers</h4>${containers}</div></details>
    <details open><summary>Validation</summary><div class="review-section">${issues.length?`<ul class="review-validation">${issues.map(([step,message])=>`<li>${reviewEsc(message)} <button type="button" data-review-goto="${step}">Go to ${step}</button></li>`).join('')}</ul>`:'<p class="review-valid">All required selections and spending checks pass. Unspent XP and Caps are permitted.</p>'}</div></details>
    <div class="review-io"><button type="button" data-review-export>Export JSON</button><button type="button" data-review-copy>Copy JSON</button><label class="review-load">Load JSON <input type="file" accept=".json,application/json" data-review-file></label><p id="review-file-message" role="status"></p></div>
  </section>`;
}
function buildCharacterSave(){
  return {format:REVIEW_FORMAT,version:REVIEW_VERSION,character:{
    name:creation.name,origin:creation.origin,ranks:{...creation.ranks},luckMax:creation.luckMax,luckCurrent:creation.luckCurrent,
    skills:Object.fromEntries(Object.entries(creation.skills).map(([id,s])=>[id,{...s}])),
    perks:{...creation.perks},equipment:creation.equipment.map(e=>({...e})),equippedArmor:creation.equippedArmor,
    containers:creation.containers.map(c=>({...c}))
  }};
}
function exportCharacterJSON(){
  const data=JSON.stringify(buildCharacterSave(),null,2);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;
  link.download=`${(creation.name.trim()||'wastelander').replace(/[^a-z0-9_-]+/gi,'-')}-fallout.json`;
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
/* A self-contained sheet snapshot. Consumers need no origin, talent or gear CSVs. */
function buildPortableCharacterCopy() {
  const origin = currentOrigin();
  const stats = Object.fromEntries(FALLOUT_RULES.special.map(stat => [stat.id, {
    name: stat.name,
    characteristic: stat.genesys,
    rank: creation.ranks[stat.id],
    originModifier: Number(origin.specialModifiers?.[stat.id] || 0),
    score: FALLOUT_RULES.score[creation.ranks[stat.id]] + Number(origin.specialModifiers?.[stat.id] || 0)
  }]));
  stats.luck = {
    name: 'Luck', score: creation.luckMax + Number(origin.specialModifiers?.luck || 0),
    maximum: creation.luckMax, current: creation.luckCurrent,
    originModifier: Number(origin.specialModifiers?.luck || 0)
  };
  const skills = FALLOUT_SKILLS.map(skill => {
    const selected = creation.skills[skill.id];
    return {
      id: skill.id, name: skill.name, group: skill.group,
      characteristic: skill.stat, tag: selected.tag !== 'none',
      tagSelection: selected.tag,
      purchasedRanks: selected.purchased,
      originRanks: skillBonus(skill.id),
      tagBonusRanks: selected.tag === 'tagrank' ? 1 : 0,
      rank: skillRank(skill.id)
    };
  });
  const perks = [];
  for (const [id, quantity] of Object.entries(creation.perks)) {
    const perk = perkById(id);
    if (!perk || !quantity) throw new Error(`Perk definition unavailable: ${id}`);
    for (let rank = 1; rank <= quantity; rank++) {
      const tier = perkEffectiveTier(perk, rank);
      perks.push({ id, name: perk.name, rank, tier,
        activation: perk.activation, type: String(perk.activation || '').startsWith('Passive') ? 'Passive' : 'Active',
        ranked: perk.ranked, description: perk.description,
        prerequisites: perk.prerequisites.map(key => ({id:key,name:perkById(key)?.name || key})),
        xpCost: tier * 5 });
    }
  }
  const equipment = creation.equipment.map(entry => {
    const definition = itemById(entry.id);
    if (!definition) throw new Error(`Equipment definition unavailable: ${entry.id}`);
    return {
      ...definition, instanceId: entry.instanceId, containerId: entry.containerId,
      source: entry.source, equipped: creation.equippedArmor === entry.instanceId,
      pricePaid: definition.price
    };
  });
  const containers = creation.containers.map(container => ({
    ...container, contents: equipment.filter(item => item.containerId === container.id).map(item => item.instanceId),
    encumbrance: containerEncumbrance(container),
    carried: !container.stowed && container.kind !== 'footlocker'
  }));
  const armor = equipment.find(item => item.equipped && item.category === 'armor') || null;
  const totalXP = effectiveStartingXP();
  const spentXP = xpSpent();
  return {
    format: 'fallout-genesys-portable-character', version: 1,
    exportedAt: new Date().toISOString(),
    character: buildCharacterSave().character,
    sheet: {
      name: creation.name,
      origin: { id: origin.id, name: origin.name, abilities: (origin.abilities || []).map(a => ({...a})),
        startingXP: origin.startingXP, startingCaps: origin.startingCaps,
        tagPicks: origin.tagPicks, tagRankPicks: origin.tagRankPicks },
      special: stats, skills, perks, equipment, containers,
      equippedArmorInstanceId: creation.equippedArmor,
      combat: { weapons: equipment.filter(item => item.category === 'weapon'), armor,
        woundThreshold: 10 + creation.ranks.str,
        strainThreshold: 10 + creation.ranks.end,
        soak: creation.ranks.str + Number(armor?.soak || 0),
        ward: creation.ranks.end + Number(armor?.ward || 0),
        rangedDefense: Number(armor?.defense || 0), meleeDefense: Number(armor?.defense || 0) },
      encumbrance: { current: equipmentEncumbrance(), maximum: equipmentThreshold() },
      xp: { starting: totalXP, spent: spentXP, remaining: totalXP - spentXP },
      caps: { starting: origin.startingCaps, spent: equipmentSpent(), remaining: equipmentCaps() }
    }
  };
}
async function copyCharacterJSON(){
  const message=document.getElementById('review-file-message');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
    await navigator.clipboard.writeText(JSON.stringify(buildPortableCharacterCopy(),null,2));
    if (message) message.textContent='Complete, self-contained character JSON copied to clipboard.';
  } catch (error) {
    if (message) message.textContent=`Copy failed: ${error.message} (clipboard access may require HTTPS or localhost).`;
  }
}
function importCharacterJSON(text){
  let data;try{data=JSON.parse(text);}catch{throw new Error('The selected file is not valid JSON.');}
  if(data?.format!==REVIEW_FORMAT||data.version!==REVIEW_VERSION||!data.character||typeof data.character!=='object') throw new Error('Unsupported character file format or version.');
  const c=data.character, origin=FALLOUT_ORIGINS.find(o=>o.id===c.origin&&o.enabled);
  if(!origin)throw new Error('This Origin is not available in the current builder.');
  if(!falloutPerks.length||!falloutEquipment.length)throw new Error('Please wait for the Perks and Equipment catalogs to load, then try again.');
  const ranks={};for(const stat of FALLOUT_RULES.special){const v=c.ranks?.[stat.id];if(!Number.isInteger(v)||v<1||v>5)throw new Error('Invalid SPECIAL ranks.');ranks[stat.id]=v;}
  if(Object.values(ranks).filter(v=>v===1).length>1)throw new Error('More than one SPECIAL characteristic was reduced.');
  const skills={};for(const s of FALLOUT_SKILLS){const entry=c.skills?.[s.id];if(!entry||!['none','tag','tagrank'].includes(entry.tag)||!Number.isInteger(entry.purchased)||entry.purchased<0||entry.purchased+Number(origin.skillBonuses?.[s.id]||0)+(entry.tag==='tagrank'?1:0)>2)throw new Error(`Invalid skill data: ${s.name}`);skills[s.id]={tag:entry.tag,purchased:entry.purchased};}
  if(Object.values(skills).filter(s=>s.tag==='tag').length>(origin.tagPicks??4)||Object.values(skills).filter(s=>s.tag==='tagrank').length>(origin.tagRankPicks??4))throw new Error('Too many Tag selections.');
  const perks={};if(!c.perks||typeof c.perks!=='object'||Array.isArray(c.perks))throw new Error('Invalid Perks data.');
  for(const [id,n] of Object.entries(c.perks)){const perk=perkById(id);if(!perk||!Number.isInteger(n)||n<0||n>(perk.ranked?5:1))throw new Error(`Unknown or invalid Perk: ${id}`);perks[id]=n;}
  if(!Array.isArray(c.equipment)||!Array.isArray(c.containers)||c.equipment.length>500||c.containers.length>3)throw new Error('Invalid equipment or container list.');
  const equipment=c.equipment.map(e=>{if(!itemById(e.id)||!Number.isInteger(e.instanceId)||e.instanceId<1||!Number.isInteger(e.containerId)||e.containerId<0)throw new Error('Unknown equipment or invalid inventory instance.');return {instanceId:e.instanceId,id:e.id,containerId:e.containerId,source:e.source==='starter'?'starter':'purchased'};});
  const containers=c.containers.map(cont=>{if(!Number.isInteger(cont.id)||cont.id<0||!['backpack','footlocker',undefined].includes(cont.kind))throw new Error('Invalid container.');return {id:cont.id,name:String(cont.name||'').slice(0,80),kind:cont.kind,ownerInstanceId:cont.ownerInstanceId,stowed:cont.kind==='footlocker'?true:!!cont.stowed};});
  if(containers.filter(c=>c.id===0).length!==1||new Set(containers.map(c=>c.id)).size!==containers.length||new Set(equipment.map(e=>e.instanceId)).size!==equipment.length)throw new Error('Duplicate or missing inventory IDs.');
  if(equipment.some(e=>!containers.some(c=>c.id===e.containerId)))throw new Error('Equipment references a missing container.');
  for(const kind of ['backpack','footlocker']){const owners=equipment.filter(e=>e.id===kind);const corresponding=containers.filter(c=>c.kind===kind);if(owners.length>1||corresponding.length!==owners.length||corresponding.some(c=>!owners.some(e=>e.instanceId===c.ownerInstanceId)))throw new Error(`Invalid ${kind} ownership.`);}
  if(containers.some(c=>c.id!==0&&!['backpack','footlocker'].includes(c.kind)))throw new Error('Unsupported custom container.');
  if(c.equippedArmor!==null&&c.equippedArmor!==undefined&&!equipment.some(e=>e.instanceId===c.equippedArmor&&itemById(e.id).category==='armor'))throw new Error('Invalid equipped armor.');
  if(equipment.some(e=>itemById(e.id).purchasable===false))throw new Error('Character includes equipment that cannot be purchased.');
  if(!Number.isInteger(c.luckMax)||c.luckMax<0||!Number.isInteger(c.luckCurrent)||c.luckCurrent<0||c.luckCurrent>c.luckMax)throw new Error('Invalid Luck.');
  // Validate all imported rules without touching the current character if they fail.
  const saved={name:creation.name,origin:creation.origin,ranks:creation.ranks,skills:creation.skills,perks:creation.perks,equipment:creation.equipment,containers:creation.containers,equippedArmor:creation.equippedArmor,luckMax:creation.luckMax,luckCurrent:creation.luckCurrent};
  Object.assign(creation,{name:String(c.name||'').slice(0,200),origin:origin.id,ranks,skills,perks,equipment,containers,equippedArmor:c.equippedArmor??null,luckMax:c.luckMax,luckCurrent:c.luckCurrent});
  try{if(xpSpent()>effectiveStartingXP()||equipmentCaps()<0||!pyramidValid()||!prerequisitesValid())throw new Error('The character exceeds its XP/Caps allowance or violates Perk rules.');}
  catch(err){Object.assign(creation,saved);throw err;}
  equipmentInstanceCounter=Math.max(0,...equipment.map(e=>e.instanceId));
  equipmentContainerCounter=Math.max(0,...containers.map(c=>c.id));
  creation.currentStep='review';creation.caps=equipmentCaps();
  document.getElementById('name').value=creation.name;
  render();
}
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('builder-content').addEventListener('click',e=>{
    const go=e.target.closest('[data-review-goto]');if(go){creation.currentStep=go.dataset.reviewGoto;render();return;}
    if(e.target.closest('[data-review-export]'))exportCharacterJSON();
    if(e.target.closest('[data-review-copy]'))void copyCharacterJSON();
  });
  document.getElementById('builder-content').addEventListener('change',async e=>{
    if(!e.target.matches('[data-review-file]'))return;
    const input=e.target;const file=input.files?.[0];if(!file)return;
    try{if(file.size>2_000_000)throw new Error('Character file is too large.');await importCharacterJSON(await file.text());const m=document.getElementById('review-file-message');if(m)m.textContent='Character loaded successfully.';}
    catch(error){const m=document.getElementById('review-file-message');if(m)m.textContent=`Load failed: ${error.message}`;}
    input.value='';
  });
});
