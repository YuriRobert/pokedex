import { useState } from 'react'
import { getPokemon, getPokemonImageUrl, formatId } from '../services/pokeapi'
import { getTypeColor } from '../utils/typeColors'
import TypeBadge from '../components/pokemon/TypeBadge'
import StatsBar from '../components/pokemon/StatsBar'

const STAT_LABELS = { hp: 'HP', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Sp. Atq', 'special-defense': 'Sp. Def', speed: 'Veloc.' }

function SearchSlot({ label, pokemon, onSelect, onClear }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await getPokemon(query.toLowerCase().trim())
      onSelect(data)
      setQuery('')
    } catch {
      setError('Pokémon não encontrado')
    } finally {
      setLoading(false)
    }
  }

  if (pokemon) {
    const primaryType = pokemon.types[0]?.type?.name || 'normal'
    const colors = getTypeColor(primaryType)
    const displayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

    return (
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div
          className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${colors.bg}CC, ${colors.dark}EE)` }}
        >
          <img
            src={getPokemonImageUrl(pokemon.id)}
            alt={displayName}
            className="w-32 h-32 object-contain mx-auto drop-shadow-xl animate-float"
          />
          <p className="text-white/70 text-sm mt-2">{formatId(pokemon.id)}</p>
          <h3 className="text-xl font-extrabold">{displayName}</h3>
          <div className="flex gap-2 justify-center mt-2">
            {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}
          </div>
          <button
            onClick={onClear}
            className="mt-3 text-xs text-white/60 hover:text-white underline"
          >
            Trocar Pokémon
          </button>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800">
          <StatsBar stats={pokemon.stats} />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">{label}</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setError('') }}
          placeholder="Nome ou número..."
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? '...' : '🔍'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}

export default function Compare() {
  const [pokemonA, setPokemonA] = useState(null)
  const [pokemonB, setPokemonB] = useState(null)

  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']

  function getStatValue(pokemon, statName) {
    return pokemon?.stats?.find(s => s.stat.name === statName)?.base_stat || 0
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-gray-900 dark:to-teal-950 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-1">⚖️ Comparar Pokémon</h1>
          <p className="text-teal-200 dark:text-gray-400">Compare dois Pokémon lado a lado</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SearchSlot
            label="Pokémon 1"
            pokemon={pokemonA}
            onSelect={setPokemonA}
            onClear={() => setPokemonA(null)}
          />
          <SearchSlot
            label="Pokémon 2"
            pokemon={pokemonB}
            onSelect={setPokemonB}
            onClear={() => setPokemonB(null)}
          />
        </div>

        {/* Comparação de stats */}
        {pokemonA && pokemonB && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-slideUp">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Comparação de Estatísticas
            </h2>
            <div className="space-y-4">
              {statNames.map(stat => {
                const valA = getStatValue(pokemonA, stat)
                const valB = getStatValue(pokemonB, stat)
                const max = Math.max(valA, valB, 1)
                const winnerA = valA > valB
                const winnerB = valB > valA
                const tie = valA === valB

                return (
                  <div key={stat} className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                    {/* Pokémon A */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold ${winnerA ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {valA} {winnerA && '👑'}
                      </span>
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex justify-end">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(valA / max) * 100}%`,
                            background: winnerA ? '#22C55E' : '#94A3B8',
                          }}
                        />
                      </div>
                    </div>

                    {/* Stat name */}
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center w-16">
                      {STAT_LABELS[stat] || stat}
                      {tie && <span className="block text-yellow-500">🤝</span>}
                    </div>

                    {/* Pokémon B */}
                    <div className="flex flex-col items-start gap-1">
                      <span className={`text-sm font-bold ${winnerB ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {winnerB && '👑'} {valB}
                      </span>
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(valB / max) * 100}%`,
                            background: winnerB ? '#22C55E' : '#94A3B8',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 dark:text-white">
                    Total: {pokemonA.stats.reduce((s, st) => s + st.base_stat, 0)}
                  </span>
                  <span className="text-gray-400 text-sm">Base Stats Total</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    Total: {pokemonB.stats.reduce((s, st) => s + st.base_stat, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
