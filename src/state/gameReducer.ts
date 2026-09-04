import { CONFIG } from '../data/config'
import { STORY, gatesNeededFor } from '../data/story'
import { TASKS, TASK_BY_ID } from '../data/tasks'
import { calcPoints, round1, streakBonusFor } from '../lib/points'
import { pickRandom } from '../lib/random'
import type { Difficulty, GameState, JokerType, Phase, StoryState, Task } from '../types'

export function initialStory(): StoryState {
  return { step: 0, gates: 0, vars: {}, startedAt: null, finishedAt: null }
}

export function initialState(): GameState {
  return {
    version: 2,
    phase: 1,
    story: initialStory(),
    draft: [],
    draftDone: false,
    active: [],
    completed: [],
    giveUps: [],
    score: 0,
    streak: 0,
    jokers: { ...CONFIG.jokers },
    sound: true,
    startedAt: null,
    adminAdjust: 0,
  }
}

export type Action =
  // fáze I
  | { type: 'STORY_NEXT' }
  | { type: 'STORY_SET_VAR'; key: string; value: number }
  // fáze II
  | { type: 'SET_DRAFT'; taskIds: string[] }
  | { type: 'START_QUEST'; taskId: string }
  | { type: 'COMPLETE'; taskId: string; stars: number }
  | { type: 'GIVE_UP'; taskId: string; useShield: boolean }
  | { type: 'USE_REROLL'; taskId: string; newTaskId: string }
  | { type: 'USE_BUDDY'; taskId: string; buddy: string }
  | { type: 'TOGGLE_SOUND' }
  // admin
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'STORY_OPEN_GATE' }
  | { type: 'STORY_CLOSE_GATE' }
  | { type: 'STORY_SKIP_STEP' }
  | { type: 'STORY_GOTO'; step: number }
  | { type: 'STORY_RESET' }
  | { type: 'RESET_DRAFT' }
  | { type: 'ADJUST_SCORE'; delta: number }
  | { type: 'SET_JOKER'; joker: JokerType; count: number }
  | { type: 'RESTORE_JOKERS' }
  | { type: 'ADMIN_COMPLETE'; taskId: string; stars: number }
  | { type: 'UNCOMPLETE'; taskId: string }
  | { type: 'RETURN_TO_POOL'; taskId: string }
  | { type: 'RESET' }

// ---------- selectors ----------

export function isCompleted(state: GameState, taskId: string): boolean {
  return state.completed.some((c) => c.taskId === taskId)
}

export function isActive(state: GameState, taskId: string): boolean {
  return state.active.some((a) => a.taskId === taskId)
}

export function isDrafted(state: GameState, taskId: string): boolean {
  return state.draft.includes(taskId)
}

/** Andyho vybrané questy, které ještě nejsou splněné ani aktivní. */
export function pendingDraft(state: GameState, difficulty?: Difficulty): Task[] {
  return state.draft
    .map((id) => TASK_BY_ID[id])
    .filter((t): t is Task => !!t)
    .filter((t) => (!difficulty || t.difficulty === difficulty) && !isCompleted(state, t.id) && !isActive(state, t.id))
}

/** Úkoly mimo draft (pro výměnu žolíkem). */
export function undraftedTasks(state: GameState, difficulty: Difficulty): Task[] {
  return TASKS.filter((t) => t.difficulty === difficulty && !isDrafted(state, t.id) && !isCompleted(state, t.id))
}

export function pickReroll(state: GameState, difficulty: Difficulty): Task | undefined {
  return pickRandom(undraftedTasks(state, difficulty))
}

export function canStartMore(state: GameState): boolean {
  return state.active.length === 0
}

export function allDone(state: GameState): boolean {
  return state.draftDone && state.draft.length > 0 && state.draft.every((id) => isCompleted(state, id))
}

export function draftIsValid(taskIds: string[]): boolean {
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
  for (const id of taskIds) {
    const t = TASK_BY_ID[id]
    if (!t) return false
    counts[t.difficulty]++
  }
  return (
    counts.easy === CONFIG.draft.easy && counts.medium === CONFIG.draft.medium && counts.hard === CONFIG.draft.hard
  )
}

