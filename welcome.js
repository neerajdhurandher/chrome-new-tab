import { USER_NAME, WELCOME_TEXT, THANKS_TEXT, STORE_DATA } from "./constants.js"

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

function save_user_name(value) {
    chrome.runtime.sendMessage({ action: STORE_DATA, key: USER_NAME, value: value, name: "User name" }, () => {
        close_welcome_tab()
    })
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
        ).then(() => {})
    })
}

let name_input_element = document.getElementById("name-input-id")
let next_btn_element = document.getElementById("next_btn_id")

name_input_element.addEventListener("keyup", function (event) {
    var name_input_value = name_input_element.value.trim()

    if (name_input_value.length > 2) {
        next_btn_element.style.backgroundColor = "#0388f5"
    } else {
        next_btn_element.style.backgroundColor = "#706b6b"
    }

    if (event.keyCode === 13) {
        event.preventDefault();
        save_user_name(name_input_value)
    }
});

next_btn_element.addEventListener('click', () => {
    save_user_name(name_input_element.value)
})

type_writer(WELCOME_TEXT, welcome_element, true)
