/*
 * ASOIAF Genesys Character Builder
 * equipment-data.js
 *
 * Loads equipment data from category-specific CSV files and
 * normalizes it into GAME_DATA.equipment.
 */

"use strict";


// ============================================================
// EQUIPMENT DATA FILES
// ============================================================

const EQUIPMENT_DATA_FILES = {
    weapon: "data/equipment/weapons.csv",
    armor: "data/equipment/armor.csv",
    gear: "data/equipment/gear.csv",
    mount: "data/equipment/mounts.csv",
    vehicle: "data/equipment/vehicles.csv",
    attachment: "data/equipment/attachments.csv",
};


// ============================================================
// PUBLIC LOADER
// ============================================================

async function loadEquipmentData() {
    const groups = await Promise.all(
        Object.entries(EQUIPMENT_DATA_FILES).map(
            async ([category, path]) => {
                const rows = await loadCSV(path);

                return rows.map(row =>
                    normalizeEquipmentRow(
                        category,
                        row
                    )
                );
            }
        )
    );

    GAME_DATA.equipment = groups.flat();

    return GAME_DATA.equipment;
}


// ============================================================
// CSV LOADING
// ============================================================

async function loadCSV(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(
            `Could not load ${path}: ` +
            `${response.status} ${response.statusText}`
        );
    }

    const text = await response.text();

    return parseCSV(text);
}


// ============================================================
// CSV PARSER
// ============================================================

function parseCSV(text) {
    const rows = [];

    let row = [];
    let field = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const character = text[i];

        if (insideQuotes) {
            if (character === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    insideQuotes = false;
                }
            } else {
                field += character;
            }

            continue;
        }

        if (character === '"') {
            insideQuotes = true;
            continue;
        }

        if (character === ",") {
            row.push(field);
            field = "";
            continue;
        }

        if (character === "\n") {
            row.push(field);
            rows.push(row);

            row = [];
            field = "";

            continue;
        }

        if (character !== "\r") {
            field += character;
        }
    }

    if (
        field.length > 0 ||
        row.length > 0
    ) {
        row.push(field);
        rows.push(row);
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(
        header => header.trim()
    );

    return rows
        .slice(1)
        .filter(row =>
            row.some(field =>
                field.trim() !== ""
            )
        )
        .map(row => {
            const result = {};

            headers.forEach(
                (header, index) => {
                    result[header] =
                        row[index] ?? "";
                }
            );

            return result;
        });
}


// ============================================================
// EQUIPMENT NORMALIZATION
// ============================================================

function normalizeEquipmentRow(
    category,
    row
) {
    switch (category) {
        case "weapon":
            return normalizeWeapon(row);

        case "armor":
            return normalizeArmor(row);

        case "gear":
            return normalizeGear(row);

        case "mount":
            return normalizeMount(row);

        case "tack":
            return normalizeTack(row);

        case "barding":
            return normalizeBarding(row);

        case "vehicle":
            return normalizeVehicle(row);

        case "attachment":
            return normalizeAttachment(row);

        default:
            throw new Error(
                `Unknown equipment category: ${category}`
            );
    }
}


// ============================================================
// WEAPONS
// ============================================================

function normalizeWeapon(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "weapon",

        skill: row.skill,

        damage: {
            type: row.damageType,
            value: csvNumber(row.damage)
        },

        critical: csvNumber(row.critical),
        range: row.range,

        encumbrance:
            csvNullableNumber(
                row.encumbrance
            ),

        hardPoints:
            csvNumber(
                row.hardPoints
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            ),

        qualities:
            parseQualities(
                row.qualities
            )
    };

    if (hasCSVValue(row.thrownRange)) {
        item.thrownRange =
            row.thrownRange;
    }

    if (hasCSVValue(row.effect)) {
        item.description =
            row.effect;
    }

    return item;
}


// ============================================================
// ARMOR
// ============================================================

function normalizeArmor(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "armor",
        subtype: row.subtype?.trim().toLowerCase() || "personal",

        defense: csvNumber(row.defense),
        soak: csvNumber(row.soak),
        encumbrance: csvNullableNumber(row.encumbrance),
        hardPoints: csvNumber(row.hardPoints),
        price: csvNullableNumber(row.price),
        rarity: csvNullableNumber(row.rarity),
        qualities: parseQualities(row.qualities)
    };

    if (hasCSVValue(row.effect)) {
        item.description = row.effect;
    }

    return item;
}


// ============================================================
// GENERAL GEAR
// ============================================================

