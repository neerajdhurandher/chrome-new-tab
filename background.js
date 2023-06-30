import { get_motivation_quote, get_location_weather_form_api, fetch_web_url_data } from "./api_call.js";
import { GET_DAY_DATE, GET_GREETING, REFRESH_QUOTE, SET_LOCATION_WEATHER, STORE_DATA, RETRIEVE_DATA, QUOTE_DATA, REFRESH_QUOTE_INTERVAL, QUOTE, AUTHOR, LOCATION_WEATHER_DATA } from "./constants.js"

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
      url: "welcome.html"
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

  if (param.action == REFRESH_QUOTE) {
    manage_quote_deails();

  } else if (param.action == GET_DAY_DATE) {
    sendResponse({ response_message: get_day_date() })

  } else if (param.action == GET_GREETING) {
    sendResponse({ response_message: get_greeting() })

  } else if (param.action == SET_LOCATION_WEATHER) {
    let location_weather = await get_location_weather_from_server(param.location);
    console.log("returning location weather data")
    console.log(location_weather)
    sendResponse({ response_message: location_weather })

  } else if (param.action == "get_url_logo") {
    fetch_web_url_data(param.url).then((data) => {
      sendResponse({ response_message: data })
    });
  }


  return true;

})

// chrome storage actions
chrome.runtime.onMessage.addListener((param, sender, sendResponse) => {
  if (param.action == STORE_DATA) {
    let key_val = param.key
    let value_val = param.value
    let store = {}
    store[key_val] = value_val

    chrome.storage.local.set(store).then(() => {
      console.log("Value is set in local for " + param.name);
      sendResponse({ response_message: { status: true, data: { key: key_val, value: value_val } } })
    });

  } else if (param.action == RETRIEVE_DATA) {
    var key_val = param.key
    console.log("Retrieve data for " + param.name + " with key " + param.key)
    chrome.storage.local.get([key_val]).then((result) => {
      console.log(result)
      if (result[key_val] == undefined) {
        sendResponse({ response_message: { status: false, error: "No data assosiate with key: " + key_val } })
      } else {
        sendResponse({ response_message: { status: true, data: result } })
      }

    });
  }
  return true;
})

var last_quote_time = undefined;

function set_time() {
  let time = new Date();
  get_day_date();
  console.log("Background.js Current time is : " + time.getHours() + " : " + time.getMinutes());
  return time
}

async function manage_quote_deails() {

  let time = set_time();
  console.log("Fetching quote....")

  if (last_quote_time == undefined || (time - last_quote_time > REFRESH_QUOTE_INTERVAL)) {
    fetch_new_quote();
  }

}

async function fetch_new_quote() {

  console.log("calling api function....")
  // let fetched_quote = await get_motivation_quote();
  let fetched_quote = undefined;
  console.log("api call function return : " + fetched_quote)
  if (fetched_quote == undefined)
    console.log("Unable to fetch quote data from API.")
  else
    store_last_quote_details(fetched_quote)

  return fetched_quote;
}

function store_last_quote_details(recived_quote) {

  let time = set_time();

  console.log("last quote time " + time);
  console.log("Recived quote : " + recived_quote[QUOTE]);
  console.log("Recived quote author : " + recived_quote[AUTHOR]);

  let last_quote_details_obj = { store_time: time, quote_details: { quote: recived_quote[QUOTE], author: recived_quote[AUTHOR] } }

  console.log("storing quote details : ");
  console.log(last_quote_details_obj)
  let store = {};
  store[QUOTE_DATA] = last_quote_details_obj
  chrome.storage.local.set(store).then(() => {
    if (chrome.runtime.lastError)
      console.log('Chrome runtime error');
    else {
      console.log('Stored quote details:');
      console.log(last_quote_details_obj)
      last_quote_time = time;
    }
  });
}

function get_day_date() {

  let time = new Date(),
    dayName = time.getDay(),
    dayNum = time.getDate(),
    month = time.getMonth(),
    year = time.getFullYear();

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

  let current_day_date_obj = [dayWeek[dayName], dayNum, months[month], year];
  return current_day_date_obj;
}

function get_greeting() {
  let time = set_time()
  let greeting = undefined;
  if (time.getHours() < 12)
    greeting = "morning";
  else if (time.getHours() >= 12 && time.getHours() <= 16)
    greeting = "afternoon";
  else
    greeting = "evening";

  return greeting
}

async function get_location_weather_from_server(location) {
  if (location != undefined) {
    let location_weather = await get_location_weather_form_api(location);
    if (location_weather != undefined) {
      let store = {};
      store[LOCATION_WEATHER_DATA] = location_weather
      chrome.storage.local.set(store).then(() => { console.log(location + " weather data saved.") })
    } else {
      console.log(location + " weather data not available.")
    }
    return location_weather;
  }
}

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const responseHeaders = details.responseHeaders;
    const accessControlHeaderIndex = responseHeaders.findIndex((header) => header.name.toLowerCase() === 'access-control-allow-origin');

    if (accessControlHeaderIndex !== -1) {
      responseHeaders[accessControlHeaderIndex].value = '*';
    } else {
      responseHeaders.push({ name: 'Access-Control-Allow-Origin', value: '*' });
    }

    return { responseHeaders };
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders', 'extraHeaders']
);