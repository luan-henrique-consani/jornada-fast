import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/produtos', label: 'Produtos' },
  { to: '/ordens-compra', label: 'Ordens de Compra' },
  { to: '/estimativas', label: 'Estimativas' },
  { to: '/parametros', label: 'Parâmetros' },
]

export default function Header() {
  return (
    <header style={{ background: '#1e293b', color: '#fff', padding: '0 1.5rem' }}>
      <nav aria-label="Navegação principal" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', height: '56px' }}>
        <span style={{ fontWeight: 'bold', marginRight: '1rem', color: '#f8fafc' }}>LOGFAST</span>
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              color: isActive ? '#38bdf8' : '#cbd5e1',
              textDecoration: 'none',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.9rem',
              background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
