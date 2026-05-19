import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { Gamepad2, Search, Filter } from 'lucide-react';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const games = gamesData;
  const categories = ['All', 'Action', 'Arcade', 'Puzzle', 'Sports', 'Strategy'];

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
              <Gamepad2 className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Unblocked<span className="text-cyan-400">Vault</span>
              </h1>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest leading-none">Gaming Portal Alpha</p>
            </div>
          </div>

          <div className="flex flex-1 max-w-xl items-center relative">
            <Search className="absolute left-4 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search for a title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 pb-20">
        {/* Category Navigation */}
        <section className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex items-center gap-2 pr-4 border-r border-zinc-800 mr-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Genres</span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === category
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={setSelectedGame}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="inline-block p-6 bg-zinc-900 rounded-3xl border border-dashed border-zinc-700">
                  <Gamepad2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-300">No games found</h3>
                  <p className="text-zinc-500 mt-2">Try a different search term or category.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Persistence/Footer */}
      <footer className="border-t border-zinc-900 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-600 text-sm font-medium">
            &copy; 2024 UnblockedVault Portal. Hand-curated simple web games.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-cyan-400 text-sm font-mono transition-colors">PRIVACY</a>
            <a href="#" className="text-zinc-500 hover:text-cyan-400 text-sm font-mono transition-colors">TERMS</a>
            <a href="#" className="text-zinc-500 hover:text-cyan-400 text-sm font-mono transition-colors">SUPPORT</a>
          </div>
        </div>
      </footer>

      {/* Game Player Overlay */}
      <AnimatePresence>
        {selectedGame && (
          <GamePlayer
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
