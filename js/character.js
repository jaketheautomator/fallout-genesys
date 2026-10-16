/*
 * ASOIAF Genesys Character Builder
 * character.js
 *
 * Character state, calculations, and validation.
 */

"use strict";

const character = {

    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: "",

    background: {
        name: "",
        skills: []
    },


    // ============================================================
    // CHARACTERISTICS
    // ============================================================

    characteristics: {
        brawn: 2,
        agility: 2,
        intellect: 2,
        cunning: 2,
        willpower: 2,
        presence: 2
    },

    weakness: null,

    thresholdProfile: null,


    // ============================================================
    // CAREER
    // ============================================================

    career: null,
    specialization: null,


    // ============================================================
    // SKILLS
    // ============================================================

    /*
     * skillRanks contains purchased/free ranks.
     *
     * Example:
     * {
     *     "melee-heavy": 2,
     *     "riding": 1
     * }
     */
    skillRanks: {},

    /*
     * The four free rank-1 skills selected from the character's
     * starting Career + Specialization package.
     */
    freeCareerSkills: [],


    // ============================================================
    // TALENTS
    // ============================================================

    talents: [],


    // ============================================================
    // OBLIGATION
    // ============================================================

    obligation: {
        base: 10,
        additional: 0,
        xpBonus: 0,
        wealthBonus: 0,
        solo: false,
        choices: [],
        entries: [],
        nextEntryId: 1
    },


// ============================================================
// EQUIPMENT
// ============================================================

    equipment: [],
    equippedArmor: null,
    nextEquipmentInstanceId: 1
};


// ================================================================
// CHARACTERISTIC COSTS
// ================================================================

function getCharacteristicXPSpent() {
    let total = 0;

    for (const characteristic of GAME_DATA.characteristics) {
        const id = characteristic.id;
        const currentValue = character.characteristics[id];

        /*
         * A characteristic reduced to 1 through the weakness option
         * costs no XP. The +20 XP is handled separately.
         */
        if (currentValue <= 2) {
            continue;
        }

        /*
         * Genesys characteristic advancement:
         *
         * 2 -> 3 = 30 XP
         * 3 -> 4 = 40 XP
         * 4 -> 5 = 50 XP
         */
        for (let rating = 3; rating <= currentValue; rating++) {
            total += rating * 10;
        }
    }

    return total;
}


function getWeaknessBonusXP() {
    return Object.values(character.characteristics)
        .some(value => value === 1)
        ? 20
        : 0;
}


function getWeaknessCharacteristic() {
    const weakness = GAME_DATA.characteristics.find(
        stat => character.characteristics[stat.id] === 1
    );

    return weakness ? weakness.id : null;
}


function getCharacteristicIncreaseCost(id) {
    const current = character.characteristics[id];

    if (current === 1) {
        return 0;
    }

    return (current + 1) * 10;
}


function canIncreaseCharacteristic(id) {
    const current = character.characteristics[id];

    if (
        current >=
        GAME_DATA.characterCreation
            .characteristicMaximumAtCreation
    ) {
        return false;
    }

    /*
     * Raising a weakened characteristic from 1 to 2
     * removes the +20 weakness bonus.
     *
     * Test the resulting XP pool directly rather than
     * treating this as a characteristic XP purchase.
     */
    if (current === 1) {
        const xpAfterRemovingWeakness =
            getXPRemaining() -
            GAME_DATA.characterCreation.weakness.bonusXP;

        return xpAfterRemovingWeakness >= 0;
    }

    const cost = (current + 1) * 10;

    return cost <= getXPRemaining();
}


function canDecreaseCharacteristic(id) {
    const current = character.characteristics[id];

    /*
     * Nothing can fall below 1.
     */
    if (current <= 1) {
        return false;
    }

    /*
     * Purchased characteristic increases may always
     * be undone during character creation.
     */
    if (current > 2) {
        return true;
    }

    /*
     * At 2, this would create the character's one
     * permitted weakness. It is legal only if no
     * other characteristic is already at 1.
     */
    return getWeaknessCharacteristic() === null;
}

