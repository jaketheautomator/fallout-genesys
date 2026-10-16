/*
 * ASOIAF Genesys Talent Browser
 * talents.js
 *
 * Browser behavior only.
 * Talent data belongs in data.js.
 */

"use strict";


// ============================================================
// STATE
// ============================================================

const talentBrowserState = {
    search: "",
    tier: "all",
    activation: "all",
    ranked: "all"
};


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeTalentBrowser
);


async function initializeTalentBrowser() {
    try {
        await loadTalentData();

        bindTalentBrowserControls();
        populateActivationFilter();
        renderTalentBrowser();
    } catch (error) {
        console.error(
            "Could not initialize talent browser:",
            error
        );

        const results =
            document.getElementById(
                "talent-results"
            );

        if (results) {
            results.innerHTML = `
                <p>
                    Talent data could not be loaded.
                </p>
            `;
        }
    }
}


// ============================================================
// FILTER SETUP
// ============================================================

function populateActivationFilter() {
    const select =
        document.getElementById(
            "talent-activation-filter"
        );

    if (!select) {
        return;
    }

    const activations = [
        ...new Set(
            GAME_DATA.talents.map(
                talent => talent.activation
            )
        )
    ].sort((a, b) =>
        a.localeCompare(b)
    );

    for (const activation of activations) {
        const option =
            document.createElement("option");

        option.value = activation;
        option.textContent = activation;

        select.appendChild(option);
    }
}


// ============================================================
// EVENT BINDING
// ============================================================

function bindTalentBrowserControls() {
    const searchInput =
        document.getElementById(
            "talent-search"
        );

    const tierSelect =
        document.getElementById(
            "talent-tier-filter"
        );

    const activationSelect =
        document.getElementById(
            "talent-activation-filter"
        );

    const rankedSelect =
        document.getElementById(
            "talent-ranked-filter"
        );

    const clearButton =
        document.getElementById(
            "talent-clear-filters"
        );


    if (searchInput) {
        searchInput.addEventListener(
            "input",
            event => {
                talentBrowserState.search =
                    event.target.value;

                renderTalentBrowser();
            }
        );
    }


    if (tierSelect) {
        tierSelect.addEventListener(
            "change",
            event => {
                talentBrowserState.tier =
                    event.target.value;

                renderTalentBrowser();
            }
        );
    }


    if (activationSelect) {
        activationSelect.addEventListener(
            "change",
            event => {
                talentBrowserState.activation =
                    event.target.value;

                renderTalentBrowser();
            }
        );
    }


    if (rankedSelect) {
        rankedSelect.addEventListener(
            "change",
            event => {
                talentBrowserState.ranked =
                    event.target.value;

                renderTalentBrowser();
            }
        );
    }


    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearTalentBrowserFilters
        );
    }
}


// ============================================================
// FILTERING
// ============================================================

function getFilteredTalents() {
    const search =
        talentBrowserState.search
            .trim()
            .toLowerCase();

    return GAME_DATA.talents.filter(
        talent => {

            // --------------------------------------------
            // TIER
            // --------------------------------------------

            if (
                talentBrowserState.tier !==
                "all"
            ) {
                const tier =
                    Number(
                        talentBrowserState.tier
                    );

                if (talent.tier !== tier) {
                    return false;
                }
            }


            // --------------------------------------------
            // ACTIVATION
            // --------------------------------------------

            if (
                talentBrowserState.activation !==
                    "all" &&
                talent.activation !==
                    talentBrowserState.activation
            ) {
                return false;
            }


            // --------------------------------------------
            // RANKED
            // --------------------------------------------

            if (
                talentBrowserState.ranked ===
                    "ranked" &&
                !talent.ranked
            ) {
                return false;
            }

            if (
                talentBrowserState.ranked ===
                    "unranked" &&
                talent.ranked
            ) {
                return false;
            }


            // --------------------------------------------
            // SEARCH
            // --------------------------------------------

            if (search) {
                const prerequisiteNames =
                    getTalentPrerequisiteNames(
                        talent
                    );

                const searchableText = [
                    talent.name,
                    talent.activation,
                    talent.description,
                    ...prerequisiteNames
                ]
                    .join(" ")
                    .toLowerCase();

                if (
                    !searchableText.includes(
                        search
                    )
                ) {
                    return false;
                }
            }


            return true;
        }
    );
}


