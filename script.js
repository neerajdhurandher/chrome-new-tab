import { GET_DAY_DATE, GET_GREETING, REFRESH_QUOTE, REFRESH_QUOTE_INTERVAL, SET_LOCATION_WEATHER, REFRESH_WEATHER_INTERVAL, RETRIEVE_DATA, USER_NAME, QUOTE_DATA, DEFAULT_QUOTE, DEFAULT_QUOTE_AUTHOR, QUOTE, AUTHOR, LOCATION_WEATHER_DATA, STORE_DATA, BOOKMARK_LIST, BOOKMARK_ID, BOOKMARK_NAME, BOOKMARK_URL, BOOKMARK_LOGO, SAVED_TEXT, ERROR_TEXT, NULL_TEXT, INVALID_URL, INVALID_BOOKMARK_NAME } from "./constants.js"
import {RED_COLOR, GREEN_COLOR } from "./constants.js"
import { GOOGLE_SEARCH_LINK, YOUTUBE_SEARCH_LINK } from "./constants.js"
console.log("I am script.js")
import { extract_logo, get_domain_first_letter, validate_url } from "./contentScript.js"

var date_time = undefined;
var current_hour = undefined;
var current_min = undefined;

function set_time() {
    date_time = new Date();
    current_hour = date_time.getHours();
    current_min = date_time.getMinutes();

    console.log("Current time is : " + current_hour + " : " + current_min);

    let time = date_time.toLocaleTimeString("en-US", { hour12: true })

    if (current_hour < 10 || (current_hour > 12 && current_hour < 22)) {
        time = "0" + time
    }
    let h = time.slice(0, 2)
    let m = time.slice(3, 5)
    let am_pm = time.slice(9, 11)

    document.querySelector(".current_time").innerText = h + ":" + m + " " + am_pm;
}

function updateDate() {
    const IDCollection = ["day", "daynum", "month", "year"];
    chrome.runtime.sendMessage({ action: GET_DAY_DATE }, (response) => {
        for (let i = 0; i < IDCollection.length; i++) {
            document.getElementById(IDCollection[i]).firstChild.nodeValue = response.response_message[i];
        }
    })
}

function set_quote() {

    console.log("Setting quote..........")

    chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: QUOTE_DATA, name: "Getting quote" }, (response) => {
        console.log("got quote from background")
        console.log(response)
        let quote = undefined;
        let author = undefined;

        if (response.response_message.status == true) {
            quote = response.response_message.data.quote_data.quote_details[QUOTE]
            author = response.response_message.data.quote_data.quote_details[AUTHOR]
        } else {
            quote = DEFAULT_QUOTE
            author = DEFAULT_QUOTE_AUTHOR
        }
        document.querySelector(".quote_p").innerHTML = quote
        document.querySelector(".quote_author_p").innerHTML = "-by " + author

    })
}

function set_greeting() {
    chrome.runtime.sendMessage({ action: GET_GREETING }, (response) => {
        console.log("got greeting from background")
        console.log(response)
        document.querySelector(".greeting-h1").innerHTML = "Good " + response.response_message;
        set_user_name()
    })
}

function set_user_name() {
    chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: USER_NAME, name: "Retriving user name for greeting" }, (response) => {
        if (response.response_message.data[USER_NAME] != undefined) {
            document.querySelector(".greeting-h1").innerHTML = document.querySelector(".greeting-h1").innerHTML + ", "
                + response.response_message.data[USER_NAME] + "."
        }

    })
}

async function refresh_quote() {

    console.log("this is refresh quote.....")
    let curr_tab = await getCurrentTab();

    if (curr_tab != undefined && curr_tab.url == "chrome://newtab/") {

        chrome.runtime.sendMessage({ action: REFRESH_QUOTE }), (response) => {
            console.log("quote refresh")
        }
        setTimeout(() => {
            console.log("this is timeout function")
            set_quote()
        }, 3000)
    }
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

set_time()
updateDate()
setInterval(set_time, 1000)
set_quote()
setInterval(refresh_quote, REFRESH_QUOTE_INTERVAL)
set_greeting()


document.getElementById("youtube-search-btn").addEventListener('click', () => {
    console.log("youtube search button clicked");
    got_for_youtube_search();
})

document.getElementById("google-search-btn").addEventListener('click', () => {
    console.log("google  button clicked");
    got_for_google_search();
})

document.getElementById("youtube-search-input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        console.log("youtube enter key pressed")
        got_for_youtube_search();
    }
});

