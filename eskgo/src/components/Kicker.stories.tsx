import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kicker } from './ui'

const meta = { title: 'Componentes/Kicker', component: Kicker, tags: ['autodocs'], args: { children: 'Finanças' } } satisfies Meta<typeof Kicker>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Gold: Story = { args: { className: 'text-esk-gold', children: 'Meta do mês' } }
