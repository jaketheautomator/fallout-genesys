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
  skills: Object.fromEntries(FALLOUT_SKILLS.map(skill => [skill.id, { tag:'none', purchased:0 }]))
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
function xpSpent() {
  return Object.values(creation.ranks).reduce((sum, rank) => sum + xpForRank(rank), 0) + skillXpSpent();
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
    const radio = ev.target.closest('input[data-skill-tag]');
    if (radio) changeSkillTag(radio.dataset.skillTag, radio.value);
  });
  render();
});
