/*
 * ASOIAF Genesys Character Builder
 * app.js
 *
 * UI rendering and user interaction.
 */

"use strict";

let currentStep = "characteristics";

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


async function initializeApplication() {
    try {
        await Promise.all([
                loadEquipmentData(),
                loadTalentData()
            ]);

        initializeNavigation();
        initializeNameField();
        initializeReportButton();
        renderCurrentStep();
        updateSummary();
    } catch (error) {
        console.error(
            "Could not initialize application:",
            error
        );

        document.getElementById(
            "builder-content"
        ).innerHTML = `
            <p>
                Equipment data could not be loaded.
            </p>
        `;
    }
    
}

function initializeReportButton() {
    const wealthSummary =
        document.getElementById(
            "summary-wealth"
        );

    if (!wealthSummary) {
        return;
    }

    const summary =
        wealthSummary.parentElement;

    const existingButton =
        document.getElementById(
            "export-report-button"
        );

    if (existingButton) {
        return;
    }


    const buttonContainer =
        document.createElement("div");

    buttonContainer.className =
        "summary-report-control";


    const button =
        document.createElement("button");

    button.type =
        "button";

    button.id =
        "export-report-button";

    button.textContent =
        "Export Character Report";

    button.addEventListener(
        "click",
        exportCharacterReport
    );


    buttonContainer.appendChild(
        button
    );

    summary.appendChild(
        buttonContainer
    );
}


// ================================================================
// INITIALIZATION
// ================================================================

function initializeNavigation() {
    const buttons = document.querySelectorAll(
        "#creation-nav button"
    );

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            currentStep = button.dataset.step;
            renderCurrentStep();
            updateNavigation();
        });
    });

    updateNavigation();
}


function initializeNameField() {
    const nameInput = document.getElementById("name");

    nameInput.addEventListener("input", event => {
        character.name = event.target.value;
    });
}


// ================================================================
// NAVIGATION
// ================================================================

function updateNavigation() {
    const buttons = document.querySelectorAll(
        "#creation-nav button"
    );

    buttons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.step === currentStep
        );
    });
}


function renderCurrentStep() {
    switch (currentStep) {

        case "characteristics":
            renderCharacteristics();
            break;

        case "career":
            renderCareer();
            break;

        case "background":
            renderBackground();
            break;

        case "skills":
            renderSkills();
            break;

        case "talents":
            renderTalents();
            break;

        case "obligation":
            renderObligation();
            break;

        case "equipment":
            renderEquipment();
            break;

        default:
            renderCharacteristics();
    }
}


function renderPlaceholder(title) {
    const content = document.getElementById(
        "builder-content"
    );

    content.innerHTML = `
        <h2>${title}</h2>
        <p>This section has not yet been implemented.</p>
    `;
}


// ================================================================
// CHARACTERISTICS
// ================================================================

function renderCharacteristics() {
    const content = document.getElementById(
        "builder-content"
    );

    const characteristicRows =
        GAME_DATA.characteristics.map(stat => {

            const value =
                character.characteristics[stat.id];

            const decreaseDisabled =
                canDecreaseCharacteristic(stat.id)
                    ? ""
                    : "disabled";

            const increaseDisabled =
                canIncreaseCharacteristic(stat.id)
                    ? ""
                    : "disabled";

            return `
                <div class="characteristic-row">

                    <span class="characteristic-name">
                        ${stat.name}
                    </span>

                    <button
                        type="button"
                        class="characteristic-decrease"
                        data-characteristic="${stat.id}"
                        ${decreaseDisabled}
                    >
                        −
                    </button>

                    <span class="characteristic-value">
                        ${value}
                    </span>

                    <button
                        type="button"
                        class="characteristic-increase"
                        data-characteristic="${stat.id}"
                        ${increaseDisabled}
                    >
                        +
                    </button>

                </div>
            `;
        }).join("");

    const profileOptions =
        GAME_DATA.thresholdProfiles.map(profile => {

            const checked =
                character.thresholdProfile === profile.id
                    ? "checked"
                    : "";

            return `
                <label class="threshold-option">

                    <input
                        type="radio"
                        name="threshold-profile"
                        value="${profile.id}"
                        ${checked}
                    >

                    <strong>
                        ${profile.name}
                    </strong>

                    <span>
                        WT ${profile.woundBase} + Brawn,
                        ST ${profile.strainBase} + Willpower
                    </span>

                </label>
            `;
        }).join("");

    const weaknessCharacteristic =
        getWeaknessCharacteristic();

    let weaknessDisplay = "";

    if (weaknessCharacteristic) {
        weaknessDisplay = `
            <p class="characteristic-weakness-active">
                Weakness:
                <strong>
                    ${getCharacteristicName(
                        weaknessCharacteristic
                    )}
                </strong>
                (+20 XP)
            </p>
        `;
    }

    content.innerHTML = `
        <h2>Characteristics</h2>

        <p>
            All characteristics begin at 2.
            Spend starting XP to increase them.
        </p>

        <p class="characteristic-weakness-note">
            You may reduce one characteristic from 2 to 1
            to gain +20 starting XP.
        </p>

        ${weaknessDisplay}

        <div class="characteristics-list">
            ${characteristicRows}
        </div>

        <div class="xp-display">
            Characteristic XP Spent:
            <strong>
                ${getCharacteristicXPSpent()}
            </strong>
        </div>

        <div class="xp-display">
            XP Remaining:
            <strong>
                ${getXPRemaining()}
            </strong>
        </div>

        <h3>Threshold Profile</h3>

        <div class="threshold-profiles">
            ${profileOptions}
        </div>
    `;

    bindCharacteristicControls();
}


// ================================================================
// CHARACTERISTIC EVENTS
// ================================================================

function bindCharacteristicControls() {

    document.querySelectorAll(
        ".characteristic-increase"
    ).forEach(button => {

        button.addEventListener("click", () => {
            const id = button.dataset.characteristic;
            increaseCharacteristic(id);
        });
    });


    document.querySelectorAll(
        ".characteristic-decrease"
    ).forEach(button => {

        button.addEventListener("click", () => {
            const id = button.dataset.characteristic;
            decreaseCharacteristic(id);
        });
    });


    document.querySelectorAll(
        'input[name="threshold-profile"]'
    ).forEach(input => {

        input.addEventListener("change", () => {
            character.thresholdProfile = input.value;
            updateSummary();
        });
    });
}


function increaseCharacteristic(id) {

    if (!canIncreaseCharacteristic(id)) {
        return;
    }

    character.characteristics[id]++;

    renderCharacteristics();
    updateSummary();
}


function decreaseCharacteristic(id) {

    if (!canDecreaseCharacteristic(id)) {
        return;
    }

    character.characteristics[id]--;

    renderCharacteristics();
    updateSummary();
}


// ================================================================
// CAREER
// ================================================================

