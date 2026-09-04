import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CONFIG, DIFFICULTY_META } from '../data/config'
import { TASK_BY_ID } from '../data/tasks'
import { calcPoints, formatMult, formatPoints, streakBonusFor } from '../lib/points'
import { useGame } from '../state/GameContext'
import { Badge, Button, Modal, Stars } from './ui'

interface Props {
  open: boolean
  taskId: string | null
  onConfirm: (taskId: string, stars: number) => void
  onCancel: () => void
}

const LABELS: Record<number, string> = {
  0: 'Porota rozhoduje…',
  1: 'Trapné. Ale splněno.',
  2: 'Ušlo.',
  3: 'Solidní výkon.',
  4: 'Skvělé!',
  5: 'LEGENDÁRNÍ!',
}

export function RatingModal({ open, taskId, onConfirm, onCancel }: Props) {
  const { state } = useGame()
  const [stars, setStars] = useState(0)

  useEffect(() => {
    if (open) setStars(0)
  }, [open, taskId])

  const task = taskId ? TASK_BY_ID[taskId] : null
  const quest = state.active.find((a) => a.taskId === taskId)
  if (!task) return null
  const meta = DIFFICULTY_META[task.difficulty]
  const points = stars > 0 ? calcPoints(task, stars, !!quest?.buddy) : 0
  const bonus = streakBonusFor(state.streak + 1)

  return (
    <Modal open={open} onClose={onCancel} variant="sheet">
      <div className="dark-panel rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold/40" />
        <p className="text-center font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Soud poroty</p>
        <h2 className="mt-1 text-center font-fancy text-2xl gold-text">Předej telefon partě</h2>

        <div className="mt-4 rounded-2xl bg-black/30 p-3 ring-1 ring-gold/20">
          <div className="flex items-center gap-2">
            <Badge color={meta.color}>
              {meta.icon} {formatMult(CONFIG.multipliers[task.difficulty])}
            </Badge>
            {quest?.buddy && <Badge className="bg-white/10 text-parchment-2">🤝 {quest.buddy} {formatMult(CONFIG.buddyMultiplier)}</Badge>}
          </div>
          <p className="mt-2 leading-snug text-parchment-2">{task.text}</p>
        </div>

        <div className="mt-5 flex justify-center">
          <Stars value={stars} onChange={setStars} size="lg" />
        </div>
        <motion.p
          key={stars}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 text-center font-display text-lg ${stars === 5 ? 'gold-text' : 'text-parchment-2'}`}
        >
          {LABELS[stars]}
        </motion.p>

        <div className="mt-2 text-center text-sm text-parchment-3">
          {stars > 0 ? (
            <span>
              = <strong className="font-display text-xl text-gold-2">+{formatPoints(points)}</strong> bodů
              {bonus > 0 && <span className="ml-2 text-ember-2">+{bonus} bonus za sérii 🔥</span>}
            </span>
          ) : (
            <span>Kolik hvězd si Andy zaslouží?</span>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <Button variant="gold" size="lg" full disabled={stars === 0} onClick={() => onConfirm(task.id, stars)}>
            🏆 Potvrdit hodnocení
          </Button>
          <Button variant="ghost" size="sm" full onClick={onCancel}>
            Zpět
          </Button>
        </div>
      </div>
    </Modal>
  )
}
