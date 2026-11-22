import { useState, type FormEvent } from 'react'
import { Avatar, Button, Field, SheetFrame, Switch, cx, inputCls } from '../components/ui'
import { Icon } from '../components/Icon'
import { money, moneyShort, parseMoney, pct, toInput } from '../lib/format'
import { useMonth, useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import type { CardColor, Category } from '../lib/types'

/* ───────── Folha · Conta ───────── */
export function AccountSheet() {
  const { state, dispatch } = useStore()
  const { closeSheet, toast, go } = useUI()
  const [confirm, setConfirm] = useState(false)
  return (
    <SheetFrame title="Conta" onClose={closeSheet}>
      <div className="flex flex-col items-center gap-2.5 pt-1 pb-1">
        <Avatar size={72} />
        <span className="text-[22px] font-bold tracking-[-0.02em]">{state.user.name}</span>
        <span className="text-sm text-esk-text-2">{state.user.email}</span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-tile bg-esk-surface">
        <Row label="Ocultar saldo">
          <Switch checked={state.hideBalance} onChange={(v) => dispatch({ type: 'ui/hideBalance', value: v })} label="Ocultar saldo" />
        </Row>
        <Row label="Eskgo Plus" hint="Fatura e Assistente com IA">
          <Switch
            checked={state.plus}
            onChange={(v) => {
              dispatch({ type: 'ui/plus', value: v })
              toast(v ? 'Plus ativado: Fatura e Assistente liberados' : 'Plus desativado', { tone: 'success' })
            }}
            label="Eskgo Plus"
          />
        </Row>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'demo/reset' })
            closeSheet()
            go('home')
            toast('Dados de exemplo restaurados')
          }}
          className="px-4 py-3.5 text-left text-[15px] font-bold text-esk-text-2 transition hover:bg-esk-elevated"
        >
          Restaurar dados de exemplo
        </button>
      </div>

      {confirm ? (
        <div role="alertdialog" aria-label="Sair" className="flex flex-col gap-2.5 rounded-tile border border-esk-track p-4">
          <span className="text-[15px] font-bold">Deseja sair?</span>
          <span className="text-[13px] text-esk-text-2">Seus lançamentos continuam salvos neste aparelho.</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Button tone="ghost" className="h-12" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
            <Button
              tone="light"
              className="h-12"
              onClick={() => {
                closeSheet()
                dispatch({ type: 'auth/logout' })
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      ) : (
        <Button tone="outline" onClick={() => setConfirm(true)}>
          Sair
        </Button>
      )}
    </SheetFrame>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-esk-border px-4 py-2.5">
      <span className="flex flex-1 flex-col gap-0.5 py-1">
        <span className="text-[15px] font-bold">{label}</span>
        {hint && <span className="text-xs text-esk-muted">{hint}</span>}
      </span>
      {children}
    </div>
  )
}

