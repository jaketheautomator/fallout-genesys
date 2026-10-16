/*
 * ASOIAF Genesys Character Builder
 * report.js
 *
 * Generates a simple text-based PDF character report.
 *
 * No external PDF library is required.
 */

"use strict";


// ================================================================
// REPORT ENTRY POINT
// ================================================================

function exportCharacterReport() {
    const lines =
        buildCharacterReportLines();

    const pdf =
        createSimplePDF(lines);

    const blob =
        new Blob(
            [pdf],
            {
                type: "application/pdf"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    const filename =
        makeReportFilename(
            character.name
        );

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(
        () => {
            URL.revokeObjectURL(url);
        },
        1000
    );
}


// ================================================================
// REPORT CONTENT
// ================================================================

function buildCharacterReportLines() {
    const lines = [];

    addReportTitle(
        lines,
        character.name ||
            "Unnamed Character"
    );


    // ------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "CHARACTER SUMMARY"
    );

    addReportField(
        lines,
        "Career",
        getReportCareerName()
    );

    addReportField(
        lines,
        "Specialization",
        getReportSpecializationName()
    );

    addReportField(
        lines,
        "Background",
        character.background.name || "-"
    );

    addReportField(
        lines,
        "XP",
        `${getXPSpent()} spent / ` +
        `${getTotalAvailableXP()} available / ` +
        `${getXPRemaining()} remaining`
    );

    addReportField(
        lines,
        "Obligation",
        getTotalObligation()
    );

    addReportField(
        lines,
        "Wealth",
        `${getWealthRemaining().toLocaleString()} ` +
        "silver stags remaining"
    );

    addReportBlank(lines);


    // ------------------------------------------------------------
    // Characteristics
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "CHARACTERISTICS"
    );

    for (
        const characteristic of
        GAME_DATA.characteristics
    ) {
        addReportField(
            lines,
            characteristic.name,
            character.characteristics[
                characteristic.id
            ]
        );
    }

    addReportBlank(lines);


    // ------------------------------------------------------------
    // Derived statistics
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "DERIVED STATISTICS"
    );

    addReportField(
        lines,
        "Wound Threshold",
        getWoundThreshold() ?? "-"
    );

    addReportField(
        lines,
        "Strain Threshold",
        getStrainThreshold() ?? "-"
    );

    addReportField(
        lines,
        "Soak",
        getBaseSoak() +
            getArmorSoakBonus()
    );

    addReportField(
        lines,
        "Defense",
        getArmorDefense()
    );

    addReportField(
        lines,
        "Encumbrance",
        `${getCurrentEncumbrance()} / ` +
        `${getEncumbranceThreshold()}`
    );

    const armor =
        getEquippedArmor();

    addReportField(
        lines,
        "Equipped Armor",
        armor
            ? armor.name
            : "None"
    );

    addReportBlank(lines);


    // ------------------------------------------------------------
    // Background
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "BACKGROUND"
    );

    addReportField(
        lines,
        "Background",
        character.background.name || "-"
    );

    if (
        character.background.skills.length >
        0
    ) {
        addReportField(
            lines,
            "Background Skills",
            character.background.skills
                .map(getReportSkillName)
                .join(", ")
        );
    } else {
        addReportField(
            lines,
            "Background Skills",
            "-"
        );
    }

    addReportBlank(lines);


    // ------------------------------------------------------------
    // Obligation
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "OBLIGATION"
    );

    addReportField(
        lines,
        "Total Obligation",
        getTotalObligation()
    );

    addReportField(
        lines,
        "Assigned",
        getAssignedObligation()
    );

    if (
        getUnassignedObligation() > 0
    ) {
        addReportField(
            lines,
            "Unassigned",
            getUnassignedObligation()
        );
    }

    addReportField(
        lines,
        "Obligation XP",
        `+${getObligationBonusXP()} XP`
    );

    addReportField(
        lines,
        "Obligation Wealth",
        `+${character.obligation.wealthBonus
            .toLocaleString()} silver stags`
    );

    if (
        character.obligation.entries.length >
        0
    ) {
        addReportBlank(lines);

        for (
            const entry of
            character.obligation.entries
        ) {
            const type =
                getObligationType(
                    entry.type
                );

            const headingParts = [];

            if (type) {
                headingParts.push(
                    type.name
                );
            }

            if (entry.name) {
                headingParts.push(
                    entry.name
                );
            }

            const heading =
                headingParts.length > 0
                    ? headingParts.join(
                        " - "
                    )
                    : "Obligation";

            addReportSubheading(
                lines,
                `${heading} (${entry.value})`
            );

            if (entry.description) {
                addReportParagraph(
                    lines,
                    entry.description
                );
            }
        }
    }

    addReportBlank(lines);


    // ------------------------------------------------------------
    // Skills
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "SKILLS"
    );

    const rankedSkills =
        GAME_DATA.skills
            .map(
                skill => ({
                    skill,
                    rank:
                        getTotalSkillRank(
                            skill.id
                        )
                })
            )
            .filter(
                entry =>
                    entry.rank > 0
            )
            .sort(
                (a, b) =>
                    a.skill.name.localeCompare(
                        b.skill.name
                    )
            );

    if (rankedSkills.length === 0) {
        addReportParagraph(
            lines,
            "No trained skills."
        );
    } else {
        for (
            const entry of
            rankedSkills
        ) {
            const tags = [];

            if (
                isCareerSkill(
                    entry.skill.id
                )
            ) {
                tags.push("Career");
            }

            if (
                character.background.skills
                    .includes(
                        entry.skill.id
                    )
            ) {
                tags.push("Background");
            }

            const suffix =
                tags.length > 0
                    ? ` (${tags.join(", ")})`
                    : "";

            addReportField(
                lines,
                `${entry.skill.name}${suffix}`,
                entry.rank
            );
        }
    }

    addReportBlank(lines);


    // ------------------------------------------------------------
    // Talents
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "TALENTS"
    );

    const purchasedTalents =
        GAME_DATA.talents
            .map(
                talent => ({
                    talent,
                    rank:
                        getTalentRank(
                            talent.id
                        )
                })
            )
            .filter(
                entry =>
                    entry.rank > 0
            )
            .sort(
                (a, b) => {
                    const tierDifference =
                        a.talent.tier -
                        b.talent.tier;

                    if (
                        tierDifference !== 0
                    ) {
                        return tierDifference;
                    }

                    return a.talent.name
                        .localeCompare(
                            b.talent.name
                        );
                }
            );

    if (
        purchasedTalents.length === 0
    ) {
        addReportParagraph(
            lines,
            "No talents purchased."
        );
    } else {
        for (
            const entry of
            purchasedTalents
        ) {
            const talent =
                entry.talent;

            const rankText =
                talent.ranked
                    ? ` Rank ${entry.rank}`
                    : "";

            addReportSubheading(
                lines,
                `${talent.name}${rankText}`
            );

            const tiers = [];

            for (
                let rank = 1;
                rank <= entry.rank;
                rank++
            ) {
                tiers.push(
                    getTalentEffectiveTier(
                        talent.id,
                        rank
                    )
                );
            }

            addReportField(
                lines,
                entry.rank > 1
                    ? "Occupied Tiers"
                    : "Tier",
                tiers.join(", ")
            );

            addReportField(
                lines,
                "Activation",
                talent.activation
            );

            if (
                talent.prerequisites.length >
                0
            ) {
                const prerequisites =
                    talent.prerequisites.map(
                        id => {
                            const prerequisite =
                                getTalentById(id);

                            return prerequisite
                                ? prerequisite.name
                                : id;
                        }
                    );

                addReportField(
                    lines,
                    "Prerequisite",
                    prerequisites.join(", ")
                );
            }

            if (talent.description) {
                addReportParagraph(
                    lines,
                    talent.description
                );
            }
        }
    }

    addReportBlank(lines);
    addReportPageBreak(lines);

    // ------------------------------------------------------------
    // Equipment
    // ------------------------------------------------------------

    addReportHeading(
        lines,
        "EQUIPMENT"
    );

    addReportField(
        lines,
        "Remaining Wealth",
        `${getWealthRemaining()
            .toLocaleString()} silver stags`
    );

    addReportBlank(lines);

    if (
        character.equipment.length === 0
    ) {
        addReportParagraph(
            lines,
            "No equipment purchased."
        );
    } else {
        for (
            const entry of
            character.equipment
        ) {
            const item =
                getEquipmentById(
                    entry.id
                );

            if (!item) {
                continue;
            }

            const status = [];

            if (
                character.equippedArmor ===
                entry.instanceId
            ) {
                status.push("Equipped");
            }

            if (entry.stowed) {
                status.push("Stowed");
            }

            const statusText =
                status.length > 0
                    ? ` [${status.join(", ")}]`
                    : "";

            addReportSubheading(
                lines,
                `${item.name}${statusText}`
            );

            const basicDetails = [];

            basicDetails.push(
                `${formatEquipmentCategory(
                    item.category
                )}`
            );

            if (
                item.price !== null &&
                item.price !== undefined
            ) {
                basicDetails.push(
                    `Price: ${item.price.toLocaleString()} stags`
                );
            }

            if (
                item.encumbrance !== null &&
                item.encumbrance !== undefined
            ) {
                basicDetails.push(
                    `Enc: ${getEquipmentInstanceEncumbrance(
                        entry
                    )}`
                );
            }

            addReportParagraph(
                lines,
                basicDetails.join(" | ")
            );

            addEquipmentReportDetails(
                lines,
                item
            );

            
        }
    }

    return lines;
}


