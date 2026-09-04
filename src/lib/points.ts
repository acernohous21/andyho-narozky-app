import { CONFIG } from '../data/config'
import type { Level, Task } from '../types'

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function formatPoints(n: number): string {
  return round1(n).toLocaleString('cs-CZ')
}

export function formatMult(n: number): string {
  return '×' + n.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })
}

export function calcPoints(task: Task, stars: number, buddy: boolean): number {
  const base = stars * CONFIG.multipliers[task.difficulty]
  return round1(buddy ? base * CONFIG.buddyMultiplier : base)
}

export function maxPoints(task: Task, buddy: boolean): number {
  return calcPoints(task, 5, buddy)
}

/** Bonus, který přijde po dokončení, pokud nová série dosáhne násobku streakEvery. */
export function streakBonusFor(newStreak: number): number {
  return newStreak > 0 && newStreak % CONFIG.streakEvery === 0 ? CONFIG.streakBonus : 0
}

export function levelIndexFor(score: number): number {
  let idx = 0
  CONFIG.levels.forEach((lvl, i) => {
    if (score >= lvl.xp) idx = i
  })
  return idx
}

export function levelFor(score: number): Level {
  return CONFIG.levels[levelIndexFor(score)]
}

export function nextLevelFor(score: number): Level | null {
  const idx = levelIndexFor(score)
  return CONFIG.levels[idx + 1] ?? null
}

/** Progres v rámci aktuálního levelu 0..1 */
export function levelProgress(score: number): number {
  const cur = levelFor(score)
  const next = nextLevelFor(score)
  if (!next) return 1
  const span = next.xp - cur.xp
  return Math.min(1, Math.max(0, (score - cur.xp) / span))
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
