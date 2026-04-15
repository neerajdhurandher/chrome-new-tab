import { FETCH_LOCATION_LIST, FETCH_LOCATION_WEATHER, RETRIEVE_DATA, LOCATION_WEATHER_DATA, REFRESH_WEATHER_INTERVAL, WEATHER_LOADING_MESSAGE, WEATHER_LOADING_ERROR_MESSAGE, LOCATION_INPUT_DEBOUNCE_INTERVAL, INCORRECT_WEATHER_DATA_MESSAGE } from "./constants.js";
import { callChromeStorageApi } from "./chrome-storage-api.js";

let weather_input_div = document.querySelector(".weather-input-div");
let city_input_element = document.getElementById("city-input");
let loading_msg_element = document.getElementById("loading_msg");
let weather_details_div = document.querySelector(".weather-details-div");
let city_drop_down = document.getElementById('cityDropdown');
let city_edit_icon = document.getElementById("city_edit_icon");
let weather_additional_info_icon = document.getElementById("weather_additional_info_icon");
let weather_additional_data_div = document.getElementById("weather_additional_data");
let weather_error_info_div = document.querySelector(".weather-error-info");
let weather_error_info_icon = document.getElementById("weather-error-info-icon");
let weather_additional_data_div_popup = false;
let location_weather_data_global = null;

let previousInputTime = 0;


// Close additional weather data popup when clicking anywhere on screen
document.addEventListener("click", (event) => {
    if (weather_additional_data_div_popup) {
        // Don't close if clicking on the info icon or inside the popup itself
        if (!weather_additional_info_icon.contains(event.target) &&
            !weather_additional_data_div.contains(event.target)) {
            weather_additional_data_div.style.display = "none";
            weather_additional_data_div_popup = false;
        }
    }
});

weather_details_div.addEventListener("mouseover", () => {
    city_edit_icon.style.visibility = "visible";
    weather_additional_info_icon.style.visibility = "visible";
})

weather_details_div.addEventListener("mouseout", () => {
    city_edit_icon.style.visibility = "hidden";
    weather_additional_info_icon.style.visibility = "hidden";
})

document.getElementById("city-input").addEventListener("keyup", async function (event) {
    var location_query = city_input_element.value;
    const currentInputTime = Date.now();
    if (location_query.length == 1)
        previousInputTime = currentInputTime;
    const timeInterval = currentInputTime - previousInputTime;

    // Check if the input is a letter, time interval is greater than given debounce time
    if (location_query.length > 2 || timeInterval > LOCATION_INPUT_DEBOUNCE_INTERVAL) {
        await fetch_cities(location_query);
        previousInputTime = 0;
    } else if (location_query.length <= 2) {
        city_drop_down.style.display = "none";
    } else {
        previousInputTime = currentInputTime;
    }

    // enter key pressed
    if (event.keyCode === 13) {
        event.preventDefault();
        city_input_element.style.display = "none";
        loading_msg_element.innerHTML = WEATHER_LOADING_MESSAGE;
        loading_msg_element.style.display = "block";
        fetch_location_weather_data(location_query);
    }
});

city_edit_icon.addEventListener("click", () => {
    weather_details_div.style.display = "none";
    weather_input_div.style.display = "block";
    city_input_element.style.display = "block";
})

weather_additional_info_icon.addEventListener("click", () => {
    display_weather_Additional_info(location_weather_data_global);
});


/**
 * Fetches a list of cities matching the query from the background script and displays them in a dropdown.
 * @param {string} query - The location query string entered by the user
 */
const fetch_cities = async (query) => {
    if (query.length <= 2)
        return;

    try {
        let fetch_location_list_promise = await callChromeStorageApi({ action: FETCH_LOCATION_LIST, location_query: query });
        const location_list = fetch_location_list_promise.response_message;

        if (!location_list || location_list.length <= 0) {
            city_drop_down.style.display = "none";
            return;
        }

        let location_list_interval = undefined;
        location_list_interval = setInterval(() => {
            if (location_list != undefined) {
                clearInterval(location_list_interval);
                show_location_drop_down(location_list);
            }
        }, 200);
    } catch (error) {
        console.error("Failed to fetch location list: ", error);
        weather_loading_error_display();
    }
}

/**
 * Analyzes the region name to create a shortened version.
 * Takes the first word and appends ".." if the region name is too long.
 * @param {string} region - The full region name
 * @returns {string} The analyzed (shortened) region name
 */

function analyze_region_name(region) {
    let result = region[0];
    let add = false;
    Array.from(region).forEach(element => {
        if (add) {
            result += (" " + element);
            add = false;
        }
        if (element == " ")
            add = true;
    });

    if (result.length == 1) {
        result = region.substring(0, 15);
        result += "..";
    }
    return result;
}


/**
 * Formats the location display name based on given rules to ensure it does not exceed a specified length.
 * @param {string} name - The name of the city
 * @param {string} region - The region name
 * @param {string} analyzed_region - The analyzed region name (shortened version)
 * @param {string} country - The country name
 * @returns {string} The formatted location display name
 */

