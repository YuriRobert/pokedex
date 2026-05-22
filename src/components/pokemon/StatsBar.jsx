const STAT_NAMES = {
  hp:              { label: 'HP',       color: '#22C55E' },
  attack:          { label: 'Ataque',   color: '#EF4444' },
  defense:         { label: 'Defesa',   color: '#3B82F6' },
  'special-attack':  { label: 'Sp. Atq', color: '#A855F7' },
  'special-defense': { label: 'Sp. Def', color: '#06B6D4' },
  speed:           { label: 'Veloc.',   color: '#F59E0B' },
}

const MAX_STAT = 255

export default function StatsBar({ stats = [] }) {
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0)

  return (
    <div className="space-y-3">
      {stats.map(stat => {
        const info = STAT_NAMES[stat.stat.name] || { label: stat.stat.name, color: '#6B7280' }
        const pct = Math.min((stat.base_stat / MAX_STAT) * 100, 100)

        return (
          <div key={stat.stat.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-16 text-right shrink-0">
              {info.label}
            </span>
            <span className="text-sm font-bold w-8 text-gray-800 dark:text-gray-200 shrink-0">
              {stat.base_stat}
            </span>
            <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: info.color }}
              />
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-16 text-right">Total</span>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-8">{total}</span>
        <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min((total / 720) * 100, 100)}%`, backgroundColor: '#8B5CF6' }}
          />
        </div>
      </div>
    </div>
  )
}
