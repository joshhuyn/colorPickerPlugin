window.useless_window = {
    idDataMap : new Map(),
    currentId : "",
    updateFunctions : [],
    btnInputList : [],
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
            let hex = window.useless_window.colorutils.hslToHex(h, s, l);
            return window.useless_window.colorutils.hexToRgb(hex);
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

            canvas.classList.add("color_canvas");

            function updateFunc()
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
                        ctx.strokeRect(x, y, 1, 1);
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

                window.useless_window.handler.repaint();
            });

            return updateFunc;
        },
        addHueCanvas : div => {

            let colorDispl = document.createElement("div");
            colorDispl.classList.add("hue_color_preview");

            let canvas = document.createElement("canvas");
            canvas.classList.add("hue_wrapper_canvas")
            canvas.width = 358;
            canvas.height = 1;

            let wrapper = document.createElement("div");
            wrapper.classList.add("hue_wrapper")

            wrapper.appendChild(colorDispl);
            wrapper.appendChild(canvas);
            

            div.appendChild(wrapper)

            function updateFunc()
            {
                let dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId)

                let ctx = canvas.getContext("2d");
                for (let i = 0; i <= 358; i++)
                {
                    let hex = window.useless_window.colorutils.hslToHex(i, 100, 50);
                    ctx.fillStyle = hex;
                    ctx.strokeStyle = hex;
                    ctx.strokeRect(i, 0, i+1, 1);
                }

                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#000000";
                ctx.strokeRect(dataSet.hue, 0, 1, 1);

                colorDispl.style.background = `hsl(${dataSet.hue}, ${dataSet.saturation}%, ${100 - dataSet.light}%)`;
            }

            canvas.addEventListener("mousedown", e => {
                let dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId)

                let rect = canvas.getBoundingClientRect()
                dataSet.hue = e.clientX - rect.left; 

                window.useless_window.handler.repaint();
            })

            return updateFunc;
        },
        addControlDiv : div => {
            let rgbDiv = document.createElement("div");
            rgbDiv.classList.add("color_preview")
            
            div.appendChild(rgbDiv);
            
            let textNode = document.createElement("div");
            textNode.classList.add("rgb_text")
            textNode.innerText = "RGB:";

            rgbDiv.appendChild(textNode);

            let elements = []
            for (let i = 0; i < 3; i++)
            {
                elements.push(document.createElement("input"))
            }

            function updateFunc()
            {
                dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId);
                let rgb = window.useless_window.colorutils.hslToRgb(dataSet.hue, dataSet.saturation, 100 - dataSet.light);

                elements[0].value = rgb.r
                elements[1].value = rgb.g
                elements[2].value = rgb.b
            }

            elements.forEach(el=> {
                el.type = "text";
                el.pattern = "([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])";
                el.classList.add("color_picker_input")
                rgbDiv.append(el);

                el.addEventListener("input", () => {
                    if (!el.checkValidity())
                    {
                        return;
                    }

                    let dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId);
                    let hsl = window.useless_window.colorutils.rgbToHsl(elements[0].value, elements[1].value, elements[2].value)

                    dataSet.hue = hsl[0]
                    dataSet.saturation = hsl[1]
                    dataSet.light = hsl[2]

                    window.useless_window.handler.repaint();
                })
            })

            return updateFunc;
        },
        newInstance : () => {
            let div = document.createElement("div");
            div.id = "useless_window_pallete";

            updateFunction = window.useless_window.updateFunctions;

            updateFunction.push(window.useless_window.factory.addColorCanvas(div));
            updateFunction.push(window.useless_window.factory.addHueCanvas(div));
            updateFunction.push(window.useless_window.factory.addControlDiv(div));

            window.useless_window.handler.repaint();

            return div;
        },
    },
    handler :
    {
        init : e =>
        {
            for (const i of document.getElementsByTagName("input"))
            {
                if (i.classList.contains("color_picker_input"))
                {
                    continue;
                }
                
                window.useless_window.handler.addButton(i)
            }

            window.useless_window.handler.setLocations();

            window.useless_window.handler.addDialog()
        },
        addButton : (i) =>
        {
            let id = window.useless_window.handler.generateId()
            let data = window.useless_window.handler.createData(id)

            let rect = i.getBoundingClientRect()

            let left = rect.right;
            let top = rect.bottom;

            let btn = document.createElement("div");
            btn.classList.add("usless_input_btn")

            window.useless_window.btnInputList.push({button: btn, input: i});


            let btnColor = document.createElement("div");
            btnColor.classList.add("useless_window_btn_color");

            btn.appendChild(btnColor);

            document.body.appendChild(btn);

            btn.addEventListener("click", e =>
            {
                let pallete = document.getElementById("useless_window_pallete");

                if (pallete.style.visibility === "visible")
                {
                    let dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId)
                    pallete.style.visibility = "hidden";

                    let rgb = window.useless_window.colorutils.hslToRgb(dataSet.hue, dataSet.saturation, dataSet.light)

                    dataSet.input.setAttribute("data_useless_window_red", rgb.r);
                    dataSet.input.setAttribute("data_useless_window_green", rgb.g);
                    dataSet.input.setAttribute("data_useless_window_blue", rgb.b);
                    return;
                }

                pallete.style.visibility = "visible";

                pallete.style.left = left + "px";
                pallete.style.top = top + "px";
                
                window.useless_window.currentId = id;
                data.input = i;
                data.btnStyleObj = btnColor.style;

                let red = i.getAttribute("data_useless_window_red");
                let green = i.getAttribute("data_useless_window_green");
                let blue = i.getAttribute("data_useless_window_blue");

                if (red && green && blue)
                {
                    let hsl = window.useless_window.colorutils.rgbToHsl(red, green, blue)
                    data.hue = hsl[0];
                    data.saturation = hsl[1];
                    data.light = hsl[2];
                }

                window.useless_window.handler.repaint()
            });
        },
        setLocations : () =>
        {
            window.useless_window.btnInputList.forEach(obj => {

                let rect = obj.input.getBoundingClientRect()
                console.log(rect);
                obj.button.style.width = rect.height - 8 + 4 + "px";
                obj.button.style.height = rect.height - 8 + "px";
                obj.button.style.top = rect.bottom + document.body.scrollTop - rect.height + 4 - 1 + "px";
                obj.button.style.left = rect.right + document.body.scrollLeft - rect.height + 4 - 4 - 1 + "px";
            })
        },
        generateId : () =>
        {
            let id = "id" + Math.random().toString(16).slice(2);

            if (window.useless_window.currentId === "")
            {
                window.useless_window.currentId = id
            }

            return id
        },
        addDialog : () =>
        {
            let div = window.useless_window.factory.newInstance();
            document.body.appendChild(div)
        },
        createData : id =>
        {
            let data = {
                hue : 0,
                light : 0,
                saturation : 0,
                input : undefined,
                btnStyleObj : undefined
            };

            window.useless_window.idDataMap.set(id, data);

            return data;
        },
        repaint : () =>
        {
            window.useless_window.updateFunctions.forEach(f => f())
            let dataSet = window.useless_window.idDataMap.get(window.useless_window.currentId);

            let rgb = window.useless_window.colorutils.hslToRgb(dataSet.hue, dataSet.saturation, 100 - dataSet.light)

            if (dataSet.input)
            {
                dataSet.input.value = `${rgb.r}${rgb.g}${rgb.b}`;
            }

            if (dataSet.btnStyleObj)
            {
                dataSet.btnStyleObj.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            }
        }
    }
}

window.addEventListener("resize", window.useless_window.handler.setLocations);
setTimeout(window.useless_window.handler.init, 1000)