/* ───────── Folha · Novo cartão ───────── */
/** Folha · Novo / editar cartão (sem tela de detalhe extra, como pede o briefing). */
export function CardSheet({ cardId }: { cardId?: string }) {
  const { state, dispatch } = useStore()
  const { closeSheet, toast } = useUI()
  const existing = cardId ? state.cards.find((c) => c.id === cardId) : undefined
  const asInput = (v: number) => toInput(v).replace(/,00$/, '')

  const [nickname, setNickname] = useState(existing?.nickname ?? '')
  const [last4, setLast4] = useState(existing?.last4 ?? '')
  const [limit, setLimit] = useState(existing ? asInput(existing.limit) : '')
  const [invoice, setInvoice] = useState(existing ? asInput(existing.invoice) : '')
  const [due, setDue] = useState(String(existing?.dueInDays ?? 10))
  const [color, setColor] = useState<CardColor>(existing?.color ?? 'champagne')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const linked = existing ? state.transactions.filter((t) => t.cardId === existing.id).length : 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    const lim = parseMoney(limit)
    const inv = invoice.trim() ? parseMoney(invoice) : 0
    if (!nickname.trim()) errs.nickname = 'Dê um apelido ao cartão.'
    if (!/^\d{4}$/.test(last4)) errs.last4 = 'Os 4 últimos dígitos.'
    if (!lim || lim <= 0) errs.limit = 'Digite o limite.'
    if (inv === null || inv < 0) errs.invoice = 'Valor inválido.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const data = { nickname: nickname.trim(), last4, limit: lim!, invoice: inv ?? 0, dueInDays: Math.max(0, Number(due) || 0), color }
    if (existing) {
      dispatch({ type: 'card/update', card: { ...existing, ...data } })
      toast(`Cartão ${data.nickname} atualizado`, { tone: 'success' })
    } else {
      dispatch({ type: 'card/add', card: data })
      toast(`Cartão ${data.nickname} adicionado`, { tone: 'success' })
    }
    closeSheet()
  }

  const remove = () => {
    if (!existing) return
    dispatch({ type: 'card/delete', id: existing.id })
    toast(`Cartão ${existing.nickname} excluído`)
    closeSheet()
  }

  return (
    <SheetFrame title={existing ? 'Editar cartão' : 'Novo cartão'} onClose={closeSheet}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Apelido" error={errors.nickname}>
          <input className={inputCls} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Ex.: Mercado" maxLength={20} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Final" error={errors.last4}>
            <input className={inputCls} inputMode="numeric" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" />
          </Field>
          <Field label="Limite (R$)" error={errors.limit}>
            <input className={inputCls} inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="3.000" />
          </Field>
          <Field label="Fatura atual (R$)" error={errors.invoice}>
            <input className={inputCls} inputMode="decimal" value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Vence em (dias)">
            <input className={inputCls} inputMode="numeric" value={due} onChange={(e) => setDue(e.target.value.replace(/\D/g, '').slice(0, 2))} />
          </Field>
        </div>
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="kicker pb-2.5 text-esk-muted">Cor</legend>
          <div className="flex gap-3">
            {(['gradient', 'champagne', 'offwhite'] as CardColor[]).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={color === c}
                aria-label={{ gradient: 'Gradiente', champagne: 'Champanhe', offwhite: 'Off-white' }[c]}
                onClick={() => setColor(c)}
                className={cx(
                  'h-12 w-[72px] rounded-xl transition',
                  { gradient: 'bg-wallet', champagne: 'bg-esk-champagne', offwhite: 'bg-esk-offwhite' }[c],
                  color === c ? 'ring-2 ring-esk-gold ring-offset-2 ring-offset-esk-sheet' : 'opacity-70 hover:opacity-100',
                )}
              />
            ))}
          </div>
        </fieldset>
        {existing && confirmDelete ? (
          <div role="alertdialog" aria-label="Excluir cartão" className="flex flex-col gap-2.5 rounded-tile border border-esk-track p-4">
            <span className="text-[15px] font-bold">Excluir o cartão {existing.nickname}?</span>
            <span className="text-[13px] text-esk-text-2">
              {linked > 0
                ? `${linked} ${linked === 1 ? 'gasto continua' : 'gastos continuam'} no histórico, como Dinheiro / Pix.`
                : 'Nenhum gasto está ligado a este cartão.'}
            </span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button tone="ghost" className="h-12" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button tone="light" className="h-12" onClick={remove}>
                Excluir
              </Button>
            </div>
          </div>
        ) : (
          <div className={existing ? 'grid grid-cols-[auto_1fr] gap-2' : 'flex'}>
            {existing && (
              <button
                type="button"
                aria-label="Excluir cartão"
                onClick={() => setConfirmDelete(true)}
                className="grid size-14 place-items-center rounded-tile bg-esk-icon text-esk-text transition hover:bg-esk-track"
              >
                <Icon name="trash" />
              </button>
            )}
            <Button type="submit" className="w-full">
              {existing ? 'Salvar alterações' : 'Adicionar cartão'}
            </Button>
          </div>
        )}
      </form>
    </SheetFrame>
  )
}

