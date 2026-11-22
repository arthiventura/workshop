import { useState, type FormEvent } from 'react'
import { Button, Field, inputCls } from '../components/ui'
import { useStore } from '../lib/store'

/** Login simples (e-mail + senha). Protótipo: valida o formato e entra. */
export function Login() {
  const { state, dispatch } = useStore()
  const [email, setEmail] = useState(state.user.email)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Digite um e-mail válido.'
    if (password.length < 6) errs.password = 'A senha tem pelo menos 6 caracteres.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    window.setTimeout(() => dispatch({ type: 'auth/login', email }), 500)
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-center gap-8 px-5 py-10">
      <div className="bg-hero flex flex-col gap-10 rounded-card p-7 text-esk-ink">
        <span className="text-lg font-bold tracking-[-0.02em]">Eskgo</span>
        <span className="text-[34px] leading-[1.05] font-bold tracking-[-0.04em]">Seu assistente financeiro para grandes conquistas.</span>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="E-mail" error={errors.email}>
          <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" error={errors.password}>
          <input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" loading={loading} className="mt-2">
          Entrar
        </Button>
      </form>
    </main>
  )
}
