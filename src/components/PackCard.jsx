import { Check, Plus, Minus } from 'lucide-react';

export default function PackCard({ pack, selected, quantity = 1, onSelect, onUpdateQuantity }) {
    return (
        <div
            onClick={() => onSelect()}
            className={`w-full text-left rounded-[30px] p-6 border-2 transition-all duration-300 active:scale-98 relative overflow-hidden backdrop-blur-md cursor-pointer
        ${selected
                    ? 'border-accent bg-accent/10 shadow-2xl shadow-accent/20 scale-[1.02]'
                    : 'border-primary/5 bg-primary/5 hover:border-primary/20'}`}
        >
            {/* Fondo decorativo cuando está seleccionado */}
            {selected && (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 pointer-events-none" />
            )}

            <div className="flex items-start justify-between gap-3">
                {/* Info izquierda */}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">{pack.subtitle}</p>
                    <h3 className={`text-xl font-black transition-colors ${selected ? 'text-accent' : 'text-primary'}`}>
                        {pack.name}
                    </h3>

                    {/* Items del pack */}
                    <ul className="mt-4 space-y-2">
                        {pack.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-secondary font-bold tracking-tight opacity-80">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  ${selected ? 'bg-accent text-white shadow-glow' : 'bg-primary/10 text-secondary'}`}>
                                    <Check size={10} />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Columna derecha: precio + selector */}
                <div className="flex-shrink-0 flex flex-col items-end justify-between h-full gap-3 min-h-[100px]">
                    {/* Precio */}
                    <p className={`text-3xl font-black leading-none ${selected ? 'text-accent' : 'text-primary'}`}>
                        {pack.price}<span className="text-lg ml-0.5 opacity-60">€</span>
                    </p>

                    {/* Badge "Más Elegido" */}
                    {pack.popular && (
                        <span className="flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap mb-auto">
                            ★ Populares
                        </span>
                    )}

                    {/* Selector de Cantidad (Capture 2) / Checkbox visual */}
                    <div className="mt-auto">
                        {selected ? (
                            <div className="flex items-center bg-white/10 dark:bg-white/5 border border-primary/10 rounded-2xl p-1 gap-3 animate-fade-in shadow-lg">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateQuantity(Math.max(1, quantity - 1)); }}
                                    className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-primary hover:bg-white/20 transition-all active:scale-90"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-lg font-black text-primary w-4 text-center">{quantity}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateQuantity(quantity + 1); }}
                                    className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-90"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center transition-all bg-white/5">
                                {/* Círculo vacío como en Capture 3 */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
