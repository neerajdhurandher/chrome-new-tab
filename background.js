import { get_motivation_quote, get_location_weather_form_api } from "./api_call.js";

console.log("I am background js")

function fun() {
  chrome.browserAction.onClicked.addListener(function (activeTab) {
    var newURL = "http://stackoverflow.com/";
    chrome.tabs.create({ url: newURL });
  });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log("Install reason : " + reason);
  if (reason === 'install') {
    chrome.tabs.create({
      url: "wwww.google.com"
    });
  } else if (reason === 'update') {
    console.log("updated....")
  }

  manage_quote_deails();
  get_greeting();

});

chrome.tabs.onCreated.addListener(function (tab) {
  console.log("new tab created....")
  console.log(tab);
  if (tab.pendingUrl == "chrome://newtab/") {
    manage_quote_deails();
  }
  get_greeting();
})

// chrome.tabs.onActivated.addListener(function(tab) {
//     console.log(tab)
// })

chrome.runtime.onMessage.addListener(async (param, sender, sendResponse) => {

  console.log("chrome onMessage listner");
  console.log("recived listner message : " + param.action);

  if (param.action == "get_quote") {
    console.log("getting stored quote");
    sendResponse({ response_message: last_quote_details_from_cache })

  } else if (param.action == "refresh_quote") {
    manage_quote_deails();

  } else if (param.action == "get_day_date") {
    sendResponse({ response_message: current_day_date_obj })

  } else if (param.action == "get_greeting") {
    sendResponse({ response_message: get_greeting() })

  } else if (param.action == "set_location_weather") {
    location = param.msg;
    location_weather = await get_location_weather();
    console.log("returning location weather data")
    console.log(location_weather)
    sendResponse({ response_message: location_weather })

  } else if (param.action == "get_location_weather") {
    console.log("returning weather data from in response of get")
    console.log(location_weather)
    sendResponse({ response_message: location_weather })
  }


  return true;

})

var date_time = undefined,
  current_hour = undefined,
  current_min = undefined,
  current_day_date_obj = undefined;

var last_quote_details_from_cache = undefined,
  last_quote_hour = undefined,
  last_quote_minute = undefined,
  last_quote_quote = undefined,
  last_quote_author = undefined;

var location = undefined,
  location_weather = undefined;

function set_time() {
  date_time = new Date();
  current_hour = date_time.getHours();
  current_min = date_time.getMinutes();
  get_day_date();
  console.log("Background.js Current time is : " + current_hour + " : " + current_min);
}

async function manage_quote_deails() {

  set_time();
  console.log("Fetching quote....")

  if (last_quote_hour == undefined) {

    chrome.storage.local.get(["last_quote_details"], (result) => {
      last_quote_details_from_cache = result.last_quote_details;
      console.log(last_quote_details_from_cache)
      if (last_quote_details_from_cache == undefined) {
        console.log("Fetching new quote....")
        fetch_new_quote();
      } else {
        set_quote_global_values(last_quote_details_from_cache)
        console.log("got stored quote....")
        console.log("last quote time : " + last_quote_hour + " : " + last_quote_minute);
        console.log("last quote : " + last_quote_quote + " \n by " + last_quote_author);
      }
    })

  } else if (current_hour - last_quote_hour > 0 || current_min - last_quote_minute > 10) {
    console.log("Previous code expire getting new quote....")
    fetch_new_quote();
  }

}

async function fetch_new_quote() {

  console.log("calling api function....")
  // let fetched_quote = await get_motivation_quote();
  let fetched_quote = undefined;
  console.log("api call function return : " + fetched_quote)
  if (fetched_quote == undefined)
    set_default_quote()
  else
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

  let last_quote_details_obj = { hours: current_hour, minutes: current_min, quote: recived_quote["quote"], author: recived_quote["author"] }
  console.log("storing quote details : \n \t" + last_quote_details_obj)

  chrome.storage.local.set({ "last_quote_details": last_quote_details_obj }, () => {
    if (chrome.runtime.lastError)
      console.log('Error setting');
    else {
      console.log('Stored details: \n \t author: ' + last_quote_details_obj.author);
      set_quote_global_values(last_quote_details_obj);
    }
  });
}

function set_default_quote() {
  set_time();
  last_quote_details_from_cache = {quote :"", author:"", hours:"", minutes:""}
  last_quote_details_from_cache.quote = "Today is your opportunity to build the tomorrow you want.";
  last_quote_details_from_cache.author = "Ken Poirot";
  last_quote_details_from_cache.hours = current_hour;
  last_quote_details_from_cache.minutes = current_min;

  set_quote_global_values(last_quote_details_from_cache);
}

function set_quote_global_values(quote_obj) {
  last_quote_hour = quote_obj.hours;
  last_quote_minute = quote_obj.minutes;
  last_quote_quote = quote_obj.quote;
  last_quote_author = quote_obj.author;
}

function get_day_date() {

  let dayName = date_time.getDay(),
    dayNum = date_time.getDate(),
    month = date_time.getMonth(),
    year = date_time.getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  current_day_date_obj = [dayWeek[dayName], dayNum, months[month], year];
  return current_day_date_obj;
}

function get_greeting() {
  set_time()
  let greeting = undefined;
  if (current_hour < 12)
    greeting = "morning";
  else if (current_hour >= 12 && current_hour <= 16)
    greeting = "afternoon";
  else
    greeting = "evening";

  return greeting
}

async function get_location_weather() {
  if (location != undefined) {
    location_weather = await get_location_weather_form_api(location);
    return location_weather;
  }
}


