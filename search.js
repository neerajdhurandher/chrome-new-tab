import {
    GET_SEARCH_SUGGESTIONs,
    GOOGLE_SEARCH_LINK,
    YOUTUBE_SEARCH_LINK,
    CHATGPT_SEARCH_LINK,
    GEMINI_SEARCH_LINK,
    CLAUDE_SEARCH_LINK,
    COPILOT_SEARCH_LINK,
    SETTINGS_SEARCH_OPEN_NEW_TAB,
    SETTINGS_SECONDARY_SEARCH_PROVIDER,
    SEARCH_OPEN_NEW_TAB_DEFAULT,
    SECONDARY_SEARCH_PROVIDER_YOUTUBE,
    SECONDARY_SEARCH_PROVIDER_CHATGPT,
    SECONDARY_SEARCH_PROVIDER_GEMINI,
    SECONDARY_SEARCH_PROVIDER_CLAUDE,
    SECONDARY_SEARCH_PROVIDER_COPILOT
} from "./constants.js"
import { initAppSettings, getAppSetting } from "./app-settings.js";

import { callChromeStorageApi } from "./chrome-storage-api.js";


// search code section
var google_search_div_id_ele = document.getElementById("google-search-div-id");
var google_search_input_ele = document.getElementById("google-search-input");
var youtube_search_input_ele = document.getElementById("youtube-search-input");
var youtube_search_div_id_ele = document.getElementById("youtube-search-div-id");
var suggestions_div_element = document.getElementById("suggestions");
let suggestionItems = suggestions_div_element.getElementsByClassName('suggestion-item');

let suggestions_data = [];
let last_input = '';
let current_focus = -1;
let openSearchInNewTab = SEARCH_OPEN_NEW_TAB_DEFAULT;
let secondarySearchProvider = SECONDARY_SEARCH_PROVIDER_YOUTUBE;

const SECONDARY_SEARCH_CONFIG = {
    [SECONDARY_SEARCH_PROVIDER_YOUTUBE]: {
        title: "YouTube",
        placeholder: "youtube search",
        icon: "./imgs/youtube-icon.svg",
        searchLink: YOUTUBE_SEARCH_LINK
    },
    [SECONDARY_SEARCH_PROVIDER_CHATGPT]: {
        title: "ChatGPT",
        placeholder: "chatgpt search",
        icon: "./imgs/ChatGPT-Logo.svg.webp",
        searchLink: CHATGPT_SEARCH_LINK
    },
    [SECONDARY_SEARCH_PROVIDER_GEMINI]: {
        title: "Gemini",
        placeholder: "gemini search",
        icon: "./imgs/Google_Gemini_icon.svg.webp",
        searchLink: GEMINI_SEARCH_LINK
    },
    [SECONDARY_SEARCH_PROVIDER_CLAUDE]: {
        title: "Claude",
        placeholder: "claude search",
        icon: "./imgs/Claude_AI_symbol.svg.webp",
        searchLink: CLAUDE_SEARCH_LINK
    },
    [SECONDARY_SEARCH_PROVIDER_COPILOT]: {
        title: "Copilot",
        placeholder: "copilot search",
        icon: "./imgs/copilot-icon.svg",
        searchLink: COPILOT_SEARCH_LINK
    }
};

const SECONDARY_PROVIDER_VALUES = Object.keys(SECONDARY_SEARCH_CONFIG);

initAppSettings().then(() => {
    const searchTabMode = getAppSetting(SETTINGS_SEARCH_OPEN_NEW_TAB);
    const secondaryProvider = getAppSetting(SETTINGS_SECONDARY_SEARCH_PROVIDER);

    if (typeof searchTabMode === "boolean") {
        openSearchInNewTab = searchTabMode;
    }

    if (SECONDARY_PROVIDER_VALUES.includes(secondaryProvider)) {
        secondarySearchProvider = secondaryProvider;
    }

    applySecondarySearchProviderUI();
});

document.addEventListener("app-setting-changed", (event) => {
    if (!event.detail) {
        return;
    }

    if (event.detail.key === SETTINGS_SEARCH_OPEN_NEW_TAB) {
        openSearchInNewTab = event.detail.value === true;
    }

    if (event.detail.key === SETTINGS_SECONDARY_SEARCH_PROVIDER && SECONDARY_PROVIDER_VALUES.includes(event.detail.value)) {
        secondarySearchProvider = event.detail.value;
        applySecondarySearchProviderUI();
    }
});

document.getElementById("youtube-search-btn").addEventListener('click', () => {
    got_for_youtube_search();
})

