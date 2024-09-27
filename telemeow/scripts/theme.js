function palette(baseColor) {
const { hue, saturation, lightness } = hexToHSL(baseColor);
const clampedLightness = clamp(lightness, 18, 70);
const isDarkTheme = clampedLightness < 50;
const textLightness = 85;
const linkLightness = 70;
const linkColor = hslToHex(hue, saturation, linkLightness);
const textColor = hslToHex(hue, saturation, textLightness);
const themeStyles = [`--app-text: ${textColor};`, `--app-link: ${linkColor};`].concat(
    Array.from({ length: 9 }, (_, index) => {
const lightnessOffset = (isDarkTheme ? 10 : 5) * index;
const newLightness = clamp(clampedLightness + lightnessOffset - 40, 5, 95);
const newSaturation = clamp(saturation - (index * (isDarkTheme ? 3 : 7)), 20, 100);
const newColor = hslToHex(hue, newSaturation, newLightness);
return `--app-${(index * 100) + 100}: ${newColor};`;
})).join("\n");
return themeStyles;
}
function hexToHSL(hex) {
const r = parseInt(hex.substring(0, 2), 16) / 255;
const g = parseInt(hex.substring(2, 4), 16) / 255;
const b = parseInt(hex.substring(4, 6), 16) / 255;
const cMax = Math.max(r, g, b);
const cMin = Math.min(r, g, b);
const delta = cMax - cMin;
let hue = 0, saturation = 0, lightness = (cMax + cMin) / 2;
if (delta !== 0) {
saturation = delta / (1 - Math.abs(2 * lightness - 1));
if (cMax === r) hue = ((g - b) / delta) % 6;
else if (cMax === g) hue = (b - r) / delta + 2;
else hue = (r - g) / delta + 4;
hue *= 60;
if (hue < 0) hue += 360;
}
return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}
function hslToHex(h, s, l) {
s /= 100;
l /= 100;
const c = (1 - Math.abs(2 * l - 1)) * s;
const x = c * (1 - Math.abs((h / 60) % 2 - 1));
const m = l - c / 2;
let r = 0, g = 0, b = 0;
if (h >= 0 && h < 60) { r = c; g = x; b = 0; } else if (h >= 60 && h < 120) { r = x; g = c; b = 0; } else if (h >= 120 && h < 180) { r = 0; g = c; b = x; } else if (h >= 180 && h < 240) { r = 0; g = x; b = c; } else if (h >= 240 && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
return `#${r}${g}${b}`;
}
function clamp(value, min, max) {
return Math.min(Math.max(value, min), max);
}