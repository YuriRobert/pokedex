import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { to: '/',          label: 'Início',      icon: '🏠' },
  { to: '/pokedex',   label: 'Pokédex',     icon: '📖' },
  { to: '/regioes',   label: 'Regiões',     icon: '🗺️' },
  { to: '/tipos',     label: 'Tipos',       icon: '⚡' },
  { to: '/favoritos', label: 'Favoritos',   icon: '❤️' },
  { to: '/comparar',  label: 'Comparar',    icon: '⚖️' },
  { to: '/jogos',     label: 'Jogos',       icon: '🎮' },
]

export default function Header({ isDark, onToggleTheme, favoritesCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/pokedex?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-red-600 dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 relative animate-pokeball">
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                <div className="w-full h-1/2 bg-white opacity-30" />
                <div className="w-full h-1/2 bg-red-800" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-gray-300 z-10" />
              <div className="absolute top-[46%] left-0 right-0 h-0.5 bg-white opacity-50" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide group-hover:text-yellow-300 transition-colors">
              PokéDex
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1
                  ${location.pathname === link.to
                    ? 'bg-white text-red-600 shadow'
                    : 'text-white hover:bg-red-700 dark:hover:bg-gray-700'
                  }`}
              >
                <span className="text-xs">{link.icon}</span>
                {link.label}
                {link.to === '/favoritos' && favoritesCount > 0 && (
                  <span className="ml-1 bg-yellow-400 text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Busca + Theme + Menu */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden sm:flex">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar Pokémon..."
                  className="pl-9 pr-3 py-1.5 rounded-full text-sm bg-red-700 dark:bg-gray-800 text-white placeholder-red-300 dark:placeholder-gray-400 border border-red-500 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-white w-44 focus:w-56 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-300">🔍</span>
              </div>
            </form>

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* Menu mobile */}
            <button
              className="lg:hidden p-2 text-white hover:text-yellow-300 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {menuOpen && (
          <div className="lg:hidden pb-4 animate-slideUp">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar Pokémon..."
                  className="w-full pl-9 pr-3 py-2 rounded-full text-sm bg-red-700 dark:bg-gray-800 text-white placeholder-red-300 border border-red-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-300">🔍</span>
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                    ${location.pathname === link.to
                      ? 'bg-white text-red-600'
                      : 'text-white hover:bg-red-700 dark:hover:bg-gray-700'
                    }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                  {link.to === '/favoritos' && favoritesCount > 0 && (
                    <span className="ml-auto bg-yellow-400 text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
