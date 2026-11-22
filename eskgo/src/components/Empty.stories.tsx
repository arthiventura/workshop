import type { Meta, StoryObj } from '@storybook/react-vite'
import { Empty } from './ui'
import { Button } from './ui'

const meta = {
  title: 'Componentes/Empty',
  component: Empty,
  tags: ['autodocs'],
  args: { icon: 'target', title: 'Nenhuma meta ainda', body: 'Crie sua primeira meta e acompanhe o progresso por aqui.' },
  decorators: [(S) => <div className="w-[360px]"><S /></div>],
} satisfies Meta<typeof Empty>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithAction: Story = { args: { action: <Button className="mt-2 h-11">Nova meta</Button> } }
