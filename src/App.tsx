import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActiveQuestCard } from './components/ActiveQuestCard'
import { AdminPanel } from './components/AdminPanel'
import { Chronicle } from './components/Chronicle'
import { DraftScreen } from './components/DraftScreen'
import { Header } from './components/Header'
import {
  BuddyModal,
  ConfirmPickModal,
  GiveUpModal,
  JokersModal,
  LevelUpOverlay,
  PenaltyOverlay,
  PhaseIntroOverlay,
  ResultOverlay,
  type ResultData,
} from './components/Overlays'
import { PinPad } from './components/PinPad'
import { QuestBoard } from './components/QuestBoard'
import { RatingModal } from './components/RatingModal'
import { RollOverlay } from './components/RollOverlay'
import { StoryScreen } from './components/story/StoryScreen'
import { Button, Divider } from './components/ui'
import { CONFIG } from './data/config'
import { TASK_BY_ID } from './data/tasks'
import { haptic } from './lib/haptics'
import { calcPoints, levelFor, levelIndexFor, round1, streakBonusFor } from './lib/points'
import { sfx, unlockAudio } from './lib/sound'
import { allDone, pickReroll, undraftedTasks } from './state/gameReducer'
import { GameProvider, useGame } from './state/GameContext'
import type { Level, Task } from './types'

type Overlay =
  | { kind: 'none' }
  | { kind: 'roll'; task: Task; candidates: Task[]; rerollOf: string }
  | { kind: 'confirmPick'; taskId: string }
  | { kind: 'rate'; taskId: string }
  | { kind: 'result'; data: ResultData; levelUp: Level | null }
  | { kind: 'giveUp'; taskId: string }
  | { kind: 'penalty'; penalty: number }
  | { kind: 'buddy'; taskId: string }
  | { kind: 'levelUp'; level: Level }
  | { kind: 'chronicle' }
  | { kind: 'jokers' }
  | { kind: 'pin' }
  | { kind: 'admin' }
  | { kind: 'phase2intro' }

