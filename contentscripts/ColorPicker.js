let idDataMap = new Map();
let currentId = "";
let updateFunctions = [];
let btnInputList = [];

class DataUtils
{
    static getCurrent = () =>
    {
        return idDataMap.get(currentId)
    }

    static generateId = () =>
    {
        let id = "id" + Math.random().toString(16).slice(2);

        if (currentId === "")
        {
            currentId = id
        }

        return id
    }

    static createData = id =>
    {
        let data = {
            hue : 0,
            light : 0,
            saturation : 0,
            input : undefined,
            btnStyleObj : undefined
        };

        idDataMap.set(id, data);

        return data;
    }
}

class ColorPickerUtils
{
    static repaint = () =>
    {
        updateFunctions.forEach(f => f());
        let dataSet = DataUtils.getCurrent();

        let rgb = ColorUtils.hslToRgb(dataSet.hue, dataSet.saturation, dataSet.light)

        if (dataSet.input)
        {
            dataSet.input.value = `${Math.floor(rgb[0])}${Math.floor(rgb[1])}${Math.floor(rgb[2])}`;
        }

        if (dataSet.btnStyleObj)
        {
            dataSet.btnStyleObj.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        }
    }

}

class ColorPickerFactory
{
    static addColorCanvas = div =>
    {
        let canvas = document.createElement("canvas");
        div.appendChild(canvas);

        canvas.width = 1000;
        canvas.height = 1000;

        canvas.classList.add("color_canvas");

        function updateFunc()
        {
            let dataSet = DataUtils.getCurrent();
            let ctx = canvas.getContext("2d");

            for (let x = 0; x <= 100; x++)
            {
                for (let y = 0; y <= 100; y++)
                {
                    let hsl = `hsl(${dataSet.hue}, ${x}%, ${100 - y}%)`
                    ctx.fillStyle = hsl;
                    ctx.strokeStyle = hsl;
                    ctx.fillRect(x*10, y*10, 10, 10);
                }
            }

            ctx.fillStyle = "#000000";
            ctx.strokeStyle = "#000000";
            ctx.fillRect(dataSet.saturation * 10, (100 - dataSet.light) * 10, 10, 20)
        }

        let isMouseDown = false;

        canvas.addEventListener("mousedown", () => isMouseDown = true);
        canvas.addEventListener("mouseup", () => isMouseDown = false);

        canvas.addEventListener("mousemove", e =>
        {
            if (!isMouseDown) return;

            let dataSet = DataUtils.getCurrent();
            let rect = canvas.getBoundingClientRect();
            dataSet.saturation = Math.floor((e.clientX - rect.left) / 4);
            dataSet.light = 100 - Math.floor((e.clientY - rect.top) / 2);

            ColorPickerUtils.repaint();
        });

        updateFunctions.push(updateFunc);
    }

    static addHueCanvas = div =>
    {
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
            let dataSet = DataUtils.getCurrent();

            let ctx = canvas.getContext("2d");
            for (let i = 0; i <= 358; i++)
            {
                let hsl = `hsl(${i}, 100%, 50%)`
                ctx.fillStyle = hsl;
                ctx.strokeStyle = hsl;
                ctx.strokeRect(i, 0, i+1, 1);
            }

            ctx.fillStyle = "#000000";
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(dataSet.hue, 0, 1, 1);

            colorDispl.style.background = `hsl(${dataSet.hue}, ${dataSet.saturation}%, ${dataSet.light}%)`;
        }

        let isMouseDown = false;

        canvas.addEventListener("mousedown", () => isMouseDown = true);
        canvas.addEventListener("mouseup", () => isMouseDown = false);

        canvas.addEventListener("mousemove", e =>
        {
            if (!isMouseDown) return;
            let dataSet = DataUtils.getCurrent();

            let rect = canvas.getBoundingClientRect()
            dataSet.hue = e.clientX - rect.left; 

            ColorPickerUtils.repaint();
        })

