import {
    SETTINGS_TIME_FORMAT,
    SETTINGS_WEATHER_UNIT,
    SETTINGS_BOOKMARK_BAR_POSITION,
    SETTINGS_BOOKMARK_OPEN_NEW_TAB,
    SETTINGS_BOOKMARK_SHOW_ICONS_ONLY,
    SETTINGS_SEARCH_OPEN_NEW_TAB,
    SETTINGS_SECONDARY_SEARCH_PROVIDER,
    SETTINGS_QUOTE_AUTHOR_VISIBILITY,
    SETTINGS_SHOW_QUOTE,
    TIME_FORMAT_12H,
    TIME_FORMAT_24H,
    WEATHER_UNIT_C,
    WEATHER_UNIT_F,
    BOOKMARK_BAR_POSITION_LEFT,
    BOOKMARK_BAR_POSITION_RIGHT,
    BOOKMARK_OPEN_NEW_TAB_DEFAULT,
    BOOKMARK_SHOW_ICONS_ONLY_DEFAULT,
    SEARCH_OPEN_NEW_TAB_DEFAULT,
    SHOW_QUOTE_DEFAULT,
    QUOTE_AUTHOR_VISIBILITY_ALWAYS,
    QUOTE_AUTHOR_VISIBILITY_HOVER,
    SECONDARY_SEARCH_PROVIDER_YOUTUBE,
    SECONDARY_SEARCH_PROVIDER_CHATGPT,
    SECONDARY_SEARCH_PROVIDER_GEMINI,
    SECONDARY_SEARCH_PROVIDER_CLAUDE,
    SECONDARY_SEARCH_PROVIDER_COPILOT,
    USER_NAME_MAX_LENGTH
} from "./constants.js";
import { initAppSettings, getAppSetting, setAppSetting } from "./app-settings.js";

const settingsOpenButton = document.getElementById("settings-open-btn");
const settingsPopup = document.getElementById("settings-popup");
const settingsCloseButton = document.getElementById("settings-close-btn");
const settingsMenuItems = document.querySelectorAll(".settings-menu-item");
const settingsViews = document.querySelectorAll(".settings-panel-view");
const segmentToggleOptions = document.querySelectorAll(".segment-toggle-option");
const settingsToggleInputs = document.querySelectorAll(".settings-toggle-input");
const settingsSelectInputs = document.querySelectorAll(".settings-select-input");
const settingsNameInput = document.getElementById("settings-name-input");
const settingsNameSaveBtn = document.getElementById("settings-name-save-btn");
const settingsNameError = document.getElementById("settings-name-error");
const helpAuthorElement = document.getElementById("help-author");
const helpVersionElement = document.getElementById("help-version");
const helpWhatsNewLink = document.getElementById("help-whats-new-link");

const SETTINGS_KEY_MAP = {
    time_format: SETTINGS_TIME_FORMAT,
    weather_unit: SETTINGS_WEATHER_UNIT,
    bookmark_bar_position: SETTINGS_BOOKMARK_BAR_POSITION,
    bookmark_open_new_tab: SETTINGS_BOOKMARK_OPEN_NEW_TAB,
    bookmark_show_icons_only: SETTINGS_BOOKMARK_SHOW_ICONS_ONLY,
    search_open_new_tab: SETTINGS_SEARCH_OPEN_NEW_TAB,
    secondary_search_provider: SETTINGS_SECONDARY_SEARCH_PROVIDER,
    quote_author_visibility: SETTINGS_QUOTE_AUTHOR_VISIBILITY,
    show_quote: SETTINGS_SHOW_QUOTE
};

const VALID_SETTINGS = {
    [SETTINGS_TIME_FORMAT]: [TIME_FORMAT_12H, TIME_FORMAT_24H],
    [SETTINGS_WEATHER_UNIT]: [WEATHER_UNIT_C, WEATHER_UNIT_F],
    [SETTINGS_BOOKMARK_BAR_POSITION]: [BOOKMARK_BAR_POSITION_LEFT, BOOKMARK_BAR_POSITION_RIGHT],
    [SETTINGS_BOOKMARK_OPEN_NEW_TAB]: [true, false],
    [SETTINGS_BOOKMARK_SHOW_ICONS_ONLY]: [true, false],
    [SETTINGS_SEARCH_OPEN_NEW_TAB]: [true, false],
    [SETTINGS_SHOW_QUOTE]: [true, false],
    [SETTINGS_SECONDARY_SEARCH_PROVIDER]: [
        SECONDARY_SEARCH_PROVIDER_YOUTUBE,
        SECONDARY_SEARCH_PROVIDER_CHATGPT,
        SECONDARY_SEARCH_PROVIDER_GEMINI,
        SECONDARY_SEARCH_PROVIDER_CLAUDE,
        SECONDARY_SEARCH_PROVIDER_COPILOT
    ],
    [SETTINGS_QUOTE_AUTHOR_VISIBILITY]: [
        QUOTE_AUTHOR_VISIBILITY_ALWAYS,
        QUOTE_AUTHOR_VISIBILITY_HOVER
    ]
};