function renderCareer() {
    const content = document.getElementById(
        "builder-content"
    );

    const careerOptions =
        GAME_DATA.careers.map(career => `
            <option
                value="${career.id}"
                ${
                    character.career === career.id
                        ? "selected"
                        : ""
                }
            >
                ${career.name}
            </option>
        `).join("");

    content.innerHTML = `
        <h2>Career & Specialization</h2>

        <label for="career-select">
            Career
        </label>

        <select id="career-select">
            <option value="">
                Choose Career
            </option>

            ${careerOptions}
        </select>

        <div id="specialization-container"></div>

        <div id="career-skills-display"></div>
    `;

    const careerSelect =
        document.getElementById(
            "career-select"
        );

    careerSelect.addEventListener(
        "change",
        () => {

            const oldCareer =
                character.career;

            character.career =
                careerSelect.value || null;

            /*
             * Changing Career invalidates the existing
             * Specialization and all choices that depend
             * on the Career/Specialization package.
             */
            if (character.career !== oldCareer) {
                character.specialization = null;
                character.freeCareerSkills = [];
                character.background.skills = [];
            }

            renderCareer();
            updateSummary();
        }
    );

    renderSpecializations();
    renderCareerSkills();
}


function renderSpecializations() {
    const container =
        document.getElementById(
            "specialization-container"
        );

    if (!character.career) {
        container.innerHTML = "";
        return;
    }

    const career =
        getCareerById(character.career);

    const options =
        career.specializations.map(spec => `
            <option
                value="${spec.id}"
                ${
                    character.specialization === spec.id
                        ? "selected"
                        : ""
                }
            >
                ${spec.name}
            </option>
        `).join("");

    container.innerHTML = `
        <label for="specialization-select">
            Specialization
        </label>

        <select id="specialization-select">
            <option value="">
                Choose Specialization
            </option>

            ${options}
        </select>
    `;

    const specializationSelect =
        document.getElementById(
            "specialization-select"
        );

    specializationSelect.addEventListener(
        "change",
        event => {

            const oldSpecialization =
                character.specialization;

            character.specialization =
                event.target.value || null;

            /*
             * A new Specialization changes the eight
             * starting Career skills, so dependent
             * selections must be reset.
             */
            if (
                character.specialization !==
                oldSpecialization
            ) {
                character.freeCareerSkills = [];
                character.background.skills = [];
            }

            renderCareer();
            updateSummary();
        }
    );
}


function renderCareerSkills() {
    const container =
        document.getElementById(
            "career-skills-display"
        );

    if (
        !character.career ||
        !character.specialization
    ) {
        container.innerHTML = "";
        return;
    }

    const skillIds =
        getCurrentCareerSkillIds();

    const skillNames =
        skillIds.map(id => {

            const skill =
                getSkillById(id);

            return `
                <li>
                    ${skill.name}
                    <span>
                        (${getCharacteristicName(
                            skill.characteristic
                        )})
                    </span>
                </li>
            `;
        }).join("");

    container.innerHTML = `
        <h3>Career Skills</h3>

        <p>
            Your Career and Specialization provide
            these eight Career skills.
        </p>

        <ul class="career-skill-list">
            ${skillNames}
        </ul>
    `;
}


// ================================================================
// BACKGROUND
// ================================================================

function renderBackground() {
    const content = document.getElementById(
        "builder-content"
    );

    if (
        !character.career ||
        !character.specialization
    ) {
        content.innerHTML = `
            <h2>Background</h2>

            <p>
                Choose a Career and Specialization
                before selecting Background skills.
            </p>
        `;

        return;
    }

    const career =
        getCareerById(
            character.career
        );

    const specialization =
        getSpecializationById(
            character.career,
            character.specialization
        );

    const careerSkills =
        getCurrentCareerSkillIds()
            .map(id => getSkillById(id));

    const validSkills =
        getValidBackgroundSkills();

    const careerSkillList =
        careerSkills.map(skill => `
            <li>
                ${skill.name}
                <span>
                    (${getCharacteristicName(
                        skill.characteristic
                    )})
                </span>
            </li>
        `).join("");

    const categories = [
        "General",
        "Combat",
        "Social",
        "Knowledge"
    ];

    const skillGroups =
        categories.map(category => {

            const skills =
                validSkills.filter(
                    skill =>
                        skill.category === category
                );

            if (skills.length === 0) {
                return "";
            }

            const choices =
                skills.map(skill => {

                    const checked =
                        character.background.skills
                            .includes(skill.id)
                            ? "checked"
                            : "";

                    /*
                     * Once two Background skills have
                     * been chosen, unselected choices
                     * are disabled until one of the
                     * existing selections is removed.
                     */
                    const disabled =
                        character.background.skills
                            .length >= 2 &&
                        !character.background.skills
                            .includes(skill.id)
                            ? "disabled"
                            : "";

                    return `
                        <label class="background-skill">

                            <input
                                type="checkbox"
                                class="background-skill-checkbox"
                                value="${skill.id}"
                                ${checked}
                                ${disabled}
                            >

                            <span>
                                ${skill.name}
                            </span>

                            <small>
                                ${getCharacteristicName(
                                    skill.characteristic
                                )}
                            </small>

                        </label>
                    `;
                }).join("");

            return `
                <div class="background-skill-group">

                    <h3>
                        ${category}
                    </h3>

                    ${choices}

                </div>
            `;
        }).join("");

    content.innerHTML = `
        <h2>Background</h2>

        <p>
            Describe your character's life before
            the beginning of the game.
        </p>

        <label for="background-name">
            Background
        </label>

        <input
            type="text"
            id="background-name"
            value="${escapeHTML(
                character.background.name
            )}"
            placeholder="e.g. Hunter, Scribe, Sailor"
        >

        <h3>Your Career Skills</h3>

        <p>
            ${career.name} — ${specialization.name}
        </p>

        <ul class="career-skill-list">
            ${careerSkillList}
        </ul>

        <h3>Background Skills</h3>

        <p>
            Choose two skills outside your Career
            to begin at Rank 1.
        </p>

        <p>
            Selected:
            <strong>
                ${character.background.skills.length} / 2
            </strong>
        </p>

        <div class="background-skill-list">
            ${skillGroups}
        </div>
    `;

    bindBackgroundControls();
}


// ================================================================
// BACKGROUND EVENTS
// ================================================================

function bindBackgroundControls() {

    const backgroundName =
        document.getElementById(
            "background-name"
        );

    backgroundName.addEventListener(
        "input",
        event => {

            character.background.name =
                event.target.value;

            updateSummary();
        }
    );


    document.querySelectorAll(
        ".background-skill-checkbox"
    ).forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                const skillId =
                    checkbox.value;

                if (checkbox.checked) {

                    if (
                        character.background.skills
                            .length >= 2
                    ) {
                        checkbox.checked = false;
                        return;
                    }

                    if (
                        !isValidBackgroundSkill(
                            skillId
                        )
                    ) {
                        checkbox.checked = false;
                        return;
                    }

                    character.background.skills.push(
                        skillId
                    );

                } else {

                    character.background.skills =
                        character.background.skills
                            .filter(
                                id => id !== skillId
                            );
                }

                renderBackground();
                updateSummary();
            }
        );
    });
}

// ================================================================
// SKILLS
// ================================================================

