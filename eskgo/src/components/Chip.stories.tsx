import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from './ui'

function ChipGroup() {
  const [sel, setSel] = useState('Moradia')
  return (
    <div className="flex flex-wrap gap-2">
      {['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros'].map((c) => (
        <Chip key={c} selected={sel === c} onClick={() => setSel(c)}>{c}</Chip>
      ))}
    </div>
  )
}

const meta = {
  title: 'Componentes/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { selected: false, tone: 'gold', children: 'Alimentação', onClick: () => {} },
  argTypes: { tone: { control: 'inline-radio', options: ['gold', 'champagne'] } },
} satisfies Meta<typeof Chip>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const SelectedGold: Story = { args: { selected: true } }
export const SelectedChampagne: Story = { args: { selected: true, tone: 'champagne' } }
export const Group: Story = {
  render: () => <ChipGroup />,
}