function openSettings() {
    if (!settingsPopup) {
        return;
    }

    settingsPopup.classList.add("overlay_show");
    setActiveSection("general");
}

function closeSettings() {
    if (!settingsPopup) {
        return;
    }

    settingsPopup.classList.remove("overlay_show");
}

function setActiveSection(sectionName) {
    settingsMenuItems.forEach((item) => {
        const isActive = item.dataset.section === sectionName;
        item.classList.toggle("active", isActive);
    });

    settingsViews.forEach((view) => {
        const isActive = view.dataset.view === sectionName;
        view.classList.toggle("active", isActive);
    });
}

function updateToggleGroupUI(settingKey, settingValue) {
    segmentToggleOptions.forEach((option) => {
        if (option.dataset.settingKey !== settingKey) {
            return;
        }

        const isActive = option.dataset.settingValue === settingValue;
        option.classList.toggle("active", isActive);
    });
}

function syncSettingsToggleUI() {
    updateToggleGroupUI("time_format", getAppSetting(SETTINGS_TIME_FORMAT));
    updateToggleGroupUI("weather_unit", getAppSetting(SETTINGS_WEATHER_UNIT));
    updateToggleGroupUI("bookmark_bar_position", getAppSetting(SETTINGS_BOOKMARK_BAR_POSITION));
    updateToggleGroupUI("quote_author_visibility", getAppSetting(SETTINGS_QUOTE_AUTHOR_VISIBILITY));
    settingsToggleInputs.forEach((input) => {
        const settingKey = input.dataset.settingKey;
        if (settingKey === "bookmark_open_new_tab") {
            const value = getAppSetting(SETTINGS_BOOKMARK_OPEN_NEW_TAB);
            input.checked = typeof value === "boolean" ? value : BOOKMARK_OPEN_NEW_TAB_DEFAULT;
        }

        if (settingKey === "bookmark_show_icons_only") {
            const value = getAppSetting(SETTINGS_BOOKMARK_SHOW_ICONS_ONLY);
            input.checked = typeof value === "boolean" ? value : BOOKMARK_SHOW_ICONS_ONLY_DEFAULT;
        }

        if (settingKey === "search_open_new_tab") {
            const value = getAppSetting(SETTINGS_SEARCH_OPEN_NEW_TAB);
            input.checked = typeof value === "boolean" ? value : SEARCH_OPEN_NEW_TAB_DEFAULT;
        }

        if (settingKey === "show_quote") {
            const value = getAppSetting(SETTINGS_SHOW_QUOTE);
            input.checked = typeof value === "boolean" ? value : SHOW_QUOTE_DEFAULT;
        }
    });

    settingsSelectInputs.forEach((input) => {
        const settingKey = input.dataset.settingKey;
        if (settingKey === "secondary_search_provider") {
            const value = getAppSetting(SETTINGS_SECONDARY_SEARCH_PROVIDER);
            const validValues = VALID_SETTINGS[SETTINGS_SECONDARY_SEARCH_PROVIDER];
            input.value = validValues.includes(value) ? value : SECONDARY_SEARCH_PROVIDER_YOUTUBE;
        }
    });
}

function emitSettingChanged(settingKey, settingValue) {
    document.dispatchEvent(new CustomEvent("app-setting-changed", {
        detail: {
            key: settingKey,
            value: settingValue
        }
    }));
}

async function applyGeneralSetting(settingKey, settingValue) {
    const storageKey = SETTINGS_KEY_MAP[settingKey];
    if (!storageKey || !VALID_SETTINGS[storageKey].includes(settingValue)) {
        return;
    }

    await setAppSetting(storageKey, settingValue);
    updateToggleGroupUI(settingKey, settingValue);
    emitSettingChanged(storageKey, settingValue);
}

async function initializeSettingsUI() {
    await initAppSettings();
    syncSettingsToggleUI();
    populateHelpInfo();
    await loadSavedName();
}

async function loadSavedName() {
    if (!settingsNameInput) {
        return;
    }

    try {
        const response = await chrome.runtime.sendMessage({ action: "retrieve_data", key: "user_name" });
        if (response?.response_message?.data?.user_name) {
            settingsNameInput.value = response.response_message.data.user_name;
        }
    } catch (error) {
        // name not set yet, leave placeholder
    }
}

