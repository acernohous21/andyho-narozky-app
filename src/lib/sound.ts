/**
 * Jednoduché syntetizované zvuky přes Web Audio API. Žádné soubory.
 */
let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean): void {
  enabled = on
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Zavolat při prvním uživatelském kliknutí, aby se odemkl audio context (hlavně iOS). */
export function unlockAudio(): void {
  const c = getCtx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  g.gain.value = 0
  o.connect(g).connect(c.destination)
  o.start()
  o.stop(c.currentTime + 0.01)
}

function tone(freq: number, startOffset: number, duration: number, type: OscillatorType = 'sine', volume = 0.18): void {
  const c = getCtx()
  if (!c || !enabled) return
  const t0 = c.currentTime + startOffset
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(volume, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  o.connect(g).connect(c.destination)
  o.start(t0)
  o.stop(t0 + duration + 0.05)
}

function noise(startOffset: number, duration: number, volume = 0.08): void {
  const c = getCtx()
  if (!c || !enabled) return
  const t0 = c.currentTime + startOffset
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * duration), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = c.createBufferSource()
  src.buffer = buffer
  const g = c.createGain()
  g.gain.value = volume
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 1200
  src.connect(f).connect(g).connect(c.destination)
  src.start(t0)
}

export const sfx = {
  tap() {
    tone(660, 0, 0.05, 'triangle', 0.06)
  },
  tick() {
    tone(900 + Math.random() * 200, 0, 0.04, 'square', 0.04)
  },
  reveal() {
    tone(523, 0, 0.12, 'triangle', 0.15)
    tone(784, 0.1, 0.25, 'triangle', 0.15)
  },
  accept() {
    tone(392, 0, 0.12, 'sawtooth', 0.08)
    tone(523, 0.1, 0.12, 'sawtooth', 0.08)
    tone(659, 0.2, 0.3, 'sawtooth', 0.1)
  },
  success() {
    const seq: [number, number][] = [
      [523, 0],
      [659, 0.12],
      [784, 0.24],
      [1047, 0.36],
    ]
    seq.forEach(([f, t]) => tone(f, t, 0.35, 'triangle', 0.16))
    tone(784, 0.6, 0.5, 'triangle', 0.12)
    tone(1047, 0.6, 0.9, 'triangle', 0.14)
  },
  fail() {
    tone(330, 0, 0.25, 'sawtooth', 0.12)
    tone(262, 0.22, 0.3, 'sawtooth', 0.12)
    tone(196, 0.45, 0.6, 'sawtooth', 0.14)
    noise(0.05, 0.4, 0.05)
  },
  levelUp() {
    const seq: [number, number][] = [
      [392, 0],
      [523, 0.1],
      [659, 0.2],
      [784, 0.3],
      [1047, 0.4],
      [1319, 0.55],
    ]
    seq.forEach(([f, t]) => tone(f, t, 0.3, 'square', 0.07))
    tone(1047, 0.8, 1.2, 'triangle', 0.14)
    tone(1319, 0.8, 1.2, 'triangle', 0.1)
  },
  joker() {
    tone(880, 0, 0.08, 'sine', 0.12)
    tone(1175, 0.08, 0.08, 'sine', 0.12)
    tone(1568, 0.16, 0.2, 'sine', 0.12)
  },
  star(n: number) {
    tone(600 + n * 90, 0, 0.1, 'triangle', 0.1)
  },
  whoosh() {
    noise(0, 0.35, 0.06)
  },
  /** Morse pípnutí dané délky (sekundy). */
  beep(duration: number) {
    tone(720, 0, duration, 'sine', 0.2)
  },
  crash() {
    tone(150, 0, 0.3, 'sawtooth', 0.15)
    noise(0, 0.5, 0.12)
  },
  vroom() {
    tone(90, 0, 0.4, 'sawtooth', 0.08)
    tone(140, 0.2, 0.5, 'sawtooth', 0.08)
  },
}
