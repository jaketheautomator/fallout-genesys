/*
 * ASOIAF Genesys Equipment Browser
 * equipment.js
 *
 * Browser behavior only.
 * Equipment data belongs in data.js.
 */

"use strict";


// ============================================================
// STATE
// ============================================================

const equipmentBrowserState = {
    search: "",
    category: "all"
};


// ============================================================
// CATEGORY CONFIGURATION
// ============================================================

const equipmentBrowserCategories = [
    {
        id: "weapon",
        name: "Weapons"
    },
    {
        id: "armor",
        name: "Armor"
    },
    {
        id: "gear",
        name: "General Gear"
    },
    {
        id: "mount",
        name: "Mounts"
    },
    {
        id: "vehicle",
        name: "Vehicles"
    },
    {
        id: "attachment",
        name: "Attachments"
    }
];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeEquipmentBrowser
);


async function initializeEquipmentBrowser() {
    try {
        await loadEquipmentData();

        bindEquipmentBrowserControls();
        renderEquipmentBrowser();
    } catch (error) {
        console.error(
            "Could not initialize equipment browser:",
            error
        );

        const results =
            document.getElementById(
                "equipment-browser-results"
            );

        if (results) {
            results.innerHTML = `
                <p>
                    Equipment data could not be loaded.
                </p>
            `;
        }
    }
}


// ============================================================
// EVENT BINDING
// ============================================================

function bindEquipmentBrowserControls() {
    const searchInput =
        document.getElementById(
            "equipment-search"
        );

    const categorySelect =
        document.getElementById(
            "equipment-category-filter"
        );

    const clearButton =
        document.getElementById(
            "equipment-clear-filters"
        );


    if (searchInput) {
        searchInput.addEventListener(
            "input",
            event => {
                equipmentBrowserState.search =
                    event.target.value;

                renderEquipmentBrowser();
            }
        );
    }


    if (categorySelect) {
        categorySelect.addEventListener(
            "change",
            event => {
                equipmentBrowserState.category =
                    event.target.value;

                renderEquipmentBrowser();
            }
        );
    }


    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearEquipmentBrowserFilters
        );
    }
}


// ============================================================
// FILTERING
// ============================================================

function getFilteredEquipment() {
    const search =
        equipmentBrowserState.search
            .trim()
            .toLowerCase();


    return GAME_DATA.equipment.filter(
        item => {

            // --------------------------------------------
            // CATEGORY
            // --------------------------------------------

            if (
                equipmentBrowserState.category !==
                    "all" &&
                item.category !==
                    equipmentBrowserState.category
            ) {
                return false;
            }


            // --------------------------------------------
            // SEARCH
            // --------------------------------------------

            if (search) {
                const searchableText =
                    getEquipmentSearchText(item);

                if (
                    !searchableText.includes(search)
                ) {
                    return false;
                }
            }


            return true;
        }
    );
}


function getEquipmentSearchText(item) {
    const values = [];

    collectSearchValues(
        item,
        values
    );

    return values
        .join(" ")
        .toLowerCase();
}


function collectSearchValues(
    value,
    output
) {
    if (
        value === null ||
        value === undefined
    ) {
        return;
    }


    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        output.push(String(value));
        return;
    }


    if (Array.isArray(value)) {
        for (const entry of value) {
            collectSearchValues(
                entry,
                output
            );
        }

        return;
    }


    if (typeof value === "object") {
        for (
            const nestedValue
            of Object.values(value)
        ) {
            collectSearchValues(
                nestedValue,
                output
            );
        }
    }
}


// ============================================================
// SORTING
// ============================================================

function sortEquipment(items) {
    return [...items].sort(
        (a, b) =>
            a.name.localeCompare(b.name)
    );
}


// ============================================================
// GROUPING
// ============================================================

function groupEquipmentByCategory(items) {
    const groups = {};

    for (
        const category
        of equipmentBrowserCategories
    ) {
        const categoryItems =
            items.filter(
                item =>
                    item.category ===
                    category.id
            );

        if (categoryItems.length > 0) {
            groups[category.id] =
                sortEquipment(categoryItems);
        }
    }

    return groups;
}