function renderSkills() {
    const content = document.getElementById(
        "builder-content"
    );

    if (
        !character.career ||
        !character.specialization
    ) {
        content.innerHTML = `
            <h2>Skills</h2>

            <p>
                Choose a Career and Specialization
                before selecting skill ranks.
            </p>
        `;

        return;
    }

    const careerSkills =
        getCurrentCareerSkillIds().map(
            id => getSkillById(id)
        );

    const freeCareerChoices =
        careerSkills.map(skill => {

            const checked =
                character.freeCareerSkills
                    .includes(skill.id)
                    ? "checked"
                    : "";

            const disabled =
                character.freeCareerSkills.length >=
                    GAME_DATA.characterCreation
                        .startingCareerSkillRanks &&
                !character.freeCareerSkills
                    .includes(skill.id)
                    ? "disabled"
                    : "";

            return `
                <label class="free-career-skill">

                    <input
                        type="checkbox"
                        class="free-career-skill-checkbox"
                        value="${skill.id}"
                        ${checked}
                        ${disabled}
                    >

                    <span>
                        ${skill.name}
                    </span>

                    <small>
                        ${getCharacteristicName(
                            skill.characteristic
                        )}
                    </small>

                </label>
            `;
        }).join("");

    const categories = [
        "General",
        "Combat",
        "Social",
        "Knowledge"
    ];

    const skillGroups =
        categories.map(category => {

            const skills =
                GAME_DATA.skills.filter(
                    skill =>
                        skill.category === category
                );

            const rows =
                skills.map(skill =>
                    renderSkillRow(skill)
                ).join("");

            return `
                <div class="skill-group">

                    <h3>${category}</h3>

                    <div class="skill-table">
                        ${rows}
                    </div>

                </div>
            `;
        }).join("");

    content.innerHTML = `
        <h2>Skills</h2>

        <h3>Starting Career Skills</h3>

        <p>
            Choose four of your eight Career skills
            to begin at Rank 1.
        </p>

        <p>
            Selected:
            <strong>
                ${character.freeCareerSkills.length}
                /
                ${GAME_DATA.characterCreation
                    .startingCareerSkillRanks}
            </strong>
        </p>

        <div class="free-career-skill-list">
            ${freeCareerChoices}
        </div>

        <h3>Purchase Skill Ranks</h3>

        <p>
            Career skills cost 5 XP × the new rank.
            Non-Career skills cost 5 additional XP
            per rank.
        </p>

        <p>
            Skill XP Spent:
            <strong>
                ${getSkillXPSpent()}
            </strong>
        </p>

        <p>
            XP Remaining:
            <strong>
                ${getXPRemaining()}
            </strong>
        </p>

        <div class="skill-groups">
            ${skillGroups}
        </div>
    `;

    bindSkillControls();
}


function renderSkillRow(skill) {
    const rank =
        getTotalSkillRank(skill.id);

    const career =
        isCareerSkill(skill.id);

    const freeCareer =
        character.freeCareerSkills
            .includes(skill.id);

    const background =
        character.background.skills
            .includes(skill.id);

    const tags = [];

    if (career) {
        tags.push("Career");
    } else {
        tags.push("Non-Career");
    }

    if (freeCareer) {
        tags.push("Free Rank");
    }

    if (background) {
        tags.push("Background");
    }

    const decreaseDisabled =
        canDecreaseSkillRank(skill.id)
            ? ""
            : "disabled";

    const increaseDisabled =
        canIncreaseSkillRank(skill.id)
            ? ""
            : "disabled";

    return `
        <div class="skill-row">

            <div class="skill-info">

                <strong>
                    ${skill.name}
                </strong>

                <small>
                    ${getCharacteristicName(
                        skill.characteristic
                    )}
                    ·
                    ${tags.join(" · ")}
                </small>

            </div>

            <button
                type="button"
                class="skill-decrease"
                data-skill="${skill.id}"
                ${decreaseDisabled}
            >
                −
            </button>

            <span class="skill-rank">
                ${rank}
            </span>

            <button
                type="button"
                class="skill-increase"
                data-skill="${skill.id}"
                ${increaseDisabled}
            >
                +
            </button>

        </div>
    `;
}


// ================================================================
// SKILL EVENTS
// ================================================================

function bindSkillControls() {

    document.querySelectorAll(
        ".free-career-skill-checkbox"
    ).forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                const skillId =
                    checkbox.value;

                if (checkbox.checked) {

                    if (
                        character.freeCareerSkills.length >=
                        GAME_DATA.characterCreation
                            .startingCareerSkillRanks
                    ) {
                        checkbox.checked = false;
                        return;
                    }

                    if (!isCareerSkill(skillId)) {
                        checkbox.checked = false;
                        return;
                    }

                    character.freeCareerSkills.push(
                        skillId
                    );

                } else {

                    character.freeCareerSkills =
                        character.freeCareerSkills
                            .filter(
                                id => id !== skillId
                            );
                }

                renderSkills();
                updateSummary();
            }
        );
    });


    document.querySelectorAll(
        ".skill-increase"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                increaseSkillRank(
                    button.dataset.skill
                );
            }
        );
    });


    document.querySelectorAll(
        ".skill-decrease"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                decreaseSkillRank(
                    button.dataset.skill
                );
            }
        );
    });
}


// ================================================================
// SKILL RANK CHANGES
// ================================================================

function getNextSkillRankCost(skillId) {
    const newRank =
        getTotalSkillRank(skillId) + 1;

    let cost = newRank * 5;

    if (!isCareerSkill(skillId)) {
        cost += 5;
    }

    return cost;
}


function canIncreaseSkillRank(skillId) {
    const currentRank =
        getTotalSkillRank(skillId);

    /*
     * During character creation, no skill may
     * be raised above Rank 2.
     */
    if (currentRank >= 2) {
        return false;
    }

    return (
        getNextSkillRankCost(skillId) <=
        getXPRemaining()
    );
}


function canDecreaseSkillRank(skillId) {
    const storedRank =
        getSkillRank(skillId);

    const freeRank =
        character.freeCareerSkills
            .includes(skillId) ||
        character.background.skills
            .includes(skillId);

    /*
     * A stored purchased rank can always be undone.
     */
    if (storedRank > 1) {
        return true;
    }

    /*
     * Rank 1 is removable only if it was actually
     * purchased rather than granted for free.
     */
    if (storedRank === 1 && !freeRank) {
        return true;
    }

    return false;
}


function increaseSkillRank(skillId) {

    if (!canIncreaseSkillRank(skillId)) {
        return;
    }

    const newRank =
        getTotalSkillRank(skillId) + 1;

    character.skillRanks[skillId] =
        newRank;

    renderSkills();
    updateSummary();
}


function decreaseSkillRank(skillId) {

    if (!canDecreaseSkillRank(skillId)) {
        return;
    }

    const storedRank =
        getSkillRank(skillId);

    const freeRank =
        character.freeCareerSkills
            .includes(skillId) ||
        character.background.skills
            .includes(skillId);

    if (storedRank > 1) {

        const newRank =
            storedRank - 1;

        /*
         * If reducing to Rank 1 and Rank 1 is free,
         * no stored rank is necessary.
         */
        if (newRank === 1 && freeRank) {
            delete character.skillRanks[skillId];
        } else {
            character.skillRanks[skillId] =
                newRank;
        }

    } else {

        delete character.skillRanks[skillId];
    }

    renderSkills();
    updateSummary();
}


// ============================================================
// TALENTS
// ============================================================

