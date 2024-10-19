function checkColorPicker()
{
    let colorPickerCheckbox = document.getElementById("colorpickerToggle");

    if (colorPickerCheckbox)
    {
        return colorPickerCheckbox.checked;
    }

    return false;
}

function createContentData()
{
    return {
        "colorPickerEnabled" : checkColorPicker() 
    };
}

document.getElementById("saveBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

    await chrome.tabs.sendMessage(tab.id, createContentData());
});
