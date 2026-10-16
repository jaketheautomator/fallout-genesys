/*
 * ASOIAF Genesys Character Builder
 * data.js
 *
 * Static game data only.
 * Application logic belongs in character.js and app.js.
 */

"use strict";

const GAME_DATA = {

    // ============================================================
    // CHARACTER CREATION
    // ============================================================

    characterCreation: {
        startingXP: 110,
        startingObligation: 10,
        startingWealth: 1000,

        characteristicMinimum: 1,
        characteristicStartingValue: 2,
        characteristicMaximumAtCreation: 5,

        weakness: {
            allowed: true,
            maximumReductions: 1,
            reduction: 1,
            bonusXP: 20
        },

        startingCareerSkillRanks: 4,

        background: {
            skillChoices: 2,
            startingRank: 1,
            mustBeNonCareer: true,
            mustBeDifferent: true
        },

        obligation: {
            normalMaximumIncrease: 10,
            soloMaximumIncrease: 30,

            options: [
                {
                    obligation: 5,
                    xp: 5,
                    wealth: 1000
                },
                {
                    obligation: 10,
                    xp: 10,
                    wealth: 2500
                }
            ],

            xpRestrictions: {
                characteristics: false,
                skills: true,
                talents: true
            }
        }
    },

    // ============================================================
    // OBLIGATION TYPES
    // ============================================================

    obligationTypes: [
    {
        id: "addiction",
        name: "Addiction"
    },
    {
        id: "betrayal",
        name: "Betrayal"
    },
    {
        id: "blackmail",
        name: "Blackmail"
    },
    {
        id: "bounty",
        name: "Bounty"
    },
    {
        id: "criminal",
        name: "Criminal"
    },
    {
        id: "debt",
        name: "Debt"
    },
    {
        id: "dutybound",
        name: "Dutybound"
    },
    {
        id: "family",
        name: "Family"
    },
    {
        id: "favor",
        name: "Favor"
    },
    {
        id: "oath",
        name: "Oath"
    },
    {
        id: "obsession",
        name: "Obsession"
    },
    {
        id: "responsibility",
        name: "Responsibility"
    }
],

    // ============================================================
    // CHARACTERISTICS
    // ============================================================

    characteristics: [
        {
            id: "brawn",
            name: "Brawn"
        },
        {
            id: "agility",
            name: "Agility"
        },
        {
            id: "intellect",
            name: "Intellect"
        },
        {
            id: "cunning",
            name: "Cunning"
        },
        {
            id: "willpower",
            name: "Willpower"
        },
        {
            id: "presence",
            name: "Presence"
        }
    ],


    // ============================================================
    // THRESHOLD PROFILES
    // ============================================================

    thresholdProfiles: [
        {
            id: "balanced",
            name: "Balanced",
            woundBase: 10,
            woundCharacteristic: "brawn",
            strainBase: 10,
            strainCharacteristic: "willpower"
        },
        {
            id: "hardy",
            name: "Hardy",
            woundBase: 12,
            woundCharacteristic: "brawn",
            strainBase: 8,
            strainCharacteristic: "willpower"
        },
        {
            id: "resolute",
            name: "Resolute",
            woundBase: 8,
            woundCharacteristic: "brawn",
            strainBase: 12,
            strainCharacteristic: "willpower"
        }
    ],


    // ============================================================
    // SKILLS
    // ============================================================

    skills: [

        // General Skills

        {
            id: "athletics",
            name: "Athletics",
            category: "General",
            characteristic: "brawn"
        },
        {
            id: "cool",
            name: "Cool",
            category: "General",
            characteristic: "presence"
        },
        {
            id: "coordination",
            name: "Coordination",
            category: "General",
            characteristic: "agility"
        },
        {
            id: "discipline",
            name: "Discipline",
            category: "General",
            characteristic: "willpower"
        },
        {
            id: "masonry",
            name: "Masonry",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "medicine",
            name: "Medicine",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "navigation",
            name: "Navigation",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "perception",
            name: "Perception",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "resilience",
            name: "Resilience",
            category: "General",
            characteristic: "brawn"
        },
        {
            id: "riding",
            name: "Riding",
            category: "General",
            characteristic: "agility"
        },
        {
            id: "sailing",
            name: "Sailing",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "skulduggery",
            name: "Skulduggery",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "smithing",
            name: "Smithing",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "stealth",
            name: "Stealth",
            category: "General",
            characteristic: "agility"
        },
        {
            id: "streetwise",
            name: "Streetwise",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "survival",
            name: "Survival",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "vigilance",
            name: "Vigilance",
            category: "General",
            characteristic: "willpower"
        },
        {
            id: "warfare",
            name: "Warfare",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "woodworking",
            name: "Woodworking",
            category: "General",
            characteristic: "intellect"
        },

        // Combat Skills

        {
            id: "brawl",
            name: "Brawl",
            category: "Combat",
            characteristic: "brawn"
        },
        {
            id: "melee-heavy",
            name: "Melee (Heavy)",
            category: "Combat",
            characteristic: "brawn"
        },
        {
            id: "melee-light",
            name: "Melee (Light)",
            category: "Combat",
            characteristic: "brawn"
        },
        {
            id: "ranged",
            name: "Ranged",
            category: "Combat",
            characteristic: "agility"
        },
        {
            id: "siege-weapons",
            name: "Siege Weapons",
            category: "Combat",
            characteristic: "intellect"
        },

        // Social Skills

        {
            id: "charm",
            name: "Charm",
            category: "Social",
            characteristic: "presence"
        },
        {
            id: "coercion",
            name: "Coercion",
            category: "Social",
            characteristic: "willpower"
        },
        {
            id: "deception",
            name: "Deception",
            category: "Social",
            characteristic: "cunning"
        },
        {
            id: "leadership",
            name: "Leadership",
            category: "Social",
            characteristic: "presence"
        },
        {
            id: "negotiation",
            name: "Negotiation",
            category: "Social",
            characteristic: "presence"
        },

        // Knowledge Skills

        {
            id: "history",
            name: "History",
            category: "Knowledge",
            characteristic: "intellect"
        },
        {
            id: "religion",
            name: "Religion",
            category: "Knowledge",
            characteristic: "intellect"
        },
        {
            id: "society",
            name: "Society",
            category: "Knowledge",
            characteristic: "intellect"
        }
    ],


    
    // ============================================================
    // TALENTS
    // ============================================================

    talents: [

    // ============================================================
    // TIER 1
    // ============================================================

    {
        id: "bought-info",
        name: "Bought Info",
        tier: 1,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Instead of making a Knowledge check, spend 100 silver stags times the difficulty of the check to automatically succeed with one net Success. The GM may disallow this when the information is unavailable, especially sensitive, or cannot reasonably be purchased."
    },

    {
        id: "clever-retort",
        name: "Clever Retort",
        tier: 1,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per encounter, add two automatic Threat to another character's social skill check."
    },

    {
        id: "desperate-recovery",
        name: "Desperate Recovery",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "When recovering strain at the end of an encounter, if your current strain exceeds half your strain threshold, recover 2 additional strain."
    },

    {
        id: "duelist",
        name: "Duelist",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "Add one Boost die to melee combat checks while engaged with a single opponent. Add one Setback die to melee combat checks while engaged with three or more opponents."
    },

    {
        id: "durable",
        name: "Durable",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Reduce Critical Injury results you suffer by 10 per rank of Durable, to a minimum result of 01."
    },

    {
        id: "forager",
        name: "Forager",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "Remove up to two Setback dice from checks to find food, water, or shelter. Foraging and area-search checks take half the normal time."
    },

    {
        id: "grit",
        name: "Grit",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Increase your strain threshold by 1 per rank."
    },

    {
        id: "hamstring-shot",
        name: "Hamstring Shot",
        tier: 1,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round, make a ranged combat check against a non-vehicle target. On a successful hit, halve the attack's damage before soak and immobilize the target until the end of its next turn."
    },

    {
        id: "jump-up",
        name: "Jump Up",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round on your turn, stand from a prone or seated position as an incidental."
    },

    {
        id: "knack-for-it",
        name: "Knack for It",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "When first purchased, choose one non-combat skill and remove two Setback dice from checks using it. Each additional rank adds two more eligible skills."
    },

    {
        id: "know-somebody",
        name: "Know Somebody",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per session when purchasing a legally available item, reduce its rarity by 1 per rank of Know Somebody."
    },

    {
        id: "lets-ride",
        name: "Let's Ride",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round on your turn, mount or dismount an animal, or change position on a mount or vehicle, as an incidental. You also suffer no damage from a short-range fall from a mount or vehicle and land on your feet."
    },

    {
        id: "one-with-nature",
        name: "One with Nature",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "While in the wilderness, you may make a Simple Survival check instead of Discipline or Cool when recovering strain at the end of an encounter."
    },

    {
        id: "parry",
        name: "Parry",
        tier: 1,
        activation: "Active (Incidental, Out of Turn)",
        ranked: true,
        prerequisites: [],
        description:
            "When hit by a melee combat check while wielding a melee weapon, suffer 3 strain before applying soak to reduce the hit's damage by 2 plus your ranks in Parry. May be used once per hit."
    },

    {
        id: "proper-upbringing",
        name: "Proper Upbringing",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: true,
        prerequisites: [],
        description:
            "When making a social skill check in polite company, suffer strain up to your ranks in Proper Upbringing to add an equal number of automatic Advantage to the check."
    },

    {
        id: "quick-draw",
        name: "Quick Draw",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round on your turn, draw or holster an easily accessible weapon or item as an incidental. Reduce a weapon's Prepare rating by 1, to a minimum of 1."
    },

    {
        id: "quick-strike",
        name: "Quick Strike",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Add one Boost die per rank to combat checks against targets that have not yet taken their turn in the current encounter."
    },

    {
        id: "rapid-reaction",
        name: "Rapid Reaction",
        tier: 1,
        activation: "Active (Incidental, Out of Turn)",
        ranked: true,
        prerequisites: [],
        description:
            "When making a Cool or Vigilance check for initiative, suffer strain up to your ranks in Rapid Reaction to add an equal number of automatic Successes."
    },

    {
        id: "second-wind",
        name: "Second Wind",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per encounter, recover strain equal to your ranks in Second Wind."
    },

    {
        id: "surgeon",
        name: "Surgeon",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "When you make a Medicine check to heal wounds, the target heals 1 additional wound per rank of Surgeon."
    },

    {
        id: "swift",
        name: "Swift",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "Ignore movement penalties from difficult terrain."
    },

    {
        id: "toughened",
        name: "Toughened",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Increase your wound threshold by 2 per rank."
    },

    {
        id: "unremarkable",
        name: "Unremarkable",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "Other characters add one Setback die to checks made to find or identify you in a crowd."
    },

    {
        id: "apothecary",
        name: "Apothecary",
        tier: 1,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "A patient under your care heals 2 additional wounds per rank of Apothecary whenever they heal wounds through natural rest."
    },

    {
        id: "bullrush",
        name: "Bullrush",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "After using a maneuver to engage a target and making a Brawl, Melee (Light), or Melee (Heavy) attack, spend 3 Advantage or a Triumph to knock the target prone and move it up to one range band away."
    },

    {
        id: "challenge",
        name: "Challenge!",
        tier: 1,
        activation: "Active (Maneuver)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per encounter, choose adversaries within short range up to your ranks in Challenge! Until the encounter ends or you are incapacitated, those adversaries add one Boost die when attacking you and two Setback dice when attacking other characters."
    },

    {
        id: "finesse",
        name: "Finesse",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "When making a Brawl or Melee (Light) check, you may use Agility instead of Brawn. Melee damage is still based on Brawn."
    },

    {
        id: "painful-blow",
        name: "Painful Blow",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Before making a combat check, increase its difficulty once. If the attack inflicts at least one wound, the target suffers 2 strain whenever it performs a maneuver for the remainder of the encounter."
    },

    {
        id: "shield-slam",
        name: "Shield Slam",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "When attacking a minion or rival with a shield, spend 4 Advantage or a Triumph to stagger the target until the end of its next turn."
    },

    {
        id: "tavern-brawler",
        name: "Tavern Brawler",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "Add one automatic Advantage to Brawl combat checks and combat checks made with improvised weapons."
    },

    {
        id: "tumble",
        name: "Tumble",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round on your turn, suffer 2 strain to disengage from all adversaries with whom you are engaged."
    },

    {
        id: "lightning-draw",
        name: "Lightning Draw",
        tier: 1,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "The first time you draw a Melee (Light) or Melee (Heavy) weapon during an encounter, increase that weapon's base damage by 2 until the end of your current turn."
    },

    {
        id: "grapple",
        name: "Grapple",
        tier: 1,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Suffer 2 strain to use this talent. Until the start of your next turn, enemies must spend two maneuvers instead of one to disengage from you."
    },


    // ============================================================
    // TIER 2
    // ============================================================

    {
        id: "berserk",
        name: "Berserk",
        tier: 2,
        activation: "Active (Maneuver)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per encounter, enter a berserk state until the encounter ends or you are incapacitated. Add one automatic Success and two automatic Advantage to your melee combat checks, but opponents add one automatic Success to combat checks targeting you. You cannot make ranged combat checks while berserk and suffer 6 strain when the effect ends."
    },

    {
        id: "coordinated-assault",
        name: "Coordinated Assault",
        tier: 2,
        activation: "Active (Maneuver)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per turn, choose allies up to your Leadership ranks. Eligible allies add one automatic Advantage to combat checks until the end of your next turn. At first rank they must be engaged with you; the range increases by one band for each additional rank."
    },

    {
        id: "counteroffer",
        name: "Counteroffer",
        tier: 2,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per session, target a non-nemesis adversary within medium range with an opposed Negotiation versus Discipline check. On success, stagger the target until the end of its next turn. At the GM's discretion, a Triumph may temporarily turn the target into an ally."
    },

    {
        id: "defensive-stance",
        name: "Defensive Stance",
        tier: 2,
        activation: "Active (Maneuver)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per round, suffer strain up to your ranks in Defensive Stance. Until the end of your next turn, upgrade the difficulty of melee combat checks targeting you once per strain suffered."
    },

    {
        id: "dual-wielder",
        name: "Dual Wielder",
        tier: 2,
        activation: "Active (Maneuver)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round, use a maneuver to decrease the difficulty of the next combined two-weapon combat check you make during the same turn by one."
    },

    {
        id: "heightened-awareness",
        name: "Heightened Awareness",
        tier: 2,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "Allies within short range add one Boost die to Perception and Vigilance checks. Allies engaged with you add two Boost dice instead."
    },

    {
        id: "inspiring-rhetoric",
        name: "Inspiring Rhetoric",
        tier: 2,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Make an Average Leadership check. Each net Success allows one ally within short range to recover 1 strain, and each Advantage allows one affected ally to recover 1 additional strain."
    },

    {
        id: "innovator",
        name: "Innovator",
        tier: 2,
        activation: "Active (Incidental)",
        ranked: true,
        prerequisites: [],
        description:
            "When constructing new items or modifying existing ones, add one Boost die per rank of Innovator. You may also attempt to reconstruct devices or items you have heard described even without having seen them or possessing plans."
    },

    {
        id: "lucky-strike",
        name: "Lucky Strike",
        tier: 2,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Choose one characteristic when purchasing this talent. After a successful combat check, spend a Story Point to add damage equal to that characteristic's rating to one hit."
    },

    {
        id: "scathing-tirade",
        name: "Scathing Tirade",
        tier: 2,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Make an Average Coercion check. Each net Success causes one enemy within short range to suffer 1 strain, and each Advantage causes one affected enemy to suffer 1 additional strain."
    },

    {
        id: "side-step",
        name: "Side Step",
        tier: 2,
        activation: "Active (Maneuver)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per round, suffer strain up to your ranks in Side Step. Until the end of your next turn, upgrade the difficulty of ranged combat checks targeting you once per strain suffered."
    },

    {
        id: "block",
        name: "Block",
        tier: 2,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: ["parry"],
        description:
            "While wielding a shield, you may use Parry to reduce damage from ranged attacks targeting you as well as melee attacks."
    },

    {
        id: "bulwark",
        name: "Bulwark",
        tier: 2,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: ["parry"],
        description:
            "While wielding a weapon with the Defensive quality, you may use Parry to reduce the damage of an attack targeting an engaged ally."
    },

    {
        id: "dirty-tricks",
        name: "Dirty Tricks",
        tier: 2,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "After you inflict a Critical Injury on an adversary, upgrade the difficulty of that adversary's next check once."
    },

    {
        id: "exploit-armor",
        name: "Exploit Armor",
        tier: 2,
        activation: "Passive",
        ranked: false,
        prerequisites: ["grapple"],
        description:
            "Against an adversary currently affected by your Grapple talent, your Brawl and Melee (Light) attacks ignore Soak provided by worn armor."
    },

    {
        id: "heroic-recovery",
        name: "Heroic Recovery",
        tier: 2,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Choose one characteristic when purchasing this talent. Once per encounter, spend a Story Point to recover strain equal to the rating of that characteristic."
    },

    {
        id: "impaling-strike",
        name: "Impaling Strike",
        tier: 2,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "When you inflict a Critical Injury with any melee weapon, you may also immobilize the target until the end of its next turn."
    },

    {
        id: "reckless-charge",
        name: "Reckless Charge",
        tier: 2,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "When an attack qualifies as a Charge under the Charge rules, add two automatic Advantage and two automatic Threat to the attack."
    },

    {
        id: "threaten",
        name: "Threaten",
        tier: 2,
        activation: "Active (Incidental, Out of Turn)",
        ranked: true,
        prerequisites: [],
        description:
            "After an adversary within range damages one of your allies, suffer 3 strain to inflict strain on that adversary equal to your ranks in Coercion. The initial range is short and increases by one range band for each rank of Threaten beyond the first."
    },


    // ============================================================
    // TIER 3
    // ============================================================

    {
        id: "animal-companion",
        name: "Animal Companion",
        tier: 3,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Bond with an animal approved by the GM. The first rank allows a silhouette 0 companion. Once per round, spend a maneuver to direct the companion to perform one action and one maneuver. Each additional rank increases the maximum companion silhouette by 1."
    },

    {
        id: "dodge",
        name: "Dodge",
        tier: 3,
        activation: "Active (Incidental, Out of Turn)",
        ranked: true,
        prerequisites: [],
        description:
            "When targeted by a combat check, suffer strain up to your ranks in Dodge to upgrade the difficulty of that check an equal number of times."
    },

    {
        id: "eagle-eyes",
        name: "Eagle Eyes",
        tier: 3,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per encounter before making a ranged combat check, increase the weapon's range by one range band for that check, to a maximum of extreme range."
    },

    {
        id: "field-commander",
        name: "Field Commander",
        tier: 3,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Make an Average Leadership check. On success, a number of allies up to your Presence may each suffer 1 strain to immediately perform one out-of-turn maneuver."
    },

    {
        id: "inspiring-rhetoric-improved",
        name: "Inspiring Rhetoric (Improved)",
        tier: 3,
        activation: "Passive",
        ranked: false,
        prerequisites: ["inspiring-rhetoric"],
        description:
            "Allies affected by your Inspiring Rhetoric add one Boost die to all skill checks for a number of rounds equal to your ranks in Leadership."
    },

    {
        id: "natural",
        name: "Natural",
        tier: 3,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Choose two skills when purchasing this talent. Once per session, reroll one check made using either chosen skill."
    },

    {
        id: "painkiller-specialization",
        name: "Painkiller Specialization",
        tier: 3,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Whenever painkillers or their setting-equivalent heal wounds, the target heals 1 additional wound per rank. Normal limits on repeated doses still apply."
    },

    {
        id: "parry-improved",
        name: "Parry (Improved)",
        tier: 3,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: ["parry"],
        description:
            "After using Parry against a melee hit, spend a Despair or three Threat from the attacker's check to automatically hit the attacker once with Brawl or a wielded melee weapon. The hit deals base damage plus applicable bonuses. This cannot be used if the original attack incapacitates you."
    },

    {
        id: "rapid-archery",
        name: "Rapid Archery",
        tier: 3,
        activation: "Active (Maneuver)",
        ranked: false,
        prerequisites: [],
        description:
            "While armed with a bow, suffer 2 strain. During your next ranged combat check this turn, the bow gains Linked with a rating equal to your ranks in Ranged."
    },

    {
        id: "scathing-tirade-improved",
        name: "Scathing Tirade (Improved)",
        tier: 3,
        activation: "Passive",
        ranked: false,
        prerequisites: ["scathing-tirade"],
        description:
            "Enemies affected by your Scathing Tirade add one Setback die to all skill checks for a number of rounds equal to your ranks in Coercion."
    },

    {
        id: "backstab",
        name: "Backstab",
        tier: 3,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Attack an unaware adversary with a Melee (Light) weapon using Skulduggery instead of Melee (Light). If successful, each net Success adds 2 damage rather than the normal 1."
    },

    {
        id: "body-guard",
        name: "Body Guard",
        tier: 3,
        activation: "Active (Maneuver)",
        ranked: true,
        prerequisites: [],
        description:
            "Once per round, suffer strain up to your ranks in Body Guard and choose an engaged ally. Until the end of your next turn, upgrade the difficulty of combat checks targeting that ally once per strain suffered."
    },

    {
        id: "cavalier",
        name: "Cavalier",
        tier: 3,
        activation: "Active (Maneuver)",
        ranked: false,
        prerequisites: [],
        description:
            "While riding a battle-trained mount, once per round use a maneuver to direct the mount to perform an action."
    },

    {
        id: "counterattack",
        name: "Counterattack",
        tier: 3,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: ["parry-improved"],
        description:
            "When Improved Parry causes you to automatically hit an attacker, you may also activate one item quality of the weapon used as though you had generated the Advantage normally required to activate that quality."
    },

    {
        id: "dual-strike",
        name: "Dual Strike",
        tier: 3,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "When resolving a combined melee attack with two weapons, suffer 2 strain to hit with the secondary weapon without spending the Advantage normally required to trigger the second hit."
    },

    {
        id: "easy-prey",
        name: "Easy Prey",
        tier: 3,
        activation: "Active (Maneuver)",
        ranked: false,
        prerequisites: [],
        description:
            "Suffer 3 strain. Until the start of your next turn, you and allies within short range add two Boost dice to combat checks against immobilized targets."
    },

    {
        id: "precise-archery",
        name: "Precise Archery",
        tier: 3,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "When making a Ranged combat check against a target engaged with one of your allies, downgrade the difficulty once, negating the normal penalty for firing at an engaged target."
    },

    {
        id: "find-the-gap",
        name: "Find the Gap",
        tier: 3,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "When making an unarmed Brawl check against a living opponent, you may deal strain damage instead of wound damage and add your ranks in Medicine to the strain damage inflicted."
    },


    // ============================================================
    // TIER 4
    // ============================================================

    {
        id: "cant-we-talk-about-this",
        name: "Can't We Talk About This?",
        tier: 4,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Make an opposed Charm or Deception versus Discipline check against one non-nemesis adversary within medium range. On success, the target cannot attack or take hostile action against you until the end of its next turn. Two Advantage can extend the effect by one turn, and a Triumph can extend it to the target's identified allies within short range. The effect ends if you or a known ally attacks the target."
    },

    {
        id: "deadeye",
        name: "Deadeye",
        tier: 4,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "After inflicting and rolling a Critical Injury with a ranged weapon, suffer 2 strain to replace the rolled Critical Injury with another Critical Injury of the same severity."
    },

    {
        id: "defensive",
        name: "Defensive",
        tier: 4,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Increase both melee defense and ranged defense by 1 per rank."
    },

    {
        id: "enduring",
        name: "Enduring",
        tier: 4,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Increase soak by 1 per rank."
    },

    {
        id: "field-commander-improved",
        name: "Field Commander (Improved)",
        tier: 4,
        activation: "Passive",
        ranked: false,
        prerequisites: ["field-commander"],
        description:
            "Field Commander may affect allies equal to twice your Presence. A Triumph on the Leadership check may allow one affected ally to suffer 1 strain and perform an action instead of a maneuver."
    },

    {
        id: "inspiring-rhetoric-supreme",
        name: "Inspiring Rhetoric (Supreme)",
        tier: 4,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: ["inspiring-rhetoric"],
        description:
            "Suffer 1 strain to use Inspiring Rhetoric as a maneuver instead of an action."
    },

    {
        id: "scathing-tirade-supreme",
        name: "Scathing Tirade (Supreme)",
        tier: 4,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: ["scathing-tirade"],
        description:
            "Suffer 1 strain to use Scathing Tirade as a maneuver instead of an action."
    },

    {
        id: "back-to-back",
        name: "Back-to-Back",
        tier: 4,
        activation: "Passive",
        ranked: false,
        prerequisites: [],
        description:
            "While engaged with one or more allies, you and those allies add one Boost die to combat checks. If an engaged ally also has Back-to-Back, the effects stack to a maximum of two Boost dice."
    },

    {
        id: "unrelenting",
        name: "Unrelenting",
        tier: 4,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round after resolving a successful Brawl, Melee (Light), or Melee (Heavy) attack, suffer 4 strain to immediately make another melee attack against the same target. Increase the second attack's difficulty once if using a second weapon, or twice if using the same weapon."
    },


    // ============================================================
    // TIER 5
    // ============================================================

    {
        id: "dedication",
        name: "Dedication",
        tier: 5,
        activation: "Passive",
        ranked: true,
        prerequisites: [],
        description:
            "Increase one characteristic by 1 per rank, to a maximum of 5. The same characteristic cannot be increased by Dedication more than once."
    },

    {
        id: "indomitable",
        name: "Indomitable",
        tier: 5,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per encounter, when exceeding your wound or strain threshold would incapacitate you, spend a Story Point to delay incapacitation until the end of your next turn. If you reduce the relevant wounds or strain below the threshold before then, you remain conscious."
    },

    {
        id: "master",
        name: "Master",
        tier: 5,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Choose one skill when purchasing this talent. Once per round, suffer 2 strain to reduce the difficulty of your next check using that skill by two, to a minimum of Easy."
    },

    {
        id: "ruinous-repartee",
        name: "Ruinous Repartee",
        tier: 5,
        activation: "Active (Action)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per encounter, make an opposed Charm or Coercion versus Discipline check against one character within medium range or earshot. On success, the target suffers strain equal to twice your Presence plus 1 per net Success, and you recover strain equal to the amount inflicted."
    },

    {
        id: "crushing-blow",
        name: "Crushing Blow",
        tier: 5,
        activation: "Active (Incidental)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per session after rolling a melee attack but before resolving it, suffer 4 strain. For that attack, the weapon gains Breach 1 and Knockdown and destroys one non-Reinforced item wielded by the target."
    },

    {
        id: "lets-talk-this-over",
        name: "Let's Talk This Over",
        tier: 5,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per session when combat against sentient opponents is about to begin, make a Daunting Charm check. On success, replace the combat encounter with a social encounter in which the PCs attempt to resolve the conflict without violence."
    },

    {
        id: "retribution",
        name: "Retribution!",
        tier: 5,
        activation: "Active (Incidental, Out of Turn)",
        ranked: false,
        prerequisites: [],
        description:
            "Once per round when an adversary attacks an ally within medium range, spend a Story Point to automatically hit that adversary once with a wielded weapon if it is within range. Deal the weapon's base damage plus applicable talent and ability bonuses."
    }

],


    
// ============================================================
// EQUIPMENT
// ============================================================

equipment: [

    // ========================================================
    // WEAPONS
    // ========================================================

    {
        id: "club",
        name: "Club",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 5,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 0,
        price: 50,
        rarity: null,
        qualities: []
    },

    {
        id: "dagger",
        name: "Dagger",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 1
        },
        critical: 2,
        range: "Engaged",
        encumbrance: 1,
        hardPoints: 1,
        price: 150,
        rarity: null,
        qualities: []
    },

    {
        id: "sword",
        name: "Sword",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 2,
        range: "Engaged",
        encumbrance: 1,
        hardPoints: 1,
        price: 225,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            }
        ]
    },

    {
        id: "longsword",
        name: "Longsword",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 3
        },
        critical: 2,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 1,
        price: 225,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            }
        ]
    },

    {
        id: "axe",
        name: "Axe",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 3,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 1,
        price: 175,
        rarity: null,
        qualities: [
            {
                name: "Vicious",
                rating: 1
            }
        ]
    },

    {
        id: "mace",
        name: "Mace",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 4,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 1,
        price: 175,
        rarity: null,
        qualities: [
            {
                name: "Pierce",
                rating: 2
            }
        ]
    },

    {
        id: "warhammer",
        name: "Warhammer",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 4,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 1,
        price: 225,
        rarity: null,
        qualities: [
            {
                name: "Pierce",
                rating: 3
            }
        ]
    },

    {
        id: "light-spear",
        name: "Light Spear",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 4,
        range: "Engaged",
        thrownRange: "Short",
        encumbrance: 2,
        hardPoints: 1,
        price: 125,
        rarity: null,
        qualities: [
            {
                name: "Accurate",
                rating: 1
            },
            {
                name: "Defensive",
                rating: 1
            }
        ]
    },

    {
        id: "spear",
        name: "Spear",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 3
        },
        critical: 3,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 1,
        price: 225,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            },
            {
                name: "Pierce",
                rating: 1
            },
            {
                name: "Brace"
            }
        ]
    },

    {
        id: "greatsword",
        name: "Greatsword",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 5
        },
        critical: 2,
        range: "Engaged",
        encumbrance: 3,
        hardPoints: 2,
        price: 275,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            },
            {
                name: "Pierce",
                rating: 1
            },
            {
                name: "Unwieldy",
                rating: 3
            }
        ]
    },

    {
        id: "greataxe",
        name: "Greataxe",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 5
        },
        critical: 3,
        range: "Engaged",
        encumbrance: 4,
        hardPoints: 2,
        price: 200,
        rarity: null,
        qualities: [
            {
                name: "Cumbersome",
                rating: 3
            },
            {
                name: "Vicious",
                rating: 2
            }
        ]
    },

    {
        id: "maul",
        name: "Maul",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 6
        },
        critical: 4,
        range: "Engaged",
        encumbrance: 4,
        hardPoints: 2,
        price: 275,
        rarity: null,
        qualities: [
            {
                name: "Cumbersome",
                rating: 3
            },
            {
                name: "Inaccurate",
                rating: 1
            },
            {
                name: "Pierce",
                rating: 3
            }
        ]
    },

    {
        id: "polearm",
        name: "Polearm",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 4
        },
        critical: 3,
        range: "Engaged",
        encumbrance: 3,
        hardPoints: 2,
        price: 250,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            },
            {
                name: "Pierce",
                rating: 1
            }
        ]
    },

    {
        id: "pike",
        name: "Pike",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 4
        },
        critical: 3,
        range: "Short",
        encumbrance: 4,
        hardPoints: 2,
        price: 200,
        rarity: null,
        qualities: [
            {
                name: "Cumbersome",
                rating: 3
            },
            {
                name: "Brace"
            }
        ],
        description:
            "Cannot be used to attack targets at Engaged range."
    },

    {
        id: "lance",
        name: "Lance",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 4
        },
        critical: 3,
        range: "Engaged",
        encumbrance: 4,
        hardPoints: 2,
        price: 250,
        rarity: null,
        qualities: [
            {
                name: "Cumbersome",
                rating: 3
            }
        ],
        description:
            "Normally requires two hands. May be used one-handed while mounted. A mounted Charge with a lance gains Pierce 2."
    },

    {
        id: "staff",
        name: "Staff",
        category: "weapon",
        skill: "melee-heavy",
        damage: {
            type: "brawn-plus",
            value: 2
        },
        critical: 4,
        range: "Engaged",
        encumbrance: 3,
        hardPoints: 1,
        price: 100,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            }
        ]
    },

    {
        id: "shield",
        name: "Shield",
        category: "weapon",
        skill: "melee-light",
        damage: {
            type: "brawn-plus",
            value: 0
        },
        critical: 6,
        range: "Engaged",
        encumbrance: 2,
        hardPoints: 1,
        price: 60,
        rarity: null,
        qualities: [
            {
                name: "Defensive",
                rating: 1
            },
            {
                name: "Deflection",
                rating: 1
            },
            {
                name: "Inaccurate",
                rating: 1
            },
            {
                name: "Knockdown"
            }
        ]
    },

    {
        id: "dart",
        name: "Dart",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "brawn-plus",
            value: 1
        },
        critical: 3,
        range: "Short",
        encumbrance: 1,
        hardPoints: 0,
        price: 20,
        rarity: null,
        qualities: [
            {
                name: "Limited Ammo",
                rating: 1
            }
        ]
    },

    {
        id: "throwing-knife",
        name: "Throwing Knife",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "brawn-plus",
            value: 1
        },
        critical: 2,
        range: "Short",
        encumbrance: 1,
        hardPoints: 0,
        price: 50,
        rarity: null,
        qualities: [
            {
                name: "Limited Ammo",
                rating: 1
            }
        ]
    },

    {
        id: "sling",
        name: "Sling",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "fixed",
            value: 4
        },
        critical: 4,
        range: "Medium",
        encumbrance: 1,
        hardPoints: 0,
        price: 25,
        rarity: null,
        qualities: [
            {
                name: "Concussive",
                rating: 1
            }
        ]
    },

    {
        id: "bow",
        name: "Bow",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "fixed",
            value: 7
        },
        critical: 3,
        range: "Medium",
        encumbrance: 2,
        hardPoints: 2,
        price: 500,
        rarity: null,
        qualities: []
    },

    {
        id: "longbow",
        name: "Longbow",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "fixed",
            value: 8
        },
        critical: 3,
        range: "Long",
        encumbrance: 3,
        hardPoints: 2,
        price: 750,
        rarity: null,
        qualities: [
            {
                name: "Cumbersome",
                rating: 3
            }
        ]
    },

    {
        id: "light-crossbow",
        name: "Light Crossbow",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "fixed",
            value: 7
        },
        critical: 2,
        range: "Medium",
        encumbrance: 3,
        hardPoints: 2,
        price: 675,
        rarity: null,
        qualities: [
            {
                name: "Pierce",
                rating: 1
            },
            {
                name: "Prepare",
                rating: 1
            }
        ]
    },

    {
        id: "heavy-crossbow",
        name: "Heavy Crossbow",
        category: "weapon",
        skill: "ranged",
        damage: {
            type: "fixed",
            value: 9
        },
        critical: 2,
        range: "Long",
        encumbrance: 4,
        hardPoints: 2,
        price: 950,
        rarity: null,
        qualities: [
            {
                name: "Cumbersome",
                rating: 3
            },
            {
                name: "Pierce",
                rating: 2
            },
            {
                name: "Prepare",
                rating: 2
            }
        ]
    },


    // ========================================================
    // ARMOR
    // ========================================================

    {
        id: "gambeson",
        name: "Gambeson",
        category: "armor",
        defense: 0,
        soak: 1,
        encumbrance: 1,
        hardPoints: 1,
        price: 50,
        rarity: null,
        qualities: []
    },

    {
        id: "brigandine",
        name: "Brigandine",
        category: "armor",
        defense: 1,
        soak: 1,
        encumbrance: 3,
        hardPoints: 2,
        price: 275,
        rarity: null,
        qualities: []
    },

    {
        id: "mail",
        name: "Mail",
        category: "armor",
        defense: 0,
        soak: 2,
        encumbrance: 3,
        hardPoints: 2,
        price: 450,
        rarity: null,
        qualities: []
    },

    {
        id: "half-plate",
        name: "Half Plate",
        category: "armor",
        defense: 1,
        soak: 2,
        encumbrance: 4,
        hardPoints: 2,
        price: 900,
        rarity: null,
        qualities: []
    },

    {
        id: "plate",
        name: "Plate",
        category: "armor",
        defense: 1,
        soak: 4,
        encumbrance: 5,
        hardPoints: 3,
        price: 3000,
        rarity: null,
        qualities: []
    },


    // ========================================================
    // GENERAL GEAR
    // ========================================================

    {
        id: "backpack",
        name: "Backpack",
        category: "gear",
        encumbrance: 0,
        price: 50,
        rarity: null,
        description:
            "Increases the character's Encumbrance Threshold by 4."
    },

    {
        id: "bedroll",
        name: "Bedroll",
        category: "gear",
        encumbrance: 1,
        price: 15,
        rarity: null
    },

    {
        id: "blanket",
        name: "Blanket",
        category: "gear",
        encumbrance: 1,
        price: 5,
        rarity: null
    },

    {
        id: "small-tent",
        name: "Small Tent",
        category: "gear",
        encumbrance: 3,
        price: 30,
        rarity: null
    },

    {
        id: "large-tent",
        name: "Large Tent",
        category: "gear",
        encumbrance: 5,
        price: 75,
        rarity: null
    },

    {
        id: "waterskin",
        name: "Waterskin",
        category: "gear",
        encumbrance: 0.5,
        price: 5,
        rarity: null,
        description:
            "Encumbrance listed assumes the waterskin is full."
    },

    {
        id: "rope",
        name: "Rope",
        category: "gear",
        encumbrance: 1,
        price: 5,
        rarity: null
    },

    {
        id: "grappling-hook",
        name: "Grappling Hook",
        category: "gear",
        encumbrance: 1,
        price: 10,
        rarity: null
    },

    {
        id: "flint-and-steel",
        name: "Flint and Steel",
        category: "gear",
        encumbrance: 0,
        price: 10,
        rarity: null
    },

    {
        id: "torches",
        name: "Torches",
        category: "gear",
        encumbrance: 1,
        price: 1,
        rarity: null
    },

    {
        id: "lantern",
        name: "Lantern",
        category: "gear",
        encumbrance: 1,
        price: 50,
        rarity: null
    },

    {
        id: "lamp-oil",
        name: "Lamp Oil",
        category: "gear",
        encumbrance: 0,
        price: 2,
        rarity: null
    },

    {
        id: "rations",
        name: "Rations, One Day",
        category: "gear",
        encumbrance: 0,
        price: 2,
        rarity: null
    },

    {
        id: "cooking-kit",
        name: "Cooking Kit",
        category: "gear",
        encumbrance: 2,
        price: 15,
        rarity: null
    },

    {
        id: "winter-clothing",
        name: "Winter Clothing",
        category: "gear",
        encumbrance: 1,
        price: 100,
        rarity: null,
        description:
            "When worn, removes up to 2 Setback dice from Survival or Resilience checks caused by cold weather."
    },

    {
        id: "apothecary-kit",
        name: "Apothecary Kit",
        category: "gear",
        encumbrance: 2,
        price: 150,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [
                "medicine"
            ],
            condition:
                "When preparing or using medicines, remedies, or similar treatments."
        }
    },

    {
        id: "healers-kit",
        name: "Healer's Kit",
        category: "gear",
        encumbrance: 2,
        price: 100,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [
                "medicine"
            ],
            condition:
                "When treating injuries or illness."
        }
    },

    {
        id: "thieves-tools",
        name: "Thieves' Tools",
        category: "gear",
        encumbrance: 1,
        price: 75,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [
                "skulduggery"
            ],
            condition:
                "When working with locks, traps, or similar mechanisms."
        }
    },

    {
        id: "climbing-gear",
        name: "Climbing Gear",
        category: "gear",
        encumbrance: 1,
        price: 20,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [
                "athletics"
            ],
            condition:
                "When climbing."
        }
    },

    {
        id: "hunting-fishing-kit",
        name: "Hunting & Fishing Kit",
        category: "gear",
        encumbrance: 2,
        price: 40,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [
                "survival"
            ],
            condition:
                "When hunting, trapping, or fishing."
        }
    },

    {
        id: "navigation-instruments",
        name: "Navigation Instruments",
        category: "gear",
        encumbrance: 1,
        price: 100,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [
                "navigation"
            ],
            condition:
                "When navigating using the instruments."
        }
    },

    {
        id: "writing-kit",
        name: "Writing Kit",
        category: "gear",
        encumbrance: 1,
        price: 50,
        rarity: null,
        checkBonus: {
            boostDice: 1,
            skills: [],
            condition:
                "When a check materially benefits from writing, drafting, copying, or preparing documents."
        }
    },

    {
        id: "crowbar",
        name: "Crowbar",
        category: "gear",
        encumbrance: 1,
        price: 10,
        rarity: null
    },

    {
        id: "shovel",
        name: "Shovel",
        category: "gear",
        encumbrance: 2,
        price: 10,
        rarity: null
    },

    {
        id: "hammer-pitons",
        name: "Hammer & Pitons",
        category: "gear",
        encumbrance: 1,
        price: 10,
        rarity: null
    },


    // ========================================================
    // MOUNTS
    // ========================================================

    {
        id: "pony",
        name: "Pony",
        category: "mount",
        brawn: 2,
        agility: 2,
        soak: 2,
        woundThreshold: 10,
        encumbranceCapacity: 10,
        price: 100,
        rarity: null,
        skills: {
            athletics: 1,
            resilience: 1
        },
        attacks: [
            {
                name: "Hooves",
                skill: "brawl",
                damage: {
                    type: "brawn-plus",
                    value: 2
                },
                critical: 4,
                range: "Engaged",
                qualities: [
                    {
                        name: "Knockdown"
                    }
                ]
            }
        ],
        abilities: []
    },

    {
        id: "mule",
        name: "Mule",
        category: "mount",
        brawn: 3,
        agility: 2,
        soak: 3,
        woundThreshold: 13,
        encumbranceCapacity: 18,
        price: 125,
        rarity: null,
        skills: {
            athletics: 1,
            resilience: 2,
            survival: 1
        },
        attacks: [
            {
                name: "Hooves",
                skill: "brawl",
                damage: {
                    type: "brawn-plus",
                    value: 2
                },
                critical: 4,
                range: "Engaged",
                qualities: [
                    {
                        name: "Knockdown"
                    }
                ]
            }
        ],
        abilities: []
    },

    {
        id: "draft-horse",
        name: "Draft Horse",
        category: "mount",
        brawn: 4,
        agility: 2,
        soak: 4,
        woundThreshold: 18,
        encumbranceCapacity: 25,
        price: 200,
        rarity: null,
        skills: {
            athletics: 2,
            resilience: 2
        },
        attacks: [
            {
                name: "Hooves",
                skill: "brawl",
                damage: {
                    type: "brawn-plus",
                    value: 2
                },
                critical: 4,
                range: "Engaged",
                qualities: [
                    {
                        name: "Knockdown"
                    }
                ]
            }
        ],
        abilities: []
    },

    {
        id: "riding-horse",
        name: "Riding Horse",
        category: "mount",
        brawn: 3,
        agility: 3,
        soak: 3,
        woundThreshold: 13,
        encumbranceCapacity: 15,
        price: 250,
        rarity: null,
        skills: {
            athletics: 1
        },
        attacks: [
            {
                name: "Hooves",
                skill: "brawl",
                damage: {
                    type: "brawn-plus",
                    value: 2
                },
                critical: 4,
                range: "Engaged",
                qualities: [
                    {
                        name: "Knockdown"
                    }
                ]
            }
        ],
        abilities: []
    },

    {
        id: "courser",
        name: "Courser",
        category: "mount",
        brawn: 3,
        agility: 4,
        soak: 3,
        woundThreshold: 14,
        encumbranceCapacity: 13,
        price: 750,
        rarity: null,
        skills: {
            athletics: 2,
            coordination: 2
        },
        attacks: [
            {
                name: "Hooves",
                skill: "brawl",
                damage: {
                    type: "brawn-plus",
                    value: 2
                },
                critical: 4,
                range: "Engaged",
                qualities: [
                    {
                        name: "Knockdown"
                    }
                ]
            }
        ],
        abilities: [
            {
                name: "Battle-Trained",
                description:
                    "May willingly enter Engaged range with hostile characters and may be directed to make attacks."
            },
            {
                name: "Swift",
                description:
                    "Add 1 Boost die to Riding checks involving speed, pursuit, escape, or maneuvering at a gallop."
            }
        ]
    },

    {
        id: "destrier",
        name: "Destrier",
        category: "mount",
        brawn: 4,
        agility: 3,
        soak: 4,
        woundThreshold: 18,
        encumbranceCapacity: 20,
        price: 1500,
        rarity: null,
        skills: {
            athletics: 2,
            brawl: 2,
            discipline: 2,
            resilience: 2
        },
        attacks: [
            {
                name: "Hooves",
                skill: "brawl",
                damage: {
                    type: "brawn-plus",
                    value: 2
                },
                critical: 4,
                range: "Engaged",
                qualities: [
                    {
                        name: "Knockdown"
                    }
                ]
            }
        ],
        abilities: [
            {
                name: "Warhorse",
                description:
                    "Ignores Setback dice imposed by ordinary combat distractions. May willingly enter Engaged range with hostile characters and may be directed to make attacks."
            },
            {
                name: "Powerful Charge",
                description:
                    "When the destrier performs a Charge, its Hooves attack gains +1 damage."
            }
        ]
    },


    // ========================================================
    // TACK
    // ========================================================

    {
        id: "basic-tack",
        name: "Bridle & Basic Tack",
        category: "tack",
        encumbrance: 1,
        price: 20,
        rarity: null
    },

    {
        id: "riding-saddle",
        name: "Riding Saddle",
        category: "tack",
        encumbrance: 3,
        price: 50,
        rarity: null
    },

    {
        id: "war-saddle",
        name: "War Saddle",
        category: "tack",
        encumbrance: 4,
        price: 150,
        rarity: null
    },

    {
        id: "saddlebags",
        name: "Saddlebags",
        category: "tack",
        encumbrance: 2,
        price: 25,
        rarity: null
    },

    {
        id: "pack-saddle",
        name: "Pack Saddle",
        category: "tack",
        encumbrance: 4,
        price: 40,
        rarity: null
    },

    {
        id: "horseshoes",
        name: "Horseshoes",
        category: "tack",
        encumbrance: 0,
        price: 10,
        rarity: null
    },


    // ========================================================
    // BARDING
    // ========================================================

    {
        id: "padded-barding",
        name: "Padded Barding",
        category: "barding",
        defense: 0,
        soak: 1,
        encumbrance: 4,
        price: 100,
        rarity: null
    },

    {
        id: "mail-barding",
        name: "Mail Barding",
        category: "barding",
        defense: 0,
        soak: 2,
        encumbrance: 6,
        price: 500,
        rarity: null
    },

    {
        id: "plate-barding",
        name: "Plate Barding",
        category: "barding",
        defense: 1,
        soak: 3,
        encumbrance: 8,
        price: 1500,
        rarity: null
    },


    // ========================================================
    // VEHICLES
    // ========================================================

    {
        id: "cart",
        name: "Cart",
        category: "vehicle",
        encumbrance: null,
        price: 150,
        rarity: null
    },

    {
        id: "wagon",
        name: "Wagon",
        category: "vehicle",
        encumbrance: null,
        price: 200,
        rarity: null
    },

    {
        id: "rowboat",
        name: "Rowboat",
        category: "vehicle",
        encumbrance: null,
        price: 150,
        rarity: null
    },


    // ========================================================
    // WEAPON ATTACHMENTS
    // ========================================================

    {
        id: "balanced-hilt",
        name: "Balanced Hilt",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 1000,
        rarity: null,
        purchasable: true,
        description:
            "The weapon gains Accurate 1, or increases its existing Accurate rating by 1."
    },

    {
        id: "duelist-cross-guard",
        name: "Duelist Cross Guard",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 800,
        rarity: null,
        purchasable: true,
        description:
            "When an opponent makes a melee attack against the wielder and generates at least 1 uncanceled Threat, the wielder may suffer 1 strain to add 2 Threat to the attack's results."
    },

    {
        id: "razor-edge",
        name: "Razor Edge",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 1250,
        rarity: null,
        purchasable: true,
        description:
            "The weapon gains Pierce 2, or increases an existing Pierce rating by 1. Reduce its Critical rating by 1, to a minimum of 1."
    },

    {
        id: "recurve-limbs",
        name: "Recurve Limbs",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 300,
        rarity: null,
        purchasable: true,
        description:
            "For bows and crossbows. The weapon gains Pierce 2, or increases an existing Pierce rating by 1. It also gains or increases Unwieldy as appropriate."
    },

    {
        id: "serrated-edge",
        name: "Serrated Edge",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 75,
        rarity: null,
        purchasable: true,
        description:
            "For bladed weapons. The weapon gains Vicious 1, or increases its existing Vicious rating by 1."
    },

    {
        id: "superior-weapon-customization",
        name: "Superior Weapon Customization",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 750,
        rarity: null,
        purchasable: true,
        description:
            "The weapon gains the Superior quality."
    },

    {
        id: "weapon-sling",
        name: "Weapon Sling",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 25,
        rarity: null,
        purchasable: true,
        description:
            "Reduces the attached weapon's Encumbrance by 2, to a minimum of 0."
    },

    {
        id: "weighted-head",
        name: "Weighted Head",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 250,
        rarity: null,
        purchasable: true,
        description:
            "The weapon gains +2 damage and gains or increases Cumbersome as appropriate."
    },

    {
        id: "reinforced-haft",
        name: "Reinforced Haft",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 1,
        price: 400,
        rarity: null,
        purchasable: true,
        description:
            "The weapon gains Defensive 1, or increases its existing Defensive rating by 1."
    },

    {
        id: "valyrian-steel",
        name: "Valyrian Steel",
        category: "attachment",
        attachmentType: "weapon",
        hardPointCost: 0,
        price: null,
        rarity: null,
        purchasable: false,
        description:
            "For weapons with a plausible steel striking component. The weapon gains Superior, +2 damage, and Vicious 2. Reduce its Encumbrance by 1, to a minimum of 1. Valyrian Steel does not grant Pierce and does not stack with incompatible edge, point, or material modifications."
    },


    // ========================================================
    // ARMOR ATTACHMENTS
    // ========================================================

    {
        id: "deflective-plating",
        name: "Deflective Plating",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 1,
        price: 450,
        rarity: null,
        purchasable: true,
        description:
            "The armor grants +1 ranged defense."
    },

    {
        id: "intimidating-visage",
        name: "Intimidating Visage",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 0,
        price: 236,
        rarity: null,
        purchasable: true,
        description:
            "Add 1 Boost die to Coercion checks and 1 Setback die to Charm checks while wearing the armor."
    },

    {
        id: "reinforced-plating",
        name: "Reinforced Plating",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 2,
        price: 8000,
        rarity: null,
        purchasable: true,
        description:
            "The armor gains the Reinforced quality and its Encumbrance increases by 1."
    },

    {
        id: "gilded",
        name: "Gilded",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 0,
        price: 3000,
        rarity: null,
        purchasable: true,
        description:
            "Add 1 Boost die to Charm, Negotiation, and Leadership checks while wearing the armor."
    },

    {
        id: "spikes",
        name: "Spikes",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 1,
        price: 1200,
        rarity: null,
        purchasable: true,
        description:
            "When targeted by a melee attack, spend 3 Threat or 1 Despair generated by the attacker's check to inflict 3 wounds on the attacker."
    },

    {
        id: "fine-armor-fitting",
        name: "Fine Armor Fitting",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 1,
        price: 750,
        rarity: null,
        purchasable: true,
        description:
            "Reduce the armor's Encumbrance by 1 while worn, to a minimum of 1."
    },

    {
        id: "concealed-armor",
        name: "Concealed Armor",
        category: "attachment",
        attachmentType: "armor",
        hardPointCost: 1,
        price: 250,
        rarity: null,
        purchasable: true,
        description:
            "Add 1 Boost die to checks made to conceal the armor."
    }
],

    
// ============================================================
// STARTING EQUIPMENT PACKAGES
// ============================================================

