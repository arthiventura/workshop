import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Button, Chip, Kicker, Progress, Screen, ScreenHeader, cx } from '../components/ui'
import { money, moneyShort } from '../lib/format'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { readInvoice, type InvoiceResult } from '../services/ai'

type Phase = { step: 'escolher'; error?: string } | { step: 'lendo'; file: File } | { step: 'encontramos'; file: File; result: InvoiceResult }

const MAX = 15 * 1024 * 1024

/** Estágio 2 · uma tela, três estados: escolher → lendo → encontramos. */
export function Fatura() {
  const [phase, setPhase] = useState<Phase>({ step: 'escolher' })

  const pick = async (file?: File) => {
    if (!file) return
    if (!/pdf|image\//.test(file.type) && !file.name.toLowerCase().endsWith('.pdf')) return setPhase({ step: 'escolher', error: 'Envie um PDF ou uma foto (JPG, PNG, HEIC).' })
    if (file.size > MAX) return setPhase({ step: 'escolher', error: 'Arquivo acima de 15 MB.' })
    setPhase({ step: 'lendo', file })
    try {
      const result = await readInvoice(file)
      if (!result.purchases?.length) throw new Error('Nenhuma compra encontrada nesse arquivo.')
      setPhase({ step: 'encontramos', file, result })
    } catch (e) {
      setPhase({ step: 'escolher', error: e instanceof Error ? e.message : 'Não deu para ler a fatura. Tente de novo.' })
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Fatura" action={<span className="kicker rounded-full border border-esk-track px-2.5 py-1.5 text-esk-champagne">Plus · IA</span>} />
      <p className="m-0 -mt-2 text-[15px] leading-[1.45] text-esk-text-2 md:-mt-4">Mande o PDF ou uma foto. A IA lê, você confirma.</p>
      <div className="w-full max-w-[640px]">
        {phase.step === 'escolher' && <Choose onPick={pick} error={phase.error} />}
        {phase.step === 'lendo' && <Reading file={phase.file} />}
        {phase.step === 'encontramos' && <Found file={phase.file} result={phase.result} onRestart={() => setPhase({ step: 'escolher' })} />}
      </div>
    </Screen>
  )
}

function Choose({ onPick, error }: { onPick: (f?: File) => void; error?: string }) {
  const [drag, setDrag] = useState(false)
  return (
    <section aria-label="Escolher arquivo" className="flex flex-col gap-2.5">
      <label
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          onPick(e.dataTransfer.files[0])
        }}
        className={cx(
          'flex cursor-pointer flex-col items-center gap-3 rounded-card border-[1.5px] border-dashed bg-esk-surface px-5 py-9 text-center transition focus-within:border-esk-gold hover:border-esk-champagne',
          drag ? 'border-esk-gold' : 'border-esk-track',
        )}
      >
        <span className="grid size-14 place-items-center rounded-full bg-esk-champagne text-esk-ink">
          <Icon name="file" size={24} />
        </span>
        <span className="text-[17px] font-bold">Enviar PDF da fatura</span>
        <span className="text-[13px] text-esk-muted">Arraste aqui ou toque para escolher · até 15 MB</span>
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
      </label>
      <label className="flex cursor-pointer items-center gap-3.5 rounded-tile bg-esk-surface p-4 transition focus-within:ring-2 focus-within:ring-esk-gold hover:bg-esk-elevated">
        <span className="grid size-11 place-items-center rounded-full bg-esk-icon">
          <Icon name="camera" />
        </span>
        <span className="flex-1 text-[15px] font-bold">Tirar foto da fatura</span>
        <Icon name="chevron" size={18} className="text-esk-text-2" />
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
      </label>
      {error && (
        <p role="alert" className="m-0 rounded-tile border border-esk-track px-4 py-3 text-sm text-esk-champagne">
          {error}
        </p>
      )}
    </section>
  )
}

function Reading({ file }: { file: File }) {
  const [p, setP] = useState(6)
  useEffect(() => {
    const id = window.setInterval(() => setP((v) => (v < 92 ? v + Math.max(1, (92 - v) * 0.08) : v)), 180)
    return () => window.clearInterval(id)
  }, [])
  const steps = [
    { label: 'Arquivo recebido', done: p > 10 },
    { label: 'Compras extraídas', done: p > 55 },
    { label: 'Procurando assinaturas…', done: p > 85 },
  ]
  return (
    <section aria-label="Lendo sua fatura" aria-live="polite" className="flex flex-col gap-[18px] rounded-card border border-esk-border bg-esk-surface p-6">
      <FileChip file={file} />
      <span className="text-[26px] font-bold tracking-[-0.03em]">Lendo sua fatura…</span>
      <Progress value={p} height={8} color="gradient" label="Progresso da leitura" />
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
        {steps.map((s) => (
          <li key={s.label} className={cx('flex items-center gap-2 transition-colors', s.done ? 'text-esk-success' : 'text-esk-text-2')}>
            {s.done ? <Icon name="check" size={16} strokeWidth={2.4} /> : <span className="size-4 animate-spin rounded-full border-2 border-esk-track border-t-esk-champagne" />}
            {s.label}
          </li>
        ))}
      </ul>
    </section>
  )
}

