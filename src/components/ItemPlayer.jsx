import { motion } from "motion/react";
import { X, Maximize2, RotateCcw } from "lucide-react";

export function ItemPlayer({ item, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
    >
      <header className="p-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{item.title}</h2>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{item.category}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors text-white flex items-center gap-2 text-sm font-bold shadow-lg shadow-cyan-900/20">
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </header>
      
      <div className="flex-1 relative bg-[#050505]">
        <iframe
          src={item.iframeUrl}
          className="w-full h-full border-none"
          title={item.title}
          allow="fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
        />
      </div>
    </motion.div>
  );
}
