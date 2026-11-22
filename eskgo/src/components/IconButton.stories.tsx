import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './ui'

const meta = {
  title: 'Componentes/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: 'plus', label: 'Adicionar', tone: 'surface' },
  argTypes: { tone: { control: 'inline-radio', options: ['surface', 'gold', 'ghost', 'onBrand'] } },
} satisfies Meta<typeof IconButton>
export default meta
type Story = StoryObj<typeof meta>

export const Surface: Story = {}
export const Gold: Story = { args: { tone: 'gold' } }
export const Ghost: Story = { args: { tone: 'ghost', icon: 'close', label: 'Fechar' } }
export const OnBrand: Story = {
  args: { tone: 'onBrand', icon: 'edit', label: 'Editar' },
  decorators: [(S) => <div className="bg-hero rounded-card p-6"><S /></div>],
}
