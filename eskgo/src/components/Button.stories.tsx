import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './ui'

const meta = {
  title: 'Componentes/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Guardar valor', tone: 'gold' },
  argTypes: { tone: { control: 'inline-radio', options: ['gold', 'ghost', 'light', 'outline'] }, loading: { control: 'boolean' }, disabled: { control: 'boolean' } },
  decorators: [(S) => <div className="w-[320px]"><S /></div>],
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

export const Gold: Story = {}
export const Ghost: Story = { args: { tone: 'ghost' } }
export const Light: Story = { args: { tone: 'light' } }
export const Outline: Story = { args: { tone: 'outline' } }
export const Loading: Story = { args: { loading: true } }
export const Disabled: Story = { args: { disabled: true } }
