import type { Meta, StoryObj } from '@storybook/react-vite'
import { useUI } from '../lib/ui'
import { Button } from './ui'

function Demo({ tone, action }: { tone?: 'default' | 'success'; action?: boolean }) {
  const { toast } = useUI()
  return (
    <Button onClick={() => toast('Gasto salvo', { tone, action: action ? { label: 'Desfazer', run: () => {} } : undefined })}>
      Mostrar aviso
    </Button>
  )
}

const meta = {
  title: 'Componentes/Toast',
  component: Demo,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Aviso temporário vindo de `useUI().toast(mensagem, { tone, action })`.' } } },
} satisfies Meta<typeof Demo>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Sucesso: Story = { args: { tone: 'success' } }
export const ComAcao: Story = { args: { tone: 'success', action: true } }
