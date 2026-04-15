
// time code section
var date_time = undefined;
var current_hour = undefined;
var current_min = undefined;
var last_minute = undefined

/**
 * Updates the current time on the webpage every minute.
 * Formats the time in 12-hour format with leading zeros for single-digit hours.
 * Displays the time in the format "HH:MM AM/PM" in the element with the class "current_time".
 */
export function set_time() {
    date_time = new Date();
    current_hour = date_time.getHours();
    current_min = date_time.getMinutes();

    let time = date_time.toLocaleTimeString("en-US", { hour12: true })

    if (time.charAt(1) == ":") {
        time = "0" + time
    }
    let hours = time.slice(0, 2)
    let minutes = time.slice(3, 5)
    let am_pm = time.slice(9, 11)

    if (last_minute == undefined || minutes - last_minute > 0)
        document.querySelector(".current_time").innerText = hours + ":" + minutes + " " + am_pm;
    last_minute = minutes
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
