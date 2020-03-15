export function hexToRGB(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || [];
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return { r, g, b };
}

// Simple "lighten" function that lowers opacity
export function lighten(hex: string) {
  const { r, g, b } = hexToRGB(hex);
  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}
