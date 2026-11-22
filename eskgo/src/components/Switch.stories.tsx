import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './ui'

function SwitchDemo(props: React.ComponentProps<typeof Switch>) {
  const [v, setV] = useState(false)
  return <Switch {...props} checked={v} onChange={setV} />
}

const meta = {
  title: 'Componentes/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { checked: false, label: 'Notificações', onChange: () => {} },
} satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {}
export const On: Story = { args: { checked: true } }
export const Interactive: Story = {
  render: (args) => <SwitchDemo {...args} />,
}