// ================================================================
// EQUIPMENT DETAILS
// ================================================================

function addEquipmentReportDetails(
    lines,
    item
) {
    const details = [];


    // ------------------------------------------------------------
    // Weapons
    // ------------------------------------------------------------

    if (item.category === "weapon") {

        if (item.skill) {
            details.push(
                `Skill: ${getReportSkillName(
                    item.skill
                )}`
            );
        }

        if (item.damage) {
            details.push(
                `Damage: ${formatReportWeaponDamage(
                    item.damage
                )}`
            );
        }

        if (
            item.critical !== null &&
            item.critical !== undefined
        ) {
            details.push(
                `Critical: ${item.critical}`
            );
        }

        if (item.range) {
            details.push(
                `Range: ${item.range}`
            );
        }

        if (
            Array.isArray(
                item.qualities
            ) &&
            item.qualities.length > 0
        ) {
            details.push(
                `Qualities: ${formatReportQualities(
                    item.qualities
                )}`
            );
        }
    }


    // ------------------------------------------------------------
    // Armor
    // ------------------------------------------------------------

    else if (item.category === "armor") {

        details.push(
            `Defense: ${item.defense || 0}`
        );

        details.push(
            `Soak: ${item.soak || 0}`
        );
    }


    // ------------------------------------------------------------
    // Attachments
    // ------------------------------------------------------------

    else if (item.category === "attachment") {

        details.push(
            `Type: ${item.attachmentType || "-"}`
        );

        details.push(
            `HP Cost: ${item.hardPointCost || 0}`
        );
    }


    // ------------------------------------------------------------
    // Mounts
    // ------------------------------------------------------------

    else if (item.category === "mount") {

        if (item.brawn !== undefined) {
            details.push(
                `Brawn: ${item.brawn}`
            );
        }

        if (item.agility !== undefined) {
            details.push(
                `Agility: ${item.agility}`
            );
        }

        if (item.soak !== undefined) {
            details.push(
                `Soak: ${item.soak}`
            );
        }

        if (
            item.woundThreshold !==
            undefined
        ) {
            details.push(
                `WT: ${item.woundThreshold}`
            );
        }

        if (
            item.encumbranceCapacity !==
            undefined
        ) {
            details.push(
                `Capacity: ${item.encumbranceCapacity}`
            );
        }
    }


    // ------------------------------------------------------------
    // Print all details on one line
    // ------------------------------------------------------------

    if (details.length > 0) {
        addReportParagraph(
            lines,
            details.join(" | ")
        );
    }
}


