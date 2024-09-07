window.useless_window = {
    idDataMap : new Map(),
    currentId : "",
    colorutils : {
        hslToHex : (h, s, l) =>
        {
          l /= 100;
          const a = s * Math.min(l, 1 - l) / 100;
          const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
          };
          return `#${f(0)}${f(8)}${f(4)}`;
        },
        hexToRgb : (hex) =>
        {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        hslToRgb : (h, s, l) =>
        {
            return window.useless_window.colorutils.hslToHex(h, s, l);
        },
        // color death convertion
        rgbToHsl : (r, g, b) => {
            r /= 255;
            g /= 255;
            b /= 255;
            const l = Math.max(r, g, b);
            const s = l - Math.min(r, g, b);
            let h = 0

            if (s)
            {
                if (l === r)
                {
                    h = (g - b) / s
                }
                else if (l === g)
                {
                    h = 2 + (b - r) / s
                }
                else
                {
                    h = 4 + (r - g) / s
                }
            }

            return [
                60 * h < 0 ? 60 * h + 360 : 60 * h,
                100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
                (100 * (2 * l - s)) / 2,
            ];
        },
    },
    factory : {
        addColorCanvas : div => {
            let canvas = document.createElement("canvas");
            div.appendChild(canvas);

            canvas.width = 100;
            canvas.height = 100;

            let canvasStyle = canvas.style;
            canvasStyle.width = "400px";
            canvasStyle.height = "200px";
            canvasStyle.border = "solid black 2px";

            updateFunc = () =>
            {
                dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId)
                let ctx = canvas.getContext("2d");

                for (let x = 0; x <= 100; x++)
                {
                    for (let y = 0; y <= 100; y++)
                    {
                        let hex = window.useless_window.colorutils.hslToHex(dataSet.hue, x, 100 - y);
                        ctx.fillStyle = hex;
                        ctx.strokeStyle = hex;
                        ctx.strokeRect(x, y, x + 1, y + 1);
                    }
                }

                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#000000";
                ctx.strokeRect(dataSet.saturation, dataSet.light, 1, 1)
            }

            canvas.addEventListener("mousedown", e =>
            {
                dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId)
                let rect = canvas.getBoundingClientRect();
                dataSet.light = Math.floor((e.clientY - rect.top) / 2);
                dataSet.saturation = Math.floor((e.clientX - rect.left) / 4);
                
                updateFunc();
            });

            return updateFunc;
        },
        addControlDiv : div => {
            let rgbDiv = document.createElement("div");
            rgbDiv.style.display = "flex";
            rgbDiv.style.justifyContent = "center";
            rgbDiv.style.alignItems = "center";
            rgbDiv.style.width = "300px";
            
            div.appendChild(rgbDiv);

            let elements = []
            for (let i = 0; i < 3; i++)
            {
                elements.push(document.createElement("input"))
            }

            updateFunc = () =>
            {
                dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId);
                let rgb = window.useless_window.colorutils.hslToRgb(dataSet.hue, dataSet.saturation, dataSet.light);

                elements[0].value = rgb.r
                elements[1].value = rgb.b
                elements[2].value = rgb.g
            }

            elements.forEach(el=> {
                el.type = "number";
                el.style.width = "33%";
                rgbDiv.append(el);

                el.addEventListener("blur", () => {
                    let dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId);
                    let hsl = window.useless_window.colorutils.rgbToHsl(elements[0].value, elements[1].value, elements[2].value)

                    dataSet.hue = hsl[0]
                    dataSet.saturation = hsl[1]
                    dataSet.light = hsl[2]
                })

                updateFunc();
            })

            return updateFunc;
        },
        newInstance : () => {
            let div = document.createElement("div");
            div.id = "testInput";

            let divStyle = div.style;
            divStyle.visibility = "visible";
            divStyle.position = "absolute";
            divStyle.top = 0 + "px";
            divStyle.left = 0 + "px";
            divStyle.padding = "10px";
            divStyle.backgroundColor = "yellow";
            divStyle.display = "flex";
            divStyle.justifyContent = "center";
            divStyle.alignItems = "center";
            divStyle.flexDirection = "column";

            updateFunction = []

            updateFunction.push(window.useless_window.factory.addColorCanvas(div));
            updateFunction.push(window.useless_window.factory.addControlDiv(div));

            updateFunction.forEach(f => f())

            //this.updateRGB();
            
            console.log(div);

            return div;
        },
    },
    handler :
    {
        init : e =>
        {
            window.useless_window.handler.addDialog()
            return;
            for (const i of document.getElementsByTagName("input"))
            {
                if (i.type != "text")
                {
                    continue;
                }

                console.log(i)
                addDialog()
            }
        },
        addDialog : () =>
        {
            console.log("test")
            window.useless_window.handler.createData("test")
            window.useless_window.currentId = "test"

            let div = window.useless_window.factory.newInstance();
            document.body.appendChild(div)
        },
        createData : id =>
        {
            window.useless_window.idDataMap.set(id,
            {
                hue : 0,
                light : 0,
                saturation : 0,
            })
        }
    }
}

