import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { CONFIG, DIFFICULTIES, DIFFICULTY_META } from '../data/config'
import { TASKS } from '../data/tasks'
import { haptic } from '../lib/haptics'
import { formatMult } from '../lib/points'
import { shuffle } from '../lib/random'
import { sfx } from '../lib/sound'
import { draftIsValid } from '../state/gameReducer'
import { useGame } from '../state/GameContext'
import type { Difficulty } from '../types'
import { Badge, Button } from './ui'

/** Začátek Fáze II: Andy si vybere své questy. */
export function DraftScreen() {
  const { dispatch } = useGame()
  const [picked, setPicked] = useState<string[]>([])

  const countOf = (d: Difficulty) => picked.filter((id) => TASKS.find((t) => t.id === id)?.difficulty === d).length
  const valid = draftIsValid(picked)

  const toggle = (id: string, d: Difficulty) => {
    if (picked.includes(id)) {
      sfx.tick()
      haptic.tick()
      setPicked((p) => p.filter((x) => x !== id))
      return
    }
    if (countOf(d) >= CONFIG.draft[d]) {
      sfx.fail()
      haptic.fail()
      return
    }
    sfx.tap()
    haptic.tap()
    setPicked((p) => [...p, id])
  }

  const autoFill = (d: Difficulty) => {
    const need = CONFIG.draft[d] - countOf(d)
    if (need <= 0) return
    const pool = shuffle(TASKS.filter((t) => t.difficulty === d && !picked.includes(t.id))).slice(0, need)
    sfx.whoosh()
    haptic.joker()
    setPicked((p) => [...p, ...pool.map((t) => t.id)])
  }

  const confirm = () => {
    if (!valid) return
    sfx.success()
    haptic.success()
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, zIndex: 100, colors: ['#f1c75b', '#fff3c4', '#ff6a4d'] })
    dispatch({ type: 'SET_DRAFT', taskIds: picked })
  }

  const total = CONFIG.draft.easy + CONFIG.draft.medium + CONFIG.draft.hard

  return (
    <main className="mx-auto max-w-md px-4 pb-32 pt-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Fáze II · Výběr questů</p>
        <h2 className="mt-1 font-fancy text-2xl gold-text">Sestav si výpravu</h2>
        <p className="mt-2 text-parchment-2">
          Vyber si {CONFIG.draft.easy} lehké, {CONFIG.draft.medium} střední a {CONFIG.draft.hard} těžké. Co vybereš, to plníš.
          Zbytek už neuvidíš (skoro).
        </p>
      </motion.div>

      <div className="space-y-4">
        {DIFFICULTIES.map((d) => {
          const meta = DIFFICULTY_META[d]
          const n = countOf(d)
          const full = n >= CONFIG.draft[d]
          return (
            <section key={d} className="dark-panel overflow-hidden rounded-3xl">
              <div className="flex items-center gap-3 p-4">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${meta.color}22`, boxShadow: `inset 0 0 0 1px ${meta.color}88` }}
                >
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold" style={{ color: meta.color }}>
                      {meta.label}
                    </h3>
                    <Badge color={meta.color}>{formatMult(CONFIG.multipliers[d])}</Badge>
                  </div>
                  <p className={`text-sm tabular-nums ${full ? 'text-easy' : 'text-parchment-3'}`}>
                    Vybráno {n} / {CONFIG.draft[d]} {full && '✓'}
                  </p>
                </div>
                {!full && (
                  <Button variant="dark" size="sm" onClick={() => autoFill(d)}>
                    🎲 Dolosovat
                  </Button>
                )}
              </div>
              <ul className="divide-y divide-gold/10 border-t border-gold/15">
                {TASKS.filter((t) => t.difficulty === d).map((t) => {
                  const on = picked.includes(t.id)
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => toggle(t.id, d)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                          on ? 'bg-gold/10' : full ? 'opacity-40' : 'active:bg-white/5'
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-sm ring-1 ${
                            on ? 'bg-gold text-ink ring-gold' : 'ring-gold/40'
                          }`}
                        >
                          {on ? '✓' : ''}
                        </span>
                        <span className="leading-snug">{t.text}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-ink/90 p-4 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur-md">
        <div className="mx-auto max-w-md">
          <Button variant="gold" size="lg" full disabled={!valid} onClick={confirm}>
            ⚔️ Potvrdit výpravu ({picked.length} / {total})
          </Button>
        </div>
      </div>
    </main>
  )
}
