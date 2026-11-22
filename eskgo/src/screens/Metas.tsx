import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { Button, IconButton, Kicker, Progress, Ring, Screen, ScreenHeader, cx } from '../components/ui'
import { moneyShort, pct } from '../lib/format'
import { useMonth, useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { fetchInsight, type Insight } from '../services/ai'

export function Metas() {
  const { state, dispatch } = useStore()
  const { openSheet, toast } = useUI()
  const m = useMonth()
  const usedMonth = pct(m.total, state.budget.total)
  const [featured, ...others] = state.goals
  const tiles = m.categories.filter((c) => c.limit > 0 || c.spent > 0)

  const save500 = () => {
    if (!featured) return
    dispatch({ type: 'goal/save', id: featured.id, amount: 500 })
    toast(`R$ 500 guardados em ${featured.name}`, {
      tone: 'success',
      action: { label: 'Desfazer', run: () => dispatch({ type: 'goal/save', id: featured.id, amount: -500 }) },
    })
  }

  return (
    <Screen>
      <ScreenHeader title="Metas" action={<IconButton icon="plus" label="Nova meta" tone="gold" onClick={() => openSheet({ type: 'goal-new' })} />} />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-5">
        {/* Em cima — este mês */}
        <div className="flex flex-col gap-3.5">
          <button
            type="button"
            onClick={() => openSheet({ type: 'budget', category: 'total' })}
            aria-label={`Teto do mês: ${moneyShort(state.budget.total)}. Ajustar`}
            className="flex flex-col gap-3.5 rounded-card border border-esk-border bg-esk-surface p-[22px] text-left transition hover:bg-esk-elevated lg:p-7"
          >
            <Kicker>Este mês · faltam {m.daysLeft} dias</Kicker>
            <span className="flex flex-col gap-1">
              <span className="text-sm text-esk-text-2">{m.remaining >= 0 ? 'Ainda pode gastar' : 'Passou do teto em'}</span>
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="num text-[clamp(36px,11vw,46px)] leading-none font-bold whitespace-nowrap lg:text-[58px]">{moneyShort(Math.abs(m.remaining))}</span>
                <span className="text-[15px] whitespace-nowrap text-esk-text-2">de {moneyShort(state.budget.total)}</span>
              </span>
            </span>
            <Progress value={usedMonth} height={14} color={usedMonth >= 100 ? 'bronze' : 'gold'} label={`${usedMonth}% do teto do mês usado`} />
          </button>

          <section aria-label="Tetos por categoria" className="grid grid-cols-2 gap-2.5 lg:gap-3">
            {tiles.map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() => openSheet({ type: 'budget', category: c.category })}
                className="flex flex-col gap-2.5 rounded-tile border border-esk-border bg-esk-surface p-4 text-left transition hover:bg-esk-elevated lg:p-[18px]"
              >
                <span className="text-sm text-esk-text-2">{c.category}</span>
                <span className="num text-[26px] font-bold lg:text-[30px]">{c.limit > 0 ? `${c.used}%` : '—'}</span>
                <Progress value={c.used} color={c.used >= 100 ? 'bronze' : 'gold'} label={`${c.category}: ${c.used}% do teto`} />
                <span className="text-xs text-esk-muted">
                  {moneyShort(c.spent)} de {c.limit > 0 ? moneyShort(c.limit) : 'sem teto'}
                </span>
              </button>
            ))}
          </section>
        </div>

        {/* Embaixo — guardando */}
        <div className="flex flex-col gap-3.5">
          <Kicker className="px-1 pt-2 lg:hidden">Guardando</Kicker>
          {featured && (
            <article aria-label={featured.name} className="flex flex-col gap-[18px] rounded-card border border-esk-border bg-esk-elevated p-[22px] lg:flex-row lg:flex-wrap lg:items-center lg:gap-6 lg:p-7">
              <div className="flex items-center gap-4 lg:contents">
                <span className="lg:hidden">
                  <Ring value={pct(featured.saved, featured.target)} label={`${pct(featured.saved, featured.target)}% guardado`} />
                </span>
                <span className="hidden lg:block">
                  <Ring value={pct(featured.saved, featured.target)} size={120} stroke={9} label={`${pct(featured.saved, featured.target)}% guardado`} />
                </span>
                <div className="flex flex-col gap-1 lg:hidden">
                  <span className="text-[17px] font-bold">{featured.name}</span>
                  <span className="text-[13px] text-esk-muted">
                    {featured.date ? `${featured.date} · ` : ''}alvo {moneyShort(featured.target)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 lg:flex-1">
                <Kicker className="mb-1 hidden lg:block">Guardando{featured.date ? ` · ${featured.date}` : ''}</Kicker>
                <span className="hidden text-[19px] font-bold lg:block">{featured.name}</span>
                <span className="text-[13px] text-esk-text-2 lg:hidden">Já guardado</span>
                <span className="num text-[38px] leading-[1.05] font-bold lg:text-[40px]">{moneyShort(featured.saved)}</span>
                <span className="hidden text-[13px] text-esk-muted lg:block">de {moneyShort(featured.target)}</span>
              </div>
              <div className="flex flex-col gap-1 lg:basis-full">
                <Button onClick={save500} className="whitespace-nowrap">
                  Guardar R$ 500
                </Button>
                <button
                  type="button"
                  onClick={() => openSheet({ type: 'goal-save', goalId: featured.id })}
                  className="h-11 text-sm font-bold text-esk-text-2 transition hover:text-esk-text"
                >
                  Guardar outro valor
                </button>
              </div>
            </article>
          )}

          <section aria-label="Outras metas" className="flex flex-col gap-1.5 lg:grid lg:grid-cols-3 lg:gap-3">
            {others.map((g) => {
              const p = pct(g.saved, g.target)
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => openSheet({ type: 'goal-save', goalId: g.id })}
                  className="flex flex-col gap-2 rounded-tile bg-esk-surface px-4 py-3.5 text-left transition hover:bg-esk-elevated lg:p-[18px]"
                >
                  <span className="flex justify-between gap-2">
                    <span className="truncate text-[15px] font-bold lg:font-normal lg:text-esk-text-2">{g.name}</span>
                    <span className="text-[15px] font-bold lg:hidden">{p}%</span>
                  </span>
                  <span className="num hidden text-[26px] font-bold lg:block">{p}%</span>
                  <Progress value={p} color="champagne" label={`${g.name}: ${p}%`} />
                  <span className="text-xs text-esk-muted">
                    {moneyShort(g.saved)} de {moneyShort(g.target)}
                  </span>
                </button>
              )
            })}
          </section>

          {state.plus && <AssistantCard />}
        </div>
      </div>
    </Screen>
  )
}

