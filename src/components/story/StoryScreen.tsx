import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CONFIG } from '../../data/config'
import { STORY, type StoryStep } from '../../data/story'
import { haptic } from '../../lib/haptics'
import { setSoundEnabled, sfx } from '../../lib/sound'
import { canAdvanceStory } from '../../state/gameReducer'
import { useGame } from '../../state/GameContext'
import { Crest } from '../Crest'
import { Button } from '../ui'
import { KartGame } from './KartGame'
import { LockPuzzle } from './LockPuzzle'
import { MatchPuzzle } from './MatchPuzzle'
import { MorsePuzzle } from './MorsePuzzle'
import { RebusPuzzle } from './RebusPuzzle'
import { ShakePuzzle } from './ShakePuzzle'
import { TapWork } from './TapWork'

interface Props {
  onOpenAdmin: () => void
}

function chapterLabel(stepIndex: number): string {
  for (let i = stepIndex; i >= 0; i--) {
    const s = STORY[i]
    if (s.type === 'chapter') return `${s.title}${s.subtitle ? ' · ' + s.subtitle : ''}`
  }
  return 'Fáze I'
}

export function StoryScreen({ onOpenAdmin }: Props) {
  const { state, dispatch } = useGame()
  const index = state.story.step
  const step: StoryStep = STORY[index]
  const [flash, setFlash] = useState(false)
  const canAdvance = canAdvanceStory(state)

  const next = () => {
    if (!canAdvance) return
    sfx.tap()
    haptic.tap()
    dispatch({ type: 'STORY_NEXT' })
    window.scrollTo({ top: 0 })
  }

  // efekty textových kroků
  useEffect(() => {
    if (step.type !== 'text' || !step.effect) return
    if (step.effect === 'buzz') {
      haptic.fail()
      sfx.tick()
    }
    if (step.effect === 'confetti') {
      sfx.success()
      haptic.success()
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 100, colors: ['#f1c75b', '#fff3c4', '#ff6a4d', '#4fb37f'] })
    }
    if (step.effect === 'flash') {
      sfx.levelUp()
      haptic.levelUp()
      setFlash(true)
      const id = window.setTimeout(() => setFlash(false), 700)
      return () => window.clearTimeout(id)
    }
    if (step.effect === 'shake') haptic.fail()
  }, [index, step])

  // brána: jakmile parta odemkne, jde se dál
  useEffect(() => {
    if (step.type !== 'gate' || !canAdvance) return
    sfx.joker()
    haptic.joker()
    const id = window.setTimeout(() => dispatch({ type: 'STORY_NEXT' }), 900)
    return () => window.clearTimeout(id)
  }, [step, canAdvance, dispatch])

  const tappable = step.type === 'text' || step.type === 'chapter'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-gold/20 bg-ink/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Crest icon="📖" onLongPress={onOpenAdmin} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-fancy text-lg leading-tight gold-text">{CONFIG.appTitle}</h1>
            <p className="truncate text-sm text-parchment-3">
              <span className="font-display font-semibold text-parchment-2">Fáze I</span> · {chapterLabel(index)}
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-ink-3 px-3 py-2 text-lg ring-1 ring-gold/30"
            aria-label={state.sound ? 'Vypnout zvuk' : 'Zapnout zvuk'}
            onClick={() => {
              dispatch({ type: 'TOGGLE_SOUND' })
              if (!state.sound) {
                setSoundEnabled(true)
                sfx.tap()
              }
            }}
          >
            {state.sound ? '🔊' : '🔇'}
          </button>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-md overflow-hidden rounded-full bg-black/50">
          <motion.div className="h-full bg-gold/70" animate={{ width: `${((index + 1) / STORY.length) * 100}%` }} />
        </div>
      </header>

      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 bg-ember-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        )}
      </AnimatePresence>

      <main
        className={`mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),24px)] pt-5 ${
          tappable ? 'cursor-pointer justify-center' : ''
        }`}
        onClick={tappable ? next : undefined}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, pointerEvents: 'none', transition: { duration: 0.15 } }}
            transition={{ duration: 0.22 }}
            className="flex flex-1 flex-col"
          >
            <StepView step={step} index={index} onNext={next} />
          </motion.div>
        </AnimatePresence>

        {tappable && (
          <p className="mt-8 animate-pulse text-center font-display text-xs uppercase tracking-[0.3em] text-parchment-3/70">
            Klepni pro pokračování
          </p>
        )}
      </main>
    </div>
  )
}

