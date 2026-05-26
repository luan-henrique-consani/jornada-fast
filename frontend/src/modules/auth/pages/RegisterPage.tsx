import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/auth.service'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await authService.register({ name, email, password })
      navigate('/')
    } catch {
      setError('Não foi possível criar a conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Criar conta</h1>
          <p style={styles.subtitle}>Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
              placeholder="Seu nome completo"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="seu@email.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="confirmPassword">Repetir senha</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p style={styles.footer}>
          Já tem uma conta?{' '}
          <Link to="/login" style={styles.link}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '1rem',
  } as React.CSSProperties,

  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: 'var(--shadow)',
  } as React.CSSProperties,

  header: {
    marginBottom: '1.75rem',
    textAlign: 'center',
  } as React.CSSProperties,

  title: {
    margin: '0 0 0.375rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    fontFamily: 'var(--heading)',
  } as React.CSSProperties,

  subtitle: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--text)',
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  } as React.CSSProperties,

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  } as React.CSSProperties,

  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-h)',
  } as React.CSSProperties,

  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-h)',
    background: 'var(--bg)',
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,

  error: {
    margin: 0,
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#dc2626',
    background: 'rgba(220, 38, 38, 0.08)',
    border: '1px solid rgba(220, 38, 38, 0.2)',
  } as React.CSSProperties,

  button: {
    padding: '0.7rem 1rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  } as React.CSSProperties,

  footer: {
    marginTop: '1.25rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text)',
  } as React.CSSProperties,

  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: 500,
  } as React.CSSProperties,
} as const
