/*
 * ASOIAF Genesys Character Builder
 * talent-data.js
 *
 * Loads talent data from CSV and normalizes it into
 * GAME_DATA.talents.
 */

"use strict";


// ============================================================
// TALENT DATA FILE
// ============================================================

const TALENT_DATA_FILE =
    "data/talents.csv";


// ============================================================
// PUBLIC LOADER
// ============================================================

async function loadTalentData() {
    const rows =
        await loadCSV(
            TALENT_DATA_FILE
        );

    GAME_DATA.talents =
        rows.map(
            normalizeTalentRow
        );

    return GAME_DATA.talents;
}


// ============================================================
// TALENT NORMALIZATION
// ============================================================

function normalizeTalentRow(row) {
    return {
        id: row.id,
        name: row.name,

        tier:
            csvNumber(
                row.tier
            ),

        activation:
            row.activation,

        ranked:
            csvBoolean(
                row.ranked
            ),

        prerequisites:
            parseTalentPrerequisites(
                row.prerequisites
            ),

        description:
            row.description || ""
    };
}


// ============================================================
// PREREQUISITES
// ============================================================

function parseTalentPrerequisites(value) {
    if (!hasCSVValue(value)) {
        return [];
    }

    return value
        .split("|")
        .map(
            prerequisite =>
                prerequisite.trim()
        )
        .filter(Boolean);
}