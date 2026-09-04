import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { haptic } from '../../lib/haptics'
import { MORSE, toMorse, toTimeline } from '../../lib/morse'
import { sfx } from '../../lib/sound'
import { matchesAnswer } from '../../lib/text'
import { Button } from '../ui'

const UNIT_MS = 130

interface Props {
  intro: string
  message: string
  accept: string[]
  success: string
  onDone: () => void
}

export function MorsePuzzle({ intro, message, accept, success, onDone }: Props) {
  const [lit, setLit] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [guess, setGuess] = useState('')
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState(0)
  const timeouts = useRef<number[]>([])

  const stop = () => {
    timeouts.current.forEach((t) => window.clearTimeout(t))
    timeouts.current = []
    setLit(false)
    setPlaying(false)
  }

  useEffect(() => stop, [])

  const play = () => {
    stop()
    setPlaying(true)
    let t = 300
    for (const u of toTimeline(message)) {
      const at = t
      const dur = u.units * UNIT_MS
      if (u.on) {
        timeouts.current.push(
          window.setTimeout(() => {
            setLit(true)
            sfx.beep(dur / 1000)
            haptic.tick()
          }, at),
        )
        timeouts.current.push(window.setTimeout(() => setLit(false), at + dur))
      }
      t += dur
    }
    timeouts.current.push(window.setTimeout(() => setPlaying(false), t + 200))
  }

  const check = () => {
    if (matchesAnswer(guess, accept)) {
      stop()
      setSolved(true)
      sfx.reveal()
      haptic.success()
    } else {
      sfx.fail()
      haptic.fail()
      setWrong((w) => w + 1)
    }
  }

  const code = toMorse(message)

  return (
    <div className="space-y-4">
      <p className="text-center italic text-parchment-2">{intro}</p>

      {/* "rozbitý telefon" */}
      <div className="dark-panel rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Nová zpráva</span>
          <span className="text-xs text-parchment-3">📶 1 % 🔋</span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <motion.div
            className="h-24 w-24 rounded-full"
            animate={{
              backgroundColor: lit ? '#f1c75b' : '#33220f',
              boxShadow: lit ? '0 0 60px 20px rgba(241,199,91,0.55)' : '0 0 0 0 rgba(241,199,91,0)',
              scale: lit ? 1.08 : 1,
            }}
            transition={{ duration: 0.05 }}
          />
        </div>
        <p className="mt-4 select-all break-words text-center font-mono text-lg leading-relaxed tracking-[0.15em] text-parchment">
          {code}
        </p>
        <p className="mt-1 text-center text-xs text-parchment-3">Od: ▮▮▮ ▮▮▮▮▮▮▮▮ ▮▮▮▮▮▮</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="dark" size="sm" onClick={playing ? stop : play}>
            {playing ? '⏹ Stop' : '▶ Přehrát'}
          </Button>
          <Button variant="dark" size="sm" onClick={() => setShowTable((s) => !s)}>
            {showTable ? 'Skrýt abecedu' : '? Morseova abeceda'}
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-1 rounded-2xl bg-black/30 p-3 font-mono text-sm">
                {Object.entries(MORSE)
                  .filter(([k]) => /[A-Z]/.test(k))
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="font-bold text-gold-2">{k}</span>
                      <span className="text-parchment-2">{v}</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {solved ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Zpráva od</p>
          <p className="font-fancy text-2xl gold-text">{success}</p>
          <Button variant="gold" size="lg" full onClick={onDone}>
            Dál
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key={wrong}
          animate={wrong ? { x: [0, -10, 10, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            check()
          }}
        >
          <input
            className="w-full rounded-xl bg-black/40 px-4 py-3 font-display text-lg text-parchment ring-1 ring-gold/40 outline-none placeholder:text-parchment-3/60 focus:ring-gold"
            placeholder="Co je tam napsáno?"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="go"
          />
          <Button variant="gold" size="lg" full type="submit" disabled={!guess.trim()}>
            Vyluštit
          </Button>
          {wrong > 0 && <p className="text-center text-sm text-ember-2">To není ono. Tečka je krátká, čárka dlouhá.</p>}
        </motion.form>
      )}
    </div>
  )
}
