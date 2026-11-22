import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon, type IconName } from './Icon'

const NAMES: IconName[] = ['plus', 'close', 'back', 'chevron', 'eye', 'eyeOff', 'card', 'target', 'file', 'camera', 'send', 'sparkle', 'logout', 'trash', 'check', 'edit', 'cart', 'home', 'car', 'repeat', 'ticket', 'dots', 'wallet']

const meta = {
  title: 'Componentes/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'wallet', size: 20, strokeWidth: 1.8 },
  argTypes: { name: { control: 'select', options: NAMES } },
} satisfies Meta<typeof Icon>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Galeria: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
      {NAMES.map((n) => (
        <div key={n} className="flex flex-col items-center gap-2 rounded-tile bg-esk-surface p-4 text-esk-text">
          <Icon name={n} size={24} />
          <span className="kicker text-esk-muted">{n}</span>
        </div>
      ))}
    </div>
  ),
}
