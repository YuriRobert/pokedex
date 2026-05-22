import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useTheme } from './hooks/useTheme'
import { useFavorites } from './hooks/useFavorites'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import LoadingScreen from './components/common/LoadingScreen'

const Home         = lazy(() => import('./pages/Home'))
const Pokedex      = lazy(() => import('./pages/Pokedex'))
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'))
const Regions      = lazy(() => import('./pages/Regions'))
const Types        = lazy(() => import('./pages/Types'))
const Favorites    = lazy(() => import('./pages/Favorites'))
const Compare      = lazy(() => import('./pages/Compare'))
const Games        = lazy(() => import('./pages/Games'))

export default function App() {
  const { isDark, toggleTheme } = useTheme()
  const { favorites } = useFavorites()

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
          favoritesCount={favorites.length}
        />
        <main className="flex-1">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/pokedex"       element={<Pokedex />} />
              <Route path="/pokemon/:id"   element={<PokemonDetail />} />
              <Route path="/regioes"       element={<Regions />} />
              <Route path="/regioes/:regionId" element={<Regions />} />
              <Route path="/tipos"         element={<Types />} />
              <Route path="/tipos/:typeName" element={<Types />} />
              <Route path="/favoritos"     element={<Favorites />} />
              <Route path="/comparar"      element={<Compare />} />
              <Route path="/jogos"         element={<Games />} />
              <Route path="*"              element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="text-8xl mb-4">🔴</div>
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
          Essa página fugiu como um Pokémon selvagem!
        </p>
        <a
          href="/"
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow transition-all hover:-translate-y-1 inline-block"
        >
          🏠 Voltar ao Início
        </a>
      </div>
    </div>
  )
}
