import { get_location_weather_form_api, fetch_location_list, fetch_web_url_data, check_network_connection_status, fetch_search_suggestions } from "./api_call.js";
import { FETCH_LOCATION_WEATHER, FETCH_LOCATION_LIST, STORE_DATA, RETRIEVE_DATA, LOCATION_WEATHER_DATA, NETWORK_STATUS, NETWORK_CONNECTION_REFRESH_INTERVAL, GET_SEARCH_SUGGESTIONs, GET_URL_DATA } from "./constants.js"


chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({
      url: "welcome.html"
    });
  } else if (reason === 'update') {
    chrome.tabs.create({
      url: "update.html"
    });
  }

});

chrome.tabs.onCreated.addListener(function (tab) {
  if (tab.pendingUrl == "chrome://newtab/") {
    console.log("New tab created");
  }
})

// chrome.tabs.onActivated.addListener(function(tab) {
//     console.log(tab)
// })


chrome.runtime.onMessage.addListener(async (param, sender, sendResponse) => {
  // Storage actions
  if (param.action == STORE_DATA) {
    const value_val = param.value
    let store = {}
    store[param.key] = value_val
    await chrome.storage.local.set(store).then(() => {
      sendResponse({ response_message: { status: true, data: { key: param.key, value: value_val } } })
    }).catch((error) => {
      sendResponse({ response_message: { status: false, error: error.message } })
    });

  } else if (param.action == RETRIEVE_DATA) {
    await chrome.storage.local.get([param.key]).then((result) => {
      if (result[param.key] == undefined) {
        sendResponse({ response_message: { status: false, error: "No data associate with key: " + param.key } })
      } else {
        sendResponse({ response_message: { status: true, data: result } })
      }
    }).catch((error) => {
      sendResponse({ response_message: { status: false, error: error.message } })
    });
  } 
  // API call actions
  else if (param.action == FETCH_LOCATION_WEATHER) {
    let location_weather = await get_location_weather_from_server(param.location);
    sendResponse({ response_message: location_weather });
  } else if (param.action == FETCH_LOCATION_LIST) {
    let location_data = await get_auto_complete_location_list(param.location_query);
    sendResponse({ response_message: location_data });
  } else if (param.action == GET_URL_DATA) {
    let url_data = await fetch_web_url_data(param.url);
    sendResponse({ response_message: url_data });
  } else if (param.action == NETWORK_STATUS) {
    sendResponse({ response_message: await update_network_connection_status() });
  } else if (param.action == GET_SEARCH_SUGGESTIONs) {
    let suggestions = await fetch_search_suggestions(param.query)
    sendResponse({ response_message: suggestions });
  }

  // default response for unhandled actions
  sendResponse({ response_message: { status: false, error: "Unhandled action: " + param.action } })
})


/** * Fetches weather data for a given location from the server and stores it in Chrome's local storage.
 * @param {string} location - The name of the location to fetch weather data for.
 * @returns {Promise<Object>} An object containing the status of the operation and the fetched weather data.
 */
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

      await chrome.storage.local.set(store).then(() => {
        status = true;
      }).catch((error) => {
        status = false;
        console.error("Error storing location weather data:", error);
      });
    }

    return {
      "status": status,
      "data": { "location_weather_data": location_weather }
    };
  }
}

async function get_auto_complete_location_list(location_query) {
  if (location_query != undefined) {
    let location_data = await fetch_location_list(location_query);
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
