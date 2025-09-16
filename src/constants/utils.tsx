export function generateContrastingColors(count: number): string[] {
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    // Spread hues evenly around the circle
    const hue = Math.floor((360 / count) * i);
    const saturation = 80; // keep colors vivid
    const lightness = 60;  // keep them bright

    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}