import { useState, type FormEvent } from 'react'
import { Button, Chip, Field, Kicker, SheetFrame } from '../components/ui'
import { Icon } from '../components/Icon'
import { fromDateInput, money, parseMoney, toDateInput, toInput } from '../lib/format'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { CATEGORIES, type Category } from '../lib/types'

/** Folha · Adicionar / editar / apagar gasto — núcleo do estágio 1. */
export function AddExpenseSheet({ txId }: { txId?: string }) {
  const { state, dispatch } = useStore()
  const { closeSheet, toast } = useUI()
  const existing = txId ? state.transactions.find((t) => t.id === txId) : undefined

  const [value, setValue] = useState(existing ? toInput(existing.amount) : '')
  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState<Category>(existing?.category ?? 'Alimentação')
  const [cardId, setCardId] = useState<string | null>(existing ? existing.cardId : (state.cards[0]?.id ?? null))
  const [date, setDate] = useState(toDateInput(existing?.date ?? new Date().toISOString()))
  const [error, setError] = useState<string>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const amount = parseMoney(value)
    if (!amount || amount <= 0) return setError('Digite o valor da compra.')
    if (amount > 1_000_000) return setError('Esse valor parece alto demais.')
    const isToday = date === toDateInput(new Date().toISOString())
    const tx = {
      name: name.trim() || category,
      category,
      cardId,
      amount,
      date: isToday && !existing ? new Date().toISOString() : fromDateInput(date, existing?.date),
      source: existing?.source ?? ('manual' as const),
    }
    if (existing) {
      dispatch({ type: 'tx/update', tx: { ...existing, ...tx } })
      toast('Gasto atualizado', { tone: 'success' })
    } else {
      dispatch({ type: 'tx/add', tx })
      toast(`−${money(amount)} em ${tx.name}`, { tone: 'success' })
    }
    closeSheet()
  }

  const remove = () => {
    if (!existing) return
    dispatch({ type: 'tx/delete', id: existing.id })
    closeSheet()
    toast('Gasto apagado', { action: { label: 'Desfazer', run: () => dispatch({ type: 'tx/add', tx: existing }) } })
  }

  return (
    <SheetFrame title={existing ? 'Detalhe da compra' : 'Novo gasto'} onClose={closeSheet}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-[18px]">
        <label className="flex flex-col gap-1.5">
          <Kicker>Valor da compra</Kicker>
          <span className="flex items-baseline gap-1.5 border-b border-esk-track pb-2.5 focus-within:border-esk-gold">
            <span className="text-[26px] font-bold text-esk-text-2">R$</span>
            <input
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              value={value}
              onChange={(e) => {
                setValue(e.target.value.replace(/[^\d,.]/g, ''))
                setError(undefined)
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'valor-erro' : undefined}
              className="num w-full min-w-0 bg-transparent p-0 text-[52px] leading-none font-bold text-esk-white outline-none placeholder:text-esk-track"
            />
          </span>
          {error && (
            <span id="valor-erro" role="alert" className="text-[13px] text-esk-champagne">
              {error}
            </span>
          )}
        </label>

        <Field label="Onde (opcional)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mercado, Uber, Netflix…"
            maxLength={40}
            className="h-12 w-full rounded-tile border border-esk-track bg-transparent px-4 text-[15px] text-esk-text outline-none placeholder:text-esk-muted focus:border-esk-gold"
          />
        </Field>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="kicker pb-2.5 text-esk-muted">Categoria</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="kicker pb-2.5 text-esk-muted">Pago com</legend>
          <div className="flex flex-wrap gap-2">
            {state.cards.map((c) => (
              <Chip key={c.id} tone="champagne" selected={cardId === c.id} onClick={() => setCardId(c.id)}>
                {c.nickname} •• {c.last4}
              </Chip>
            ))}
            <Chip tone="champagne" selected={cardId === null} onClick={() => setCardId(null)}>
              Dinheiro / Pix
            </Chip>
          </div>
        </fieldset>

        <label className="flex items-center gap-3 rounded-tile bg-esk-surface px-4 py-2.5">
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-xs text-esk-muted">Data</span>
            <input
              type="date"
              value={date}
              max={toDateInput(new Date().toISOString())}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="bg-transparent text-[15px] font-bold text-esk-text outline-none [color-scheme:dark]"
            />
          </span>
        </label>

        {existing && confirmDelete ? (
          <div role="alertdialog" aria-label="Apagar gasto" className="flex flex-col gap-3 rounded-tile border border-esk-track p-4">
            <span className="text-[15px] font-bold">Apagar este gasto?</span>
            <span className="text-[13px] text-esk-text-2">O saldo e o mês voltam ao que eram antes dele.</span>
            <div className="grid grid-cols-2 gap-2">
              <Button tone="ghost" className="h-12" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button tone="light" className="h-12" onClick={remove}>
                Apagar
              </Button>
            </div>
          </div>
        ) : (
          <div className={existing ? 'grid grid-cols-[auto_1fr] gap-2' : 'flex'}>
            {existing && (
              <button
                type="button"
                aria-label="Apagar gasto"
                onClick={() => setConfirmDelete(true)}
                className="grid size-14 place-items-center rounded-tile bg-esk-icon text-esk-text transition hover:bg-esk-track"
              >
                <Icon name="trash" />
              </button>
            )}
            <Button type="submit" className="w-full">
              {existing ? 'Salvar alterações' : 'Salvar gasto'}
            </Button>
          </div>
        )}
      </form>
    </SheetFrame>
  )
}
