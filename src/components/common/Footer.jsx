import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-red-500">⬤</span> PokéDex
            </h3>
            <p className="text-sm leading-relaxed">
              Projeto de fã não oficial. Dados fornecidos pela{' '}
              <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                PokéAPI
              </a>
              .
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">Explorar</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="/pokedex" className="hover:text-white transition-colors">Pokédex Completa</Link></li>
              <li><Link to="/regioes" className="hover:text-white transition-colors">Regiões</Link></li>
              <li><Link to="/tipos" className="hover:text-white transition-colors">Tipos</Link></li>
              <li><Link to="/jogos" className="hover:text-white transition-colors">Mini-Jogos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">Ferramentas</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="/favoritos" className="hover:text-white transition-colors">Meus Favoritos</Link></li>
              <li><Link to="/comparar" className="hover:text-white transition-colors">Comparar Pokémon</Link></li>
              <li><Link to="/pokedex?busca=avancada" className="hover:text-white transition-colors">Busca Avançada</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4 text-center text-xs">
          <p>Pokémon e todos os nomes relacionados são marcas registradas da Nintendo, Game Freak e The Pokémon Company.</p>
          <p className="mt-1">Este é um projeto de fã sem fins lucrativos. Nenhuma ROM ou conteúdo protegido é utilizado.</p>
        </div>
      </div>
    </footer>
  )
}
