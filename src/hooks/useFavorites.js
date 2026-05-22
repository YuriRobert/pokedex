import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pokedex_favorites'
const MAX_NAME_LEN = 100
const MAX_FAVORITES = 500

function parseFavorites(raw) {
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data
      .filter(p => typeof p?.id === 'number' && Number.isFinite(p.id) && typeof p?.name === 'string')
      .slice(0, MAX_FAVORITES)
      .map(p => ({
        id: p.id,
        name: String(p.name).slice(0, MAX_NAME_LEN),
        types: Array.isArray(p.types)
          ? p.types.filter(t => typeof t === 'string').slice(0, 3)
          : [],
      }))
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return parseFavorites(localStorage.getItem(STORAGE_KEY))
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = useCallback((pokemon) => {
    setFavorites(prev => {
      if (prev.find(p => p.id === pokemon.id)) return prev
      return [...prev, { id: pokemon.id, name: pokemon.name, types: pokemon.types }]
    })
  }, [])

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => prev.filter(p => p.id !== id))
  }, [])

  const toggleFavorite = useCallback((pokemon) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === pokemon.id)
      if (exists) return prev.filter(p => p.id !== pokemon.id)
      return [...prev, { id: pokemon.id, name: pokemon.name, types: pokemon.types }]
    })
  }, [])

  const isFavorite = useCallback((id) => {
    return favorites.some(p => p.id === id)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites }
}
