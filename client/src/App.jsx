import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Filters from './components/Filters.jsx'

const initialFilters = { type: '', category: '' }

const VK_DOBRO_URL = import.meta.env.VITE_VK_DOBRO_URL || 'https://dobro.mail.ru/projects/?recipient=animals'

export default function AppLayout() {
  const [filters, setFilters] = useState(initialFilters)
  const location = useLocation()

  const showFilters = location.pathname === '/' || location.pathname.startsWith('/map')

  function handleApply(nextFilters) {
    setFilters(prev => ({ ...prev, ...nextFilters }))
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-content">
          <nav className="layout__nav">
            <Link to="/">Лента</Link>
            <Link to="/map">Карта</Link>
          </nav>
          <a
            className="layout__cta"
            href={VK_DOBRO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            ❤️ Поддержать хвостатых на VK&nbsp;Добро
          </a>
        </div>
      </header>
      <main className="layout__main">
        {showFilters && <Filters value={filters} onApply={handleApply} />}
        <Outlet context={{ filters }} />
      </main>
    </div>
  )
}

