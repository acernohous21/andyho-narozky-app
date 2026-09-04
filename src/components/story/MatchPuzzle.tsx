import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { PEOPLE, type MatchRound } from '../../data/story'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { Button } from '../ui'

interface Props {
  intro: string
  rounds: MatchRound[]
  round: number
  onRound: (n: number) => void
  success: string
  onDone: () => void
}

export function MatchPuzzle({ intro, rounds, round, onRound, success, onDone }: Props) {
  const safeRound = Math.min(round, rounds.length)
  const finished = safeRound >= rounds.length
  const current = rounds[Math.min(safeRound, rounds.length - 1)]

  // assignments[characterIndex] = person
  const [assign, setAssign] = useState<(string | null)[]>(() => current.characters.map(() => null))
  const [locked, setLocked] = useState<boolean[]>(() => current.characters.map(() => false))
  const [shaking, setShaking] = useState<boolean[]>(() => current.characters.map(() => false))
  const [roundDone, setRoundDone] = useState(false)
  const [tries, setTries] = useState(0)

  const resetFor = (r: MatchRound) => {
    setAssign(r.characters.map(() => null))
    setLocked(r.characters.map(() => false))
    setShaking(r.characters.map(() => false))
    setRoundDone(false)
    setTries(0)
  }

  const pick = (ci: number, person: string) => {
    if (locked[ci] || roundDone) return
    sfx.tick()
    haptic.tick()
    setAssign((a) => a.map((v, i) => (i === ci ? person : v === person ? null : v)))
  }

  const check = () => {
    const results = current.characters.map((c, i) => assign[i] === c.person)
    const newLocked = locked.map((l, i) => l || results[i])
    setLocked(newLocked)
    setShaking(results.map((ok, i) => !ok && assign[i] !== null))
    setAssign((a) => a.map((v, i) => (results[i] ? v : null)))
    setTries((t) => t + 1)
    if (newLocked.every(Boolean)) {
      setRoundDone(true)
      sfx.success()
      haptic.success()
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, zIndex: 100, colors: ['#f1c75b', '#fff3c4', '#4fb37f'] })
    } else {
      sfx.fail()
      haptic.fail()
      window.setTimeout(() => setShaking(current.characters.map(() => false)), 500)
    }
  }

  const nextRound = () => {
    const n = safeRound + 1
    onRound(n)
    if (n < rounds.length) resetFor(rounds[n])
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
        <div className="text-6xl">🤝</div>
        <p className="font-fancy text-2xl gold-text">{success}</p>
        <Button variant="gold" size="lg" full onClick={onDone}>
          Dál
        </Button>
      </motion.div>
    )
  }

  const allAssigned = assign.every((a, i) => locked[i] || a !== null)

  return (
    <div className="space-y-4">
      <p className="text-center italic text-parchment-2">{intro}</p>

      <div className="flex items-center justify-center gap-2">
        {rounds.map((r, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < safeRound ? 'bg-easy' : i === safeRound ? 'bg-gold-2' : 'bg-parchment-3/30'}`}
            title={r.title}
          />
        ))}
      </div>
      <h3 className="text-center font-display text-xl font-bold text-gold-2">
        Kolo {safeRound + 1}/{rounds.length}: {current.title}
      </h3>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.ul
          key={safeRound}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30, transition: { duration: 0.15 } }}
          className="space-y-2"
        >
          {current.characters.map((c, ci) => {
            const isLocked = locked[ci]
            return (
              <motion.li
                key={c.name}
                animate={shaking[ci] ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`rounded-2xl p-3 ring-1 ${isLocked ? 'bg-easy/15 ring-easy/60' : 'dark-panel ring-gold/20'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black/40 text-2xl">{c.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-parchment">{c.name}</p>
                    <p className="text-xs leading-snug text-parchment-3">{c.blurb}</p>
                  </div>
                  <div className={`font-display text-lg font-bold ${isLocked ? 'text-easy' : 'text-gold-2'}`}>
                    {assign[ci] ?? '—'}
                  </div>
                </div>
                {!isLocked && !roundDone && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PEOPLE.map((p) => {
                      const usedHere = assign[ci] === p
                      const lockedElsewhere = current.characters.some((_, j) => locked[j] && assign[j] === p)
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={lockedElsewhere}
                          onClick={() => pick(ci, p)}
                          className={`rounded-full px-2.5 py-1 font-display text-xs ring-1 transition ${
                            usedHere
                              ? 'bg-gold text-ink ring-gold'
                              : 'bg-black/30 text-parchment-2 ring-gold/30 active:bg-gold/20'
                          } disabled:opacity-25`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.li>
            )
          })}
        </motion.ul>
      </AnimatePresence>

      {roundDone ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="gold" size="lg" full onClick={nextRound}>
            {safeRound + 1 < rounds.length ? 'Další kolo' : 'Hotovo'}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-1">
          <Button variant="gold" size="lg" full disabled={!allAssigned} onClick={check}>
            Zkontrolovat
          </Button>
          {tries > 0 && (
            <p className="text-center text-xs text-parchment-3">
              Pokus {tries}. Zelené sedí, ostatní zkus jinak.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