// ================================================================
// REPORT HELPERS
// ================================================================

function getReportCareerName() {
    if (!character.career) {
        return "-";
    }

    const career =
        getCareerById(
            character.career
        );

    return career
        ? career.name
        : character.career;
}


function getReportSpecializationName() {
    if (
        !character.career ||
        !character.specialization
    ) {
        return "-";
    }

    const specialization =
        getSpecializationById(
            character.career,
            character.specialization
        );

    return specialization
        ? specialization.name
        : character.specialization;
}


function getReportSkillName(skillId) {
    const skill =
        getSkillById(skillId);

    return skill
        ? skill.name
        : skillId;
}


function formatReportWeaponDamage(
    damage
) {
    if (
        !damage ||
        damage.value === undefined
    ) {
        return "-";
    }

    if (
        damage.type ===
        "brawn-plus"
    ) {
        return `Brawn + ${damage.value}`;
    }

    return String(
        damage.value
    );
}


function formatReportQualities(
    qualities
) {
    return qualities
        .map(
            quality => {
                if (
                    typeof quality ===
                    "string"
                ) {
                    return quality;
                }

                if (
                    quality &&
                    quality.name
                ) {
                    if (
                        quality.rating !==
                        undefined
                    ) {
                        return (
                            `${quality.name} ` +
                            `${quality.rating}`
                        );
                    }

                    return quality.name;
                }

                return String(quality);
            }
        )
        .join(", ");
}


