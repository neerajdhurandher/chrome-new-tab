import { GET_SEARCH_SUGGESTIONs, GOOGLE_SEARCH_LINK, YOUTUBE_SEARCH_LINK } from "./constants.js"

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
 * Triggers a YouTube search using the value from the YouTube search input field.
 */
function got_for_youtube_search() {
    got_for_search("youtube-search-input", YOUTUBE_SEARCH_LINK)
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
            // using chrome search api
            chrome_search_api(search_query);
        } else {
            window.open(main_link + search_query, "_parent");
        }
        document.getElementById(input_element_id).value = "";
        current_focus = -1;
    }
}

/**
 * Executes a search in the current tab using the Chrome Search API.
 * @param {string} search_query - The search query string.
 */
function chrome_search_api(search_query) {
    chrome.search.query({
        text: search_query,
        disposition: "CURRENT_TAB"
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
    window.open(url, "_parent");
    google_search_input_ele.value = "";
    youtube_search_input_ele.value = "";
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