document.getElementById("google-search-btn").addEventListener('click', () => {
    got_for_google_search();
})

document.getElementById("youtube-search-input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        got_for_youtube_search();
    }
});

document.getElementById("google-search-input").addEventListener("keydown", function (event) {
    if (event.keyCode === 40) {
        // Down arrow key
        event.preventDefault();
        current_focus++;
        addActive(suggestionItems);
    } else if (event.keyCode === 38) {
        // Up arrow key
        event.preventDefault();
        current_focus--;
        addActive(suggestionItems);
    } else if (event.keyCode === 13) {
        event.preventDefault();
        if (current_focus > -1) {
            if (suggestionItems) suggestionItems[current_focus].click();
        } else {
            got_for_google_search();
        }
    }
});

document.getElementById("google-search-input").addEventListener("click", () => {
    hide_youtube_search_bar();
})

document.getElementById("youtube-search-input").addEventListener("click", () => {
    hide_google_search_bar();
})

document.getElementById("google-search-box-id").addEventListener("click", () => {
    reset_search_div();
    hide_youtube_search_bar();
})

document.getElementById("youtube-search-box-id").addEventListener("click", () => {
    reset_search_div();
    hide_google_search_bar();
})

document.getElementById('google-search-input').addEventListener('input', debounce(showSearchSuggestions, 800));


google_search_div_id_ele.addEventListener("focusin", () => {
    showSearchSuggestions();
});

google_search_div_id_ele.addEventListener("focusout", () => {
    suggestions_div_element.style.display = 'none';
});


/**
 * Creates a debounced version of a function that delays invoking it until
 * after the specified delay has elapsed since the last invocation.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} A debounced version of the provided function.
 */
function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Triggers a Google search using the value from the Google search input field.
 */
function got_for_google_search() {
    got_for_search("google-search-input", GOOGLE_SEARCH_LINK)
}

/**
 * Triggers a YouTube / secondary app search using the value from the YouTube search input field.
 */
function got_for_youtube_search() {
    const providerConfig = SECONDARY_SEARCH_CONFIG[secondarySearchProvider] || SECONDARY_SEARCH_CONFIG[SECONDARY_SEARCH_PROVIDER_YOUTUBE];
    got_for_search("youtube-search-input", providerConfig.searchLink)
}

/**
 * Reads the search query from the given input element and navigates to the
 * appropriate search provider. Clears the input field after searching.
 * @param {string} input_element_id - The ID of the input element to read the query from.
 * @param {string} main_link - The base search URL for the target provider.
 */
function got_for_search(input_element_id, main_link) {
    var search_query = document.getElementById(input_element_id).value;
    search_query = search_query.trim();
    if (search_query != "") {
        if (main_link == GOOGLE_SEARCH_LINK) {
            chrome_search_api(search_query, openSearchInNewTab);
        } else {
            const target = openSearchInNewTab ? "_blank" : "_self";
            window.open(main_link + encodeURIComponent(search_query), target);
        }
        document.getElementById(input_element_id).value = "";
        current_focus = -1;
    }
}

/**
 * Executes a search in the current tab using the Chrome Search API.
 * @param {string} search_query - The search query string.
 */
function chrome_search_api(search_query, newTab = false) {
    chrome.search.query({
        text: search_query,
        disposition: newTab ? "NEW_TAB" : "CURRENT_TAB"
    });
}

/**
 * Validates and opens the given URL in the current tab.
 * Clears both search input fields after navigation.
 * @param {string} url - The URL to open.
 */
function open_url(url) {
    // check if url is valid or not
    if (url == undefined || validate_url(url) == false) {
        return;
    }
    window.open(url, openSearchInNewTab ? "_blank" : "_self");
    google_search_input_ele.value = "";
    youtube_search_input_ele.value = "";
}

function applySecondarySearchProviderUI() {
    const providerConfig = SECONDARY_SEARCH_CONFIG[secondarySearchProvider] || SECONDARY_SEARCH_CONFIG[SECONDARY_SEARCH_PROVIDER_YOUTUBE];
    const secondaryInput = document.getElementById("youtube-search-input");
    const secondaryLogo = document.querySelector("#youtube-search-box-id .img-logo");

    if (secondaryInput) {
        secondaryInput.placeholder = providerConfig.placeholder;
    }

    if (secondaryLogo) {
        secondaryLogo.src = providerConfig.icon;
        secondaryLogo.alt = providerConfig.title + " icon";
    }
}

/**
 * Fetches and displays search suggestions for the current Google search input value.
 * Hides the suggestions container if the input is empty or fewer than 2 characters.
 * Reuses cached suggestions if the input has not changed.
 * @returns {Promise<void>}
 */
