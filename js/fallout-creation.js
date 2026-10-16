/* Fallout Genesys character creation — first pass: Origin and SPECIAL. */
"use strict";

const FALLOUT_RULES = Object.freeze({
  origins: [
    'Survivor', 'Vault Dweller', 'Ghoul', 'Super Mutant', 'Mister Handy',
    'Robobrain', 'Brotherhood Initiate', 'Child of Atom', 'Tribal', 'Enclave Remnant'
  ],
  startingXP: 110,
  startingCaps: 1000,
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

const creation = {
  name: '', origin: 'Survivor', currentStep: 'origin',
  ranks: Object.fromEntries(FALLOUT_RULES.special.map(s => [s.id, 2])),
  luckMax: 5, luckCurrent: 5, caps: FALLOUT_RULES.startingCaps
};

function xpForRank(rank) {
  let spent = 0;
  for (let r = 3; r <= rank; r++) spent += r * 10;
  return spent;
}
function effectiveStartingXP() {
  return FALLOUT_RULES.startingXP + (Object.values(creation.ranks).some(rank => rank === 1) ? FALLOUT_RULES.reducedRankBonusXP : 0);
}
function xpSpent() {
  return Object.values(creation.ranks).reduce((sum, rank) => sum + xpForRank(rank), 0);
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
    content.innerHTML = `<h2>Origin</h2><p>Choose your character's origin. Survivor is the first implemented rules package; other origins are listed but unavailable until defined.</p>
      <div class="origin-grid">${FALLOUT_RULES.origins.map(name => `<button type="button" class="origin-option ${creation.origin === name ? 'selected' : ''}" ${name !== 'Survivor' ? 'disabled title="Origin rules not yet defined"' : ''} data-origin="${name}">${name}${name !== 'Survivor' ? '<small>Coming later</small>' : '<small>110 XP · All ranks 2</small>'}</button>`).join('')}</div>
      <h3>Survivor</h3><p>Six mechanical characteristics begin at rank 2 (displayed SPECIAL score 3). The Survivor starts with 110 XP. Other origin features will be added as creation advances.</p>`;
  } else {
    content.innerHTML = `<h2>S.P.E.C.I.A.L.</h2><p>Each rank is a Genesys characteristic. The displayed Fallout score is derived from its rank. Buy higher ranks with starting XP; creation purchases may not exceed rank 5. One characteristic may be reduced to rank 1, adding 20 XP to the starting pool.</p>
      <div class="special-build-list">${FALLOUT_RULES.special.map(s => {
        const rank = creation.ranks[s.id];
        const nextCost = (rank + 1) * 10;
        return `<div class="special-build-row"><div><strong>${s.id.toUpperCase()}</strong><small>${s.name} / ${s.genesys}</small></div>
          <output class="special-score">${FALLOUT_RULES.score[rank]}</output><div class="rank-controls"><button type="button" data-stat="${s.id}" data-delta="-1" ${rank === 1 || (rank === 2 && reducedAlready) ? 'disabled' : ''} aria-label="Decrease ${s.name}">−</button><span>Rank ${rank}</span><button type="button" data-stat="${s.id}" data-delta="1" ${rank === 5 || (rank === 1 ? remaining < FALLOUT_RULES.reducedRankBonusXP : remaining < nextCost) ? 'disabled' : ''} aria-label="Increase ${s.name}">+</button></div></div>`;
      }).join('')}<div class="special-build-row luck-build-row"><div><strong>LCK</strong><small>Luck</small></div><output class="special-score">${creation.luckMax}</output><div class="rank-controls luck-controls"></div></div></div>`;
  }
  document.getElementById('summary-origin').textContent = creation.origin;
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
    const button = ev.target.closest('button[data-stat]');
    if (!button || button.disabled) return;
    const { stat, delta } = button.dataset;
    const updated = creation.ranks[stat] + Number(delta);
    if (updated < 1 || updated > 5) return;
    if (updated === 1 && Object.entries(creation.ranks).some(([id, rank]) => id !== stat && rank === 1)) return;
    const newRanks = { ...creation.ranks, [stat]: updated };
    const newXP = FALLOUT_RULES.startingXP + (Object.values(newRanks).some(rank => rank === 1) ? FALLOUT_RULES.reducedRankBonusXP : 0);
    const newSpent = Object.values(newRanks).reduce((sum, rank) => sum + xpForRank(rank), 0);
    if (newSpent > newXP) return;
    creation.ranks[stat] = updated;
    render();
  });
  render();
});
