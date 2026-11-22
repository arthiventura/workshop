import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Empty, IconButton, Progress, Screen, ScreenHeader, cx } from '../components/ui'
import { moneyShort, pct } from '../lib/format'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import type { Card, CardColor } from '../lib/types'

const FACE: Record<CardColor, string> = {
  gradient: 'bg-wallet',
  champagne: 'bg-esk-champagne',
  offwhite: 'bg-esk-offwhite',
}

/** posição de cada camada da pilha, da frente (0) para trás */
const LAYERS = [
  { top: 88, inset: 0, h: 210 },
  { top: 44, inset: 8, h: 210 },
  { top: 0, inset: 16, h: 200 },
]

export function Cartoes() {
  const { state } = useStore()
  const { openSheet } = useUI()
  const [frontId, setFrontId] = useState(state.cards[0]?.id)
  const front = state.cards.find((c) => c.id === frontId) ?? state.cards[0]
  const order = front ? [front, ...state.cards.filter((c) => c.id !== front.id)] : []
  const used = front ? pct(front.invoice, front.limit) : 0

  return (
    <Screen>
      <ScreenHeader
        title="Cartões"
        kicker={`Carteira · ${state.cards.length} ${state.cards.length === 1 ? 'cartão' : 'cartões'}`}
        action={<IconButton icon="plus" label="Novo cartão" tone="gold" onClick={() => openSheet({ type: 'card' })} />}
      />

      {!front ? (
        <Empty icon="card" title="Nenhum cartão" body="Cadastre o apelido, o final e o limite. O resto o Eskgo calcula com o que você digitar." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-5">
          <div className="flex flex-col gap-5">
            <section aria-label="Pilha de cartões" className="relative h-[298px]">
              {order
                .slice(0, 3)
                .map((card, i) => ({ card, i }))
                .reverse()
                .map(({ card, i }) =>
                  i === 0 ? (
                    <FrontCard key={card.id} card={card} onEdit={() => openSheet({ type: 'card', cardId: card.id })} />
                  ) : (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setFrontId(card.id)}
                      aria-label={`Trazer ${card.nickname} para a frente`}
                      className={cx(
                        'absolute flex items-start justify-between rounded-wallet px-[22px] py-4 text-left text-sm font-bold text-esk-ink transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1)] hover:-translate-y-1',
                        FACE[card.color],
                      )}
                      style={{ top: LAYERS[i].top, left: LAYERS[i].inset, right: LAYERS[i].inset, height: LAYERS[i].h }}
                    >
                      <span>{card.nickname}</span>
                      <span className="font-medium text-esk-ink-2">•• {card.last4}</span>
                    </button>
                  ),
                )}
            </section>
            <p className="-mt-1.5 text-center text-xs text-esk-muted">
              {state.cards.length > 1 ? 'Toque na pilha para trocar · no cartão da frente para editar' : 'Toque no cartão para editar'}
            </p>

            <section aria-label="Limite usado" className="flex flex-col gap-3 rounded-card border border-esk-border bg-esk-surface px-[22px] py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] text-esk-text-2">Limite usado</span>
                <span className="num text-[26px] font-bold">{used}%</span>
              </div>
              <Progress value={used} height={8} label={`${used}% do limite usado`} />
              <div className="flex justify-between text-[13px] text-esk-muted">
                <span>{moneyShort(front.invoice)} usados</span>
                <span>{moneyShort(Math.max(0, front.limit - front.invoice))} livres</span>
              </div>
            </section>
          </div>

          <section aria-label="Próximas faturas" className="flex flex-col gap-1.5 lg:rounded-card lg:border lg:border-esk-border lg:bg-esk-surface lg:p-6">
            <h2 className="m-0 px-1 pt-1 pb-2 text-[19px] font-bold tracking-[-0.02em] lg:px-0 lg:pt-0">Próximas faturas</h2>
            {[...state.cards]
              .sort((a, b) => a.dueInDays - b.dueInDays)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFrontId(c.id)}
                  className={cx(
                    'flex items-center gap-3.5 rounded-tile bg-esk-surface p-3 text-left transition hover:bg-esk-elevated lg:bg-esk-elevated',
                    c.id === front.id && 'ring-1 ring-esk-track',
                  )}
                >
                  <span aria-hidden className={cx('h-[30px] w-11 shrink-0 rounded-lg', FACE[c.color])} />
                  <span className="flex flex-1 flex-col gap-[3px]">
                    <span className="text-[15px] font-bold">{c.nickname}</span>
                    <span className="text-xs text-esk-muted">
                      •• {c.last4} · vence em {c.dueInDays} dias
                    </span>
                  </span>
                  <span className="text-[15px] font-bold">{moneyShort(c.invoice)}</span>
                </button>
              ))}
          </section>
        </div>
      )}
    </Screen>
  )
}

/** Cartão da frente: tocar abre a folha de edição. */
function FrontCard({ card, onEdit }: { card: Card; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`Editar cartão ${card.nickname}, final ${card.last4}`}
      className={cx(
        'group animate-pop absolute right-0 left-0 flex flex-col justify-between rounded-wallet px-[22px] py-5 text-left text-esk-ink shadow-[0_-12px_30px_rgba(0,0,0,0.35)] transition hover:brightness-[1.03]',
        FACE[card.color],
      )}
      style={{ top: LAYERS[0].top, height: LAYERS[0].h }}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-base font-bold">{card.nickname}</span>
        <span className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-esk-ink-2">•• {card.last4}</span>
          <span aria-hidden className="grid size-8 place-items-center rounded-full bg-esk-ink/8 transition group-hover:bg-esk-ink/15">
            <Icon name="edit" size={15} strokeWidth={2} />
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-esk-ink-2">Fatura atual</span>
        <span className="num text-[clamp(34px,10.5vw,42px)] leading-none font-bold whitespace-nowrap">{moneyShort(card.invoice)}</span>
      </div>
      <div className="flex w-full justify-between text-[13px] text-esk-ink-2">
        <span>Vence em {card.dueInDays} dias</span>
        <span>Limite {moneyShort(card.limit)}</span>
      </div>
    </button>
  )
}
