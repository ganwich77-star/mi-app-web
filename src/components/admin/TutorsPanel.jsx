import React from 'react';
import {
    UserCircle, Plus, Trash2, Mail, Phone, ChevronDown, Search, MessageCircle
} from 'lucide-react';
import { COURSE_GROUPS } from '../../constants.js';

const TutorsPanel = ({
    settings,
    updateSettings,
    schools,
    theme
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [expandedId, setExpandedId] = React.useState(null);

    const isDark = theme === 'dark';

    const addTutor = () => {
        setSearchTerm('');
        const newTutor = {
            id: Date.now(),
            name: '',
            phone: '',
            email: '',
            schoolId: '',
            courseName: '',
            groupName: ''
        };
        updateSettings({ tutors: [...(settings.tutors || []), newTutor] });
        setExpandedId(newTutor.id);
    };

    const updateTutor = (id, updates) => {
        const updated = (settings.tutors || []).map(t => t.id === id ? { ...t, ...updates } : t);
        updateSettings({ tutors: updated });
    };

    const removeTutors = (idsToBg) => {
        const remaining = (settings.tutors || []).filter(t => !idsToBg.includes(t.id));
        updateSettings({ tutors: remaining });
        setSelectedIds([]);
        if (idsToBg.includes(expandedId)) setExpandedId(null);
    };

    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filtered = (settings.tutors || []).filter(t => {
        if (!searchTerm) return true;
        const schoolName = schools.find(s => s.id === t.schoolId)?.name || 'Todos';
        const match = `${t.name} ${schoolName} ${t.courseName} ${t.groupName}`.toLowerCase();
        return match.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="card p-8 space-y-8 relative overflow-hidden">
            {/* Título y Botón */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <UserCircle size={28} className="text-orange-500" />
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Gestión de Tutores</h3>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Datos de contacto por clase y grupo</p>
                    </div>
                </div>
                <button
                    onClick={addTutor}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-orange-900/20 uppercase text-xs active:scale-95 shrink-0"
                >
                    <Plus size={18} /> Añadir Tutor
                </button>
            </div>

            {/* Buscador y Multi-borrado */}
            <div className={`flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-[2rem] border ${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50 border-slate-200'}`}>
                <div className="relative flex-1 group w-full">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-orange-500' : 'text-slate-400 group-focus-within:text-orange-600'}`} size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, centro o curso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none transition-all ${isDark ? 'bg-slate-950/50 border-slate-800 text-slate-300 focus:border-orange-500/50 placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-700 focus:border-orange-600/50 placeholder:text-slate-400'}`}
                    />
                </div>
                {selectedIds.length > 0 && (
                    <button
                        onClick={() => removeTutors(selectedIds)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Trash2 size={14} /> Eliminar Seleccionados ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(t => {
                    const isExpanded = expandedId === t.id;
                    const schoolName = schools.find(s => s.id === t.schoolId)?.name || 'SIN ASIGNAR';

                    return (
                        <div
                            key={t.id}
                            className={`flex flex-col p-5 rounded-[24px] border transition-all cursor-pointer 
                                ${isExpanded
                                    ? (isDark ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-orange-50 border-orange-200 shadow-md transform -translate-y-1')
                                    : (isDark ? 'bg-primary/5 border-primary/5 hover:border-primary/20' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm')}`}
                            onClick={() => setExpandedId(isExpanded ? null : t.id)}
                        >
                            {/* Cabecera / Resumen */}
                            <div className="flex justify-between items-start w-full">
                                <div className="flex gap-3 items-start flex-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(t.id)}
                                        onChange={(e) => toggleSelect(t.id, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-5 h-5 mt-1 rounded-lg text-orange-500 focus:ring-orange-500/20 focus:ring-offset-0 transition-all cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}
                                    />
                                    <div className="flex-1">
                                        <span className={`text-sm font-black uppercase tracking-wider block transition-colors ${isExpanded ? 'text-orange-500' : (isDark ? 'text-primary' : 'text-slate-800')}`}>
                                            {t.name || 'NUEVO TUTOR'}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? 'opacity-40' : 'text-slate-400'}`}>
                                                <Phone size={10} /> {t.phone || 'S/N'}
                                            </p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'opacity-40' : 'text-slate-400'}`}>
                                                {schoolName} • {t.courseName || 'CURSO'} {t.groupName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {t.phone && (
                                        <a
                                            href={`https://wa.me/34${t.phone.replace(/\s+/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-9 h-9 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                            title="Enviar WhatsApp"
                                        >
                                            <MessageCircle size={16} />
                                        </a>
                                    )}
                                    {t.email && (
                                        <a
                                            href={`mailto:${t.email}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                            title="Enviar Email"
                                        >
                                            <Mail size={16} />
                                        </a>
                                    )}
                                    {!isExpanded && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeTutors([t.id]); }}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isDark ? 'text-secondary hover:text-red-500 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Desplegable de Edición */}
                            {isExpanded && (
                                <div className={`mt-6 pt-6 border-t space-y-4 animate-fade-in ${isDark ? 'border-orange-500/10' : 'border-orange-100'}`} onClick={(e) => e.stopPropagation()}>
                                    <div>
                                        <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={t.name}
                                            onChange={e => updateTutor(t.id, { name: e.target.value })}
                                            placeholder="Nombre"
                                            className={`w-full border rounded-xl p-2.5 text-[11px] font-bold outline-none focus:border-orange-500/50 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-900'}`}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 flex items-center gap-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}><Phone size={10} /> Teléfono</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="tel"
                                                    value={t.phone}
                                                    onChange={e => updateTutor(t.id, { phone: e.target.value })}
                                                    placeholder="6XX XXX XXX"
                                                    className={`flex-1 border rounded-xl p-2.5 text-[11px] font-bold outline-none focus:border-orange-500/50 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-900'}`}
                                                />
                                                {t.phone && (
                                                    <a
                                                        href={`https://wa.me/34${t.phone.replace(/\s+/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 flex items-center justify-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all shrink-0"
                                                        title="WhatsApp Directo"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 flex items-center gap-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}><Mail size={10} /> Email</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={t.email}
                                                    onChange={e => updateTutor(t.id, { email: e.target.value })}
                                                    placeholder="email@ejemplo.com"
                                                    className={`flex-1 border rounded-xl p-2.5 text-[11px] font-bold outline-none focus:border-orange-500/50 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-900'}`}
                                                />
                                                {t.email && (
                                                    <a
                                                        href={`mailto:${t.email}`}
                                                        className="w-10 h-10 flex items-center justify-center bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all shrink-0"
                                                        title="Email Directo"
                                                    >
                                                        <Mail size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Centro Educativo</label>
                                        <div className="relative">
                                            <select
                                                value={t.schoolId}
                                                onChange={e => updateTutor(t.id, { schoolId: e.target.value, courseName: '', groupName: '' })}
                                                className={`w-full border rounded-xl p-2.5 text-[10px] font-bold appearance-none outline-none focus:border-orange-500/50 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}
                                            >
                                                <option value="">TODOS</option>
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Curso</label>
                                            <div className="relative">
                                                <select
                                                    value={t.courseName}
                                                    onChange={e => updateTutor(t.id, { courseName: e.target.value, groupName: '' })}
                                                    className={`w-full border rounded-xl p-2.5 text-[10px] font-bold appearance-none outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}
                                                >
                                                    <option value="">CURSO</option>
                                                    {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`text-[9px] font-bold uppercase block mb-1.5 ml-1 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Grupo</label>
                                            <div className="relative">
                                                <select
                                                    value={t.groupName}
                                                    onChange={e => updateTutor(t.id, { groupName: e.target.value })}
                                                    className={`w-full border rounded-xl p-2.5 text-[10px) font-bold appearance-none outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}
                                                >
                                                    <option value="">GRUPO</option>
                                                    {(COURSE_GROUPS.flatMap(g => g.courses).find(c => c.name === t.courseName)?.lines || []).map(l => (
                                                        <option key={l} value={l}>{l}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setExpandedId(null)}
                                            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                                        >LISTO</button>
                                        <button
                                            onClick={() => removeTutors([t.id])}
                                            className={`w-12 flex items-center justify-center rounded-xl transition-all border ${isDark ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-white text-red-500 border-red-100 hover:bg-red-50'}`}
                                            title="Eliminar Tutor"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className={`col-span-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 ${isDark ? 'border-slate-800/50 bg-slate-900/10' : 'border-slate-200 bg-slate-50'}`}>
                        <UserCircle size={32} className="mb-4 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">
                            {searchTerm ? 'No se encontraron tutores para esta búsqueda' : 'No hay tutores registrados'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorsPanel;