// ================================================================
// CAREER SKILLS
// ================================================================

function getCurrentCareerSkillIds() {
    if (!character.career) {
        return [];
    }

    return getCareerSkillIds(
        character.career,
        character.specialization
    );
}


function isCareerSkill(skillId) {
    return getCurrentCareerSkillIds().includes(skillId);
}


// ================================================================
// SKILL RANKS
// ================================================================

function getSkillRank(skillId) {
    return character.skillRanks[skillId] || 0;
}


function getBackgroundSkillRank(skillId) {
    return character.background.skills.includes(skillId) ? 1 : 0;
}


function getTotalSkillRank(skillId) {
    const purchasedRank =
        getSkillRank(skillId);

    const backgroundRank =
        getBackgroundSkillRank(skillId);

    const freeCareerRank =
        character.freeCareerSkills.includes(skillId)
            ? 1
            : 0;

    return Math.max(
        purchasedRank,
        backgroundRank,
        freeCareerRank
    );
}

// ================================================================
// SKILL XP COSTS
// ================================================================

function getSkillXPSpent() {
    let total = 0;

    for (const skill of GAME_DATA.skills) {

        const skillId = skill.id;
        const finalRank = getSkillRank(skillId);

        if (finalRank === 0) {
            continue;
        }

        const career = isCareerSkill(skillId);
        const hasFreeCareerRank =
            character.freeCareerSkills.includes(skillId);
        
        const hasFreeBackgroundRank =
            character.background.skills.includes(skillId);
        
        const hasFreeRank =
            hasFreeCareerRank || hasFreeBackgroundRank;

        /*
         * Starting Career skill:
         *
         * Rank 1 is free if selected as one of the four
         * starting Career skill ranks.
         *
         * Subsequent ranks cost normally.
         */
        const startingPaidRank = hasFreeRank ? 2 : 1;

        for (
            let rank = startingPaidRank;
            rank <= finalRank;
            rank++
        ) {
            let cost = rank * 5;

            if (!career) {
                cost += 5;
            }

            total += cost;
        }
    }

    return total;
}


// ================================================================
// TALENT XP COSTS
// ================================================================

function getTalentRank(talentId) {
    return character.talents.filter(
        id => id === talentId
    ).length;
}


function hasTalent(talentId) {
    return getTalentRank(talentId) > 0;
}


/*
 * Ranked talents increase in effective tier with each purchase.
 *
 * Example for a base Tier 1 ranked talent:
 * Rank 1 = Tier 1
 * Rank 2 = Tier 2
 * Rank 3 = Tier 3
 * Rank 4 = Tier 4
 * Rank 5+ = Tier 5
 *
 * Non-ranked talents always use their listed tier.
 */
function getTalentEffectiveTier(talentId, rank) {
    const talent = getTalentById(talentId);

    if (!talent) {
        return null;
    }

    if (!talent.ranked) {
        return talent.tier;
    }

    return Math.min(
        talent.tier + rank - 1,
        5
    );
}


/*
 * Returns the tier that the NEXT purchase of this talent
 * would occupy.
 */
function getNextTalentTier(talentId) {
    const talent = getTalentById(talentId);

    if (!talent) {
        return null;
    }

    const nextRank =
        getTalentRank(talentId) + 1;

    return getTalentEffectiveTier(
        talentId,
        nextRank
    );
}


/*
 * Count all purchased talent instances occupying a given
 * effective tier.
 */
function getTalentCountByTier(tier) {
    let count = 0;

    for (const talent of GAME_DATA.talents) {

        const ranks =
            getTalentRank(talent.id);

        for (
            let rank = 1;
            rank <= ranks;
            rank++
        ) {
            if (
                getTalentEffectiveTier(
                    talent.id,
                    rank
                ) === tier
            ) {
                count++;
            }
        }
    }

    return count;
}


/*
 * Genesys talent pyramid:
 *
 * Tier 2 talents require more Tier 1 talents than Tier 2.
 * Tier 3 talents require more Tier 2 talents than Tier 3.
 * And so on.
 *
 * This checks the pyramid AFTER the proposed purchase.
 */