function getEquipmentCategoryName(
    categoryId
) {
    const category =
        equipmentBrowserCategories.find(
            entry =>
                entry.id === categoryId
        );

    return category
        ? category.name
        : categoryId;
}


// ============================================================
// MAIN RENDER
// ============================================================

function renderEquipmentBrowser() {
    const resultsContainer =
        document.getElementById(
            "equipment-browser-results"
        );

    const countElement =
        document.getElementById(
            "equipment-result-count"
        );


    if (!resultsContainer) {
        return;
    }


    const items =
        getFilteredEquipment();


    if (countElement) {
        countElement.textContent =
            `${items.length} ${
                items.length === 1
                    ? "item"
                    : "items"
            }`;
    }


    if (items.length === 0) {
        resultsContainer.innerHTML = `
            <p class="equipment-browser-empty">
                No equipment matches the current filters.
            </p>
        `;

        return;
    }


    const groups =
        groupEquipmentByCategory(items);


    resultsContainer.innerHTML =
        Object.entries(groups)
            .map(
                ([categoryId, categoryItems]) =>
                    renderEquipmentCategory(
                        categoryId,
                        categoryItems
                    )
            )
            .join("");
}


// ============================================================
// CATEGORY RENDERING
// ============================================================

function renderEquipmentCategory(
    categoryId,
    items
) {
    return `
        <section class="equipment-browser-category">

            <h2>
                ${escapeEquipmentHTML(
                    getEquipmentCategoryName(
                        categoryId
                    )
                )}
            </h2>

            ${renderEquipmentCategoryContents(
                categoryId,
                items
            )}

        </section>
    `;
}


function renderEquipmentCategoryContents(
    categoryId,
    items
) {
    switch (categoryId) {
        case "weapon":
            return renderWeaponTable(items);

        case "armor":
            return renderArmorTable(items);

        case "gear":
            return renderGearTable(items);

        case "mount":
            return renderMountList(items);

        case "vehicle":
            return renderVehicleList(items);

        case "attachment":
            return renderAttachmentList(items);

        default:
            return renderGenericEquipmentList(
                items
            );
    }
}


// ============================================================
// WEAPONS
// ============================================================

function renderWeaponTable(items) {
    return `
        <div class="equipment-browser-table-wrap">

            <table class="equipment-browser-table">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Skill</th>
                        <th>Damage</th>
                        <th>Crit</th>
                        <th>Range</th>
                        <th>Enc</th>
                        <th>HP</th>
                        <th>Price</th>
                        <th>Rarity</th>
                        <th>Effect</th>
                    </tr>
                </thead>

                <tbody>
                    ${items
                        .map(renderWeaponRow)
                        .join("")}
                </tbody>

            </table>

        </div>
    `;
}


function renderWeaponRow(item) {
    return `
        <tr>
            <td class="equipment-browser-name">
                ${escapeEquipmentHTML(
                    item.name
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.skill
                )}
            </td>

            <td>
                ${formatWeaponDamageForBrowser(
                    item.damage
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.critical
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.range
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.encumbrance
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.hardPoints
                )}
            </td>

            <td>
                ${displayEquipmentPrice(item)}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.rarity
                )}
            </td>

            <td>
                ${renderEquipmentEffect(item)}
            </td>
        </tr>
    `;
}


// ============================================================
// ARMOR
// ============================================================

function renderArmorTable(items) {
    return `
        <div class="equipment-browser-table-wrap">

            <table class="equipment-browser-table">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Subtype</th>
                        <th>Defense</th>
                        <th>Soak</th>
                        <th>Enc</th>
                        <th>HP</th>
                        <th>Price</th>
                        <th>Rarity</th>
                        <th>Effect</th>
                    </tr>
                </thead>

                <tbody>
                    ${items
                        .map(renderArmorRow)
                        .join("")}
                </tbody>

            </table>

        </div>
    `;
}


function renderArmorRow(item) {
    return `
        <tr>
            <td class="equipment-browser-name">
                ${escapeEquipmentHTML(
                    item.name
                )}
            </td>

            <td>
                ${escapeEquipmentHTML(
                    item.subtype || "—"
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.defense
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.soak
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.encumbrance
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.hardPoints
                )}
            </td>

            <td>
                ${displayEquipmentPrice(item)}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.rarity
                )}
            </td>

            <td>
                ${renderEquipmentEffect(item)}
            </td>
        </tr>
    `;
}


