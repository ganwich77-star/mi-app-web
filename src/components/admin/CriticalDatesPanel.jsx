import React, { useState } from 'react';
import {
    Calendar, Plus, Trash2, Camera, Clock, GraduationCap, ChevronDown, Search
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
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

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
        setExpandedId(newEx.id);
    };

    const updateDateException = (id, updates) => {
        const updated = (settings.dateExceptions || []).map(ex => ex.id === id ? { ...ex, ...updates } : ex);
        updateSettings({ dateExceptions: updated });
    };

    const removeDateExceptions = (idsToBg) => {
        const filtered = (settings.dateExceptions || []).filter(ex => !idsToBg.includes(ex.id));
        updateSettings({ dateExceptions: filtered });
        setSelectedIds([]);
        if (idsToBg.includes(expandedId)) setExpandedId(null);
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
        <div className={`card overflow-hidden transition-all duration-500 ${isOpen ? 'ring-2 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10' : 'hover:ring-1 hover:ring-indigo-500/10 shadow-lg'}`}>
            {/* Header / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between p-8 cursor-pointer transition-colors ${isOpen ? 'bg-indigo-500/5' : 'hover:bg-primary/2'}`}
            >
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isOpen ? 'bg-indigo-600 text-white scale-110 rotate-3' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        <Calendar size={30} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Fechas importantes</h3>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Cronograma de eventos y excepciones</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Botón condicional: solo aparece si está abierto */}
                    <div className={`transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none translate-x-4'}`}>
                        <button
                            onClick={addDateException}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20 uppercase text-[10px] active:scale-95 shrink-0"
                        >
                            <Plus size={16} /> AÑADIR EXCEPCIÓN
                        </button>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-indigo-500/20 text-indigo-400 rotate-180' : 'bg-primary/5 text-secondary'}`}>
                        <ChevronDown size={24} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100 p-8 pt-4' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>

                {/* Fechas Globales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-primary/2 border border-primary/5 p-6 rounded-[2rem] flex flex-col justify-center gap-4 hover:border-indigo-500/20 transition-colors group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-3">
                            <Camera size={20} className="text-indigo-500" /> Fecha Shooting
                        </label>
                        <input
                            type="date"
                            value={settings.shootingDateDefault || ''}
                            onChange={e => updateSettings({ shootingDateDefault: e.target.value })}
                            className="input-dark w-full py-4 px-6 text-sm font-black rounded-2xl [color-scheme:dark]"
                        />
                    </div>

                    <div className="bg-primary/2 border border-primary/5 p-6 rounded-[2rem] flex flex-col justify-center gap-4 hover:border-orange-500/20 transition-colors group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-3">
                            <Clock size={20} className="text-orange-500" /> Límite Pago / App
                        </label>
                        <input
                            type="date"
                            value={settings.appDeadlineDefault || ''}
                            onChange={e => updateSettings({ appDeadlineDefault: e.target.value })}
                            className="input-dark w-full py-4 px-6 text-sm font-black rounded-2xl [color-scheme:dark]"
                        />
                    </div>

                    <div className="bg-primary/2 border border-primary/5 p-6 rounded-[2rem] flex flex-col justify-center gap-4 hover:border-emerald-500/20 transition-colors group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-3">
                            <GraduationCap size={20} className="text-emerald-500" /> Fecha Graduación
                        </label>
                        <input
                            type="date"
                            value={settings.graduationDateDefault || ''}
                            onChange={e => updateSettings({ graduationDateDefault: e.target.value })}
                            className="input-dark w-full py-4 px-6 text-sm font-black rounded-2xl [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Separador UI */}
                <div className="flex items-center gap-4 mb-10 opacity-60">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/10" />
                    <span className="text-[9px] font-black text-secondary tracking-[0.3em] uppercase">Excepciones por Centro</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/10" />
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((ex) => {
                        const isExpanded = expandedId === ex.id;
                        const schoolName = schools.find(s => s.id === ex.schoolId)?.name || 'SIN ASIGNAR';

                        return (
                            <div
                                key={ex.id}
                                className={`group relative flex flex-col p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer
                                    ${isExpanded
                                        ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl shadow-indigo-500/5'
                                        : 'bg-primary/2 border-primary/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:-translate-y-1'}`}
                                onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                            >
                                <div className="flex justify-between items-start w-full gap-4">
                                    <div className="flex gap-4 items-start flex-1 min-w-0">
                                        <div className="pt-1">
                                            <div
                                                onClick={(e) => toggleSelect(ex.id, e)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(ex.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-primary/10 bg-primary/5 hover:border-indigo-500/50'}`}
                                            >
                                                {selectedIds.includes(ex.id) && <Plus size={14} className="rotate-45" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm font-black uppercase tracking-tight block truncate transition-colors ${isExpanded ? 'text-indigo-400' : 'text-primary'}`}>
                                                {schoolName}
                                            </span>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-60 mt-1">
                                                {ex.courseName || 'CURSO'} {ex.groupName ? ` • ${ex.groupName}` : ''}
                                            </p>

                                            {!isExpanded && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {ex.shootingDate && (
                                                        <div className="flex items-center gap-1.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 px-2 py-1 rounded-lg">
                                                            <Camera size={10} />
                                                            <span className="text-[9px] font-black tracking-tighter">{ex.shootingDate.split('-').reverse().slice(0, 2).join('/')}</span>
                                                        </div>
                                                    )}
                                                    {ex.appDeadline && (
                                                        <div className="flex items-center gap-1.5 bg-orange-500/5 text-orange-400 border border-orange-500/10 px-2 py-1 rounded-lg">
                                                            <Clock size={10} />
                                                            <span className="text-[9px] font-black tracking-tighter">{ex.appDeadline.split('-').reverse().slice(0, 2).join('/')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isExpanded && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeDateExceptions([ex.id]); }}
                                            className="w-10 h-10 flex items-center justify-center text-secondary/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Edición Desplegable */}
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 mt-6 pt-6 border-t border-indigo-500/10' : 'max-h-0 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2 ml-1 opacity-70">Asignar a Centro</label>
                                            <div className="relative">
                                                <select
                                                    value={ex.schoolId}
                                                    onChange={e => updateDateException(ex.id, { schoolId: e.target.value, courseName: '', groupName: '' })}
                                                    className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-indigo-500/20 appearance-none"
                                                >
                                                    <option value="">TODOS LOS CENTROS</option>
                                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2 ml-1 opacity-70">Curso</label>
                                                <div className="relative">
                                                    <select
                                                        value={ex.courseName}
                                                        onChange={e => updateDateException(ex.id, { courseName: e.target.value, groupName: '' })}
                                                        disabled={!ex.schoolId}
                                                        className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-indigo-500/20 appearance-none disabled:opacity-20"
                                                    >
                                                        <option value="">TODOS</option>
                                                        {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2 ml-1 opacity-70">Grupo</label>
                                                <div className="relative">
                                                    <select
                                                        value={ex.groupName}
                                                        onChange={e => updateDateException(ex.id, { groupName: e.target.value })}
                                                        disabled={!ex.courseName}
                                                        className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-indigo-500/20 appearance-none disabled:opacity-20"
                                                    >
                                                        <option value="">TODOS</option>
                                                        {(COURSE_GROUPS.flatMap(g => g.courses).find(c => c.name === ex.courseName)?.lines || []).map(l => (
                                                            <option key={l} value={l}>{l}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Camera size={12} /> Shooting</label>
                                                <input
                                                    type="date"
                                                    value={ex.shootingDate}
                                                    onChange={e => updateDateException(ex.id, { shootingDate: e.target.value })}
                                                    className="input-dark w-full py-3 px-4 text-[10px] font-black rounded-xl [color-scheme:dark]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-orange-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12} /> Límite Pago</label>
                                                <input
                                                    type="date"
                                                    value={ex.appDeadline}
                                                    onChange={e => updateDateException(ex.id, { appDeadline: e.target.value })}
                                                    className="input-dark w-full py-3 px-4 text-[10px] font-black rounded-xl [color-scheme:dark]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1 flex items-center gap-2"><GraduationCap size={12} /> Graduación</label>
                                                <input
                                                    type="date"
                                                    value={ex.graduationDate}
                                                    onChange={e => updateDateException(ex.id, { graduationDate: e.target.value })}
                                                    className="input-dark w-full py-3 px-4 text-[10px] font-black rounded-xl [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setExpandedId(null)}
                                                className="flex-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/20 rounded-xl py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                            >
                                                CONFIRMAR EXCEPCIÓN
                                            </button>
                                            <button
                                                onClick={() => removeDateExceptions([ex.id])}
                                                className="w-14 h-14 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all shadow-lg active:scale-95"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-primary/10 rounded-[3rem] bg-primary/2 flex flex-col items-center justify-center text-center">
                        <Calendar size={40} className="text-secondary/20 mb-6" />
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary/30">
                            {searchTerm ? `No se encontraron resultados` : "No hay excepciones de fecha registradas"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriticalDatesPanel;