function renderTalents() {
    const content =
        document.getElementById(
            "builder-content"
        );

    content.innerHTML = "";

    const section =
        document.createElement("section");

    section.className = "talents-section";


    // --------------------------------------------------------
    // Heading
    // --------------------------------------------------------

    const heading =
        document.createElement("h2");

    heading.textContent = "Talents";

    section.appendChild(heading);


    const instructions =
        document.createElement("p");

    instructions.textContent =
        "Purchase talents using the Genesys talent pyramid. " +
        "Each occupied tier must contain fewer talents than " +
        "the tier below it. Ranked talents increase in tier " +
        "with each additional rank.";

    section.appendChild(instructions);


    // --------------------------------------------------------
    // Talent pyramid
    // --------------------------------------------------------

    section.appendChild(
        renderTalentPyramid()
    );

    // --------------------------------------------------------
    // Talent tiers
    // --------------------------------------------------------

    for (let tier = 1; tier <= 5; tier++) {

        section.appendChild(
            renderTalentTier(tier)
        );
    }


    content.appendChild(section);
}

function renderTalentPyramid() {
    const pyramid =
        document.createElement("div");

    pyramid.className =
        "talent-pyramid-summary";


    for (let tier = 1; tier <= 5; tier++) {

        const column =
            document.createElement("div");

        column.className =
            "talent-pyramid-tier";


        const heading =
            document.createElement("h3");

        heading.textContent =
            `Tier ${tier}`;

        column.appendChild(heading);


        const purchased =
            getPurchasedTalentsAtTier(
                tier
            );


        for (const entry of purchased) {

            const slot =
                document.createElement("div");

            slot.className =
                "talent-pyramid-slot talent-pyramid-slot-filled";


            if (
                entry.talent.ranked &&
                entry.rank > 1
            ) {
                slot.textContent =
                    `${entry.talent.name} ` +
                    `(Rank ${entry.rank})`;
            } else {
                slot.textContent =
                    entry.talent.name;
            }


            column.appendChild(slot);
        }


        /*
         * Show one blank slot if the pyramid permits
         * another talent to be purchased at this tier.
         */
        if (
            canAddTalentAtTier(tier)
        ) {
            const emptySlot =
                document.createElement("div");

            emptySlot.className =
                "talent-pyramid-slot talent-pyramid-slot-empty";

            column.appendChild(
                emptySlot
            );
        }


        pyramid.appendChild(column);
    }


    return pyramid;
}


function getPurchasedTalentsAtTier(
    tier
) {
    const purchased = [];


    for (const talent of GAME_DATA.talents) {

        const ranks =
            getTalentRank(
                talent.id
            );


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
                purchased.push({
                    talent,
                    rank
                });
            }
        }
    }


    return purchased;
}

function renderTalentTier(tier) {
    const tierSection =
        document.createElement("details");

    tierSection.className =
        "talent-tier";

    tierSection.open = true;


    const summary =
        document.createElement("summary");

    summary.className =
        "talent-tier-summary";


    const title =
        document.createElement("span");

    const occupied =
        getTalentCountByTier(tier);

    title.textContent =
        `Tier ${tier}`;


    const count =
        document.createElement("span");

    count.className =
        "talent-tier-count";

    count.textContent =
        `${occupied} Purchased`;


    summary.appendChild(title);
    summary.appendChild(count);

    tierSection.appendChild(summary);


    /*
     * A talent belongs in this display tier if:
     *
     * 1. Its next purchase would occupy this tier, OR
     * 2. It already has a purchased rank occupying this tier.
     */
    const relevantTalents =
        GAME_DATA.talents.filter(
            talent =>
                talentHasRankAtTier(
                    talent.id,
                    tier
                ) ||
                getNextTalentTier(
                    talent.id
                ) === tier
        );


    if (relevantTalents.length === 0) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "No talents available at this tier.";

        tierSection.appendChild(empty);

        return tierSection;
    }


    const list =
        document.createElement("div");

    list.className =
        "talent-list";


    for (const talent of relevantTalents) {

        list.appendChild(
            renderTalentCard(
                talent,
                tier
            )
        );
    }


    tierSection.appendChild(list);

    return tierSection;
}


function talentHasRankAtTier(
    talentId,
    tier
) {
    const ranks =
        getTalentRank(talentId);

    for (
        let rank = 1;
        rank <= ranks;
        rank++
    ) {
        if (
            getTalentEffectiveTier(
                talentId,
                rank
            ) === tier
        ) {
            return true;
        }
    }

    return false;
}


function getTalentRankAtTier(
    talentId,
    tier
) {
    const ranks =
        getTalentRank(talentId);

    for (
        let rank = 1;
        rank <= ranks;
        rank++
    ) {
        if (
            getTalentEffectiveTier(
                talentId,
                rank
            ) === tier
        ) {
            return rank;
        }
    }

    return null;
}


function renderTalentCard(
    talent,
    displayTier
) {
    const card =
        document.createElement("div");

    card.className =
        "talent-card";


    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    const title =
        document.createElement("h4");

    title.textContent =
        talent.name;

    card.appendChild(title);


    // --------------------------------------------------------
    // Metadata
    // --------------------------------------------------------

    const metadata =
        document.createElement("div");

    metadata.className =
        "talent-metadata";


    const purchasedRank =
        getTalentRankAtTier(
            talent.id,
            displayTier
        );

    if (purchasedRank !== null) {
        card.classList.add(
            "talent-card-purchased"
        );
    }

    if (purchasedRank !== null) {

        const purchased =
            document.createElement("span");

        if (talent.ranked) {
            purchased.textContent =
                "";
        } else {
            purchased.textContent =
                "";
        }

        metadata.appendChild(purchased);
    }


    const activation =
        document.createElement("span");

    activation.textContent =
        talent.activation;

    metadata.appendChild(activation);


    if (talent.ranked) {

        const ranked =
            document.createElement("span");

        ranked.textContent =
            "; Ranked";

        metadata.appendChild(ranked);
    }


    card.appendChild(metadata);


    // --------------------------------------------------------
    // Description
    // --------------------------------------------------------

    const description =
        document.createElement("p");

    description.className =
        "talent-description";

    description.textContent =
        talent.description;

    card.appendChild(description);


    // --------------------------------------------------------
    // Prerequisites
    // --------------------------------------------------------

    if (
        talent.prerequisites.length > 0
    ) {
        const prerequisites =
            document.createElement("p");

        prerequisites.className =
            "talent-prerequisites";

        const names =
            talent.prerequisites.map(
                prerequisiteId => {

                    const prerequisite =
                        getTalentById(
                            prerequisiteId
                        );

                    return prerequisite
                        ? prerequisite.name
                        : prerequisiteId;
                }
            );

        prerequisites.textContent =
            `Prerequisite: ${names.join(", ")}`;

        card.appendChild(prerequisites);
    }


    // --------------------------------------------------------
    // Controls
    // --------------------------------------------------------

    const controls =
        document.createElement("div");

    controls.className =
        "talent-controls";


    /*
     * The minus button is shown on the tier containing the
     * talent's CURRENT HIGHEST RANK.
     *
     * Example:
     *
     * Grit I  -> Tier 1
     * Grit II -> Tier 2
     *
     * Once Grit II exists, its refund control belongs with
     * the Tier 2 instance rather than Grit I.
     */
    const currentRank =
        getTalentRank(talent.id);

    const currentHighestTier =
        currentRank > 0
            ? getTalentEffectiveTier(
                talent.id,
                currentRank
            )
            : null;


    if (
        currentRank > 0 &&
        currentHighestTier === displayTier
    ) {
        const removeButton =
            document.createElement("button");

        removeButton.type =
            "button";

        removeButton.textContent =
            "Purchased";

        removeButton.disabled =
            !canRemoveTalent(
                talent.id
            );

        removeButton.addEventListener(
            "click",
            () => {
                removeTalent(
                    talent.id
                );

                renderTalents();
                updateSummary();
            }
        );

        controls.appendChild(
            removeButton
        );
    }


    // --------------------------------------------------------
    // Purchase control
    // --------------------------------------------------------

    const nextTier =
        getNextTalentTier(
            talent.id
        );

    const canShowPurchase =
        nextTier === displayTier &&
        (
            talent.ranked ||
            !hasTalent(talent.id)
        );


    if (canShowPurchase) {

        const cost =
            getNextTalentCost(
                talent.id
            );


        const purchaseButton =
            document.createElement(
                "button"
            );

        purchaseButton.type =
            "button";

        purchaseButton.textContent =
            `${cost} XP`;

        purchaseButton.disabled =
            !canPurchaseTalent(
                talent.id
            );


        purchaseButton.addEventListener(
            "click",
            () => {
                purchaseTalent(
                    talent.id
                );

                renderTalents();
                updateSummary();
            }
        );


        controls.appendChild(
            purchaseButton
        );
    }


    card.appendChild(controls);

    return card;
}

