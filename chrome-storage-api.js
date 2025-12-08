import { RETRIEVE_DATA, STORE_DATA } from "./constants.js";

/**
 * Sends a message to the Chrome runtime API and handles the response.
 * Wraps chrome.runtime.sendMessage in a Promise for easier async/await usage.
 * 
 * @async
 * @param {object} message - The message object to send to the Chrome runtime
 * @returns {Promise<object>} The response from the Chrome runtime API
 * @throws {Error} Chrome runtime last error if the message fails
 */
export async function callChromeStorageApi(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

/**
 * Stores data in Chrome local storage using the background script.
 * Sends a STORE_DATA action message to the Chrome runtime.
 * 
 * @async
 * @param {string} dataKey - The key under which to store the data
 * @param {*} dataValue - The value to store (can be any serializable type)
 * @returns {Promise<{status: boolean, data: *, message: string}>} Result object with status, stored data, and success message
 * @throws {{status: boolean, message: string}} Error object with status false and error message if storage fails
 */
export async function storeDataInLocalStorage(dataKey, dataValue) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: STORE_DATA, key: dataKey, value: dataValue }, (response) => {
            if (chrome.runtime.lastError || response.response_message.status === false) {
                reject({
                    status: false,
                    message: chrome.runtime.lastError ? chrome.runtime.lastError.message : response.response_message.error
                });
            } else {
                resolve({
                    status: true,
                    data: response.response_message.data.value,
                    message: "Data stored successfully"
                });
            }
        });
    });
}

/**
 * Retrieves data from Chrome local storage using the background script.
 * Sends a RETRIEVE_DATA action message to the Chrome runtime.
 * 
 * @async
 * @param {string} dataKey - The key of the data to retrieve from storage
 * @returns {Promise<{status: boolean, data: *, message: string}>} Result object with status, retrieved data, and success message
 * @throws {{status: boolean, message: string}} Error object with status false and error message if retrieval fails
 */
export async function retrieveDataFromLocalStorage(dataKey) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: dataKey }, (response) => {
            if (chrome.runtime.lastError || response.response_message.status === false) {
                reject({
                    status: false,
                    message: chrome.runtime.lastError ? chrome.runtime.lastError.message : response.response_message.error
                });
            } else {
                resolve({
                    status: true,
                    data: response.response_message.data,
                    message: "Data retrieved successfully"
                });
            }
        });
    });
}