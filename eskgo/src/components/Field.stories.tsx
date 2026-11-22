import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, inputCls } from './ui'

const meta = {
  title: 'Componentes/Field',
  component: Field,
  tags: ['autodocs'],
  args: { label: 'Nome do gasto', children: null },
  decorators: [(S) => <div className="w-[320px]"><S /></div>],
} satisfies Meta<typeof Field>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: (a) => <Field {...a}><input className={inputCls} placeholder="Ex.: Mercado" /></Field> }
export const WithError: Story = {
  args: { error: 'Informe um valor maior que zero.' },
  render: (a) => <Field {...a}><input className={inputCls} defaultValue="0" /></Field>,
}
