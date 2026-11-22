import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('kicker text-esk-muted', className)}>{children}</span>
}

export function IconButton({
  icon,
  label,
  tone = 'surface',
  className,
  ...rest
}: { icon: IconName; label: string; tone?: 'surface' | 'gold' | 'ghost' | 'onBrand' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    surface: 'bg-esk-surface border border-esk-border text-esk-text hover:bg-esk-elevated',
    gold: 'bg-esk-gold text-esk-ink hover:brightness-95',
    ghost: 'bg-esk-icon text-esk-text hover:bg-esk-track',
    onBrand: 'bg-esk-ink/8 text-esk-ink hover:bg-esk-ink/12',
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('grid size-11 shrink-0 place-items-center rounded-full transition', tones[tone], className)}
      {...rest}
    >
      <Icon name={icon} strokeWidth={tone === 'gold' ? 2 : 1.9} />
    </button>
  )
}

/** Logo do Eskgo: símbolo (mesmo do favicon) + nome. */
export function Logo({ size = 36 }: { size?: number }) {
  const gid = useId()
  return (
    <span className="flex items-center gap-2.5" role="img" aria-label="Eskgo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A8873F" />
            <stop offset=".45" stopColor="#CFAE5E" />
            <stop offset="1" stopColor="#ECDDB0" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill={`url(#${gid})`} />
        <path d="M41 21H25v22h16M25 32h13" fill="none" stroke="#0A0A0A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-hidden="true" className="text-[20px] font-bold tracking-[-0.03em] text-esk-text">
        Eskgo
      </span>
    </span>
  )
}

export function Avatar({ size = 44, onClick }: { size?: number; onClick?: () => void }) {
  const { state } = useStore()
  const initial = state.user.name.charAt(0).toUpperCase()
  const cls = 'grid shrink-0 place-items-center rounded-full bg-esk-champagne font-bold text-esk-ink'
  const style = { width: size, height: size, fontSize: size * 0.39 }
  return onClick ? (
    <button type="button" onClick={onClick} aria-label="Abrir conta" className={cx(cls, 'transition hover:brightness-95')} style={style}>
      {initial}
    </button>
  ) : (
    <span className={cls} style={style} aria-hidden>
      {initial}
    </span>
  )
}

export function Progress({ value, color = 'gold', height = 4, label }: { value: number; color?: 'gold' | 'champagne' | 'bronze' | 'gradient'; height?: number; label?: string }) {
  const fill = { gold: 'bg-esk-gold', champagne: 'bg-esk-champagne', bronze: 'bg-esk-bronze', gradient: 'bg-gradient-to-r from-esk-bronze to-esk-gold' }[color]
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="w-full overflow-hidden bg-esk-track"
      style={{ height, borderRadius: height }}
    >
      <div className={cx('h-full transition-[width] duration-700 ease-out', fill)} style={{ width: `${v}%`, borderRadius: height }} />
    </div>
  )
}

export function Ring({ value, size = 88, stroke = 8, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${v}%`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#26262A" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E6D3A3"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(v / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.2,.9,.25,1)' }}
      />
      <text x="50%" y="50%" dy="0.35em" textAnchor="middle" fill="#fff" fontSize={size * 0.2} fontWeight={700} style={{ letterSpacing: '-0.04em' }}>
        {Math.round(v)}%
      </text>
    </svg>
  )
}

export function Chip({ selected, onClick, children, tone = 'gold' }: { selected: boolean; onClick: () => void; children: ReactNode; tone?: 'gold' | 'champagne' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        'h-10 rounded-full px-4 text-sm transition',
        selected ? (tone === 'gold' ? 'bg-esk-gold font-bold text-esk-ink' : 'bg-esk-champagne font-bold text-esk-ink') : 'border border-esk-track font-medium text-esk-text hover:bg-esk-icon',
      )}
    >
      {children}
    </button>
  )
}

export function Button({
  children,
  tone = 'gold',
  className,
  loading,
  ...rest
}: { tone?: 'gold' | 'ghost' | 'light' | 'outline'; loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    gold: 'bg-esk-gold text-esk-ink hover:brightness-95',
    ghost: 'bg-esk-icon text-esk-text hover:bg-esk-track',
    light: 'bg-esk-text text-esk-ink hover:bg-white',
    outline: 'border border-esk-track text-esk-text hover:bg-esk-icon',
  }
  return (
    <button
      type="button"
      className={cx('flex h-14 items-center justify-center gap-2 rounded-tile px-6 text-base font-bold transition disabled:opacity-50', tones[tone], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('flex h-8 w-[52px] shrink-0 items-center rounded-full p-[3px] transition', checked ? 'bg-esk-gold' : 'bg-esk-track')}
    >
      <span className={cx('size-[26px] rounded-full transition', checked ? 'translate-x-5 bg-esk-ink' : 'bg-esk-text-2')} />
    </button>
  )
}

/** Cabeçalho das telas cheias: voltar · título · ação. */
export function ScreenHeader({ title, kicker, action }: { title: string; kicker?: string; action?: ReactNode }) {
  const { back } = useUI()
  return (
    <header className="flex flex-col gap-5 pt-2 md:flex-row md:items-center md:gap-4">
      <div className="flex items-center justify-between md:contents">
        <IconButton icon="back" label="Voltar" onClick={back} />
        <div className="md:order-last">{action}</div>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {kicker && <Kicker>{kicker}</Kicker>}
        <h1 className="m-0 text-[29px] font-bold tracking-[-0.03em] md:text-[32px]">{title}</h1>
      </div>
    </header>
  )
}

/** Container das telas: coluna de celular no mobile, mais ar no desktop. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cx('mx-auto flex w-full max-w-[480px] flex-col gap-5 px-5 pt-5 pb-12 md:max-w-[1200px] md:gap-7 md:px-10 md:pt-8 md:pb-16', className)}>
      {children}
    </main>
  )
}

/** Folha: sobe de baixo no celular; diálogo centrado no desktop. */
export function SheetFrame({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('input, button:not([aria-label="Fechar"])')?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <button type="button" aria-label="Fechar folha" tabIndex={-1} onClick={onClose} className="animate-fade-in absolute inset-0 bg-esk-bg/70 backdrop-blur-[2px]" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-sheet-up md:animate-pop relative flex max-h-[92dvh] w-full max-w-[480px] flex-col gap-[18px] overflow-y-auto rounded-t-sheet bg-esk-sheet px-5 pt-3 pb-[max(28px,env(safe-area-inset-bottom))] md:max-w-[520px] md:rounded-sheet md:px-7 md:pt-6"
      >
        <span aria-hidden className="h-1 w-10 shrink-0 self-center rounded bg-esk-track md:hidden" />
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="m-0 text-[22px] font-bold tracking-[-0.02em]">
            {title}
          </h2>
          <IconButton icon="close" label="Fechar" tone="ghost" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <Kicker>{label}</Kicker>
      {children}
      {error && (
        <span role="alert" className="text-[13px] text-esk-champagne">
          {error}
        </span>
      )}
    </label>
  )
}

export const inputCls =
  'h-14 w-full rounded-tile border border-esk-track bg-esk-surface px-4 text-[16px] text-esk-text outline-none transition placeholder:text-esk-muted focus:border-esk-gold'

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-tile border border-dashed border-esk-track px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-esk-icon text-esk-gold">
        <Icon name={icon} />
      </span>
      <span className="text-[17px] font-bold">{title}</span>
      <span className="max-w-[280px] text-sm text-esk-text-2">{body}</span>
      {action}
    </div>
  )
}
