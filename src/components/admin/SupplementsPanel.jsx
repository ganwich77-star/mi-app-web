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
    theme
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
        <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 mb-8 overflow-hidden relative
            ${isDark
                ? 'bg-primary/5 border-primary/10'
                : 'bg-white border-slate-100 shadow-sm'}`}>

            {/* Decoración de fondo */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20
                ${isDark ? 'bg-indigo-500' : 'bg-indigo-200'}`} />

            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg
                        ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Suplementos</h3>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Configura extras que afectan al precio base</p>
                    </div>
                </div>
                <button
                    onClick={addSupplement}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-indigo-900/20 uppercase text-xs active:scale-95 shrink-0"
                >
                    <Plus size={18} /> Añadir Suplemento
                </button>
            </div>

            {/* Lista de Suplementos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">

                {supplements.map((s) => (
                    <div
                        key={s.id}
                        className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden
                            ${isDark
                                ? 'bg-slate-900/40 border-slate-800 focus-within:border-indigo-500/50'
                                : 'bg-white border-slate-200 focus-within:border-indigo-600/50 shadow-sm'}`}
                    >
                        {/* Indicador de Activado e Icono Borrar */}
                        <div className="flex justify-between items-start mb-8 relative z-20">
                            <button
                                onClick={() => updateSupplement(s.id, { active: !s.active })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-md
                                    ${s.active
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'bg-indigo-600 text-white border border-indigo-500 shadow-indigo-500/20'}`}
                            >
                                <CheckCircle2 size={14} className={s.active ? 'animate-pulse' : ''} />
                                {s.active ? 'Activo' : 'Pausado'}
                            </button>
                            <button
                                onClick={() => removeSupplement(s.id)}
                                className={`p-2.5 rounded-xl transition-all
                                    ${isDark ? 'text-secondary hover:text-red-500 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className={`space-y-6 transition-all duration-300 ${!s.active ? 'opacity-30 grayscale-[0.8]' : ''}`}>
                            {/* Nombre */}
                            <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>Nombre del Suplemento</label>
                                <div className="relative group/input">
                                    <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-700 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'}`} size={16} />
                                    <input
                                        type="text"
                                        placeholder="Ej: Montaje en Foam"
                                        value={s.name}
                                        onChange={(e) => updateSupplement(s.id, { name: e.target.value })}
                                        disabled={!s.active}
                                        className={`w-full border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none transition-all
                                            ${isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-600'}`}
                                    />
                                </div>
                            </div>

                            {/* Precio */}
                            <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>Incremento de Precio</label>
                                <div className="relative group/input">
                                    <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-700 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'}`} size={16} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={s.price}
                                        onChange={(e) => updateSupplement(s.id, { price: parseFloat(e.target.value) || 0 })}
                                        disabled={!s.active}
                                        className={`w-full border rounded-2xl py-4 pl-12 pr-20 text-xs font-black outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                            ${isDark ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-600'}`}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30 uppercase pointer-events-none select-none tracking-widest">
                                        Euros
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Capa de desenfoque selectiva (debajo de los botones, encima del contenido) */}
                        {!s.active && (
                            <div className="absolute inset-x-0 bottom-0 top-0 bg-white/5 dark:bg-black/5 backdrop-blur-[3px] z-10 pointer-events-none" />
                        )}


                    </div>
                ))}

                {supplements.length === 0 && (
                    <div className={`col-span-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 
                        ${isDark ? 'border-slate-800/50 bg-slate-900/10' : 'border-slate-200 bg-slate-50'}`}>
                        <Sparkles size={32} className="mb-4 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">
                            No hay suplementos configurados.<br />Pulsa en "Añadir Suplemento" para empezar.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplementsPanel;