startingEquipmentPackages: [

    // --------------------------------------------------------
    // WARRIOR
    // --------------------------------------------------------

    {
        id: "knight",
        name: "Knight's Kit",
        items: [
            { id: "riding-horse", quantity: 1 },
            { id: "riding-saddle", quantity: 1 },
            { id: "basic-tack", quantity: 1 },
            { id: "lance", quantity: 1 },
            { id: "sword", quantity: 1 },
            { id: "gambeson", quantity: 1 }
        ]
    },

    {
        id: "man-at-arms",
        name: "Man-at-Arms' Kit",
        items: [
            { id: "longsword", quantity: 1 },
            { id: "shield", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 },
            { id: "flint-and-steel", quantity: 1 }
        ]
    },

    {
        id: "archer-hunter",
        name: "Archer's Kit",
        items: [
            { id: "bow", quantity: 1 },
            { id: "dagger", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "hunting-fishing-kit", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 }
        ]
    },


    // --------------------------------------------------------
    // COMMANDER
    // --------------------------------------------------------

    {
        id: "captain",
        name: "Captain's Kit",
        items: [
            { id: "sword", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "navigation-instruments", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 }
        ]
    },

    {
        id: "castellan",
        name: "Castellan's Kit",
        items: [
            { id: "sword", quantity: 1 },
            { id: "brigandine", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "lantern", quantity: 1 },
            { id: "flint-and-steel", quantity: 1 }
        ]
    },

    {
        id: "marshal",
        name: "Marshal's Kit",
        items: [
            { id: "riding-horse", quantity: 1 },
            { id: "riding-saddle", quantity: 1 },
            { id: "basic-tack", quantity: 1 },
            { id: "sword", quantity: 1 },
            { id: "shield", quantity: 1 },
            { id: "gambeson", quantity: 1 }
        ]
    },


    // --------------------------------------------------------
    // COURTIER
    // --------------------------------------------------------

    {
        id: "diplomat",
        name: "Diplomat's Kit",
        items: [
            { id: "sword", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "winter-clothing", quantity: 1 }
        ]
    },

    {
        id: "schemer",
        name: "Schemer's Kit",
        items: [
            { id: "dagger", quantity: 1 },
            { id: "brigandine", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "lantern", quantity: 1 },
            { id: "thieves-tools", quantity: 1 }
        ]
    },

    {
        id: "assassin",
        name: "Assassin's Kit",
        items: [
            { id: "dagger", quantity: 1 },
            { id: "throwing-knife", quantity: 2 },
            { id: "gambeson", quantity: 1 },
            { id: "thieves-tools", quantity: 1 },
            { id: "rope", quantity: 1 },
            { id: "grappling-hook", quantity: 1 }
        ]
    },


    // --------------------------------------------------------
    // ROGUE
    // --------------------------------------------------------

    {
        id: "thief",
        name: "Thief's Kit",
        items: [
            { id: "dagger", quantity: 1 },
            { id: "thieves-tools", quantity: 1 },
            { id: "rope", quantity: 1 },
            { id: "grappling-hook", quantity: 1 },
            { id: "crowbar", quantity: 1 },
            { id: "flint-and-steel", quantity: 1 }
        ]
    },

    {
        id: "spy",
        name: "Spy's Kit",
        items: [
            { id: "dagger", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "thieves-tools", quantity: 1 },
            { id: "winter-clothing", quantity: 1 }
        ]
    },

    {
        id: "outlaw",
        name: "Outlaw's Kit",
        items: [
            { id: "sword", quantity: 1 },
            { id: "bow", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 }
        ]
    },


    // --------------------------------------------------------
    // SCHOLAR
    // --------------------------------------------------------

    {
        id: "engineer",
        name: "Engineer's Kit",
        items: [
            { id: "club", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "hammer-pitons", quantity: 1 },
            { id: "shovel", quantity: 1 },
            { id: "crowbar", quantity: 1 },
            { id: "writing-kit", quantity: 1 }
        ]
    },

    {
        id: "physician",
        name: "Physician's Kit",
        items: [
            { id: "dagger", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "healers-kit", quantity: 1 },
            { id: "apothecary-kit", quantity: 1 },
            { id: "writing-kit", quantity: 1 }
        ]
    },

    {
        id: "devout",
        name: "Devout's Kit",
        items: [
            { id: "staff", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "winter-clothing", quantity: 1 }
        ]
    },


    // --------------------------------------------------------
    // EXPERT
    // --------------------------------------------------------

    {
        id: "artisan",
        name: "Artisan's Kit",
        items: [
            { id: "club", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "hammer-pitons", quantity: 1 },
            { id: "crowbar", quantity: 1 },
            { id: "writing-kit", quantity: 1 }
        ]
    },

    {
        id: "steward",
        name: "Steward's Kit",
        items: [
            { id: "riding-horse", quantity: 1 },
            { id: "riding-saddle", quantity: 1 },
            { id: "basic-tack", quantity: 1 },
            { id: "sword", quantity: 1 },
            { id: "writing-kit", quantity: 1 },
            { id: "winter-clothing", quantity: 1 }
        ]
    },

    {
        id: "sailor",
        name: "Sailor's Kit",
        items: [
            { id: "club", quantity: 1 },
            { id: "dagger", quantity: 1 },
            { id: "rope", quantity: 1 },
            { id: "grappling-hook", quantity: 1 },
            { id: "navigation-instruments", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 }
        ]
    },


    // --------------------------------------------------------
    // SCOUT
    // --------------------------------------------------------

    {
        id: "raider",
        name: "Raider's Kit",
        items: [
            { id: "axe", quantity: 1 },
            { id: "shield", quantity: 1 },
            { id: "gambeson", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 },
            { id: "rope", quantity: 1 }
        ]
    },

    {
        id: "messenger",
        name: "Messenger's Kit",
        items: [
            { id: "riding-horse", quantity: 1 },
            { id: "riding-saddle", quantity: 1 },
            { id: "basic-tack", quantity: 1 },
            { id: "sword", quantity: 1 },
            { id: "winter-clothing", quantity: 1 },
            { id: "bedroll", quantity: 1 },
            { id: "waterskin", quantity: 1 }
        ]
    }
],


