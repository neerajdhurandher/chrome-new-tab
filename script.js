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

