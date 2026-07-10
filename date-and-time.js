
import {
    SETTINGS_TIME_FORMAT,
    TIME_FORMAT_12H,
    TIME_FORMAT_24H
} from "./constants.js";
import { initAppSettings, getAppSetting } from "./app-settings.js";

// time code section
var date_time = undefined;
var current_hour = undefined;
var current_min = undefined;
var last_minute = undefined
let currentTimeFormat = TIME_FORMAT_12H;

document.addEventListener("app-setting-changed", (event) => {
    if (event.detail && event.detail.key === SETTINGS_TIME_FORMAT) {
        currentTimeFormat = event.detail.value;
        last_minute = undefined;
        set_time();
    }
});

initAppSettings().then(() => {
    const format = getAppSetting(SETTINGS_TIME_FORMAT);
    if (format === TIME_FORMAT_24H || format === TIME_FORMAT_12H) {
        currentTimeFormat = format;
        last_minute = undefined;
        set_time();
    }
});

/**
 * Updates the current time on the webpage every minute.
 * Formats the time in 12-hour format with leading zeros for single-digit hours.
 * Displays the time in the format "HH:MM AM/PM" in the element with the class "current_time".
 */
export function set_time() {
    date_time = new Date();
    current_hour = date_time.getHours();
    current_min = date_time.getMinutes();

    let formattedTime = "";
    if (currentTimeFormat === TIME_FORMAT_24H) {
        formattedTime = date_time.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    } else {
        formattedTime = date_time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    if (last_minute == undefined || current_min !== last_minute)
        document.querySelector(".current_time").innerText = formattedTime;
    last_minute = current_min
}

/**
 * Updates the current date on the webpage.
 * Fetches the day, date, month, and year and displays them in their respective elements.
 */
export async function updateDate() {
    const IDCollection = ["day", "daynum", "month", "year"];
    try {
        const response = get_day_date();
        for (let i = 0; i < IDCollection.length; i++) {
            document.getElementById(IDCollection[i]).firstChild.nodeValue = response[i];
        }
    } catch (error) {
        console.error("Failed to update date:", error);
    }
}

/**
 * Gets the current day name, day number, month name, and year.
 * @returns {Array} An array containing the current day name, day number, month name, and year
 */
function get_day_date() {
    let time = new Date(),
        dayName = time.getDay(),
        dayNum = time.getDate(),
        month = time.getMonth(),
        year = time.getFullYear();

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const dayWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    let current_day_date_obj = [dayWeek[dayName], dayNum, months[month], year];
    return current_day_date_obj;
}
