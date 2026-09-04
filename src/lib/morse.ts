export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
}

/** Text → morseovka. Slova odděluje " / ", písmena mezera. */
export function toMorse(text: string): string {
  return text
    .toUpperCase()
    .split(' ')
    .map((word) =>
      word
        .split('')
        .map((ch) => MORSE[ch] ?? '')
        .filter(Boolean)
        .join(' '),
    )
    .join(' / ')
}

export interface MorseUnit {
  on: boolean
  /** délka v jednotkách (tečka = 1) */
  units: number
}

/** Rozloží morseovku na sekvenci svítí/nesvítí. */
export function toTimeline(text: string): MorseUnit[] {
  const out: MorseUnit[] = []
  const words = text.toUpperCase().split(' ')
  words.forEach((word, wi) => {
    const letters = word.split('').map((ch) => MORSE[ch]).filter(Boolean)
    letters.forEach((code, li) => {
      code.split('').forEach((sym, si) => {
        out.push({ on: true, units: sym === '.' ? 1 : 3 })
        if (si < code.length - 1) out.push({ on: false, units: 1 })
      })
      if (li < letters.length - 1) out.push({ on: false, units: 3 })
    })
    if (wi < words.length - 1) out.push({ on: false, units: 7 })
  })
  return out
}
