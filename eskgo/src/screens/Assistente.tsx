import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '../components/Icon'
import { IconButton, Kicker, cx } from '../components/ui'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { askAssistant, fetchInsight, type ChatMessage, type Insight } from '../services/ai'

const SUGGESTIONS = ['Quanto gastei com delivery?', 'Como guardo mais para a viagem?', 'Quais assinaturas cancelar?', 'Fecho o mês no azul?']

/** Estágio 2 · Assistente: "Pergunte sobre seu dinheiro". Uma tela só. */
export function Assistente() {
  const { state } = useStore()
  const { back } = useUI()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [insight, setInsight] = useState<Insight | null>(null)
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState<string>()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchInsight(state).then(setInsight).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, waiting])

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q || waiting) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setError(undefined)
    setWaiting(true)
    try {
      const { reply } = await askAssistant(next, state)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setError('Não consegui responder agora. Tente de novo.')
    } finally {
      setWaiting(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-[18px] px-5 pt-5 pb-6 md:min-h-[calc(100dvh-77px)] md:max-w-[760px] md:px-10 md:pt-8">
      <header className="flex items-center gap-3 pt-2">
        <IconButton icon="back" label="Voltar" onClick={back} />
        <div className="flex flex-col gap-0.5">
          <span className="kicker text-esk-champagne">Assistente Eskgo</span>
          <h1 className="m-0 text-[17px] font-bold">Pergunte sobre seu dinheiro</h1>
        </div>
      </header>

      <section aria-label="Conversa" aria-live="polite" className="flex flex-1 flex-col gap-3">
        {insight && (
          <div className="bg-hero animate-pop flex max-w-[90%] flex-col gap-2 self-start rounded-[22px_22px_22px_6px] p-[18px] text-esk-ink">
            <span className="kicker text-esk-ink-2">Insight · {insight.context}</span>
            <span className="num text-[32px] leading-none font-bold">{insight.number}</span>
            <span className="text-sm leading-[1.45]">{insight.consequence}</span>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <Kicker>Experimente</Kicker>
            <p className="m-0 text-sm text-esk-text-2">As respostas usam os seus lançamentos, cartões e metas.</p>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <p key={i} className="animate-pop m-0 max-w-[78%] self-end rounded-[22px_22px_6px_22px] bg-esk-gold px-4 py-3 text-[15px] leading-[1.4] text-esk-ink">
              {m.content}
            </p>
          ) : (
            <Answer key={i} text={m.content} />
          ),
        )}

        {waiting && (
          <div aria-label="Assistente digitando" className="flex gap-1.5 self-start rounded-[22px] bg-esk-elevated px-4 py-3.5">
            {[0, 150, 300].map((d) => (
              <span key={d} className="size-[7px] animate-bounce rounded-full bg-esk-text-2" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="m-0 self-start rounded-tile border border-esk-track px-4 py-3 text-sm text-esk-champagne">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </section>

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 bg-gradient-to-t from-esk-bg from-70% to-transparent px-5 pt-4 pb-1 md:-mx-10 md:px-10">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !messages.some((m) => m.content === s))
            .slice(0, 3)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={waiting}
                className="h-9 rounded-full border border-esk-track px-3.5 text-[13px] font-medium transition hover:bg-esk-icon disabled:opacity-50"
              >
                {s}
              </button>
            ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 rounded-[28px] border border-esk-border bg-esk-surface py-1.5 pr-1.5 pl-[18px] focus-within:border-esk-track">
          <label htmlFor="pergunta" className="sr-only">
            Pergunta
          </label>
          <input
            id="pergunta"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre seu dinheiro"
            autoComplete="off"
            maxLength={300}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-esk-text outline-none placeholder:text-esk-muted"
          />
          <button
            type="submit"
            aria-label="Enviar"
            disabled={!input.trim() || waiting}
            className={cx('grid size-11 place-items-center rounded-full bg-esk-gold text-esk-ink transition disabled:opacity-40')}
          >
            <Icon name="send" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  )
}

/** Resposta: o primeiro número vira destaque, o resto é a consequência. */
function Answer({ text }: { text: string }) {
  const match = text.match(/^([+−-]?\s?R\$\s?[\d.,]+(?:\/mês)?)[\s.,:]*(.*)$/s)
  return (
    <div className="animate-pop flex max-w-[86%] flex-col gap-1.5 self-start rounded-[22px_22px_22px_6px] border border-esk-border bg-esk-elevated p-4">
      {match ? (
        <>
          <span className="num text-[30px] leading-none font-bold">{match[1]}</span>
          <span className="text-sm leading-[1.45] text-esk-text-2">{match[2]}</span>
        </>
      ) : (
        <span className="text-[15px] leading-[1.45]">{text}</span>
      )}
    </div>
  )
}
