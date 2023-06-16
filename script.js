import{GET_DAY_DATE,GET_QUOTE,GET_GREETING,REFRESH_QUOTE,REFRESH_QUOTE_INTERVAL,SET_LOCATION_WEATHER,GET_LOCATION_WEATHER} from "./constants.js"
import{GOOGLE_SEARCH_LINK,YOUTUBE_SEARCH_LINK} from "./constants.js"
console.log("I am script.js")

var date_time = undefined;
var current_hour = undefined;
var current_min = undefined;

function set_time() {
    date_time = new Date();
    current_hour = date_time.getHours();
    current_min = date_time.getMinutes();

    console.log("Current time is : " + current_hour + " : " + current_min);

    document.querySelector(".current_time").innerText = date_time.toLocaleTimeString("en-US", { hour12: true });
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

    chrome.runtime.sendMessage({ action: GET_QUOTE }, (response) => {
        console.log("got quote from background")
        console.log(response)
        document.querySelector(".quote_p").innerHTML = response.response_message.quote
        document.querySelector(".quote_author_p").innerHTML = "-by " + response.response_message.author

    })
}

function set_greeting() {
    chrome.runtime.sendMessage({ action: GET_GREETING }, (response) => {
        console.log("got greeting from background")
        console.log(response)
        document.querySelector(".greeting-h1").innerHTML = "Good " + response.response_message;
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
        var city_value = input_element.value;
        console.log("location val " + city_value)

        input_element.style.display = "none";
        loading_msg_element.innerHTML = "getting your location weather data.....";
        loading_msg_element.style.display = "block";

        chrome.runtime.sendMessage({ action: SET_LOCATION_WEATHER, msg: city_value }, async (response) => {
            console.log("got weather data response from background")
            console.log(response)
        })

        setTimeout(() => {
            console.log("this is timeout function for featching weather data")
            get_city_weather_data();
        }, 4000)
    }
});

function get_city_weather_data() {
    console.log("send runtime msg for get weather")
    chrome.runtime.sendMessage({ action: GET_LOCATION_WEATHER }, (response) => {
        console.log("got weather data from background")
        // if (response.response_message != undefined)
        set_city_weather_data(response)
    })
}

function set_city_weather_data(response) {
    console.log(response)
    if (response.response_message != undefined) {
        console.log("setting weather detail ")
        loading_msg_element.style.display = "none";
        document.querySelector(".weather-deatils-div").style.display = "grid";
        document.querySelector(".location-name").innerHTML = response.response_message.location.name
        document.querySelector(".weather-value").innerHTML = response.response_message.current.temp_c + "°C"
        document.querySelector(".weather-type").innerHTML = response.response_message.current.condition.text
        document.querySelector(".weather-icon").src = "https:" + response.response_message.current.condition.icon + ""
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
}, 2000)


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

function reset_search_div(){
    youtube_search_div_id_ele.classList.remove('shrink-anim');
    youtube_search_div_id_ele.classList.remove('expend-anim');
    google_search_div_id_ele.style.width = "fit-content";
    
    google_search_div_id_ele.classList.remove('shrink-anim');
    google_search_div_id_ele.classList.remove('expend-anim');
    youtube_search_div_id_ele.style.width = "fit-content";
}
