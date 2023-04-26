import get_motivation_quote from "./api_call.js";

console.log("I am background js")

function fun() {
  chrome.browserAction.onClicked.addListener(function (activeTab) {
    var newURL = "http://stackoverflow.com/";
    chrome.tabs.create({ url: newURL });
  });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({
      url: "wwww.google.com"
    });
  } else if (reason === 'update') {
    console.log("updated..")
  }

  manage_quote_deails();

});

chrome.tabs.onCreated.addListener(function (tab) {
  console.log(tab);
  manage_quote_deails();
})


chrome.runtime.onInstalled.addListener(details => {
  console.log.apply("Install reason : " + details.reason);
  manage_quote_deails();
})

chrome.runtime.onMessage.addListener(async (param, sender, sendResponse) => {

  console.log("chrome onMessage listner");
  console.log("recived listner message : " + param.action);


  if (param.action == "new_quote") {
    console.log("getting new quote");
    sendResponse({ response_messgae: await fetch_new_quote() })

  } else if (param.action == "refresh_quote") {
    manage_quote_deails();
  }

  return true;

})

var date_time = undefined;
var current_hour = undefined;
var current_min = undefined;

function set_time() {
  date_time = new Date();
  current_hour = date_time.getHours();
  current_min = date_time.getMinutes();

  console.log("Background.js Current time is : " + current_hour + " : " + current_min);

}


async function manage_quote_deails() {

  console.log("Fetching quote....")

  chrome.storage.local.get(["last_quote_details"], (result) => {

    let last_quote_details_from_cache = result.last_quote_details;

    var fetched_quote = undefined;

    if (last_quote_details_from_cache == undefined) {

      console.log("Fetching new quote....")

      fetched_quote = fetch_new_quote();

    } else {
      
      console.log("got stored quote....")
      
      set_time();
      let last_quote_hour = last_quote_details_from_cache.hours;
      let last_quote_minute = last_quote_details_from_cache.minutes;
      let last_quote_quote = last_quote_details_from_cache.quote;
      let last_quote_author = last_quote_details_from_cache.author;

      console.log("last quote time : " + last_quote_hour + " : " + last_quote_minute);
      console.log("last quote : " + last_quote_quote + " \n by " + last_quote_author);

      if (current_hour - last_quote_hour > 0 || current_min - last_quote_minute > 10) {
        console.log("Previous code expire getting new quote....")
        fetched_quote = fetch_new_quote();
      }
    }
  })

}

async function fetch_new_quote() {

  console.log("calling api function....")
  var fetched_quote = await get_motivation_quote();
  console.log("api call function return : " + fetched_quote)
  store_last_quote_deails(fetched_quote)
  return fetched_quote;
}


async function fetch_quote_from_loacl() {

  chrome.storage.local.get(["last_quote_details"], (result) => {
    console.log('Retrieved quote details: ' + result.last_quote_details);
    console.log(result.last_quote_details.quote)
    console.log(result.last_quote_details.author)
    return result.last_quote_details
  });
}


function store_last_quote_deails(recived_quote) {

  set_time();

  console.log("last quote time " + current_hour + " : " + current_min);
  console.log("Recived quote : " + recived_quote["quote"]);
  console.log("Recived quote author : " + recived_quote["author"]);

  let last_quote_details = { hours: current_hour, minutes: current_min, quote: recived_quote["quote"], author: recived_quote["author"] }

  console.log("storing quote details : \n \t" + last_quote_details)

  chrome.storage.local.set({ "last_quote_details": last_quote_details }, () => {
    if (chrome.runtime.lastError)
      console.log('Error setting');

    console.log('Stored details: \n \t author: ' + last_quote_details.author);
  });
}


