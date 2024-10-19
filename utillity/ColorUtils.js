class ColorUtils
{
    static hslToRgb = (h, s, l) =>
    {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
          l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [255 * f(0), 255 * f(8), 255 * f(4)];
    }

    static rgbToHsl = (r, g, b) => 
    {
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
    }
}