function attach(input)
{
    class DialogFactory {
        hue = 100;
        light = 0;
        saturation = 0;

        hueCanvas = undefined;
        colorCanvas = undefined;

        btn = undefined;

        baseInput = undefined;

        inputR = undefined;
        inputG = undefined;
        inputB = undefined;

        constructor(btn, input)
        {
            this.btn = btn;
            this.baseInput = input;

            this.inputR = document.createElement("input");
            this.inputG = document.createElement("input");
            this.inputB = document.createElement("input");
        }

        updateRGB = () =>
        {
            console.log(this.hue, this.light, this.saturation)
            let hex = ColorUtils.hslToHex(this.hue, this.light, this.saturation);
            let rgb = ColorUtils.hexToRgb(hex);
            this.inputR.value = rgb.r;
            this.inputG.value = rgb.g;
            this.inputB.value = rgb.b;

            this.baseInput.value = rgb.r + "" + rgb.g + "" + rgb.b;

            this.btn.getElementsByTagName("div")[0].style.backgroundColor = hex;
        }

        repaintHueCanvas = () =>
        {
            let ctx = this.hueCanvas.getContext("2d");
            for (let i = 0; i <= 358; i++)
            {
                let hex = ColorUtils.hslToHex(i, 100, 50);
                ctx.fillStyle = hex;
                ctx.strokeStyle = hex;
                ctx.strokeRect(i, 0, i+1, 1);
            }

            ctx.fillStyle = "#000000";
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(this.hue, 0, 1, 1);
        }

        createHueCanvas = () =>
        {
            let canvas = document.createElement("canvas");
            canvas.width = 358;
            canvas.height = 1;
            canvas.style.width = "358px";
            canvas.style.height = "20px";

            this.hueCanvas = canvas;
            this.repaintHueCanvas(canvas);

            canvas.addEventListener("mousedown", e => {
                let rect = canvas.getBoundingClientRect()
                this.hue = e.clientX - rect.left; 
                this.repaintColorCanvas();
                this.repaintHueCanvas();

                this.updateRGB();
            })

            return canvas;
        }

        createControlDiv = () =>
        {
            let controlDiv = document.createElement("div");
            controlDiv.style.border = "solid green 2px";

            let hueCanvas = this.createHueCanvas();
            controlDiv.appendChild(hueCanvas);
            
            let rgbDiv = document.createElement("div");
            rgbDiv.style.display = "flex";
            rgbDiv.style.justifyContent = "center";
            rgbDiv.style.alignItems = "center";
            rgbDiv.style.width = "300px";

            this.inputR.type = "number";
            this.inputR.style.width = "33%";
            rgbDiv.append(this.inputR);

            this.inputG.type = "number";
            this.inputG.style.width = "33%";
            rgbDiv.append(this.inputG);

            this.inputB.type = "number";
            this.inputB.style.width = "33%";
            rgbDiv.append(this.inputB);

            controlDiv.appendChild(rgbDiv);

            return controlDiv;
        }

        newInstance = (id, left, top) =>
        {
            let div = document.createElement("div");
            div.id = id;

            let divStyle = div.style;
            divStyle.visibility = "hidden";
            divStyle.position = "absolute";
            divStyle.top = top + "px";
            divStyle.left = left + "px";
            divStyle.padding = "10px";
            divStyle.backgroundColor = "yellow";
            divStyle.display = "flex";
            divStyle.justifyContent = "center";
            divStyle.alignItems = "center";
            divStyle.flexDirection = "column";

            let canvas = this.createColorCanvas();
            div.appendChild(canvas);

            let controlDiv = this.createControlDiv();
            div.appendChild(controlDiv);

            this.updateRGB();

            return div;
        }
    }

    class ColorUtils {
        static hslToHex = (h, s, l) =>
        {
          l /= 100;
          const a = s * Math.min(l, 1 - l) / 100;
          const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
          };
          return `#${f(0)}${f(8)}${f(4)}`;
        }

        static hexToRgb = (hex) =>
        {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        static hslToRgb = (h, s, l) =>
        {
            return this.hexToRgb(this.hslToHex(h, s, l));
        }
    }

    let rect = input.getBoundingClientRect();

    const id = "color_picker_something_" + Math.floor(Math.random() * 100);

    let left = rect.left + rect.width;
    let top = rect.top + rect.height;

    let btn = createBtn(id, left, top);
    let factory = new DialogFactory(btn, input);

    let div = factory.newInstance(id, left, top);

    document.body.appendChild(div)
    document.body.appendChild(btn)
}

function createBtn(id, left, top)
{
    let wrapper = document.createElement("div");
    let btn = document.createElement("div");

    btn.style.width = "10px";
    btn.style.height = "10px";
    btn.style.backgroundColor = "hsl(100, 100, 0)";

    wrapper.style.padding = "2px";
    wrapper.style.position = "absolute";
    wrapper.style.left = left - 20 + "px";
    wrapper.style.top = top - 20 + "px";
    wrapper.style.border = "solid 1px black"

    wrapper.appendChild(btn);

    wrapper.addEventListener("click", () => {
        console.log("click")
        let colorPicker = document.getElementById(id);

        if (colorPicker.style.visibility == "visible")
        {
            colorPicker.style.visibility = "hidden";
        }
        else
        {
            colorPicker.style.visibility = "visible";
        }
    });

    return wrapper;
}

setTimeout(window.useless_window.handler.init, 1000)