/** Estágio 2 · card lilás de insight que abre o Assistente */
function AssistantCard() {
  const { state } = useStore()
  const { go } = useUI()
  const [insight, setInsight] = useState<Insight | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    fetchInsight(state)
      .then((i) => alive && setInsight(i))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
    // recalcula quando os lançamentos mudam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transactions.length, state.goals])

  return (
    <button
      type="button"
      onClick={() => go('assistente')}
      className="grid gap-2.5 rounded-card bg-esk-champagne p-[22px] text-left text-esk-ink transition hover:brightness-[1.03] lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-6 lg:px-7 lg:py-6"
    >
      <span className="kicker text-[#2A2A2E]">Assistente Eskgo</span>
      <span className={cx('num text-[32px] leading-[1.05] font-bold lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:text-[36px]', !insight && 'opacity-0')}>
        {insight?.number ?? '—'}
      </span>
      {insight ? (
        <span className="text-[15px] leading-[1.4]">{insight.consequence}</span>
      ) : error ? (
        <span className="text-[15px]">Pergunte sobre seu dinheiro.</span>
      ) : (
        <span aria-label="Gerando insight" className="flex flex-col gap-2">
          <span className="h-3.5 w-4/5 animate-pulse rounded bg-esk-ink/10" />
          <span className="h-3.5 w-3/5 animate-pulse rounded bg-esk-ink/10" />
        </span>
      )}
      <span className="flex items-center gap-1.5 text-sm font-bold">
        Perguntar ao assistente <Icon name="chevron" size={16} strokeWidth={2} />
      </span>
    </button>
  )
}