document.getElementById("google-search-input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        console.log("google enter key pressed")
        got_for_google_search();
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

function got_for_google_search() {
    got_for_search("google-search-input", GOOGLE_SEARCH_LINK)
}

function got_for_youtube_search() {
    got_for_search("youtube-search-input", YOUTUBE_SEARCH_LINK)
}

function got_for_search(input_element_id, main_link) {

    var search_quey = document.getElementById(input_element_id).value;
    console.log(search_quey)

    if (search_quey == "") {
        console.log("empty search query")
    } else {
        search_quey = search_quey.replaceAll(" ", "+");
        window.open(main_link + search_quey, "_parent");
        document.getElementById(input_element_id).value = "";
    }

}

var input_element = document.getElementById("city-input");
var loading_msg_element = document.getElementById("loading_msg");

document.getElementById("city-input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        console.log("city enter key pressed")
        var location_value = input_element.value;
        console.log("location val " + location_value)

        input_element.style.display = "none";
        loading_msg_element.innerHTML = "getting your location weather data.....";
        loading_msg_element.style.display = "block";
        fetch_city_weather_data(location_value)
    }
});

function fetch_city_weather_data(city) {
    chrome.runtime.sendMessage({ action: SET_LOCATION_WEATHER, location: city }, async (response) => {
        console.log("got weather data response from background")
        console.log(response)
    })

    setTimeout(() => {
        console.log("this is timeout function for featching weather data")
        get_city_weather_data();
    }, 4000)
}

function get_city_weather_data() {
    console.log("send runtime msg for get weather")
    chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: LOCATION_WEATHER_DATA }, (response) => {
        console.log("got weather data from background")
        set_city_weather_data(response)
    })
}

function set_city_weather_data(response) {
    console.log(response)
    if (response.response_message.status == true) {
        console.log("setting weather detail ")
        loading_msg_element.style.display = "none";
        document.querySelector(".weather-deatils-div").style.display = "grid";
        document.querySelector(".location-name").innerHTML = response.response_message.data.location_weather_data.location.name
        document.querySelector(".weather-value").innerHTML = response.response_message.data.location_weather_data.current.temp_c + "°C"
        document.querySelector(".weather-icon").src = "https:" + response.response_message.data.location_weather_data.current.condition.icon + ""
        let last = new Date(response.response_message.data.location_weather_data.current.last_updated)
        let now = new Date()

        if (now - last > REFRESH_WEATHER_INTERVAL) {
            fetch_city_weather_data(response.response_message.data.location_weather_data.location.name)
        }
    } else {
        console.log("no weather data")
        loading_msg_element.innerHTML = "Sorry, couldn't load weather data"
        setTimeout(() => {
            input_element.style.display = "block";
            input_element.value = "";
            loading_msg_element.style.display = "none";
        }, 2000)
    }
}

setTimeout(() => {
    get_city_weather_data();
}, 500)


var google_search_div_id_ele = document.getElementById("google-search-div-id");
var youtube_search_div_id_ele = document.getElementById("youtube-search-div-id");

function hide_youtube_search_bar() {
    google_search_div_id_ele.classList.add("expend-anim");

    google_search_div_id_ele.style.width = "50%";
    document.getElementById("google-search-box-id").style.width = "100%";

    youtube_search_div_id_ele.classList.add("shrink-anim");
    youtube_search_div_id_ele.style.width = "min-content";
}

function hide_google_search_bar() {
    youtube_search_div_id_ele.classList.add("expend-anim");

    youtube_search_div_id_ele.style.width = "50%";
    document.getElementById("youtube-search-box-id").style.width = "100%";

    google_search_div_id_ele.classList.add("shrink-anim");
    google_search_div_id_ele.style.width = "min-content";
}

function reset_search_div() {
    youtube_search_div_id_ele.classList.remove('shrink-anim');
    youtube_search_div_id_ele.classList.remove('expend-anim');
    google_search_div_id_ele.style.width = "fit-content";

    google_search_div_id_ele.classList.remove('shrink-anim');
    google_search_div_id_ele.classList.remove('expend-anim');
    youtube_search_div_id_ele.style.width = "fit-content";
}

