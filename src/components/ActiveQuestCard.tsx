import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CONFIG, DIFFICULTY_META, JOKER_META } from '../data/config'
import { TASK_BY_ID } from '../data/tasks'
import { formatDuration, formatMult, formatPoints, maxPoints } from '../lib/points'
import { useGame } from '../state/GameContext'
import type { ActiveQuest } from '../types'
import { Badge, Button } from './ui'

interface Props {
  quest: ActiveQuest
  index: number
  onComplete: (taskId: string) => void
  onGiveUp: (taskId: string) => void
  onReroll: (taskId: string) => void
  onBuddy: (taskId: string) => void
}

function useElapsed(since: number): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now - since
}

export function ActiveQuestCard({ quest, index, onComplete, onGiveUp, onReroll, onBuddy }: Props) {
  const { state } = useGame()
  const task = TASK_BY_ID[quest.taskId]
  const elapsed = useElapsed(quest.startedAt)
  if (!task) return null
  const meta = DIFFICULTY_META[task.difficulty]
  const max = maxPoints(task, !!quest.buddy)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20, pointerEvents: 'none', transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.05 }}
      className="parchment relative mb-5 rounded-3xl p-5 pt-7"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="rounded-full bg-gradient-to-b from-ember-2 to-ember px-4 py-1 font-display text-xs font-bold uppercase tracking-[0.2em] text-parchment shadow-lg">
          Aktivní quest
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge color={meta.color}>
          {meta.icon} {meta.label} {formatMult(CONFIG.multipliers[task.difficulty])}
        </Badge>
        <span className="font-display text-sm tabular-nums text-[#6b4a1f]">⏱ {formatDuration(elapsed)}</span>
      </div>

      <p className="mt-4 font-body text-2xl font-semibold leading-snug text-[#2b1a08]">{task.text}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6b4a1f]">
        <span>
          Až <strong className="font-display">{formatPoints(max)}</strong> bodů
        </span>
        {quest.buddy && (
          <span className="inline-flex items-center gap-1">
            🤝 s parťákem <strong>{quest.buddy}</strong> ({formatMult(CONFIG.buddyMultiplier)})
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="gold" size="lg" onClick={() => onComplete(task.id)} className="col-span-2">
          ✅ Splněno
        </Button>
        <Button
          variant="dark"
          size="sm"
          disabled={state.jokers.reroll <= 0}
          onClick={() => onReroll(task.id)}
          title={JOKER_META.reroll.description}
        >
          {JOKER_META.reroll.icon} Vyměnit ({state.jokers.reroll})
        </Button>
        <Button
          variant="dark"
          size="sm"
          disabled={state.jokers.buddy <= 0 || !!quest.buddy}
          onClick={() => onBuddy(task.id)}
          title={JOKER_META.buddy.description}
        >
          {JOKER_META.buddy.icon} Parťák ({state.jokers.buddy})
        </Button>
        <Button variant="ghostDark" size="sm" className="col-span-2" onClick={() => onGiveUp(task.id)}>
          🏳️ Vzdát quest
        </Button>
      </div>
    </motion.article>
  )
}
