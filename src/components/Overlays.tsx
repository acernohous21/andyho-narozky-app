import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CONFIG, DIFFICULTY_META, JOKER_META } from '../data/config'
import { TASK_BY_ID } from '../data/tasks'
import { haptic } from '../lib/haptics'
import { formatMult, formatPoints } from '../lib/points'
import { sfx } from '../lib/sound'
import { useGame } from '../state/GameContext'
import type { JokerType, Level } from '../types'
import { Badge, Button, Divider, Modal, Stars } from './ui'

// ---------- Výsledek ----------

export interface ResultData {
  taskId: string
  stars: number
  points: number
  bonus: number
  streak: number
}

export function ResultOverlay({ open, data, onClose }: { open: boolean; data: ResultData | null; onClose: () => void }) {
  useEffect(() => {
    if (!open || !data) return
    sfx.success()
    haptic.success()
    const colors = ['#f1c75b', '#d4a437', '#fff3c4', '#ff6a4d']
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors, zIndex: 100 })
    const id = window.setTimeout(
      () => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 100 }),
      250,
    )
    const id2 = window.setTimeout(
      () => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 100 }),
      400,
    )
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(id2)
    }
  }, [open, data])

  if (!data) return null
  const task = TASK_BY_ID[data.taskId]

  return (
    <Modal open={open} onClose={onClose} variant="full" dismissable={false}>
      <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
          <div className="text-7xl drop-shadow-[0_0_30px_rgba(241,199,91,0.8)]">🏆</div>
        </motion.div>
        <motion.h2
          className="mt-4 font-fancy text-4xl gold-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Quest splněn!
        </motion.h2>
        <motion.div className="mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Stars value={data.stars} size="lg" />
        </motion.div>
        {task && <p className="mt-4 max-w-sm text-parchment-2 leading-snug">{task.text}</p>}

        <motion.div
          className="mt-6 font-display text-6xl font-black text-gold-2 tabular-nums drop-shadow-[0_0_20px_rgba(241,199,91,0.5)]"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 200, damping: 12 }}
        >
          +{formatPoints(data.points)}
        </motion.div>
        <p className="font-display text-sm uppercase tracking-[0.3em] text-parchment-3">bodů</p>

        {data.bonus > 0 && (
          <motion.div
            className="mt-4 rounded-full bg-ember/20 px-4 py-2 font-display text-ember-2 ring-1 ring-ember/50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
          >
            🔥 Série {data.streak}! Bonus +{data.bonus}
          </motion.div>
        )}
        {data.bonus === 0 && data.streak > 0 && (
          <p className="mt-3 text-sm text-parchment-3">
            🔥 Série {data.streak} · ještě {CONFIG.streakEvery - (data.streak % CONFIG.streakEvery)} do bonusu
          </p>
        )}

        <Button variant="gold" size="lg" className="mt-10 w-full max-w-xs" onClick={onClose}>
          Pokračovat ve výpravě
        </Button>
      </div>
    </Modal>
  )
}

// ---------- Intro Fáze II ----------

export function PhaseIntroOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    sfx.levelUp()
    haptic.levelUp()
  }, [open])

  return (
    <Modal open={open} onClose={onClose} variant="full" dismissable={false}>
      <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
        <motion.p
          className="font-display text-sm uppercase tracking-[0.4em] text-parchment-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Fáze I dokončena
        </motion.p>
        <motion.div
          className="mt-6 grid h-40 w-40 place-items-center rounded-full gold-border bg-ink-3 text-8xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 14 }}
        >
          ⚔️
        </motion.div>
        <motion.h2
          className="mt-8 font-fancy text-5xl gold-text"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 180, damping: 12 }}
        >
          Fáze II
        </motion.h2>
        <motion.p
          className="mt-3 max-w-sm text-parchment-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Questy. Body. Panáky. Sestav si výpravu a ukaž, kdo tu je legenda.
        </motion.p>
        <Button variant="gold" size="lg" className="mt-10 w-full max-w-xs" onClick={onClose}>
          Do boje
        </Button>
      </div>
    </Modal>
  )
}