function canAddTalentAtTier(tier) {
    if (tier === 1) {
        return true;
    }

    const lowerTierCount =
        getTalentCountByTier(tier - 1);

    const resultingTierCount =
        getTalentCountByTier(tier) + 1;

    return lowerTierCount > resultingTierCount;
}


function hasTalentPrerequisites(talent) {
    return talent.prerequisites.every(
        prerequisiteId =>
            hasTalent(prerequisiteId)
    );
}


function getNextTalentCost(talentId) {
    const tier =
        getNextTalentTier(talentId);

    if (tier === null) {
        return null;
    }

    return tier * 5;
}


function canPurchaseTalent(talentId) {
    const talent =
        getTalentById(talentId);

    if (!talent) {
        return false;
    }

    /*
     * A non-ranked talent can only be purchased once.
     */
    if (
        !talent.ranked &&
        hasTalent(talentId)
    ) {
        return false;
    }

    if (
        !hasTalentPrerequisites(talent)
    ) {
        return false;
    }

    const tier =
        getNextTalentTier(talentId);

    if (
        !canAddTalentAtTier(tier)
    ) {
        return false;
    }

    const cost =
        getNextTalentCost(talentId);

    if (
        cost > getXPRemaining()
    ) {
        return false;
    }

    return true;
}


function purchaseTalent(talentId) {
    if (!canPurchaseTalent(talentId)) {
        return false;
    }

    character.talents.push(talentId);

    return true;
}


/*
 * Removing a talent can invalidate:
 *
 * 1. The talent pyramid.
 * 2. A prerequisite for another purchased talent.
 *
 * We therefore test the resulting character rather than
 * blindly removing the talent.
 */
function isTalentPyramidValid() {
    for (
        let tier = 2;
        tier <= 5;
        tier++
    ) {
        const currentTierCount =
            getTalentCountByTier(tier);

        const lowerTierCount =
            getTalentCountByTier(tier - 1);

        if (
            currentTierCount > 0 &&
            lowerTierCount <= currentTierCount
        ) {
            return false;
        }
    }

    return true;
}


function areTalentPrerequisitesValid() {
    for (const talent of GAME_DATA.talents) {

        if (!hasTalent(talent.id)) {
            continue;
        }

        if (
            !hasTalentPrerequisites(talent)
        ) {
            return false;
        }
    }

    return true;
}


function canRemoveTalent(talentId) {
    if (!hasTalent(talentId)) {
        return false;
    }

    /*
     * Temporarily remove the highest rank of this talent.
     */
    const index =
        character.talents.lastIndexOf(
            talentId
        );

    character.talents.splice(index, 1);

    const valid =
        isTalentPyramidValid() &&
        areTalentPrerequisitesValid();

    /*
     * Restore it immediately.
     */
    character.talents.splice(
        index,
        0,
        talentId
    );

    return valid;
}


function removeTalent(talentId) {
    if (!canRemoveTalent(talentId)) {
        return false;
    }

    const index =
        character.talents.lastIndexOf(
            talentId
        );

    character.talents.splice(index, 1);

    return true;
}


function getTalentXPSpent() {
    let total = 0;

    for (const talent of GAME_DATA.talents) {

        const ranks =
            getTalentRank(talent.id);

        for (
            let rank = 1;
            rank <= ranks;
            rank++
        ) {
            const tier =
                getTalentEffectiveTier(
                    talent.id,
                    rank
                );

            total += tier * 5;
        }
    }

    return total;
}


// ================================================================
// XP TOTALS
// ================================================================

function getBaseAvailableXP() {
    return (
        GAME_DATA.characterCreation.startingXP +
        getWeaknessBonusXP()
    );
}

// ============================================================
// OBLIGATION
// ============================================================

function getMaximumAdditionalObligation() {
    return character.obligation.solo
        ? GAME_DATA.characterCreation
            .obligation.soloMaximumIncrease
        : GAME_DATA.characterCreation
            .obligation.normalMaximumIncrease;
}


