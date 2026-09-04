export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Task {
  id: string
  difficulty: Difficulty
  text: string
}

export type JokerType = 'reroll' | 'buddy' | 'shield'

export type Phase = 1 | 2

export interface ActiveQuest {
  taskId: string
  startedAt: number
  buddy: string | null
}

export interface CompletedEntry {
  taskId: string
  stars: number
  points: number
  bonus: number
  buddy: string | null
  at: number
}

export interface GiveUpEntry {
  taskId: string
  penalty: number
  shielded: boolean
  at: number
}

export interface StoryState {
  /** Index aktuálního kroku ve scénáři. */
  step: number
  /** Kolik bran (kapitol) parta odemkla. */
  gates: number
  /** Drobný perzistentní progres hlavolamů (např. kolo přiřazovačky). */
  vars: Record<string, number>
  startedAt: number | null
  finishedAt: number | null
}

export interface GameState {
  version: 2
  phase: Phase
  story: StoryState
  /** Vybrané questy pro Fázi II (id úkolů). Prázdné = draft ještě neproběhl. */
  draft: string[]
  draftDone: boolean
  active: ActiveQuest[]
  completed: CompletedEntry[]
  giveUps: GiveUpEntry[]
  score: number
  streak: number
  jokers: Record<JokerType, number>
  sound: boolean
  startedAt: number | null
  adminAdjust: number
}

export interface Level {
  xp: number
  title: string
  icon: string
}
