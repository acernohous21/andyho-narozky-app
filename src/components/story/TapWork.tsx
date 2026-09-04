import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { Button } from '../ui'

interface Props {
  title: string
  button: string
  count: number
  quips: string[]
  done: string
  onDone: () => void
}

const CODE_LINES = [
  'const fix = await tygi.doWork()',
  'if (!fix) fix = andy.doItInstead()',
  'try { deploy() } catch { blame(kelly) }',
  'while (true) { tygi.ask("a proč?") }',
  'return "funguje to, nesahat"',
]

export function TapWork({ title, button, count, quips, done, onDone }: Props) {
  const [n, setN] = useState(0)
  const finished = n >= count
  const quipIndex = Math.floor(n / 3) - 1
  const quip = quipIndex >= 0 ? quips[quipIndex % quips.length] : null

  const tap = () => {
    if (finished) return
    sfx.tick()
    haptic.tick()
    setN((v) => {
      const next = v + 1
      if (next >= count) {
        sfx.success()
        haptic.success()
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-center font-display text-lg text-parchment-2">{title}</p>

      <div className="dark-panel rounded-3xl p-4">
        <div className="flex items-center justify-between text-xs text-parchment-3">
          <span className="font-display uppercase tracking-wider">Tygiho úkol</span>
          <span className="tabular-nums">{Math.min(n, count)} / {count}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-gold/30">
          <motion.div
            className="h-full bg-gradient-to-r from-easy to-gold-2"
            animate={{ width: `${(Math.min(n, count) / count) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
        <div className="mt-3 h-24 overflow-hidden rounded-xl bg-black/50 p-2 font-mono text-xs text-easy">
          {Array.from({ length: Math.min(n, 5) }).map((_, i) => {
            const idx = Math.max(0, n - 5) + i
            return (
              <div key={idx} className="truncate">
                <span className="text-parchment-3/50">{String(idx + 1).padStart(2, '0')} </span>
                {CODE_LINES[idx % CODE_LINES.length]}
              </div>
            )
          })}
          {!finished && <span className="animate-pulse">▌</span>}
        </div>
        <div className="mt-2 min-h-[1.5rem] text-center text-sm italic text-parchment-2">
          <AnimatePresence mode="wait">
            {quip && !finished && (
              <motion.p key={quip} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {quip}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {finished ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
          <p className="font-display text-parchment-2">{done}</p>
          <Button variant="gold" size="lg" full onClick={onDone}>
            Dál
          </Button>
        </motion.div>
      ) : (
        <Button variant="gold" size="lg" full onClick={tap} silent>
          ⌨️ {button}
        </Button>
      )}
    </div>
  )
}
