console.log("I am script.js")

var date_time = undefined;
var current_hour = undefined;
var current_min = undefined;

function set_time() {
    date_time = new Date();
    current_hour = date_time.getHours();
    current_min = date_time.getMinutes();

    console.log("Current time is : " + current_hour + " : " + current_min);

    document.querySelector(".current_time").innerText = "Current time is : " + date_time.toLocaleTimeString("en-US", { hour12: false });
}

function set_quote() {

    console.log("Setting quote..........")

    chrome.runtime.sendMessage({ action: "get_quote" }, (response) => {
        console.log("got quote from background")
        console.log(response)
        document.querySelector(".quote_p").innerHTML = response.response_message.quote
        document.querySelector(".quote_author_p").innerHTML = "-by " + response.response_message.author

    })
}

async function refresh_quote() {

    console.log("this is refresh quote.....")
    let curr_tab = await getCurrentTab();

    if (curr_tab != undefined && curr_tab.url == "chrome://newtab/") {

        chrome.runtime.sendMessage({ action: "refresh_quote" }), (response) => {
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
setInterval(set_time, 1000)
set_quote()
setInterval(refresh_quote, 600000)

// function youtube_search(){
//     var yt_search_field = document.getElementById("youtube-search-input").value
//     console.log(yt_search_field)
// }

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

const youtube_search_link = "https://www.youtube.com/results?search_query=";
const google_search_link = "https://www.google.com/search?q=";

function got_for_google_search(){
    got_for_search("google-search-input",google_search_link)
}

function got_for_youtube_search(){
    got_for_search("youtube-search-input",youtube_search_link)
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
