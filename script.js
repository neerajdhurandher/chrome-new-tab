import { set_time, updateDate } from "./date-and-time.js";
import { manage_quote } from "./quote.js";
import { get_city_weather_data } from "./weather.js";
import { set_bookmarks, get_network_connection_status } from "./bookmark.js";
import { set_greeting } from "./user.js";


// setup action on initialization

set_time();
updateDate();
// updating time every second
setInterval(set_time, 1000);
set_greeting();
get_network_connection_status();
manage_quote();
set_bookmarks();
setTimeout(async () => {
    await get_city_weather_data();
}, 500);

    