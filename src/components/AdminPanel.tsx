import { useState, type ReactNode } from 'react'
import { CONFIG, DIFFICULTIES, DIFFICULTY_META, JOKER_META } from '../data/config'
import { CHAPTER_STARTS, GATE_COUNT, STORY, gatesNeededFor } from '../data/story'
import { TASKS } from '../data/tasks'
import { formatPoints } from '../lib/points'
import { isActive, isDrafted } from '../state/gameReducer'
import { useGame } from '../state/GameContext'
import type { JokerType, Phase } from '../types'
import { Button, Divider, Modal, Stars } from './ui'

function stepLabel(step: number): string {
  const s = STORY[step]
  if (!s) return '?'
  switch (s.type) {
    case 'chapter':
      return `📖 ${s.title}`
    case 'text':
      return `💬 ${s.text.slice(0, 50)}${s.text.length > 50 ? '…' : ''}`
    case 'choice':
      return `🔀 Volba: ${s.prompt || s.options[0].label}`
    case 'morse':
      return '📡 Morseovka'
    case 'lock':
      return `🔒 Zámek (${s.answer})`
    case 'tapwork':
      return '⌨️ Programování (klikání)'
    case 'shake':
      return '📳 Třesení'
    case 'rebus':
      return `🧩 Emoji rébus (${s.success})`
    case 'match':
      return '🤝 Přiřazovačka'
    case 'gate':
      return `🔏 ${s.title} (čeká na partu)`
    case 'finale':
      return '🏁 Finále (čeká na Fázi II)'
  }
}