function FileChip({ file }: { file: File }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-control bg-esk-icon text-esk-champagne">
        <Icon name={file.type.startsWith('image/') ? 'camera' : 'file'} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[15px] font-bold">{file.name}</span>
        <span className="text-xs text-esk-muted">{(file.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB</span>
      </span>
    </div>
  )
}

function Found({ file, result, onRestart }: { file: File; result: InvoiceResult; onRestart: () => void }) {
  const { state, dispatch } = useStore()
  const { go, toast } = useUI()
  const [selected, setSelected] = useState<boolean[]>(() => result.purchases.map(() => true))
  const [cardId, setCardId] = useState<string | null>(state.cards[0]?.id ?? null)
  const [showAll, setShowAll] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const items = result.purchases.map((p, i) => ({ ...p, i }))
  const subs = items.filter((p) => p.subscription)
  const buys = items.filter((p) => !p.subscription)
  const chosen = items.filter((p) => selected[p.i])
  const chosenTotal = chosen.reduce((s, p) => s + p.amount, 0)
  const toggle = (i: number) => setSelected((arr) => arr.map((v, k) => (k === i ? !v : v)))

  const confirm = () => {
    if (!chosen.length) return
    dispatch({
      type: 'tx/import',
      cardId,
      txs: chosen.map((p) => ({
        name: p.name,
        category: p.category,
        amount: p.amount,
        date: new Date(`${p.date}T12:00:00`).toISOString(),
        source: 'fatura' as const,
      })),
    })
    toast(`${chosen.length} lançamentos importados · ${moneyShort(chosenTotal)}`, { tone: 'success' })
    go('home')
  }

  const Row = ({ p }: { p: (typeof items)[number] }) => (
    <label className="flex cursor-pointer items-center gap-3 border-b border-esk-border px-4 py-3.5 last:border-b-0 hover:bg-esk-elevated">
      <input type="checkbox" checked={selected[p.i]} onChange={() => toggle(p.i)} className="size-5 shrink-0 accent-esk-gold" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px]">{p.name}</span>
        <span className="text-xs text-esk-muted">
          {p.category} · {p.date.split('-').reverse().slice(0, 2).join('/')}
        </span>
      </span>
      <span className={cx('text-[15px] font-bold', !selected[p.i] && 'text-esk-muted line-through')}>−{money(p.amount)}</span>
    </label>
  )

  return (
    <section ref={topRef} aria-label="Encontramos" className="animate-pop flex flex-col gap-3.5">
      <div className="bg-hero flex flex-col gap-1.5 rounded-card p-[22px] text-esk-ink">
        <span className="kicker text-esk-ink-2">Encontramos · {file.name}</span>
        <span className="num text-[44px] leading-[1.05] font-bold">{moneyShort(result.total)}</span>
        <span className="text-sm text-esk-ink-2">
          {result.purchases.length} compras · {subs.length} assinaturas{result.mode === 'demo' ? ' · modo demo' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <Kicker className="px-1">Fatura do cartão</Kicker>
        <div className="flex flex-wrap gap-2">
          {state.cards.map((c) => (
            <Chip key={c.id} tone="champagne" selected={cardId === c.id} onClick={() => setCardId(c.id)}>
              {c.nickname} •• {c.last4}
            </Chip>
          ))}
        </div>
      </div>

      {subs.length > 0 && (
        <>
          <div className="flex items-center justify-between px-1 pt-1.5">
            <h2 className="m-0 text-[17px] font-bold">Assinaturas</h2>
            <span className="text-[13px] text-esk-text-2">
              {subs.length} · {money(subs.reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-tile bg-esk-surface">
            {subs.map((p) => (
              <Row key={p.i} p={p} />
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between px-1 pt-1.5">
        <h2 className="m-0 text-[17px] font-bold">Compras</h2>
        <span className="text-[13px] text-esk-text-2">
          {buys.length} · {money(buys.reduce((s, p) => s + p.amount, 0))}
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-tile bg-esk-surface">
        {(showAll ? buys : buys.slice(0, 5)).map((p) => (
          <Row key={p.i} p={p} />
        ))}
      </div>
      {buys.length > 5 && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className="p-1 text-[13px] font-bold text-esk-gold hover:underline">
          {showAll ? 'Mostrar menos' : `Ver as ${buys.length} compras`}
        </button>
      )}

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 pt-2">
        <Button onClick={confirm} disabled={!chosen.length} className="shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          Confirmar {chosen.length} lançamentos
        </Button>
        <button type="button" onClick={onRestart} className="h-11 text-sm font-bold text-esk-text-2 hover:text-esk-text">
          Enviar outra fatura
        </button>
      </div>
    </section>
  )
}