// ---------- Trest ----------

export function PenaltyOverlay({ open, penalty, onClose }: { open: boolean; penalty: number; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    sfx.fail()
    haptic.fail()
  }, [open])

  return (
    <Modal open={open} onClose={onClose} variant="full" dismissable={false} className="bg-gradient-to-b from-[#3a0d08] to-ink">
      <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1], rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.6 }}
          className="text-8xl drop-shadow-[0_0_30px_rgba(255,106,77,0.8)]"
        >
          🥃
        </motion.div>
        <motion.h2
          className="mt-4 font-fancy text-4xl text-ember-2 animate-shake"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Trestný panák!
        </motion.h2>
        <p className="mt-3 max-w-xs text-parchment-2">Quest vzdán. Osud si žádá oběť a tvoje série je pryč.</p>
        <motion.div
          className="mt-6 font-display text-6xl font-black text-ember-2 tabular-nums"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
        >
          −{formatPoints(penalty)}
        </motion.div>
        <p className="font-display text-sm uppercase tracking-[0.3em] text-parchment-3">bodů</p>
        <Button variant="danger" size="lg" className="mt-10 w-full max-w-xs" onClick={onClose}>
          Přijímám svůj osud
        </Button>
      </div>
    </Modal>
  )
}

// ---------- Level up ----------

export function LevelUpOverlay({ open, level, onClose }: { open: boolean; level: Level | null; onClose: () => void }) {
  useEffect(() => {
    if (!open || !level) return
    sfx.levelUp()
    haptic.levelUp()
    const end = Date.now() + 1200
    const colors = ['#f1c75b', '#ffffff', '#d4a437']
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors, zIndex: 100 })
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors, zIndex: 100 })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [open, level])

  if (!level) return null
  return (
    <Modal open={open} onClose={onClose} variant="full" dismissable={false}>
      <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
        <motion.p
          className="font-display text-sm uppercase tracking-[0.4em] text-parchment-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Nová hodnost
        </motion.p>
        <motion.h2
          className="mt-2 font-fancy text-5xl gold-text"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        >
          LEVEL UP
        </motion.h2>
        <motion.div
          className="mt-8 grid h-40 w-40 place-items-center rounded-full gold-border bg-ink-3 text-8xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 14 }}
        >
          {level.icon}
        </motion.div>
        <motion.p
          className="mt-6 font-display text-3xl font-bold text-parchment"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {CONFIG.heroName} je nyní <span className="gold-text">{level.title}</span>
        </motion.p>
        <Button variant="gold" size="lg" className="mt-10 w-full max-w-xs" onClick={onClose}>
          Sláva!
        </Button>
      </div>
    </Modal>
  )
}

// ---------- Potvrzení výběru ----------

