import React from 'react';
import {
    Sparkles,
    Plus,
    Trash2,
    DollarSign,
    FileText,
    CheckCircle2
} from 'lucide-react';

const SupplementsPanel = ({
    settings,
    updateSettings,
    theme,
    viewMode
}) => {
    const isDark = theme === 'dark';
    const supplements = settings.supplements || [];

    const addSupplement = () => {
        const newSupplement = {
            id: Date.now(),
            name: '',
            price: 0,
            active: true
        };
        updateSettings({ supplements: [...supplements, newSupplement] });
    };

    const updateSupplement = (id, updates) => {
        const updated = supplements.map(s => s.id === id ? { ...s, ...updates } : s);
        updateSettings({ supplements: updated });
    };

    const removeSupplement = (id) => {
        if (!confirm('¿Seguro que quieres eliminar este suplemento?')) return;
        const remaining = supplements.filter(s => s.id !== id);
        updateSettings({ supplements: remaining });
    };

    return (
        <div className="animate-fade-in">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {supplements.map((s, idx) => (
                        <div
                            key={s.id}
                            className={`group bg-primary/3 rounded-2xl p-4 border transition-all relative
                                ${s.active ? 'border-primary/10 hover:border-indigo-500/30' : 'border-red-500/20 opacity-60'}`}
                        >
                            {/* Cabecera Tarjeta: Activo/Pausado y Borrar */}
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={() => updateSupplement(s.id, { active: !s.active })}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                                        ${s.active
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                >
                                    <CheckCircle2 size={10} />
                                    {s.active ? 'Activo' : 'Pausado'}
                                </button>
                                <button
                                    onClick={() => removeSupplement(s.id)}
                                    className="p-1.5 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Nombre */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Nombre del suplemento"
                                        value={s.name}
                                        onChange={(e) => updateSupplement(s.id, { name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-primary outline-none focus:border-indigo-500/40 transition-all"
                                    />
                                </div>

                                {/* Precio */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={s.price}
                                        onChange={(e) => updateSupplement(s.id, { price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-3 pr-12 py-2 text-xs font-black text-indigo-500 outline-none focus:border-indigo-500/40 transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-indigo-500/60 font-black tracking-widest uppercase pointer-events-none">
                                        EUR
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {supplements.map((s, idx) => (
                        <div key={s.id} className={`group flex items-center gap-4 bg-primary/3 hover:bg-primary/5 border border-primary/5 rounded-xl px-6 py-3 transition-all ${!s.active && 'opacity-60'}`}>
                            <button
                                onClick={() => updateSupplement(s.id, { active: !s.active })}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${s.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                            >
                                <CheckCircle2 size={14} />
                            </button>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={s.name}
                                    placeholder="Nombre del suplemento"
                                    onChange={(e) => updateSupplement(s.id, { name: e.target.value })}
                                    className="w-full bg-transparent border-none text-xs font-black text-primary outline-none"
                                />
                            </div>
                            <div className="relative w-32">
                                <input
                                    type="number"
                                    value={s.price}
                                    onChange={(e) => updateSupplement(s.id, { price: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white/10 border border-primary/10 rounded-lg pl-3 pr-10 py-1.5 text-xs font-black text-indigo-500 outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-indigo-500 font-bold font-black opacity-60">EUR</span>
                            </div>
                            <button
                                onClick={() => removeSupplement(s.id)}
                                className="p-2 text-secondary hover:text-red-500 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {supplements.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-primary/10 rounded-2xl flex flex-col items-center justify-center text-secondary/40">
                    <FileText size={32} className="mb-3 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        No hay suplementos configurados
                    </span>
                </div>
            )}
        </div>
    );
};

export default SupplementsPanel;
