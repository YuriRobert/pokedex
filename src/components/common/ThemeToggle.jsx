export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      style={{ background: isDark ? '#1e293b' : '#fed7aa' }}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-sm"
        style={{
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
          background: isDark ? '#1e40af' : '#fbbf24',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
