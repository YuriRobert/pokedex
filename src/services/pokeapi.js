import axios from 'axios'

const BASE_URL = 'https://pokeapi.co/api/v2'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// Cache simples em memória para evitar requisições repetidas
const cache = new Map()

async function cachedGet(url) {
  if (cache.has(url)) return cache.get(url)
  // Store the Promise so concurrent callers share the same inflight request
  const promise = api.get(url).then(res => res.data)
  cache.set(url, promise)
  return promise
}

export async function getPokemonList(limit = 20, offset = 0) {
  const data = await cachedGet(`/pokemon?limit=${limit}&offset=${offset}`)
  return data
}

export async function getPokemon(idOrName) {
  return cachedGet(`/pokemon/${idOrName}`)
}

export async function getPokemonSpecies(idOrName) {
  return cachedGet(`/pokemon-species/${idOrName}`)
}

export async function getEvolutionChain(url) {
  if (typeof url !== 'string' || !url.startsWith('https://pokeapi.co/')) {
    throw new Error('Invalid evolution chain URL')
  }
  if (cache.has(url)) return cache.get(url)
  const promise = api.get(url).then(res => res.data)
  cache.set(url, promise)
  return promise
}

export async function getType(typeName) {
  return cachedGet(`/type/${typeName}`)
}

export async function getAbility(abilityName) {
  return cachedGet(`/ability/${abilityName}`)
}

export function getPokemonImageUrl(id, shiny = false) {
  if (shiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function getPokemonSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}


export function formatId(id) {
  return `#${String(id).padStart(4, '0')}`
}

export function extractDescription(species) {
  const entries = species?.flavor_text_entries || []
  const pt = entries.find(e => e.language.name === 'pt-BR')
  const en = entries.find(e => e.language.name === 'en')
  const text = (pt || en)?.flavor_text || ''
  return text.replace(/\f/g, ' ').replace(/\n/g, ' ')
}

export function extractGenus(species) {
  const genera = species?.genera || []
  const pt = genera.find(g => g.language.name === 'pt-BR')
  const en = genera.find(g => g.language.name === 'en')
  return (pt || en)?.genus || ''
}

export function parseEvolutionChain(chain) {
  function traverse(node) {
    if (!node) return null
    return {
      name: node.species.name,
      id: node.species.url.split('/').filter(Boolean).pop(),
      details: node.evolution_details,
      evolvesTo: node.evolves_to.map(traverse).filter(Boolean),
    }
  }
  return traverse(chain)
}