// ============================================================
// SPECIALIZATION EQUIPMENT PACKAGE MAPPING
// ============================================================

specializationEquipmentPackages: {

    // Warrior
    "knight": "knight",
    "man-at-arms": "man-at-arms",
    "archer": "archer-hunter",

    // Commander
    "captain": "captain",
    "castellan": "castellan",
    "marshal": "marshal",

    // Courtier
    "diplomat": "diplomat",
    "schemer": "schemer",
    "assassin": "assassin",

    // Rogue
    "thief": "thief",
    "spy": "spy",
    "outlaw": "outlaw",

    // Scholar
    "engineer": "engineer",
    "physician": "physician",
    "devout": "devout",

    // Expert
    "artisan": "artisan",
    "steward": "steward",
    "sailor": "sailor",

    // Scout
    "hunter": "archer-hunter",
    "raider": "raider",
    "messenger": "messenger"
},
    
    
// ============================================================
// CAREERS
// ============================================================

    careers: [

        // --------------------------------------------------------
        // WARRIOR
        // --------------------------------------------------------

        {
            id: "warrior",
            name: "Warrior",

            coreSkills: [
                "cool",
                "resilience",
                "melee-heavy",
                "melee-light"
            ],

            specializations: [
                {
                    id: "knight",
                    name: "Knight",
                    skills: [
                        "leadership",
                        "riding",
                        "society",
                        "warfare"
                    ]
                },
                {
                    id: "man-at-arms",
                    name: "Man-at-Arms",
                    skills: [
                        "athletics",
                        "brawl",
                        "discipline",
                        "siege-weapons"
                    ]
                },
                {
                    id: "archer",
                    name: "Archer",
                    skills: [
                        "coordination",
                        "perception",
                        "ranged",
                        "survival"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // COMMANDER
        // --------------------------------------------------------

        {
            id: "commander",
            name: "Commander",

            coreSkills: [
                "cool",
                "discipline",
                "leadership",
                "warfare"
            ],

            specializations: [
                {
                    id: "captain",
                    name: "Captain",
                    skills: [
                        "navigation",
                        "sailing",
                        "perception",
                        "survival"
                    ]
                },
                {
                    id: "castellan",
                    name: "Castellan",
                    skills: [
                        "masonry",
                        "negotiation",
                        "society",
                        "vigilance"
                    ]
                },
                {
                    id: "marshal",
                    name: "Marshal",
                    skills: [
                        "athletics",
                        "history",
                        "melee-light",
                        "riding"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // COURTIER
        // --------------------------------------------------------

        {
            id: "courtier",
            name: "Courtier",

            coreSkills: [
                "charm",
                "negotiation",
                "perception",
                "society"
            ],

            specializations: [
                {
                    id: "diplomat",
                    name: "Diplomat",
                    skills: [
                        "cool",
                        "discipline",
                        "history",
                        "leadership"
                    ]
                },
                {
                    id: "schemer",
                    name: "Schemer",
                    skills: [
                        "coercion",
                        "deception",
                        "streetwise",
                        "vigilance"
                    ]
                },
                {
                    id: "assassin",
                    name: "Assassin",
                    skills: [
                        "melee-light",
                        "ranged",
                        "skulduggery",
                        "stealth"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // ROGUE
        // --------------------------------------------------------

        {
            id: "rogue",
            name: "Rogue",

            coreSkills: [
                "cool",
                "stealth",
                "streetwise",
                "vigilance"
            ],

            specializations: [
                {
                    id: "thief",
                    name: "Thief",
                    skills: [
                        "athletics",
                        "coordination",
                        "perception",
                        "skulduggery"
                    ]
                },
                {
                    id: "spy",
                    name: "Spy",
                    skills: [
                        "charm",
                        "deception",
                        "discipline",
                        "society"
                    ]
                },
                {
                    id: "outlaw",
                    name: "Outlaw",
                    skills: [
                        "brawl",
                        "coercion",
                        "melee-light",
                        "ranged"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // SCHOLAR
        // --------------------------------------------------------

        {
            id: "scholar",
            name: "Scholar",

            coreSkills: [
                "history",
                "medicine",
                "religion",
                "society"
            ],

            specializations: [
                {
                    id: "engineer",
                    name: "Engineer",
                    skills: [
                        "masonry",
                        "siege-weapons",
                        "warfare",
                        "woodworking"
                    ]
                },
                {
                    id: "physician",
                    name: "Physician",
                    skills: [
                        "cool",
                        "discipline",
                        "perception",
                        "resilience"
                    ]
                },
                {
                    id: "devout",
                    name: "Devout",
                    skills: [
                        "charm",
                        "coercion",
                        "leadership",
                        "vigilance"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // EXPERT
        // --------------------------------------------------------

        {
            id: "expert",
            name: "Expert",

            coreSkills: [
                "coordination",
                "negotiation",
                "perception",
                "resilience"
            ],

            specializations: [
                {
                    id: "artisan",
                    name: "Artisan",
                    skills: [
                        "discipline",
                        "masonry",
                        "smithing",
                        "woodworking"
                    ]
                },
                {
                    id: "steward",
                    name: "Steward",
                    skills: [
                        "history",
                        "leadership",
                        "riding",
                        "society"
                    ]
                },
                {
                    id: "sailor",
                    name: "Sailor",
                    skills: [
                        "athletics",
                        "navigation",
                        "sailing",
                        "survival"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // SCOUT
        // --------------------------------------------------------

        {
            id: "scout",
            name: "Scout",

            coreSkills: [
                "navigation",
                "perception",
                "stealth",
                "survival"
            ],

            specializations: [
                {
                    id: "hunter",
                    name: "Hunter",
                    skills: [
                        "athletics",
                        "ranged",
                        "skulduggery",
                        "vigilance"
                    ]
                },
                {
                    id: "raider",
                    name: "Raider",
                    skills: [
                        "cool",
                        "melee-heavy",
                        "melee-light",
                        "warfare"
                    ]
                },
                {
                    id: "messenger",
                    name: "Messenger",
                    skills: [
                        "charm",
                        "resilience",
                        "riding",
                        "streetwise"
                    ]
                }
            ]
        }
    ]
};


// ================================================================
// LOOKUP HELPERS
// ================================================================
//
// These are intentionally simple data-access helpers.
// Character-building rules and XP calculations should NOT go here.
// ================================================================

function getSkillById(skillId) {
    return GAME_DATA.skills.find(skill => skill.id === skillId);
}


function getCareerById(careerId) {
    return GAME_DATA.careers.find(career => career.id === careerId);
}


function getSpecializationById(careerId, specializationId) {
    const career = getCareerById(careerId);

    if (!career) {
        return undefined;
    }

    return career.specializations.find(
        specialization => specialization.id === specializationId
    );
}


function getCareerSkillIds(careerId, specializationId) {
    const career = getCareerById(careerId);

    if (!career) {
        return [];
    }

    const specialization = getSpecializationById(
        careerId,
        specializationId
    );

    if (!specialization) {
        return [...career.coreSkills];
    }

    return [
        ...career.coreSkills,
        ...specialization.skills
    ];
}


function getThresholdProfileById(profileId) {
    return GAME_DATA.thresholdProfiles.find(
        profile => profile.id === profileId
    );
}


function getTalentById(talentId) {
    return GAME_DATA.talents.find(
        talent => talent.id === talentId
    ) || null;
}


function getTalentsByTier(tier) {
    return GAME_DATA.talents.filter(
        talent => talent.tier === tier
    );
}


function getEquipmentById(equipmentId) {
    return GAME_DATA.equipment.find(
        item => item.id === equipmentId
    ) || null;
}

function getEquipmentByCategory(category) {
    return GAME_DATA.equipment.filter(
        item => item.category === category
    );
}

function getStartingEquipmentPackage(packageId) {
    return GAME_DATA.startingEquipmentPackages.find(
        equipmentPackage =>
            equipmentPackage.id === packageId
    ) || null;
}

function getSpecializationEquipmentPackage(
    specializationId
) {
    const packageId =
        GAME_DATA.specializationEquipmentPackages[
            specializationId
        ];

    if (!packageId) return null;

    return getStartingEquipmentPackage(
        packageId
    );
}

function getStartingEquipmentPackageCost(
    packageId
) {
    const equipmentPackage =
        getStartingEquipmentPackage(packageId);

    if (!equipmentPackage) return null;

    let total = 0;

    for (const packageItem of
        equipmentPackage.items) {

        const item =
            getEquipmentById(packageItem.id);

        if (!item || item.price === null) {
            return null;
        }

        total +=
            item.price *
            packageItem.quantity;
    }

    return total;
}