function normalizeGear(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "gear",
        subtype: row.subtype,

        encumbrance:
            csvNullableNumber(
                row.encumbrance
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            )
    };

    if (hasCSVValue(row.effect)) {
        item.description =
            row.effect;
    }

    return item;
}


// ============================================================
// MOUNTS
// ============================================================

function normalizeMount(row) {
    return {
        id: row.id,
        name: row.name,
        category: "mount",

        brawn:
            csvNumber(
                row.brawn
            ),

        agility:
            csvNumber(
                row.agility
            ),

        soak:
            csvNumber(
                row.soak
            ),

        woundThreshold:
            csvNumber(
                row.woundThreshold
            ),

        encumbranceCapacity:
            csvNumber(
                row.encumbranceCapacity
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            ),

        skills:
            parseSkills(
                row.skills
            ),

        attacks:
            parseJSONField(
                row.attacks,
                []
            ),

        abilities:
            parseAbilities(
                row.abilities
            )
    };
}


// ============================================================
// TACK
// ============================================================

function normalizeTack(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "tack",

        encumbrance:
            csvNullableNumber(
                row.encumbrance
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            )
    };

    if (hasCSVValue(row.effect)) {
        item.description =
            row.effect;
    }

    return item;
}


// ============================================================
// BARDING
// ============================================================

function normalizeBarding(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "barding",

        defense:
            csvNumber(
                row.defense
            ),

        soak:
            csvNumber(
                row.soak
            ),

        encumbrance:
            csvNullableNumber(
                row.encumbrance
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            )
    };

    if (hasCSVValue(row.effect)) {
        item.description =
            row.effect;
    }

    return item;
}


// ============================================================
// VEHICLES
// ============================================================

function normalizeVehicle(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "vehicle",

        encumbrance:
            csvNullableNumber(
                row.encumbrance
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            )
    };

    if (hasCSVValue(row.effect)) {
        item.description =
            row.effect;
    }

    return item;
}


// ============================================================
// ATTACHMENTS
// ============================================================

function normalizeAttachment(row) {
    const item = {
        id: row.id,
        name: row.name,
        category: "attachment",

        attachmentType:
            row.attachmentType,

        hardPointCost:
            csvNumber(
                row.hardPointCost
            ),

        price:
            csvNullableNumber(
                row.price
            ),

        rarity:
            csvNullableNumber(
                row.rarity
            ),

        purchasable:
            csvBoolean(
                row.purchasable
            )
    };

    if (hasCSVValue(row.effect)) {
        item.description =
            row.effect;
    }

    return item;
}


// ============================================================
// STRUCTURED CSV FIELDS
// ============================================================

function parseQualities(value) {
    if (!hasCSVValue(value)) {
        return [];
    }

    return value
        .split("|")
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            const match =
                part.match(
                    /^(.*?)(?:\s+(\d+))?$/
                );

            const quality = {
                name:
                    match[1].trim()
            };

            if (
                match[2] !== undefined
            ) {
                quality.rating =
                    Number(match[2]);
            }

            return quality;
        });
}


function parseSkills(value) {
    if (!hasCSVValue(value)) {
        return {};
    }

    const skills = {};

    value
        .split("|")
        .map(part => part.trim())
        .filter(Boolean)
        .forEach(part => {
            const separator =
                part.lastIndexOf(":");

            if (separator === -1) {
                skills[part] = 0;
                return;
            }

            const skill =
                part
                    .slice(
                        0,
                        separator
                    )
                    .trim();

            const rank =
                Number(
                    part
                        .slice(
                            separator + 1
                        )
                        .trim()
                );

            skills[skill] = rank;
        });

    return skills;
}


function parseAbilities(value) {
    if (!hasCSVValue(value)) {
        return [];
    }

    return value
        .split("|")
        .map(part => part.trim())
        .filter(Boolean);
}


function parseJSONField(
    value,
    fallback
) {
    if (!hasCSVValue(value)) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        console.error(
            "Could not parse JSON CSV field:",
            value,
            error
        );

        return fallback;
    }
}


// ============================================================
// VALUE CONVERSION
// ============================================================

function hasCSVValue(value) {
    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );
}


function csvNumber(value) {
    if (!hasCSVValue(value)) {
        return 0;
    }

    return Number(value);
}


function csvNullableNumber(value) {
    if (!hasCSVValue(value)) {
        return null;
    }

    return Number(value);
}


function csvBoolean(value) {
    if (!hasCSVValue(value)) {
        return false;
    }

    return (
        String(value)
            .trim()
            .toLowerCase() ===
        "true"
    );
}