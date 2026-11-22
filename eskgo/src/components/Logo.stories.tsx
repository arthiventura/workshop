import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './ui'

const meta = {
  title: 'Componentes/Logo',
  component: Logo,
  tags: ['autodocs'],
  args: { size: 36 },
  argTypes: { size: { control: { type: 'range', min: 20, max: 96 } } },
} satisfies Meta<typeof Logo>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { size: 72 } }