// ============================================================
// SORTING
// ============================================================

function sortTalents(talents) {
    return [...talents].sort(
        (a, b) => {

            if (a.tier !== b.tier) {
                return a.tier - b.tier;
            }

            return a.name.localeCompare(
                b.name
            );
        }
    );
}


// ============================================================
// PREREQUISITES
// ============================================================

function getTalentPrerequisiteNames(talent) {
    if (
        !Array.isArray(
            talent.prerequisites
        )
    ) {
        return [];
    }

    return talent.prerequisites
        .map(prerequisiteId => {
            const prerequisite =
                getTalentById(
                    prerequisiteId
                );

            return prerequisite
                ? prerequisite.name
                : prerequisiteId;
        });
}


// ============================================================
// RENDERING
// ============================================================

function renderTalentBrowser() {
    const resultsContainer =
        document.getElementById(
            "talent-browser-results"
        );

    const countElement =
        document.getElementById(
            "talent-result-count"
        );

    if (!resultsContainer) {
        return;
    }


    const talents =
        sortTalents(
            getFilteredTalents()
        );


    if (countElement) {
        countElement.textContent =
            `${talents.length} ${
                talents.length === 1
                    ? "talent"
                    : "talents"
            }`;
    }


    if (talents.length === 0) {
        resultsContainer.innerHTML = `
            <p class="talent-browser-empty">
                No talents match the current filters.
            </p>
        `;

        return;
    }


    const talentsByTier =
        groupTalentsByTier(talents);


    resultsContainer.innerHTML =
        Object.entries(talentsByTier)
            .map(
                ([tier, tierTalents]) =>
                    renderTalentTier(
                        Number(tier),
                        tierTalents
                    )
            )
            .join("");
}


function groupTalentsByTier(talents) {
    const groups = {};

    for (const talent of talents) {
        if (!groups[talent.tier]) {
            groups[talent.tier] = [];
        }

        groups[talent.tier].push(
            talent
        );
    }

    return groups;
}


function renderTalentTier(
    tier,
    talents
) {
    return `
        <section class="talent-browser-tier">

            <h2>
                Tier ${tier}
            </h2>

            <div class="talent-browser-grid">

                ${talents
                    .map(renderTalentCard)
                    .join("")}

            </div>

        </section>
    `;
}


function renderTalentCard(talent) {
    const prerequisiteNames =
        getTalentPrerequisiteNames(
            talent
        );

    const prerequisites =
        prerequisiteNames.length > 0
            ? `
                <div
                    class="talent-browser-prerequisites"
                >
                    <strong>
                        Prerequisite:
                    </strong>

                    ${prerequisiteNames
                        .map(escapeTalentHTML)
                        .join(", ")}
                </div>
            `
            : "";


    return `
        <article class="talent-browser-card">

            <div class="talent-browser-card-header">

                <h3>
                    ${escapeTalentHTML(
                        talent.name
                    )}
                </h3>

                <span class="talent-browser-tier-label">
                    Tier ${talent.tier}
                </span>

            </div>


            <div class="talent-browser-meta">

                <span>
                    ${escapeTalentHTML(
                        talent.activation
                    )}
                </span>

                <span>
                    ${
                        talent.ranked
                            ? "Ranked"
                            : "Unranked"
                    }
                </span>

            </div>


            ${prerequisites}


            <p class="talent-browser-description">
                ${escapeTalentHTML(
                    talent.description
                )}
            </p>

        </article>
    `;
}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearTalentBrowserFilters() {
    talentBrowserState.search = "";
    talentBrowserState.tier = "all";
    talentBrowserState.activation = "all";
    talentBrowserState.ranked = "all";


    const searchInput =
        document.getElementById(
            "talent-search"
        );

    const tierSelect =
        document.getElementById(
            "talent-tier-filter"
        );

    const activationSelect =
        document.getElementById(
            "talent-activation-filter"
        );

    const rankedSelect =
        document.getElementById(
            "talent-ranked-filter"
        );


    if (searchInput) {
        searchInput.value = "";
    }

    if (tierSelect) {
        tierSelect.value = "all";
    }

    if (activationSelect) {
        activationSelect.value = "all";
    }

    if (rankedSelect) {
        rankedSelect.value = "all";
    }


    renderTalentBrowser();
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeTalentHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