// ================================================================
// REPORT LINE MODEL
// ================================================================

function addReportTitle(
    lines,
    text
) {
    lines.push({
        type: "title",
        text
    });
}


function addReportHeading(
    lines,
    text
) {
    lines.push({
        type: "heading",
        text
    });
}


function addReportSubheading(
    lines,
    text
) {
    lines.push({
        type: "subheading",
        text
    });
}


function addReportField(
    lines,
    label,
    value
) {
    lines.push({
        type: "text",
        text:
            `${label}: ${value}`
    });
}


function addReportParagraph(
    lines,
    text
) {
    lines.push({
        type: "paragraph",
        text
    });
}


function addReportBlank(lines) {
    lines.push({
        type: "blank",
        text: ""
    });
}

function addReportPageBreak(lines) {
    lines.push({
        type: "pagebreak",
        text: ""
    });
}

// ================================================================
// SIMPLE PDF GENERATOR
// ================================================================

function createSimplePDF(reportLines) {

    /*
     * Letter-size page in PDF points.
     */
    const pageWidth = 612;
    const pageHeight = 792;

    const marginLeft = 48;
    const marginRight = 48;
    const marginTop = 48;
    const marginBottom = 48;

    const usableWidth =
        pageWidth -
        marginLeft -
        marginRight;

    const pages = [];

    let page = [];
    let y =
        pageHeight -
        marginTop;


    function newPage() {
        if (page.length > 0) {
            pages.push(page);
        }

        page = [];

        y =
            pageHeight -
            marginTop;
    }


    function ensureSpace(height) {
        if (
            y - height <
            marginBottom
        ) {
            newPage();
        }
    }


    function addPDFText(
        text,
        size,
        bold,
        indent = 0,
        spacingAfter = 4
    ) {
        const safeText =
            sanitizePDFText(text);

        const maxCharacters =
            Math.max(
                20,
                Math.floor(
                    (
                        usableWidth -
                        indent
                    ) /
                    (
                        size * 0.52
                    )
                )
            );

        const wrapped =
            wrapReportText(
                safeText,
                maxCharacters
            );

        const lineHeight =
            size * 1.25;

        ensureSpace(
            wrapped.length *
            lineHeight +
            spacingAfter
        );

        for (
            const line of
            wrapped
        ) {
            page.push({
                text: line,
                x:
                    marginLeft +
                    indent,
                y,
                size,
                bold
            });

            y -= lineHeight;
        }

        y -= spacingAfter;
    }


    for (
        const line of
        reportLines
    ) {
        switch (line.type) {

            case "title":
                addPDFText(
                    line.text,
                    18,
                    true,
                    0,
                    14
                );
                break;

            case "heading":
                addPDFText(
                    line.text,
                    12,
                    true,
                    0,
                    6
                );
                break;

            case "subheading":
                addPDFText(
                    line.text,
                    10,
                    true,
                    10,
                    2
                );
                break;

            case "paragraph":
                addPDFText(
                    line.text,
                    9,
                    false,
                    10,
                    7
                );
                break;

            case "blank":
                ensureSpace(8);
                y -= 8;
                break;

            case "pagebreak":
                newPage();
                break;
            default:
                addPDFText(
                    line.text,
                    9,
                    false,
                    10,
                    2
                );
                break;
        }
    }


    if (page.length > 0) {
        pages.push(page);
    }


    return buildPDFDocument(
        pages,
        pageWidth,
        pageHeight
    );
}


// ================================================================
// PDF SERIALIZATION
// ================================================================