function getObligationChoiceCount() {
    return character.obligation.choices.length;
}


function getAdditionalObligation() {
    return getObligationChoiceCount() * 5;
}


function canAddObligation() {
    return (
        getAdditionalObligation() + 5 <=
        getMaximumAdditionalObligation()
    );
}


/*
 * Each +5 Obligation may be taken for either:
 *
 * +5 XP
 * or
 * additional starting wealth.
 *
 * Wealth follows the established breakpoints:
 *
 * +5 Obligation  = +1,000 stags
 * +10 Obligation = +2,500 stags
 *
 * For solo characters who can continue beyond +10,
 * each complete +10 block is worth +2,500 stags.
 * An additional +5 is worth +1,000.
 */
function calculateObligationBonuses() {
    const xpChoices =
        character.obligation.choices.filter(
            choice => choice === "xp"
        ).length;

    const wealthChoices =
        character.obligation.choices.filter(
            choice => choice === "wealth"
        ).length;


    character.obligation.additional =
        getAdditionalObligation();


    character.obligation.xpBonus =
        xpChoices * 5;


    const wealthPairs =
        Math.floor(
            wealthChoices / 2
        );

    const remainingWealthChoices =
        wealthChoices % 2;


    character.obligation.wealthBonus =
        (wealthPairs * 2500) +
        (remainingWealthChoices * 1000);
}


function addObligationChoice(type) {
    if (!canAddObligation()) {
        return false;
    }

    if (
        type !== "xp" &&
        type !== "wealth"
    ) {
        return false;
    }

    character.obligation.choices.push(type);

    calculateObligationBonuses();

    return true;
}


function canRemoveObligationChoice(index) {
    if (
        index < 0 ||
        index >= character.obligation.choices.length
    ) {
        return false;
    }

    const newTotal =
        getTotalObligation() - 5;

    if (
        getAssignedObligation() >
        newTotal
    ) {
        return false;
    }

    return true;
}


function removeObligationChoice(index) {
    if (
        !canRemoveObligationChoice(index)
    ) {
        return false;
    }


    /*
     * Removing XP Obligation cannot leave the character
     * with negative XP.
     */
    const choice =
        character.obligation.choices[index];

    if (choice === "xp") {

        character.obligation.choices.splice(
            index,
            1
        );

        calculateObligationBonuses();

        if (getXPRemaining() < 0) {

            character.obligation.choices.splice(
                index,
                0,
                choice
            );

            calculateObligationBonuses();

            return false;
        }

        return true;
    }


    character.obligation.choices.splice(
        index,
        1
    );

    calculateObligationBonuses();

    return true;
}


function setSoloCharacter(isSolo) {
    if (isSolo) {
        character.obligation.solo = true;
        return true;
    }


    /*
     * A character cannot switch out of Solo mode while
     * carrying more than the normal additional Obligation
     * limit.
     */
    if (
        getAdditionalObligation() >
        GAME_DATA.characterCreation
            .obligation.normalMaximumIncrease
    ) {
        return false;
    }


    character.obligation.solo = false;

    return true;
}

function getObligationBonusXP() {
    return character.obligation.xpBonus;
}


function getTotalAvailableXP() {
    return (
        getBaseAvailableXP() +
        getObligationBonusXP()
    );
}


function getXPSpent() {
    return (
        getCharacteristicXPSpent() +
        getSkillXPSpent() +
        getTalentXPSpent()
    );
}


function getXPRemaining() {
    return getTotalAvailableXP() - getXPSpent();
}

function getObligationType(typeId) {
    return GAME_DATA.obligationTypes.find(
        type => type.id === typeId
    ) || null;
}

function getObligationEntry(entryId) {
    return character.obligation.entries.find(
        entry => entry.id === entryId
    ) || null;
}

function getAssignedObligation() {
    return character.obligation.entries.reduce(
        (total, entry) => total + entry.value,
        0
    );
}

