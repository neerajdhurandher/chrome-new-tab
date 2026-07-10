import {
    SETTINGS_TIME_FORMAT,
    SETTINGS_WEATHER_UNIT,
    TIME_FORMAT_12H,
    TIME_FORMAT_24H,
    WEATHER_UNIT_C,
    WEATHER_UNIT_F
} from "./constants.js";
import { initAppSettings, getAppSetting, setAppSetting } from "./app-settings.js";

const settingsOpenButton = document.getElementById("settings-open-btn");
const settingsPopup = document.getElementById("settings-popup");
const settingsCloseButton = document.getElementById("settings-close-btn");
const settingsMenuItems = document.querySelectorAll(".settings-menu-item");
const settingsViews = document.querySelectorAll(".settings-panel-view");
const segmentToggleOptions = document.querySelectorAll(".segment-toggle-option");

const SETTINGS_KEY_MAP = {
    time_format: SETTINGS_TIME_FORMAT,
    weather_unit: SETTINGS_WEATHER_UNIT
};

const VALID_SETTINGS = {
    [SETTINGS_TIME_FORMAT]: [TIME_FORMAT_12H, TIME_FORMAT_24H],
    [SETTINGS_WEATHER_UNIT]: [WEATHER_UNIT_C, WEATHER_UNIT_F]
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

function syncGeneralToggleUI() {
    updateToggleGroupUI("time_format", getAppSetting(SETTINGS_TIME_FORMAT));
    updateToggleGroupUI("weather_unit", getAppSetting(SETTINGS_WEATHER_UNIT));
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
    syncGeneralToggleUI();
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

    initializeSettingsUI();
}
