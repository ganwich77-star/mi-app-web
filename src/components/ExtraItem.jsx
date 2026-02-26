import { Plus, Minus } from 'lucide-react';

export default function ExtraItem({ extra, qty, onToggle }) {
    return (
        <div className={`flex items-center justify-between py-4 px-1 border-b border-white/5 last:border-0 transition-all duration-300
      ${qty > 0 ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
        >
            <div className="flex items-center gap-3">
                <span className="text-3xl leading-none drop-shadow-md">{extra.emoji}</span>
                <div>
                    <p className="text-base font-black text-primary tracking-tight">{extra.name}</p>
                    <p className="text-sm font-black text-accent">{extra.price}€</p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-primary/5 rounded-2xl p-1.5 border border-primary/10 backdrop-blur-sm">
                <button
                    onClick={() => onToggle(-1)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 hover:bg-red-500/20 flex items-center justify-center text-secondary hover:text-red-400 transition-all active:scale-90 disabled:opacity-20 shadow-sm"
                >
                    <Minus size={14} />
                </button>
                <span className={`w-8 text-center text-sm font-black transition-colors ${qty > 0 ? 'text-primary' : 'text-secondary opacity-40'}`}>
                    {qty}
                </span>
                <button
                    onClick={() => onToggle(1)}
                    className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/20 hover:bg-accent/40 flex items-center justify-center text-accent hover:text-primary transition-all active:scale-90 shadow-sm shadow-accent/20"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}