/* ───────── Folha · Nova meta ───────── */
export function NewGoalSheet() {
  const { dispatch } = useStore()
  const { closeSheet, toast } = useUI()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = parseMoney(target)
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Dê um nome à meta.'
    if (!t || t <= 0) errs.target = 'Quanto você quer juntar?'
    setErrors(errs)
    if (Object.keys(errs).length) return
    let label: string | undefined
    if (date) {
      const [y, m] = date.split('-').map(Number)
      label = `${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][m - 1]} ${y}`
    }
    dispatch({ type: 'goal/add', goal: { name: name.trim(), target: t!, saved: parseMoney(saved) ?? 0, date: label } })
    toast(`Meta ${name.trim()} criada`, { tone: 'success' })
    closeSheet()
  }

  return (
    <SheetFrame title="Nova meta" onClose={closeSheet}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Nome" error={errors.name}>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Reforma da cozinha" maxLength={32} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor alvo (R$)" error={errors.target}>
            <input className={inputCls} inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10.000" />
          </Field>
          <Field label="Já guardado (R$)">
            <input className={inputCls} inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="Quando (opcional)">
          <input type="month" className={cx(inputCls, '[color-scheme:dark]')} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button type="submit">Criar meta</Button>
      </form>
    </SheetFrame>
  )
}

/* ───────── Folha · Guardar valor ───────── */
export function SaveGoalSheet({ goalId }: { goalId: string }) {
  const { state, dispatch } = useStore()
  const { closeSheet, toast } = useUI()
  const goal = state.goals.find((g) => g.id === goalId)
  const [value, setValue] = useState('500')
  const [error, setError] = useState<string>()
  if (!goal) return null
  const p = pct(goal.saved, goal.target)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = parseMoney(value)
    if (!v || v <= 0) return setError('Digite quanto você guardou.')
    dispatch({ type: 'goal/save', id: goal.id, amount: v })
    toast(`${moneyShort(v)} guardados em ${goal.name}`, {
      tone: 'success',
      action: { label: 'Desfazer', run: () => dispatch({ type: 'goal/save', id: goal.id, amount: -v }) },
    })
    closeSheet()
  }

  return (
    <SheetFrame title={`Guardar em ${goal.name}`} onClose={closeSheet}>
      <p className="m-0 -mt-2 text-sm text-esk-text-2">
        {moneyShort(goal.saved)} de {moneyShort(goal.target)} · {p}%
      </p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="flex gap-2">
          {[100, 250, 500, 1000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setValue(String(v))
                setError(undefined)
              }}
              className={cx(
                'h-10 flex-1 rounded-full text-sm transition',
                parseMoney(value) === v ? 'bg-esk-gold font-bold text-esk-ink' : 'border border-esk-track hover:bg-esk-icon',
              )}
            >
              {moneyShort(v)}
            </button>
          ))}
        </div>
        <Field label="Valor (R$)" error={error}>
          <input className={inputCls} inputMode="decimal" value={value} onChange={(e) => (setValue(e.target.value), setError(undefined))} />
        </Field>
        <Button type="submit">Guardar {parseMoney(value) ? money(parseMoney(value)!) : ''}</Button>
      </form>
    </SheetFrame>
  )
}

/* ───────── Folha · Ajustar teto ───────── */
export function BudgetSheet({ category }: { category: Category | 'total' }) {
  const { state, dispatch } = useStore()
  const { closeSheet, toast } = useUI()
  const m = useMonth()
  const current = category === 'total' ? state.budget.total : state.budget.byCategory[category]
  const spent = category === 'total' ? m.total : (m.categories.find((c) => c.category === category)?.spent ?? 0)
  const [value, setValue] = useState(current ? toInput(current).replace(',00', '') : '')
  const [error, setError] = useState<string>()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = parseMoney(value)
    if (v === null || v < 0) return setError('Digite o teto em reais.')
    dispatch(category === 'total' ? { type: 'budget/total', value: v } : { type: 'budget/category', category, value: v })
    toast(`Teto de ${category === 'total' ? 'o mês' : category} ajustado para ${moneyShort(v)}`, { tone: 'success' })
    closeSheet()
  }

  return (
    <SheetFrame title={category === 'total' ? 'Teto do mês' : `Teto · ${category}`} onClose={closeSheet}>
      <p className="m-0 -mt-2 text-sm text-esk-text-2">Gasto até agora: {moneyShort(spent)}</p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Teto (R$)" error={error}>
          <input className={inputCls} inputMode="decimal" value={value} onChange={(e) => (setValue(e.target.value), setError(undefined))} />
        </Field>
        <Button type="submit">Salvar teto</Button>
      </form>
    </SheetFrame>
  )
}
