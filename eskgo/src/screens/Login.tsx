import { useState, type FormEvent } from 'react'
import { Button, Field, inputCls } from '../components/ui'
import { useStore } from '../lib/store'

type Mode = 'entrar' | 'criar'

/** Entrar ou criar conta (e-mail + senha). Online: Supabase Auth. Offline: só valida o formato. */
export function Login() {
  const { state, signIn, signUp } = useStore()
  const [mode, setMode] = useState<Mode>('entrar')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(state.user.email)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const switchMode = (m: Mode) => {
    setMode(m)
    setErrors({})
    setSentTo(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (mode === 'criar' && !name.trim()) errs.name = 'Como podemos te chamar?'
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Digite um e-mail válido.'
    if (password.length < 6) errs.password = 'A senha tem pelo menos 6 caracteres.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    if (mode === 'entrar') {
      const error = await signIn(email.trim(), password)
      if (error) setErrors({ form: error })
    } else {
      const res = await signUp(name.trim(), email.trim(), password)
      if (res.error) setErrors({ form: res.error })
      else if (res.needsConfirmation) {
        setSentTo(email.trim())
        setMode('entrar')
        setPassword('')
      }
    }
    setLoading(false)
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-center gap-8 px-5 py-10">
      <div className="bg-hero flex flex-col gap-10 rounded-card p-7 text-esk-ink">
        <span className="text-lg font-bold tracking-[-0.02em]">Eskgo</span>
        <span className="text-[34px] leading-[1.05] font-bold tracking-[-0.04em]">Seu assistente financeiro para grandes conquistas.</span>
      </div>

      {sentTo && (
        <p role="status" className="m-0 rounded-tile border border-esk-track px-4 py-3 text-sm leading-[1.45] text-esk-text-2">
          Enviamos um link para <strong className="text-esk-text">{sentTo}</strong>. Confirme o e-mail e entre com a sua senha.
        </p>
      )}

      <form onSubmit={submit} noValidate className="flex flex-col gap-4" aria-label={mode === 'entrar' ? 'Entrar' : 'Criar conta'}>
        {mode === 'criar' && (
          <Field label="Nome" error={errors.name}>
            <input className={inputCls} type="text" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        )}
        <Field label="E-mail" error={errors.email}>
          <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" error={errors.password}>
          <input
            className={inputCls}
            type="password"
            autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {errors.form && (
          <p role="alert" className="m-0 rounded-tile border border-esk-track px-4 py-3 text-sm text-esk-champagne">
            {errors.form}
          </p>
        )}
        <Button type="submit" loading={loading} className="mt-2">
          {mode === 'entrar' ? 'Entrar' : 'Criar conta'}
        </Button>
        <button
          type="button"
          onClick={() => switchMode(mode === 'entrar' ? 'criar' : 'entrar')}
          className="h-11 text-sm font-bold text-esk-text-2 transition hover:text-esk-text"
        >
          {mode === 'entrar' ? (
            <>
              Não tem conta? <span className="text-esk-gold">Criar conta</span>
            </>
          ) : (
            <>
              Já tem conta? <span className="text-esk-gold">Entrar</span>
            </>
          )}
        </button>
      </form>
    </main>
  )
}
