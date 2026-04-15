import { QUOTE_DATA, DEFAULT_QUOTE, DEFAULT_QUOTE_AUTHOR, QUOTE, AUTHOR, REFRESH_QUOTE_INTERVAL } from "./constants.js";
import { retrieveDataFromLocalStorage, storeDataInLocalStorage } from "./chrome-storage-api.js";
import { get_motivation_quote } from "./api_call.js"

/**
 * Manages the quote display by fetching from local storage or API.
 * Checks if the stored quote is expired and fetches a new one if necessary.
 * Updates the webpage with the current or new quote.
 * 
 * @async
 * @returns {Promise<void>}
 */
export async function manage_quote() {

    let quote_details = await get_quote_from_local_storage();

    if (quote_details.store_time === undefined) {
        await store_default_quote();
        set_default_quote();
        return;
    }

    const current_time_ms = new Date().getTime();
    const store_time_ms = new Date(quote_details.store_time).getTime();

    //  check if store_time is expired
    if (current_time_ms - store_time_ms > REFRESH_QUOTE_INTERVAL) {
        let new_quote = await fetch_new_quote();
        if (new_quote == undefined) {
            // new quote could not be fetched, show the last quote
            return set_quote(quote_details.quote, quote_details.author);
        }
        let storeResult = await store_last_quote_details(new_quote);
        if (storeResult == undefined || storeResult.status == false) {
            // new quote could not be stored, show the last quote
            return set_quote(quote_details.quote, quote_details.author);
        }

        let new_quote_details = storeResult.data;

        // update quote_details with new data
        quote_details = {
            store_time: new_quote_details.store_time,
            quote: new_quote_details[quote_details][QUOTE],
            author: new_quote_details[quote_details][AUTHOR]
        };

    }

    // update new quote on the webpage
    set_quote(quote_details.quote, quote_details.author);
}

/**
 * Retrieves quote details from local storage.
 * If retrieval fails or data is not available, returns default quote values.
 * 
 * @async
 * @returns {Promise<{store_time: number|undefined, quote: string, author: string}>} Object containing store time, quote text, and author name
 */
async function get_quote_from_local_storage() {
    let store_time = undefined
    let quote = undefined
    let author = undefined
    try {
        const response = await retrieveDataFromLocalStorage(QUOTE_DATA);
        if (response.status) {
            // Successfully retrieved quote data from local storage
            store_time = response.data.quote_data.store_time;
            quote = response.data.quote_data.quote_details[QUOTE];
            author = response.data.quote_data.quote_details[AUTHOR];
        }
    } catch (error) {
        console.error("Failed to fetch quote from local storage:", error);
        // Use default quote and author if fetching from local storage fails
        quote = DEFAULT_QUOTE;
        author = DEFAULT_QUOTE_AUTHOR;
    }

    return { store_time: store_time, quote: quote, author: author };
}

/**
 * Stores the default quote and author in local storage.
 * Used for initialization or fallback scenarios.
 * 
 * @async
 * @returns {Promise<void>}
 */
export async function store_default_quote() {
    let default_quote_details = {
        quote: DEFAULT_QUOTE,
        author: DEFAULT_QUOTE_AUTHOR
    };

    await store_last_quote_details(default_quote_details);
}

/**
 * Fetches a new motivational quote from the API.
 * 
 * @async
 * @returns {Promise<{quote: string, author: string}|undefined>} Object containing quote and author, or undefined if fetch fails
 */
async function fetch_new_quote() {
    return await get_motivation_quote();
}

/**
 * Stores the provided quote details in local storage with a timestamp.
 * Returns undefined if quote or author is missing.
 * 
 * @async
 * @param {{quote: string, author: string}} received_quote - Object containing the quote and author to store
 * @returns {Promise<{status: boolean, data: {quote_data: object}}|undefined>} Storage result with status and stored data, or undefined if input is invalid
 */
async function store_last_quote_details(received_quote) {
    if (received_quote[QUOTE] == undefined || received_quote[AUTHOR] == undefined) {
        // If either the quote or author is undefined, do not store
        return;
    }

    const time = new Date();
    let quote_details_obj = {
        store_time: time,
        quote_details: {
            quote: received_quote[QUOTE],
            author: received_quote[AUTHOR]
        }
    }
    let result = await storeDataInLocalStorage(QUOTE_DATA, quote_details_obj);
    return result;
}


/**
 * Sets the default quote and author on the webpage.
 */
function set_default_quote() {
    set_quote(DEFAULT_QUOTE, DEFAULT_QUOTE_AUTHOR);
}


/**
 * Sets the quote and author on the webpage.
 * If no quote or author is provided, sets default values.
 *
 * @param {string} quote - The quote text to display.
 * @param {string} author - The author of the quote.
 */
function set_quote(quote, author) {
    if (quote == undefined || author == undefined) {
        quote = DEFAULT_QUOTE;
        author = DEFAULT_QUOTE_AUTHOR;
    }
    document.querySelector(".quote_p").innerHTML = quote;
    document.querySelector(".quote_author_p").innerHTML = "-by " + author;
}

