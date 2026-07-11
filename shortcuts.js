function isShortcutEvent(event) {
    const hasPrimaryModifier = event.ctrlKey || event.metaKey;
    return hasPrimaryModifier && event.shiftKey && !event.altKey;
}

function focusSearchInput(inputId, triggerElementId) {
    const triggerElement = document.getElementById(triggerElementId);
    if (triggerElement) {
        triggerElement.click();
    }

    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.focus();
        inputElement.select();
    }
}

document.addEventListener("keydown", (event) => {
    if (!isShortcutEvent(event)) {
        return;
    }

    const key = event.key.toLowerCase();

    if (key === "b") {      
        event.preventDefault();
        document.dispatchEvent(new CustomEvent("shortcut-add-bookmark"));
        return;
    }

    if (key === "m") {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent("shortcut-show-all-bookmarks"));
        return;
    }

    if (key === "s") {
        event.preventDefault();
        const settingsOpenButton = document.getElementById("settings-open-btn");
        if (settingsOpenButton) {
            settingsOpenButton.click();
        }
        return;
    }

    if (key === "g") {
        event.preventDefault();
        focusSearchInput("google-search-input", "google-search-box-id");
        return;
    }

    if (key === "y") {
        event.preventDefault();
        focusSearchInput("youtube-search-input", "youtube-search-box-id");
    }
});
