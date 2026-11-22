import type { Meta, StoryObj } from '@storybook/react-vite'
import tokens from './tokens.json'

const prim = tokens.primitives as Record<string, string>
const sem = tokens.semantic as Record<string, { alias: string; value: string }>

const by = (prefix: string, d: Record<string, unknown>) => Object.keys(d).filter((k) => k.startsWith(prefix + '/'))
const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-4 border-b border-esk-border py-2 text-sm text-esk-text">{children}</div>
)
const Name = ({ n, sub }: { n: string; sub?: string }) => (
  <span className="flex min-w-0 flex-1 flex-col">
    <span className="truncate font-mono text-[13px]">{n}</span>
    {sub && <span className="truncate font-mono text-[11px] text-esk-muted">{sub}</span>}
  </span>
)
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="mb-3 text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
    {children}
  </section>
)
const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[min(960px,92vw)] bg-esk-bg p-6 text-esk-text">{children}</div>
)

function Colors({ source, prefix }: { source: 'primitives' | 'semantic'; prefix: string }) {
  const keys = source === 'primitives' ? by('color', prim) : by('color', sem)
  const list = keys.filter((k) => k.startsWith(prefix))
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
      {list.map((k) => {
        const hex = source === 'primitives' ? prim[k] : sem[k].value
        return (
          <div key={k} className="overflow-hidden rounded-tile border border-esk-border bg-esk-surface">
            <div className="h-16" style={{ background: hex }} />
            <div className="p-3">
              <div className="truncate font-mono text-[12px]">{k}</div>
              <div className="font-mono text-[11px] text-esk-muted">{source === 'semantic' ? `→ ${sem[k].alias}` : hex}</div>
              {source === 'semantic' && <div className="font-mono text-[11px] text-esk-muted">{hex}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Scale({ prefix, render }: { prefix: string; render: (px: number, k: string) => React.ReactNode }) {
  return (
    <>
      {by(prefix, prim).map((k) => (
        <Row key={k}>
          <Name n={k} sub={`--${k.replace(/\//g, '-')}`} />
          <span className="w-16 text-right font-mono text-[12px] text-esk-muted">{prim[k]}</span>
          <span className="flex w-[280px] items-center">{render(Number(prim[k]), k)}</span>
        </Row>
      ))}
    </>
  )
}

function Semantic({ prefix }: { prefix: string }) {
  return (
    <>
      {by(prefix, sem).map((k) => (
        <Row key={k}>
          <Name n={k} sub={`→ ${sem[k].alias}`} />
          <span className="font-mono text-[12px] text-esk-muted">{sem[k].value}</span>
        </Row>
      ))}
    </>
  )
}

type Part = 'cores' | 'tipografia' | 'espacamento' | 'tamanhos' | 'raios' | 'stroke' | 'efeitos' | 'movimento'

function Foundations({ only }: { only?: Part }) {
  const show = (p: Part) => !only || only === p
  return (
    <Page>
      <h1 className="mb-1 text-[32px] font-bold tracking-[-0.03em]">Design tokens</h1>
      <p className="mb-8 text-esk-text-2">
        Duas coleções no Figma: <b>Primitivos</b> (valores brutos) e <b>Semânticos</b> (aliases por papel). Nomes em kebab-case.
      </p>
      {show('cores') && (
<Section title="Cores · semânticas">
        {['bg', 'border', 'text', 'icon', 'feedback', 'category', 'progress', 'gradient', 'overlay'].map((g) => (
          <div key={g} className="mb-6">
            <div className="kicker mb-2 text-esk-muted">color/{g}</div>
            <Colors source="semantic" prefix={`color/${g}/`} />
          </div>
        ))}
      </Section>
)}
      {show('cores') && (
<Section title="Cores · primitivas">
        {['neutral', 'gold', 'bronze', 'champagne', 'sand', 'green'].map((g) => (
          <div key={g} className="mb-6">
            <div className="kicker mb-2 text-esk-muted">color/{g}</div>
            <Colors source="primitives" prefix={`color/${g}/`} />
          </div>
        ))}
      </Section>
)}
      {show('tipografia') && (
<Section title="Tipografia">
        <div className="mb-4 rounded-tile bg-esk-surface p-4">
          <div style={{ fontFamily: 'var(--font-sans)' }} className="text-[22px]">Satoshi — Seu assistente financeiro para grandes conquistas.</div>
          <div className="kicker mt-2 text-esk-muted">IBM Plex Mono — kicker</div>
        </div>
        <Scale prefix="font-size" render={(px) => <span style={{ fontSize: Math.min(px, 44) }} className="truncate font-bold">Aa 123</span>} />
        <Scale prefix="font-weight" render={(w) => <span style={{ fontWeight: w }}>Eskgo</span>} />
        <Scale prefix="letter-spacing" render={(v) => <span style={{ letterSpacing: `${v / 100}em` }} className="text-[20px] font-bold">R$ 12.480,00</span>} />
        <Scale prefix="line-height" render={(v) => <span className="text-[13px]" style={{ lineHeight: v / 100 }}>Linha<br />dupla</span>} />
        <div className="kicker mt-4 mb-1 text-esk-muted">semânticos</div>
        <Semantic prefix="font-size" />
        <Semantic prefix="font-weight" />
        <Semantic prefix="letter-spacing" />
        <Semantic prefix="line-height" />
      </Section>
)}
      {show('espacamento') && (
<Section title="Espaço (gaps) e espaço negativo">
        <Scale prefix="space" render={(v) => (
          v >= 0 ? <span className="h-3 rounded-sm bg-esk-gold" style={{ width: v }} /> : (
            <span className="relative h-3 w-full"><span className="absolute right-1/2 h-3 rounded-sm bg-esk-bronze" style={{ width: -v }} /><span className="absolute left-1/2 h-3 w-px bg-esk-text-2" /></span>
          )
        )} />
        <div className="kicker mt-4 mb-1 text-esk-muted">semânticos</div>
        <Semantic prefix="space" />
      </Section>
)}
      {show('tamanhos') && (
<Section title="Tamanhos e breakpoints">
        <Scale prefix="size" render={(v) => <span className="h-3 max-w-full rounded-sm bg-esk-champagne" style={{ width: Math.min(v, 280) }} />} />
        <Scale prefix="breakpoint" render={() => null} />
        <div className="kicker mt-4 mb-1 text-esk-muted">semânticos</div>
        <Semantic prefix="size" />
        <Semantic prefix="breakpoint" />
      </Section>
)}
      {show('raios') && (
<Section title="Raios">
        <div className="flex flex-wrap gap-4">
          {by('radius', prim).map((k) => (
            <div key={k} className="flex w-24 flex-col items-center gap-2">
              <div className="size-20 border border-esk-gold bg-esk-surface" style={{ borderRadius: Math.min(Number(prim[k]), 40) }} />
              <span className="font-mono text-[11px] text-esk-muted">{k}</span>
              <span className="font-mono text-[11px]">{prim[k]}</span>
            </div>
          ))}
        </div>
        <div className="kicker mt-4 mb-1 text-esk-muted">semânticos</div>
        <Semantic prefix="radius" />
      </Section>
)}
      {show('stroke') && (
<Section title="Stroke">
        <Scale prefix="stroke" render={(v) => <span className="w-full bg-esk-gold" style={{ height: v }} />} />
        <div className="kicker mt-4 mb-1 text-esk-muted">semânticos</div>
        <Semantic prefix="stroke" />
      </Section>
)}
      {show('efeitos') && (
<Section title="Opacidade, desfoque e sombra">
        <Scale prefix="opacity" render={(v) => <span className="h-6 w-24 rounded bg-esk-gold" style={{ opacity: v / 100 }} />} />
        <Scale prefix="blur" render={() => null} />
        <Scale prefix="shadow-offset" render={() => null} />
        <Semantic prefix="opacity" />
        <Semantic prefix="blur" />
        <Semantic prefix="shadow-offset" />
      </Section>
)}
      {show('movimento') && (
<Section title="Movimento e camadas">
        <Scale prefix="duration" render={() => null} />
        <Scale prefix="easing" render={() => null} />
        <Scale prefix="z-index" render={() => null} />
        <Semantic prefix="motion" />
        <Semantic prefix="z-index" />
      </Section>
)}
    </Page>
  )
}

const meta = {
  title: 'Fundamentos/Tokens',
  component: Foundations,
  parameters: { layout: 'fullscreen', docs: { disable: true } },
} satisfies Meta<typeof Foundations>
export default meta
type Story = StoryObj<typeof meta>

export const Todos: Story = {}
export const Cores: Story = { args: { only: 'cores' } }
export const Tipografia: Story = { args: { only: 'tipografia' } }
export const Espacamento: Story = { name: 'Espaçamento e gaps', args: { only: 'espacamento' } }
export const Tamanhos: Story = { args: { only: 'tamanhos' } }
export const Raios: Story = { args: { only: 'raios' } }
export const Stroke: Story = { args: { only: 'stroke' } }
export const Efeitos: Story = { name: 'Opacidade e efeitos', args: { only: 'efeitos' } }
export const Movimento: Story = { args: { only: 'movimento' } }