        updateFunctions.push(updateFunc);
    }

    static addControlDiv = div =>
    {
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
            let dataSet = DataUtils.getCurrent();
            let rgb = ColorUtils.hslToRgb(dataSet.hue, dataSet.saturation, dataSet.light);

            elements[0].value = Math.floor(rgb[0])
            elements[1].value = Math.floor(rgb[1])
            elements[2].value = Math.floor(rgb[2])
        }

        elements.forEach(el=> {
            el.type = "text";
            el.pattern = "[0-9]*";
            el.classList.add("color_picker_input")
            rgbDiv.append(el);

            el.addEventListener("input", () => {
                if (!el.checkValidity())
                {
                    return;
                }

                if (el.value.startsWith("0"))
                {
                    el.value = el.value.slice(1, el.value.length);
                }
                if (el.value > 255)
                {
                    el.value = 255;
                }

                let dataSet = DataUtils.getCurrent();
                let hsl = ColorUtils.rgbToHsl(elements[0].value, elements[1].value, elements[2].value)

                dataSet.hue = hsl[0]
                dataSet.saturation = hsl[1]
                dataSet.light = hsl[2]

                ColorPickerUtils.repaint();
            })
        })

        updateFunctions.push(updateFunc);
    }

    static newInstance = () =>
    {
        let div = document.createElement("div");
        div.id = "useless_window_pallete";

        ColorPickerFactory.addColorCanvas(div);
        ColorPickerFactory.addHueCanvas(div);
        ColorPickerFactory.addControlDiv(div);

        ColorPickerUtils.repaint();

        return div;
    }
}

class ColorPicker
{
    getCoords = elem =>
    {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;

        var top  = box.top +  scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;

        return {
            top: Math.round(top),
            left: Math.round(left),
            height: box.height,
            width: box.width,
        }
    }

    addButton = input =>
    {
        let id = DataUtils.generateId();
        let data = DataUtils.createData(id);

        let rect = this.getCoords(input)

        let left = rect.left + rect.width;
        let top = rect.top + rect.height;

        let btn = document.createElement("div");
        btn.classList.add("useless_input_btn")

        btnInputList.push({button: btn, input: input});


        let btnColor = document.createElement("div");
        btnColor.classList.add("useless_window_btn_color");

        btn.appendChild(btnColor);

        document.body.appendChild(btn);

        btn.addEventListener("click", e =>
        {
            let pallete = document.getElementById("useless_window_pallete");

            if (pallete.style.visibility === "visible")
            {
                let dataSet = DataUtils.getCurrent();
                pallete.style.visibility = "hidden";

                let rgb = ColorUtils.hslToRgb(dataSet.hue, dataSet.saturation, dataSet.light)

                dataSet.input.setAttribute("data_useless_window_red", rgb[0]);
                dataSet.input.setAttribute("data_useless_window_green", rgb[1]);
                dataSet.input.setAttribute("data_useless_window_blue", rgb[2]);
                return;
            }

            pallete.style.visibility = "visible";

            pallete.style.left = left + "px";
            pallete.style.top = top + "px";
            
            currentId = id;
            data.input = input;
            data.btnStyleObj = btnColor.style;

            let red = input.getAttribute("data_useless_window_red");
            let green = input.getAttribute("data_useless_window_green");
            let blue = input.getAttribute("data_useless_window_blue");

            if (red && green && blue)
            {
                let hsl = ColorUtils.rgbToHsl(red, green, blue)
                data.hue = hsl[0];
                data.saturation = hsl[1];
                data.light = hsl[2];
            }

            ColorPickerUtils.repaint()
        });
    }

    setLocations = () =>
    {
        btnInputList.forEach(obj =>
        {
            let rect = this.getCoords(obj.input)
            obj.button.style.width = rect.height - 8 + 4 + "px";
            obj.button.style.height = rect.height - 8 + "px";
            obj.button.style.top = rect.top + 4 + "px";
            obj.button.style.left = rect.left + rect.width - rect.height - 2 + "px";
        })
    }

    add = () =>
    {
        for (const i of document.getElementsByTagName("input"))
        {
            if (i.classList.contains("color_picker_input") || !["text", "number"].includes(i.type) || i.disabled)
            {
                continue;
            }
            
            this.addButton(i)
        }

        this.setLocations();


        let div = ColorPickerFactory.newInstance();
        document.body.appendChild(div)
    }

    remove = () =>
    {
        let dialog = document.getElementById("useless_window_pallete");
        if (dialog) dialog.remove();

        let buttons = [];

        do
        {
            for (let btn of buttons)
            {
                btn.remove();
            }

            buttons = document.getElementsByClassName("useless_input_btn");
        }
        while (buttons.length > 0);
    }
}
