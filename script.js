let colorPicker = new ColorPicker();

function init()
{
    colorPicker.init();
}

function handleResize()
{
    colorPicker.setLocations();
}


window.addEventListener("resize", handleResize);
init();
