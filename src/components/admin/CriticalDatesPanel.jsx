import React from 'react';
import {
    Calendar, Plus, Trash2, Camera, Clock, GraduationCap, ChevronDown, Search
} from 'lucide-react';
import { COURSE_GROUPS } from '../../constants.js';

const CriticalDatesPanel = ({
    settings,
    updateSettings,
    schools,
    theme
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [expandedId, setExpandedId] = React.useState(null);

    const isDark = theme === 'dark';

    const addDateException = () => {
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

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(ex => ex.id));
        }
    };

    return (
        <div className="card p-8 space-y-8 relative overflow-hidden">

            {/* Título y Botón Añadir */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Calendar size={28} className="text-orange-500" />
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Fechas importantes</h3>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Cronograma de eventos</p>
                    </div>
                </div>
                <button
                    onClick={addDateException}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-indigo-900/20 uppercase text-xs active:scale-95 shrink-0"
                >
                    <Plus size={18} /> Añadir Excepción
                </button>
            </div>

            {/* Fechas Globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Shooting Global */}
                <div className={`${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50 border-slate-200'} p-6 rounded-3xl border relative group flex flex-col justify-center transition-colors`}>
                    <label className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Camera size={24} className="text-indigo-500" /> Fecha Shooting
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={settings.shootingDateDefault || ''}
                            onChange={e => updateSettings({ shootingDateDefault: e.target.value })}
                            className={`w-full border rounded-xl p-2.5 text-sm font-bold outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900 [color-scheme:light]'}`}
                        />
                    </div>
                </div>

                {/* Plazo App Global */}
                <div className={`${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50 border-slate-200'} p-6 rounded-3xl border relative group flex flex-col justify-center transition-colors`}>
                    <label className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock size={24} className="text-orange-500" /> Límite Pago / App
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={settings.appDeadlineDefault || ''}
                            onChange={e => updateSettings({ appDeadlineDefault: e.target.value })}
                            className={`w-full border rounded-xl p-2.5 text-sm font-bold outline-none focus:border-orange-500 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900 [color-scheme:light]'}`}
                        />
                    </div>
                </div>

                {/* Graduación Global */}
                <div className={`${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50 border-slate-200'} p-6 rounded-3xl border relative group flex flex-col justify-center transition-colors`}>
                    <label className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <GraduationCap size={24} className="text-emerald-500" /> Fecha Graduación
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={settings.graduationDateDefault || ''}
                            onChange={e => updateSettings({ graduationDateDefault: e.target.value })}
                            className={`w-full border rounded-xl p-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900 [color-scheme:light]'}`}
                        />
                    </div>
                </div>
            </div>

            {/* Separador UI */}
            <div className={`h-px my-12 ${isDark ? 'bg-gradient-to-r from-transparent via-slate-800 to-transparent' : 'bg-slate-100'}`} />

            {/* GESTOR DE EXCEPCIONES */}
            <div className={`pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 p-2 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                className={`w-5 h-5 rounded-lg text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-0 transition-all cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}
                            />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">TODO</span>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Gestor de Fechas</h4>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Define quién y cuándo tiene fechas distintas</p>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        {/* BUSCADOR DE EXCEPCIONES */}
                        <div className="relative flex-1 md:w-64 group">
                            <input
                                type="text"
                                placeholder="Buscar por centro o curso..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full border rounded-xl p-2.5 pl-9 text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                                <Search size={14} />
                            </div>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => removeDateExceptions(selectedIds)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Trash2 size={14} /> Eliminar Seleccionados ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                        if (filtered.length === 0 && searchTerm) {
                            return (
                                <div className={`col-span-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 ${isDark ? 'border-slate-800/50 bg-slate-900/10' : 'border-slate-200 bg-slate-50'}`}>
                                    <Plus size={32} className="mb-4 opacity-20 rotate-45" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center">
                                        No se encontraron excepciones para <br />
                                        <span className="text-slate-400">"{searchTerm}"</span>
                                    </span>
                                </div>
                            );
                        }

                        if (filtered.length === 0 && !searchTerm) {
                            return (
                                <div className={`col-span-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 ${isDark ? 'border-slate-800/50 bg-slate-900/10' : 'border-slate-200 bg-slate-50'}`}>
                                    <Calendar size={32} className="mb-4 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No hay excepciones configuradas</span>
                                </div>
                            );
                        }

                        return filtered.map((ex) => {
                            const isExpanded = expandedId === ex.id;
                            const schoolName = schools.find(s => s.id === ex.schoolId)?.name || 'CENTRO EDUCATIVO';

                            return (
                                <div
                                    key={ex.id}
                                    className={`flex flex-col p-5 rounded-[24px] border transition-all cursor-pointer 
                                        ${isExpanded
                                            ? (isDark ? 'bg-indigo-500/5 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-indigo-50 border-indigo-200 shadow-md transform -translate-y-1')
                                            : (isDark ? 'bg-primary/5 border-primary/5 hover:border-primary/20' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm')}`}
                                    onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                                >
                                    {/* Cabecera / Resumen */}
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex gap-3 items-start flex-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(ex.id)}
                                                onChange={(e) => toggleSelect(ex.id, e)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`w-5 h-5 mt-1 rounded-lg text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-0 transition-all cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}
                                            />
                                            <div className="flex-1">
                                                <span className={`text-sm font-black uppercase tracking-wider block transition-colors ${isExpanded ? 'text-indigo-400' : (isDark ? 'text-primary' : 'text-slate-800')}`}>
                                                    {schoolName}
                                                </span>
                                                <div className="flex flex-col mt-1">
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'opacity-40' : 'text-slate-400'}`}>
                                                        {ex.courseName || 'CURSO'} {ex.groupName ? ` • ${ex.groupName}` : ''}
                                                    </p>
                                                    {!isExpanded && (
                                                        <div className="flex gap-3 mt-2">
                                                            {ex.shootingDate && <span className="text-[8px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"><Camera size={8} /> {ex.shootingDate.split('-').reverse().join('/')}</span>}
                                                            {ex.appDeadline && <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"><Clock size={8} /> {ex.appDeadline.split('-').reverse().join('/')}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!isExpanded && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeDateExceptions([ex.id]); }}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isDark ? 'text-secondary hover:text-red-500 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Desplegable de Edición */}
                                    {isExpanded && (
                                        <div className={`mt-6 pt-6 border-t space-y-4 animate-fade-in ${isDark ? 'border-indigo-500/10' : 'border-indigo-100'}`} onClick={(e) => e.stopPropagation()}>
                                            <div>
                                                <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Centro Educativo</label>
                                                <div className="relative">
                                                    <select
                                                        value={ex.schoolId}
                                                        onChange={e => updateDateException(ex.id, { schoolId: e.target.value, courseName: '', groupName: '' })}
                                                        className={`w-full border rounded-xl p-2.5 text-[11px] font-bold appearance-none outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                                                        autoFocus
                                                    >
                                                        <option value="">TODOS</option>
                                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Curso</label>
                                                    <div className="relative">
                                                        <select
                                                            value={ex.courseName}
                                                            onChange={e => updateDateException(ex.id, { courseName: e.target.value, groupName: '' })}
                                                            disabled={!ex.schoolId}
                                                            className={`w-full border rounded-xl p-2.5 text-[11px] font-bold appearance-none outline-none disabled:opacity-30 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                                                        >
                                                            <option value="">TODOS</option>
                                                            {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Línea / Grupo</label>
                                                    <div className="relative">
                                                        <select
                                                            value={ex.groupName}
                                                            onChange={e => updateDateException(ex.id, { groupName: e.target.value })}
                                                            disabled={!ex.courseName}
                                                            className={`w-full border rounded-xl p-2.5 text-[11px] font-bold appearance-none outline-none disabled:opacity-30 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                                                        >
                                                            <option value="">TODOS</option>
                                                            {(COURSE_GROUPS.flatMap(g => g.courses).find(c => c.name === ex.courseName)?.lines || []).map(l => (
                                                                <option key={l} value={l}>{l}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[8px] font-black text-indigo-500 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1 whitespace-nowrap"><Camera size={10} /> Shooting</label>
                                                    <input
                                                        type="date"
                                                        value={ex.shootingDate}
                                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                                        onChange={e => updateDateException(ex.id, { shootingDate: e.target.value })}
                                                        className={`w-full border rounded-xl p-2 text-[10px] font-black outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 text-white [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900 shadow-sm [color-scheme:light]'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-orange-500 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1 whitespace-nowrap"><Clock size={10} /> Límite Pago</label>
                                                    <input
                                                        type="date"
                                                        value={ex.appDeadline}
                                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                                        onChange={e => updateDateException(ex.id, { appDeadline: e.target.value })}
                                                        className={`w-full border rounded-xl p-2 text-[10px] font-black outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 text-white [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900 shadow-sm [color-scheme:light]'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1 whitespace-nowrap"><GraduationCap size={10} /> Graduación</label>
                                                    <input
                                                        type="date"
                                                        value={ex.graduationDate}
                                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                                        onChange={e => updateDateException(ex.id, { graduationDate: e.target.value })}
                                                        className={`w-full border rounded-xl p-2 text-[10px] font-black outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 text-white [color-scheme:dark]' : 'bg-white border-slate-200 text-slate-900 shadow-sm [color-scheme:light]'}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => setExpandedId(null)}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20"
                                                >LISTO</button>
                                                <button
                                                    onClick={() => removeDateExceptions([ex.id])}
                                                    className={`w-12 flex items-center justify-center rounded-xl transition-all border ${isDark ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-white text-red-500 border-red-100 hover:bg-red-50'}`}
                                                    title="Eliminar Excepción"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
};

export default CriticalDatesPanel;
