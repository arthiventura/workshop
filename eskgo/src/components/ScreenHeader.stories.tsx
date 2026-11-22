import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScreenHeader, Screen } from './ui'

const meta = {
  title: 'Componentes/ScreenHeader',
  component: ScreenHeader,
  tags: ['autodocs'],
  args: { title: 'Cartões', kicker: 'Carteira' },
  parameters: { layout: 'fullscreen' },
  decorators: [(S) => <Screen><S /></Screen>],
} satisfies Meta<typeof ScreenHeader>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const SemKicker: Story = { args: { kicker: undefined, title: 'Metas' } }
