export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {
    /* ignore */
  }
}

export const haptic = {
  tap: () => vibrate(12),
  tick: () => vibrate(6),
  success: () => vibrate([30, 40, 30, 40, 80]),
  fail: () => vibrate([120, 60, 200]),
  levelUp: () => vibrate([40, 30, 40, 30, 40, 30, 160]),
  joker: () => vibrate([20, 30, 60]),
}
