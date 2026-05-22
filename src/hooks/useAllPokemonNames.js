import { useState, useEffect } from 'react'
import { getPokemonList } from '../services/pokeapi'

// Carrega todos os nomes uma vez e mantém em memória entre navegações
let cachedNames = null

export function useAllPokemonNames() {
  const [names, setNames] = useState(cachedNames || [])
  const [loading, setLoading] = useState(!cachedNames)

  useEffect(() => {
    if (cachedNames) return
    getPokemonList(1025, 0).then(data => {
      const list = data.results.map(p => ({
        name: p.name,
        id: p.url.split('/').filter(Boolean).pop(),
      }))
      cachedNames = list
      setNames(list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return { names, loading }
}
