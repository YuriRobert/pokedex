import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPokemon } from '../services/pokeapi'
import { useFavorites } from '../hooks/useFavorites'
import PokemonCard from '../components/pokemon/PokemonCard'

export default function Favorites() {
  const { favorites, toggleFavorite, isFavorite, clearFavorites } = useFavorites()
  const [pokemonData, setPokemonData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (favorites.length === 0) { setPokemonData([]); return }
    setLoading(true)
    // Use allSettled so a single failed fetch doesn't hide the rest
    Promise.allSettled(favorites.map(f => getPokemon(f.id)))
      .then(results => {
        setPokemonData(results.filter(r => r.status === 'fulfilled').map(r => r.value))
        setLoading(false)
      })
  }, [favorites])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="bg-gradient-to-r from-red-500 to-pink-600 dark:from-gray-900 dark:to-red-950 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-1">❤️ Favoritos</h1>
            <p className="text-red-200 dark:text-gray-400">
              {favorites.length} Pokémon salvos
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => { if (confirm('Limpar todos os favoritos?')) clearFavorites() }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all"
            >
              🗑️ Limpar tudo
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🤍</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Explore a Pokédex e clique no coração para salvar seus Pokémon favoritos!
            </p>
            <Link
              to="/pokedex"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow transition-all hover:-translate-y-1"
            >
              📖 Explorar Pokédex
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map(f => (
              <div key={f.id} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pokemonData.map(poke => (
              <PokemonCard
                key={poke.id}
                pokemon={poke}
                isFavorite={isFavorite(poke.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
