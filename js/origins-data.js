/* Fallout Genesys origin definitions. Add and revise origins here, not in the UI. */
"use strict";

const FALLOUT_ORIGINS = Object.freeze([
  {
    id: 'survivor', name: 'Survivor', enabled: true,
    startingXP: 110, startingCaps: 1000,
    startingRanks: { str: 2, per: 2, end: 2, cha: 2, int: 2, agi: 2 },
    luck: 5,
    tagPicks: 5, tagRankPicks: 4, skillBonuses: {},
    // Provisional catalog IDs. Define these per Origin as the Fallout catalog is developed.
    starterEquipment: {
      armor: 'gambeson', fallbackSkill: 'small_guns',
      weapons: {
        big_guns: 'sword', energy_weapons: 'sword', melee_weapons: 'sword',
        small_guns: 'sword', unarmed: 'sword', throwing: 'sword'
      },
      taggedSkillItems: {} // Future gear choices keyed by noncombat tagged skill ID.
    },
    description: 'Six mechanical characteristics begin at rank 2 (displayed SPECIAL score 3). The Survivor starts with 110 XP.',
    summary: '110 XP · All ranks 2'
  },
  { id: 'vault-dweller', name: 'Vault Dweller', enabled: false },
  { id: 'ghoul', name: 'Ghoul', enabled: false },
  { id: 'super-mutant', name: 'Super Mutant', enabled: false },
  { id: 'mister-handy', name: 'Mister Handy', enabled: false },
  { id: 'robobrain', name: 'Robobrain', enabled: false },
  { id: 'brotherhood-initiate', name: 'Brotherhood Initiate', enabled: false },
  { id: 'child-of-atom', name: 'Child of Atom', enabled: false },
  { id: 'tribal', name: 'Tribal', enabled: false },
  { id: 'enclave-remnant', name: 'Enclave Remnant', enabled: false }
]);
