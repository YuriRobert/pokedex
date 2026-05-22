import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pokedex_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
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
