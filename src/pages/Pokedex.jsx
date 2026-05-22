import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPokemonList, getPokemon } from '../services/pokeapi'
import { useFavorites } from '../hooks/useFavorites'
import PokemonCard from '../components/pokemon/PokemonCard'
import { TYPE_COLORS, TYPE_LABELS_PT } from '../utils/typeColors'
import { REGIONS } from '../utils/regionData'

const TOTAL = 1025
const DETAIL_BATCH = 40

const SORT_OPTIONS = [
  { value: 'id-asc',    label: '# Menor → Maior' },
  { value: 'id-desc',   label: '# Maior → Menor' },
  { value: 'name-asc',  label: 'Nome A → Z' },
  { value: 'name-desc', label: 'Nome Z → A' },
]

export default function Pokedex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [basicList, setBasicList] = useState([])
  const [detailsMap, setDetailsMap] = useState({})
  const [loadingList, setLoadingList] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filterType, setFilterType] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [sortBy, setSortBy] = useState('id-asc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let active = true

    async function init() {
      try {
        const data = await getPokemonList(TOTAL, 0)
        if (!active) return

        const list = data.results.map(p => ({
          name: p.name,
          id: parseInt(p.url.split('/').filter(Boolean).pop(), 10),
        }))
        setBasicList(list)
        setLoadingList(false)

        for (let i = 0; i < list.length; i += DETAIL_BATCH) {
          if (!active) break
          const batch = list.slice(i, i + DETAIL_BATCH)
          const results = await Promise.allSettled(batch.map(p => getPokemon(p.id)))
          if (!active) break
          setDetailsMap(prev => {
            const next = { ...prev }
            results.forEach((r, idx) => {
              if (r.status === 'fulfilled') next[batch[idx].id] = r.value
            })
            return next
          })
          setLoadedCount(Math.min(i + DETAIL_BATCH, list.length))
        }
      } catch {
        if (active) {
          setError('Erro ao carregar lista de Pokémon. Verifique sua conexão.')
          setLoadingList(false)
        }
      }
    }

    init()
    return () => { active = false }
  }, [])

  const allDetailsLoaded = basicList.length > 0 && loadedCount >= basicList.length
  const detailsLoading = basicList.length > 0 && !allDetailsLoaded

  const displayPokemon = useMemo(() => {
    const all = basicList.map(basic => detailsMap[basic.id] || basic)
    let filtered = all

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p => p.name.includes(q) || String(p.id).includes(q))
    }

    if (filterType) {
      filtered = filtered.filter(p =>
        p.types?.some(t => (t.type?.name ?? t) === filterType)
      )
    }

    if (filterRegion) {
      const region = REGIONS.find(r => r.id === filterRegion)
      if (region) filtered = filtered.filter(p => p.id >= region.range[0] && p.id <= region.range[1])
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'id-desc':   return b.id - a.id
        case 'name-asc':  return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        default:          return a.id - b.id
      }
    })

    return filtered
  }, [basicList, detailsMap, search, filterType, filterRegion, sortBy])

  const hasActiveFilters = search || filterType || filterRegion || sortBy !== 'id-asc'

  const clearFilters = () => {
    setSearch('')
    setFilterType('')
    setFilterRegion('')
    setSortBy('id-asc')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="bg-red-600 dark:bg-gray-800 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-1">📖 Pokédex</h1>
          <p className="text-red-200 dark:text-gray-400">
            {TOTAL}+ Pokémon · Dados via PokéAPI
          </p>
          {detailsLoading && (
            <div className="mt-3 max-w-xs">
              <div className="flex justify-between text-xs text-red-200 dark:text-gray-400 mb-1">
                <span>Carregando tipos...</span>
                <span>{loadedCount}/{TOTAL}</span>
              </div>
              <div className="h-1.5 bg-red-800 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(loadedCount / TOTAL) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou número..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span>⚙️</span> Filtros
            {hasActiveFilters && <span className="bg-yellow-400 text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 animate-slideUp">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo{detailsLoading && <span className="ml-1 text-xs font-normal text-gray-400">(carregando...)</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TYPE_COLORS).map(([type, colors]) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(filterType === type ? '' : type)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: filterType === type ? colors.bg : colors.bg + '44',
                        color: filterType === type ? colors.text : '#666',
                        border: `2px solid ${filterType === type ? colors.bg : 'transparent'}`,
                      }}
                    >
                      {TYPE_LABELS_PT[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Região / Geração
                </label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(region => (
                    <button
                      key={region.id}
                      onClick={() => setFilterRegion(filterRegion === region.id ? '' : region.id)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: filterRegion === region.id ? region.color : region.color + '33',
                        color: filterRegion === region.id ? '#fff' : '#666',
                        border: `2px solid ${filterRegion === region.id ? region.color : 'transparent'}`,
                      }}
                    >
                      {region.emoji} {region.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                ✕ Limpar todos os filtros
              </button>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {loadingList ? 'Carregando...' : `${displayPokemon.length} Pokémon encontrados`}
          {hasActiveFilters && ' (filtros ativos)'}
          {(filterType || filterRegion) && detailsLoading && (
            <span className="ml-1 text-yellow-500">· resultado parcial — tipos ainda carregando</span>
          )}
        </p>

        {error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">😢</div>
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : loadingList ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayPokemon.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nenhum Pokémon encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou a busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayPokemon.map(poke => (
              <PokemonCard
                key={poke.id}
                pokemon={poke}
                isFavorite={isFavorite(poke.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {allDetailsLoaded && !hasActiveFilters && (
          <p className="text-center text-gray-400 dark:text-gray-600 text-sm mt-8">
            ✓ Todos os {TOTAL} Pokémon carregados
          </p>
        )}
      </div>
    </div>
  )
}
