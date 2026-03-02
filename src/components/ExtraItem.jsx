import { Plus, Minus } from 'lucide-react';

export default function ExtraItem({ extra, qty, onToggle }) {
    return (
        <div className={`flex items-center justify-between py-5 px-2 border-b border-primary/5 last:border-0 transition-all duration-300
      ${qty > 0 ? 'opacity-100 bg-accent/5 -mx-2 px-4 rounded-2xl border-transparent' : 'opacity-80'}`}
        >
            <div className="flex items-center gap-4">
                <span className="text-4xl leading-none drop-shadow-sm filter grayscale-[0.2]">{extra.emoji}</span>
                <div>
                    <p className={`text-base font-black tracking-tight ${qty > 0 ? 'text-accent' : 'text-primary'}`}>{extra.name}</p>
                    <p className="text-sm font-black text-accent/80">{extra.price}€</p>
                </div>
            </div>

            <div className="flex items-center gap-2.5 bg-primary/5 rounded-[20px] p-1.5 border border-primary/10 shadow-inner">
                <button
                    onClick={() => onToggle(-1)}
                    disabled={qty === 0}
                    className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all active:scale-95 shadow-sm
                        ${qty === 0
                            ? 'bg-primary/5 text-primary/20 cursor-not-allowed'
                            : 'bg-white/10 text-primary hover:bg-red-500/10 hover:text-red-500'}`}
                    aria-label="Quitar uno"
                >
                    <Minus size={18} />
                </button>
                <span className={`w-8 text-center text-base font-black transition-colors ${qty > 0 ? 'text-primary' : 'text-primary/40'}`}>
                    {qty}
                </span>
                <button
                    onClick={() => onToggle(1)}
                    className="w-11 h-11 rounded-[14px] bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-95"
                    aria-label="Añadir uno"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}