let bookmark_popup_element = document.getElementById("bookmark-popup")
let add_bookmark_btn = document.querySelector(".add-new-bm")
let bm_save_btn = document.getElementById("save-btn")
let loader_element = document.getElementById("loader")
let msg_element = document.getElementById("msg_text")
let bookmark_name_element = document.getElementById("bm-name")
let bookmark_url_element = document.getElementById("bm-url")

add_bookmark_btn.addEventListener("click", () => {
    bookmark_popup_element.style.display = "block"
    bookmark_popup_element.style.visibility = "visible"
    bookmark_popup_element.style.opacity = "1"

})

document.querySelector(".close").addEventListener("click", () => {
    close_popup()

})


bm_save_btn.addEventListener("click", () => {

    if (validate_input_data() == true) {
        save_bookmark()
    }
});

function validate_input_data() {

    let valid_bookmark_name = true
    let valid_url = validate_url(bookmark_url_element.value)
    if (bookmark_name_element.value.length < 1) {
        valid_bookmark_name = false
        show_msg(false, INVALID_BOOKMARK_NAME)
    } else if (valid_url == false) {
        show_msg(false, INVALID_URL)
    }

    if (valid_bookmark_name == true && valid_url == true) {
        return true
    } else {
        return false
    }
}

function show_msg(status, msg) {
    if (status == true) {
        msg_element.style.color = GREEN_COLOR;
    } else {
        msg_element.style.color = RED_COLOR;
    }
    msg_element.innerHTML = msg
    msg_element.style.display = "block"
    msg_element.style.visibility = "visible"

    setTimeout(() => {
        msg_element.style.display = "none"
    }, 2000)

}

function save_bookmark() {
    let bookmark_name = bookmark_name_element.value
    let bookmark_url = bookmark_url_element.value

    bm_save_btn.style.display = "none"
    msg_element.style.display = "block"
    msg_element.style.visibility = "hidden"
    loader_element.style.display = "block"

    let domain_first_letter = get_domain_first_letter(bookmark_url)
    if (domain_first_letter == " ") {
        domain_first_letter = bookmark_name.charAt(0)
    }

    console.log("fetching logo.....")

    chrome.runtime.sendMessage({ action: "get_url_logo", url: bookmark_url, name: bookmark_name }, (response) => {

        if (response) {
            extract_logo(bookmark_url, response).then((logo) => {
                store_bookmark_data(bookmark_name, bookmark_url, logo, domain_first_letter)
            })

        } else {
            store_bookmark_data(bookmark_name, bookmark_url, NULL_TEXT, domain_first_letter)
        }

    });
}

function store_bookmark_data(bm_name, bm_url, bm_logo, bm_letter) {

    let bm_obj = {
        "bookmark_id": date_time.toISOString(),
        "bookmark_name": bm_name,
        "bookmark_url": bm_url,
        "bookmark_logo": bm_logo,
        "bookmark_letter": bm_letter
    }

    let bm_list = [];

    chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: BOOKMARK_LIST }, (response) => {

        console.log(response)

        if (response.response_message.status == true) {
            bm_list = response.response_message.data.bookmark_list
        }

        bm_list.push(bm_obj)

        chrome.runtime.sendMessage({ action: STORE_DATA, key: BOOKMARK_LIST, value: bm_list }, (response) => {
            loader_element.style.display = "none"
            if (response.response_message.status == true) {
                show_msg(true, SAVED_TEXT)
            } else {
                show_msg(false, ERROR_TEXT)
            }
        })

        setTimeout(() => {
            close_popup()
        }, 2000)

    })

}

function close_popup() {
    bookmark_name_element.value = ""
    bookmark_url_element.value = ""
    bookmark_popup_element.style.display = "none"
    bookmark_popup_element.style.visibility = "hidden"
    bookmark_popup_element.style.opacity = "0"
    loader_element.style.display = "none"
    msg_element.style.display = "none"
    bm_save_btn.style.display = "block"

    setTimeout(() => {
        set_bookmark()
    }, 2000)
}

function set_bookmark() {
    chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: BOOKMARK_LIST }, (response) => {

        console.log("Got bookmark data from local")
        console.log(response)

    });
}
