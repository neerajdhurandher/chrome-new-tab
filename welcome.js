var welocome_text = "Hey, Welcome"
const welcome_element = document.getElementById("welcome-heading");
let date = new Date();

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

async function type_writer(wrod, element) {
    let node_list = []
    for (let char of wrod) {
        await sleep(200);
        node = add_character(char,element)
        node_list.push(node)
    }

    await sleep(1500)

    for (let i = node_list.length-1; i > -1; i--) {
        element.removeChild(node_list[i])
        await sleep(200);
    }
}

type_writer(welocome_text, welcome_element)