// ============================================================
// GENERAL GEAR
// ============================================================

function renderGearTable(items) {
    return `
        <div class="equipment-browser-table-wrap">

            <table class="equipment-browser-table">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Subtype</th>
                        <th>Enc</th>
                        <th>Price</th>
                        <th>Rarity</th>
                        <th>Effect</th>
                    </tr>
                </thead>

                <tbody>
                    ${items
                        .map(renderGearRow)
                        .join("")}
                </tbody>

            </table>

        </div>
    `;
}


function renderGearRow(item) {
    return `
        <tr>
            <td class="equipment-browser-name">
                ${escapeEquipmentHTML(
                    item.name
                )}
            </td>

            <td>
                ${escapeEquipmentHTML(
                    item.subtype || "—"
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.encumbrance
                )}
            </td>

            <td>
                ${displayEquipmentPrice(item)}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.rarity
                )}
            </td>

            <td>
                ${renderEquipmentEffect(item)}
            </td>
        </tr>
    `;
}


// ============================================================
// TACK
// ============================================================

function renderTackTable(items) {
    return `
        <div class="equipment-browser-table-wrap">

            <table class="equipment-browser-table">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Enc</th>
                        <th>Price</th>
                        <th>Rarity</th>
                        <th>Effect</th>
                    </tr>
                </thead>

                <tbody>
                    ${items
                        .map(renderGearRow)
                        .join("")}
                </tbody>

            </table>

        </div>
    `;
}


// ============================================================
// BARDING
// ============================================================

function renderBardingTable(items) {
    return `
        <div class="equipment-browser-table-wrap">

            <table class="equipment-browser-table">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Defense</th>
                        <th>Soak</th>
                        <th>Enc</th>
                        <th>Price</th>
                        <th>Rarity</th>
                        <th>Effect</th>
                    </tr>
                </thead>

                <tbody>
                    ${items
                        .map(renderBardingRow)
                        .join("")}
                </tbody>

            </table>

        </div>
    `;
}


function renderBardingRow(item) {
    return `
        <tr>
            <td class="equipment-browser-name">
                ${escapeEquipmentHTML(
                    item.name
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.defense
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.soak
                )}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.encumbrance
                )}
            </td>

            <td>
                ${displayEquipmentPrice(item)}
            </td>

            <td>
                ${displayEquipmentValue(
                    item.rarity
                )}
            </td>

            <td>
                ${renderEquipmentEffect(item)}
            </td>
        </tr>
    `;
}


// ============================================================
// MOUNTS
// ============================================================

function renderMountList(items) {
    return `
        <div class="equipment-browser-card-grid">

            ${items
                .map(renderMountCard)
                .join("")}

        </div>
    `;
}


function renderMountCard(item) {
    return `
        <article class="equipment-browser-card">

            <div class="equipment-browser-card-header">
                <h3>
                    ${escapeEquipmentHTML(
                        item.name
                    )}
                </h3>

                <span class="equipment-browser-price">
                    ${displayEquipmentPrice(item)}
                </span>
            </div>

            ${renderObjectStats(
                item.characteristics,
                "Characteristics"
            )}

            ${renderMountPrimaryStats(item)}

            ${renderObjectStats(
                item.skills,
                "Skills"
            )}

            ${renderEquipmentEffectBlock(
                item
            )}

        </article>
    `;
}


function renderMountPrimaryStats(item) {
    const stats = [];

    addStatIfPresent(
        stats,
        "Soak",
        item.soak
    );

    addStatIfPresent(
        stats,
        "Wound Threshold",
        item.woundThreshold
    );

    addStatIfPresent(
        stats,
        "Capacity",
        item.capacity
    );

    addStatIfPresent(
        stats,
        "Rarity",
        item.rarity
    );


    if (stats.length === 0) {
        return "";
    }


    return `
        <div class="equipment-browser-stat-line">
            ${stats.join("")}
        </div>
    `;
}


// ============================================================
// VEHICLES
// ============================================================

function renderVehicleList(items) {
    return `
        <div class="equipment-browser-card-grid">

            ${items
                .map(renderVehicleCard)
                .join("")}

        </div>
    `;
}


