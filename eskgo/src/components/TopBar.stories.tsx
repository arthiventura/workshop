import type { Meta, StoryObj } from '@storybook/react-vite'
import { TopBar } from './TopBar'

const meta = {
  title: 'Componentes/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Barra fixa do desktop (≥ 800px). No celular não aparece.' } } },
  globals: { viewport: { value: 'desktop' } },
} satisfies Meta<typeof TopBar>
export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = { decorators: [(S) => <div style={{ minWidth: 900 }}><S /></div>] }