async function showSearchSuggestions() {
    let input = document.getElementById('google-search-input').value;
    input = input.trim();
    const suggestionsContainer = document.getElementById('suggestions');

    if (input.trim() === '' || input.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    if (suggestions_data.length == 0 || input !== last_input) {
        last_input = input;
        suggestions_data = await getSearchSuggestions(input);
        current_focus = -1;
    }

    if (!suggestions_data) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';

    suggestions_data.forEach(suggestion_item => {
        let suggestion_type = suggestion_item["suggestion_type"];
        let suggestion = suggestion_item["suggestion"];
        let suggestionItem = document.createElement('div');


        if (suggestion_type === 'NAVIGATION') {
            suggestionItem.setAttribute('data-url', suggestion);
            //  remove http from suggestion and any thing after .com
            suggestion = suggestion.replace(/(^\w+:|^)\/\//, '');
        }

        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;
        // Add custom data-tag attribute to store suggestion type
        suggestionItem.setAttribute('data-tag', suggestion_type);
        suggestionItem.addEventListener('click', () => {
            google_search_input_ele.value = suggestion;
            suggestionsContainer.style.display = 'none';
            suggestionClickHandler(suggestionItem);
        });
        suggestionsContainer.appendChild(suggestionItem);
    });

    suggestionsContainer.style.display = 'block';
}

/**
 * Retrieves search suggestions from the Chrome storage API for the given input.
 * @param {string} input - The search query to fetch suggestions for.
 * @returns {Promise<Array>} A promise that resolves to an array of suggestion objects.
 */
async function getSearchSuggestions(input) {
    try {
        const response = await callChromeStorageApi({ action: GET_SEARCH_SUGGESTIONs, query: input });
        return response.response_message || [];
    } catch (error) {
        console.error("Failed to get search suggestions:", error);
        return [];
    }
}


/**
 * Highlights the suggestion item at the current focus index and scrolls it into view.
 * Wraps around when the focus index goes out of bounds.
 * @param {HTMLCollectionOf<Element>} items - The collection of suggestion item elements.
 * @returns {boolean|void} Returns false if no items are provided.
 */
function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (current_focus >= items.length) current_focus = 0;
    if (current_focus < 0) current_focus = items.length - 1;
    items[current_focus].classList.add('suggestion-active');
    items[current_focus].scrollIntoView({ block: 'nearest', behavior: 'smooth' });

}

/**
 * Removes the active highlight class from all suggestion items.
 * @param {HTMLCollectionOf<Element>} items - The collection of suggestion item elements.
 */
function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('suggestion-active');
    }
}

/**
 * Handles a click on a suggestion item. Navigates to the URL if the suggestion
 * type is NAVIGATION, otherwise triggers a Google search.
 * @param {HTMLElement} suggestion_element - The clicked suggestion element.
 */
function suggestionClickHandler(suggestion_element) {
    let suggestion_type = suggestion_element.getAttribute('data-tag');
    if (suggestion_type === 'NAVIGATION') {
        let suggestion_url = suggestion_element.getAttribute('data-url');
        open_url(suggestion_url);
    } else {
        got_for_google_search();
    }
}


/**
 * Expands the Google search bar and shrinks the YouTube search bar with animation.
 */
function hide_youtube_search_bar() {
    google_search_div_id_ele.classList.add("expend-anim");

    google_search_div_id_ele.style.width = "50%";
    document.getElementById("google-search-box-id").style.width = "100%";

    youtube_search_div_id_ele.classList.add("shrink-anim");
    youtube_search_div_id_ele.style.width = "min-content";
}

/**
 * Expands the YouTube search bar and shrinks the Google search bar with animation.
 */
function hide_google_search_bar() {
    youtube_search_div_id_ele.classList.add("expend-anim");

    youtube_search_div_id_ele.style.width = "50%";
    document.getElementById("youtube-search-box-id").style.width = "100%";

    google_search_div_id_ele.classList.add("shrink-anim");
    google_search_div_id_ele.style.width = "min-content";
}

/**
 * Resets both search bar containers to their default widths by removing
 * any expand or shrink animation classes.
 */
function reset_search_div() {
    youtube_search_div_id_ele.classList.remove('shrink-anim');
    youtube_search_div_id_ele.classList.remove('expend-anim');
    google_search_div_id_ele.style.width = "fit-content";

    google_search_div_id_ele.classList.remove('shrink-anim');
    google_search_div_id_ele.classList.remove('expend-anim');
    youtube_search_div_id_ele.style.width = "fit-content";
}