function getUnassignedObligation() {
    return getTotalObligation() - getAssignedObligation();
}

function canAddObligationEntry() {
    return getUnassignedObligation() >= 5;
}

function addObligationEntry() {
    if (!canAddObligationEntry()) {
        return false;
    }

    const entry = {
        id: character.obligation.nextEntryId++,
        type: "",
        name: "",
        description: "",
        value: 5
    };

    character.obligation.entries.push(entry);

    return true;
}

function removeObligationEntry(entryId) {
    const index =
        character.obligation.entries.findIndex(
            entry => entry.id === entryId
        );

    if (index === -1) {
        return false;
    }

    character.obligation.entries.splice(index, 1);

    return true;
}

function setObligationEntryType(entryId, typeId) {
    const entry = getObligationEntry(entryId);

    if (!entry) {
        return false;
    }

    if (
        typeId !== "" &&
        !getObligationType(typeId)
    ) {
        return false;
    }

    entry.type = typeId;

    return true;
}

function setObligationEntryName(entryId, name) {
    const entry = getObligationEntry(entryId);

    if (!entry) {
        return false;
    }

    entry.name = name;

    return true;
}

function setObligationEntryDescription(
    entryId,
    description
) {
    const entry = getObligationEntry(entryId);

    if (!entry) {
        return false;
    }

    entry.description = description;

    return true;
}

function canSetObligationEntryValue(
    entryId,
    value
) {
    const entry = getObligationEntry(entryId);

    if (!entry) {
        return false;
    }

    if (
        !Number.isInteger(value) ||
        value < 5 ||
        value % 5 !== 0
    ) {
        return false;
    }

    const otherAssigned =
        getAssignedObligation() -
        entry.value;

    return (
        otherAssigned + value <=
        getTotalObligation()
    );
}

function setObligationEntryValue(
    entryId,
    value
) {
    if (
        !canSetObligationEntryValue(
            entryId,
            value
        )
    ) {
        return false;
    }

    const entry =
        getObligationEntry(entryId);

    entry.value = value;

    return true;
}

function isObligationFullyAssigned() {
    return (
        getAssignedObligation() ===
        getTotalObligation()
    );
}

// ================================================================
// OBLIGATION XP RESTRICTION
// ================================================================

function getNonCharacteristicXPAvailable() {
    /*
     * Obligation XP cannot purchase characteristics.
     *
     * This tells us how much XP remains available for skills
     * and talents after characteristic purchases.
     */

    return (
        getTotalAvailableXP() -
        getCharacteristicXPSpent()
    );
}


// ================================================================
// THRESHOLDS
// ================================================================

function getThresholdProfile() {
    if (!character.thresholdProfile) {
        return null;
    }

    return getThresholdProfileById(
        character.thresholdProfile
    );
}


function getWoundThreshold() {
    const profile = getThresholdProfile();

    if (!profile) {
        return null;
    }

    return (
        profile.woundBase +
        character.characteristics[
            profile.woundCharacteristic
        ]
    );
}


function getStrainThreshold() {
    const profile = getThresholdProfile();

    if (!profile) {
        return null;
    }

    return (
        profile.strainBase +
        character.characteristics[
            profile.strainCharacteristic
        ]
    );
}


function getBaseSoak() {
    return character.characteristics.brawn;
}


// ================================================================
// BACKGROUND VALIDATION
// ================================================================

function getValidBackgroundSkills() {
    const careerSkills = getCurrentCareerSkillIds();

    return GAME_DATA.skills.filter(
        skill => !careerSkills.includes(skill.id)
    );
}


function isValidBackgroundSkill(skillId) {
    return (
        getValidBackgroundSkills()
            .some(skill => skill.id === skillId)
    );
}


function isBackgroundValid() {
    const skills = character.background.skills;

    if (skills.length !== 2) {
        return false;
    }

    if (skills[0] === skills[1]) {
        return false;
    }

    return skills.every(
        skillId => isValidBackgroundSkill(skillId)
    );
}


// ================================================================
// STARTING CAREER SKILL VALIDATION
// ================================================================

