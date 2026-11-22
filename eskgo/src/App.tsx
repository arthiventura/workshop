import { lazy, Suspense, useEffect } from 'react'
import { StoreProvider, useStore } from './lib/store'
import { UIProvider, useUI } from './lib/ui'
import { TopBar } from './components/TopBar'
import { Home } from './screens/Home'
import { Cartoes } from './screens/Cartoes'
import { Metas } from './screens/Metas'
import { Login } from './screens/Login'
import { AddExpenseSheet } from './sheets/AddExpenseSheet'
import { AccountSheet, BudgetSheet, CardSheet, GoalSheet, SaveGoalSheet } from './sheets/OtherSheets'

// Estágio 2 só carrega quando abre (code splitting)
const Fatura = lazy(() => import('./screens/Fatura').then((m) => ({ default: m.Fatura })))
const Assistente = lazy(() => import('./screens/Assistente').then((m) => ({ default: m.Assistente })))

function Router() {
  const { state, loading, syncError } = useStore()
  const { view, sheet, go, toast } = useUI()

  // erro ao gravar no banco: avisa (os dados já foram relidos do banco)
  useEffect(() => {
    if (syncError) toast(syncError.message)
  }, [syncError, toast])

  // Fatura e Assistente só existem no Plus
  useEffect(() => {
    if (!state.plus && (view === 'fatura' || view === 'assistente')) go('home')
  }, [state.plus, view, go])

  if (loading)
    return (
      <div role="status" aria-label="Carregando seus dados" className="grid min-h-dvh place-items-center">
        <span className="size-8 animate-spin rounded-full border-2 border-esk-track border-t-esk-gold" />
      </div>
    )
  if (!state.signedIn) return <Login />

  return (
    <>
      <TopBar />
      <div key={view} className="animate-fade-in">
        {view === 'home' && <Home />}
        {view === 'cartoes' && <Cartoes />}
        {view === 'metas' && <Metas />}
        <Suspense fallback={<div className="mx-auto mt-24 size-8 animate-spin rounded-full border-2 border-esk-track border-t-esk-gold" />}>
          {view === 'fatura' && state.plus && <Fatura />}
          {view === 'assistente' && state.plus && <Assistente />}
        </Suspense>
      </div>

      {sheet?.type === 'add' && <AddExpenseSheet key={sheet.txId ?? 'new'} txId={sheet.txId} />}
      {sheet?.type === 'conta' && <AccountSheet />}
      {sheet?.type === 'card' && <CardSheet key={sheet.cardId ?? 'new'} cardId={sheet.cardId} />}
      {sheet?.type === 'goal' && <GoalSheet key={sheet.goalId ?? 'new'} goalId={sheet.goalId} />}
      {sheet?.type === 'goal-save' && <SaveGoalSheet goalId={sheet.goalId} />}
      {sheet?.type === 'budget' && <BudgetSheet category={sheet.category} />}
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <UIProvider>
        <Router />
      </UIProvider>
    </StoreProvider>
  )
}
