import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CONFIG, DIFFICULTY_META } from '../data/config'
import { TASK_BY_ID } from '../data/tasks'
import { haptic } from '../lib/haptics'
import { formatMult, formatPoints, maxPoints } from '../lib/points'
import { shuffle } from '../lib/random'
import { sfx } from '../lib/sound'
import type { Task } from '../types'
import { Badge, Button, Modal } from './ui'

interface Props {
  open: boolean
  /** Vylosovaný úkol (výsledek). */
  task: Task | null
  /** Kandidáti pro animaci (stejná sekce). */
  candidates: Task[]
  /** Pokud jde o výměnu žolíkem. */
  isReroll?: boolean
  onAccept: (taskId: string) => void
  onCancel: () => void
}

const SPIN_TOTAL_MS = 1700

export function RollOverlay({ open, task, candidates, isReroll, onAccept, onCancel }: Props) {
  const [phase, setPhase] = useState<'spin' | 'reveal'>('spin')
  const [current, setCurrent] = useState<Task | null>(null)
  const timeouts = useRef<number[]>([])

  const pool = useMemo(() => {
    const base = candidates.length > 0 ? candidates : task ? [task] : []
    return shuffle(base)
  }, [candidates, task])

  useEffect(() => {
    if (!open || !task) return
    setPhase('spin')
    setCurrent(pool[0] ?? task)
    sfx.whoosh()

    // zpomalující se "slot machine"
    const steps: number[] = []
    let t = 0
    let delay = 60
    while (t < SPIN_TOTAL_MS) {
      steps.push(t)
      t += delay
      delay = Math.min(360, delay * 1.13)
    }
    const ids: number[] = []
    steps.forEach((at, i) => {
      ids.push(
        window.setTimeout(() => {
          const next = pool[i % Math.max(1, pool.length)] ?? task
          setCurrent(next)
          sfx.tick()
          haptic.tick()
        }, at),
      )
    })
    ids.push(
      window.setTimeout(() => {
        setCurrent(task)
        setPhase('reveal')
        sfx.reveal()
        haptic.success()
      }, SPIN_TOTAL_MS + 120),
    )
    timeouts.current = ids
    return () => {
      ids.forEach((id) => window.clearTimeout(id))
    }
  }, [open, task, pool])

  if (!task) return null
  const meta = DIFFICULTY_META[task.difficulty]
  const shown = current ?? task
  const revealed = phase === 'reveal'

  return (
    <Modal open={open} onClose={revealed ? onCancel : undefined} dismissable={false} variant="center">
      <div className="dark-panel rounded-3xl p-5 text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">
          {isReroll ? 'Žolík: výměna' : 'Osud rozhoduje'}
        </p>
        <div className="mt-2 flex justify-center">
          <Badge color={meta.color}>
            {meta.icon} {meta.label} {formatMult(CONFIG.multipliers[task.difficulty])}
          </Badge>
        </div>

        <div className="relative mt-4 min-h-[9rem] overflow-hidden rounded-2xl">
          <motion.div
            className={`parchment h-full w-full rounded-2xl px-4 py-5 ${revealed ? 'gold-border' : ''}`}
            animate={revealed ? { scale: [0.96, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={shown.id + (revealed ? '-r' : '')}
                className={`font-body font-semibold leading-snug text-[#2b1a08] ${revealed ? 'text-2xl' : 'text-xl blur-[0.6px] opacity-80'}`}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: revealed ? 0.35 : 0.08 }}
              >
                {shown.text}
              </motion.p>
            </AnimatePresence>
          </motion.div>
          {!revealed && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-2/70 via-transparent to-ink-2/70" />
          )}
        </div>

        <div className="mt-4 min-h-[1.5rem] text-sm text-parchment-3">
          {revealed ? (
            <span>
              Až <strong className="text-gold-2 font-display">{formatPoints(maxPoints(TASK_BY_ID[task.id], false))}</strong> bodů
            </span>
          ) : (
            <span className="animate-pulse">Losuje se…</span>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Button variant="gold" size="lg" full disabled={!revealed} onClick={() => onAccept(task.id)}>
            ⚔️ Přijmout quest
          </Button>
          {!isReroll && (
            <Button variant="ghost" size="sm" full disabled={!revealed} onClick={onCancel}>
              Radši si vyberu sám
            </Button>
          )}
          {isReroll && (
            <p className="text-xs text-parchment-3 italic">Žolík už je použitý, tenhle quest platí.</p>
          )}
        </div>
      </div>
    </Modal>
  )
}
