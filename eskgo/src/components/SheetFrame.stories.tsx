import type { Meta, StoryObj } from '@storybook/react-vite'
import { SheetFrame, Button, Field, inputCls } from './ui'

const meta = {
  title: 'Componentes/SheetFrame',
  component: SheetFrame,
  tags: ['autodocs'],
  args: { title: 'Novo gasto', onClose: () => {}, children: null },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 640 } } },
} satisfies Meta<typeof SheetFrame>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => (
    <SheetFrame {...a}>
      <Field label="Nome"><input className={inputCls} placeholder="Ex.: Mercado" /></Field>
      <Field label="Valor"><input className={inputCls} placeholder="R$ 0,00" inputMode="decimal" /></Field>
      <Button>Salvar</Button>
    </SheetFrame>
  ),
}
