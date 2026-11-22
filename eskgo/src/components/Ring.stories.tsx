import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ring } from './ui'

const meta = {
  title: 'Componentes/Ring',
  component: Ring,
  tags: ['autodocs'],
  args: { value: 72, size: 88, stroke: 8 },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
} satisfies Meta<typeof Ring>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { size: 140, stroke: 10, value: 35 } }
export const Complete: Story = { args: { value: 100 } }
