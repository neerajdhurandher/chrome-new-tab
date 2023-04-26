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

    chrome.storage.local.get(["last_quote_details"]).then((result) => {
        if (result == undefined) {
            result.last_quote_details.quote = "Today is your opportunity to build the tomorrow you want."
            result.last_quote_details.author = "Ken Poirot"
        }
        document.querySelector(".quote_p").innerHTML = result.last_quote_details.quote
        document.querySelector(".quote_author_p").innerHTML = "-by " + result.last_quote_details.author
    })


}

function refresh_quote() {
    console.log("this is refresh quote.....")
    chrome.runtime.sendMessage({ action: "refresh_quote" }), (response) => {
        console.log("quote refresh")
    }
    setTimeout(() => {
        console.log("this is timeout function")
        set_quote()
    }, 3000)

    console.log("this is outside")

}
set_time()
refresh_quote()
setInterval(set_time, 1000)
setInterval(refresh_quote, 600000)

