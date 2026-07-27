import { WELCOME_TEXT, THANKS_TEXT } from "./constants.js"
import { store_default_quote } from "./quote.js"
import { saveUserName } from "./user.js"

const welcome_element = document.getElementById("welcome-heading");
const thanks_element = document.getElementById("thanks-heading");

function add_character(alphabet, element) {
    const node = document.createTextNode(alphabet);
    const para = document.createElement("span");
    para.appendChild(node);
    element.appendChild(para);
    return para;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function type_writer(word, element, repeat) {
    let node_list = []
    for (let char of word) {
        await sleep(200);
        try {
            node = add_character(char, element)
            node_list.push(node)
        } catch { }
    }

    if (repeat) {
        await sleep(1500)
        for (let i = node_list.length - 1; i > -1; i--) {
            try {
                element.removeChild(node_list[i])
                await sleep(200);
            } catch { }
        }
        for (let i = 0; i < node_list.length; i++) {
            try {
                element.appendChild(node_list[i])
                await sleep(200);
            } catch { }
        }
    }
}

async function save_user_name(value) {
    await saveUserName(value);
    await store_default_quote();
    close_welcome_tab()
}

async function close_welcome_tab() {
    name_input_element.style.display = "none"
    next_btn_element.style.display = "none"
    welcome_element.style.display = "none"

    type_writer(THANKS_TEXT, thanks_element, false)
    await sleep(2500)
    chrome.tabs.create({});
    await sleep(200)
    chrome.tabs.getCurrent().then((curr_tab) => {
        chrome.tabs.remove(
            curr_tab.id
        ).then(() => { })
    })
}

let name_input_element = document.getElementById("name-input-id")
let next_btn_element = document.getElementById("next_btn_id")

const name_error_element = document.getElementById("name-input-error");
let name_error_timer = null;

function showNameError(message) {
    name_error_element.textContent = message;
    clearTimeout(name_error_timer);
    name_error_timer = setTimeout(() => {
        name_error_element.textContent = "";
    }, 2000);
}

name_input_element.addEventListener("keydown", function (event) {
    const isModifier = event.ctrlKey || event.metaKey || event.altKey;
    const isPrintable = event.key.length === 1 && !isModifier;
    if (isPrintable && name_input_element.value.length >= 8) {
        showNameError("Max 8 characters allowed.");
    }
});

name_input_element.addEventListener("input", function () {
    const name_input_value = name_input_element.value;

    if (name_input_value.length <= 8) {
        next_btn_element.style.backgroundColor = name_input_value.trim().length > 2 ? "#0388f5" : "#706b6b";
    }
});

name_input_element.addEventListener("keyup", async function (event) {
    const name_input_value = name_input_element.value.trim();

    if (name_input_value.length > 8) {
        return;
    }

    if (event.keyCode != 13) {
        return;
    }

    event.preventDefault();
    await save_user_name(name_input_value);
});

next_btn_element.addEventListener('click', async () => {
    const trimmed = name_input_element.value.trim();
    if (trimmed.length > 8) {
        name_error_element.textContent = "Name must be 8 characters or less.";
        name_input_element.classList.add("input-name-over-limit");
        return;
    }
    await save_user_name(trimmed);
})

type_writer(WELCOME_TEXT, welcome_element, true)