// ============================================================
// OBLIGATION
// ============================================================

function renderObligation() {
    const container =
        document.getElementById(
            "builder-content"
        );

    const total =
        getTotalObligation();

    const assigned =
        getAssignedObligation();

    const unassigned =
        getUnassignedObligation();

    const maximumAdditional =
        getMaximumAdditionalObligation();

    container.innerHTML = `
        <div class="obligation-step">

            <h2>Obligation</h2>

            <p>
                Every character begins with 10
                Obligation. Additional Obligation
                may be taken during character
                creation for XP or starting wealth.
            </p>

            <div class="obligation-summary">

                <p>
                    <strong>Total</strong>
                    ${total}
                </p>

                <p>
                    <strong>Assigned</strong>
                    ${assigned}
                </p>

                <p>
                    <strong>Unassigned</strong>
                    ${unassigned}
                </p>

            </div>

            <label class="solo-character-option">
                <input
                    type="checkbox"
                    id="solo-character"
                    ${
                        character.obligation.solo
                            ? "checked"
                            : ""
                    }
                    ${
                        character.obligation
                            .additional > 10
                            ? "disabled"
                            : ""
                    }
                >
                Solo Character
            </label>

            <p>
                Additional Obligation:
                <strong>
                    ${character.obligation.additional}
                    /
                    ${maximumAdditional}
                </strong>
            </p>

            <p>
                Bonus XP:
                <strong>
                    ${character.obligation.xpBonus}
                </strong>
                &nbsp; | &nbsp;
                Bonus Wealth:
                <strong>
                    ${character.obligation.wealthBonus}
                    stags
                </strong>
            </p>

            <div class="obligation-actions">

                <button
                    id="obligation-add-xp"
                    ${
                        canAddObligation()
                            ? ""
                            : "disabled"
                    }
                >
                    +5 Obligation for +5 XP
                </button>

                <button
                    id="obligation-add-wealth"
                    ${
                        canAddObligation()
                            ? ""
                            : "disabled"
                    }
                >
                    +5 Obligation for Wealth
                </button>

                <button
                    id="obligation-remove-choice"
                    ${
                        canRemoveObligationChoice(
                            character.obligation.choices.length - 1
                        )
                            ? ""
                            : "disabled"
                    }
                >
                    Undo Last Choice
                </button>

            </div>

            ${
                character.obligation.choices.length > 0
                    ? `
                        <div class="obligation-choice-list">
                            ${character.obligation.choices.map(
                                choice => `
                                    <div class="obligation-choice">
                                        <span>
                                            +5 Obligation
                                            —
                                            ${
                                                choice === "xp"
                                                    ? "XP"
                                                    : "Wealth"
                                            }
                                        </span>
                                    </div>
                                `
                            ).join("")}
                        </div>
                    `
                    : ""
            }

            <hr>

            <div class="obligation-assignment-header">

                <div>
                    <h3>Obligations</h3>

                    <p>
                        Divide your total Obligation
                        among one or more obligations.
                    </p>
                </div>

                <button
                    id="add-obligation-entry"
                    ${
                        canAddObligationEntry()
                            ? ""
                            : "disabled"
                    }
                >
                    + Add Obligation
                </button>

            </div>

            <div id="obligation-entry-list">
                ${renderObligationEntries()}
            </div>

            ${
                unassigned > 0
                    ? `
                        <p class="obligation-warning">
                            ${unassigned} Obligation
                            remains unassigned.
                        </p>
                    `
                    : `
                        <p class="obligation-complete">
                            All Obligation has been
                            assigned.
                        </p>
                    `
            }

        </div>
    `;

    bindObligationControls();
}
function renderObligationEntries() {
    if (character.obligation.entries.length === 0) {
        return `
            <p class="obligation-empty">
                No obligations assigned yet.
            </p>
        `;
    }

    return character.obligation.entries.map(entry => {
        const typeOptions =
            GAME_DATA.obligationTypes.map(type => `
                <option
                    value="${type.id}"
                    ${
                        entry.type === type.id
                            ? "selected"
                            : ""
                    }
                >
                    ${type.name}
                </option>
            `).join("");

        const maxValue =
            entry.value +
            getUnassignedObligation();

        const valueOptions = [];

        for (
            let value = 5;
            value <= maxValue;
            value += 5
        ) {
            valueOptions.push(`
                <option
                    value="${value}"
                    ${
                        entry.value === value
                            ? "selected"
                            : ""
                    }
                >
                    ${value}
                </option>
            `);
        }

        return `
            <div
                class="obligation-entry"
                data-entry-id="${entry.id}"
            >
                <div class="obligation-entry-top">

                    <label>
                        Type

                        <select
                            class="obligation-entry-type"
                        >
                            <option value="">
                                Select type
                            </option>

                            ${typeOptions}
                        </select>
                    </label>

                    <label>
                        Value

                        <select
                            class="obligation-entry-value"
                        >
                            ${valueOptions.join("")}
                        </select>
                    </label>

                </div>

                <label>
                    Name

                    <input
                        type="text"
                        class="obligation-entry-name"
                        value="${escapeHTML(entry.name)}"
                        placeholder="Specific obligation"
                    >
                </label>

                <label>
                    Description

                    <textarea
                        class="obligation-entry-description"
                        rows="3"
                        placeholder="Describe the obligation..."
                    >${escapeHTML(entry.description)}</textarea>
                </label>

                <button
                    class="remove-obligation-entry"
                >
                    Remove
                </button>
            </div>
        `;
    }).join("");
}

