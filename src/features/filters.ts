export interface FilterSettings {
  brightness: number // 0..2 (1 default)
  contrast: number // 0..2 (1 default)
  saturation: number // 0..2 (1 default)
  grayscale: number // 0..1
  sepia: number // 0..1
  invert: number // 0..1
  blur: number // px
} 

export function cssFilterString(settings: Partial<FilterSettings>) {
  const s = {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    blur: 0,
    ...settings,
  }
  return `brightness(${s.brightness}) contrast(${s.contrast}) saturate(${s.saturation}) grayscale(${s.grayscale}) sepia(${s.sepia}) invert(${s.invert}) blur(${s.blur}px)`
}
