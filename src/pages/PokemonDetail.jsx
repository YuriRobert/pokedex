import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getPokemon, getPokemonSpecies, getEvolutionChain,
  getPokemonImageUrl, getPokemonSpriteUrl,
  formatId, extractDescription, extractGenus, parseEvolutionChain,
} from '../services/pokeapi'
import { useFavorites } from '../hooks/useFavorites'
import { getTypeColor, getTypeLabel } from '../utils/typeColors'
import { getWeaknessesAndResistances } from '../utils/typeChart'
import { getRegionByPokemonId } from '../utils/regionData'
import { formatEvolutionMethod, getEvolutionMethodIcon } from '../utils/evolutionUtils'
import { POKEMON_TIPS } from '../data/pokemonTips'
import TypeBadge from '../components/pokemon/TypeBadge'
import StatsBar from '../components/pokemon/StatsBar'

// --- Evolution tree components ---

function EvolutionCard({ id, name, currentId }) {
  const numId = Number(id)
  const isCurrent = numId === currentId
  const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  return (
    <Link
      to={`/pokemon/${numId}`}
      className={`flex flex-col items-center p-3 rounded-2xl transition-all hover:scale-105 w-[100px] flex-shrink-0 ${
        isCurrent
          ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <img
        src={getPokemonImageUrl(numId)}
        alt={displayName}
        className="w-16 h-16 object-contain drop-shadow"
        loading="lazy"
      />
      <p className="text-xs font-bold text-gray-800 dark:text-white mt-1 text-center leading-tight">
        {displayName}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
        {formatId(numId)}
      </p>
    </Link>
  )
}

function EvolutionBranch({ node, currentId }) {
  if (!node) return null
  return (
    <div className="flex flex-col items-center">
      <EvolutionCard id={node.id} name={node.name} currentId={currentId} />
      {node.evolvesTo?.length > 0 && (
        <div className={`flex flex-wrap justify-center gap-3 mt-2 ${node.evolvesTo.length > 4 ? 'max-w-2xl' : ''}`}>
          {node.evolvesTo.map(child => {
            const method = formatEvolutionMethod(child.details)
            const icon = getEvolutionMethodIcon(child.details)
            return (
              <div key={child.name} className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center">
                  <div className="w-px h-2 bg-gray-300 dark:bg-gray-600" />
                  <span className="text-gray-400 dark:text-gray-500 text-xs leading-none">▼</span>
                  {method && (
                    <div className="mt-1 mb-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2 py-1 text-xs text-indigo-700 dark:text-indigo-300 text-center max-w-[170px] leading-snug">
                      <span className="mr-0.5">{icon}</span>{method}
                    </div>
                  )}
                </div>
                <EvolutionBranch node={child} currentId={currentId} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Main page ---

export default function PokemonDetail() {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [pokemon, setPokemon] = useState(null)
  const [species, setSpecies] = useState(null)
  const [evolutionTree, setEvolutionTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shiny, setShiny] = useState(false)
  const [activeTab, setActiveTab] = useState('sobre')
  const [imgError, setImgError] = useState(false)

  const numId = parseInt(id, 10)
  const region = Number.isNaN(numId) ? null : getRegionByPokemonId(numId)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setEvolutionTree(null)
    setShiny(false)
    setActiveTab('sobre')

    async function load() {
      try {
        const [poke, spec] = await Promise.all([
          getPokemon(id),
          getPokemonSpecies(id),
        ])
        if (cancelled) return
        setPokemon(poke)
        setSpecies(spec)

        if (spec.evolution_chain?.url) {
          const chain = await getEvolutionChain(spec.evolution_chain.url)
          if (!cancelled) setEvolutionTree(parseEvolutionChain(chain.chain))
        }
      } catch {
        if (!cancelled) setError('Pokémon não encontrado.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Carregando dados do Pokémon...</p>
        </div>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{error}</h2>
          <Link to="/pokedex" className="text-red-600 dark:text-red-400 hover:underline">
            ← Voltar à Pokédex
          </Link>
        </div>
      </div>
    )
  }

  const types = pokemon.types.map(t => t.type.name)
  const primaryType = types[0]
  const colors = getTypeColor(primaryType)
  const { weaknesses, resistances, immunities } = getWeaknessesAndResistances(types)
  const description = extractDescription(species)
  const genus = extractGenus(species)
  const isFav = isFavorite(pokemon.id)
  const tips = POKEMON_TIPS[pokemon.id]

  const displayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' ')
  const height = (pokemon.height / 10).toFixed(1)
  const weight = (pokemon.weight / 10).toFixed(1)

  const TABS = [
    { key: 'sobre', label: 'Sobre' },
    { key: 'estatísticas', label: 'Estatísticas' },
    { key: 'movimentos', label: 'Movimentos' },
    { key: 'evoluções', label: 'Evoluções' },
    { key: 'fraquezas', label: 'Fraquezas' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <div
        className="relative overflow-hidden py-10 px-4"
        style={{ background: `linear-gradient(135deg, ${colors.bg}CC, ${colors.dark}EE)` }}
      >
        <div className="absolute right-4 top-4 opacity-10 w-64 h-64">
          <div className="w-full h-full rounded-full border-[30px] border-white" />
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-8 bg-white" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-[8px] border-gray-300" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link to="/" className="hover:text-white">Início</Link>
            <span>›</span>
            <Link to="/pokedex" className="hover:text-white">Pokédex</Link>
            <span>›</span>
            <span className="text-white">{displayName}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="w-64 h-64 flex items-center justify-center animate-float">
                {!imgError ? (
                  <img
                    src={getPokemonImageUrl(pokemon.id, shiny)}
                    alt={displayName}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center text-7xl">🔴</div>
                )}
              </div>
              <button
                onClick={() => setShiny(!shiny)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  shiny ? 'bg-yellow-400 text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ✨ Shiny
              </button>
            </div>

            <div className="text-white flex-1 text-center md:text-left">
              <p className="text-white/60 text-lg font-mono mb-1">{formatId(pokemon.id)}</p>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{displayName}</h1>
              {genus && <p className="text-white/80 italic mb-3">{genus}</p>}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {types.map(type => <TypeBadge key={type} type={type} size="lg" />)}
              </div>
              <p className="text-white/90 text-base max-w-lg mb-4">{description}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                  <div className="font-bold text-lg">{height}m</div>
                  <div className="text-white/70">Altura</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                  <div className="font-bold text-lg">{weight}kg</div>
                  <div className="text-white/70">Peso</div>
                </div>
                {region && (
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                    <div className="font-bold text-lg">{region.emoji} {region.name}</div>
                    <div className="text-white/70">Região</div>
                  </div>
                )}
                <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                  <div className="font-bold text-lg">{pokemon.base_experience || '—'}</div>
                  <div className="text-white/70">Exp. Base</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => toggleFavorite({ id: pokemon.id, name: pokemon.name, types })}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                  isFav ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isFav ? '❤️ Favorito' : '🤍 Favoritar'}
              </button>
              <div className="flex gap-2">
                {numId > 1 && (
                  <Link
                    to={`/pokemon/${numId - 1}`}
                    className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-center text-sm font-medium transition-all"
                  >
                    ← #{numId - 1}
                  </Link>
                )}
                {numId < 1025 && (
                  <Link
                    to={`/pokemon/${numId + 1}`}
                    className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-center text-sm font-medium transition-all"
                  >
                    #{numId + 1} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">

        {/* SOBRE */}
        {activeTab === 'sobre' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Informações Gerais</h2>
              <div className="space-y-3">
                {[
                  { label: 'Número', value: formatId(pokemon.id) },
                  { label: 'Nome', value: displayName },
                  { label: 'Tipos', value: types.map(getTypeLabel).join(' / ') },
                  { label: 'Região', value: region ? `${region.emoji} ${region.name} (Gen. ${region.generation})` : '—' },
                  { label: 'Altura', value: `${height} m` },
                  { label: 'Peso', value: `${weight} kg` },
                  { label: 'Espécie', value: genus || '—' },
                  { label: 'Exp. Base', value: pokemon.base_experience || '—' },
                  { label: 'Felicidade Base', value: species?.base_happiness ?? '—' },
                  { label: 'Taxa de Captura', value: species?.capture_rate ?? '—' },
                  { label: 'Lendário', value: species?.is_legendary ? '✅ Sim' : '❌ Não' },
                  { label: 'Mítico', value: species?.is_mythical ? '✅ Sim' : '❌ Não' },
                ].map(row => (
                  <div key={row.label} className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm w-28 shrink-0">{row.label}</span>
                    <span className="text-gray-800 dark:text-white text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Habilidades</h2>
              <div className="space-y-2">
                {pokemon.abilities?.map(a => (
                  <div key={a.ability.name} className="flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <span className="font-semibold text-gray-800 dark:text-white capitalize">
                      {a.ability.name.replace(/-/g, ' ')}
                    </span>
                    {a.is_hidden && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        Oculta
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Sprites</h2>
                <div className="flex gap-4 items-end">
                  <div className="text-center">
                    <img
                      src={getPokemonSpriteUrl(pokemon.id)}
                      alt={displayName}
                      className="w-20 h-20 object-contain mx-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Normal</p>
                  </div>
                  <div className="text-center">
                    <img
                      src={getPokemonSpriteUrl(pokemon.id).replace('/pokemon/', '/pokemon/shiny/')}
                      alt={`${displayName} Shiny`}
                      className="w-20 h-20 object-contain mx-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">✨ Shiny</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ESTATÍSTICAS */}
        {activeTab === 'estatísticas' && (
          <div className="max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Estatísticas Base</h2>
            <StatsBar stats={pokemon.stats} />
          </div>
        )}

        {/* MOVIMENTOS */}
        {activeTab === 'movimentos' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Movimentos ({pokemon.moves?.length || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pokemon.moves?.slice(0, 30).map(m => (
                <div
                  key={m.move.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
                >
                  <span className="text-sm font-medium capitalize text-gray-800 dark:text-white">
                    {m.move.name.replace(/-/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {m.version_group_details[0]?.move_learn_method.name}
                  </span>
                </div>
              ))}
            </div>
            {pokemon.moves?.length > 30 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                + {pokemon.moves.length - 30} movimentos adicionais
              </p>
            )}
          </div>
        )}

        {/* EVOLUÇÕES */}
        {activeTab === 'evoluções' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Cadeia de Evolução</h2>

            {evolutionTree ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex justify-center min-w-max px-4">
                  <EvolutionBranch node={evolutionTree} currentId={pokemon.id} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Carregando cadeia de evolução...</span>
              </div>
            )}

            {/* Legenda de métodos */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Legenda</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                <span>⬆️ Subir de nível</span>
                <span>🪨 Usar item</span>
                <span>🔄 Troca</span>
                <span>💛 Amizade</span>
                <span>💝 Afeto</span>
                <span>🌙 Noite</span>
                <span>☀️ Dia</span>
                <span>🎒 Segurar item</span>
                <span>📖 Saber golpe</span>
                <span>👥 Time especial</span>
                <span>🙃 Virar console</span>
              </div>
            </div>

            {/* Dicas especiais */}
            {tips && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                  <span>💡</span> Dicas — como evoluir nos jogos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Métodos específicos por jogo e geração
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tips.map((tip, i) => (
                    <div
                      key={i}
                      className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{tip.title}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 leading-relaxed">{tip.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FRAQUEZAS */}
        {activeTab === 'fraquezas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xl font-bold text-red-500 mb-4">⚠️ Fraquezas</h2>
              <div className="flex flex-wrap gap-2">
                {weaknesses.map(([type, mult]) => (
                  <div key={type} className="flex flex-col items-center">
                    <TypeBadge type={type} size="sm" />
                    <span className="text-xs font-bold text-red-500 mt-0.5">×{mult}</span>
                  </div>
                ))}
                {weaknesses.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma fraqueza</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-500 mb-4">🛡️ Resistências</h2>
              <div className="flex flex-wrap gap-2">
                {resistances.map(([type, mult]) => (
                  <div key={type} className="flex flex-col items-center">
                    <TypeBadge type={type} size="sm" />
                    <span className="text-xs font-bold text-green-500 mt-0.5">×{mult}</span>
                  </div>
                ))}
                {resistances.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma resistência</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-500 mb-4">🚫 Imunidades</h2>
              <div className="flex flex-wrap gap-2">
                {immunities.map(([type]) => (
                  <TypeBadge key={type} type={type} size="sm" />
                ))}
                {immunities.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma imunidade</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