function isValidFreeCareerSkill(skillId) {
    return isCareerSkill(skillId);
}


function areFreeCareerSkillsValid() {
    const skills = character.freeCareerSkills;

    if (
        skills.length !==
        GAME_DATA.characterCreation.startingCareerSkillRanks
    ) {
        return false;
    }

    const uniqueSkills = new Set(skills);

    if (uniqueSkills.size !== skills.length) {
        return false;
    }

    return skills.every(
        skillId => isValidFreeCareerSkill(skillId)
    );
}


// ================================================================
// OBLIGATION
// ================================================================

function getTotalObligation() {
    return (
        character.obligation.base +
        character.obligation.additional
    );
}


// ================================================================
// WEALTH
// ================================================================

function getStartingWealth() {
    return (
        GAME_DATA.characterCreation.startingWealth +
        character.obligation.wealthBonus
    );
}


// ============================================================
// EQUIPMENT
// ============================================================

function getEquipmentInstance(instanceId) {
    return character.equipment.find(
        entry => entry.instanceId === instanceId
    ) || null;
}


function getEquipmentItemForInstance(instanceId) {
    const entry = getEquipmentInstance(instanceId);

    if (!entry) return null;

    return getEquipmentById(entry.id);
}


function getEquipmentInstancesById(equipmentId) {
    return character.equipment.filter(
        entry => entry.id === equipmentId
    );
}


function getEquipmentQuantity(equipmentId) {
    return getEquipmentInstancesById(
        equipmentId
    ).length;
}


function getEquipmentSpent() {
    let total = 0;

    for (const entry of character.equipment) {
        const item = getEquipmentById(entry.id);

        if (!item) continue;
        if (item.price === null) continue;

        total += item.price;
    }

    return total;
}


function getWealthRemaining() {
    return (
        getStartingWealth() -
        getEquipmentSpent()
    );
}


// ============================================================
// EQUIPMENT INSTANCE CREATION
// ============================================================

function getDefaultStowedState(item) {
    return (
        item.category === "mount" ||
        item.category === "tack" ||
        item.category === "barding" ||
        item.category === "vehicle"
    );
}


function createEquipmentInstance(equipmentId) {
    const item = getEquipmentById(equipmentId);

    if (!item) return null;

    const entry = {
        instanceId:
            character.nextEquipmentInstanceId++,
        id: equipmentId,
        stowed: getDefaultStowedState(item)
    };

    return entry;
}


// ============================================================
// HARD POINTS
// ============================================================

function getAvailableWeaponHardPoints() {
    let total = 0;

    for (const entry of character.equipment) {
        const item = getEquipmentById(entry.id);

        if (
            !item ||
            item.category !== "weapon"
        ) {
            continue;
        }

        total += item.hardPoints || 0;
    }

    return total;
}


function getAvailableArmorHardPoints() {
    let total = 0;

    for (const entry of character.equipment) {
        const item = getEquipmentById(entry.id);

        if (
            !item ||
            item.category !== "armor"
        ) {
            continue;
        }

        total += item.hardPoints || 0;
    }

    return total;
}


function getUsedWeaponHardPoints() {
    let total = 0;

    for (const entry of character.equipment) {
        const item = getEquipmentById(entry.id);

        if (
            !item ||
            item.category !== "attachment" ||
            item.attachmentType !== "weapon"
        ) {
            continue;
        }

        total += item.hardPointCost || 0;
    }

    return total;
}


function getUsedArmorHardPoints() {
    let total = 0;

    for (const entry of character.equipment) {
        const item = getEquipmentById(entry.id);

        if (
            !item ||
            item.category !== "attachment" ||
            item.attachmentType !== "armor"
        ) {
            continue;
        }

        total += item.hardPointCost || 0;
    }

    return total;
}


function hasValidEquipmentHardPoints() {
    return (
        getUsedWeaponHardPoints() <=
            getAvailableWeaponHardPoints() &&
        getUsedArmorHardPoints() <=
            getAvailableArmorHardPoints()
    );
}


