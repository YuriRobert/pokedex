export default function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="relative w-24 h-24 mb-6">
        {/* Pokébola animada */}
        <div className="w-24 h-24 rounded-full border-4 border-gray-800 dark:border-gray-200 overflow-hidden animate-pokeball">
          <div className="w-full h-1/2 bg-red-500" />
          <div className="w-full h-1/2 bg-white dark:bg-gray-100" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-4 border-gray-800 dark:border-gray-200 z-10" />
        <div className="absolute top-[46%] left-0 right-0 h-2 bg-gray-800 dark:bg-gray-200" />
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-body text-sm animate-pulse">{message}</p>
      <div className="flex gap-1 mt-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-red-500"
            style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
