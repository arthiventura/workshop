import { Icon, categoryIcon } from './Icon'
import { cx } from './ui'
import { money, relativeDate } from '../lib/format'
import { useStore } from '../lib/store'
import type { Transaction } from '../lib/types'

const TINT: Record<string, string> = {
  Moradia: 'text-esk-bronze',
  Alimentação: 'text-esk-gold',
  Transporte: 'text-esk-offwhite',
  Lazer: 'text-esk-champagne',
  Outros: 'text-esk-text-2',
}

export function TransactionRow({ tx, onOpen, variant = 'card' }: { tx: Transaction; onOpen: () => void; variant?: 'card' | 'table' }) {
  const { state } = useStore()
  const card = tx.cardId ? state.cards.find((c) => c.id === tx.cardId) : null
  const payment = card ? `${card.nickname} •• ${card.last4}` : 'Dinheiro / Pix'
  const icon = (
    <span className={cx('grid size-11 shrink-0 place-items-center rounded-control bg-esk-icon', TINT[tx.category])}>
      <Icon name={categoryIcon(tx.category, tx.name)} />
    </span>
  )
  const amount = <span className="shrink-0 text-[15px] font-bold tracking-[-0.02em] lg:text-base">−{money(tx.amount)}</span>

  if (variant === 'table') {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-4 border-b border-esk-border py-3.5 text-left last:border-b-0 hover:bg-esk-elevated/60"
      >
        {icon}
        <span className="flex min-w-0 flex-[1.2] items-center gap-2 text-base font-bold">
          <span className="truncate">{tx.name}</span>
          {tx.source === 'fatura' && <span className="kicker rounded-full border border-esk-track px-2 py-0.5 text-[10px] text-esk-champagne">IA</span>}
        </span>
        <span className="flex-1 truncate text-sm text-esk-muted">{tx.category}</span>
        <span className="flex-1 truncate text-sm text-esk-muted">{payment}</span>
        <span className="w-28 text-sm text-esk-muted">{relativeDate(tx.date)}</span>
        <span className="w-32 text-right">{amount}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 rounded-tile bg-esk-surface p-3 text-left transition hover:bg-esk-elevated"
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="flex items-center gap-2 text-[15px] font-bold">
          <span className="truncate">{tx.name}</span>
          {tx.source === 'fatura' && <span className="kicker rounded-full border border-esk-track px-1.5 py-px text-[10px] text-esk-champagne">IA</span>}
        </span>
        <span className="truncate text-xs text-esk-muted">
          {tx.category} · {payment} · {relativeDate(tx.date)}
        </span>
      </span>
      {amount}
    </button>
  )
}
