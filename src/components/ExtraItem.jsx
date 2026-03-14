import { Plus, Minus } from 'lucide-react';

export default function ExtraItem({ extra, qty, onToggle }) {
    return (
        <div className={`flex flex-col items-center p-4 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group
            ${qty > 0 
                ? 'bg-accent/10 border-accent/30 shadow-lg shadow-accent/5' 
                : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 hover:border-accent/20'}`}
        >
            {/* EMOJI / IMAGEN */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110
                ${qty > 0 ? 'bg-white' : 'bg-primary/5'}`}>
                <span className="text-4xl leading-none drop-shadow-sm filter grayscale-[0.2]">{extra.emoji}</span>
            </div>

            {/* TEXTOS */}
            <div className="text-center mb-4 min-h-[50px] flex flex-col justify-center">
                <p className={`text-sm font-black tracking-tight leading-tight mb-1 ${qty > 0 ? 'text-accent' : 'text-primary'}`}>
                    {extra.name}
                </p>
                <p className="text-xs font-black text-accent/80">{extra.price}€</p>
            </div>

            {/* CONTROLES DE CANTIDAD */}
            <div className="w-full flex items-center justify-between bg-primary/5 rounded-2xl p-1 border border-primary/10 shadow-inner">
                <button
                    onClick={() => onToggle(-1)}
                    disabled={qty === 0}
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90
                        ${qty === 0
                            ? 'text-primary/10'
                            : 'bg-white/10 text-primary hover:text-red-500'}`}
                    aria-label="Quitar"
                >
                    <Minus size={14} />
                </button>
                
                <span className={`text-sm font-black transition-colors ${qty > 0 ? 'text-primary' : 'text-primary/30'}`}>
                    {qty}
                </span>

                <button
                    onClick={() => onToggle(1)}
                    className="shrink-0 w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 active:scale-90 transition-all"
                    aria-label="Añadir"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* INDICADOR DE SELECCIONADO */}
            {qty > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
        </div>
    );
}