function bindObligationControls() {
    // ------------------------------------------------------------
    // SOLO CHARACTER
    // ------------------------------------------------------------

    const soloCheckbox =
        document.getElementById("solo-character");

    if (soloCheckbox) {
        soloCheckbox.addEventListener("change", event => {
            setSoloCharacter(event.target.checked);

            renderObligation();
            updateSummary();
        });
    }


    // ------------------------------------------------------------
    // TAKE +5 OBLIGATION FOR XP
    // ------------------------------------------------------------

    const addXpButton =
        document.getElementById("obligation-add-xp");

    if (addXpButton) {
        addXpButton.addEventListener("click", () => {
            const success =
                addObligationChoice("xp");

            if (!success) {
                return;
            }

            renderObligation();
            updateSummary();
        });
    }


    // ------------------------------------------------------------
    // TAKE +5 OBLIGATION FOR WEALTH
    // ------------------------------------------------------------

    const addWealthButton =
        document.getElementById("obligation-add-wealth");

    if (addWealthButton) {
        addWealthButton.addEventListener("click", () => {
            const success =
                addObligationChoice("wealth");

            if (!success) {
                return;
            }

            renderObligation();
            updateSummary();
        });
    }


    // ------------------------------------------------------------
    // UNDO LAST +5 OBLIGATION CHOICE
    // ------------------------------------------------------------

    const removeChoiceButton =
        document.getElementById(
            "obligation-remove-choice"
        );

    if (removeChoiceButton) {
        removeChoiceButton.addEventListener(
            "click",
            () => {
                const success =
                    removeObligationChoice(
                        character.obligation.choices.length - 1
                    );

                if (!success) {
                    return;
                }

                renderObligation();
                updateSummary();
            }
        );
    }


    // ------------------------------------------------------------
    // ADD AN OBLIGATION ENTRY
    // ------------------------------------------------------------

    const addEntryButton =
        document.getElementById(
            "add-obligation-entry"
        );

    if (addEntryButton) {
        addEntryButton.addEventListener(
            "click",
            () => {
                const success =
                    addObligationEntry();

                if (!success) {
                    return;
                }

                renderObligation();
                updateSummary();
            }
        );
    }


    // ------------------------------------------------------------
    // EXISTING OBLIGATION ENTRIES
    // ------------------------------------------------------------

    document
        .querySelectorAll(".obligation-entry")
        .forEach(element => {
            const entryId =
                Number(element.dataset.entryId);

            const typeSelect =
                element.querySelector(
                    ".obligation-entry-type"
                );

            const valueSelect =
                element.querySelector(
                    ".obligation-entry-value"
                );

            const nameInput =
                element.querySelector(
                    ".obligation-entry-name"
                );

            const descriptionInput =
                element.querySelector(
                    ".obligation-entry-description"
                );

            const removeButton =
                element.querySelector(
                    ".remove-obligation-entry"
                );


            if (typeSelect) {
                typeSelect.addEventListener(
                    "change",
                    event => {
                        setObligationEntryType(
                            entryId,
                            event.target.value
                        );
                    }
                );
            }


            if (valueSelect) {
                valueSelect.addEventListener(
                    "change",
                    event => {
                        const success =
                            setObligationEntryValue(
                                entryId,
                                Number(
                                    event.target.value
                                )
                            );

                        if (!success) {
                            renderObligation();
                            return;
                        }

                        renderObligation();
                        updateSummary();
                    }
                );
            }


            if (nameInput) {
                nameInput.addEventListener(
                    "input",
                    event => {
                        setObligationEntryName(
                            entryId,
                            event.target.value
                        );
                    }
                );
            }


            if (descriptionInput) {
                descriptionInput.addEventListener(
                    "input",
                    event => {
                        setObligationEntryDescription(
                            entryId,
                            event.target.value
                        );
                    }
                );
            }


            if (removeButton) {
                removeButton.addEventListener(
                    "click",
                    () => {
                        const success =
                            removeObligationEntry(
                                entryId
                            );

                        if (!success) {
                            return;
                        }

                        renderObligation();
                        updateSummary();
                    }
                );
            }
        });
}


// ============================================================
// EQUIPMENT
// ============================================================

function renderEquipment() {
    const content =
        document.getElementById(
            "builder-content"
        );

    content.innerHTML = "";

    const section =
        document.createElement("section");

    section.className = "equipment-step";

    section.innerHTML = `
        <h2>Equipment</h2>

        <div class="equipment-summary">
            <p>
                <strong>Starting Wealth:</strong>
                ${getStartingWealth()} stags
            </p>

            <p>
                <strong>Spent:</strong>
                ${getEquipmentSpent()} stags
            </p>

            <p>
                <strong>Remaining:</strong>
                ${getWealthRemaining()} stags
            </p>

            <p>
                <strong>Encumbrance:</strong>
                ${getCurrentEncumbrance()}
                /
                ${getEncumbranceThreshold()}
            </p>

            <p>
                <strong>Weapon Hard Points:</strong>
                ${getUsedWeaponHardPoints()}
                /
                ${getAvailableWeaponHardPoints()}
            </p>

            <p>
                <strong>Armor Hard Points:</strong>
                ${getUsedArmorHardPoints()}
                /
                ${getAvailableArmorHardPoints()}
            </p>
        </div>

        <div id="starting-package-section"></div>

        <div id="equipped-armor-section"></div>

        <div id="equipment-inventory-section"></div>

        <div id="equipment-catalog-section"></div>
    `;

    content.appendChild(section);

    renderStartingEquipmentPackage();
    renderEquippedArmorSelector();
    renderEquipmentInventory();
    renderEquipmentCatalog();
}


// ============================================================
// STARTING PACKAGE
// ============================================================

function renderStartingEquipmentPackage() {
    const container =
        document.getElementById(
            "starting-package-section"
        );

    const equipmentPackage =
        getCurrentStartingEquipmentPackage();

    if (!equipmentPackage) {
        container.innerHTML = `
            <details open>
                <summary>Starting Package</summary>

                <div class="equipment-section-content">
                    <p>
                        Select a specialization to view
                        its suggested starting equipment.
                    </p>
                </div>
            </details>
        `;

        return;
    }

    const cost =
        getStartingEquipmentPackageCost(
            equipmentPackage.id
        );

    const itemLines =
        equipmentPackage.items.map(
            packageItem => {
                const item =
                    getEquipmentById(
                        packageItem.id
                    );

                if (!item) {
                    return `
                        <li>
                            Unknown item:
                            ${packageItem.id}
                        </li>
                    `;
                }

                const quantity =
                    packageItem.quantity > 1
                        ? `${packageItem.quantity}× `
                        : "";

                return `
                    <li>
                        ${quantity}${item.name}
                    </li>
                `;
            }
        ).join("");

    container.innerHTML = `
        <details open>
            <summary>Starting Package</summary>

            <div class="equipment-section-content">

                <h4>${equipmentPackage.name}</h4>

                <ul>
                    ${itemLines}
                </ul>

                <p>
                    <strong>Package Cost:</strong>
                    ${cost} stags
                </p>

                <button
                    id="purchase-starting-package"
                    ${
                        canPurchaseEquipmentPackage(
                            equipmentPackage.id
                        )
                            ? ""
                            : "disabled"
                    }
                >
                    Buy Starting Package
                </button>

            </div>
        </details>
    `;

    const button =
        document.getElementById(
            "purchase-starting-package"
        );

    if (button) {
        button.addEventListener(
            "click",
            () => {
                const success =
                    purchaseEquipmentPackage(
                        equipmentPackage.id
                    );

                if (!success) return;

                renderEquipment();
                updateSummary();
            }
        );
    }
}


// ============================================================
// EQUIPPED ARMOR
// ============================================================