function formate_location_display_name(name, region, analyzed_region, country) {
    // Maximum length for the location display name
    const MAX_LENGTH = 30;

    let location_display_name = name + ", " + region;
    let total_length = location_display_name.length;
    if (total_length > MAX_LENGTH) {
        location_display_name = name + ", " + analyzed_region;
        total_length = location_display_name.length;
        if (total_length > MAX_LENGTH) {
            let remaining_length = MAX_LENGTH - (name.length + 2 + analyzed_region.length + 2);
            if (remaining_length > 0) {
                let truncated_country = country.substring(0, remaining_length);
                location_display_name += ", " + truncated_country;
            }
        }
    }
    return location_display_name;
}

/** Displays a dropdown list of cities for the user to select from.
 * @param {Array} cities - Array of city objects containing name, region, and country
 */
const show_location_drop_down = (cities) => {
    if (!cities || cities.length <= 0) {
        city_drop_down.innerHTML = '';
        city_drop_down.style.display = 'none';
    } else {
        city_drop_down.innerHTML = '';
        for (var i = 0; i < cities.length; i++) {
            const city = cities[i];
            let region = analyze_region_name(city.region)
            let location_display_name = formate_location_display_name(city.name, city.region, region, city.country);
            const option = document.createElement('a');
            option.textContent = location_display_name;
            option.addEventListener('click', () => {
                city_input_element.value = location_display_name;
                city_drop_down.style.display = 'none';
                loading_msg_element.innerHTML = WEATHER_LOADING_MESSAGE;
                loading_msg_element.style.display = "block";
                fetch_location_weather_data(city.name)
            });
            city_drop_down.appendChild(option);
        }
        city_drop_down.style.display = 'block';
    }
};


/**
 * Fetches and sets the weather data for a given city.
 * If the data is outdated, it refreshes the weather data.
 * @param {string} city - The name of the city to fetch weather data for
 * @param {boolean} forceRefresh - Whether to force refresh the weather data
 */
async function fetch_location_weather_data(city, forceRefresh = false) {
    try {
        let response = await callChromeStorageApi({ action: FETCH_LOCATION_WEATHER, location: city });
        if (response.response_message.status) {
            set_city_weather_data(response);
            return;
        } else {
            weather_loading_error_display(forceRefresh);
        }
    } catch (error) {
        console.error("Failed to fetch location weather data:", error);
        weather_loading_error_display();
    }
}

/** Retrieves city weather data from Chrome local storage and updates the UI.
 */
export async function get_city_weather_data() {
    try {
        const response = await callChromeStorageApi({ action: RETRIEVE_DATA, key: LOCATION_WEATHER_DATA });
        if (response.response_message.status) {
            set_city_weather_data(response);
        }else {
            weather_loading_error_display();
        }
    } catch (error) {
        console.error("Failed to get city weather data:", error);
        weather_loading_error_display();
    }
}

/** Sets the city weather data in the UI based on the response from storage.
 * @param {object} response - The response object containing weather data and status
 */
function set_city_weather_data(response) {
    if (response.response_message.status == false) {
        weather_loading_error_display();
    }

    let location_weather_data = response.response_message.data.location_weather_data.weather_data;
    location_weather_data_global = location_weather_data;

    weather_input_div.style.display = "none";
    loading_msg_element.style.display = "none";
    city_input_element.value = "";

    weather_details_div.style.display = "flex";
    document.querySelector(".location-name").innerHTML = location_weather_data.location.name;
    document.querySelector(".weather-value").innerHTML = location_weather_data.current.temp_c + "°C";
    document.querySelector(".weather-icon").src = "https:" + location_weather_data.current.condition.icon;

    let stored_date = response.response_message.data.location_weather_data.last_updated;
    let last = new Date(stored_date);
    let now = new Date();

    if (now - last > REFRESH_WEATHER_INTERVAL) {
        fetch_location_weather_data(location_weather_data.location.name, true);
    }

    return;
}

/** Displays additional weather information in a popup.
 * @param {object} location_weather_data - The weather data object for the location
 */
function display_weather_Additional_info(location_weather_data) {

    if (!location_weather_data) {
        return;
    }

    if (weather_additional_data_div_popup) {
        weather_additional_data_div.style.display = "none";
        weather_additional_data_div_popup = false;
        return;
    }

    // Populate additional weather details
    const loc = location_weather_data.location || {};
    const cur = location_weather_data.current || {};
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText("wad-region", loc.region ?? "—");
    setText("wad-country", loc.country ?? "—");
    setText("wad-feels-like", cur.feelslike_c != null ? Math.round(cur.feelslike_c) + "°C" : "—");
    setText("wad-humidity", cur.humidity != null ? cur.humidity + "%" : "—");
    const wind = cur.wind_kph != null ? cur.wind_kph + " kph" : (cur.wind_mph != null ? cur.wind_mph + " mph" : "—");
    setText("wad-wind", wind);
    setText("wad-condition", (cur.condition && cur.condition.text) ? cur.condition.text : "—");

    weather_additional_data_div.style.display = "block";
    weather_additional_data_div_popup = true;

}

/** Displays an error message when weather data fails to load and resets the input field.
 */
function weather_loading_error_display(outdated = false) {
    if (outdated) {
        weather_error_info_icon.title = INCORRECT_WEATHER_DATA_MESSAGE;
        weather_error_info_div.style.display = "block";
        return;
    }

    loading_msg_element.innerHTML = WEATHER_LOADING_ERROR_MESSAGE;
    setTimeout(() => {
        city_input_element.style.display = "block";
        city_input_element.value = "";
        loading_msg_element.style.display = "none";
    }, 2000);
}
