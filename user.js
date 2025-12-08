import { USER_NAME, RETRIEVE_DATA } from "./constants.js"
import { callChromeStorageApi } from "./chrome-storage-api.js";
import { storeDataInLocalStorage } from "./chrome-storage-api.js";


/**
 * Sets the greeting message on the webpage based on the current time of day.
 * Displays "Good morning/afternoon/evening" followed by the user's name if available.
 * 
 * @async
 * @returns {Promise<void>}
 */
export async function set_greeting() {
    try {
        const response = get_greeting();
        document.querySelector(".greeting-h1").innerHTML = "Good " + response + ", ";
        setUserName();
    } catch (error) {
        console.error("Failed to set greeting:", error);
    }
}

/**
 * Determines the appropriate greeting based on the current time of day.
 * Returns "morning" before 12 PM, "afternoon" between 12 PM and 4 PM, and "evening" after 4 PM.
 * 
 * @returns {string} The greeting string: "morning", "afternoon", or "evening"
 */
function get_greeting() {
    let date_time = new Date();
    let greeting = undefined;
    if (date_time.getHours() < 12)
        greeting = "morning";
    else if (date_time.getHours() >= 12 && date_time.getHours() <= 16)
        greeting = "afternoon";
    else
        greeting = "evening";

    return greeting
}

/**
 * Retrieves the user's name from Chrome storage and appends it to the greeting message.
 * If the user name is found, it is added to the greeting element with a period.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function setUserName() {
    try {
        const response = await callChromeStorageApi({ action: RETRIEVE_DATA, key: USER_NAME, name: "Retrieving user name for greeting" });
        if (response.response_message.data[USER_NAME] !== undefined) {
            document.querySelector(".greeting-h1").innerHTML += response.response_message.data[USER_NAME] + ".";
        }
    } catch (error) {
        console.error("Failed to set user name:", error);
    }
}

/**
 * Saves the user's name to Chrome storage.
 * Retries up to 3 times in case of failure, with a 500ms delay between attempts.
 * * @async
 * @param {string} value - The user name to save
 * @param {number} recursionCount - The current retry attempt count (default is 0)
 * @returns {Promise<{status: boolean, message: string}>} Result object with status and message
 */

export async function saveUserName(value, recursionCount = 0) {
    let result = await storeDataInLocalStorage(USER_NAME, value);
    if (result.status == false) {
        if (recursionCount < 3) {
            await sleep(500)
            console.debug("Retrying to save user name, attempt:", recursionCount + 1);
            return saveUserName(value, recursionCount + 1)
        } else {
            console.error("Failed to store user name after multiple attempts:", result.message);
        }
    }

    return { status: result.status, message: result.message };
}