function renderVehicleCard(item) {
    return `
        <article class="equipment-browser-card">

            <div class="equipment-browser-card-header">

                <h3>
                    ${escapeEquipmentHTML(
                        item.name
                    )}
                </h3>

                <span class="equipment-browser-price">
                    ${displayEquipmentPrice(item)}
                </span>

            </div>

            <div class="equipment-browser-stat-line">
                <span>
                    <strong>Rarity:</strong>
                    ${displayEquipmentValue(
                        item.rarity
                    )}
                </span>
            </div>

            ${renderEquipmentEffectBlock(
                item
            )}

        </article>
    `;
}


// ============================================================
// ATTACHMENTS
// ============================================================

function renderAttachmentList(items) {
    return `
        <div class="equipment-browser-card-grid">

            ${items
                .map(renderAttachmentCard)
                .join("")}

        </div>
    `;
}


function renderAttachmentCard(item) {
    const stats = [];

    addStatIfPresent(
        stats,
        "Type",
        item.attachmentType
    );

    addStatIfPresent(
        stats,
        "HP",
        item.hardPointCost
    );

    addStatIfPresent(
        stats,
        "Rarity",
        item.rarity
    );


    return `
        <article class="equipment-browser-card">

            <div class="equipment-browser-card-header">

                <h3>
                    ${escapeEquipmentHTML(
                        item.name
                    )}
                </h3>

                <span class="equipment-browser-price">
                    ${displayEquipmentPrice(item)}
                </span>

            </div>

            ${
                stats.length > 0
                    ? `
                        <div class="equipment-browser-stat-line">
                            ${stats.join("")}
                        </div>
                    `
                    : ""
            }

            ${renderEquipmentEffectBlock(
                item
            )}

        </article>
    `;
}


// ============================================================
// GENERIC FALLBACK
// ============================================================

function renderGenericEquipmentList(items) {
    return `
        <div class="equipment-browser-card-grid">

            ${items
                .map(
                    item => `
                        <article class="equipment-browser-card">

                            <div class="equipment-browser-card-header">

                                <h3>
                                    ${escapeEquipmentHTML(
                                        item.name
                                    )}
                                </h3>

                                <span class="equipment-browser-price">
                                    ${displayEquipmentPrice(
                                        item
                                    )}
                                </span>

                            </div>

                            <div class="equipment-browser-stat-line">
                                <span>
                                    <strong>Rarity:</strong>
                                    ${displayEquipmentValue(
                                        item.rarity
                                    )}
                                </span>
                            </div>

                            ${renderEquipmentEffectBlock(
                                item
                            )}

                        </article>
                    `
                )
                .join("")}

        </div>
    `;
}


// ============================================================
// EFFECT
// ============================================================

function renderEquipmentEffect(item) {
    const parts = [];

    if (
        Array.isArray(item.qualities) &&
        item.qualities.length > 0
    ) {
        parts.push(
            formatEquipmentQualitiesForBrowser(
                item.qualities
            )
        );
    }

    const effect =
        getEquipmentDescription(item);

    if (effect) {
        parts.push(
            escapeEquipmentHTML(
                effect
            )
        );
    }

    return parts.length > 0
        ? parts.join("<br>")
        : "—";
}


function renderEquipmentEffectBlock(item) {
    const effect =
        renderEquipmentEffect(item);


    if (effect === "—") {
        return "";
    }


    return `
        <p class="equipment-browser-description">
            ${effect}
        </p>
    `;
}


// ============================================================
// DETAILS
// ============================================================

function renderEquipmentDetails(item) {
    const parts = [];


    if (
        Array.isArray(item.qualities) &&
        item.qualities.length > 0
    ) {
        parts.push(
            formatEquipmentQualitiesForBrowser(
                item.qualities
            )
        );
    }


    const description =
        getEquipmentDescription(item);

    if (description) {
        parts.push(
            escapeEquipmentHTML(description)
        );
    }


    if (parts.length === 0) {
        return "—";
    }


    return parts.join("<br>");
}


