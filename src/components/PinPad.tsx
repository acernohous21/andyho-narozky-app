import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CONFIG } from '../data/config'
import { haptic } from '../lib/haptics'
import { sfx } from '../lib/sound'
import { Button, Modal } from './ui'

export function PinPad({ open, onSuccess, onCancel }: { open: boolean; onSuccess: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(0)

  useEffect(() => {
    if (open) setPin('')
  }, [open])

  useEffect(() => {
    if (pin.length !== CONFIG.adminPin.length) return
    if (pin === CONFIG.adminPin) {
      sfx.joker()
      haptic.joker()
      setPin('')
      onSuccess()
    } else {
      sfx.fail()
      haptic.fail()
      setShake((s) => s + 1)
      const id = window.setTimeout(() => setPin(''), 400)
      return () => window.clearTimeout(id)
    }
  }, [pin, onSuccess])

  const press = (d: string) => {
    sfx.tick()
    haptic.tick()
    setPin((p) => (p.length < CONFIG.adminPin.length ? p + d : p))
  }

  return (
    <Modal open={open} onClose={onCancel} variant="center">
      <div className="dark-panel rounded-3xl p-5 text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-parchment-3">Tajná komnata</p>
        <h2 className="mt-1 font-display text-xl font-bold text-gold-2">Zadej PIN</h2>
        <motion.div key={shake} className="mt-4 flex justify-center gap-3" animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}>
          {Array.from({ length: CONFIG.adminPin.length }).map((_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full ring-2 ring-gold/60 ${i < pin.length ? 'bg-gold-2' : 'bg-transparent'}`}
            />
          ))}
        </motion.div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
            <button
              key={i}
              type="button"
              disabled={k === ''}
              className="h-14 rounded-xl bg-ink-3 font-display text-xl font-bold text-parchment ring-1 ring-gold/30 active:bg-gold/20 disabled:opacity-0"
              onClick={() => (k === '⌫' ? setPin((p) => p.slice(0, -1)) : press(k))}
            >
              {k}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" full className="mt-3" onClick={onCancel}>
          Zpět
        </Button>
      </div>
    </Modal>
  )
}
