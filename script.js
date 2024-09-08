window.useless_window = {
    idDataMap : new Map(),
    currentId : "",
    updateFunctions : [],
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

            let canvasStyle = canvas.style;
            canvasStyle.width = "400px";
            canvasStyle.height = "200px";

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
            colorDispl.style.width = "36px";
            colorDispl.style.height = "36px";
            colorDispl.style.margin = "2px";
            colorDispl.style.border = "solid 1px #18122B";
            colorDispl.style.borderRadius = "100%";

            let canvas = document.createElement("canvas");
            canvas.width = 358;
            canvas.height = 1;
            canvas.style.width = "358px";
            canvas.style.height = "42px";

            let wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.justifyContent = "center"
            wrapper.style.alignItems = "center";

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
            rgbDiv.style.display = "flex";
            rgbDiv.style.justifyContent = "center";
            rgbDiv.style.alignItems = "center";
            rgbDiv.style.width = "400px";
            
            div.appendChild(rgbDiv);
            
            let textNode = document.createElement("div");
            textNode.style.margin = "5px"
            textNode.style.marginRight = "15px"
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
                let rgb = window.useless_window.colorutils.hslToRgb(dataSet.hue, dataSet.saturation, dataSet.light);

                elements[0].value = rgb.r
                elements[1].value = rgb.g
                elements[2].value = rgb.b
            }

            elements.forEach(el=> {
                el.type = "text";
                el.style.width = "33%";
                el.style.backgroundColor = "#443C68";
                el.style.border = "none";
                el.style.color = "#FFFFFF";
                el.classList.add("color_picker_input")
                rgbDiv.append(el);

                el.addEventListener("blur", () => {
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
            div.id = "testInput";

            let divStyle = div.style;
            divStyle.visibility = "hidden";
            divStyle.position = "absolute";
            divStyle.top = 0 + "px";
            divStyle.left = 0 + "px";
            divStyle.padding = "10px";
            divStyle.backgroundColor = "#393053";
            divStyle.display = "flex";
            divStyle.justifyContent = "center";
            divStyle.alignItems = "center";
            divStyle.flexDirection = "column";
            divStyle.border = "solid 1px #18122B";
            divStyle.borderRadius = "5px";

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
            window.useless_window.handler.addDialog()

            for (const i of document.getElementsByTagName("input"))
            {
                if (i.classList.contains("color_picker_input"))
                {
                    continue;
                }
                
                window.useless_window.handler.addButton(i)
            }
        },
        addButton : (i) =>
        {
            let id = window.useless_window.handler.generateId()
            let data = window.useless_window.handler.createData()

            let rect = i.getBoundingClientRect()

            console.log(rect)

            data.left = rect.right;
            data.top = rect.bottom;

            let btn = document.createElement("div");

            btn.style.position = "absolute"
            btn.style.backgroundColor = "black";
            btn.style.width = rect.height - 8 + "px";
            btn.style.height = rect.height - 8 + "px";
            btn.style.top = rect.bottom - rect.height + 4;
            btn.style.left = rect.right - rect.height + 4;

            document.body.appendChild(btn);


        },
        generateId : () =>
        {
            return "id" + Math.random().toString(16).slice(2)
        },
        addDialog : () =>
        {
            window.useless_window.handler.createData("test")
            window.useless_window.currentId = "test"

            let div = window.useless_window.factory.newInstance();
            document.body.appendChild(div)
        },
        createData : id =>
        {
            let data = {
                hue : 0,
                light : 0,
                saturation : 0,
                top : 0,
                left : 0,
            };

            window.useless_window.idDataMap.set(id, data);

            return data;
        },
        repaint : () =>
        {
            window.useless_window.updateFunctions.forEach(f => f())
        }
    }
}

setTimeout(window.useless_window.handler.init, 1000)