function renderEquipmentDetailsBlock(item) {
    const details =
        renderEquipmentDetails(item);

    if (details === "—") {
        return "";
    }


    return `
        <p class="equipment-browser-description">
            ${details}
        </p>
    `;
}


function getEquipmentDescription(item) {
    const possibleFields = [
        "description",
        "effect",
        "special",
        "rules",
        "notes"
    ];


    for (const field of possibleFields) {
        if (
            typeof item[field] === "string" &&
            item[field].trim()
        ) {
            return item[field];
        }
    }


    return "";
}


// ============================================================
// QUALITIES
// ============================================================

function formatEquipmentQualitiesForBrowser(
    qualities
) {
    return qualities
        .map(quality => {

            if (
                typeof quality === "string"
            ) {
                return escapeEquipmentHTML(
                    quality
                );
            }


            if (
                quality &&
                typeof quality === "object"
            ) {
                if (
                    quality.name !== undefined &&
                    quality.value !== undefined
                ) {
                    return (
                        escapeEquipmentHTML(
                            quality.name
                        ) +
                        " " +
                        escapeEquipmentHTML(
                            quality.value
                        )
                    );
                }


                if (
                    quality.name !== undefined
                ) {
                    return escapeEquipmentHTML(
                        quality.name
                    );
                }


                return escapeEquipmentHTML(
                    Object.values(quality)
                        .join(" ")
                );
            }


            return escapeEquipmentHTML(
                quality
            );
        })
        .join(", ");
}


// ============================================================
// OBJECT / STAT DISPLAY
// ============================================================

function renderObjectStats(
    object,
    label
) {
    if (
        !object ||
        typeof object !== "object" ||
        Array.isArray(object)
    ) {
        return "";
    }


    const entries =
        Object.entries(object);


    if (entries.length === 0) {
        return "";
    }


    return `
        <div class="equipment-browser-object-stats">

            <strong>
                ${escapeEquipmentHTML(label)}:
            </strong>

            ${entries
                .map(
                    ([key, value]) =>
                        `
                            <span>
                                ${escapeEquipmentHTML(
                                    formatEquipmentKey(
                                        key
                                    )
                                )}:
                                ${displayEquipmentValue(
                                    value
                                )}
                            </span>
                        `
                )
                .join("")}

        </div>
    `;
}


function addStatIfPresent(
    output,
    label,
    value
) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return;
    }


    output.push(`
        <span>
            <strong>
                ${escapeEquipmentHTML(label)}:
            </strong>

            ${displayEquipmentValue(value)}
        </span>
    `);
}


function formatEquipmentKey(key) {
    return String(key)
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}


// ============================================================
// VALUE DISPLAY
// ============================================================

function formatWeaponDamageForBrowser(damage) {
    if (
        !damage ||
        damage.value === undefined
    ) {
        return "—";
    }

    if (damage.type === "brawn-plus") {
        return `+${damage.value}`;
    }

    if (damage.type === "fixed") {
        return String(damage.value);
    }

    return displayEquipmentValue(
        damage.value
    );
}


function displayEquipmentValue(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }


    if (Array.isArray(value)) {
        return value
            .map(displayEquipmentValue)
            .join(", ");
    }


    if (typeof value === "object") {
        return Object.entries(value)
            .map(
                ([key, nestedValue]) =>
                    `${escapeEquipmentHTML(
                        formatEquipmentKey(key)
                    )}: ${displayEquipmentValue(
                        nestedValue
                    )}`
            )
            .join(", ");
    }


    return escapeEquipmentHTML(value);
}


function displayEquipmentPrice(item) {
    if (
        item.price === null ||
        item.price === undefined
    ) {
        return "—";
    }


    if (
        item.purchasable === false
    ) {
        return "Not purchasable";
    }


    return `${escapeEquipmentHTML(
        item.price
    )} ss`;
}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearEquipmentBrowserFilters() {
    equipmentBrowserState.search = "";
    equipmentBrowserState.category = "all";


    const searchInput =
        document.getElementById(
            "equipment-search"
        );

    const categorySelect =
        document.getElementById(
            "equipment-category-filter"
        );


    if (searchInput) {
        searchInput.value = "";
    }


    if (categorySelect) {
        categorySelect.value = "all";
    }


    renderEquipmentBrowser();
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeEquipmentHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
