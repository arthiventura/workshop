import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './ui'

const meta = {
  title: 'Componentes/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { size: 44 },
  argTypes: { size: { control: { type: 'range', min: 24, max: 96 } } },
} satisfies Meta<typeof Avatar>
export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {}
export const Clickable: Story = { args: { onClick: () => {} } }
export const Large: Story = { args: { size: 80 } }