function Game() {
  const { state, dispatch } = useGame()
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' })
  const [toast, setToast] = useState<string | null>(null)
  const prevPhase = useRef(state.phase)

  const close = useCallback(() => setOverlay({ kind: 'none' }), [])
  const scrollTop = () => window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    const unlock = () => {
      unlockAudio()
      window.removeEventListener('pointerdown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // intro při přepnutí na Fázi II (jen když se přepne za běhu, ne po reloadu)
  useEffect(() => {
    if (prevPhase.current === 1 && state.phase === 2) {
      setOverlay({ kind: 'phase2intro' })
    }
    prevPhase.current = state.phase
  }, [state.phase])

  // ---------- fáze I ----------
  if (state.phase === 1) {
    return (
      <>
        <StoryScreen onOpenAdmin={() => setOverlay({ kind: 'pin' })} />
        <PinPad open={overlay.kind === 'pin'} onSuccess={() => setOverlay({ kind: 'admin' })} onCancel={close} />
        <AdminPanel open={overlay.kind === 'admin'} onClose={close} />
      </>
    )
  }

  // ---------- fáze II ----------

  const acceptRoll = (taskId: string) => {
    if (overlay.kind === 'roll') {
      dispatch({ type: 'USE_REROLL', taskId: overlay.rerollOf, newTaskId: taskId })
    }
    sfx.accept()
    haptic.success()
    close()
    scrollTop()
  }

  const confirmRating = (taskId: string, stars: number) => {
    const task = TASK_BY_ID[taskId]
    const quest = state.active.find((a) => a.taskId === taskId)
    if (!task || !quest) return close()
    const points = calcPoints(task, stars, !!quest.buddy)
    const newStreak = state.streak + 1
    const bonus = streakBonusFor(newStreak)
    const newScore = round1(state.score + points + bonus)
    const levelUp = levelIndexFor(newScore) > levelIndexFor(state.score) ? levelFor(newScore) : null
    dispatch({ type: 'COMPLETE', taskId, stars })
    setOverlay({ kind: 'result', data: { taskId, stars, points, bonus, streak: newStreak }, levelUp })
  }

  const closeResult = () => {
    if (overlay.kind === 'result' && overlay.levelUp) {
      setOverlay({ kind: 'levelUp', level: overlay.levelUp })
    } else {
      close()
    }
  }

  const confirmGiveUp = (taskId: string, useShield: boolean) => {
    const shielded = useShield && state.jokers.shield > 0
    dispatch({ type: 'GIVE_UP', taskId, useShield: shielded })
    if (shielded) {
      sfx.joker()
      haptic.joker()
      setToast('🛡️ Štít tě ochránil. Bez trestu.')
      close()
    } else {
      setOverlay({ kind: 'penalty', penalty: CONFIG.giveUpPenalty })
    }
  }

  const reroll = (taskId: string) => {
    const task = TASK_BY_ID[taskId]
    if (!task || state.jokers.reroll <= 0) return
    const next = pickReroll(state, task.difficulty)
    if (!next) {
      setToast('Není za co vyměnit.')
      return
    }
    sfx.joker()
    haptic.joker()
    setOverlay({ kind: 'roll', task: next, candidates: undraftedTasks(state, task.difficulty), rerollOf: taskId })
  }

  const confirmBuddy = (taskId: string, name: string) => {
    dispatch({ type: 'USE_BUDDY', taskId, buddy: name })
    sfx.joker()
    haptic.joker()
    setToast(`🤝 ${name.trim() || 'Parťák'} jde do toho s tebou.`)
    close()
  }

  const done = allDone(state)

  return (
    <div className="min-h-dvh">
      <Header
        onLongPressLogo={() => setOverlay({ kind: 'pin' })}
        onOpenChronicle={() => setOverlay({ kind: 'chronicle' })}
        onOpenJokers={() => setOverlay({ kind: 'jokers' })}
      />

      {!state.draftDone ? (
        <DraftScreen />
      ) : (
        <main className="mx-auto max-w-md px-4 pb-[max(env(safe-area-inset-bottom),32px)] pt-5">
          {state.active.length === 0 && !done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Fáze II · {CONFIG.subtitle}</p>
              <h2 className="mt-1 font-fancy text-2xl gold-text">
                {state.completed.length === 0 ? `Do boje, ${CONFIG.heroName}.` : 'Další quest čeká.'}
              </h2>
              <p className="mt-2 text-parchment-2">
                {state.completed.length === 0
                  ? 'Tohle jsou tvoje questy. Vyber si, kterým začneš.'
                  : 'Klepni na další quest ze seznamu.'}
              </p>
            </motion.div>
          )}

          {done && (
            <div className="parchment mb-5 rounded-3xl p-5 text-center">
              <div className="text-5xl">🏁</div>
              <h2 className="mt-2 font-fancy text-2xl text-[#2b1a08]">Výprava dokončena!</h2>
              <p className="mt-1 text-[#6b4a1f]">Všechny questy splněny. Legenda je zapsána v kronice.</p>
              <Button variant="gold" className="mt-4" onClick={() => setOverlay({ kind: 'chronicle' })}>
                📜 Otevřít kroniku
              </Button>
            </div>
          )}

          <AnimatePresence initial={false}>
            {state.active.map((quest, i) => (
              <ActiveQuestCard
                key={quest.taskId}
                quest={quest}
                index={i}
                onComplete={(taskId) => setOverlay({ kind: 'rate', taskId })}
                onGiveUp={(taskId) => setOverlay({ kind: 'giveUp', taskId })}
                onReroll={reroll}
                onBuddy={(taskId) => setOverlay({ kind: 'buddy', taskId })}
              />
            ))}
          </AnimatePresence>

          {state.active.length > 0 && <Divider className="my-6" />}

          <QuestBoard onPick={(taskId) => setOverlay({ kind: 'confirmPick', taskId })} />

          <p className="mt-8 text-center text-xs text-parchment-3/70">Všechno nejlepší, {CONFIG.heroName}. 🎂</p>
        </main>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),24px)] z-[60] flex justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="rounded-full bg-parchment px-4 py-2 font-display text-sm font-semibold text-ink shadow-xl">{toast}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <PhaseIntroOverlay open={overlay.kind === 'phase2intro'} onClose={close} />
      <RollOverlay
        open={overlay.kind === 'roll'}
        task={overlay.kind === 'roll' ? overlay.task : null}
        candidates={overlay.kind === 'roll' ? overlay.candidates : []}
        isReroll
        onAccept={acceptRoll}
        onCancel={close}
      />
      <ConfirmPickModal
        open={overlay.kind === 'confirmPick'}
        taskId={overlay.kind === 'confirmPick' ? overlay.taskId : null}
        onAccept={(taskId) => {
          dispatch({ type: 'START_QUEST', taskId })
          sfx.accept()
          haptic.success()
          close()
          scrollTop()
        }}
        onCancel={close}
      />
      <RatingModal open={overlay.kind === 'rate'} taskId={overlay.kind === 'rate' ? overlay.taskId : null} onConfirm={confirmRating} onCancel={close} />
      <ResultOverlay open={overlay.kind === 'result'} data={overlay.kind === 'result' ? overlay.data : null} onClose={closeResult} />
      <LevelUpOverlay open={overlay.kind === 'levelUp'} level={overlay.kind === 'levelUp' ? overlay.level : null} onClose={close} />
      <GiveUpModal open={overlay.kind === 'giveUp'} taskId={overlay.kind === 'giveUp' ? overlay.taskId : null} onConfirm={confirmGiveUp} onCancel={close} />
      <PenaltyOverlay open={overlay.kind === 'penalty'} penalty={overlay.kind === 'penalty' ? overlay.penalty : 0} onClose={close} />
      <BuddyModal open={overlay.kind === 'buddy'} taskId={overlay.kind === 'buddy' ? overlay.taskId : null} onConfirm={confirmBuddy} onCancel={close} />
      <JokersModal open={overlay.kind === 'jokers'} onClose={close} />
      <Chronicle open={overlay.kind === 'chronicle'} onClose={close} />
      <PinPad open={overlay.kind === 'pin'} onSuccess={() => setOverlay({ kind: 'admin' })} onCancel={close} />
      <AdminPanel open={overlay.kind === 'admin'} onClose={close} />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}