function buildPDFDocument(
    pages,
    pageWidth,
    pageHeight
) {
    const objects = [];

    /*
     * Object numbering:
     *
     * 1 = Catalog
     * 2 = Pages
     * 3 = Helvetica
     * 4 = Helvetica Bold
     *
     * Then each page uses:
     * Page object
     * Content object
     */

    const pageObjectNumbers = [];

    for (
        let i = 0;
        i < pages.length;
        i++
    ) {
        pageObjectNumbers.push(
            5 + i * 2
        );
    }


    objects[1] =
        "<< /Type /Catalog /Pages 2 0 R >>";


    objects[2] =
        "<< /Type /Pages " +
        `/Count ${pages.length} ` +
        `/Kids [${pageObjectNumbers
            .map(
                number =>
                    `${number} 0 R`
            )
            .join(" ")}] >>`;


    objects[3] =
        "<< /Type /Font " +
        "/Subtype /Type1 " +
        "/BaseFont /Helvetica >>";


    objects[4] =
        "<< /Type /Font " +
        "/Subtype /Type1 " +
        "/BaseFont /Helvetica-Bold >>";


    for (
        let i = 0;
        i < pages.length;
        i++
    ) {
        const pageNumber =
            5 + i * 2;

        const contentNumber =
            pageNumber + 1;

        const commands =
            pages[i]
                .map(
                    item =>
                        makePDFTextCommand(
                            item
                        )
                )
                .join("\n");


        objects[pageNumber] =
            "<< /Type /Page " +
            "/Parent 2 0 R " +
            `/MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
            "/Resources << " +
            "/Font << " +
            "/F1 3 0 R " +
            "/F2 4 0 R " +
            ">> >> " +
            `/Contents ${contentNumber} 0 R >>`;


        objects[contentNumber] =
            "<< /Length " +
            byteLength(commands) +
            " >>\n" +
            "stream\n" +
            commands +
            "\nendstream";
    }


    let pdf =
        "%PDF-1.4\n";

    const offsets = [0];


    for (
        let i = 1;
        i < objects.length;
        i++
    ) {
        offsets[i] =
            byteLength(pdf);

        pdf +=
            `${i} 0 obj\n` +
            `${objects[i]}\n` +
            "endobj\n";
    }


    const xrefOffset =
        byteLength(pdf);


    pdf +=
        "xref\n" +
        `0 ${objects.length}\n` +
        "0000000000 65535 f \n";


    for (
        let i = 1;
        i < objects.length;
        i++
    ) {
        pdf +=
            String(offsets[i])
                .padStart(10, "0") +
            " 00000 n \n";
    }


    pdf +=
        "trailer\n" +
        "<< " +
        `/Size ${objects.length} ` +
        "/Root 1 0 R " +
        ">>\n" +
        "startxref\n" +
        `${xrefOffset}\n` +
        "%%EOF";


    return pdf;
}


function makePDFTextCommand(item) {
    const font =
        item.bold
            ? "F2"
            : "F1";

    return (
        "BT\n" +
        `/${font} ${item.size} Tf\n` +
        `1 0 0 1 ${item.x} ${item.y} Tm\n` +
        `(${escapePDFString(item.text)}) Tj\n` +
        "ET"
    );
}


// ================================================================
// TEXT HELPERS
// ================================================================

function wrapReportText(
    text,
    maxCharacters
) {
    if (!text) {
        return [""];
    }

    const words =
        String(text)
            .split(/\s+/);

    const lines = [];

    let current = "";


    for (const word of words) {

        if (
            current.length === 0
        ) {
            current = word;
            continue;
        }


        if (
            current.length +
            word.length +
            1 <=
            maxCharacters
        ) {
            current +=
                ` ${word}`;
        } else {
            lines.push(current);
            current = word;
        }
    }


    if (current.length > 0) {
        lines.push(current);
    }


    return lines.length > 0
        ? lines
        : [""];
}


function sanitizePDFText(value) {
    return String(value)
        .replaceAll("\u2018", "'")
        .replaceAll("\u2019", "'")
        .replaceAll("\u201C", "\"")
        .replaceAll("\u201D", "\"")
        .replaceAll("\u2013", "-")
        .replaceAll("\u2014", "-")
        .replaceAll("\u2026", "...")
        .replace(
            /[^\x20-\x7E]/g,
            "?"
        );
}


function escapePDFString(value) {
    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)");
}


function byteLength(value) {
    return new TextEncoder()
        .encode(value)
        .length;
}


function makeReportFilename(name) {
    const safeName =
        String(
            name ||
            "character"
        )
            .trim()
            .replace(
                /[^a-zA-Z0-9_-]+/g,
                "-"
            )
            .replace(
                /^[-_]+|[-_]+$/g,
                ""
            );

    return (
        safeName ||
        "character"
    ) + "-report.pdf";
}