import { CONFIG, DIFFICULTIES, DIFFICULTY_META } from '../data/config'
import { TASK_BY_ID } from '../data/tasks'
import { formatMult, formatPoints } from '../lib/points'
import { canStartMore, isActive } from '../state/gameReducer'
import { useGame } from '../state/GameContext'
import { Badge, Stars } from './ui'

interface QuestBoardProps {
  onPick: (taskId: string) => void
}

/** Seznam Andyho vybraných questů. */
export function QuestBoard({ onPick }: QuestBoardProps) {
  const { state } = useGame()
  const canStart = canStartMore(state)

  return (
    <div className="space-y-4">
      {!canStart && (
        <p className="text-center text-sm italic text-parchment-3">Nejdřív dokonči aktivní quest, pak si vezmeš další.</p>
      )}
      {DIFFICULTIES.map((difficulty) => {
        const meta = DIFFICULTY_META[difficulty]
        const tasks = state.draft.map((id) => TASK_BY_ID[id]).filter((t) => t && t.difficulty === difficulty)
        if (tasks.length === 0) return null
        const doneCount = tasks.filter((t) => state.completed.some((c) => c.taskId === t.id)).length

        return (
          <section key={difficulty} className="dark-panel overflow-hidden rounded-3xl">
            <div className="flex items-center gap-3 p-4">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl"
                style={{ backgroundColor: `${meta.color}22`, boxShadow: `inset 0 0 0 1px ${meta.color}88` }}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold" style={{ color: meta.color }}>
                    {meta.label}
                  </h2>
                  <Badge color={meta.color}>{formatMult(CONFIG.multipliers[difficulty])}</Badge>
                </div>
                <p className="text-xs tabular-nums text-parchment-3">
                  Splněno {doneCount} / {tasks.length}
                </p>
              </div>
            </div>
            <ul className="divide-y divide-gold/10 border-t border-gold/15">
              {tasks.map((task) => {
                const done = state.completed.find((c) => c.taskId === task.id)
                const active = isActive(state, task.id)
                const gaveUp = state.giveUps.some((g) => g.taskId === task.id)
                const selectable = !done && !active && canStart
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      disabled={!selectable}
                      onClick={() => onPick(task.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                        selectable ? 'active:bg-white/5' : ''
                      } ${done ? 'opacity-50' : ''}`}
                    >
                      <span className="mt-0.5 text-lg leading-none">{done ? '✅' : active ? '⚔️' : gaveUp ? '🏳️' : '📜'}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block leading-snug ${done ? 'line-through' : ''}`}>{task.text}</span>
                        {done && (
                          <span className="mt-1 flex items-center gap-2 text-xs text-parchment-3">
                            <Stars value={done.stars} />
                            <span className="tabular-nums">+{formatPoints(done.points + done.bonus)}</span>
                          </span>
                        )}
                        {active && <span className="mt-1 block font-display text-xs text-gold-2">Právě probíhá</span>}
                        {!done && !active && gaveUp && (
                          <span className="mt-1 block font-display text-xs text-ember-2">Jednou vzdáno. Zkusíš znovu?</span>
                        )}
                      </span>
                      {selectable && <span className="self-center font-display text-xs text-gold-2">Přijmout ›</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
