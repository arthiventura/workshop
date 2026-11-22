import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Segredos que jamais podem ir para o bundle do navegador (prefixo VITE_ = público). */
const FORBIDDEN_PUBLIC = /^VITE_.*(SECRET|SERVICE_ROLE|OPENAI|PRIVATE|PASSWORD)/i

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const leaked = Object.keys(env).filter((k) => FORBIDDEN_PUBLIC.test(k))
  if (leaked.length) {
    throw new Error(
      `[eskgo] Variável secreta com prefixo VITE_ seria exposta no navegador: ${leaked.join(', ')}.\n` +
        'Remova o prefixo VITE_ — segredos ficam só no servidor (Vercel Functions).',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173 },
    build: { sourcemap: false },
  }
})
