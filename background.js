import { get_motivation_quote, get_location_weather_form_api, fetch_location_list, fetch_web_url_data, check_network_connection_status } from "./api_call.js";
import { GET_DAY_DATE, GET_GREETING, REFRESH_QUOTE, FETCH_LOCATION_WEATHER, FETCH_LOCATION_LIST, STORE_DATA, RETRIEVE_DATA, QUOTE_DATA, REFRESH_QUOTE_INTERVAL, QUOTE, AUTHOR, LOCATION_WEATHER_DATA, NETWORK_STATUS, NETWORK_CONNECTION_REFRESH_INTERVAL } from "./constants.js"

function fun() {
  chrome.browserAction.onClicked.addListener(function (activeTab) {
    var newURL = "http://neerajdhurandher.me/";
    chrome.tabs.create({ url: newURL });
  });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({
      url: "welcome.html"
    });
  } else if (reason === 'update') {
    console.log("Extension updated....")
  }

  manage_quote_details();
  get_greeting();

});

chrome.tabs.onCreated.addListener(function (tab) {
  if (tab.pendingUrl == "chrome://newtab/") {
    manage_quote_details();
  }
})

// chrome.tabs.onActivated.addListener(function(tab) {
//     console.log(tab)
// })


chrome.runtime.onMessage.addListener(async (param, sender, sendResponse) => {
  if (param.action == REFRESH_QUOTE) {
    manage_quote_details();

  } else if (param.action == GET_DAY_DATE) {
    sendResponse({ response_message: get_day_date() })

  } else if (param.action == GET_GREETING) {
    sendResponse({ response_message: get_greeting() })

  } else if (param.action == FETCH_LOCATION_WEATHER) {
    let location_weather = await get_location_weather_from_server(param.location);
    sendResponse({ response_message: location_weather })

  } else if (param.action == FETCH_LOCATION_LIST) {
    let location_data = await get_auto_complete_location_list(param.location_query);
    sendResponse({ response_message: location_data })

  } else if (param.action == "get_url_data") {
    fetch_web_url_data(param.url).then((data) => {
      sendResponse({ response_message: data })
    });
  } else if (param.action == NETWORK_STATUS) {
    sendResponse({ response_message: update_network_connection_status() })
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
      sendResponse({ response_message: { status: true, data: { key: key_val, value: value_val } } })
    });

  } else if (param.action == RETRIEVE_DATA) {
    var key_val = param.key
    chrome.storage.local.get([key_val]).then((result) => {
      if (result[key_val] == undefined) {
        sendResponse({ response_message: { status: false, error: "No data associate with key: " + key_val } })
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
  return time
}

async function manage_quote_details() {
  let time = set_time();
  if (last_quote_time == undefined || (time - last_quote_time > REFRESH_QUOTE_INTERVAL)) {
    fetch_new_quote();
  }
}

async function fetch_new_quote() {
  let fetched_quote = await get_motivation_quote();
  if (fetched_quote != undefined)
    store_last_quote_details(fetched_quote)
  return fetched_quote;
}

function store_last_quote_details(received_quote) {
  let time = set_time();
  let last_quote_details_obj = { store_time: time, quote_details: { quote: received_quote[QUOTE], author: received_quote[AUTHOR] } }
  let store = {};
  store[QUOTE_DATA] = last_quote_details_obj
  chrome.storage.local.set(store).then(() => {
    if (chrome.runtime.lastError)
      console.error('Chrome runtime error');
    else {
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
    let status = false
    let location_weather = await get_location_weather_form_api(location);
    if (location_weather != undefined) {
      let store = {};
      let now = new Date();
      store[LOCATION_WEATHER_DATA] = {
        "weather_data": location_weather,
        "last_updated": now.toISOString()
      }
      chrome.storage.local.set(store)
        .then(() => {
          status = true
        })
    }
    return {
      "status": status,
      "data": { "location_weather_data": location_weather }
    };
  }
}

async function get_auto_complete_location_list(location_query) {
  if (location_query != undefined) {
    let location_data = await fetch_location_list(location_query)
    return location_data
  }
}

let network_connection_status = false
let network_connection_status_last_updated = undefined

async function update_network_connection_status() {
  if (network_connection_status_last_updated == undefined || new Date() - network_connection_status_last_updated > NETWORK_CONNECTION_REFRESH_INTERVAL) {
    network_connection_status = await check_network_connection_status()
    network_connection_status_last_updated = new Date()
  }
  return network_connection_status
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
