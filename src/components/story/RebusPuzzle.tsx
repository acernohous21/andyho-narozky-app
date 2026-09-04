import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { matchesAnswer } from '../../lib/text'
import { Button } from '../ui'

interface Word {
  emoji: string
  accept: string[]
  answer: string
}

interface Props {
  intro: string
  words: Word[]
  success: string
  onDone: () => void
}

export function RebusPuzzle({ intro, words, success, onDone }: Props) {
  const [inputs, setInputs] = useState<string[]>(() => words.map(() => ''))
  const [solved, setSolved] = useState<boolean[]>(() => words.map(() => false))
  const [wrong, setWrong] = useState<number[]>(() => words.map(() => 0))
  const all = solved.every(Boolean)

  useEffect(() => {
    if (!all) return
    sfx.reveal()
    haptic.success()
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, zIndex: 100, colors: ['#f1c75b', '#fff3c4'] })
  }, [all])

  const check = (i: number) => {
    if (solved[i]) return
    if (matchesAnswer(inputs[i], words[i].accept)) {
      sfx.star(i + 2)
      haptic.tick()
      setSolved((s) => s.map((v, j) => (j === i ? true : v)))
    } else {
      sfx.fail()
      haptic.fail()
      setWrong((w) => w.map((v, j) => (j === i ? v + 1 : v)))
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center italic text-parchment-2">{intro}</p>

      <div className="space-y-2">
        {words.map((w, i) => (
          <motion.div
            key={i}
            animate={wrong[i] && !solved[i] ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.35 }}
            className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${solved[i] ? 'bg-easy/15 ring-easy/60' : 'dark-panel ring-gold/20'}`}
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-black/40 text-4xl">{w.emoji}</div>
            {solved[i] ? (
              <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 font-display text-2xl font-bold text-easy">
                {w.answer}
              </motion.p>
            ) : (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  check(i)
                }}
              >
                <input
                  className="min-w-0 flex-1 rounded-xl bg-black/40 px-3 py-2 font-display text-lg text-parchment ring-1 ring-gold/40 outline-none focus:ring-gold"
                  placeholder="slovo…"
                  value={inputs[i]}
                  onChange={(e) => setInputs((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                  autoCapitalize="off"
                  autoCorrect="off"
                  enterKeyHint="done"
                />
                <Button variant="dark" size="sm" type="submit" disabled={!inputs[i].trim()}>
                  ✓
                </Button>
              </form>
            )}
          </motion.div>
        ))}
      </div>

      {all && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">David říká</p>
          <p className="font-fancy text-3xl gold-text">{success}</p>
          <Button variant="gold" size="lg" full onClick={onDone}>
            Dál
          </Button>
        </motion.div>
      )}
    </div>
  )
}
