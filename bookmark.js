import { RETRIEVE_DATA, STORE_DATA, BOOKMARK_LIST, MAX_BOOKMARK_SHOW, SAVED_TEXT, ERROR_TEXT, NULL_TEXT, NETWORK_STATUS } from "./constants.js";
import { BIG_WINDOW, SMALL_WINDOW, BOOKMARKS, INVALID_URL, INVALID_BOOKMARK_NAME, GREEN_COLOR, RED_COLOR, GET_URL_DATA } from "./constants.js";
import { callChromeStorageApi, retrieveDataFromLocalStorage, storeDataInLocalStorage } from "./chrome-storage-api.js";
import { validate_url, get_domain_first_letter, extract_logo } from "./contentScript.js";

let bookmark_popup_element = document.getElementById("bookmark-popup")
let bookmark_container = document.querySelector(".bookmark-container")
let add_bookmark_btn = document.querySelector(".add-new-bm")
let bm_save_btn = document.getElementById("save-btn")
let bm_delete_btn = document.getElementById("delete-btn")
let loader_element = document.getElementById("loader")
let msg_element = document.getElementById("msg_text")
let bookmark_list_element = document.querySelector(".bookmark-list")
let bookmark_name_element = document.getElementById("bm-name")
let bookmark_url_element = document.getElementById("bm-url")
let more_bookmark_btn = document.querySelector(".more-bookmark-btn")
let more_bookmark_popup = document.getElementById("more-bookmark-popup")
let more_bookmark_close_btn = document.querySelector(".more-bookmark-close")
let bookmark_down_arrow_btn = document.getElementById("bookmark_down_arrow")
let bookmark_up_arrow_btn = document.getElementById("bookmark_up_arrow")
let bookmark_edit_button = document.querySelector(".bookmark-edit-btn")
let bookmark_section_expended = false
let more_bookmark = false
let last_window_size = undefined
let bookmark_list = []
let network_connection_status = false


// Add a global variable to track the bookmark being edited
let current_editing_bookmark_id = null;

add_bookmark_btn.addEventListener("click", () => {
    bookmark_popup_element.classList.add("overlay_show");
})

document.querySelector(".close").addEventListener("click", () => {
    close_popup();
})

bm_save_btn.addEventListener("click", () => {
    if (validate_bookmark_input_data() == true) {
        save_bookmark();
    }
});

more_bookmark_btn.addEventListener("click", () => {
    show_all_bookmarks(bookmark_list, false);
})

more_bookmark_close_btn.addEventListener("click", () => {
    close_more_bookmark_popup();
})

bookmark_down_arrow_btn.addEventListener("click", () => {
    bookmark_list_element.style.display = "flex";
    bookmark_down_arrow_btn.style.display = "none";
    bookmark_up_arrow_btn.style.display = "block";
    bookmark_container.style.height = "max-content";
    bookmark_section_expended = true;
});

bookmark_up_arrow_btn.addEventListener("click", () => {
    bookmark_list_element.style.display = "none";
    bookmark_up_arrow_btn.style.display = "none";
    bookmark_down_arrow_btn.style.display = "block";
    bookmark_container.style.height = "16vh";
    bookmark_section_expended = false;
});

bookmark_container.addEventListener("mouseover", () => {
    if (bookmark_list.length > 0) {
        bookmark_edit_button.style.display = "block";
    }
});

bookmark_container.addEventListener("mouseout", () => {
    bookmark_edit_button.style.display = "none";
});

bookmark_edit_button.addEventListener("click", () => {
    show_all_bookmarks(bookmark_list, true);
});


