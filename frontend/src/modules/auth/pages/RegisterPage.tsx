import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, BarChart3, ShieldCheck, Zap } from 'lucide-react'
import { authService } from '../services/auth.service'
import { cn } from '@/lib/cn'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — institutional panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #243F66 60%, #1A2D4D 100%)' }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2D5F9E 0%, transparent 70%)' }} />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg grid place-items-center text-white font-extrabold text-base">
            LF
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight">LOGFAST</div>
            <div className="text-white/60 text-[11px] uppercase tracking-widest">Logística</div>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-white text-4xl font-bold tracking-tight leading-tight mb-4">
            Comece a calcular<br />fretes com<br />precisão
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Crie sua conta e tenha acesso ao sistema completo de cotação logística para gôndolas.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: <Zap size={18} />, value: '< 30s', label: 'Por proposta' },
              { icon: <BarChart3 size={18} />, value: '99,9%', label: 'Uptime SLA' },
              { icon: <ShieldCheck size={18} />, value: 'ISO 27k', label: 'Segurança' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.08] rounded-xl p-4 backdrop-blur-sm border border-white/[0.1]">
                <div className="text-accent mb-2">{stat.icon}</div>
                <div className="text-white font-bold font-mono text-xl leading-none mb-1">{stat.value}</div>
                <div className="text-white/55 text-[11px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">
          © 2026 LOGFAST · Todos os direitos reservados
        </p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-accent rounded-md grid place-items-center text-white font-extrabold text-sm">LF</div>
            <span className="font-bold text-primary text-lg">LOGFAST</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-tx tracking-tight mb-1">Criar conta</h2>
            <p className="text-tx-3 text-[14px]">Preencha os dados para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-tx-2 uppercase tracking-wide" htmlFor="name">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-border rounded-md px-3 py-2.5 text-[13.5px] text-tx outline-none transition-all focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 placeholder:text-tx-muted"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-tx-2 uppercase tracking-wide" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-md px-3 py-2.5 text-[13.5px] text-tx outline-none transition-all focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 placeholder:text-tx-muted"
                placeholder="seu@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-tx-2 uppercase tracking-wide" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-border rounded-md px-3 py-2.5 pr-10 text-[13.5px] text-tx outline-none transition-all focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 placeholder:text-tx-muted"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-3 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-tx-2 uppercase tracking-wide" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-border rounded-md px-3 py-2.5 pr-10 text-[13.5px] text-tx outline-none transition-all focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 placeholder:text-tx-muted"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-3 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-danger-50 border border-red-200 rounded-md text-danger text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-md text-[14px] transition-all',
                'focus:outline-none focus:ring-2 focus:ring-accent/40',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-tx-3">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-accent font-semibold hover:text-accent-hover transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
