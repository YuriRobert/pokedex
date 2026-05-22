import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPokemonList, getPokemon } from '../services/pokeapi'
import { useFavorites } from '../hooks/useFavorites'
import PokemonCard from '../components/pokemon/PokemonCard'
import { TYPE_COLORS, TYPE_LABELS_PT } from '../utils/typeColors'
import { REGIONS } from '../utils/regionData'

const LIMIT = 24
const TOTAL = 1025

const SORT_OPTIONS = [
  { value: 'id-asc',    label: '# Menor → Maior' },
  { value: 'id-desc',   label: '# Maior → Menor' },
  { value: 'name-asc',  label: 'Nome A → Z' },
  { value: 'name-desc', label: 'Nome Z → A' },
]

export default function Pokedex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [allPokemon, setAllPokemon] = useState([])
  const [displayPokemon, setDisplayPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filterType, setFilterType] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [sortBy, setSortBy] = useState('id-asc')
  const [showFilters, setShowFilters] = useState(false)

  const loaderRef = useRef(null)

  const loadPokemon = useCallback(async (newOffset = 0, append = false, signal = null) => {
    if (newOffset === 0) setLoading(true)
    else setLoadingMore(true)

    try {
      const list = await getPokemonList(LIMIT, newOffset)
      const details = await Promise.all(
        list.results.map(p => getPokemon(p.name))
      )
      if (signal?.aborted) return
      if (append) {
        setAllPokemon(prev => [...prev, ...details])
      } else {
        setAllPokemon(details)
      }
      setHasMore(newOffset + LIMIT < TOTAL)
    } catch (e) {
      if (!signal?.aborted) setError('Erro ao carregar Pokémon. Verifique sua conexão.')
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadPokemon(0, false, controller.signal)
    return () => controller.abort()
  }, [loadPokemon])

  // Filtros e ordenação
  useEffect(() => {
    let filtered = [...allPokemon]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.includes(q) || String(p.id).includes(q)
      )
    }

    if (filterType) {
      filtered = filtered.filter(p =>
        p.types.some(t => t.type.name === filterType)
      )
    }

    if (filterRegion) {
      const region = REGIONS.find(r => r.id === filterRegion)
      if (region) {
        filtered = filtered.filter(p => p.id >= region.range[0] && p.id <= region.range[1])
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'id-desc':   return b.id - a.id
        case 'name-asc':  return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        default:          return a.id - b.id
      }
    })

    setDisplayPokemon(filtered)
  }, [allPokemon, search, filterType, filterRegion, sortBy])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !search && !filterType && !filterRegion) {
          const newOffset = offset + LIMIT
          setOffset(newOffset)
          loadPokemon(newOffset, true)
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, offset, search, filterType, filterRegion, loadPokemon])

  const clearFilters = () => {
    setSearch('')
    setFilterType('')
    setFilterRegion('')
    setSortBy('id-asc')
    setSearchParams({})
  }

  const hasActiveFilters = search || filterType || filterRegion || sortBy !== 'id-asc'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-red-600 dark:bg-gray-800 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-1">📖 Pokédex</h1>
          <p className="text-red-200 dark:text-gray-400">
            {TOTAL}+ Pokémon · Dados via PokéAPI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Barra de busca + toggle filtros */}
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

        {/* Painel de filtros */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 animate-slideUp">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
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

              {/* Região */}
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

        {/* Contador */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {loading ? 'Carregando...' : `${displayPokemon.length} Pokémon encontrados`}
          {hasActiveFilters && ' (filtros ativos)'}
        </p>

        {/* Grid */}
        {error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">😢</div>
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              onClick={() => { setError(null); loadPokemon(0) }}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: LIMIT }).map((_, i) => (
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

        {/* Loader infinito */}
        {!search && !filterType && !filterRegion && (
          <div ref={loaderRef} className="flex justify-center py-8 mt-4">
            {loadingMore && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Carregando mais Pokémon...</p>
              </div>
            )}
            {!hasMore && allPokemon.length > 0 && (
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                ✓ Todos os {allPokemon.length} Pokémon carregados!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
