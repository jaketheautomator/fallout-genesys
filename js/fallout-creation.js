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

const initialOrigin = FALLOUT_ORIGINS.find(origin => origin.enabled);
if (!initialOrigin) throw new Error('No playable Fallout Origins defined');

const creation = {
  name: '', origin: initialOrigin.id, currentStep: 'origin',
  ranks: { ...initialOrigin.startingRanks },
  luckMax: initialOrigin.luck, luckCurrent: initialOrigin.luck, caps: initialOrigin.startingCaps,
  skills: Object.fromEntries(FALLOUT_SKILLS.map(skill => [skill.id, { tag:'none', purchased:0 }])),
  perks: {}
};

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
const perkView = { search:'', tier:'all', owned:false };
function perkById(id) { return falloutPerks.find(p => p.id === id); }
function perkRank(id) { return creation.perks[id] || 0; }
function perkEffectiveTier(perk, rank) {
  return Math.min(5, perk.tier + (perk.ranked ? rank - 1 : 0));
}
function perkTierCount(tier) {
  return falloutPerks.reduce((sum,p) => {
    for (let r=1; r<=perkRank(p.id); r++) if (perkEffectiveTier(p,r)===tier) sum++;
    return sum;
  }, 0);
}
function perkXpSpent() {
  return falloutPerks.reduce((sum,p) => {
    for(let r=1; r<=perkRank(p.id); r++) sum += 5 * perkEffectiveTier(p,r);
    return sum;
  }, 0);
}
function perkPrerequisitesMet(perk) {
  return perk.prerequisites.every(id => perkRank(id) > 0);
}
function pyramidValid() {
  for (let tier=2; tier<=5; tier++) {
    if (perkTierCount(tier)>0 && perkTierCount(tier)>=perkTierCount(tier-1)) return false;
  }
  return true;
}
function prerequisitesValid() {
  return falloutPerks.every(perk => !perkRank(perk.id) || perkPrerequisitesMet(perk));
}
function changePerk(id, delta) {
  const perk = perkById(id);
  if (!perk || ![1,-1].includes(delta)) return;
  const old = perkRank(id), next = old + delta;
  if (next < 0 || (delta>0 && !perk.ranked && old>0)) return;
  if (delta>0 && !perkPrerequisitesMet(perk)) return;
  creation.perks[id] = next;
  if (!pyramidValid() || !prerequisitesValid() || xpSpent() > effectiveStartingXP()) creation.perks[id] = old;
  render();
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function renderPerks() {
  if (perkDataError) return `<h2>Perks</h2><p class="perk-error">${escapeHtml(perkDataError)}</p>`;
  if (!falloutPerks.length) return '<h2>Perks</h2><p>Loading perks from talents.csv…</p>';
  const filtered=falloutPerks.filter(perk =>
    (perkView.tier==='all' || String(perk.tier)===perkView.tier) &&
    (!perkView.owned || perkRank(perk.id)>0) &&
    `${perk.name} ${perk.description} ${perk.activation}`.toLowerCase().includes(perkView.search.toLowerCase())
  );
  return `<h2>Perks</h2><p>Provisional catalog from <code>data/talents.csv</code>. Perks use the Genesys talent pyramid: higher tiers require more purchases in the tier immediately below. Ranked Perks cost progressively more XP, up to tier 5.</p>
  <div class="perk-toolbar"><label>Search <input type="search" id="perk-search" value="${escapeHtml(perkView.search)}" placeholder="Search Perks"></label><label>Tier <select id="perk-tier"><option value="all">All</option>${[1,2,3,4,5].map(t=>`<option value="${t}" ${perkView.tier===String(t)?'selected':''}>${t}</option>`).join('')}</select></label><label class="perk-owned"><input type="checkbox" id="perk-owned" ${perkView.owned?'checked':''}> Purchased only</label></div>
  <p class="perk-total">Purchased Perks: ${Object.values(creation.perks).reduce((sum,n)=>sum+n,0)} · XP spent on Perks: ${perkXpSpent()}</p>
  <div class="perk-list">${filtered.length?filtered.map(perk=>{
    const owned=perkRank(perk.id),tier=perkEffectiveTier(perk,owned+1), cost=5*tier;
    const unmet=perk.prerequisites.filter(id=>perkRank(id)===0).map(id=>perkById(id)?.name||id);
    const canAdd=perk.ranked||!owned;
    // Use the same rule validation as the mutation path.
    const trial=owned+1; creation.perks[perk.id]=trial;
    const affordable=xpSpent()<=effectiveStartingXP(),valid=pyramidValid()&&prerequisitesValid();
    creation.perks[perk.id]=owned;
    const allowed=canAdd && !unmet.length && affordable && valid;
    let note='';
    if(unmet.length) note=`Requires: ${unmet.join(', ')}`;
    else if(!valid && canAdd) note='Talent pyramid requirement not met';
    else if(!affordable && canAdd) note='Insufficient XP';
    return `<article class="perk-card"><div class="perk-details"><div class="perk-title"><strong>${escapeHtml(perk.name)}</strong><span>Tier ${perk.tier} · ${escapeHtml(perk.activation)}${perk.ranked?' · Ranked':''}</span></div><p>${escapeHtml(perk.description)}</p>${note?`<small class="perk-note">${escapeHtml(note)}</small>`:''}</div><div class="perk-purchase"><span class="perk-rank-label">Rank <strong>${owned}</strong></span><button type="button" data-perk="${escapeHtml(perk.id)}" data-perk-delta="-1" ${!owned?'disabled':''} aria-label="Remove ${escapeHtml(perk.name)}">−</button><button type="button" data-perk="${escapeHtml(perk.id)}" data-perk-delta="1" ${!allowed?'disabled':''} aria-label="Purchase ${escapeHtml(perk.name)}">+</button><small>${canAdd?cost+' XP next':'Maxed'}</small></div></article>`;
  }).join(''):'<p>No Perks match the filters.</p>'}</div>`;
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
    const response=await fetch('data/talents.csv');
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    falloutPerks=parsePerkCsv(await response.text());
  } catch(error) {
    perkDataError='Unable to load data/talents.csv. Serve the builder through a local web server or GitHub Pages; opening index.html directly from disk may block CSV loading.';
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
  return `<h2>Skills</h2><p>Choose Tag skills and Tag+Rank skills. Both are career skills for XP costs; Tag+Rank also grants one free rank. Free ranks from an Origin are included in the total, with a maximum rank of ${MAX_SKILL_RANK}.</p>
    ${['General','Combat','Social','Knowledge'].map(group => `<div class="skill-pick-grid skill-group-header">
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
    }).join('')).join('')}`;
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
    content.innerHTML = `<h2>Origin</h2><p>Choose your character's origin. Origins without defined rules are unavailable until implemented.</p>
      <div class="origin-grid">${FALLOUT_ORIGINS.map(entry => `<button type="button" class="origin-option ${creation.origin === entry.id ? 'selected' : ''}" ${!entry.enabled ? 'disabled title="Origin rules not yet defined"' : ''} data-origin="${entry.id}">${entry.name}<small>${entry.enabled ? entry.summary : 'Coming later'}</small></button>`).join('')}</div>
      <h3>${origin.name}</h3><p>${origin.description}</p>`;
  } else if (creation.currentStep === 'skills') {
    content.innerHTML = renderSkills();
  } else if (creation.currentStep === 'perks') {
    content.innerHTML = renderPerks();
  } else {
    content.innerHTML = `<h2>S.P.E.C.I.A.L.</h2><p>Each rank is a Genesys characteristic. The displayed Fallout score is derived from its rank. Buy higher ranks with starting XP; creation purchases may not exceed rank 5. One characteristic may be reduced to rank 1, adding 20 XP to the starting pool.</p>
      <div class="special-build-list">${FALLOUT_RULES.special.map(s => {
        const rank = creation.ranks[s.id];
        const nextCost = (rank + 1) * 10;
        return `<div class="special-build-row"><div><strong>${s.id.toUpperCase()}</strong><small>${s.name} / ${s.genesys}</small></div>
          <output class="special-score">${FALLOUT_RULES.score[rank]}</output><div class="rank-controls"><button type="button" data-stat="${s.id}" data-delta="-1" ${rank === 1 || (rank === 2 && reducedAlready) ? 'disabled' : ''} aria-label="Decrease ${s.name}">−</button><span>Rank ${rank}</span><button type="button" data-stat="${s.id}" data-delta="1" ${rank === 5 || (rank === 1 ? remaining < FALLOUT_RULES.reducedRankBonusXP : remaining < nextCost) ? 'disabled' : ''} aria-label="Increase ${s.name}">+</button></div></div>`;
      }).join('')}<div class="special-build-row luck-build-row"><div><strong>LCK</strong><small>Luck</small></div><output class="special-score">${creation.luckMax}</output><div class="rank-controls luck-controls"></div></div></div>`;
  }
  document.getElementById('summary-origin').textContent = currentOrigin().name;
  document.getElementById('summary-xp-spent').textContent = xpSpent();
  document.getElementById('summary-xp-remaining').textContent = remaining;
  document.getElementById('summary-caps').textContent = creation.caps.toLocaleString('en-US');
  document.getElementById('summary-name').textContent = creation.name || 'Unnamed Wastelander';
}

document.addEventListener('DOMContentLoaded', () => {
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
        normaliseSkillPurchases();
      }
      render();
      return;
    }
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
    const newSpent = Object.values(newRanks).reduce((sum, rank) => sum + xpForRank(rank), 0) + skillXpSpent();
    if (newSpent > newXP) return;
    creation.ranks[stat] = updated;
    render();
  });
  document.getElementById('builder-content').addEventListener('change', ev => {
    if(ev.target.id==='perk-tier'){perkView.tier=ev.target.value;render();return;}
    if(ev.target.id==='perk-owned'){perkView.owned=ev.target.checked;render();return;}
    const radio = ev.target.closest('input[data-skill-tag]');
    if (radio) changeSkillTag(radio.dataset.skillTag, radio.value);
  });
  document.getElementById('builder-content').addEventListener('input', ev => {
    if(ev.target.id==='perk-search'){const start=ev.target.selectionStart;perkView.search=ev.target.value;render();const next=document.getElementById('perk-search');next?.focus();next?.setSelectionRange(start,start);}
  });
  loadPerks();
  render();
});
