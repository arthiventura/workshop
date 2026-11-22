import { Avatar, Kicker, Logo } from './ui'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'

/**
 * Barra fixa do desktop (≥800px): logo à esquerda (volta para a Home), perfil à direita (abre Conta).
 * No celular não aparece — lá cada tela tem o próprio topo.
 */
export function TopBar() {
  const { state } = useStore()
  const { go, openSheet } = useUI()
  return (
    <header className="sticky top-0 z-40 hidden border-b border-esk-border bg-esk-bg/85 backdrop-blur-md md:block">
      <div className="mx-auto flex h-[76px] w-full max-w-[1200px] items-center justify-between gap-4 px-10">
        <button type="button" onClick={() => go('home')} aria-label="Eskgo, ir para o início" className="rounded-xl transition hover:opacity-85">
          <Logo />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5 text-right">
            <Kicker>Finanças</Kicker>
            <span className="text-[17px] font-bold">Olá, {state.user.name}</span>
          </div>
          <Avatar size={44} onClick={() => openSheet({ type: 'conta' })} />
        </div>
      </div>
    </header>
  )
}
