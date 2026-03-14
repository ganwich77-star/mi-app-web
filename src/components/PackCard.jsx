import { Check, Plus, Minus, Trash2, X } from 'lucide-react';

export default function PackCard({ pack, selected, quantity = 1, onSelect, onUpdateQuantity }) {
    return (
        <div
            onClick={() => !selected && onSelect()}
            className={`w-full text-left rounded-[32px] p-5 sm:p-6 border-2 transition-all duration-300 active:scale-98 relative overflow-hidden backdrop-blur-md cursor-pointer
        ${selected
                    ? 'border-accent bg-accent/10 shadow-2xl shadow-accent/20 scale-[1.02]'
                    : 'border-primary/5 bg-primary/5 hover:border-primary/20'}`}
        >
            {/* Botón rápido para deseleccionar - Accesibilidad: 40px min */}
            {selected && (
                <button
                    onClick={(e) => { e.stopPropagation(); onSelect(); }}
                    className="absolute -top-1 -right-1 w-11 h-11 bg-accent text-white rounded-bl-2xl flex items-center justify-center shadow-lg hover:bg-accent/90 transition-all z-20"
                    aria-label="Deseleccionar pack"
                >
                    <X size={18} />
                </button>
            )}

            {/* Fondo decorativo */}
            {selected && (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 pointer-events-none" />
            )}

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                {/* Info izquierda */}
                <div className="flex-1 min-w-0 w-full">
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 transition-opacity ${selected ? 'text-accent' : 'text-black'}`}>
                        {pack.subtitle}
                    </p>
                    <h3 className={`text-xl font-black transition-colors ${selected ? 'text-accent' : 'text-black'}`}>
                        {pack.name}
                    </h3>

                    {/* Items del pack - Mejorado contraste */}
                    <ul className="mt-5 space-y-2.5">
                        {pack.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-[13px] text-black font-bold tracking-tight">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${selected ? 'bg-accent text-white shadow-glow' : 'bg-black/10 text-black'}`}>
                                    <Check size={10} strokeWidth={4} />
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Columna derecha: precio + selector */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-4">
                    <div className="flex flex-col items-start sm:items-end">
                        {/* Badge "Populares" */}
                        {pack.popular && (
                            <span className="flex items-center gap-1 bg-amber-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-2 animate-pulse-slow">
                                ★ Populares
                            </span>
                        )}
                        {/* Precio - Reposicionado para evitar solape */}
                        <p className={`text-3xl font-black leading-none ${selected ? 'text-accent' : 'text-primary'}`}>
                            {pack.price}<span className="text-lg ml-0.5 opacity-60">€</span>
                        </p>
                    </div>

                    {/* Selector de Cantidad - Botones de 40px para táctil */}
                    <div className="mt-auto">
                        {selected ? (
                            <div className="flex items-center bg-white/20 dark:bg-white/10 border border-primary/10 rounded-[20px] p-1.5 gap-3 shadow-xl backdrop-blur-md">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (quantity === 1) onSelect();
                                        else onUpdateQuantity(quantity - 1);
                                    }}
                                    className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all active:scale-95 ${quantity === 1 ? 'bg-red-500 text-white' : 'bg-white/10 text-primary hover:bg-white/20'}`}
                                >
                                    {quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                </button>
                                <span className="text-xl font-black text-primary min-w-[1.5rem] text-center">{quantity}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUpdateQuantity(quantity + 1); }}
                                    className="w-10 h-10 rounded-[14px] bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-95"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center transition-all bg-white/5 hover:border-accent hover:bg-accent/5 group">
                                <Plus size={20} className="text-primary/30 group-hover:text-accent group-hover:scale-110 transition-all" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


