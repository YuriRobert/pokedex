import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPokemonList, getPokemon, getPokemonImageUrl } from '../services/pokeapi'
import { getTypeColor } from '../utils/typeColors'
import { REGIONS } from '../utils/regionData'
import TypeBadge from '../components/pokemon/TypeBadge'

const FEATURED_IDS = [25, 6, 9, 3, 150, 249, 384, 483, 643, 716]

const TYPE_GRID = [
  'fire', 'water', 'grass', 'electric',
  'psychic', 'dragon', 'ghost', 'fairy',
  'fighting', 'ice', 'rock', 'dark',
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 3,
    }))
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const results = await Promise.all(FEATURED_IDS.map(id => getPokemon(id)))
        if (!cancelled) {
          setFeatured(results)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 dark:from-gray-900 dark:via-red-950 dark:to-gray-900 min-h-[90vh] flex items-center">
        {/* Partículas de fundo */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/10 pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Pokébola gigante de fundo */}
        <div className="absolute right-0 top-0 w-[600px] h-[600px] opacity-10 pointer-events-none">
          <div className="w-full h-full rounded-full border-[60px] border-white" />
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-16 bg-white" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white border-[20px] border-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div className="text-white animate-slideUp">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                <span>✨</span> Pokédex de Fã — Dados via PokéAPI
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-4">
                Pokédex<br />
                <span className="text-yellow-300">Interativa</span>
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-md">
                Explore todos os Pokémon, regiões, tipos, habitats e muito mais.
                Mais de 1000 Pokémon com dados completos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pokedex"
                  className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  📖 Explorar Pokédex
                </Link>
                <Link
                  to="/jogos"
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full border border-white/40 transition-all duration-200 hover:-translate-y-1"
                >
                  🎮 Mini-Jogos
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-10">
                {[
                  { label: 'Pokémon', value: '1.025+' },
                  { label: 'Regiões', value: '10' },
                  { label: 'Tipos', value: '18' },
                  { label: 'Habitats', value: '16' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-extrabold text-yellow-300">{stat.value}</div>
                    <div className="text-white/70 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid de Pokémon em destaque */}
            {!loading && (
              <div className="hidden lg:grid grid-cols-4 gap-3">
                {featured.slice(0, 8).map((poke, i) => {
                  const primaryType = poke.types[0]?.type?.name || 'normal'
                  const colors = getTypeColor(primaryType)
                  return (
                    <Link
                      key={poke.id}
                      to={`/pokemon/${poke.id}`}
                      className="rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${colors.bg}CC, ${colors.dark}DD)`,
                        animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
                      }}
                    >
                      <img
                        src={getPokemonImageUrl(poke.id)}
                        alt={poke.name}
                        className="w-full object-contain p-2 drop-shadow-lg"
                        style={{ height: '90px' }}
                      />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TIPOS */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
            Explore por Tipo
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Cada tipo tem suas próprias vantagens, fraquezas e Pokémon únicos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TYPE_GRID.map(type => {
              const colors = getTypeColor(type)
              return (
                <Link
                  key={type}
                  to={`/tipos/${type}`}
                  className="rounded-xl p-4 text-center font-semibold shadow hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${colors.bg}, ${colors.dark})`, color: colors.text }}
                >
                  <TypeBadge type={type} size="sm" />
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-6">
            <Link to="/tipos" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
              Ver todos os 18 tipos →
            </Link>
          </div>
        </div>
      </section>

      {/* REGIÕES */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
            Regiões do Mundo Pokémon
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            De Kanto a Paldea — explore cada geração
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {REGIONS.slice(0, 10).map(region => (
              <Link
                key={region.id}
                to={`/regioes/${region.id}`}
                className="rounded-xl p-5 border-2 border-transparent hover:border-current transition-all duration-200 hover:-translate-y-1 shadow hover:shadow-md"
                style={{ borderColor: region.color + '44', background: region.color + '15' }}
              >
                <div className="text-3xl mb-2">{region.emoji}</div>
                <h3 className="font-bold text-gray-800 dark:text-white">{region.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Geração {region.generation} · #{region.range[0]}–{region.range[1]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POKÉMON EM DESTAQUE */}
      {!loading && featured.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
              Pokémon em Destaque
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
              Alguns dos Pokémon mais icônicos
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {featured.slice(0, 10).map(poke => {
                const primaryType = poke.types[0]?.type?.name || 'normal'
                const colors = getTypeColor(primaryType)
                const displayName = poke.name.charAt(0).toUpperCase() + poke.name.slice(1)
                return (
                  <Link
                    key={poke.id}
                    to={`/pokemon/${poke.id}`}
                    className="rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                    style={{ background: `linear-gradient(135deg, ${colors.bg}CC, ${colors.dark}DD)` }}
                  >
                    <div className="p-4 flex justify-center">
                      <img
                        src={getPokemonImageUrl(poke.id)}
                        alt={displayName}
                        className="w-24 h-24 object-contain drop-shadow-lg group-hover:animate-float"
                      />
                    </div>
                    <div className="px-3 pb-3 text-center" style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <p className="text-white/60 text-xs mb-0.5">#{String(poke.id).padStart(4, '0')}</p>
                      <p className="text-white font-bold text-sm">{displayName}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA JOGOS */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">🎮 Mini-Jogos Pokémon</h2>
          <p className="text-white/80 mb-6 text-lg">
            Teste seus conhecimentos com Quiz, Jogo da Memória, Batalha de Tipos e muito mais!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['🔮 Quiz da Silhueta', '🃏 Jogo da Memória', '⚔️ Batalha de Tipos', '🎯 Quem é esse Pokémon?'].map(game => (
              <span key={game} className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                {game}
              </span>
            ))}
          </div>
          <Link
            to="/jogos"
            className="inline-block px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-lg"
          >
            Jogar Agora!
          </Link>
        </div>
      </section>
    </div>
  )
}