function renderEquippedArmorSelector() {
    const container =
        document.getElementById(
            "equipped-armor-section"
        );

    const ownedArmor =
        character.equipment.filter(
            entry => {
                const item =
                    getEquipmentById(entry.id);

                return (
                    item &&
                    item.category === "armor"
                );
            }
        );

    const armorOptions =
        ownedArmor.map(
            entry => {
                const item =
                    getEquipmentById(entry.id);

                const selected =
                    character.equippedArmor ===
                    entry.instanceId
                        ? "selected"
                        : "";

                return `
                    <option
                        value="${entry.instanceId}"
                        ${selected}
                    >
                        ${item.name}
                    </option>
                `;
            }
        ).join("");

    const armor =
        getEquippedArmor();

    container.innerHTML = `
        <details open>
            <summary>Equipped Armor</summary>

            <div class="equipment-section-content">

                <label>
                    Armor:
                    <select id="equipped-armor-select">
                        <option value="">
                            None
                        </option>
                        ${armorOptions}
                    </select>
                </label>

                <p>
                    <strong>Armor Soak:</strong>
                    ${getArmorSoakBonus()}
                </p>

                <p>
                    <strong>Armor Defense:</strong>
                    ${getArmorDefense()}
                </p>

                ${
                    armor
                        ? `
                            <p>
                                Currently wearing:
                                ${armor.name}
                            </p>
                        `
                        : ""
                }

            </div>
        </details>
    `;

    const select =
        document.getElementById(
            "equipped-armor-select"
        );

    select.addEventListener(
        "change",
        event => {
            const value =
                event.target.value;

            if (value === "") {
                equipArmor(null);
            } else {
                equipArmor(
                    Number(value)
                );
            }

            renderEquipment();
            updateSummary();
        }
    );
}


// ============================================================
// INVENTORY
// ============================================================

function renderEquipmentInventory() {
    const container =
        document.getElementById(
            "equipment-inventory-section"
        );

    container.innerHTML = "";

    const details =
        document.createElement("details");

    details.open = true;

    const summary =
        document.createElement("summary");

    summary.textContent =
        `Inventory (${character.equipment.length})`;

    details.appendChild(summary);

    const content =
        document.createElement("div");

    content.className =
        "equipment-section-content";

    if (character.equipment.length === 0) {
        content.innerHTML = `
            <p>No equipment purchased.</p>
        `;

        details.appendChild(content);
        container.appendChild(details);

        return;
    }

    const list =
        document.createElement("div");

    list.className = "equipment-inventory";

    for (const entry of character.equipment) {
        const item =
            getEquipmentById(entry.id);

        if (!item) continue;

        const row =
            document.createElement("div");

        row.className =
            "equipment-inventory-row";

        const isEquippedArmor =
            character.equippedArmor ===
            entry.instanceId;

        const canRefund =
            canRefundEquipment(
                entry.instanceId
            );

        row.innerHTML = `
            <div class="equipment-inventory-name">
                <strong>${item.name}</strong>

                ${
                    isEquippedArmor
                        ? " (Equipped)"
                        : ""
                }
            </div>

            <div class="equipment-inventory-details">
                ${getEquipmentInventoryDetails(
                    item,
                    entry
                )}
            </div>

            <label>
                <input
                    type="checkbox"
                    class="equipment-stowed"
                    data-instance-id="${entry.instanceId}"
                    ${entry.stowed ? "checked" : ""}
                >
                Stowed
            </label>

            <button
                class="refund-equipment"
                data-instance-id="${entry.instanceId}"
                ${canRefund ? "" : "disabled"}
            >
                Refund
                ${
                    item.price !== null &&
                    item.price !== undefined
                        ? `${item.price} stags`
                        : ""
                }
            </button>
        `;

        list.appendChild(row);
    }

    content.appendChild(list);
    details.appendChild(content);
    container.appendChild(details);

    bindEquipmentInventoryControls();
}


function getEquipmentInventoryDetails(
    item,
    entry
) {
    const details = [];

    details.push(
        formatEquipmentCategory(
            item.category
        )
    );

    if (
        item.encumbrance !== null &&
        item.encumbrance !== undefined
    ) {
        details.push(
            `Enc ${getEquipmentInstanceEncumbrance(
                entry
            )}`
        );
    }

    if (
        item.category === "weapon" ||
        item.category === "armor"
    ) {
        details.push(
            `HP ${item.hardPoints || 0}`
        );
    }

    if (item.category === "attachment") {
        details.push(
            `HP Cost ${item.hardPointCost || 0}`
        );
    }

    return details.join(" | ");
}


function bindEquipmentInventoryControls() {
    const stowedCheckboxes =
        document.querySelectorAll(
            ".equipment-stowed"
        );

    for (
        const checkbox of
        stowedCheckboxes
    ) {
        checkbox.addEventListener(
            "change",
            event => {
                const instanceId =
                    Number(
                        event.target
                            .dataset
                            .instanceId
                    );

                setEquipmentStowed(
                    instanceId,
                    event.target.checked
                );

                renderEquipment();
                updateSummary();
            }
        );
    }

    const refundButtons =
        document.querySelectorAll(
            ".refund-equipment"
        );

    for (
        const button of
        refundButtons
    ) {
        button.addEventListener(
            "click",
            event => {
                const instanceId =
                    Number(
                        event.target
                            .dataset
                            .instanceId
                    );

                const success =
                    refundEquipment(
                        instanceId
                    );

                if (!success) return;

                renderEquipment();
                updateSummary();
            }
        );
    }
}


// ============================================================
// EQUIPMENT CATALOG
// ============================================================

function renderEquipmentCatalog() {
    const container =
        document.getElementById(
            "equipment-catalog-section"
        );

    container.innerHTML = `
        <h3>Equipment Catalog</h3>
    `;

    const categories = [
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
            id: "tack",
            name: "Tack"
        },
        {
            id: "barding",
            name: "Barding"
        },
        {
            id: "vehicle",
            name: "Vehicles"
        }
    ];

    for (const category of categories) {
        renderEquipmentCategory(
            container,
            category.id,
            category.name
        );
    }

    renderAttachmentCatalog(container);
}


function renderEquipmentCategory(
    parent,
    categoryId,
    heading
) {
    const items = GAME_DATA.equipment.filter(
        item =>
            item.category === categoryId &&
            item.subtype !== "service"
    );

    if (items.length === 0) return;

    const details =
        document.createElement("details");

    details.className =
        "equipment-catalog-category";

    const summary =
        document.createElement("summary");

    summary.textContent =
        `${heading} (${items.length})`;

    details.appendChild(summary);

    const content =
        document.createElement("div");

    content.className =
        "equipment-section-content";

    for (const item of items) {
        const card =
            createEquipmentCatalogCard(
                item
            );

        content.appendChild(card);
    }

    details.appendChild(content);
    parent.appendChild(details);

    bindEquipmentPurchaseButtons(details);
}


// ============================================================
// ATTACHMENTS
// ============================================================

