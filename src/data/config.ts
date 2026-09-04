import type { Difficulty, JokerType, Level } from '../types'

/**
 * Hlavní konfigurace hry. Tady se dá skoro všechno doladit.
 */
export const CONFIG = {
  heroName: 'Andy',
  appTitle: 'Andyho Bojovka',
  subtitle: 'Narozeninová výprava',

  /** PIN do admin konzole (dlouhé podržení erbu v hlavičce). */
  adminPin: '6767',

  /** Násobič bodů podle obtížnosti. Body = hvězdy × násobič. */
  multipliers: { easy: 1, medium: 1.5, hard: 2 } satisfies Record<Difficulty, number>,

  /** Násobič, když úkol plní s parťákem (žolík). */
  buddyMultiplier: 0.75,

  /** Kolik bodů se odečte za vzdání úkolu. */
  giveUpPenalty: 2,

  /** Po každých N splněných v řadě (bez vzdání) přijde bonus. */
  streakEvery: 3,
  streakBonus: 3,

  /** Kolik úkolů si Andy na začátku Fáze II vybere z každé sekce. */
  draft: { easy: 4, medium: 3, hard: 2 } satisfies Record<Difficulty, number>,

  /** Počet žolíků na začátku. */
  jokers: { reroll: 1, buddy: 1, shield: 1 } satisfies Record<JokerType, number>,

  /**
   * Levely a tituly. xp = kolik bodů je potřeba.
   * Nastaveno na jednu noc: cca 2 questy na level.
   */
  levels: [
    { xp: 0, title: 'Učeň', icon: '🐣' },
    { xp: 6, title: 'Panoš', icon: '🛡️' },
    { xp: 15, title: 'Rytíř', icon: '⚔️' },
    { xp: 28, title: 'Hrdina', icon: '👑' },
    { xp: 45, title: 'Legenda', icon: '🐉' },
  ] satisfies Level[],
}

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; icon: string; color: string; blurb: string }
> = {
  easy: {
    label: 'Lehké',
    icon: '🌿',
    color: '#4fb37f',
    blurb: 'Zahřívací kolo pro každého panoše.',
  },
  medium: {
    label: 'Střední',
    icon: '⚔️',
    color: '#e2a739',
    blurb: 'Tady se oddělí rytíři od sedláků.',
  },
  hard: {
    label: 'Těžké',
    icon: '🐉',
    color: '#d9463e',
    blurb: 'Jen pro legendy. Nebo blázny.',
  },
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export const JOKER_META: Record<JokerType, { label: string; icon: string; description: string }> = {
  reroll: {
    label: 'Výměna',
    icon: '🔄',
    description: 'Vymění aktivní úkol za jiný ze stejné sekce. Bez trestu.',
  },
  buddy: {
    label: 'Parťák',
    icon: '🤝',
    description: 'Úkol plní společně s někým z party. Body ×' + CONFIG.buddyMultiplier.toLocaleString('cs-CZ') + '.',
  },
  shield: {
    label: 'Štít',
    icon: '🛡️',
    description: 'Jednou může úkol vzdát bez trestu a bez ztráty série.',
  },
}
