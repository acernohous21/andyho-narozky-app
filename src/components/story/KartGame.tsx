import { useEffect, useRef, useState } from 'react'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { Button } from '../ui'

const LANES = 3
const OBSTACLES = ['🚧', '🛞', '🐢', '🛢️', '🐌']
const BEST_KEY = 'andyho-bojovka-kart-best'

interface Obstacle {
  id: number
  lane: number
  y: number // 0 = nahoře, 1 = dole
  icon: string
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

/** Jednoduchá motokárová minihra: vyhýbej se překážkám, klepej vlevo/vpravo. */
export function KartGame() {
  const [running, setRunning] = useState(false)
  const [over, setOver] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [lane, setLane] = useState(1)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])

  const laneRef = useRef(1)
  const obsRef = useRef<Obstacle[]>([])
  const raf = useRef<number | null>(null)
  const last = useRef(0)
  const spawnAt = useRef(0)
  const startAt = useRef(0)
  const nextId = useRef(1)

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = null
  }

  useEffect(() => stop, [])

  const start = () => {
    obsRef.current = []
    setObstacles([])
    laneRef.current = 1
    setLane(1)
    setScore(0)
    setOver(false)
    setRunning(true)
    sfx.vroom()
    haptic.tap()
    startAt.current = performance.now()
    last.current = startAt.current
    spawnAt.current = startAt.current + 600
    raf.current = requestAnimationFrame(frame)
  }

  const frame = (now: number) => {
    const dt = Math.min(50, now - last.current) / 1000
    last.current = now
    const elapsed = (now - startAt.current) / 1000
    const speed = 0.45 + Math.min(0.9, elapsed * 0.03) // obrazovek za sekundu

    // spawn
    if (now >= spawnAt.current) {
      const l = Math.floor(Math.random() * LANES)
      obsRef.current.push({ id: nextId.current++, lane: l, y: -0.1, icon: OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)] })
      spawnAt.current = now + Math.max(420, 1100 - elapsed * 25)
    }

    // move
    obsRef.current = obsRef.current.map((o) => ({ ...o, y: o.y + speed * dt })).filter((o) => o.y < 1.15)

    // collision: kart is at y≈0.85..0.97
    const hit = obsRef.current.some((o) => o.lane === laneRef.current && o.y > 0.8 && o.y < 0.98)
    const s = Math.floor(elapsed * 10)
    setScore(s)
    setObstacles([...obsRef.current])

    if (hit) {
      setRunning(false)
      setOver(true)
      sfx.crash()
      haptic.fail()
      setBest((b) => {
        const nb = Math.max(b, s)
        try {
          localStorage.setItem(BEST_KEY, String(nb))
        } catch {
          /* ignore */
        }
        return nb
      })
      stop()
      return
    }
    raf.current = requestAnimationFrame(frame)
  }

  const steer = (dir: -1 | 1) => {
    if (!running) return
    const next = Math.max(0, Math.min(LANES - 1, laneRef.current + dir))
    if (next !== laneRef.current) {
      laneRef.current = next
      setLane(next)
      haptic.tick()
    }
  }

  return (
    <div className="dark-panel overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between px-4 pt-3 text-xs text-parchment-3">
        <span className="font-display uppercase tracking-wider">Radotín Grand Prix</span>
        <span className="tabular-nums">
          🏁 {score} m · rekord {best} m
        </span>
      </div>

      <div
        className="relative mt-2 h-80 select-none overflow-hidden bg-[#2a2a2a]"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          steer(e.clientX - rect.left < rect.width / 2 ? -1 : 1)
        }}
      >
        {/* pruhy */}
        <div className="absolute inset-y-0 left-1/3 w-0.5 border-l-2 border-dashed border-white/30" />
        <div className="absolute inset-y-0 left-2/3 w-0.5 border-l-2 border-dashed border-white/30" />
        <div className="absolute inset-y-0 left-0 w-2 bg-[repeating-linear-gradient(0deg,#d9463e_0_16px,#fff_16px_32px)]" />
        <div className="absolute inset-y-0 right-0 w-2 bg-[repeating-linear-gradient(0deg,#d9463e_0_16px,#fff_16px_32px)]" />

        {obstacles.map((o) => (
          <div
            key={o.id}
            className="absolute text-3xl"
            style={{
              left: `${(o.lane + 0.5) * (100 / LANES)}%`,
              top: `${o.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {o.icon}
          </div>
        ))}

        <div
          className="absolute text-4xl transition-[left] duration-100"
          style={{ left: `${(lane + 0.5) * (100 / LANES)}%`, top: '90%', transform: 'translate(-50%, -50%) rotate(90deg)' }}
        >
          🏎️
        </div>

        {!running && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 p-4 text-center">
            <div className="space-y-3">
              {over ? (
                <>
                  <div className="text-4xl">💥</div>
                  <p className="font-display text-xl font-bold text-ember-2">Do bariéry!</p>
                  <p className="text-sm text-parchment-2">{score} m. {score >= best && score > 0 ? 'Nový rekord!' : `Rekord: ${best} m.`}</p>
                </>
              ) : (
                <>
                  <div className="text-4xl">🏎️</div>
                  <p className="text-sm text-parchment-2">Klepej vlevo / vpravo a vyhýbej se překážkám.</p>
                </>
              )}
              <Button variant="gold" onClick={start}>
                {over ? 'Ještě jednou' : 'Start'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