function StepView({ step, index, onNext }: { step: StoryStep; index: number; onNext: () => void }) {
  const { state, dispatch } = useGame()

  switch (step.type) {
    case 'chapter':
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.p
            className="font-display text-sm uppercase tracking-[0.4em] text-parchment-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {step.title}
          </motion.p>
          {step.subtitle && (
            <motion.h2
              className="mt-3 font-fancy text-4xl gold-text"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 14 }}
            >
              {step.subtitle}
            </motion.h2>
          )}
        </div>
      )

    case 'text': {
      const style = step.style ?? 'normal'
      return (
        <motion.div
          className="flex flex-1 flex-col items-center justify-center text-center"
          animate={step.effect === 'buzz' || step.effect === 'shake' ? { x: [0, -6, 6, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {style === 'shout' && <p className="font-fancy text-4xl leading-tight gold-text">{step.text}</p>}
          {style === 'normal' && <p className="font-body text-2xl leading-snug text-parchment">{step.text}</p>}
          {style === 'whisper' && <p className="font-body text-3xl italic text-parchment-3">{step.text}</p>}
          {style === 'note' && (
            <p className="rounded-2xl bg-black/30 p-4 text-base italic leading-snug text-parchment-3 ring-1 ring-gold/20">{step.text}</p>
          )}
        </motion.div>
      )
    }

    case 'choice':
      return <ChoiceView key={index} prompt={step.prompt} options={step.options} onNext={onNext} />

    case 'morse':
      return <MorsePuzzle intro={step.intro} message={step.message} accept={step.accept} success={step.success} onDone={onNext} />

    case 'lock':
      return <LockPuzzle intro={step.intro} answer={step.answer} success={step.success} onDone={onNext} />

    case 'tapwork':
      return <TapWork title={step.title} button={step.button} count={step.count} quips={step.quips} done={step.done} onDone={onNext} />

    case 'shake':
      return (
        <ShakePuzzle
          title={step.title}
          subtitle={step.subtitle}
          count={step.count}
          initial={state.story.vars[`shake${index}`] ?? 0}
          onProgress={(n) => dispatch({ type: 'STORY_SET_VAR', key: `shake${index}`, value: n })}
          done={step.done}
          onDone={onNext}
        />
      )

    case 'rebus':
      return <RebusPuzzle intro={step.intro} words={step.words} success={step.success} onDone={onNext} />

    case 'match':
      return (
        <MatchPuzzle
          intro={step.intro}
          rounds={step.rounds}
          round={state.story.vars[`match${index}`] ?? 0}
          onRound={(n) => dispatch({ type: 'STORY_SET_VAR', key: `match${index}`, value: n })}
          success={step.success}
          onDone={onNext}
        />
      )

    case 'gate':
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.div
            className="grid h-32 w-32 place-items-center rounded-full gold-border bg-ink-3 text-6xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🔏
          </motion.div>
          <h2 className="mt-6 font-fancy text-3xl gold-text">{step.title}</h2>
          <p className="mt-2 text-parchment-2">{step.text}</p>
          <p className="mt-6 animate-pulse font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Čekáš na partu…</p>
        </div>
      )

    case 'finale':
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl">🏁</div>
            <h2 className="mt-2 font-fancy text-3xl gold-text">{step.title}</h2>
            <p className="mt-2 text-parchment-2">{step.text}</p>
          </div>
          <KartGame />
          <p className="animate-pulse text-center font-display text-xs uppercase tracking-[0.3em] text-parchment-3">
            Fáze II čeká na odemknutí
          </p>
        </div>
      )

    default:
      return null
  }
}

function ChoiceView({
  prompt,
  options,
  onNext,
}: {
  prompt: string
  options: { label: string; reply?: string }[]
  onNext: () => void
}) {
  const [chosen, setChosen] = useState<number | null>(null)
  const reply = chosen !== null ? options[chosen].reply : undefined

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {prompt && <p className="font-display text-xl text-parchment-2">{prompt}</p>}
      {chosen === null ? (
        <div className="mt-6 w-full space-y-3">
          {options.map((o, i) => (
            <Button
              key={i}
              variant={i === 0 ? 'gold' : 'outline'}
              size="lg"
              full
              onClick={() => {
                if (o.reply) setChosen(i)
                else onNext()
              }}
            >
              {o.label}
            </Button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full space-y-6">
          <p className="font-body text-2xl leading-snug text-parchment">{reply}</p>
          <Button variant="gold" size="lg" full onClick={onNext}>
            Dál
          </Button>
        </motion.div>
      )}
    </div>
  )
}
