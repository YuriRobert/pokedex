import { useState, useEffect, useCallback } from 'react'
import { getPokemon, getPokemonList, getPokemonImageUrl } from '../services/pokeapi'
import { getTypeColor, getTypeLabel } from '../utils/typeColors'

// ─────────────── QUIZ SILHUETA ───────────────
function SilhouetteQuiz() {
  const [pokemon, setPokemon] = useState(null)
  const [options, setOptions] = useState([])
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState({ hits: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  const loadRound = useCallback(async () => {
    setLoading(true)
    setAnswered(false)
    setSelected(null)
    try {
      const randomId = Math.floor(Math.random() * 151) + 1
      const list = await getPokemonList(151, 0)
      const shuffled = [...list.results].sort(() => Math.random() - 0.5)
      const wrong = shuffled.filter(p => p.name !== list.results[randomId - 1]?.name).slice(0, 3)
      const correct = list.results[randomId - 1]
      const allOptions = [...wrong, correct].sort(() => Math.random() - 0.5)
      const data = await getPokemon(randomId)
      setPokemon(data)
      setOptions(allOptions.map(o => o.name))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadRound() }, [loadRound])

  function handleAnswer(name) {
    if (answered) return
    setAnswered(true)
    setSelected(name)
    setScore(prev => ({
      hits: prev.hits + (name === pokemon.name ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const displayName = pokemon?.name.charAt(0).toUpperCase() + pokemon?.name.slice(1)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">🔮 Quem é esse Pokémon?</h2>
        <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
          {score.hits}/{score.total}
        </span>
      </div>
      <div className="p-6 text-center">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pokemon ? (
          <>
            <div className="relative inline-block mb-6">
              <img
                src={getPokemonImageUrl(pokemon.id)}
                alt="???"
                className="w-36 h-36 object-contain mx-auto transition-all duration-500"
                style={{
                  filter: answered ? 'none' : 'brightness(0)',
                  transform: answered ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              {!answered && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl font-black bg-black/40 px-4 py-1 rounded-full">???</span>
                </div>
              )}
            </div>

            {answered && (
              <p className="text-lg font-bold text-gray-800 dark:text-white mb-4 animate-scaleIn">
                {displayName}!
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              {options.map(opt => {
                const isCorrect = opt === pokemon.name
                const isSelected = opt === selected
                let btnClass = 'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize '
                if (!answered) {
                  btnClass += 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 cursor-pointer'
                } else if (isCorrect) {
                  btnClass += 'bg-green-500 text-white scale-105'
                } else if (isSelected && !isCorrect) {
                  btnClass += 'bg-red-500 text-white'
                } else {
                  btnClass += 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-60'
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} className={btnClass}>
                    {isCorrect && answered ? '✅ ' : isSelected && !isCorrect && answered ? '❌ ' : ''}
                    {opt.replace(/-/g, ' ')}
                  </button>
                )
              })}
            </div>

            {answered && (
              <button
                onClick={loadRound}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-all hover:scale-105 animate-slideUp"
              >
                Próximo →
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

// ─────────────── JOGO DA MEMÓRIA ───────────────
function MemoryGame() {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [loading, setLoading] = useState(false)
  const [won, setWon] = useState(false)

  const setupGame = useCallback(async () => {
    setLoading(true)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setWon(false)
    try {
      const ids = Array.from({ length: 8 }, () => Math.floor(Math.random() * 151) + 1)
      const unique = [...new Set(ids)].slice(0, 8)
      const doubled = [...unique, ...unique]
        .sort(() => Math.random() - 0.5)
        .map((id, i) => ({ id, uid: `${id}-${i}` }))
      setCards(doubled)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { setupGame() }, [setupGame])

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped
      if (cards[a]?.id === cards[b]?.id) {
        setMatched(prev => {
          const newMatched = [...prev, cards[a].uid, cards[b].uid]
          if (newMatched.length === cards.length) setWon(true)
          return newMatched
        })
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 900)
      }
      setMoves(m => m + 1)
    }
  }, [flipped, cards])

  function flip(index) {
    if (flipped.length === 2) return
    if (flipped.includes(index)) return
    if (matched.includes(cards[index]?.uid)) return
    setFlipped(prev => [...prev, index])
  }

  const isFlipped = (index) => flipped.includes(index) || matched.includes(cards[index]?.uid)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">🃏 Jogo da Memória</h2>
        <div className="flex gap-3">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
            🏃 {moves} jogadas
          </span>
          <button
            onClick={setupGame}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm font-medium transition-all"
          >
            🔄 Novo
          </button>
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : won ? (
          <div className="text-center py-8 animate-scaleIn">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Parabéns!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Completado em {moves} jogadas!</p>
            <button
              onClick={setupGame}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-all hover:scale-105"
            >
              Jogar Novamente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, i) => {
              const revealed = isFlipped(i)
              const isMatched = matched.includes(card.uid)
              return (
                <button
                  key={card.uid}
                  onClick={() => flip(i)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
                    revealed
                      ? isMatched
                        ? 'bg-green-100 dark:bg-green-900 scale-95'
                        : 'bg-white dark:bg-gray-700 shadow-md'
                      : 'bg-purple-600 hover:bg-purple-500 hover:scale-105 cursor-pointer'
                  }`}
                >
                  {revealed ? (
                    <img
                      src={getPokemonImageUrl(card.id)}
                      alt="pokemon"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">❓</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────── BATALHA DE TIPOS ───────────────
const TYPE_ADVANTAGES = {
  fire:     { strong: ['grass', 'bug', 'ice', 'steel'], weak: ['water', 'rock', 'fire'] },
  water:    { strong: ['fire', 'ground', 'rock'], weak: ['grass', 'electric'] },
  grass:    { strong: ['water', 'ground', 'rock'], weak: ['fire', 'bug', 'flying'] },
  electric: { strong: ['water', 'flying'], weak: ['ground', 'grass'] },
  psychic:  { strong: ['fighting', 'poison'], weak: ['ghost', 'dark'] },
  ghost:    { strong: ['psychic', 'ghost'], weak: ['dark'] },
  dragon:   { strong: ['dragon'], weak: ['ice', 'fairy'] },
  dark:     { strong: ['psychic', 'ghost'], weak: ['fighting', 'fairy'] },
  fairy:    { strong: ['fighting', 'dragon', 'dark'], weak: ['poison', 'steel'] },
  fighting: { strong: ['normal', 'ice', 'rock', 'dark'], weak: ['flying', 'psychic', 'fairy'] },
}

const BATTLE_TYPES = Object.keys(TYPE_ADVANTAGES)

function TypeBattle() {
  const [playerType, setPlayerType] = useState(null)
  const [enemyType, setEnemyType] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState({ wins: 0, losses: 0, total: 0 })

  function startBattle() {
    if (!playerType) return
    const enemy = BATTLE_TYPES[Math.floor(Math.random() * BATTLE_TYPES.length)]
    setEnemyType(enemy)

    const advantages = TYPE_ADVANTAGES[playerType]
    let outcome
    if (advantages?.strong?.includes(enemy)) outcome = 'win'
    else if (advantages?.weak?.includes(enemy)) outcome = 'lose'
    else outcome = 'tie'

    setResult(outcome)
    setScore(prev => ({
      wins: prev.wins + (outcome === 'win' ? 1 : 0),
      losses: prev.losses + (outcome === 'lose' ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  function reset() {
    setPlayerType(null)
    setEnemyType(null)
    setResult(null)
  }

  const resultConfig = {
    win:  { msg: '🏆 Você Venceu!', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
    lose: { msg: '💀 Você Perdeu!', color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-950' },
    tie:  { msg: '🤝 Empate!',      color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">⚔️ Batalha de Tipos</h2>
        <div className="flex gap-2 text-xs text-white/80">
          <span className="bg-white/20 px-2 py-1 rounded-full">✅ {score.wins}</span>
          <span className="bg-white/20 px-2 py-1 rounded-full">❌ {score.losses}</span>
        </div>
      </div>
      <div className="p-6">
        {!result ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Escolha seu tipo para batalhar contra um inimigo aleatório!
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
              {BATTLE_TYPES.map(type => {
                const c = getTypeColor(type)
                return (
                  <button
                    key={type}
                    onClick={() => setPlayerType(type)}
                    className="py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${c.bg}, ${c.dark})`,
                      color: c.text,
                      outline: playerType === type ? '3px solid white' : 'none',
                      outlineOffset: '2px',
                      transform: playerType === type ? 'scale(1.1)' : undefined,
                    }}
                  >
                    {getTypeLabel(type)}
                  </button>
                )
              })}
            </div>
            <button
              onClick={startBattle}
              disabled={!playerType}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all hover:scale-105"
            >
              ⚔️ Batalhar!
            </button>
          </>
        ) : (
          <div className={`rounded-xl p-6 text-center ${resultConfig[result].bg} animate-scaleIn`}>
            <div className="flex justify-around mb-4">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl font-bold"
                  style={{ background: getTypeColor(playerType).bg, color: getTypeColor(playerType).text }}
                >
                  {getTypeLabel(playerType)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Você</p>
              </div>
              <div className="flex items-center text-3xl font-black text-gray-400">VS</div>
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl font-bold"
                  style={{ background: getTypeColor(enemyType).bg, color: getTypeColor(enemyType).text }}
                >
                  {getTypeLabel(enemyType)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Inimigo</p>
              </div>
            </div>
            <p className={`text-2xl font-extrabold mb-4 ${resultConfig[result].color}`}>
              {resultConfig[result].msg}
            </p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-all hover:scale-105"
            >
              Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────── PÁGINA PRINCIPAL ───────────────
const GAMES = [
  { id: 'silhouette', label: 'Quem é esse?',     icon: '🔮', component: SilhouetteQuiz, desc: 'Adivinhe o Pokémon pela silhueta!' },
  { id: 'memory',     label: 'Memória',           icon: '🃏', component: MemoryGame,    desc: 'Encontre os pares de Pokémon!' },
  { id: 'battle',     label: 'Batalha de Tipos',  icon: '⚔️', component: TypeBattle,   desc: 'Escolha o tipo certo e vença!' },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState('silhouette')
  const ActiveComponent = GAMES.find(g => g.id === activeGame)?.component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-gray-900 dark:to-purple-950 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-1">🎮 Mini-Jogos</h1>
          <p className="text-purple-200 dark:text-gray-400">Jogos originais inspirados no universo Pokémon</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Seletor de jogo */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`p-4 rounded-xl font-semibold transition-all duration-200 text-center hover:-translate-y-1 ${
                activeGame === game.id
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-1">{game.icon}</div>
              <div className="text-sm">{game.label}</div>
            </button>
          ))}
        </div>

        {/* Jogo ativo */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}
