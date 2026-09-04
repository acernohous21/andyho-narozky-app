import { motion } from 'framer-motion'
import { useRef } from 'react'
import { haptic } from '../lib/haptics'

const LONG_PRESS_MS = 900

/** Erb v hlavičce. Dlouhé podržení otevře admin (PIN). */
export function Crest({ icon, onLongPress, className = '' }: { icon: string; onLongPress: () => void; className?: string }) {
  const timer = useRef<number | null>(null)

  const startPress = () => {
    timer.current = window.setTimeout(() => {
      haptic.joker()
      onLongPress()
    }, LONG_PRESS_MS)
  }
  const endPress = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
  }

  return (
    <motion.button
      type="button"
      aria-label="Erb"
      className={`relative h-14 w-14 shrink-0 rounded-2xl gold-border bg-ink-3 grid place-items-center text-3xl select-none ${className}`}
      whileTap={{ scale: 0.92 }}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onPointerCancel={endPress}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="animate-flicker">{icon}</span>
    </motion.button>
  )
}
