import React from 'react';
import { Package, Plus, Trash2, Minus, Tag, FileText } from 'lucide-react';
import SupplementsPanel from './SupplementsPanel.jsx';

const PricingPanel = ({
    settings,
    updateSettings,
    allPacks,
    allExtras,
    theme
}) => {
    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* BLOQUE TARIFA PROVEEDOR */}
            <div className="card p-8 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] flex items-center justify-center text-3xl shadow-xl border border-indigo-500/20">📂</div>
                        <div>
                            <h3 className="text-xl font-black text-primary uppercase tracking-tight">Tarifa de Proveedor</h3>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Sube el PDF de tu laboratorio para calcular márgenes</p>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <input
                            type="file"
                            id="provider-pdf-upload"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    updateSettings({
                                        providerRateName: file.name,
                                        providerRateDate: new Date().toLocaleDateString()
                                    });
                                    alert(`✅ Tarifa "${file.name}" vinculada correctamente.`);
                                }
                            }}
                        />
                        <label
                            htmlFor="provider-pdf-upload"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 cursor-pointer active:scale-95"
                        >
                            <FileText size={18} /> {settings.providerRateName ? 'CAMBIAR PDF TARIFA' : 'VINCULAR PDF TARIFA'}
                        </label>
                        {settings.providerRateName && (
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-3 text-center">
                                Archivo actual: {settings.providerRateName} ({settings.providerRateDate})
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* GESTIÓN DE PACKS */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-primary flex items-center gap-3">
                        <Package size={24} className="text-amber-500" /> Gestión de Packs
                    </h3>
                    <button
                        onClick={() => {
                            const newPack = {
                                id: `pack_${Date.now()}`,
                                name: 'Nuevo Pack',
                                subtitle: 'Descripción breve',
                                items: ['Item 1', 'Item 2'],
                                price: 20,
                                cost: 5,
                                popular: false
                            };
                            updateSettings({ packs: [...allPacks, newPack] });
                        }}
                        className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> Nuevo Pack
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPacks.map((pack, idx) => (
                        <div key={pack.id} className="relative group bg-primary/3 rounded-3xl p-6 border border-primary/10 hover:border-amber-500/30 transition-all">
                            <button
                                onClick={() => {
                                    if (confirm('¿Borrar este pack?')) {
                                        updateSettings({ packs: allPacks.filter(p => p.id !== pack.id) });
                                    }
                                }}
                                className="absolute top-4 right-4 p-2 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Nombre del Pack</label>
                                    <input
                                        type="text"
                                        value={pack.name}
                                        onChange={e => {
                                            const newPacks = [...allPacks];
                                            newPacks[idx].name = e.target.value;
                                            updateSettings({ packs: newPacks });
                                        }}
                                        className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 text-sm font-black text-primary outline-none focus:border-amber-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Subtítulo</label>
                                    <input
                                        type="text"
                                        value={pack.subtitle}
                                        onChange={e => {
                                            const newPacks = [...allPacks];
                                            newPacks[idx].subtitle = e.target.value;
                                            updateSettings({ packs: newPacks });
                                        }}
                                        className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 text-xs font-bold text-secondary outline-none focus:border-amber-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Precio Venta</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={pack.price}
                                                onChange={e => {
                                                    const newPacks = [...allPacks];
                                                    newPacks[idx].price = parseFloat(e.target.value) || 0;
                                                    updateSettings({ packs: newPacks });
                                                }}
                                                className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-4 pr-8 py-2.5 text-sm font-black text-emerald-500 outline-none"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">€</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Coste (Base)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={pack.cost}
                                                onChange={e => {
                                                    const newPacks = [...allPacks];
                                                    newPacks[idx].cost = parseFloat(e.target.value) || 0;
                                                    updateSettings({ packs: newPacks });
                                                }}
                                                className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-4 pr-8 py-2.5 text-sm font-black text-red-500 outline-none"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">€</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CÁLCULO DE BENEFICIO */}
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Beneficio por Pack</p>
                                        <p className="text-lg font-black text-emerald-600 leading-none">{(pack.price - pack.cost).toFixed(2)}€</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Margen Bruto</p>
                                        <p className="text-[11px] font-black text-emerald-600 opacity-60 leading-none">
                                            {pack.price > 0 ? (((pack.price - pack.cost) / pack.price) * 100).toFixed(0) : 0}%
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const newPacks = [...allPacks];
                                        newPacks.forEach((p, i) => p.popular = i === idx);
                                        updateSettings({ packs: newPacks });
                                    }}
                                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${pack.popular ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' : 'bg-primary/5 text-secondary border-primary/10 hover:border-amber-500/30'}`}
                                >
                                    {pack.popular ? '🌟 Pack Destacado' : 'Marcar como popular'}
                                </button>

                                <div className="pt-2">
                                    <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-2 opacity-50">Contenido del Pack</p>
                                    <div className="space-y-1.5">
                                        {(pack.items || []).map((item, iIdx) => (
                                            <div key={iIdx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={e => {
                                                        const newPacks = [...allPacks];
                                                        newPacks[idx].items[iIdx] = e.target.value;
                                                        updateSettings({ packs: newPacks });
                                                    }}
                                                    className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-primary outline-none"
                                                />
                                                <button onClick={() => {
                                                    const newPacks = [...allPacks];
                                                    newPacks[idx].items.splice(iIdx, 1);
                                                    updateSettings({ packs: newPacks });
                                                }} className="text-secondary hover:text-red-500">
                                                    <Minus size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newPacks = [...allPacks];
                                                newPacks[idx].items = [...(newPacks[idx].items || []), 'Nuevo item'];
                                                updateSettings({ packs: newPacks });
                                            }}
                                            className="text-[9px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mt-2 hover:text-indigo-300"
                                        >
                                            <Plus size={10} /> Añadir Item
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GESTIÓN DE EXTRAS */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-primary flex items-center gap-3">
                        <Tag size={24} className="text-emerald-500" /> Productos Extras
                    </h3>
                    <button
                        onClick={() => {
                            const newExtra = {
                                id: `extra_${Date.now()}`,
                                name: 'Nuevo Extra',
                                price: 5,
                                cost: 1,
                                emoji: '🎁'
                            };
                            updateSettings({ extras: [...allExtras, newExtra] });
                        }}
                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> Nuevo Extra
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {allExtras.map((extra, idx) => (
                        <div key={extra.id} className="group bg-primary/3 rounded-2xl p-4 border border-primary/10 hover:border-emerald-500/30 transition-all relative">
                            <button
                                onClick={() => {
                                    if (confirm('¿Borrar este extra?')) {
                                        updateSettings({ extras: allExtras.filter(e => e.id !== extra.id) });
                                    }
                                }}
                                className="absolute top-3 right-3 p-1.5 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={extra.emoji}
                                        onChange={e => {
                                            const newExtras = [...allExtras];
                                            newExtras[idx].emoji = e.target.value;
                                            updateSettings({ extras: newExtras });
                                        }}
                                        className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-center text-lg outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={extra.name}
                                        onChange={e => {
                                            const newExtras = [...allExtras];
                                            newExtras[idx].name = e.target.value;
                                            updateSettings({ extras: newExtras });
                                        }}
                                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 text-xs font-bold text-primary outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={extra.price}
                                            onChange={e => {
                                                const newExtras = [...allExtras];
                                                newExtras[idx].price = parseFloat(e.target.value) || 0;
                                                updateSettings({ extras: newExtras });
                                            }}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-3 pr-6 py-2 text-xs font-black text-emerald-500 outline-none"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold">€</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={extra.cost}
                                            onChange={e => {
                                                const newExtras = [...allExtras];
                                                newExtras[idx].cost = parseFloat(e.target.value) || 0;
                                                updateSettings({ extras: newExtras });
                                            }}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl pl-3 pr-6 py-2 text-xs font-black text-red-500 outline-none"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-bold">€</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Beneficio:</span>
                                    <span className="text-[10px] font-black text-emerald-500">{(extra.price - extra.cost).toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BLOQUE SUPLEMENTOS */}
            <div className="mt-8 border-t border-primary/10 pt-8">
                <SupplementsPanel
                    settings={settings}
                    updateSettings={updateSettings}
                    theme={theme}
                />
            </div>
        </div>
    );
};

export default PricingPanel;
