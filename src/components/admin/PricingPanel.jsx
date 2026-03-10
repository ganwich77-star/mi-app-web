import React, { useState } from 'react';
import { Package, Plus, Trash2, Minus, Tag, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import SupplementsPanel from './SupplementsPanel.jsx';

const PricingPanel = ({
    settings,
    updateSettings,
    allPacks,
    allExtras,
    theme
}) => {
    const [expandedSections, setExpandedSections] = useState({
        packs: true,
        extras: false,
        supplements: false,
        provider: false
    });

    const [editingPackId, setEditingPackId] = useState(null);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    return (
        <div className="space-y-8 animate-fade-in pb-20">

            {/* GESTIÓN DE PACKS */}
            <div className="card overflow-hidden transition-all duration-500 border-amber-500/10 hover:border-amber-500/20">
                <div
                    onClick={() => toggleSection('packs')}
                    className="flex items-center justify-between p-6 cursor-pointer select-none group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-all ${expandedSections.packs ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-500'}`}>
                            <Package size={20} />
                        </div>
                        <h3 className="text-xl font-black text-primary flex items-center gap-3">
                            Gestión de Packs
                        </h3>
                    </div>
                    <div className="flex items-center gap-6">
                        {expandedSections.packs && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newId = `pack_${Date.now()}`;
                                    const newPack = {
                                        id: newId,
                                        name: 'Nuevo Pack',
                                        subtitle: 'Descripción breve',
                                        items: ['Item 1', 'Item 2'],
                                        price: 20,
                                        cost: 5,
                                        popular: false
                                    };
                                    updateSettings({ packs: [...allPacks, newPack] });
                                    setEditingPackId(newId);
                                }}
                                className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2"
                            >
                                <Plus size={14} /> Nuevo Pack
                            </button>
                        )}
                        <div className={`transition-transform duration-300 ${expandedSections.packs ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-secondary opacity-40" />
                        </div>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedSections.packs ? 'max-h-[5000px] opacity-100 p-6 pt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    {editingPackId ? (
                        /* VISTA EDITOR DE PACK */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setEditingPackId(null)}
                                    className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-widest hover:text-primary transition-colors"
                                >
                                    <ChevronRight size={14} className="rotate-180" /> Volver a la lista
                                </button>
                                <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">Editando: {allPacks.find(p => p.id === editingPackId)?.name}</h4>
                            </div>

                            {allPacks.filter(p => p.id === editingPackId).map((pack, idx) => {
                                const originalIdx = allPacks.findIndex(p => p.id === pack.id);
                                return (
                                    <div key={pack.id} className="bg-primary/3 rounded-3xl p-8 border border-amber-500/30">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            {/* Columna Izquierda: Info Básica */}
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Nombre del Pack</label>
                                                        <input
                                                            type="text"
                                                            value={pack.name}
                                                            onChange={e => {
                                                                const newPacks = [...allPacks];
                                                                newPacks[originalIdx].name = e.target.value;
                                                                updateSettings({ packs: newPacks });
                                                            }}
                                                            className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-lg font-black text-primary outline-none focus:border-amber-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Subtítulo</label>
                                                        <input
                                                            type="text"
                                                            value={pack.subtitle}
                                                            onChange={e => {
                                                                const newPacks = [...allPacks];
                                                                newPacks[originalIdx].subtitle = e.target.value;
                                                                updateSettings({ packs: newPacks });
                                                            }}
                                                            className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-sm font-bold text-secondary outline-none focus:border-amber-500/50"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Precio Venta</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={pack.price}
                                                                onChange={e => {
                                                                    const newPacks = [...allPacks];
                                                                    newPacks[originalIdx].price = parseFloat(e.target.value) || 0;
                                                                    updateSettings({ packs: newPacks });
                                                                }}
                                                                className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-5 pr-10 py-4 text-xl font-black text-emerald-500 outline-none focus:border-emerald-500/50"
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xl">€</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block">Coste (Base)</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={pack.cost}
                                                                onChange={e => {
                                                                    const newPacks = [...allPacks];
                                                                    newPacks[originalIdx].cost = parseFloat(e.target.value) || 0;
                                                                    updateSettings({ packs: newPacks });
                                                                }}
                                                                className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-5 pr-10 py-4 text-xl font-black text-red-500 outline-none focus:border-red-500/50"
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-xl">€</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-center justify-between shadow-inner">
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Beneficio por Pack</p>
                                                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">{(pack.price - pack.cost).toFixed(2)}€</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Margen Bruto</p>
                                                        <p className="text-xl font-black text-emerald-600 opacity-60">
                                                            {pack.price > 0 ? (((pack.price - pack.cost) / pack.price) * 100).toFixed(0) : 0}%
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const newPacks = [...allPacks];
                                                        newPacks.forEach((p, i) => p.popular = i === originalIdx);
                                                        updateSettings({ packs: newPacks });
                                                    }}
                                                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${pack.popular ? 'bg-amber-500 text-white border-amber-600 shadow-xl shadow-amber-500/40 scale-[1.02]' : 'bg-primary/5 text-secondary border-primary/10 hover:border-amber-500/30'}`}
                                                >
                                                    {pack.popular ? '🌟 PACK DESTACADO' : 'MARCAR COMO POPULAR'}
                                                </button>
                                            </div>

                                            {/* Columna Derecha: Contenido y Acciones */}
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 block opacity-50">Contenido del Pack</label>
                                                    <div className="space-y-3">
                                                        {(pack.items || []).map((item, iIdx) => (
                                                            <div key={iIdx} className="flex gap-3 animate-slide-in">
                                                                <input
                                                                    type="text"
                                                                    value={item}
                                                                    onChange={e => {
                                                                        const newPacks = [...allPacks];
                                                                        newPacks[originalIdx].items[iIdx] = e.target.value;
                                                                        updateSettings({ packs: newPacks });
                                                                    }}
                                                                    className="flex-1 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-xs font-bold text-primary outline-none focus:border-indigo-500/50"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newPacks = [...allPacks];
                                                                        newPacks[originalIdx].items.splice(iIdx, 1);
                                                                        updateSettings({ packs: newPacks });
                                                                    }}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                                >
                                                                    <Minus size={18} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const newPacks = [...allPacks];
                                                                newPacks[originalIdx].items = [...(newPacks[originalIdx].items || []), 'Nuevo item'];
                                                                updateSettings({ packs: newPacks });
                                                            }}
                                                            className="w-full py-3 border-2 border-dashed border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500/5 hover:border-indigo-500/40 transition-all group"
                                                        >
                                                            <Plus size={14} className="group-hover:scale-125 transition-transform" /> AÑADIR ITEM AL CONTENIDO
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-primary/10">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('¿Estás seguro de que quieres eliminar este pack? Esta acción no se puede deshacer.')) {
                                                                updateSettings({ packs: allPacks.filter(p => p.id !== pack.id) });
                                                                setEditingPackId(null);
                                                            }
                                                        }}
                                                        className="w-full py-4 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                                                    >
                                                        <Trash2 size={16} /> Eliminar este Pack definitivamente
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* VISTA CUADRÍCULA DE PACKS */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allPacks.map((pack) => (
                                <div
                                    key={pack.id}
                                    onClick={() => setEditingPackId(pack.id)}
                                    className={`relative group bg-primary/3 rounded-[32px] p-8 border hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden ${pack.popular ? 'border-amber-500/30' : 'border-primary/10'}`}
                                >
                                    {pack.popular && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg">
                                                <Package size={14} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xl font-black text-primary leading-tight">{pack.name}</h4>
                                            <p className="text-xs font-bold text-secondary opacity-60 mt-1">{pack.subtitle}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                                            <div>
                                                <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1 opacity-40">Precio</p>
                                                <p className="text-4xl font-black text-primary tracking-tighter">{pack.price}€</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                                                    EDITAR
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decoración popular */}
                                    {pack.popular && (
                                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
                                    )}
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </div>

            {/* GESTIÓN DE EXTRAS */}
            <div className="card overflow-hidden transition-all duration-500 border-emerald-500/10 hover:border-emerald-500/20">
                <div
                    onClick={() => toggleSection('extras')}
                    className="flex items-center justify-between p-6 cursor-pointer select-none group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-all ${expandedSections.extras ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <Tag size={20} />
                        </div>
                        <h3 className="text-xl font-black text-primary flex items-center gap-3">
                            Productos Extras
                        </h3>
                    </div>
                    <div className="flex items-center gap-6">
                        {expandedSections.extras && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
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
                        )}
                        <div className={`transition-transform duration-300 ${expandedSections.extras ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-secondary opacity-40" />
                        </div>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedSections.extras ? 'max-h-[5000px] opacity-100 p-6 pt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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
                                <div className="space-y-3">
                                    {/* Nombre del Extra */}
                                    <div>
                                        <input
                                            type="text"
                                            value={extra.name}
                                            placeholder="Nombre del extra"
                                            onChange={e => {
                                                const newExtras = [...allExtras];
                                                newExtras[idx].name = e.target.value;
                                                updateSettings({ extras: newExtras });
                                            }}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-primary outline-none focus:border-indigo-500/40 transition-all"
                                        />
                                    </div>
                                    {/* Precios y Costes */}
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
                                    {/* Beneficio */}
                                    <div className="flex items-center justify-between px-1 pt-1 opacity-60">
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Beneficio:</span>
                                        <span className="text-[10px] font-black text-emerald-500">{(extra.price - extra.cost).toFixed(2)}€</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SUPLEMENTOS */}
            <div className="card overflow-hidden transition-all duration-500 border-indigo-500/10 hover:border-indigo-500/20 mt-8">
                <div
                    onClick={() => toggleSection('supplements')}
                    className="flex items-center justify-between p-6 cursor-pointer select-none group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-all ${expandedSections.supplements ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-black text-primary flex items-center gap-3">
                            Gestión de Suplementos
                        </h3>
                    </div>
                    <div className="flex items-center gap-6">
                        {expandedSections.supplements && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newSupplement = {
                                        id: Date.now(),
                                        name: 'Nuevo Suplemento',
                                        price: 0,
                                        active: true
                                    };
                                    updateSettings({ supplements: [...(settings.supplements || []), newSupplement] });
                                }}
                                className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500/20 transition-all flex items-center gap-2"
                            >
                                <Plus size={14} /> Añadir Suplemento
                            </button>
                        )}
                        <div className={`transition-transform duration-300 ${expandedSections.supplements ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-secondary opacity-40" />
                        </div>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedSections.supplements ? 'max-h-[5000px] opacity-100 p-6 pt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <SupplementsPanel
                        settings={settings}
                        updateSettings={updateSettings}
                        theme={theme}
                    />
                </div>
            </div>

            {/* TARIFA DE PROVEEDOR (ACORDEÓN AL FINAL) */}
            <div className="card overflow-hidden transition-all duration-500 border-orange-500/10 hover:border-orange-500/20">
                <div
                    onClick={() => toggleSection('provider')}
                    className="flex items-center justify-between p-6 cursor-pointer select-none group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-all ${expandedSections.provider ? 'bg-orange-500 text-white' : 'bg-orange-500/10 text-orange-500'}`}>
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-black text-primary flex items-center gap-3">
                            Tarifa de Proveedor
                        </h3>
                    </div>
                    <div className={`transition-transform duration-300 ${expandedSections.provider ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-secondary opacity-40" />
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedSections.provider ? 'max-h-[1000px] opacity-100 p-8' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-orange-500/5 rounded-[32px] p-8 border border-orange-500/10">
                        <div className="flex items-center gap-5 text-left w-full md:w-auto">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[24px] flex items-center justify-center text-3xl shadow-xl border border-orange-500/20 shrink-0">📂</div>
                            <div>
                                <h3 className="text-xl font-black text-primary uppercase tracking-tight leading-none mb-1">Configurar Tarifa</h3>
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Sube el PDF de tu laboratorio para calcular márgenes</p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <input
                                type="file"
                                id="provider-pdf-upload-bottom"
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
                                htmlFor="provider-pdf-upload-bottom"
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 cursor-pointer active:scale-95"
                            >
                                <FileText size={18} /> {settings.providerRateName ? 'CAMBIAR PDF TARIFA' : 'VINCULAR PDF TARIFA'}
                            </label>
                            {settings.providerRateName && (
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-3 text-center">
                                    Archivo actual: {settings.providerRateName} ({settings.providerRateDate})
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPanel;
