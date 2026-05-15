import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header>
      <nav aria-label="Navegação principal">
        <Link to="/">Home</Link>
      </nav>
    </header>
  )
}
