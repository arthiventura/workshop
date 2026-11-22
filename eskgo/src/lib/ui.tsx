import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Category } from './types'

/* ───────── Navegação: poucas telas cheias (stack via hash) + folhas por cima ───────── */

export type View = 'home' | 'cartoes' | 'metas' | 'fatura' | 'assistente'
const VIEWS: View[] = ['home', 'cartoes', 'metas', 'fatura', 'assistente']

export type Sheet =
  | { type: 'add'; txId?: string }
  | { type: 'conta' }
  | { type: 'card'; cardId?: string }
  | { type: 'goal-new' }
  | { type: 'goal-save'; goalId: string }
  | { type: 'budget'; category: Category | 'total' }
  | null

interface Toast {
  id: number
  message: string
  tone?: 'default' | 'success'
  action?: { label: string; run: () => void }
}

interface UI {
  view: View
  go: (v: View) => void
  back: () => void
  sheet: Sheet
  openSheet: (s: Exclude<Sheet, null>) => void
  closeSheet: () => void
  toast: (message: string, opts?: Omit<Toast, 'id' | 'message'>) => void
}

const Ctx = createContext<UI | null>(null)

const readView = (): View => {
  const v = window.location.hash.replace(/^#\/?/, '') as View
  return VIEWS.includes(v) ? v : 'home'
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>(readView)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [toastState, setToast] = useState<Toast | null>(null)
  const depth = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onHash = () => {
      setView(readView())
      setSheet(null)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((v: View) => {
    if (v === readView()) return
    depth.current += 1
    window.location.hash = v === 'home' ? '/' : `/${v}`
  }, [])

  const back = useCallback(() => {
    if (depth.current > 0) {
      depth.current -= 1
      window.history.back()
    } else {
      window.location.hash = '/'
    }
  }, [])

  const toast = useCallback<UI['toast']>((message, opts) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message, ...opts })
    timer.current = window.setTimeout(() => setToast(null), opts?.action ? 5000 : 2800)
  }, [])

  return (
    <Ctx.Provider value={{ view, go, back, sheet, openSheet: setSheet, closeSheet: () => setSheet(null), toast }}>
      {children}
      {toastState && (
        <div
          key={toastState.id}
          role="status"
          aria-live="polite"
          className="animate-toast fixed bottom-6 left-1/2 z-[60] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-full border border-esk-track bg-esk-sheet py-2 pr-2 pl-5 text-[15px] text-esk-text shadow-2xl shadow-black/60"
        >
          {toastState.tone === 'success' && <span aria-hidden className="size-2 shrink-0 rounded-full bg-esk-success" />}
          <span className="py-1.5">{toastState.message}</span>
          {toastState.action ? (
            <button
              type="button"
              onClick={() => {
                toastState.action?.run()
                setToast(null)
              }}
              className="h-9 rounded-full bg-esk-gold px-4 text-sm font-bold text-esk-ink"
            >
              {toastState.action.label}
            </button>
          ) : (
            <span className="w-3" />
          )}
        </div>
      )}
    </Ctx.Provider>
  )
}

export function useUI() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUI fora do UIProvider')
  return v
}