function renderAttachmentCatalog(parent) {
    const weaponAttachments =
        GAME_DATA.equipment.filter(
            item =>
                item.category ===
                    "attachment" &&
                item.attachmentType ===
                    "weapon"
        );

    const armorAttachments =
        GAME_DATA.equipment.filter(
            item =>
                item.category ===
                    "attachment" &&
                item.attachmentType ===
                    "armor"
        );

    const section =
        document.createElement("section");

    section.className =
        "equipment-catalog-category";

    section.innerHTML = `
        <h4>Attachments</h4>

        <p>
            Weapon HP:
            ${getUsedWeaponHardPoints()}
            /
            ${getAvailableWeaponHardPoints()}
        </p>

        <p>
            Armor HP:
            ${getUsedArmorHardPoints()}
            /
            ${getAvailableArmorHardPoints()}
        </p>

        <h5>Weapon Attachments</h5>

        <div id="weapon-attachment-list"></div>

        <h5>Armor Attachments</h5>

        <div id="armor-attachment-list"></div>
    `;

    parent.appendChild(section);

    const weaponList =
        section.querySelector(
            "#weapon-attachment-list"
        );

    const armorList =
        section.querySelector(
            "#armor-attachment-list"
        );

    for (
        const item of
        weaponAttachments
    ) {
        weaponList.appendChild(
            createEquipmentCatalogCard(
                item
            )
        );
    }

    for (
        const item of
        armorAttachments
    ) {
        armorList.appendChild(
            createEquipmentCatalogCard(
                item
            )
        );
    }

    bindEquipmentPurchaseButtons(section);
}


// ============================================================
// CATALOG CARDS
// ============================================================

function createEquipmentCatalogCard(item) {
    const card =
        document.createElement("div");

    card.className =
        "equipment-catalog-card";

    const purchasable =
        canPurchaseEquipment(item.id);

    const priceText =
        item.price === null ||
        item.price === undefined
            ? "Not normally purchasable"
            : `${item.price} stags`;

    card.innerHTML = `
        <h5>${item.name}</h5>

        <p>
            ${getEquipmentCatalogSummary(
                item
            )}
        </p>

        ${
            item.description
                ? `
                    <p>
                        ${item.description}
                    </p>
                `
                : ""
        }

        <p>
            <strong>Price:</strong>
            ${priceText}
        </p>

        <p>
            <strong>Rarity:</strong>
            ${
                item.rarity === null
                    ? "—"
                    : item.rarity
            }
        </p>

        ${
            item.purchasable === false
                ? ""
                : `
                    <button
                        class="purchase-equipment"
                        data-equipment-id="${item.id}"
                        ${
                            purchasable
                                ? ""
                                : "disabled"
                        }
                    >
                        Buy
                    </button>
                `
        }
    `;

    return card;
}


function bindEquipmentPurchaseButtons(
    container
) {
    const buttons =
        container.querySelectorAll(
            ".purchase-equipment"
        );

    for (const button of buttons) {
        button.addEventListener(
            "click",
            event => {
                const equipmentId =
                    event.target
                        .dataset
                        .equipmentId;

                const success =
                    purchaseEquipment(
                        equipmentId
                    );

                if (!success) return;

                renderEquipment();
                updateSummary();
            }
        );
    }
}


// ============================================================
// EQUIPMENT DISPLAY HELPERS
// ============================================================

function getEquipmentCatalogSummary(item) {
    switch (item.category) {

        case "weapon":
            return getWeaponSummary(item);

        case "armor":
            return getArmorSummary(item);

        case "gear":
            return getGearSummary(item);

        case "mount":
            return getMountSummary(item);

        case "tack":
        case "barding":
            return getGearSummary(item);

        case "vehicle":
            return "Vehicle";

        case "attachment":
            return getAttachmentSummary(
                item
            );

        default:
            return "";
    }
}


function getWeaponSummary(item) {
    const parts = [];

    parts.push(
        getSkillName(item.skill)
    );

    parts.push(
        `Damage ${formatWeaponDamage(
            item.damage
        )}`
    );

    parts.push(
        `Crit ${item.critical}`
    );

    parts.push(
        `Range ${item.range}`
    );

    parts.push(
        `Enc ${item.encumbrance}`
    );

    parts.push(
        `HP ${item.hardPoints || 0}`
    );

    if (
        item.qualities &&
        item.qualities.length > 0
    ) {
        parts.push(
            formatEquipmentQualities(
                item.qualities
            )
        );
    }

    return parts.join(" | ");
}


function getArmorSummary(item) {
    return [
        `Defense ${item.defense}`,
        `Soak +${item.soak}`,
        `Enc ${item.encumbrance}`,
        `HP ${item.hardPoints || 0}`
    ].join(" | ");
}


function getGearSummary(item) {
    if (
        item.encumbrance === null ||
        item.encumbrance === undefined
    ) {
        return formatEquipmentCategory(
            item.category
        );
    }

    return `Enc ${item.encumbrance}`;
}


function getMountSummary(item) {
    return [
        `Brawn ${item.brawn}`,
        `Agility ${item.agility}`,
        `Soak ${item.soak}`,
        `WT ${item.woundThreshold}`,
        `Capacity ${item.encumbranceCapacity}`
    ].join(" | ");
}


function getAttachmentSummary(item) {
    const type =
        item.attachmentType === "weapon"
            ? "Weapon"
            : "Armor";

    return (
        `${type} Attachment | ` +
        `HP ${item.hardPointCost || 0}`
    );
}


function formatWeaponDamage(damage) {
    if (!damage) return "—";

    if (damage.type === "fixed") {
        return damage.value;
    }

    if (damage.type === "brawn-plus") {
        if (damage.value === 0) {
            return "Brawn";
        }

        return `Brawn +${damage.value}`;
    }

    return damage.value;
}


function formatEquipmentQualities(
    qualities
) {
    return qualities.map(
        quality => {
            if (
                quality.rating === undefined
            ) {
                return quality.name;
            }

            return (
                `${quality.name} ` +
                `${quality.rating}`
            );
        }
    ).join(", ");
}


function formatEquipmentCategory(
    category
) {
    switch (category) {
        case "weapon":
            return "Weapon";

        case "armor":
            return "Armor";

        case "gear":
            return "Gear";

        case "mount":
            return "Mount";

        case "tack":
            return "Tack";

        case "barding":
            return "Barding";

        case "vehicle":
            return "Vehicle";

        case "attachment":
            return "Attachment";

        default:
            return category;
    }
}


function getSkillName(skillId) {
    const skill =
        getSkillById(skillId);

    return skill
        ? skill.name
        : skillId;
}


// ================================================================
// SUMMARY
// ================================================================

function updateSummary() {

    const background =
        document.querySelector(
            "#summary-background span"
        );

    const career =
        document.querySelector(
            "#summary-career span"
        );

    const specialization =
        document.querySelector(
            "#summary-specialization span"
        );

    const xp =
        document.querySelector(
            "#summary-xp span"
        );

    const obligation =
        document.querySelector(
            "#summary-obligation span"
        );

    const wealth =
        document.querySelector(
            "#summary-wealth span"
        );


    background.textContent =
        character.background.name || "—";


    if (character.career) {

        career.textContent =
            getCareerById(
                character.career
            ).name;

    } else {

        career.textContent = "—";
    }


    if (
        character.career &&
        character.specialization
    ) {

        specialization.textContent =
            getSpecializationById(
                character.career,
                character.specialization
            ).name;

    } else {

        specialization.textContent = "—";
    }


    xp.textContent =
        getXPRemaining();


    obligation.textContent =
        getTotalObligation();


    wealth.textContent =
        getWealthRemaining()
            .toLocaleString();
}


// ================================================================
// HELPERS
// ================================================================

function getCharacteristicName(id) {
    const characteristic =
        GAME_DATA.characteristics.find(
            item => item.id === id
        );

    return characteristic
        ? characteristic.name
        : id;
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
