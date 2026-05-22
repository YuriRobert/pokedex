import { useState, useRef, useEffect } from 'react'
import { useAllPokemonNames } from '../../hooks/useAllPokemonNames'
import { getPokemonSpriteUrl } from '../../services/pokeapi'

export default function AutocompleteInput({ onSelect, placeholder = 'Nome ou número...' }) {
  const { names, loading } = useAllPokemonNames()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const q = query.toLowerCase().trim()
    const filtered = names.filter(p =>
      p.name.includes(q) || p.id === q
    ).slice(0, 8)

    setSuggestions(filtered)
    setOpen(filtered.length > 0)
    setHighlighted(0)
  }, [query, names])

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e) {
      if (!inputRef.current?.parentElement?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(pokemon) {
    setQuery('')
    setOpen(false)
    onSelect(pokemon)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions[highlighted]) handleSelect(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Scroll para o item destacado
  useEffect(() => {
    const item = listRef.current?.children[highlighted]
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  const formatName = (name) =>
    name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={loading ? 'Carregando lista...' : placeholder}
          disabled={loading}
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl overflow-y-auto max-h-64 animate-slideUp"
        >
          {suggestions.map((pokemon, i) => (
            <li
              key={pokemon.id}
              onMouseDown={() => handleSelect(pokemon)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                i === highlighted
                  ? 'bg-red-50 dark:bg-red-950'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <img
                src={getPokemonSpriteUrl(pokemon.id)}
                alt={pokemon.name}
                className="w-9 h-9 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="flex-1 font-medium text-gray-800 dark:text-white">
                {formatName(pokemon.name)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                #{String(pokemon.id).padStart(4, '0')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
