/* Origin data is maintained in data/origins.csv. */
"use strict";
let FALLOUT_ORIGINS = [];
const originsReady = (async () => {
  const response = await fetch('data/origins.csv');
  if (!response.ok) throw new Error(`Unable to load Origins: HTTP ${response.status}`);
  const source = await response.text();
  // Read quoted CSV fields, including JSON arrays and objects containing commas.
  const rows = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i+1] === '"') { value += '"'; i++; }
      else if (c === '"') quoted = false;
      else value += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(value); value = ''; }
    else if (c === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = ''; }
    else value += c;
  }
  if (row.length || value) { row.push(value.replace(/\r$/, '')); rows.push(row); }
  const headers = rows.shift();
  const parsed = rows.filter(r=>r.some(v=>v.trim())).map(r => {
    const entry=Object.fromEntries(headers.map((k,i)=>[k,r[i]??'']));
    for(const k of ['startingXP','startingCaps','luck','tagPicks','tagRankPicks'])
      if(entry[k]!=='' && entry[k]!=null) entry[k]=Number(entry[k]);
    entry.enabled = entry.enabled === 'true';
    for(const k of ['startingRanks','skillBonuses','specialModifiers','abilities','starterEquipment'])
      if(entry[k]) entry[k]=JSON.parse(entry[k]);
    return entry;
  });
  if (!parsed.some(o=>o.enabled)) throw new Error('No playable Origins in origins.csv');
  FALLOUT_ORIGINS = parsed;
  return parsed;
})();
