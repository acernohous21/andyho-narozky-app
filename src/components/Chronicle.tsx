import { CONFIG, DIFFICULTY_META, JOKER_META } from '../data/config'
import { TASKS, TASK_BY_ID } from '../data/tasks'
import { formatDuration, formatPoints, levelFor, levelIndexFor } from '../lib/points'
import { allDone } from '../state/gameReducer'
import { useGame } from '../state/GameContext'
import type { JokerType } from '../types'
import { Button, Divider, Modal, Stars } from './ui'

export function Chronicle({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame()
  const level = levelFor(state.score)
  const done = allDone(state)
  const elapsed = state.startedAt ? Date.now() - state.startedAt : 0
  const avgStars =
    state.completed.length > 0 ? state.completed.reduce((s, c) => s + c.stars, 0) / state.completed.length : 0

  return (
    <Modal open={open} onClose={onClose} variant="full">
      <div className="mx-auto min-h-full max-w-md p-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-[max(env(safe-area-inset-top),20px)]">
        <div className="flex items-center justify-between">
          <h2 className="font-fancy text-2xl gold-text">Kronika výpravy</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Zavřít">
            ✕
          </Button>
        </div>

        <div className="parchment mt-4 rounded-3xl p-5 text-center">
          <div className="text-6xl">{level.icon}</div>
          <p className="mt-2 font-display text-xs uppercase tracking-[0.3em] text-[#6b4a1f]">Level {levelIndexFor(state.score) + 1}</p>
          <p className="font-fancy text-3xl text-[#2b1a08]">{level.title}</p>
          <p className="mt-1 text-[#6b4a1f]">{CONFIG.heroName}, hrdina této noci</p>
          <p className="mt-3 font-display text-5xl font-black text-[#8f6a1c] tabular-nums">{formatPoints(state.score)}</p>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-[#6b4a1f]">bodů celkem</p>
          {done && (
            <p className="mt-3 rounded-full bg-gold/30 px-3 py-1 font-display text-sm font-bold text-[#2b1a08]">
              🏁 Výprava dokončena, všechny questy splněny!
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <Stat label="Splněno" value={`${state.completed.length} / ${state.draft.length || TASKS.length}`} />
          <Stat label="Vzdáno" value={String(state.giveUps.length)} />
          <Stat label="Série teď" value={`🔥 ${state.streak}`} />
          <Stat label="Průměr hvězd" value={avgStars ? avgStars.toFixed(1) + ' ⭐' : '–'} />
          <Stat label="Na výpravě" value={state.startedAt ? formatDuration(elapsed) : '–'} />
          <Stat
            label="Žolíky"
            value={(Object.keys(JOKER_META) as JokerType[]).map((j) => `${JOKER_META[j].icon}${state.jokers[j]}`).join(' ')}
          />
        </div>

        <Divider className="my-5" />
        <h3 className="font-display text-lg font-bold text-gold-2">Splněné questy</h3>
        {state.completed.length === 0 ? (
          <p className="mt-2 text-sm italic text-parchment-3">Zatím prázdno. Výprava teprve začíná.</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {[...state.completed].reverse().map((c) => {
              const task = TASK_BY_ID[c.taskId]
              if (!task) return null
              const meta = DIFFICULTY_META[task.difficulty]
              return (
                <li key={c.taskId + c.at} className="rounded-2xl bg-black/30 p-3 ring-1 ring-gold/15">
                  <div className="flex items-start gap-2">
                    <span>{meta.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug">{task.text}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-parchment-3">
                        <Stars value={c.stars} />
                        <span className="font-display text-gold-2 tabular-nums">+{formatPoints(c.points)}</span>
                        {c.bonus > 0 && <span className="text-ember-2">🔥 +{c.bonus}</span>}
                        {c.buddy && <span>🤝 {c.buddy}</span>}
                        <span>{new Date(c.at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {state.giveUps.length > 0 && (
          <>
            <h3 className="mt-6 font-display text-lg font-bold text-ember-2">Vzdané questy</h3>
            <ol className="mt-2 space-y-2">
              {[...state.giveUps].reverse().map((g) => {
                const task = TASK_BY_ID[g.taskId]
                if (!task) return null
                return (
                  <li key={g.taskId + g.at} className="rounded-2xl bg-black/30 p-3 text-sm ring-1 ring-ember/20">
                    <p className="leading-snug text-parchment-2">{task.text}</p>
                    <p className="mt-1 text-xs text-parchment-3">
                      {g.shielded ? '🛡️ Štít, bez trestu' : `🥃 Trestný panák, −${formatPoints(g.penalty)}`}
                      {' · '}
                      {new Date(g.at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                )
              })}
            </ol>
          </>
        )}

        <Button variant="outline" full className="mt-8" onClick={onClose}>
          Zpět do boje
        </Button>
      </div>
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-gold/20">
      <p className="text-[11px] font-display uppercase tracking-wider text-parchment-3">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold text-parchment tabular-nums">{value}</p>
    </div>
  )
}