window.addEventListener("resize", () => {
    let window_width = window.innerWidth;
    if (last_window_size == undefined) {
        if (window_width > 1050)
            last_window_size = BIG_WINDOW;
        else
            last_window_size = SMALL_WINDOW;
    }

    if (window_width > 1050 && last_window_size == SMALL_WINDOW) {
        bookmark_container.style.height = "60vh";
        bookmark_list_element.style.display = "flex";
        bookmark_up_arrow_btn.style.display = "none";
        bookmark_down_arrow_btn.style.display = "none";
        bookmark_section_expended = false;
        last_window_size = BIG_WINDOW;
        if (more_bookmark == true)
            more_bookmark_btn.style.display = "block";
    } else if (window_width <= 1050 && last_window_size == BIG_WINDOW) {
        bookmark_container.style.height = "125px";
        bookmark_list_element.style.display = "none";
        bookmark_up_arrow_btn.style.display = "none";
        bookmark_down_arrow_btn.style.display = "block";
        last_window_size = SMALL_WINDOW;
        // if(more_bookmark == true)
        more_bookmark_btn.style.display = "none";
    }
})


/**
 * Retrieves the current network connection status from Chrome storage.
 * 
 * @async
 * @returns {Promise<boolean>} The network connection status.
 */
export async function get_network_connection_status() {
    try {
        const response = await callChromeStorageApi({ action: NETWORK_STATUS, key: NETWORK_STATUS, name: "Getting network status" });
        network_connection_status = response.response_message;
        return network_connection_status;
    } catch (error) {
        console.error("Failed to get network connection status:", error);
        return false;
    }
}



/**
 * Validates the bookmark input data.
 * Checks if the bookmark name is not empty and the URL is valid.
 * Displays appropriate error messages if validation fails.
 * 
 * @returns {boolean} True if the input data is valid, false otherwise.
 */
function validate_bookmark_input_data() {

    let valid_bookmark_name = true;
    let valid_url = validate_url(bookmark_url_element.value);

    // Remove any existing error borders
    bookmark_name_element.classList.remove('input-error');
    bookmark_url_element.classList.remove('input-error');

    if (bookmark_name_element.value.length < 1) {
        valid_bookmark_name = false;
        show_msg(false, INVALID_BOOKMARK_NAME);
        highlight_invalid_input(bookmark_name_element);
    } else if (valid_url == false) {
        show_msg(false, INVALID_URL);
        highlight_invalid_input(bookmark_url_element);
    }

    if (valid_bookmark_name == true && valid_url == true) {
        return true;
    } else {
        return false;
    }
}

/**
 * Highlights an invalid input field with a red border for 1 second.
 * 
 * @param {HTMLElement} inputElement - The input element to highlight
 * @param {number} duration - Duration in milliseconds to keep the highlight (default is 1000ms)
 */
function highlight_invalid_input(inputElement, duration = 1000) {
    inputElement.classList.add('input-error');

    setTimeout(() => {
        inputElement.classList.remove('input-error');
    }, duration);
}


/**
 * Displays a message with a specified status color.
 * 
 * @param {boolean} status - True for success (green), false for error (red)
 * @param {string} msg - The message to display
 */
function show_msg(status, msg) {
    if (status == true) {
        msg_element.style.color = GREEN_COLOR;
    } else {
        msg_element.style.color = RED_COLOR;
    }
    msg_element.innerHTML = msg;
    msg_element.style.display = "block";
    msg_element.style.visibility = "visible";

    setTimeout(() => {
        msg_element.style.display = "none";
    }, 2000);

}

/**
 * Retrieves bookmarks from Chrome storage and displays them.
 * Handles the display of a "more bookmarks" button if there are more bookmarks than the maximum allowed to show.
 */
