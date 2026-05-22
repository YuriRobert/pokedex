import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPokemonImageUrl, formatId } from '../../services/pokeapi'
import { getTypeColor } from '../../utils/typeColors'
import TypeBadge from './TypeBadge'

export default function PokemonCard({ pokemon, isFavorite, onToggleFavorite }) {
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const id = pokemon.id || pokemon.url?.split('/').filter(Boolean).pop()
  const name = pokemon.name
  const types = pokemon.types?.map(t => typeof t === 'string' ? t : t.type.name) || []
  const primaryType = types[0] || 'normal'
  const colors = getTypeColor(primaryType)

  const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')

  return (
    <div
      className="relative group animate-fadeIn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/pokemon/${id}`}>
        <div
          className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-white/30"
          style={{
            background: `linear-gradient(135deg, ${colors.bg}CC, ${colors.dark}DD)`,
            transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
          }}
        >
          {/* Pokébola decorativa de fundo */}
          <div
            className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-[12px] opacity-20"
            style={{ borderColor: 'white' }}
          />
          <div
            className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />

          {/* Número */}
          <div className="absolute top-3 right-3 text-white/50 text-xs font-bold font-body">
            {formatId(id)}
          </div>

          {/* Imagem do Pokémon */}
          <div className="flex justify-center pt-4 pb-1 px-4">
            <div className={`w-28 h-28 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'animate-float' : ''}`}>
              {!imgError ? (
                <img
                  src={getPokemonImageUrl(id)}
                  alt={displayName}
                  className="w-full h-full object-contain drop-shadow-lg"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center text-5xl">
                  🔴
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div
            className="px-4 pt-2 pb-4 rounded-b-2xl"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <h3 className="text-white font-bold text-center text-sm mb-2 truncate">
              {displayName}
            </h3>
            <div className="flex flex-wrap gap-1 justify-center">
              {types.map(type => (
                <TypeBadge key={type} type={type} size="sm" />
              ))}
            </div>
          </div>

          {/* Shimmer effect */}
          {isHovered && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'shimmer 1.5s linear infinite',
              }}
            />
          )}
        </div>
      </Link>

      {/* Botão favorito */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite({ id: Number(id), name, types })
          }}
          className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <span className="text-sm">{isFavorite ? '❤️' : '🤍'}</span>
        </button>
      )}
    </div>
  )
}