export function ConfirmPickModal({
  open,
  taskId,
  onAccept,
  onCancel,
}: {
  open: boolean
  taskId: string | null
  onAccept: (taskId: string) => void
  onCancel: () => void
}) {
  const task = taskId ? TASK_BY_ID[taskId] : null
  if (!task) return null
  const meta = DIFFICULTY_META[task.difficulty]
  return (
    <Modal open={open} onClose={onCancel} variant="center">
      <div className="dark-panel rounded-3xl p-5 text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Přijmout tento quest?</p>
        <div className="mt-2 flex justify-center">
          <Badge color={meta.color}>
            {meta.icon} {meta.label} {formatMult(CONFIG.multipliers[task.difficulty])}
          </Badge>
        </div>
        <div className="parchment mt-4 rounded-2xl px-4 py-5">
          <p className="font-body text-2xl font-semibold leading-snug text-[#2b1a08]">{task.text}</p>
        </div>
        <div className="mt-4 space-y-2">
          <Button variant="gold" size="lg" full onClick={() => onAccept(task.id)}>
            ⚔️ Přijímám
          </Button>
          <Button variant="ghost" size="sm" full onClick={onCancel}>
            Zpět
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Vzdání ----------

export function GiveUpModal({
  open,
  taskId,
  onConfirm,
  onCancel,
}: {
  open: boolean
  taskId: string | null
  onConfirm: (taskId: string, useShield: boolean) => void
  onCancel: () => void
}) {
  const { state } = useGame()
  const task = taskId ? TASK_BY_ID[taskId] : null
  if (!task) return null
  const hasShield = state.jokers.shield > 0
  return (
    <Modal open={open} onClose={onCancel} variant="center">
      <div className="dark-panel rounded-3xl p-5 text-center">
        <div className="text-5xl">🏳️</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-ember-2">Vzdát quest?</h2>
        <p className="mt-2 text-parchment-2">
          Stojí to <strong className="text-ember-2">−{CONFIG.giveUpPenalty} body</strong>, trestného panáka a přeruší se série.
          Úkol se vrátí do banku.
        </p>
        <div className="mt-5 space-y-2">
          {hasShield && (
            <Button variant="gold" size="lg" full onClick={() => onConfirm(task.id, true)}>
              🛡️ Použít štít (bez trestu)
            </Button>
          )}
          <Button variant="danger" size="lg" full onClick={() => onConfirm(task.id, false)}>
            Vzdávám, dám si panáka
          </Button>
          <Button variant="ghost" size="sm" full onClick={onCancel}>
            Ne, bojuju dál
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Parťák ----------

export function BuddyModal({
  open,
  taskId,
  onConfirm,
  onCancel,
}: {
  open: boolean
  taskId: string | null
  onConfirm: (taskId: string, name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  useEffect(() => {
    if (open) setName('')
  }, [open])
  if (!taskId) return null
  return (
    <Modal open={open} onClose={onCancel} variant="center">
      <div className="dark-panel rounded-3xl p-5 text-center">
        <div className="text-5xl">🤝</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-gold-2">Povolat parťáka</h2>
        <p className="mt-2 text-parchment-2">
          Někdo z party plní quest s tebou. Body budou {formatMult(CONFIG.buddyMultiplier)}. Žolík se spotřebuje.
        </p>
        <input
          className="mt-4 w-full rounded-xl bg-black/40 px-4 py-3 text-center font-display text-lg text-parchment ring-1 ring-gold/40 outline-none focus:ring-gold"
          placeholder="Jméno parťáka"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          autoFocus
        />
        <div className="mt-4 space-y-2">
          <Button variant="gold" size="lg" full onClick={() => onConfirm(taskId, name)}>
            Povolat
          </Button>
          <Button variant="ghost" size="sm" full onClick={onCancel}>
            Zpět
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Žolíky info ----------

export function JokersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame()
  return (
    <Modal open={open} onClose={onClose} variant="sheet">
      <div className="dark-panel rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold/40" />
        <h2 className="text-center font-fancy text-2xl gold-text">Žolíky</h2>
        <p className="mt-1 text-center text-sm text-parchment-3">Použij je moudře, každý je jen na omezený počet použití.</p>
        <Divider className="my-4" />
        <ul className="space-y-3">
          {(Object.keys(JOKER_META) as JokerType[]).map((j) => {
            const m = JOKER_META[j]
            const n = state.jokers[j]
            return (
              <li key={j} className={`flex gap-3 rounded-2xl bg-black/30 p-3 ring-1 ring-gold/20 ${n === 0 ? 'opacity-50' : ''}`}>
                <div className="text-3xl">{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold">{m.label}</span>
                    <span className="font-display text-sm tabular-nums text-gold-2">{n}× k dispozici</span>
                  </div>
                  <p className="text-sm text-parchment-2">{m.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-center text-xs text-parchment-3">
          Bonus za sérii: každé {CONFIG.streakEvery} splněné questy v řadě = +{CONFIG.streakBonus} bodů.
          <br />
          Vzdání: −{CONFIG.giveUpPenalty} body a trestný panák.
        </p>
        <Button variant="outline" full className="mt-4" onClick={onClose}>
          Zavřít
        </Button>
      </div>
    </Modal>
  )
}


