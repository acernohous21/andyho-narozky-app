import { motion } from 'framer-motion'
import { useState } from 'react'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { Button } from '../ui'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface Props {
  intro: string
  answer: string
  success: string
  onDone: () => void
}

export function LockPuzzle({ intro, answer, success, onDone }: Props) {
  const target = answer.toUpperCase()
  const [wheels, setWheels] = useState<number[]>(() => target.split('').map(() => 0))
  const [wrong, setWrong] = useState(0)
  const [solved, setSolved] = useState(false)

  const spin = (i: number, dir: 1 | -1) => {
    sfx.tick()
    haptic.tick()
    setWheels((w) => w.map((v, j) => (j === i ? (v + dir + LETTERS.length) % LETTERS.length : v)))
  }

  const check = () => {
    const word = wheels.map((v) => LETTERS[v]).join('')
    if (word === target) {
      setSolved(true)
      sfx.joker()
      haptic.success()
    } else {
      sfx.fail()
      haptic.fail()
      setWrong((n) => n + 1)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center italic text-parchment-2">{intro}</p>
      <motion.div
        key={wrong}
        animate={wrong && !solved ? { x: [0, -12, 12, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`dark-panel rounded-3xl p-5 ${solved ? 'gold-border' : ''}`}
      >
        <div className="flex justify-center gap-2">
          {wheels.map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <button
                type="button"
                className="h-10 w-14 rounded-t-xl bg-ink-3 text-parchment-3 ring-1 ring-gold/30 active:bg-gold/20"
                onClick={() => spin(i, -1)}
                disabled={solved}
                aria-label="Nahoru"
              >
                ▲
              </button>
              <div className="relative h-20 w-14 overflow-hidden bg-black/50 ring-1 ring-gold/40">
                <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="flex h-full flex-col items-center justify-center">
                  <span className="text-xs text-parchment-3/50">{LETTERS[(v + LETTERS.length - 1) % LETTERS.length]}</span>
                  <motion.span
                    key={v}
                    initial={{ y: -8, opacity: 0.4 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className={`font-display text-3xl font-black ${solved ? 'text-gold-2' : 'text-parchment'}`}
                  >
                    {LETTERS[v]}
                  </motion.span>
                  <span className="text-xs text-parchment-3/50">{LETTERS[(v + 1) % LETTERS.length]}</span>
                </div>
              </div>
              <button
                type="button"
                className="h-10 w-14 rounded-b-xl bg-ink-3 text-parchment-3 ring-1 ring-gold/30 active:bg-gold/20"
                onClick={() => spin(i, 1)}
                disabled={solved}
                aria-label="Dolů"
              >
                ▼
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-3xl">{solved ? '🔓' : '🔒'}</div>
      </motion.div>

      {solved ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
          <p className="font-display text-parchment-2">{success}</p>
          <Button variant="gold" size="lg" full onClick={onDone}>
            Otevřít zprávu
          </Button>
        </motion.div>
      ) : (
        <>
          <Button variant="gold" size="lg" full onClick={check}>
            Odemknout
          </Button>
          {wrong > 0 && <p className="text-center text-sm text-ember-2">Zámek zachrastil. To není ono.</p>}
        </>
      )}
    </div>
  )
}