export async function set_bookmarks() {
    try {
        const response = await retrieveDataFromLocalStorage(BOOKMARK_LIST);
        if (response.status == true && response.data != undefined && response.data.bookmark_list != undefined) {
            let bm_list = response.data.bookmark_list;
            bookmark_list = bm_list;

            let max_count = MAX_BOOKMARK_SHOW;
            let number_of_bookmarks = bm_list.length;

            if (number_of_bookmarks <= max_count) {
                max_count = number_of_bookmarks;
                more_bookmark = false;
            } else {
                more_bookmark_btn.style.display = "block";
                more_bookmark = true;
            }

            for (let i = 0; i < max_count; i++) {
                let b_div = create_bookmark_element(bm_list[i]);
                if (b_div !== undefined)
                    bookmark_list_element.appendChild(b_div);
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


/**
 * Creates a bookmark element for display.
 * 
 * @param {Object} bookmark_details - The details of the bookmark.
 * @param {boolean} edit_field - Whether to include an edit field.
 * @returns {HTMLElement|undefined} The created bookmark element, or undefined if an error occurs.
 */
function create_bookmark_element(bookmark_details, edit_field) {
    try {
        let b_div = document.createElement("div");
        b_div.bookmarkId = "bookmark-" + bookmark_details.bookmark_id;
        b_div.classList.add("bookmark-card");

        let b_wrapper_div = document.createElement("div");
        b_wrapper_div.classList.add("bookmark-card-wrapper");

        let logo_i = document.createElement("img");
        logo_i.classList.add("bookmark-logo");

        let custom_logo_div = document.createElement("div");
        custom_logo_div.classList.add("bookmark-logo");
        custom_logo_div.classList.add("custom-logo-div");

        let custom_logo_span = document.createElement("span");
        custom_logo_span.classList.add("logo-letter");

        custom_logo_div.appendChild(custom_logo_span);

        let b_name = document.createElement("span");
        b_name.classList.add("bookmark-name");


        if (network_connection_status == false || bookmark_details.bookmark_logo == NULL_TEXT) {
            let bm_letter = bookmark_details.bookmark_letter;
            custom_logo_span.innerHTML = bm_letter.toUpperCase();
            logo_i.style.display = "none";
            custom_logo_div.style.display = "block";
        } else {
            logo_i.src = bookmark_details.bookmark_logo;
        }
        b_name.innerHTML = bookmark_details.bookmark_name.substring(0, 6);


        b_wrapper_div.appendChild(logo_i);
        b_wrapper_div.appendChild(custom_logo_div);
        b_wrapper_div.appendChild(b_name);

        b_div.appendChild(b_wrapper_div);

        if (edit_field == true) {
            let b_edit_icon = document.createElement("img");
            b_edit_icon.src = "./imgs/edit-icon.png";
            b_edit_icon.classList.add("bookmark-edit-btn-more-bookmark");
            b_edit_icon.addEventListener("click", () => {
                add_edit_bookmark(bookmark_details, true);
            })
            b_div.appendChild(b_edit_icon);
        }

        b_wrapper_div.addEventListener("click", () => {
            window.open(bookmark_details.bookmark_url, '_parent');
        })

        return b_div;
    } catch (error) {
        console.error("Error creating bookmark element:", error);
        return undefined;
    }
}

/**
 * Saves a bookmark by validating input data, extracting logo, and storing bookmark data.
 * Handles both new bookmarks and editing existing ones.
 * 
 * @returns {boolean} True if the bookmark is saved successfully, false otherwise.
 */
function save_bookmark() {
    let bookmark_name = bookmark_name_element.value.trim();
    let bookmark_url = bookmark_url_element.value.trim();

    bm_save_btn.style.display = "none";
    bm_delete_btn.style.display = "none";
    msg_element.style.display = "block";
    msg_element.style.visibility = "hidden";
    loader_element.style.display = "block";

    let domain_first_letter = get_domain_first_letter(bookmark_url);
    if (domain_first_letter == " ") {
        domain_first_letter = bookmark_name.charAt(0);
    }

    const payLoad = {
        action: GET_URL_DATA,
        url: bookmark_url,
        name: bookmark_name
    };

    callChromeStorageApi(payLoad).then((response) => {
        return extract_logo(bookmark_url, response.response_message);
    }).catch(() => {
        console.error("Error fetching URL data for logo extraction of : " + bookmark_url);
        return null;
    }).then((bookmark_logo) => {
        return store_bookmark_data(bookmark_name, bookmark_url, bookmark_logo || NULL_TEXT, domain_first_letter);
    }).then((storeResult) => {
        save_bookmark_callback(storeResult);
    }).catch((error) => {
        console.error("Error in save_bookmark:", error);
        save_bookmark_callback({ success: false, bm_obj: null, bm_list: bookmark_list });
    });
}

function save_bookmark_callback(storeResult) {
    let { success, bm_obj, bm_list: updated_bm_list } = storeResult || { success: false, bm_obj: null, bm_list: bookmark_list };

    if (success) {
        show_msg(true, SAVED_TEXT);
    } else {
        show_msg(false, ERROR_TEXT);
    }

    setTimeout(() => {
        close_popup();
    }, 2000);

    if (!current_editing_bookmark_id && updated_bm_list.length - 1 < MAX_BOOKMARK_SHOW) {
        let new_bm = create_bookmark_element(bm_obj);
        if (new_bm !== undefined) {
            bookmark_list_element.appendChild(new_bm);
        }
    } else if (updated_bm_list.length > MAX_BOOKMARK_SHOW) {
        more_bookmark_btn.style.display = "block";
        more_bookmark = true;
    }
}

function store_bookmark_data(bm_name, bm_url, bm_logo, bm_letter) {
    let date_time = new Date();

    let bm_obj = {
        "bookmark_id": current_editing_bookmark_id || date_time.toISOString(),
        "bookmark_name": bm_name,
        "bookmark_url": bm_url,
        "bookmark_logo": bm_logo,
        "bookmark_letter": bm_letter
    };

    let bm_list = [];

    return retrieveDataFromLocalStorage(BOOKMARK_LIST)
        .then((response) => {
            bm_list = response.status ? (response.data[BOOKMARK_LIST] || []) : [];
            if (!current_editing_bookmark_id) {
                bm_list.push(bm_obj);
            } else {
                // Replace the edited bookmark in the list before storing
                bm_list = bm_list.map((bookmark) =>
                    bookmark.bookmark_id === current_editing_bookmark_id ? bm_obj : bookmark
                );
            }
        })
        .catch((error) => {
            console.error("Error fetching bookmarks:", error);
            bm_list = [bm_obj];
        })
        .then(() => {
            return storeDataInLocalStorage(BOOKMARK_LIST, bm_list);
        })
        .then(() => {
            bookmark_list = bm_list;
            if (current_editing_bookmark_id) {
                let bookmark_cards = document.querySelectorAll(".bookmark-card");
                try {
                    bookmark_cards.forEach((card) => {
                        if (card.bookmarkId === "bookmark-" + current_editing_bookmark_id) {
                            let logo_imgs = card.querySelectorAll(".bookmark-logo");
                            let logo_img = logo_imgs[0];
                            let custom_logo_div = logo_imgs[1];
                            let custom_logo_span = card.querySelector(".logo-letter");
                            let bookmark_name_span = card.querySelector(".bookmark-name");

                            if (bm_logo === NULL_TEXT) {
                                logo_img.style.display = "none";
                                custom_logo_div.style.display = "block";
                                custom_logo_span.innerHTML = bm_letter.toUpperCase();
                            } else {
                                logo_img.style.display = "block";
                                custom_logo_div.style.display = "none";
                                logo_img.src = bm_logo;
                            }

                            bookmark_name_span.innerHTML = bm_name.substring(0, 6);
                            card.dataset.bookmarkUrl = bm_url;
                        }
                    });
                } catch (error) {
                    console.error("Error updating bookmark card:", error);
                }
            }
            return { success: true, bm_obj, bm_list };
        })
        .catch((error) => {
            console.error("Failed to store bookmark data:", error);
            return { success: false, bm_obj, bm_list };
        });



    // chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: BOOKMARK_LIST }, (response) => {
    //     let bm_list = response.response_message.status ? response.response_message.data.bookmark_list : [];

    //     if (current_editing_bookmark_id) {
    //         // Update existing bookmark
    //         bm_list = bm_list.map((bookmark) =>
    //             bookmark.bookmark_id === current_editing_bookmark_id ? bm_obj : bookmark
    //         );

    //         // Reflect changes in the UI
    //         let bookmark_cards = document.querySelectorAll(".bookmark-card");
    //         try {
    //             bookmark_cards.forEach((card) => {
    //                 if (card.bookmarkId === "bookmark-" + current_editing_bookmark_id) {
    //                     // Update the bookmark card in the UI
    //                     let logo_imgs = card.querySelectorAll(".bookmark-logo");
    //                     let logo_img = logo_imgs[0]; // The <img> element
    //                     let custom_logo_div = logo_imgs[1]; // The <div> element
    //                     let custom_logo_span = card.querySelector(".logo-letter");
    //                     let bookmark_name_span = card.querySelector(".bookmark-name");

    //                     if (bm_logo === NULL_TEXT) {
    //                         logo_img.style.display = "none";
    //                         custom_logo_div.style.display = "block";
    //                         custom_logo_span.innerHTML = bm_letter.toUpperCase();
    //                     } else {
    //                         logo_img.style.display = "block";
    //                         custom_logo_div.style.display = "none";
    //                         logo_img.src = bm_logo;
    //                     }

    //                     bookmark_name_span.innerHTML = bm_name.substring(0, 6);
    //                     card.dataset.bookmarkUrl = bm_url; // Update the URL in the dataset
    //                 }

    //             });
    //         } catch (error) {
    //             console.error("Error updating bookmark card:", error);
    //         }

    //     } else {
    //         // Add new bookmark
    //         bm_list.push(bm_obj);
    //     }

    //     chrome.runtime.sendMessage({ action: STORE_DATA, key: BOOKMARK_LIST, value: bm_list, name: "Bookmark list" }, (response) => {
    //         loader_element.style.display = "none";
    //         bookmark_list = bm_list;
    //         if (response.response_message.status == true) {
    //             show_msg(true, SAVED_TEXT);
    //         } else {
    //             show_msg(false, ERROR_TEXT);
    //         }
    //     });

    //     setTimeout(() => {
    //         close_popup();
    //     }, 2000);

    //     if (!current_editing_bookmark_id && bm_list.length - 1 < MAX_BOOKMARK_SHOW) {
    //         let new_bm = create_bookmark_element(bm_obj);
    //         if (new_bm !== undefined) {
    //             bookmark_list_element.appendChild(new_bm);
    //         }
    //     } else if (bm_list.length - 1 >= MAX_BOOKMARK_SHOW) {
    //         more_bookmark_btn.style.display = "block";
    //         more_bookmark = true;
    //     }
    // });
}



function add_edit_bookmark(bookmark_details, edit_field) {

    let bm_popup_content_element = document.querySelector(".add-edit-bookmark");
    let bm_popup_title = document.getElementById("bookmark-popup-title");
    let bm_name_element = document.getElementById("bm-name");
    let bm_url_element = document.getElementById("bm-url");

    if (edit_field == true) {
        bm_popup_title.innerHTML = "Edit bookmark";
        bm_name_element.value = bookmark_details.bookmark_name;
        bm_url_element.value = bookmark_details.bookmark_url;
        bm_delete_btn.style.display = "block"
        current_editing_bookmark_id = bookmark_details.bookmark_id; // Track the bookmark ID being edited
        bm_delete_btn.addEventListener("click", () => {
            delete_bookmark(bookmark_details);
        })
    } else {
        bm_popup_title.innerHTML = "Add bookmark";
        current_editing_bookmark_id = null; // Reset for new bookmark
        bm_delete_btn.style.display = "none";
    }

    close_more_bookmark_popup()
    bookmark_popup_element.classList.add("overlay_show")

}

function delete_bookmark(bookmark_details) {
    console.log("Deleting bookmark: { " + bookmark_details.bookmark_name + " }...");
    bm_save_btn.style.display = "none"
    bm_delete_btn.style.display = "none"
    msg_element.style.display = "block"
    msg_element.style.visibility = "hidden"
    loader_element.style.display = "block"

    chrome.runtime.sendMessage({ action: RETRIEVE_DATA, key: BOOKMARK_LIST }, (response) => {
        let bm_list = response.response_message.status ? response.response_message.data.bookmark_list : [];

        // Filter out the bookmark to be deleted
        bm_list = bm_list.filter((bookmark) => bookmark.bookmark_id !== bookmark_details.bookmark_id);

        // Update the database
        chrome.runtime.sendMessage({ action: STORE_DATA, key: BOOKMARK_LIST, value: bm_list, name: "Bookmark list" }, (response) => {
            bookmark_list = bm_list;
            if (response.response_message.status == true) {
                console.log("Bookmark deleted successfully from the database.");
                show_msg(true, "Bookmark deleted successfully!");

                // Remove the bookmark from the UI
                let bookmark_cards = document.querySelectorAll(".bookmark-card");
                bookmark_cards.forEach((card) => {
                    if (card.bookmarkId === "bookmark-" + bookmark_details.bookmark_id) {
                        card.remove();
                    }
                });

                // Hide the "More Bookmarks" button if no extra bookmarks exist
                if (bm_list.length <= MAX_BOOKMARK_SHOW) {
                    more_bookmark_btn.style.display = "none";
                    more_bookmark = false;
                }
            } else {
                console.error("Failed to delete bookmark from the database.");
                show_msg(false, "Failed to delete bookmark.");
            }

            setTimeout(() => {
                close_popup();
            }, 2000);
        });
    });
}

async function show_all_bookmarks(bookmark_list, edit_field) {


    let chromeResponse = await callChromeStorageApi({ action: RETRIEVE_DATA, key: BOOKMARK_LIST, name: "Bookmark list" });
    let bm_list = chromeResponse.response_message.data.bookmark_list
    if (bm_list) {
        bookmark_list = bm_list
    } else {
        bookmark_list = []
    }

    let number_of_bookmarks = bm_list.length

    more_bookmark_popup.classList.add("overlay_show")

    let more_bookmark_popup_container = document.querySelector(".more-bookmark-popup-container")

    let bookmark_heading = document.getElementById("bookmark-heading")
    bookmark_heading.innerHTML = BOOKMARKS + " (" + number_of_bookmarks + ")"


    if (more_bookmark_popup_container.childElementCount > 1) {
        more_bookmark_popup_container.removeChild(more_bookmark_popup_container.children[1])
    }

    let more_bookmark_div = document.createElement("div")
    more_bookmark_div.classList.add("all-bookmark-container")

    if (bookmark_list.length == 0) {
        let no_bookmark_div = document.createElement("div")
        no_bookmark_div.classList.add("no-bookmark-message")
        no_bookmark_div.innerHTML = "No bookmarks available"
        more_bookmark_div.appendChild(no_bookmark_div)
    }

    for (let i = 0; i < number_of_bookmarks; i++) {
        let b_div = create_bookmark_element(bm_list[i], edit_field);
        if (b_div !== undefined) {
            more_bookmark_div.appendChild(b_div);
        }
    }

    more_bookmark_popup_container.appendChild(more_bookmark_div)

}

function close_popup() {
    bookmark_name_element.value = ""
    bookmark_url_element.value = ""
    bookmark_popup_element.classList.remove("overlay_show")
    loader_element.style.display = "none"
    msg_element.style.display = "none"
    bm_save_btn.style.display = "block"
}

function close_more_bookmark_popup() {
    more_bookmark_popup.classList.remove("overlay_show")
    let more_bookmark_popup_container = document.querySelector(".more-bookmark-popup-container")
    more_bookmark_popup_container.removeChild(more_bookmark_popup_container.children[1])
}
