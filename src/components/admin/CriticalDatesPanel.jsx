import React, { useState, useRef } from 'react';
import {
    Calendar, Plus, Trash2, Camera, CreditCard, GraduationCap, ChevronDown, Search, ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { COURSE_GROUPS } from '../../constants.js';

const CriticalDatesPanel = ({
    settings,
    updateSettings,
    schools,
    theme = 'dark'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedIds, setSelectedIds] = useState([]);
    const [editingExceptionId, setEditingExceptionId] = useState(null);

    const isDark = theme === 'dark';

    const addDateException = (e) => {
        e.stopPropagation();
        if (!isOpen) setIsOpen(true);
        setSearchTerm('');
        const newEx = {
            id: Date.now(),
            schoolId: '',
            courseName: '',
            groupName: '',
            shootingDate: '',
            appDeadline: '',
            graduationDate: ''
        };
        updateSettings({ dateExceptions: [...(settings.dateExceptions || []), newEx] });
        setEditingExceptionId(newEx.id);
    };

    const updateDateException = (id, updates) => {
        const updated = (settings.dateExceptions || []).map(ex => ex.id === id ? { ...ex, ...updates } : ex);
        updateSettings({ dateExceptions: updated });
    };

    const removeDateExceptions = (idsToBg) => {
        const filtered = (settings.dateExceptions || []).filter(ex => !idsToBg.includes(ex.id));
        updateSettings({ dateExceptions: filtered });
        setSelectedIds([]);
        if (idsToBg.includes(editingExceptionId)) setEditingExceptionId(null);
    };

    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filtered = (settings.dateExceptions || []).filter(ex => {
        if (!searchTerm) return true;
        const schoolName = schools.find(s => s.id === ex.schoolId)?.name || 'Todos';
        const match = `${schoolName} ${ex.courseName || ''} ${ex.groupName || ''}`.toLowerCase();
        return match.includes(searchTerm.toLowerCase());
    });

    const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

    const toggleSelectAll = (e) => {
        e.stopPropagation();
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(ex => ex.id));
        }
    };

    return (
        <div className={`card overflow-hidden transition-all duration-500 ${isOpen ? 'ring-2 ring-orange-500/20 shadow-2xl shadow-orange-500/10' : 'hover:ring-1 hover:ring-orange-500/10 shadow-lg'}`}>
            {/* Header / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between p-8 cursor-pointer transition-colors ${isOpen ? 'bg-orange-500/5' : 'hover:bg-primary/2'}`}
            >
                <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isOpen ? 'bg-orange-600 text-white' : 'bg-orange-500/10 text-orange-500'}`}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Fechas importantes</h3>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Cronograma de eventos y excepciones</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Botones condicionales: solo aparecen si está abierto */}
                    <div className={`flex items-center gap-3 transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none translate-x-4'}`}>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); removeDateExceptions(selectedIds); }}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-rose-900/40 uppercase text-[10px] active:scale-95 shrink-0"
                            >
                                <Trash2 size={16} /> ELIMINAR FECHAS ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={addDateException}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 uppercase text-[10px] active:scale-95 shrink-0"
                        >
                            <Plus size={16} /> AÑADIR FECHAS
                        </button>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-orange-500/20 text-orange-500 rotate-180' : 'bg-primary/5 text-secondary'}`}>
                        <ChevronDown size={24} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100 p-8 pt-4' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>

                {/* Buscador y Multi-borrado */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div
                            onClick={toggleSelectAll}
                            className={`flex items-center gap-3 px-5 py-4 rounded-xl border cursor-pointer transition-all ${isAllSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-primary/5 border-primary/10 text-secondary hover:border-indigo-500'}`}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isAllSelected ? 'bg-white border-white text-indigo-600' : 'border-primary/20'}`}>
                                {isAllSelected && <Plus size={14} className="rotate-45" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">TODO</span>
                        </div>
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="BUSCAR POR CENTRO O CURSO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-dark w-full pl-14 py-4.5 text-[11px] font-black tracking-widest uppercase rounded-2xl"
                            />
                        </div>
                        {/* Toggle de vistas */}
                        <div className="flex bg-primary/5 rounded-xl p-1 gap-1 h-[52px]">
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewMode('grid'); }}
                                className={`w-12 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-xl text-orange-600' : 'text-secondary/40 hover:text-orange-500'}`}
                                title="Vista Cuadrícula"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewMode('list'); }}
                                className={`w-12 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-xl text-orange-600' : 'text-secondary/40 hover:text-orange-500'}`}
                                title="Vista Lista"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => removeDateExceptions(selectedIds)}
                            className="flex items-center gap-3 px-8 py-4.5 bg-rose-500/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95 whitespace-nowrap border border-rose-500/20"
                        >
                            <Trash2 size={16} /> ELIMINAR ({selectedIds.length})
                        </button>
                    )}
                </div>

                {editingExceptionId ? (
                    /* VISTA EDITOR DE EXCEPCIÓN */
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => setEditingExceptionId(null)}
                                className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-widest hover:text-primary transition-colors group"
                            >
                                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Volver a la lista
                            </button>
                            <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest">
                                EDITANDO: {(() => {
                                    const ex = (settings.dateExceptions || []).find(e => e.id === editingExceptionId);
                                    if (!ex) return '';
                                    const school = schools.find(s => s.id === ex.schoolId)?.name || 'Todos los centros';
                                    return `${school}${ex.courseName ? ` • ${ex.courseName}` : ''}${ex.groupName ? ` • ${ex.groupName}` : ''}`;
                                })()}
                            </h4>
                        </div>

                        {(() => {
                            const ex = (settings.dateExceptions || []).find(e => e.id === editingExceptionId);
                            if (!ex) return null;

                            const DateIsland = ({ label, value, onChange, icon: Icon, colorClass, id }) => (
                                <div
                                    onClick={() => document.getElementById(id)?.showPicker()}
                                    className="bg-primary/2 border border-primary/5 p-8 rounded-[2.5rem] flex flex-col justify-between gap-6 hover:border-orange-500/30 transition-all group cursor-pointer h-full relative overflow-hidden"
                                >
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-3 relative z-10">
                                        <Icon size={20} className={colorClass} /> {label}
                                    </label>
                                    <div className="relative z-10 min-h-[4rem] flex items-center">
                                        <input
                                            id={id}
                                            type="date"
                                            value={value || ''}
                                            onChange={e => onChange(e.target.value)}
                                            className="bg-transparent border-none text-2xl font-black text-black [color-scheme:light] cursor-pointer w-full focus:ring-0 focus:outline-none"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${colorClass.replace('text-', 'bg-')}`} style={{ borderRadius: '50%' }} />
                                </div>
                            );

                            return (
                                <div className="bg-primary/3 rounded-[3rem] p-12 border border-orange-500/20 shadow-2xl">
                                    <div className="space-y-12">
                                        {/* Fila superior: Configuración de Alcance */}
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-[6]">
                                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4 block">Centro</label>
                                                <div className="relative">
                                                    <select
                                                        value={ex.schoolId}
                                                        onChange={e => updateDateException(ex.id, { schoolId: e.target.value, courseName: '', groupName: '' })}
                                                        className="input-dark w-full py-5 px-8 text-xs font-black uppercase rounded-2xl border-orange-500/10 appearance-none focus:border-orange-500/40 bg-primary/2 !text-black cursor-pointer"
                                                    >
                                                        <option value="">TODOS LOS CENTROS</option>
                                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex-[2]">
                                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4 block">Curso</label>
                                                <div className="relative">
                                                    <select
                                                        value={ex.courseName}
                                                        onChange={e => updateDateException(ex.id, { courseName: e.target.value, groupName: '' })}
                                                        className="input-dark w-full py-5 px-5 text-xs font-black uppercase rounded-2xl border-orange-500/10 appearance-none focus:border-orange-500/40 bg-primary/2 text-black cursor-pointer"
                                                    >
                                                        <option value="">TODOS</option>
                                                        {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex-[2]">
                                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4 block">Grupo</label>
                                                <div className="relative">
                                                    <select
                                                        value={ex.groupName}
                                                        onChange={e => updateDateException(ex.id, { groupName: e.target.value })}
                                                        className="input-dark w-full py-5 px-5 text-xs font-black uppercase rounded-2xl border-orange-500/10 appearance-none focus:border-orange-500/40 bg-primary/2 text-black cursor-pointer"
                                                    >
                                                        <option value="">TODOS</option>
                                                        {(COURSE_GROUPS.flatMap(g => g.courses).find(c => c.name === ex.courseName)?.lines || []).map(l => (
                                                            <option key={l} value={l}>{l}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fila central: Islas de Fecha */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <DateIsland
                                                id="shooting-date"
                                                label="FECHA DE SHOOTING"
                                                value={ex.shootingDate}
                                                onChange={v => updateDateException(ex.id, { shootingDate: v })}
                                                icon={Camera}
                                                colorClass="text-indigo-400"
                                            />
                                            <DateIsland
                                                id="payment-deadline"
                                                label="LÍMITE PAGO / APP"
                                                value={ex.appDeadline}
                                                onChange={v => updateDateException(ex.id, { appDeadline: v })}
                                                icon={CreditCard}
                                                colorClass="text-orange-400"
                                            />
                                            <DateIsland
                                                id="grad-date"
                                                label="FECHA GRADUACIÓN"
                                                value={ex.graduationDate}
                                                onChange={v => updateDateException(ex.id, { graduationDate: v })}
                                                icon={GraduationCap}
                                                colorClass="text-emerald-400"
                                            />
                                        </div>

                                        {/* Fila inferior: Acciones */}
                                        <div className="flex flex-col md:flex-row gap-6 pt-8 border-t border-primary/10">
                                            <button
                                                onClick={() => removeDateExceptions([ex.id])}
                                                className="flex-1 py-5 flex items-center justify-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                <Trash2 size={18} /> ELIMINAR FECHAS
                                            </button>
                                            <button
                                                onClick={() => setEditingExceptionId(null)}
                                                className="flex-[2] py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-900/40 active:scale-[0.98]"
                                            >
                                                CONFIRMAR Y FINALIZAR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    /* VISTA CUADRÍCULA / LISTA DE EXCEPCIONES */
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" : "flex flex-col gap-4 animate-fade-in"}>
                        {filtered.map((ex) => (
                            <div
                                key={ex.id}
                                onClick={() => setEditingExceptionId(ex.id)}
                                className={`group relative flex transition-all duration-500 cursor-pointer shadow-lg hover:shadow-orange-500/5 overflow-hidden border bg-primary/2 border-primary/5 hover:border-orange-500/40 hover:bg-orange-500/5
                                    ${viewMode === 'grid' ? 'flex-col p-5 rounded-[2rem] hover:-translate-y-1' : 'flex-row items-center p-3 px-6 rounded-2xl'}`}
                            >
                                <div className={`flex-1 min-w-0 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center gap-6'}`}>
                                    {/* Cabecera de la Tarjeta / Info Principal */}
                                    <div className={`flex items-center ${viewMode === 'grid' ? 'gap-3 mb-5' : 'gap-4 min-w-[250px]'}`}>
                                        {/* Selector de Check */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelect(ex.id, e);
                                            }}
                                            className={`w-5 h-5 rounded-full border-2 shrink-0 cursor-pointer transition-all flex items-center justify-center ${selectedIds.includes(ex.id) ? 'bg-indigo-600 border-indigo-600' : 'border-primary/20 hover:border-indigo-500'}`}
                                        >
                                            {selectedIds.includes(ex.id) && <Plus size={12} className="text-white rotate-45" />}
                                        </div>

                                        <div className="min-w-0">
                                            <h5 className={`font-black text-black uppercase tracking-wider truncate mb-0.5 ${viewMode === 'grid' ? 'text-[11px]' : 'text-[12px]'}`}>
                                                {schools.find(s => s.id === (ex.schoolId || ''))?.name || 'Todos los centros'}
                                            </h5>
                                            <p className={`font-bold text-black uppercase tracking-widest truncate ${viewMode === 'grid' ? 'text-[9px]' : 'text-[10px]'}`}>
                                                {ex.courseName || 'Todos los cursos'}{ex.groupName ? ` • ${ex.groupName}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fechas Resumidas */}
                                    <div className={`flex gap-2 items-center ${viewMode === 'grid' ? 'flex-col w-full max-w-[160px] mx-auto' : 'flex-row flex-1'}`}>
                                        <div className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors ${viewMode === 'grid' ? 'w-full' : 'min-w-[80px]'}`}>
                                            <Camera size={12} className="text-indigo-400" />
                                            <span className="text-[10px] font-black text-indigo-300 tracking-[0.1em] uppercase">
                                                {ex.shootingDate ? new Date(ex.shootingDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                            </span>
                                        </div>
                                        <div className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-xl border border-orange-500/20 group-hover:border-orange-500/40 transition-colors ${viewMode === 'grid' ? 'w-full' : 'min-w-[80px]'}`}>
                                            <CreditCard size={12} className="text-orange-400" />
                                            <span className="text-[10px] font-black text-orange-300 tracking-[0.1em] uppercase">
                                                {ex.appDeadline ? new Date(ex.appDeadline).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                            </span>
                                        </div>
                                        <div className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors ${viewMode === 'grid' ? 'w-full' : 'min-w-[80px]'}`}>
                                            <GraduationCap size={12} className="text-emerald-400" />
                                            <span className="text-[10px] font-black text-emerald-300 tracking-[0.1em] uppercase">
                                                {ex.graduationDate ? new Date(ex.graduationDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón EDITAR compacto / Acciones */}
                                <div className={`${viewMode === 'grid' ? 'mt-4 pt-3 border-t border-primary/5' : 'ml-4'} flex items-center justify-between relative z-10 shrink-0`}>
                                    <div className={`transition-all ${viewMode === 'grid' ? 'opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0' : 'mr-4'}`}>
                                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                                            EDITAR
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeDateExceptions([ex.id]); }}
                                        className={`flex items-center justify-center text-secondary/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all ${viewMode === 'grid' ? 'w-8 h-8 opacity-0 group-hover:opacity-100' : 'w-10 h-10'}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Decoración */}
                                <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-full py-20 border-2 border-dashed border-primary/10 rounded-[3rem] bg-primary/2 flex flex-col items-center justify-center text-center">
                                <Calendar size={40} className="text-secondary/20 mb-6" />
                                <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary/30">
                                    {searchTerm ? `No se encontraron resultados` : "No hay excepciones de fecha registradas"}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriticalDatesPanel;