async function saveSettingsName() {
    if (!settingsNameInput) {
        return;
    }

    const rawValue = settingsNameInput.value.trim();
    if (rawValue.length === 0 || rawValue.length > USER_NAME_MAX_LENGTH) {
        settingsNameInput.classList.add("input-error");
        setTimeout(() => settingsNameInput.classList.remove("input-error"), 1000);
        if (settingsNameError) {
            settingsNameError.textContent = rawValue.length > USER_NAME_MAX_LENGTH
                ? `Name must be ${USER_NAME_MAX_LENGTH} characters or less.`
                : "Name cannot be empty.";
        }
        return;
    }
    if (settingsNameError) {
        settingsNameError.textContent = "";
    }

    try {
        await chrome.runtime.sendMessage({ action: "store_data", key: "user_name", value: rawValue });
        document.dispatchEvent(new CustomEvent("app-setting-changed", {
            detail: { key: "user_name", value: rawValue }
        }));
        settingsNameInput.classList.add("settings-name-saved");
        setTimeout(() => settingsNameInput.classList.remove("settings-name-saved"), 1200);
    } catch (error) {
        console.error("Failed to save name:", error);
    }
}

function populateHelpInfo() {
    const manifest = chrome.runtime.getManifest();
    if (helpAuthorElement && manifest.author) {
        helpAuthorElement.textContent = manifest.author;
    }

    if (helpVersionElement && manifest.version) {
        helpVersionElement.textContent = manifest.version;
    }

    if (helpWhatsNewLink) {
        helpWhatsNewLink.href = chrome.runtime.getURL("update.html");
    }
}

if (settingsOpenButton && settingsPopup && settingsCloseButton) {
    settingsOpenButton.addEventListener("click", () => {
        openSettings();
    });

    settingsCloseButton.addEventListener("click", () => {
        closeSettings();
    });

    settingsPopup.addEventListener("click", (event) => {
        if (event.target === settingsPopup) {
            closeSettings();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && settingsPopup.classList.contains("overlay_show")) {
            closeSettings();
        }
    });

    settingsMenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            const sectionName = item.dataset.section;
            if (sectionName) {
                setActiveSection(sectionName);
            }
        });
    });

    segmentToggleOptions.forEach((option) => {
        option.addEventListener("click", async () => {
            await applyGeneralSetting(option.dataset.settingKey, option.dataset.settingValue);
        });
    });

    settingsToggleInputs.forEach((input) => {
        input.addEventListener("change", async () => {
            const settingKey = input.dataset.settingKey;
            if (settingKey === "bookmark_open_new_tab") {
                const settingValue = input.checked;
                await applyGeneralSetting(settingKey, settingValue);
            }

            if (settingKey === "bookmark_show_icons_only") {
                const settingValue = input.checked;
                await applyGeneralSetting(settingKey, settingValue);
            }

            if (settingKey === "search_open_new_tab") {
                const settingValue = input.checked;
                await applyGeneralSetting(settingKey, settingValue);
            }

            if (settingKey === "show_quote") {
                const settingValue = input.checked;
                await applyGeneralSetting(settingKey, settingValue);
            }
        });
    });

    settingsSelectInputs.forEach((input) => {
        input.addEventListener("change", async () => {
            await applyGeneralSetting(input.dataset.settingKey, input.value);
        });
    });

    if (settingsNameSaveBtn) {
        settingsNameSaveBtn.addEventListener("click", () => {
            saveSettingsName();
        });
    }

    if (settingsNameInput) {
        settingsNameInput.maxLength = USER_NAME_MAX_LENGTH;
        settingsNameInput.placeholder = `max ${USER_NAME_MAX_LENGTH} chars`;
        let settingsNameErrorTimer = null;

        function showSettingsNameError(message) {
            if (!settingsNameError) {
                return;
            }
            settingsNameError.textContent = message;
            clearTimeout(settingsNameErrorTimer);
            settingsNameErrorTimer = setTimeout(() => {
                settingsNameError.textContent = "";
            }, 2000);
        }

        settingsNameInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                saveSettingsName();
                return;
            }

            const isModifier = event.ctrlKey || event.metaKey || event.altKey;
            const isPrintable = event.key.length === 1 && !isModifier;
            if (isPrintable && settingsNameInput.value.length >= USER_NAME_MAX_LENGTH) {
                showSettingsNameError(`Max ${USER_NAME_MAX_LENGTH} characters allowed.`);
            }
        });

        settingsNameInput.addEventListener("input", () => {
            if (settingsNameInput.value.length <= USER_NAME_MAX_LENGTH && settingsNameError) {
                settingsNameError.textContent = "";
            }
        });
    }

    initializeSettingsUI();
}
