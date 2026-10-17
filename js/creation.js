/* Fallout Genesys character creation — Origin, SPECIAL and Skills. */
"use strict";

const FALLOUT_RULES = Object.freeze({
  reducedRankBonusXP: 20,
  special: [
    { id: 'str', name: 'Strength', genesys: 'Brawn' },
    { id: 'per', name: 'Perception', genesys: 'Cunning' },
    { id: 'end', name: 'Endurance', genesys: 'Willpower' },
    { id: 'cha', name: 'Charisma', genesys: 'Presence' },
    { id: 'int', name: 'Intelligence', genesys: 'Intellect' },
    { id: 'agi', name: 'Agility', genesys: 'Agility' }
  ],
  score: { 1: 1, 2: 3, 3: 5, 4: 7, 5: 10 }
});

const FALLOUT_SKILLS = Object.freeze([
  { id:'athletics', name:'Athletics', stat:'str', group:'General' },
  { id:'cool', name:'Cool', stat:'cha', group:'General' },
  { id:'explosives', name:'Explosives', stat:'per', group:'General' },
  { id:'lockpick', name:'Lockpick', stat:'per', group:'General' },
  { id:'medicine', name:'Medicine', stat:'int', group:'General' },
  { id:'pilot', name:'Pilot', stat:'per', group:'General' },
  { id:'repair', name:'Repair', stat:'int', group:'General' },
  { id:'science', name:'Science', stat:'int', group:'General' },
  { id:'sneak', name:'Sneak', stat:'agi', group:'General' },
  { id:'survival', name:'Survival', stat:'end', group:'General' },
  { id:'throwing', name:'Throwing', stat:'agi', group:'General' },
  { id:'vigilance', name:'Vigilance', stat:'per', group:'General' },
  { id:'big_guns', name:'Big Guns', stat:'end', group:'Combat' },
  { id:'energy_weapons', name:'Energy Weapons', stat:'per', group:'Combat' },
  { id:'melee_weapons', name:'Melee Weapons', stat:'str', group:'Combat' },
  { id:'small_guns', name:'Small Guns', stat:'agi', group:'Combat' },
  { id:'unarmed', name:'Unarmed', stat:'end', group:'Combat' },
  { id:'barter', name:'Barter', stat:'cha', group:'Social' },
  { id:'leadership', name:'Leadership', stat:'cha', group:'Social' },
  { id:'speech', name:'Speech', stat:'cha', group:'Social' },
  { id:'pre_war_knowledge', name:'Pre-War Knowledge', stat:'int', group:'Knowledge' },
  { id:'wasteland_knowledge', name:'Wasteland Knowledge', stat:'int', group:'Knowledge' }
]);
const MAX_SKILL_RANK = 2;
const DEFAULT_TAG_PICKS = 4;
const DEFAULT_TAG_RANK_PICKS = 4;

let creation;
function initializeCreation() {
  const initialOrigin = FALLOUT_ORIGINS.find(origin => origin.enabled);
  if (!initialOrigin) throw new Error('No playable Origins defined');
  creation = {
    name: '', origin: initialOrigin.id, currentStep: 'origin',
    ranks: { ...initialOrigin.startingRanks },
    luckMax: initialOrigin.luck, luckCurrent: initialOrigin.luck, caps: initialOrigin.startingCaps,
    skills: Object.fromEntries(FALLOUT_SKILLS.map(skill => [skill.id, { tag:'none', purchased:0 }])),
    perks: {}, equipment: [], equippedArmor: null,
    containers: [{ id:0, name:'Pockets', stowed:false }]
  };
}

function currentOrigin() {
  return FALLOUT_ORIGINS.find(origin => origin.id === creation.origin);
}

