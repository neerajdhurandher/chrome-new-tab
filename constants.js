// actions
export let USER_NAME = "user_name"
export let KEY = "key_value"
export let VALUE = "This is value"
export let GET_DAY_DATE = "get_day_date"
export let GET_GREETING = "get_greeting"
export let REFRESH_QUOTE = "refresh_quote"
export let FETCH_LOCATION_WEATHER = "fetch_location_weather"
export let GET_LOCATION_WEATHER = "get_location_weather"
export let LOCATION_WEATHER_DATA = "location_weather_data"
export let FETCH_LOCATION_LIST = "fetch_location_list"
export let STORE_DATA = "store_data"
export let RETRIEVE_DATA = "retrieve_data"
export let QUOTE_DATA = "quote_data"
export let QUOTE = "quote"
export let AUTHOR = "author"
export let BOOKMARK_LIST = "bookmark_list"
export let BOOKMARK_ID = "bookmark_id"
export let BOOKMARK_NAME = "bookmark_name"
export let BOOKMARK_URL = "bookmark_url"
export let BOOKMARK_LOGO = "bookmark_logo"
export let NETWORK_STATUS = "network_status"
export let GET_SEARCH_SUGGESTIONs = "get_search_suggestions"
export let GET_URL_DATA = "get_url_data"
export let SETTINGS_TIME_FORMAT = "settings_time_format"
export let SETTINGS_WEATHER_UNIT = "settings_weather_unit"
export let SETTINGS_BOOKMARK_BAR_POSITION = "settings_bookmark_bar_position"
export let SETTINGS_BOOKMARK_OPEN_NEW_TAB = "settings_bookmark_open_new_tab"
export let SETTINGS_BOOKMARK_SHOW_ICONS_ONLY = "settings_bookmark_show_icons_only"
export let SETTINGS_SEARCH_OPEN_NEW_TAB = "settings_search_open_new_tab"
export let SETTINGS_SECONDARY_SEARCH_PROVIDER = "settings_secondary_search_provider"
export let SETTINGS_QUOTE_AUTHOR_VISIBILITY = "settings_quote_author_visibility"
export let SETTINGS_SHOW_QUOTE = "settings_show_quote"

// values
export let WELCOME_TEXT = "Hey, Welcome"
export let THANKS_TEXT = "Thanks!"
export let SAVED_TEXT = "Saved " + '&#8730;'
export let ERROR_TEXT = "Error: Something went wrong."
export let NULL_TEXT = "null"
export let INVALID_URL = "Invalid URL!!"
export let INVALID_BOOKMARK_NAME = "Invalid bookmark name!!"
export let BOOKMARKS = "Bookmarks"
export let BIG_WINDOW = "big_window"
export let SMALL_WINDOW = "small_window"
//  10 min
export let NETWORK_CONNECTION_REFRESH_INTERVAL = 600000
// 2 hours
export let REFRESH_QUOTE_INTERVAL = 7200000
// 4 hours
export let REFRESH_WEATHER_INTERVAL = 14400000
// 800 milliseconds (0.8 seconds)
export let LOCATION_INPUT_DEBOUNCE_INTERVAL = 800 // milliseconds
export let MAX_BOOKMARK_SHOW = 4

// colors
export let GREEN_COLOR = "#1ae94d"
export let RED_COLOR = "#e31212"

// URLs
export const YOUTUBE_SEARCH_LINK = "https://www.youtube.com/results?search_query="
export const GOOGLE_SEARCH_LINK = "https://www.google.com/search?q=";
export const CHATGPT_SEARCH_LINK = "https://chatgpt.com/?q=";
export const GEMINI_SEARCH_LINK = "https://gemini.google.com/app?q=";
export const CLAUDE_SEARCH_LINK = "https://claude.ai/new?q=";
export const COPILOT_SEARCH_LINK = "https://copilot.microsoft.com/?q=";

// default quote
export const DEFAULT_QUOTE = "Today is your opportunity to build the tomorrow you want.";
export const DEFAULT_QUOTE_AUTHOR = "Ken Poirot";
export const WEATHER_LOADING_MESSAGE = "getting your location weather data..."
export const WEATHER_LOADING_ERROR_MESSAGE = "sorry, couldn't load weather data"

export const INCORRECT_WEATHER_DATA_MESSAGE = "Weather info may be inaccurate; trouble fetching current data";
export const TIME_FORMAT_12H = "12h";
export const TIME_FORMAT_24H = "24h";
export const WEATHER_UNIT_C = "c";
export const WEATHER_UNIT_F = "f";
export const BOOKMARK_BAR_POSITION_LEFT = "left";
export const BOOKMARK_BAR_POSITION_RIGHT = "right";
export const BOOKMARK_OPEN_NEW_TAB_DEFAULT = true;
export const BOOKMARK_SHOW_ICONS_ONLY_DEFAULT = false;
export const USER_NAME_MAX_LENGTH = 8;
export const SEARCH_OPEN_NEW_TAB_DEFAULT = false;
export const SHOW_QUOTE_DEFAULT = true;
export const QUOTE_AUTHOR_VISIBILITY_ALWAYS = "always";
export const QUOTE_AUTHOR_VISIBILITY_HOVER = "hover";
export const QUOTE_AUTHOR_VISIBILITY_DEFAULT = QUOTE_AUTHOR_VISIBILITY_ALWAYS;
export const SECONDARY_SEARCH_PROVIDER_YOUTUBE = "youtube";
export const SECONDARY_SEARCH_PROVIDER_CHATGPT = "chatgpt";
export const SECONDARY_SEARCH_PROVIDER_GEMINI = "gemini";
export const SECONDARY_SEARCH_PROVIDER_CLAUDE = "claude";
export const SECONDARY_SEARCH_PROVIDER_COPILOT = "copilot";
