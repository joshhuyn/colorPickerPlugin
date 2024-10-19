let colorPicker = new ColorPicker();

function handleResize()
{
    colorPicker.setLocations();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse)
    {
        request.colorPickerEnabled ? colorPicker.add() : colorPicker.remove();
    }
)

window.addEventListener("resize", handleResize);
