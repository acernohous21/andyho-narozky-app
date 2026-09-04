import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { haptic } from '../lib/haptics'
import { sfx } from '../lib/sound'

// ---------- Button ----------

type Variant = 'gold' | 'parchment' | 'danger' | 'ghost' | 'ghostDark' | 'outline' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASS: Record<Variant, string> = {
  gold: 'bg-gradient-to-b from-gold-2 to-gold text-ink font-display font-bold shadow-[0_6px_0_#8f6a1c,0_10px_24px_rgba(0,0,0,0.4)] active:shadow-[0_2px_0_#8f6a1c] active:translate-y-1',
  parchment: 'parchment font-display font-bold shadow-[0_5px_0_#a48a5b] active:translate-y-1 active:shadow-none',
  danger: 'bg-gradient-to-b from-ember-2 to-ember text-parchment font-display font-bold shadow-[0_6px_0_#7a1f16,0_10px_24px_rgba(0,0,0,0.4)] active:shadow-[0_2px_0_#7a1f16] active:translate-y-1',
  ghost: 'bg-transparent text-parchment-2 font-display font-semibold hover:bg-white/5',
  ghostDark: 'bg-transparent text-[#8a2f22] font-display font-semibold hover:bg-black/5',
  outline: 'bg-transparent text-gold-2 font-display font-semibold ring-2 ring-gold/60 ring-inset',
  dark: 'bg-ink-3 text-parchment font-display font-semibold ring-1 ring-gold/30 ring-inset',
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 rounded-lg',
  md: 'text-base px-5 py-3 rounded-xl',
  lg: 'text-lg px-6 py-4 rounded-2xl',
}

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  full?: boolean
  silent?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'gold',
  size = 'md',
  full,
  silent,
  className = '',
  children,
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${full ? 'w-full' : ''} inline-flex items-center justify-center gap-2 select-none transition-[transform,box-shadow] duration-100 disabled:opacity-40 disabled:pointer-events-none tracking-wide ${className}`}
      disabled={disabled}
      onClick={(e) => {
        if (!silent) {
          sfx.tap()
          haptic.tap()
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

// ---------- Modal ----------

type ModalVariant = 'center' | 'sheet' | 'full'

interface ModalProps {
  open: boolean
  onClose?: () => void
  variant?: ModalVariant
  children: ReactNode
  className?: string
  dismissable?: boolean
}

export function Modal({ open, onClose, variant = 'center', children, className = '', dismissable = true }: ModalProps) {
  const initial =
    variant === 'sheet' ? { y: '100%' } : variant === 'full' ? { opacity: 0, scale: 1.02 } : { opacity: 0, scale: 0.9, y: 20 }
  const animate =
    variant === 'sheet' ? { y: 0 } : variant === 'full' ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: 0 }

  const containerClass =
    variant === 'sheet'
      ? 'items-end'
      : variant === 'full'
        ? 'items-stretch'
        : 'items-center p-4'

  const panelClass =
    variant === 'sheet'
      ? 'w-full max-w-md mx-auto max-h-[92dvh] rounded-t-3xl overflow-y-auto no-scrollbar'
      : variant === 'full'
        ? 'w-full h-[100dvh] overflow-y-auto no-scrollbar'
        : 'w-full max-w-md max-h-[90dvh] overflow-y-auto no-scrollbar rounded-3xl'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className={`fixed inset-0 z-50 flex justify-center ${variant === 'full' ? 'bg-ink/95' : 'bg-black/70'} backdrop-blur-sm ${containerClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => dismissable && onClose?.()}
        >
          <motion.div
            key="panel"
            className={`${panelClass} ${className}`}
            initial={initial}
            animate={animate}
            exit={initial}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------- Stars ----------

interface StarsProps {
  value: number
  onChange?: (n: number) => void
  size?: 'sm' | 'lg'
  className?: string
}

export function Stars({ value, onChange, size = 'sm', className = '' }: StarsProps) {
  const dim = size === 'lg' ? 'text-4xl' : 'text-base'
  return (
    <div className={`inline-flex ${size === 'lg' ? 'gap-1' : 'gap-0.5'} ${className}`} role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value
        const star = (
          <motion.span
            key={n}
            className={`${dim} leading-none ${on ? 'drop-shadow-[0_0_10px_rgba(241,199,91,0.7)]' : 'opacity-30 grayscale'}`}
            animate={on && size === 'lg' ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ⭐
          </motion.span>
        )
        if (!onChange) return star
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} hvězd`}
            className="p-0.5"
            onClick={() => {
              sfx.star(n)
              haptic.tick()
              onChange(n)
            }}
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}

// ---------- Small bits ----------

export function Badge({ children, color, className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-display font-bold uppercase tracking-wider ${className}`}
      style={color ? { backgroundColor: `${color}22`, color, boxShadow: `inset 0 0 0 1px ${color}66` } : undefined}
    >
      {children}
    </span>
  )
}

export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-gold/60 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <span className="text-xs">✦</span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </div>
  )
}