function canAddAttachment(item) {
    if (
        !item ||
        item.category !== "attachment"
    ) {
        return true;
    }

    const cost = item.hardPointCost || 0;

    if (item.attachmentType === "weapon") {
        return (
            getUsedWeaponHardPoints() + cost <=
            getAvailableWeaponHardPoints()
        );
    }

    if (item.attachmentType === "armor") {
        return (
            getUsedArmorHardPoints() + cost <=
            getAvailableArmorHardPoints()
        );
    }

    return false;
}


// ============================================================
// BUYING EQUIPMENT
// ============================================================

function canPurchaseEquipment(equipmentId) {
    const item = getEquipmentById(equipmentId);

    if (!item) return false;

    if (item.purchasable === false) {
        return false;
    }

    if (
        item.price === null ||
        item.price === undefined
    ) {
        return false;
    }

    if (item.price > getWealthRemaining()) {
        return false;
    }

    if (!canAddAttachment(item)) {
        return false;
    }

    return true;
}


function purchaseEquipment(equipmentId) {
    if (!canPurchaseEquipment(equipmentId)) {
        return false;
    }

    const entry =
        createEquipmentInstance(equipmentId);

    if (!entry) return false;

    character.equipment.push(entry);

    return true;
}


// ============================================================
// REFUNDS
// ============================================================

function canRefundEquipment(instanceId) {
    const index =
        character.equipment.findIndex(
            entry =>
                entry.instanceId === instanceId
        );

    if (index === -1) return false;

    const removed =
        character.equipment.splice(index, 1)[0];

    const valid =
        hasValidEquipmentHardPoints();

    character.equipment.splice(
        index,
        0,
        removed
    );

    return valid;
}


function refundEquipment(instanceId) {
    if (!canRefundEquipment(instanceId)) {
        return false;
    }

    const index =
        character.equipment.findIndex(
            entry =>
                entry.instanceId === instanceId
        );

    if (index === -1) return false;

    character.equipment.splice(index, 1);

    if (
        character.equippedArmor ===
        instanceId
    ) {
        character.equippedArmor = null;
    }

    return true;
}


// ============================================================
// STOWED STATE
// ============================================================

function setEquipmentStowed(
    instanceId,
    stowed
) {
    const entry =
        getEquipmentInstance(instanceId);

    if (!entry) return false;

    if (
        stowed &&
        character.equippedArmor ===
            instanceId
    ) {
        character.equippedArmor = null;
    }

    entry.stowed = Boolean(stowed);

    return true;
}


// ============================================================
// EQUIPPED ARMOR
// ============================================================

function getEquippedArmorEntry() {
    if (
        character.equippedArmor === null
    ) {
        return null;
    }

    return getEquipmentInstance(
        character.equippedArmor
    );
}


function getEquippedArmor() {
    const entry =
        getEquippedArmorEntry();

    if (!entry) return null;

    const item = getEquipmentById(entry.id);

    if (
        !item ||
        item.category !== "armor"
    ) {
        return null;
    }

    return item;
}


function equipArmor(instanceId) {
    if (
        instanceId === null ||
        instanceId === ""
    ) {
        character.equippedArmor = null;
        return true;
    }

    const entry =
        getEquipmentInstance(instanceId);

    if (!entry) return false;

    const item =
        getEquipmentById(entry.id);

    if (
        !item ||
        item.category !== "armor"
    ) {
        return false;
    }

    entry.stowed = false;

    character.equippedArmor =
        instanceId;

    return true;
}


function getArmorSoakBonus() {
    const armor = getEquippedArmor();

    return armor
        ? armor.soak || 0
        : 0;
}


function getArmorDefense() {
    const armor = getEquippedArmor();

    return armor
        ? armor.defense || 0
        : 0;
}


// ============================================================
// ENCUMBRANCE
// ============================================================

function getBaseEncumbranceThreshold() {
    const hasActiveBackpack = character.equipment.some(
        entry =>
            entry.itemId === "backpack" &&
            !entry.stowed
    );
    return (
        5 + character.characteristics.brawn +
        (hasActiveBackpack ? 4 : 0)
    );
}


