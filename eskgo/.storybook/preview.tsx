import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { StoreProvider } from '../src/lib/store'
import { UIProvider } from '../src/lib/ui'

const preview: Preview = {
  decorators: [
    (Story) => (
      <StoreProvider offline>
        <UIProvider>
          <Story />
        </UIProvider>
      </StoreProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { options: { esk: { name: 'Eskgo', value: '#030303' } } },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    docs: { canvas: { sourceState: 'shown' } },
    a11y: { test: 'todo' },
  },
  initialGlobals: { backgrounds: { value: 'esk' } },
}
export default preview
