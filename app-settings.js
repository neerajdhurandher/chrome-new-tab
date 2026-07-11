import {
    SETTINGS_TIME_FORMAT,
    SETTINGS_WEATHER_UNIT,
    SETTINGS_BOOKMARK_BAR_POSITION,
    SETTINGS_BOOKMARK_OPEN_NEW_TAB,
    SETTINGS_BOOKMARK_SHOW_ICONS_ONLY,
    SETTINGS_SEARCH_OPEN_NEW_TAB,
    SETTINGS_SECONDARY_SEARCH_PROVIDER,
    TIME_FORMAT_12H,
    WEATHER_UNIT_C,
    BOOKMARK_BAR_POSITION_RIGHT,
    BOOKMARK_OPEN_NEW_TAB_DEFAULT,
    BOOKMARK_SHOW_ICONS_ONLY_DEFAULT,
    SEARCH_OPEN_NEW_TAB_DEFAULT,
    SECONDARY_SEARCH_PROVIDER_YOUTUBE
} from "./constants.js";
import { retrieveDataFromLocalStorage, storeDataInLocalStorage } from "./chrome-storage-api.js";

const DEFAULT_SETTINGS = {
    [SETTINGS_TIME_FORMAT]: TIME_FORMAT_12H,
    [SETTINGS_WEATHER_UNIT]: WEATHER_UNIT_C,
    [SETTINGS_BOOKMARK_BAR_POSITION]: BOOKMARK_BAR_POSITION_RIGHT,
    [SETTINGS_BOOKMARK_OPEN_NEW_TAB]: BOOKMARK_OPEN_NEW_TAB_DEFAULT,
    [SETTINGS_BOOKMARK_SHOW_ICONS_ONLY]: BOOKMARK_SHOW_ICONS_ONLY_DEFAULT,
    [SETTINGS_SEARCH_OPEN_NEW_TAB]: SEARCH_OPEN_NEW_TAB_DEFAULT,
    [SETTINGS_SECONDARY_SEARCH_PROVIDER]: SECONDARY_SEARCH_PROVIDER_YOUTUBE
};

const BOOLEAN_SETTING_KEYS = new Set([
    SETTINGS_BOOKMARK_OPEN_NEW_TAB,
    SETTINGS_BOOKMARK_SHOW_ICONS_ONLY,
    SETTINGS_SEARCH_OPEN_NEW_TAB
]);

function normalizeBooleanValue(storedValue, defaultValue) {
    if (typeof storedValue === "boolean") {
        return storedValue;
    }

    if (typeof storedValue === "string") {
        if (storedValue === "enabled" || storedValue === "true") {
            return true;
        }
        if (storedValue === "disabled" || storedValue === "false") {
            return false;
        }
    }

    if (typeof storedValue === "number") {
        return storedValue !== 0;
    }

    return defaultValue;
}

const settingsCache = { ...DEFAULT_SETTINGS };
let settingsInitialized = false;

async function getStoredSetting(key) {
    try {
        const response = await retrieveDataFromLocalStorage(key);
        if (response.status && response.data && response.data[key] !== undefined) {
            return response.data[key];
        }
    } catch (error) {
        // Missing key is expected on first run; defaults are applied below.
    }

    return undefined;
}

async function ensureSetting(key) {
    const storedValue = await getStoredSetting(key);
    if (storedValue !== undefined) {
        if (BOOLEAN_SETTING_KEYS.has(key)) {
            const normalizedValue = normalizeBooleanValue(storedValue, DEFAULT_SETTINGS[key]);
            settingsCache[key] = normalizedValue;
            if (storedValue !== normalizedValue) {
                await storeDataInLocalStorage(key, normalizedValue);
            }
            return settingsCache[key];
        }

        settingsCache[key] = storedValue;
        return storedValue;
    }

    const defaultValue = DEFAULT_SETTINGS[key];
    settingsCache[key] = defaultValue;
    await storeDataInLocalStorage(key, defaultValue);
    return defaultValue;
}

export async function initAppSettings() {
    if (settingsInitialized) {
        return settingsCache;
    }

    await Promise.all([
        ensureSetting(SETTINGS_TIME_FORMAT),
        ensureSetting(SETTINGS_WEATHER_UNIT),
        ensureSetting(SETTINGS_BOOKMARK_BAR_POSITION),
        ensureSetting(SETTINGS_BOOKMARK_OPEN_NEW_TAB),
        ensureSetting(SETTINGS_BOOKMARK_SHOW_ICONS_ONLY),
        ensureSetting(SETTINGS_SEARCH_OPEN_NEW_TAB),
        ensureSetting(SETTINGS_SECONDARY_SEARCH_PROVIDER)
    ]);

    settingsInitialized = true;
    return settingsCache;
}

export function getAppSetting(key) {
    return settingsCache[key];
}

export async function setAppSetting(key, value) {
    settingsCache[key] = value;
    await storeDataInLocalStorage(key, value);
    return value;
}

export function getDefaultSetting(key) {
    return DEFAULT_SETTINGS[key];
}
