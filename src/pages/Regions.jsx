import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { REGIONS } from '../utils/regionData'

export default function Regions() {
  const { regionId } = useParams()
  const [selected, setSelected] = useState(regionId || null)

  const region = REGIONS.find(r => r.id === selected)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-indigo-950 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-1">🗺️ Regiões</h1>
          <p className="text-blue-200 dark:text-gray-400">Explore as 10 regiões principais do mundo Pokémon</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid de regiões */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(selected === r.id ? null : r.id)}
              className={`rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                selected === r.id
                  ? 'ring-2 shadow-lg'
                  : 'shadow'
              }`}
              style={{
                background: `linear-gradient(135deg, ${r.color}22, ${r.color}44)`,
                borderColor: r.color,
                ringColor: r.color,
                outline: selected === r.id ? `2px solid ${r.color}` : 'none',
              }}
            >
              <div className="text-3xl mb-2">{r.emoji}</div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">{r.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gen. {r.generation}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">#{r.range[0]}–{r.range[1]}</p>
            </button>
          ))}
        </div>

        {/* Detalhe da região */}
        {region && (
          <div
            className="rounded-2xl p-6 shadow-lg animate-slideUp"
            style={{ background: `linear-gradient(135deg, ${region.color}15, ${region.color}30)` }}
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="text-6xl">{region.emoji}</span>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">{region.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{region.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {region.games.map(game => (
                    <span
                      key={game}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                    >
                      🎮 {game}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {region.range[1] - region.range[0] + 1}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pokémon</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">#{region.range[0]}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Início</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">#{region.range[1]}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Fim</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{region.generation}ª</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Geração</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Pontos de interesse:</strong> {region.landmark}
            </p>

            <Link
              to={`/pokedex?region=${region.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow hover:shadow-lg transition-all hover:-translate-y-1"
              style={{ backgroundColor: region.color }}
            >
              📖 Ver Pokémon de {region.name}
            </Link>
          </div>
        )}

        {!selected && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-3">🗺️</div>
            <p>Selecione uma região acima para ver os detalhes</p>
          </div>
        )}
      </div>
    </div>
  )
}
