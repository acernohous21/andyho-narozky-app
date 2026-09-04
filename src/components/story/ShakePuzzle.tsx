import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { Button } from '../ui'

interface Props {
  title: string
  subtitle: string
  count: number
  initial: number
  onProgress: (n: number) => void
  done: string
  onDone: () => void
}

type Permission = 'unknown' | 'needed' | 'granted' | 'denied'

interface MotionEventCtor {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function ShakePuzzle({ title, subtitle, count, initial, onProgress, done, onDone }: Props) {
  const [n, setN] = useState(Math.min(initial, count))
  const [perm, setPerm] = useState<Permission>('unknown')
  const [sensorSeen, setSensorSeen] = useState(false)
  const lastMag = useRef<number | null>(null)
  const lastShake = useRef(0)
  const finished = n >= count

  const bump = () => {
    setN((v) => {
      if (v >= count) return v
      const next = v + 1
      haptic.tick()
      sfx.tick()
      onProgress(next)
      if (next >= count) {
        sfx.success()
        haptic.success()
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, zIndex: 100, colors: ['#f1c75b', '#fff3c4', '#ff6a4d'] })
      }
      return next
    })
  }

  useEffect(() => {
    const ctor = (window as unknown as { DeviceMotionEvent?: MotionEventCtor }).DeviceMotionEvent
    if (!ctor) {
      setPerm('denied')
      return
    }
    if (typeof ctor.requestPermission === 'function') {
      setPerm('needed')
    } else {
      setPerm('granted')
    }
  }, [])

  useEffect(() => {
    if (perm !== 'granted' || finished) return
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x === null || a.y === null || a.z === null) return
      setSensorSeen(true)
      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
      if (lastMag.current !== null) {
        const delta = Math.abs(mag - lastMag.current)
        const now = Date.now()
        if (delta > 14 && now - lastShake.current > 280) {
          lastShake.current = now
          bump()
        }
      }
      lastMag.current = mag
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perm, finished])

  const askPermission = async () => {
    const ctor = (window as unknown as { DeviceMotionEvent?: MotionEventCtor }).DeviceMotionEvent
    try {
      const res = await ctor?.requestPermission?.()
      setPerm(res === 'granted' ? 'granted' : 'denied')
    } catch {
      setPerm('denied')
    }
  }

  const progress = Math.min(1, n / count)
  const r = 54
  const circ = 2 * Math.PI * r

  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-xl text-parchment">{title}</p>
      <p className="text-sm italic text-parchment-2">{subtitle}</p>

      <motion.div
        className="mx-auto grid h-44 w-44 place-items-center"
        animate={finished ? { scale: [1, 1.1, 1] } : {}}
        key={n}
      >
        <svg viewBox="0 0 120 120" className="absolute h-44 w-44 -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#f1c75b"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - progress) }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </svg>
        <div className="relative">
          <div className="text-5xl">{finished ? '😮‍💨' : n > count * 0.6 ? '😩' : n > count * 0.3 ? '😣' : '😐'}</div>
          <div className="font-display text-2xl font-bold tabular-nums text-gold-2">
            {n} / {count}
          </div>
        </div>
      </motion.div>

      {finished ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="font-display text-parchment-2">{done}</p>
          <Button variant="gold" size="lg" full onClick={onDone}>
            Dál
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {perm === 'needed' && (
            <Button variant="gold" size="lg" full onClick={askPermission}>
              📳 Povolit pohyb telefonu
            </Button>
          )}
          {perm === 'granted' && (
            <p className="animate-pulse font-display text-sm text-parchment-3">
              {sensorSeen ? '📳 Třes!' : '📳 Senzor připraven, zatřes…'}
            </p>
          )}
          {perm === 'denied' && <p className="text-sm text-ember-2">Senzor pohybu není dostupný.</p>}
          <button type="button" className="mt-2 text-xs text-parchment-3 underline" onClick={bump}>
            Nejde to? Klepej sem.
          </button>
        </div>
      )}
    </div>
  )
}
