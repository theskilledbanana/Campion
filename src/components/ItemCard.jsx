import { motion } from "motion/react";
import { Play } from "lucide-react";

export function ItemCard({ item, onSelect }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onSelect(item)}
      className="group relative bg-zinc-900 rounded-xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-cyan-500/50 transition-colors shadow-xl"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-cyan-500 p-3 rounded-full shadow-lg shadow-cyan-500/20">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-cyan-400 px-2 py-1 bg-cyan-400/10 rounded uppercase tracking-wider">
            {item.category}
          </span>
        </div>
        <h3 className="text-zinc-100 font-bold text-lg group-hover:text-cyan-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-zinc-400 text-sm line-clamp-2 mt-1">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