/** Může Andy z aktuálního kroku pokročit dál? (Brána musí být odemčená.) */
export function canAdvanceStory(state: GameState): boolean {
  const next = state.story.step + 1
  if (next >= STORY.length) return false
  return gatesNeededFor(next) <= state.story.gates
}

// ---------- reducer ----------

function withStart(state: GameState): GameState {
  return state.startedAt ? state : { ...state, startedAt: Date.now() }
}

function clampStep(n: number): number {
  return Math.max(0, Math.min(STORY.length - 1, n))
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    // ---------- fáze I ----------

    case 'STORY_NEXT': {
      if (!canAdvanceStory(state)) return state
      const step = state.story.step + 1
      return {
        ...state,
        story: {
          ...state.story,
          step,
          startedAt: state.story.startedAt ?? Date.now(),
          finishedAt: STORY[step].type === 'finale' ? Date.now() : state.story.finishedAt,
        },
      }
    }

    case 'STORY_SET_VAR':
      return { ...state, story: { ...state.story, vars: { ...state.story.vars, [action.key]: action.value } } }

    case 'STORY_OPEN_GATE':
      return { ...state, story: { ...state.story, gates: state.story.gates + 1 } }

    case 'STORY_CLOSE_GATE':
      return { ...state, story: { ...state.story, gates: Math.max(0, state.story.gates - 1) } }

    case 'STORY_SKIP_STEP': {
      const step = clampStep(state.story.step + 1)
      const gates = Math.max(state.story.gates, gatesNeededFor(step))
      return { ...state, story: { ...state.story, step, gates } }
    }

    case 'STORY_GOTO': {
      const step = clampStep(action.step)
      const gates = Math.max(state.story.gates, gatesNeededFor(step))
      return { ...state, story: { ...state.story, step, gates } }
    }

    case 'STORY_RESET':
      return { ...state, story: initialStory() }

    // ---------- fáze II ----------

    case 'SET_DRAFT': {
      if (!draftIsValid(action.taskIds)) return state
      return withStart({ ...state, draft: [...action.taskIds], draftDone: true })
    }

    case 'RESET_DRAFT':
      return { ...state, draft: [], draftDone: false, active: [] }

    case 'START_QUEST': {
      if (!canStartMore(state)) return state
      if (!isDrafted(state, action.taskId) || isCompleted(state, action.taskId) || isActive(state, action.taskId)) return state
      return withStart({
        ...state,
        active: [...state.active, { taskId: action.taskId, startedAt: Date.now(), buddy: null }],
      })
    }

    case 'COMPLETE': {
      const quest = state.active.find((a) => a.taskId === action.taskId)
      const task = TASK_BY_ID[action.taskId]
      if (!quest || !task) return state
      const stars = Math.min(5, Math.max(1, Math.round(action.stars)))
      const points = calcPoints(task, stars, !!quest.buddy)
      const newStreak = state.streak + 1
      const bonus = streakBonusFor(newStreak)
      return {
        ...state,
        active: state.active.filter((a) => a.taskId !== action.taskId),
        completed: [
          ...state.completed,
          { taskId: action.taskId, stars, points, bonus, buddy: quest.buddy, at: Date.now() },
        ],
        score: round1(state.score + points + bonus),
        streak: newStreak,
      }
    }

    case 'GIVE_UP': {
      const quest = state.active.find((a) => a.taskId === action.taskId)
      if (!quest) return state
      const shielded = action.useShield && state.jokers.shield > 0
      const penalty = shielded ? 0 : CONFIG.giveUpPenalty
      return {
        ...state,
        active: state.active.filter((a) => a.taskId !== action.taskId),
        giveUps: [...state.giveUps, { taskId: action.taskId, penalty, shielded, at: Date.now() }],
        score: round1(Math.max(0, state.score - penalty)),
        streak: shielded ? state.streak : 0,
        jokers: shielded ? { ...state.jokers, shield: state.jokers.shield - 1 } : state.jokers,
      }
    }

    case 'USE_REROLL': {
      const quest = state.active.find((a) => a.taskId === action.taskId)
      if (!quest || state.jokers.reroll <= 0) return state
      const newTask = TASK_BY_ID[action.newTaskId]
      if (!newTask || isCompleted(state, newTask.id) || isDrafted(state, newTask.id)) return state
      return {
        ...state,
        draft: state.draft.map((id) => (id === action.taskId ? newTask.id : id)),
        active: state.active.map((a) =>
          a.taskId === action.taskId ? { taskId: newTask.id, startedAt: Date.now(), buddy: a.buddy } : a,
        ),
        jokers: { ...state.jokers, reroll: state.jokers.reroll - 1 },
      }
    }

    case 'USE_BUDDY': {
      const quest = state.active.find((a) => a.taskId === action.taskId)
      if (!quest || quest.buddy || state.jokers.buddy <= 0) return state
      const name = action.buddy.trim() || 'Parťák'
      return {
        ...state,
        active: state.active.map((a) => (a.taskId === action.taskId ? { ...a, buddy: name } : a)),
        jokers: { ...state.jokers, buddy: state.jokers.buddy - 1 },
      }
    }

    case 'TOGGLE_SOUND':
      return { ...state, sound: !state.sound }

    // ---------- admin ----------

    case 'SET_PHASE':
      return state.phase === action.phase ? state : { ...state, phase: action.phase }

    case 'ADJUST_SCORE':
      return {
        ...state,
        score: round1(Math.max(0, state.score + action.delta)),
        adminAdjust: round1(state.adminAdjust + action.delta),
      }

    case 'SET_JOKER':
      return { ...state, jokers: { ...state.jokers, [action.joker]: Math.max(0, Math.floor(action.count)) } }

    case 'RESTORE_JOKERS':
      return { ...state, jokers: { ...CONFIG.jokers } }

    case 'ADMIN_COMPLETE': {
      const task = TASK_BY_ID[action.taskId]
      if (!task || isCompleted(state, action.taskId)) return state
      const quest = state.active.find((a) => a.taskId === action.taskId)
      const stars = Math.min(5, Math.max(1, Math.round(action.stars)))
      const points = calcPoints(task, stars, !!quest?.buddy)
      return withStart({
        ...state,
        draft: isDrafted(state, action.taskId) ? state.draft : [...state.draft, action.taskId],
        active: state.active.filter((a) => a.taskId !== action.taskId),
        completed: [
          ...state.completed,
          { taskId: action.taskId, stars, points, bonus: 0, buddy: quest?.buddy ?? null, at: Date.now() },
        ],
        score: round1(state.score + points),
      })
    }

    case 'UNCOMPLETE': {
      const entry = state.completed.find((c) => c.taskId === action.taskId)
      if (!entry) return state
      return {
        ...state,
        completed: state.completed.filter((c) => c.taskId !== action.taskId),
        score: round1(Math.max(0, state.score - entry.points - entry.bonus)),
      }
    }

    case 'RETURN_TO_POOL':
      return { ...state, active: state.active.filter((a) => a.taskId !== action.taskId) }

    case 'RESET':
      return { ...initialState(), sound: state.sound }

    default:
      return state
  }
}

// ---------- persistence ----------

const STORAGE_KEY = 'andyho-bojovka-v2'

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<GameState>
    if (parsed.version !== 2) return initialState()
    const base = initialState()
    return {
      ...base,
      ...parsed,
      phase: parsed.phase === 2 ? 2 : 1,
      story: { ...base.story, ...(parsed.story ?? {}), step: clampStep(parsed.story?.step ?? 0) },
      draft: Array.isArray(parsed.draft) ? parsed.draft : [],
      jokers: { ...base.jokers, ...(parsed.jokers ?? {}) },
      active: Array.isArray(parsed.active) ? parsed.active : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      giveUps: Array.isArray(parsed.giveUps) ? parsed.giveUps : [],
    }
  } catch {
    return initialState()
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}
