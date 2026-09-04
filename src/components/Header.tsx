import { motion } from 'framer-motion'
import { CONFIG, JOKER_META } from '../data/config'
import { formatPoints, levelFor, levelIndexFor, levelProgress, nextLevelFor } from '../lib/points'
import { setSoundEnabled, sfx } from '../lib/sound'
import { useGame } from '../state/GameContext'
import type { JokerType } from '../types'
import { Crest } from './Crest'

interface HeaderProps {
  onLongPressLogo: () => void
  onOpenChronicle: () => void
  onOpenJokers: () => void
}

export function Header({ onLongPressLogo, onOpenChronicle, onOpenJokers }: HeaderProps) {
  const { state, dispatch } = useGame()

  const level = levelFor(state.score)
  const next = nextLevelFor(state.score)
  const progress = levelProgress(state.score)
  const levelNo = levelIndexFor(state.score) + 1

  return (
    <header className="sticky top-0 z-30 border-b border-gold/20 bg-ink/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-md">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <Crest icon={level.icon} onLongPress={onLongPressLogo} />

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="truncate font-fancy text-lg leading-tight gold-text">{CONFIG.appTitle}</h1>
              <div className="whitespace-nowrap font-display text-xl font-bold tabular-nums text-gold-2">
                {formatPoints(state.score)} <span className="text-xs text-parchment-3">XP</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-parchment-2">
              <span className="truncate">
                <span className="text-parchment-3">Lvl {levelNo}</span> · <span className="font-display font-semibold">{level.title}</span>
              </span>
              {state.streak > 0 && (
                <span className="whitespace-nowrap font-display text-xs text-ember-2" title="Série">
                  🔥 {state.streak}
                </span>
              )}
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/50 ring-1 ring-gold/30">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold-3 via-gold to-gold-2"
                initial={false}
                animate={{ width: `${Math.max(3, progress * 100)}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[11px] text-parchment-3">
              <span>{next ? `${formatPoints(Math.max(0, next.xp - state.score))} XP do „${next.title}“` : 'Maximální level!'}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink-3 px-3 py-2 ring-1 ring-gold/30"
            onClick={() => {
              sfx.tap()
              onOpenJokers()
            }}
            aria-label="Žolíky"
          >
            {(Object.keys(JOKER_META) as JokerType[]).map((j) => (
              <span key={j} className={`inline-flex items-center gap-1 font-display text-sm ${state.jokers[j] > 0 ? 'text-parchment' : 'opacity-30'}`}>
                <span>{JOKER_META[j].icon}</span>
                <span className="tabular-nums">{state.jokers[j]}</span>
              </span>
            ))}
          </button>
          <button
            type="button"
            className="rounded-xl bg-ink-3 px-3 py-2 text-lg ring-1 ring-gold/30"
            aria-label="Kronika"
            onClick={() => {
              sfx.tap()
              onOpenChronicle()
            }}
          >
            📜
          </button>
          <button
            type="button"
            className="rounded-xl bg-ink-3 px-3 py-2 text-lg ring-1 ring-gold/30"
            aria-label={state.sound ? 'Vypnout zvuk' : 'Zapnout zvuk'}
            onClick={() => {
              dispatch({ type: 'TOGGLE_SOUND' })
              if (!state.sound) {
                setSoundEnabled(true)
                sfx.tap()
              }
            }}
          >
            {state.sound ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  )
}