export function AdminPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useGame()
  const [resetArmed, setResetArmed] = useState(false)
  const [rating, setRating] = useState<{ taskId: string; stars: number } | null>(null)

  const setPhase = (phase: Phase) => dispatch({ type: 'SET_PHASE', phase })
  const step = state.story.step
  const current = STORY[step]
  const waitingAtGate = current?.type === 'gate' && gatesNeededFor(step + 1) > state.story.gates
  const nextGateIndex = STORY.findIndex((s, i) => s.type === 'gate' && gatesNeededFor(i + 1) > state.story.gates)

  return (
    <Modal open={open} onClose={onClose} variant="full">
      <div className="mx-auto min-h-full max-w-md p-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-[max(env(safe-area-inset-top),20px)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-gold-2">⚙️ Admin konzole</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Zavřít">
            ✕
          </Button>
        </div>
        <p className="mt-1 text-sm text-parchment-3">Pro partu. Andy sem nemá co koukat.</p>

        {/* Fáze */}
        <Section title="Fáze">
          <div className="grid grid-cols-2 gap-2">
            <ModeButton active={state.phase === 1} onClick={() => setPhase(1)} title="Fáze I" desc="Příběh v autě, hlavolamy." />
            <ModeButton active={state.phase === 2} onClick={() => setPhase(2)} title="Fáze II" desc="Draft questů a plnění." />
          </div>
        </Section>

        {/* Příběh */}
        <Section title="Příběh (Fáze I)">
          <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-gold/20">
            <p className="text-xs font-display uppercase tracking-wider text-parchment-3">Andy je teď na kroku {step + 1} / {STORY.length}</p>
            <p className="mt-1 text-sm text-parchment">{stepLabel(step)}</p>
            <p className="mt-1 text-xs text-parchment-3">
              Odemčené brány: {state.story.gates} / {GATE_COUNT}
              {waitingAtGate && <span className="ml-2 text-ember-2">● Andy čeká na odemknutí!</span>}
            </p>
          </div>
          <div className="mt-2 space-y-2">
            <Button
              variant={waitingAtGate ? 'gold' : 'outline'}
              full
              disabled={state.story.gates >= GATE_COUNT}
              onClick={() => dispatch({ type: 'STORY_OPEN_GATE' })}
            >
              🔓 Odemknout další kapitolu
              {nextGateIndex >= 0 && STORY[nextGateIndex].type === 'gate' ? ` (${(STORY[nextGateIndex] as { title: string }).title})` : ''}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'STORY_SKIP_STEP' })} disabled={step >= STORY.length - 1}>
                ⏭ Přeskočit krok
              </Button>
              <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'STORY_CLOSE_GATE' })} disabled={state.story.gates === 0}>
                🔒 Zavřít bránu zpět
              </Button>
            </div>
            <p className="mt-2 text-xs text-parchment-3">Skočit na kapitolu:</p>
            <div className="grid grid-cols-2 gap-2">
              {CHAPTER_STARTS.map((c) => (
                <Button key={c.step} variant="dark" size="sm" onClick={() => dispatch({ type: 'STORY_GOTO', step: c.step })}>
                  {c.title}
                </Button>
              ))}
              <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'STORY_GOTO', step: STORY.length - 1 })}>
                🏁 Finále
              </Button>
            </div>
            <Button variant="outline" size="sm" full onClick={() => dispatch({ type: 'STORY_RESET' })}>
              Reset příběhu na začátek
            </Button>
          </div>
        </Section>

        {/* Skóre */}
        <Section title={`Skóre: ${formatPoints(state.score)} bodů`}>
          <div className="grid grid-cols-4 gap-2">
            {[-5, -1, 1, 5].map((d) => (
              <Button key={d} variant="dark" size="sm" onClick={() => dispatch({ type: 'ADJUST_SCORE', delta: d })}>
                {d > 0 ? `+${d}` : d}
              </Button>
            ))}
          </div>
          {state.adminAdjust !== 0 && (
            <p className="mt-2 text-xs text-parchment-3">
              Ruční korekce celkem: {state.adminAdjust > 0 ? '+' : ''}
              {formatPoints(state.adminAdjust)}
            </p>
          )}
          <p className="mt-2 text-xs text-parchment-3">Série: 🔥 {state.streak}</p>
        </Section>

        {/* Žolíky */}
        <Section title="Žolíky">
          <div className="space-y-2">
            {(Object.keys(JOKER_META) as JokerType[]).map((j) => (
              <div key={j} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 ring-1 ring-gold/20">
                <span className="font-display">
                  {JOKER_META[j].icon} {JOKER_META[j].label}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'SET_JOKER', joker: j, count: state.jokers[j] - 1 })}>
                    −
                  </Button>
                  <span className="w-6 text-center font-display font-bold tabular-nums">{state.jokers[j]}</span>
                  <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'SET_JOKER', joker: j, count: state.jokers[j] + 1 })}>
                    +
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" full onClick={() => dispatch({ type: 'RESTORE_JOKERS' })}>
              Obnovit na výchozí
            </Button>
          </div>
        </Section>

        {/* Úkoly */}
        <Section title="Questy (Fáze II)">
          <p className="mb-2 text-xs text-parchment-3">
            {state.draftDone ? `Andy si vybral ${state.draft.length} questů (⭐ = ve výběru).` : 'Draft ještě neproběhl.'}
          </p>
          {state.draftDone && (
            <Button variant="outline" size="sm" full className="mb-3" onClick={() => dispatch({ type: 'RESET_DRAFT' })}>
              Zrušit draft (vybere znovu)
            </Button>
          )}
          {DIFFICULTIES.map((difficulty) => (
            <div key={difficulty} className="mb-4">
              <h4 className="mb-1 font-display font-bold" style={{ color: DIFFICULTY_META[difficulty].color }}>
                {DIFFICULTY_META[difficulty].icon} {DIFFICULTY_META[difficulty].label}
              </h4>
              <ul className="divide-y divide-gold/10 rounded-2xl bg-black/30 ring-1 ring-gold/15">
                {TASKS.filter((t) => t.difficulty === difficulty).map((task) => {
                  const done = state.completed.find((c) => c.taskId === task.id)
                  const active = isActive(state, task.id)
                  const drafted = isDrafted(state, task.id)
                  const isRating = rating?.taskId === task.id
                  return (
                    <li key={task.id} className={`p-3 ${!drafted && state.draftDone ? 'opacity-50' : ''}`}>
                      <p className={`text-sm leading-snug ${done ? 'line-through opacity-60' : ''}`}>
                        {drafted ? '⭐ ' : ''}
                        {done ? '✅ ' : active ? '⚔️ ' : ''}
                        {task.text}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {done ? (
                          <>
                            <Stars value={done.stars} />
                            <span className="text-xs text-parchment-3">+{formatPoints(done.points + done.bonus)}</span>
                            <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'UNCOMPLETE', taskId: task.id })}>
                              Odsplnit
                            </Button>
                          </>
                        ) : isRating ? (
                          <>
                            <Stars value={rating.stars} onChange={(n) => setRating({ taskId: task.id, stars: n })} />
                            <Button
                              variant="gold"
                              size="sm"
                              disabled={rating.stars === 0}
                              onClick={() => {
                                dispatch({ type: 'ADMIN_COMPLETE', taskId: task.id, stars: rating.stars })
                                setRating(null)
                              }}
                            >
                              Uložit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setRating(null)}>
                              Zrušit
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="dark" size="sm" onClick={() => setRating({ taskId: task.id, stars: 0 })}>
                              Označit splněno
                            </Button>
                            {active && (
                              <Button variant="dark" size="sm" onClick={() => dispatch({ type: 'RETURN_TO_POOL', taskId: task.id })}>
                                Vrátit do seznamu
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </Section>

        {/* Nebezpečná zóna */}
        <Section title="Nebezpečná zóna">
          {!resetArmed ? (
            <Button variant="outline" full onClick={() => setResetArmed(true)}>
              Resetovat celou hru
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-ember-2">Fakt? Smaže to příběh, body, splněné úkoly i žolíky.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    dispatch({ type: 'RESET' })
                    setResetArmed(false)
                  }}
                >
                  Ano, smazat
                </Button>
                <Button variant="ghost" onClick={() => setResetArmed(false)}>
                  Ne
                </Button>
              </div>
            </div>
          )}
        </Section>

        <p className="mt-6 text-center text-xs text-parchment-3">
          Příběh je v <code>src/data/story.ts</code>, úkoly v <code>src/data/tasks.ts</code>, PIN a čísla v{' '}
          <code>src/data/config.ts</code>. Násobiče: {CONFIG.multipliers.easy} / {CONFIG.multipliers.medium} / {CONFIG.multipliers.hard}.
        </p>
        <Button variant="gold" full className="mt-4" onClick={onClose}>
          Zavřít konzoli
        </Button>
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <Divider className="mb-3" />
      <h3 className="mb-2 font-display text-lg font-bold text-parchment">{title}</h3>
      {children}
    </section>
  )
}

function ModeButton({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-3 text-left ring-1 transition ${
        active ? 'bg-gold/20 text-parchment ring-gold' : 'bg-black/30 text-parchment-3 ring-gold/20'
      }`}
    >
      <p className="font-display font-bold">
        {active ? '● ' : '○ '}
        {title}
      </p>
      <p className="mt-1 text-xs leading-snug">{desc}</p>
    </button>
  )
}
