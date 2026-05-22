import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getType, getPokemonImageUrl } from '../services/pokeapi'
import { TYPE_COLORS, TYPE_LABELS_PT, TYPE_ICONS } from '../utils/typeColors'
import TypeBadge from '../components/pokemon/TypeBadge'

const ALL_TYPES = Object.keys(TYPE_COLORS)

export default function Types() {
  const { typeName } = useParams()
  const [selected, setSelected] = useState(typeName || null)
  const [typeData, setTypeData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selected) { setTypeData(null); return }
    setLoading(true)
    getType(selected)
      .then(data => { setTypeData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selected])

  const colors = selected ? TYPE_COLORS[selected] : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-gray-900 dark:to-purple-950 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-1">⚡ Tipos de Pokémon</h1>
          <p className="text-purple-200 dark:text-gray-400">18 tipos com vantagens, fraquezas e Pokémon únicos</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid de tipos */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
          {ALL_TYPES.map(type => {
            const c = TYPE_COLORS[type]
            return (
              <button
                key={type}
                onClick={() => setSelected(selected === type ? null : type)}
                className="rounded-xl py-3 px-2 text-center font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-lg text-sm"
                style={{
                  background: `linear-gradient(135deg, ${c.bg}, ${c.dark})`,
                  color: c.text,
                  outline: selected === type ? `3px solid white` : 'none',
                  outlineOffset: '2px',
                  transform: selected === type ? 'scale(1.05)' : undefined,
                }}
              >
                <div className="text-2xl mb-1">{TYPE_ICONS[type]}</div>
                <div>{TYPE_LABELS_PT[type]}</div>
              </button>
            )
          })}
        </div>

        {/* Detalhe do tipo */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && typeData && colors && (
          <div className="rounded-2xl shadow-lg overflow-hidden animate-slideUp">
            {/* Header */}
            <div
              className="p-6 text-white"
              style={{ background: `linear-gradient(135deg, ${colors.bg}, ${colors.dark})` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{TYPE_ICONS[selected]}</span>
                <div>
                  <h2 className="text-3xl font-extrabold">{TYPE_LABELS_PT[selected]}</h2>
                  <p className="text-white/70">{typeData.pokemon?.length || 0} Pokémon deste tipo</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6">
              {/* Efetividade de dano */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { label: '2× de dano em', key: 'double_damage_to', color: 'text-red-500', icon: '⚔️' },
                  { label: '0.5× de dano em', key: 'half_damage_to', color: 'text-green-500', icon: '🛡️' },
                  { label: '0× de dano em', key: 'no_damage_to', color: 'text-blue-500', icon: '🚫' },
                ].map(({ label, key, color, icon }) => (
                  <div key={key}>
                    <h3 className={`text-sm font-bold ${color} mb-2`}>{icon} {label}</h3>
                    <div className="flex flex-wrap gap-1">
                      {typeData.damage_relations?.[key]?.map(t => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                      {!typeData.damage_relations?.[key]?.length && (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Nenhum</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recebe dano */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Recebe 2× de', key: 'double_damage_from', color: 'text-red-500', icon: '⚠️' },
                  { label: 'Recebe 0.5× de', key: 'half_damage_from', color: 'text-green-500', icon: '✅' },
                  { label: 'Imune a', key: 'no_damage_from', color: 'text-blue-500', icon: '🚫' },
                ].map(({ label, key, color, icon }) => (
                  <div key={key}>
                    <h3 className={`text-sm font-bold ${color} mb-2`}>{icon} {label}</h3>
                    <div className="flex flex-wrap gap-1">
                      {typeData.damage_relations?.[key]?.map(t => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                      {!typeData.damage_relations?.[key]?.length && (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Nenhum</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pokémon deste tipo */}
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                Pokémon do tipo {TYPE_LABELS_PT[selected]}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
                {typeData.pokemon?.slice(0, 24).map(entry => {
                  const pid = entry.pokemon.url.split('/').filter(Boolean).pop()
                  return (
                    <Link
                      key={pid}
                      to={`/pokemon/${pid}`}
                      className="flex flex-col items-center p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <img
                        src={getPokemonImageUrl(pid)}
                        alt={entry.pokemon.name}
                        className="w-12 h-12 object-contain"
                      />
                      <p className="text-xs text-center capitalize text-gray-700 dark:text-gray-300 mt-1 truncate w-full text-center">
                        {entry.pokemon.name}
                      </p>
                    </Link>
                  )
                })}
              </div>
              {typeData.pokemon?.length > 24 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  + {typeData.pokemon.length - 24} Pokémon adicionais
                </p>
              )}
            </div>
          </div>
        )}

        {!selected && !loading && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-3">⚡</div>
            <p>Selecione um tipo acima para ver os detalhes</p>
          </div>
        )}
      </div>
    </div>
  )
}
