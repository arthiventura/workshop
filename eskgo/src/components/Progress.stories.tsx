import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './ui'

const meta = {
  title: 'Componentes/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 60, color: 'gold', height: 4, label: 'Progresso da meta' },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } }, color: { control: 'inline-radio', options: ['gold', 'champagne', 'bronze', 'gradient'] } },
  decorators: [(S) => <div className="w-[320px]"><S /></div>],
} satisfies Meta<typeof Progress>
export default meta
type Story = StoryObj<typeof meta>

export const Gold: Story = {}
export const Champagne: Story = { args: { color: 'champagne' } }
export const Bronze: Story = { args: { color: 'bronze' } }
export const Gradient: Story = { args: { color: 'gradient', height: 8 } }
export const Empty: Story = { args: { value: 0 } }
export const Full: Story = { args: { value: 100 } }
