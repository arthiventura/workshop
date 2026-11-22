import type { Meta, StoryObj } from '@storybook/react-vite'
import { TransactionRow } from './TransactionRow'
import type { Transaction } from '../lib/types'

const base: Transaction = { id: 't1', name: 'Mercado do bairro', category: 'Alimentação', cardId: null, date: new Date().toISOString(), amount: 184.9, source: 'manual' }

const meta = {
  title: 'Componentes/TransactionRow',
  component: TransactionRow,
  tags: ['autodocs'],
  args: { tx: base, onOpen: () => {}, variant: 'card' },
  argTypes: { variant: { control: 'inline-radio', options: ['card', 'table'] } },
  decorators: [(S) => <div className="w-[420px] md:w-[860px]"><S /></div>],
} satisfies Meta<typeof TransactionRow>
export default meta
type Story = StoryObj<typeof meta>

export const Card: Story = {}
export const Table: Story = { args: { variant: 'table' } }
export const DaFatura: Story = { args: { tx: { ...base, name: 'Netflix', category: 'Lazer', source: 'fatura', amount: 55.9 } } }
export const Moradia: Story = { args: { tx: { ...base, name: 'Aluguel', category: 'Moradia', amount: 2400 } } }
export const Transporte: Story = { args: { tx: { ...base, name: 'Combustível', category: 'Transporte', amount: 210 } } }
