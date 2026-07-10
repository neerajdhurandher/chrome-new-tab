import {
    SETTINGS_TIME_FORMAT,
    SETTINGS_WEATHER_UNIT,
    TIME_FORMAT_12H,
    WEATHER_UNIT_C
} from "./constants.js";
import { retrieveDataFromLocalStorage, storeDataInLocalStorage } from "./chrome-storage-api.js";

const DEFAULT_SETTINGS = {
    [SETTINGS_TIME_FORMAT]: TIME_FORMAT_12H,
    [SETTINGS_WEATHER_UNIT]: WEATHER_UNIT_C
};

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
        ensureSetting(SETTINGS_WEATHER_UNIT)
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