function xpForRank(rank) {
  let spent = 0;
  for (let r = 3; r <= rank; r++) spent += r * 10;
  return spent;
}
function effectiveStartingXP() {
  return currentOrigin().startingXP + (Object.values(creation.ranks).some(rank => rank === 1) ? FALLOUT_RULES.reducedRankBonusXP : 0);
}
function skillBonus(id) {
  return Number(currentOrigin().skillBonuses?.[id] || 0);
}
function skillRank(id) {
  const selected = creation.skills[id];
  return selected.purchased + skillBonus(id) + (selected.tag === 'tagrank' ? 1 : 0);
}
function skillCostForLevel(level, tagged) {
  return level * 5 + (tagged ? 0 : 5);
}
function skillXpSpent() {
  return FALLOUT_SKILLS.reduce((sum, skill) => {
    const entry = creation.skills[skill.id];
    const free = skillBonus(skill.id) + (entry.tag === 'tagrank' ? 1 : 0);
    for (let i = 1; i <= entry.purchased; i++) {
      sum += skillCostForLevel(i, entry.tag !== 'none');
    }
    return sum;
  }, 0);
}
// Perks are loaded from the existing CSV, not duplicated in JavaScript.
let falloutPerks = [];
let perkDataError = '';
function perkById(id) { return falloutPerks.find(p => p.id === id); }
function perkRank(id) { return creation.perks[id] || 0; }
function perkEffectiveTier(perk, rank) { return Math.min(5, perk.tier + (perk.ranked ? rank - 1 : 0)); }
function perkTierCount(tier) {
  return falloutPerks.reduce((sum, perk) => {
    for (let r=1;r<=perkRank(perk.id);r++) if(perkEffectiveTier(perk,r)===tier) sum++;
    return sum;
  },0);
}
function perkXpSpent() {
  return falloutPerks.reduce((sum, perk) => {
    for (let r=1;r<=perkRank(perk.id);r++) sum += 5 * perkEffectiveTier(perk,r);
    return sum;
  },0);
}
function perkPrerequisitesMet(perk) { return perk.prerequisites.every(id => perkRank(id)>0); }
function pyramidValid() {
  for (let tier=2;tier<=5;tier++) {
    if (perkTierCount(tier)>0 && perkTierCount(tier)>=perkTierCount(tier-1)) return false;
  }
  return true;
}
function prerequisitesValid() { return falloutPerks.every(perk => !perkRank(perk.id)||perkPrerequisitesMet(perk)); }
function canAddPerkAtTier(tier) {
  if(tier===1) return true;
  return perkTierCount(tier-1) > perkTierCount(tier)+1;
}
function canPurchasePerk(id) {
  const perk=perkById(id);
  if(!perk || (!perk.ranked && perkRank(id)) || !perkPrerequisitesMet(perk)) return false;
  const tier=perkEffectiveTier(perk,perkRank(id)+1);
  return canAddPerkAtTier(tier) && 5*tier<=effectiveStartingXP()-xpSpent();
}
function canRemovePerk(id) {
  if(!perkRank(id)) return false;
  creation.perks[id]--;
  const allowed=pyramidValid() && prerequisitesValid();
  creation.perks[id]++;
  return allowed;
}
function changePerk(id,delta) {
  if(delta===1 && !canPurchasePerk(id)) return;
  if(delta===-1 && !canRemovePerk(id)) return;
  creation.perks[id]=(creation.perks[id]||0)+delta;
  render();
}
function perkRankAtTier(perk,tier) {
  for(let rank=1;rank<=perkRank(perk.id);rank++) if(perkEffectiveTier(perk,rank)===tier) return rank;
  return null;
}
function purchasedPerksAtTier(tier) {
  const result=[];
  for(const perk of falloutPerks) for(let rank=1;rank<=perkRank(perk.id);rank++) {
    if(perkEffectiveTier(perk,rank)===tier) result.push({perk,rank});
  }
  return result;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
/* Matches the original ASOIAF Talents page: pyramid, expanded tiers, cards, and Purchased / XP buttons. */
function renderPerks() {
  if(perkDataError) return `<h2>Perks</h2><p class="perk-error">${escapeHtml(perkDataError)}</p>`;
  if(!falloutPerks.length) return '<h2>Perks</h2><p>Loading perks from perks.csv…</p>';
  return `<section class="talents-section"><h2>Perks</h2>
    <p>Purchase Perks using remaining XP. You must have more lower tier Perks to purchase higher Tier Perks. The blank spaces below show which Tiers are legal.</p>
    <div class="talent-pyramid-summary">${[1,2,3,4,5].map(tier => `
      <div class="talent-pyramid-tier"><h3>Tier ${tier}</h3>
      ${purchasedPerksAtTier(tier).map(({perk,rank})=>`<div class="talent-pyramid-slot talent-pyramid-slot-filled">${escapeHtml(perk.name)}${perk.ranked&&rank>1?` (Rank ${rank})`:''}</div>`).join('')}
      ${canAddPerkAtTier(tier)?'<div class="talent-pyramid-slot talent-pyramid-slot-empty"></div>':''}</div>`).join('')}</div>
    ${[1,2,3,4,5].map(tier => {
      const entries=falloutPerks.filter(perk => perkRankAtTier(perk,tier)!==null || perkEffectiveTier(perk,perkRank(perk.id)+1)===tier);
      return `<details class="talent-tier" open><summary class="talent-tier-summary"><span>Tier ${tier}</span><span class="talent-tier-count">${perkTierCount(tier)} Purchased</span></summary>
        ${entries.length?`<div class="talent-list">${entries.map(perk => renderPerkCard(perk,tier)).join('')}</div>`:'<p>No perks available at this tier.</p>'}</details>`;
    }).join('')}</section>`;
}
function renderPerkCard(perk,displayTier) {
  const purchasedRank=perkRankAtTier(perk,displayTier);
  const currentRank=perkRank(perk.id);
  const highestTier=currentRank?perkEffectiveTier(perk,currentRank):null;
  const nextTier=perkEffectiveTier(perk,currentRank+1);
  const canShowPurchase=nextTier===displayTier && (perk.ranked || !currentRank);
  return `<div class="talent-card ${purchasedRank!==null?'talent-card-purchased':''}">
    <h4>${escapeHtml(perk.name)}</h4>
    <div class="talent-metadata">${escapeHtml(perk.activation)}${perk.ranked?' <span>; Ranked</span>':''}</div>
    <p class="talent-description">${escapeHtml(perk.description)}</p>
    ${perk.prerequisites.length?`<p class="talent-prerequisites">Prerequisite: ${escapeHtml(perk.prerequisites.map(id=>perkById(id)?.name||id).join(', '))}</p>`:''}
    <div class="talent-controls">
      ${currentRank>0 && highestTier===displayTier?`<button type="button" data-perk="${escapeHtml(perk.id)}" data-perk-delta="-1" ${!canRemovePerk(perk.id)?'disabled':''}>Purchased</button>`:''}
      ${canShowPurchase?`<button type="button" data-perk="${escapeHtml(perk.id)}" data-perk-delta="1" ${!canPurchasePerk(perk.id)?'disabled':''}>${nextTier*5} XP</button>`:''}
    </div>
  </div>`;
}
function parsePerkCsv(csv) {
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<csv.length;i++) {
    const ch=csv[i];
    if(quoted) { if(ch==='"'&&csv[i+1]==='"'){field+='"';i++;}else if(ch==='"')quoted=false;else field+=ch; }
    else if(ch==='"')quoted=true;
    else if(ch===','){row.push(field);field='';}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&csv[i+1]==='\n')i++;row.push(field);field='';if(row.some(v=>v!==''))rows.push(row);row=[];}
    else field+=ch;
  }
  if(quoted)throw new Error('Unclosed CSV quote');
  if(field||row.length){row.push(field);rows.push(row);}
  const headers=rows.shift();
  if(!headers||!['id','name','tier','activation','ranked','prerequisites','description'].every(h=>headers.includes(h)))throw new Error('Missing CSV columns');
  return rows.map(cells=>{
    const record=Object.fromEntries(headers.map((key,i)=>[key,cells[i]||'']));
    return { id:record.id, name:record.name, tier:Number(record.tier),activation:record.activation, ranked:record.ranked.toLowerCase()==='true',prerequisites:record.prerequisites.split('|').map(p=>p.trim()).filter(Boolean),description:record.description };
  }).filter(p=>p.id&&p.name&&p.tier>=1&&p.tier<=5);
}
async function loadPerks() {
  try {
    const response=await fetch('data/perks.csv');
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    falloutPerks=parsePerkCsv(await response.text());
  } catch(error) {
    perkDataError='Unable to load data/perks.csv. Serve the builder through a local web server or GitHub Pages; opening index.html directly from disk may block CSV loading.';
    console.error('Perk catalog:',error);
  }
  render();
}
function xpSpent() {
  return Object.values(creation.ranks).reduce((sum, rank) => sum + xpForRank(rank), 0) + skillXpSpent() + perkXpSpent();
}
function tagCount(type) {
  return Object.values(creation.skills).filter(s => s.tag === type).length;
}
function picksAvailable(type) {
  return (type === 'tag' ? (currentOrigin().tagPicks ?? DEFAULT_TAG_PICKS) : (currentOrigin().tagRankPicks ?? DEFAULT_TAG_RANK_PICKS)) - tagCount(type);
}
function normaliseSkillPurchases() {
  for (const skill of FALLOUT_SKILLS) {
    const entry = creation.skills[skill.id];
    const free = skillBonus(skill.id) + (entry.tag === 'tagrank' ? 1 : 0);
    entry.purchased = Math.min(entry.purchased, Math.max(0, MAX_SKILL_RANK - free));
  }
}
function changeSkillTag(id, newTag) {
  const entry = creation.skills[id];
  if (!entry || !['none','tag','tagrank'].includes(newTag) || entry.tag === newTag) return;
  if (newTag !== 'none' && picksAvailable(newTag) <= 0) return;
  const previous = entry.tag, previousPurchased = entry.purchased;
  entry.tag = newTag;
  normaliseSkillPurchases();
  if (xpSpent() > effectiveStartingXP()) {
    entry.tag = previous;
    entry.purchased = previousPurchased;
  }
  render();
}
function changeSkillPurchase(id, delta) {
  const entry = creation.skills[id];
  if (!entry) return;
  const next = entry.purchased + delta;
  if (next < 0 || next + skillBonus(id) + (entry.tag === 'tagrank' ? 1 : 0) > MAX_SKILL_RANK) return;
  entry.purchased = next;
  if (xpSpent() > effectiveStartingXP()) entry.purchased -= delta;
  render();
}
function renderSkills() {
  const tagLeft = picksAvailable('tag'), rankLeft = picksAvailable('tagrank');
  return `<h2>Skills</h2><p>Choose skills to Tag and decrease the XP cost of improving. Of these, some will also receive a free rank. Then, use XP to purchase up to Rank 2 in any skills. Non-Tag skills cost 5 more XP each increase.</p>
    <div class="skills-table">${['General','Combat','Social','Knowledge'].map(group => `<div class="skill-pick-grid skill-group-header">
      <h3 class="skill-group-heading">${group}</h3>
      <div class="skill-choice-columns">
        <div class="skill-column-head"><span class="skill-column-label">None</span></div>
        <div class="skill-column-head"><span class="skill-pick-count">${tagLeft} picks<br>left</span><span class="skill-column-label">Tag</span></div>
        <div class="skill-column-head"><span class="skill-pick-count">${rankLeft} picks<br>left</span><span class="skill-column-label">Tag+Rank</span></div>
      </div>
      <div class="skill-right-columns">
        <div class="skill-column-head"><span class="skill-column-label">Rank</span></div>
        <div class="skill-column-head"><span class="skill-column-label">Purchase</span></div>
      </div>
    </div>` + FALLOUT_SKILLS.filter(skill => skill.group === group).map(skill => {
      const state = creation.skills[skill.id], rank = skillRank(skill.id);
      const nextCost = skillCostForLevel(state.purchased + 1, state.tag !== 'none');
      const canAdd = rank < MAX_SKILL_RANK && effectiveStartingXP() - xpSpent() >= nextCost;
      return `<div class="skill-pick-grid skill-pick-row">
        <div class="skill-name"><strong>${skill.name}</strong><small class="skill-stat">${skill.stat.toUpperCase()}</small></div>
        <div class="skill-choice-columns">
          ${[['none','None'],['tag','Tag'],['tagrank','Tag+Rank']].map(([value, label]) => `<label class="skill-radio"><input type="radio" name="tag_${skill.id}" value="${value}" data-skill-tag="${skill.id}" ${state.tag === value ? 'checked' : ''} ${state.tag !== value && value !== 'none' && picksAvailable(value) <= 0 ? 'disabled' : ''}><span class="visually-hidden">${skill.name}: ${label}</span></label>`).join('')}
        </div>
        <div class="skill-right-columns">
          <output class="skill-rank">${rank}</output>
          <div class="skill-purchase"><button type="button" data-skill-purchase="${skill.id}" data-delta="-1" ${state.purchased === 0 ? 'disabled' : ''} aria-label="Reduce purchased ${skill.name} rank">−</button><button type="button" data-skill-purchase="${skill.id}" data-delta="1" ${!canAdd ? 'disabled' : ''} aria-label="Purchase ${skill.name} rank">+</button></div>
        </div>
      </div>`;
    }).join('')).join('')}</div>`;
}
function render() {
  const remaining = effectiveStartingXP() - xpSpent();
  const reducedAlready = Object.values(creation.ranks).some(rank => rank === 1);
  document.querySelectorAll('[data-step]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.step === creation.currentStep);
    btn.setAttribute('aria-current', btn.dataset.step === creation.currentStep ? 'step' : 'false');
  });
  const content = document.getElementById('builder-content');
  if (creation.currentStep === 'origin') {
    const origin = currentOrigin();
    const stats = [ ['str','S'], ['per','P'], ['end','E'], ['cha','C'], ['int','I'], ['agi','A'], ['luck','L'] ];
    const modifierText = stats.map(([id, abbreviation]) => {
      const modifier = Number(origin.specialModifiers?.[id] || 0);
      return `<span>${abbreviation} ${modifier === 0 ? '±0' : `${modifier > 0 ? '+' : ''}${modifier}`}</span>`;
    }).join('');
    const abilities = (origin.abilities || []).map(ability =>
      `<div class="origin-ability"><strong>${ability.name}</strong><div>${ability.description}</div></div>`
    ).join('');
    content.innerHTML = `<h2>Origin</h2><p>Choose your character's origin. This choice will determine your starting SPECIAL, XP, Caps, and abilities.</p>
      <div class="origin-grid">${FALLOUT_ORIGINS.map(entry => `<button type="button" class="origin-option ${creation.origin === entry.id ? 'selected' : ''}" ${!entry.enabled ? 'disabled title="Origin rules not yet defined"' : ''} data-origin="${entry.id}">${entry.name}</button>`).join('')}</div>
      <div class="origin-details"><div class="origin-modifiers">${modifierText}</div>
      <div class="origin-resources"><span>${origin.startingXP ?? 0} XP</span><span>${Number(origin.startingCaps || 0).toLocaleString('en-US')} Caps</span></div>
      <div class="origin-abilities">${abilities}</div></div>`;
  } else if (creation.currentStep === 'skills') {
    content.innerHTML = renderSkills();
  } else if (creation.currentStep === 'perks') {
    content.innerHTML = renderPerks();
  } else if (creation.currentStep === 'equipment') {
    content.innerHTML = renderEquipmentStep();
  } else if (creation.currentStep === 'review') {
    content.innerHTML = renderReview();
  } else {
    content.innerHTML = `<h2>S.P.E.C.I.A.L.</h2><p>The displayed SPECIAL scores are derived from purchasable ranks. Buy higher ranks with starting XP. After character creation, these ranks can no longer be purchased. One characteristic may be reduced to rank 1, adding 20 XP to the starting pool. Luck is determined by origin and cannot be purchased.</p>
      <div class="special-build-list">${FALLOUT_RULES.special.map(s => {
        const rank = creation.ranks[s.id];
        const nextCost = (rank + 1) * 10;
        return `<div class="special-build-row"><div><strong>${s.name}</strong></div>
          <output class="special-score">${FALLOUT_RULES.score[rank]}</output><div class="rank-controls"><button type="button" data-stat="${s.id}" data-delta="-1" ${rank === 1 || (rank === 2 && reducedAlready) ? 'disabled' : ''} aria-label="Decrease ${s.name}">−</button><span>Rank ${rank}</span><button type="button" data-stat="${s.id}" data-delta="1" ${rank === 5 || (rank === 1 ? remaining < FALLOUT_RULES.reducedRankBonusXP : remaining < nextCost) ? 'disabled' : ''} aria-label="Increase ${s.name}">+</button></div></div>`;
      }).join('')}<div class="special-build-row luck-build-row"><div><strong>Luck</strong></div><output class="special-score">${creation.luckMax}</output><div class="rank-controls luck-controls"></div></div></div>`;
  }
  document.getElementById('summary-origin').textContent = currentOrigin().name;
  document.getElementById('summary-xp-spent').textContent = xpSpent();
  document.getElementById('summary-xp-remaining').textContent = remaining;
  creation.caps = equipmentCaps();
  document.getElementById('summary-caps').textContent = creation.caps.toLocaleString('en-US');
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await originsReady; initializeCreation(); } catch (error) {
    console.error(error); document.getElementById('builder-content').textContent = 'Unable to load Origins. Serve this site through a local web server or GitHub Pages.'; return;
  }
  document.querySelectorAll('[data-step]').forEach(btn => btn.addEventListener('click', () => {
    creation.currentStep = btn.dataset.step;
    render();
  }));
  document.getElementById('name').addEventListener('input', ev => {
    creation.name = ev.target.value;
    render();
  });
  document.getElementById('builder-content').addEventListener('click', ev => {
    const originButton = ev.target.closest('button[data-origin]');
    if (originButton && !originButton.disabled) {
      const origin = FALLOUT_ORIGINS.find(entry => entry.id === originButton.dataset.origin && entry.enabled);
      if (origin && origin.id !== creation.origin) {
        creation.origin = origin.id;
        creation.ranks = { ...origin.startingRanks };
        creation.luckMax = origin.luck;
        creation.luckCurrent = origin.luck;
        creation.caps = origin.startingCaps;
        creation.equipment = [];
        creation.equippedArmor = null;
        creation.containers = [{ id: 0, name: "Pockets", stowed: false }];
        normaliseSkillPurchases();
      }
      render();
      return;
    }
    const packageBuy=ev.target.closest('button[data-buy-package]');
    if(packageBuy&&!packageBuy.disabled){buyStarterPackage();return;}
    const equipmentBuy=ev.target.closest('button[data-equipment-buy]');
    if(equipmentBuy&&!equipmentBuy.disabled){buyEquipment(equipmentBuy.dataset.equipmentBuy);return;}
    const equipmentRefund=ev.target.closest('button[data-equipment-refund]');
    if(equipmentRefund){refundEquipment(Number(equipmentRefund.dataset.equipmentRefund));return;}
    const perkButton=ev.target.closest('button[data-perk]');
    if(perkButton && !perkButton.disabled){changePerk(perkButton.dataset.perk,Number(perkButton.dataset.perkDelta));return;}
    const skillPurchase = ev.target.closest('button[data-skill-purchase]');
    if (skillPurchase && !skillPurchase.disabled) {
      changeSkillPurchase(skillPurchase.dataset.skillPurchase, Number(skillPurchase.dataset.delta));
      return;
    }
    const button = ev.target.closest('button[data-stat]');
    if (!button || button.disabled) return;
    const { stat, delta } = button.dataset;
    const updated = creation.ranks[stat] + Number(delta);
    if (updated < 1 || updated > 5) return;
    if (updated === 1 && Object.entries(creation.ranks).some(([id, rank]) => id !== stat && rank === 1)) return;
    const newRanks = { ...creation.ranks, [stat]: updated };
    const newXP = currentOrigin().startingXP + (Object.values(newRanks).some(rank => rank === 1) ? FALLOUT_RULES.reducedRankBonusXP : 0);
    const newSpent = Object.values(newRanks).reduce((sum, rank) => sum + xpForRank(rank), 0) + skillXpSpent() + perkXpSpent();
    if (newSpent > newXP) return;
    creation.ranks[stat] = updated;
    render();
  });
  document.getElementById('builder-content').addEventListener('change', ev => {
    const containerStowed=ev.target.closest('input[data-container-stowed]');
    if(containerStowed){setEquipmentContainerStowed(Number(containerStowed.dataset.containerStowed),containerStowed.checked);return;}
    const itemContainer=ev.target.closest('select[data-item-container]');
    if(itemContainer){moveEquipmentItem(Number(itemContainer.dataset.itemContainer),Number(itemContainer.value));return;}
    const armorSelect=ev.target.closest('select[data-equipment-armor]');
    if(armorSelect){creation.equippedArmor=armorSelect.value?Number(armorSelect.value):null;rerenderEquipment();return;}
    const radio = ev.target.closest('input[data-skill-tag]');
    if (radio) changeSkillTag(radio.dataset.skillTag, radio.value);
  });
  document.getElementById('builder-content').addEventListener('toggle',ev=>{const details=ev.target.closest('details[data-equipment-details]');if(!details)return;const set=details.dataset.category==='1'?equipmentUI.openCategories:equipmentUI.openPanels;details.open?set.add(details.dataset.equipmentDetails):set.delete(details.dataset.equipmentDetails);},true);
  loadPerks();
  loadFalloutEquipment();
  render();
});
