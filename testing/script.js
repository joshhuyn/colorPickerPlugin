const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d")

CTX.font = "30px Arial"

const MAX_SHIFTER_LENGTH = 5;

const SLOT_WIDTH = 30;

let tabsCount = 20;
let currentTab = 2;

let gridSize = CANVAS.width / MAX_SHIFTER_LENGTH;
let gridHeight = 0;

let shifters = [];

drawBackground();

// END DEBUG

/*

activate tab:
    chrome.tabs.update(tabId, {'active': true}, (tab) => {});

get all tabs:
    chrome.tabs.query({currentWindow: true}, tab -> console.log(tab));

*/


class ShifterModule
{
    constructor(x, y, active, tabIndex)
    {
        this.x = x;
        this.y = y;
        this.active = active;
        this.tabIndex = tabIndex;
    }
}

function drawBackground()
{
    CTX.fillStyle = "hsl(0, 0%, 50%)"
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);



    // DEBUG
    CTX.strokeStyle = "hsl(0, 0%, 0%)";

    for (let x = 0; x < CANVAS.width; x += gridSize)
    {
        CTX.moveTo(x, 0);
        CTX.lineTo(x, CANVAS.height);
        CTX.stroke();
    }

    for (let y = 0; y < CANVAS.height; y += gridSize)
    {
        CTX.moveTo(0, y);
        CTX.lineTo(CANVAS.width, y);
        CTX.stroke();
    }
}


function createShifters()
{
    let xBuffer = 0;
    let layerShifterBuffer = 0;
    for (let x = 0; x < tabsCount + layerShifterBuffer; x++)
    {
        if ((gridSize * x) - (CANVAS.width * gridHeight) >= CANVAS.width)
        {
            xBuffer = x;
            gridHeight++;
        }
        
        // TODO if there are 1 or 2 tabs in last row, handle differently. since you wouldn't be able to access those two
        if (gridHeight > 0 && x - (xBuffer) == Math.floor(MAX_SHIFTER_LENGTH / 2) && x + 1 < tabsCount + layerShifterBuffer)
        {
            shifters.push(new ShifterModule(x - xBuffer, gridHeight, x == currentTab, undefined));
            layerShifterBuffer++;
        }
        else
        {
            shifters.push(new ShifterModule(x - xBuffer, gridHeight, x == currentTab, x - layerShifterBuffer));
        }
    }
}

function attachEventListener()
{
    CANVAS.addEventListener("mousemove", e => {
        if (e.buttons <= 0)
        {
            return;
        }

        let boundingRect = CANVAS.getBoundingClientRect();

        let x = Math.floor(Math.abs(e.clientX - boundingRect.x) / gridSize);
        let y = Math.floor(Math.abs(e.clientY - boundingRect.y) / gridSize);

        let oldShifter = undefined;
        let newShifter = undefined;

        for (const shifter of shifters)
        {
            if (shifter.active)
            {
                oldShifter = shifter;
            }

            if (shifter.x === x && shifter.y === y)
            {
                newShifter = shifter;
            }
        }

        if (!oldShifter || !newShifter)
        {
            return;
        }

        if (oldShifter.y !== newShifter.y - 1 && oldShifter.y !== newShifter.y + 1)
        {
            return;
        }

        if (oldShifter.tabIndex !== undefined && oldShifter.y < gridHeight)
        {
            if (newShifter.y > oldShifter.y && newShifter.y % 2 == 0)
            {
                return;
            }

            if (newShifter.y < oldShifter.y && oldShifter.y % 2 == 0)
            {
                return;
            }
        }

        oldShifter.active = false;
        newShifter.active = true;
    });
}

function drawShifters()
{
    for (const shifter of shifters)
    {

        // SLOT TOP
        if (shifter.y !== gridHeight && shifter.y % 2 === 0)
        {
            CTX.fillStyle = "green";
            CTX.fillRect(shifter.x * gridSize + gridSize / 2 - SLOT_WIDTH / 2, shifter.y * gridSize + gridSize / 2, SLOT_WIDTH, gridSize / 2);

            if (shifter.x > 0)
            {
                CTX.fillRect(shifter.x * gridSize, shifter.y * gridSize + gridSize - SLOT_WIDTH / 2, gridSize / 2, SLOT_WIDTH / 2);
            }

            // TODO change to max width
            if (shifter.x < 4)
            {
                CTX.fillRect(shifter.x * gridSize + gridSize / 2, shifter.y * gridSize + gridSize - SLOT_WIDTH / 2, gridSize / 2, SLOT_WIDTH / 2);
            }
        }

        // SLOT BOTTOM
        if (shifter.y !== 0 && shifter.y % 2 > 0)
        {
            CTX.fillStyle = "green";
            CTX.fillRect(shifter.x * gridSize + gridSize / 2 - SLOT_WIDTH / 2, shifter.y * gridSize, SLOT_WIDTH, gridSize / 2)

            if (shifter.x > 0)
            {
                CTX.fillRect(shifter.x * gridSize, shifter.y * gridSize, gridSize / 2, SLOT_WIDTH / 2);
            }

            // TODO change to max width
            if (shifter.x < 4)
            {
                CTX.fillRect(shifter.x * gridSize + gridSize / 2, shifter.y * gridSize, gridSize / 2, SLOT_WIDTH / 2);
            }
        }

        // layerShift
        if (shifter.tabIndex === undefined)
        {
            CTX.fillStyle = "green";
            CTX.fillRect(shifter.x * gridSize + gridSize / 2 - SLOT_WIDTH / 2, shifter.y * gridSize, SLOT_WIDTH, gridSize)
        }

        // TEXT
        if (shifter.tabIndex !== undefined)
        {
            CTX.fillStyle = "black";
            CTX.fillText(shifter.tabIndex, shifter.x * gridSize + gridSize / 2 - 12, shifter.y * gridSize + gridSize / 2 + 12);
        }

        // KNOB
        if (shifter.active)
        {
            CTX.fillStyle = "red";
            CTX.beginPath();
            CTX.arc(shifter.x * gridSize + gridSize / 2, shifter.y * gridSize + 10 + gridSize / 2, 30, 0, 2 * Math.PI);
            CTX.fill();

        }
    }
}

async function initDrawLoop()
{
    while (true)
    {
        drawBackground();
        drawShifters();
        console.log("drawLoop triggered");
        await new Promise(r => setTimeout(r, 200));
    }
}

createShifters();
attachEventListener();
initDrawLoop();



//console.table(shifters)