function getBackpackEncumbranceBonus() {
    let bonus = 0;

    for (const entry of character.equipment) {
        if (entry.stowed) continue;

        if (entry.id === "backpack") {
            bonus += 4;
        }
    }

    return bonus;
}


function getEncumbranceThreshold() {
    return (
        getBaseEncumbranceThreshold() +
        getBackpackEncumbranceBonus()
    );
}


function getEquipmentInstanceEncumbrance(
    entry
) {
    if (!entry) return 0;
    if (entry.stowed) return 0;

    const item = getEquipmentById(entry.id);

    if (!item) return 0;

    if (
        item.encumbrance === null ||
        item.encumbrance === undefined
    ) {
        return 0;
    }

    let encumbrance = item.encumbrance;

    if (
        character.equippedArmor ===
            entry.instanceId &&
        item.category === "armor"
    ) {
        encumbrance =
            Math.max(
                encumbrance - 3,
                0
            );
    }

    return encumbrance;
}


function getCurrentEncumbrance() {
    let total = 0;

    for (const entry of character.equipment) {
        total +=
            getEquipmentInstanceEncumbrance(
                entry
            );
    }

    return total;
}


// ============================================================
// STARTING PACKAGE
// ============================================================

function getCurrentStartingEquipmentPackage() {
    if (!character.specialization) {
        return null;
    }

    return getSpecializationEquipmentPackage(
        character.specialization
    );
}


function canPurchaseEquipmentPackage(
    packageId
) {
    const equipmentPackage =
        getStartingEquipmentPackage(
            packageId
        );

    if (!equipmentPackage) {
        return false;
    }

    const cost =
        getStartingEquipmentPackageCost(
            packageId
        );

    if (
        cost === null ||
        cost > getWealthRemaining()
    ) {
        return false;
    }

    /*
     * Packages currently contain no
     * attachments, so ordinary hard-point
     * validation is sufficient.
     */

    return true;
}


function purchaseEquipmentPackage(
    packageId
) {
    if (
        !canPurchaseEquipmentPackage(
            packageId
        )
    ) {
        return false;
    }

    const equipmentPackage =
        getStartingEquipmentPackage(
            packageId
        );

    const addedInstanceIds = [];

    for (
        const packageItem of
        equipmentPackage.items
    ) {
        for (
            let i = 0;
            i < packageItem.quantity;
            i++
        ) {
            const success =
                purchaseEquipment(
                    packageItem.id
                );

            if (!success) {
                /*
                 * Roll back the entire package
                 * if any individual purchase
                 * unexpectedly fails.
                 */
                for (
                    const instanceId of
                    addedInstanceIds
                ) {
                    const index =
                        character.equipment
                            .findIndex(
                                entry =>
                                    entry.instanceId ===
                                    instanceId
                            );

                    if (index !== -1) {
                        character.equipment.splice(
                            index,
                            1
                        );
                    }
                }

                return false;
            }

            addedInstanceIds.push(
                character.equipment[
                    character.equipment.length - 1
                ].instanceId
            );
        }
    }

    return true;
}


// ================================================================
// GENERAL VALIDATION
// ================================================================

function validateCharacter() {
    const errors = [];

    if (!character.thresholdProfile) {
        errors.push("Choose a threshold profile.");
    }

    if (!character.career) {
        errors.push("Choose a Career.");
    }

    if (!character.specialization) {
        errors.push("Choose a Specialization.");
    }

    if (
        character.career &&
        character.specialization &&
        !areFreeCareerSkillsValid()
    ) {
        errors.push(
            "Choose exactly four valid starting Career skills."
        );
    }

    if (
        character.career &&
        character.specialization &&
        !isBackgroundValid()
    ) {
        errors.push(
            "Choose two different non-career Background skills."
        );
    }

    if (getXPRemaining() < 0) {
        errors.push("Character has spent too much XP.");
    }

    return errors;
}
