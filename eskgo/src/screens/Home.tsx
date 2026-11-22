import { useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { TransactionRow } from '../components/TransactionRow'
import { Avatar, Empty, IconButton, Kicker, Screen, cx } from '../components/ui'
import { monthName, moneyShort, prevMonthName, splitMoney } from '../lib/format'
import { CATEGORY_COLORS, useMonth, useStore } from '../lib/store'
import { useUI, type View } from '../lib/ui'

export function Home() {
  const { state } = useStore()
  const { openSheet } = useUI()
  return (
    <Screen>
      {/* Topo do celular. No desktop o logo e o perfil ficam na barra fixa (components/TopBar). */}
      <header className="flex items-center gap-3 pt-2 md:hidden">
        <Avatar size={44} onClick={() => openSheet({ type: 'conta' })} />
        <div className="flex flex-col gap-0.5">
          <Kicker>Finanças</Kicker>
          <span className="text-[17px] font-bold">Olá, {state.user.name}</span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-5">
        <div className="flex flex-col gap-5 lg:gap-4">
          <BalanceHero />
          <Shortcuts />
        </div>
        <MonthCard />
      </div>

      <Transactions />
    </Screen>
  )
}

function BalanceHero() {
  const { state, dispatch } = useStore()
  const { go } = useUI()
  const { main, cents } = splitMoney(state.balance)
  const hidden = state.hideBalance
  const today = useMonth().transactions.filter((t) => new Date(t.date).toDateString() === new Date().toDateString()).length
  return (
    <section aria-label="Saldo" className="bg-hero flex min-h-[220px] flex-col gap-1.5 rounded-card px-6 pt-[22px] pb-6 text-esk-ink lg:min-h-[260px] lg:px-8 lg:pt-7 lg:pb-[30px]">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold tracking-[-0.02em] lg:text-lg">Saldo</span>
        <div className="flex gap-2">
          {state.plus && <IconButton icon="sparkle" label="Abrir assistente" tone="onBrand" onClick={() => go('assistente')} />}
          <IconButton
            icon={hidden ? 'eyeOff' : 'eye'}
            label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
            tone="onBrand"
            onClick={() => dispatch({ type: 'ui/hideBalance' })}
          />
        </div>
      </div>
      <div className="num mt-auto flex items-baseline gap-0.5 pt-6 whitespace-nowrap" aria-live="polite">
        {hidden ? (
          <span className="text-[clamp(38px,11.5vw,54px)] leading-none font-bold lg:text-[66px]" aria-label="Saldo oculto">
            R$ ••••••
          </span>
        ) : (
          <>
            <span className="text-[clamp(38px,11.5vw,54px)] leading-none font-bold lg:text-[66px]">{main}</span>
            <span className="text-[clamp(18px,5vw,22px)] font-bold lg:text-[26px]">{cents}</span>
          </>
        )}
      </div>
      <span className="mt-2 text-[13px] text-esk-ink-2 lg:text-sm">
        Atualizado agora · {today} {today === 1 ? 'lançamento' : 'lançamentos'} hoje
      </span>
    </section>
  )
}

function Shortcuts() {
  const { state } = useStore()
  const { go, openSheet } = useUI()
  const items: { label: string; icon: IconName; run: () => void; primary?: boolean; tint?: string }[] = [
    { label: 'Novo gasto', icon: 'plus', run: () => openSheet({ type: 'add' }), primary: true },
    ...(state.plus ? [{ label: 'Fatura', icon: 'file' as IconName, run: () => go('fatura' as View), tint: 'text-esk-champagne' }] : []),
    { label: 'Cartões', icon: 'card', run: () => go('cartoes') },
    { label: 'Metas', icon: 'target', run: () => go('metas') },
  ]
  const four = items.length === 4
  /*
   * O layout do atalho depende da largura disponível para a fileira (container query),
   * não da tela: com a Fatura ligada são 4 atalhos e cada um fica mais estreito.
   *   estreito → ícone em cima, texto embaixo (quebra só entre palavras)
   *   largo    → ícone ao lado do texto (3 atalhos a partir de 600px, 4 a partir de 800px)
   */
  const tile = four
    ? '@min-[800px]:flex-row @min-[800px]:justify-start @min-[800px]:gap-3 @min-[800px]:p-[18px] @min-[800px]:text-left'
    : '@min-[600px]:flex-row @min-[600px]:justify-start @min-[600px]:gap-3 @min-[600px]:p-[18px] @min-[600px]:text-left'
  return (
    <div className="@container">
      <nav aria-label="Atalhos" className={cx('grid gap-2.5 @min-[480px]:gap-3', four ? 'grid-cols-4' : 'grid-cols-3')}>
        {items.map((it) => (
          <button
            key={it.label}
            type="button"
            onClick={it.run}
            className={cx(
              'flex min-w-0 flex-col items-center justify-start gap-2.5 rounded-tile px-1.5 pt-4 pb-3.5 text-center text-[13px] font-bold transition @min-[480px]:text-[15px]',
              tile,
              it.primary ? 'bg-esk-gold text-esk-ink hover:brightness-95' : 'border border-esk-border bg-esk-surface text-esk-text hover:bg-esk-elevated',
            )}
          >
            <span className={cx('grid size-11 shrink-0 place-items-center rounded-full', it.primary ? 'bg-esk-ink/8' : 'bg-esk-icon', it.tint)}>
              <Icon name={it.icon} strokeWidth={it.primary ? 2 : 1.8} />
            </span>
            <span className="min-w-0 leading-tight text-balance hyphens-none">{it.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function MonthCard() {
  const m = useMonth()
  const { go } = useUI()
  const top = m.ranked.slice(0, 3)
  return (
    <section aria-label="Este mês" className="flex flex-col gap-4 rounded-card border border-esk-border bg-esk-surface px-[22px] pt-[22px] pb-[18px] lg:gap-5 lg:p-7">
      <div className="flex items-center justify-between">
        <Kicker>Este mês · {monthName()}</Kicker>
        <button type="button" onClick={() => go('metas')} className="text-[13px] font-bold text-esk-gold hover:underline">
          Metas
        </button>
      </div>
      <div className="flex flex-col gap-1.5 lg:gap-2">
        <span className="num text-[42px] leading-none font-bold lg:text-[52px]">{moneyShort(m.total)}</span>
        <span className={cx('text-[13px] lg:text-sm', m.vsPrevious >= 0 ? 'text-esk-success' : 'text-esk-champagne')}>
          {m.vsPrevious >= 0 ? `↓ ${m.vsPrevious}% menos que em ${prevMonthName()}` : `↑ ${-m.vsPrevious}% mais que em ${prevMonthName()}`}
        </span>
      </div>
      {m.total > 0 ? (
        <>
          <div aria-hidden className="flex h-3 gap-1 lg:h-3.5">
            {m.ranked.map((c) => (
              <span key={c.category} className="rounded-[14px] transition-all duration-700" style={{ flex: `${c.spent} 1 0`, background: CATEGORY_COLORS[c.category] }} />
            ))}
          </div>
          <ul className="m-0 flex list-none flex-col p-0">
            {top.map((c) => (
              <li key={c.category} className="flex items-center gap-2.5 border-b border-esk-border py-2.5 last:border-b-0 lg:py-3.5">
                <span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.category] }} />
                <span className="flex-1 text-[15px] lg:text-base">{c.category}</span>
                <span className="text-[13px] text-esk-text-2 lg:text-sm">{c.share}%</span>
                <span className="w-24 text-right text-[15px] font-bold lg:w-28 lg:text-base">{moneyShort(c.spent)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="m-0 text-sm text-esk-text-2">Nenhum gasto neste mês ainda.</p>
      )}
    </section>
  )
}

function Transactions() {
  const { state } = useStore()
  const { openSheet } = useUI()
  const [all, setAll] = useState(false)
  const sorted = [...state.transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const list = all ? sorted : sorted.slice(0, 3)
  const open = (id: string) => openSheet({ type: 'add', txId: id })

  return (
    <section aria-label="Transações" className="flex flex-col gap-1.5 lg:rounded-card lg:border lg:border-esk-border lg:bg-esk-surface lg:px-7 lg:pt-6 lg:pb-3">
      <div className="flex items-center justify-between px-1 pt-1 pb-2 lg:px-0 lg:pt-0">
        <h2 className="m-0 text-[19px] font-bold tracking-[-0.02em] lg:text-[21px]">Transações</h2>
        {sorted.length > 3 && (
          <button type="button" onClick={() => setAll((v) => !v)} className="text-[13px] font-bold text-esk-gold hover:underline lg:text-sm">
            {all ? 'Ver menos' : 'Ver todas'}
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <Empty
          icon="plus"
          title="Nada por aqui ainda"
          body="Fez uma compra? Toque em Novo gasto e digite o valor. O saldo e o mês se atualizam na hora."
          action={
            <button type="button" onClick={() => openSheet({ type: 'add' })} className="mt-2 h-11 rounded-full bg-esk-gold px-5 text-sm font-bold text-esk-ink">
              Novo gasto
            </button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-1.5 lg:hidden">
            {list.map((t) => (
              <TransactionRow key={t.id} tx={t} onOpen={() => open(t.id)} />
            ))}
          </div>
          <div className="hidden lg:block">
            {list.map((t) => (
              <TransactionRow key={t.id} tx={t} variant="table" onOpen={() => open(t.id)} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
