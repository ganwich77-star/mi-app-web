import React, { useState } from 'react';
import {
    UserCircle, Plus, Trash2, Mail, Phone, ChevronDown, Search, MessageCircle, LayoutGrid, List, Users
} from 'lucide-react';
import { COURSE_GROUPS } from '../../constants.js';



const TutorsPanel = ({
    settings,
    updateSettings,
    schools,
    theme = 'dark'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    const isDark = theme === 'dark';

    const addTutor = (e) => {
        e.stopPropagation();
        if (!isOpen) setIsOpen(true);
        setSearchTerm('');
        const newTutor = {
            id: Date.now(),
            name: '',
            phone: '',
            email: '',
            schoolId: '',
            courseName: '',
            groupName: '',
            newsletter: true
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
    
    const sendStaffRequest = (t) => {
        if (!t.phone) return;
        
        const schoolName = schools.find(s => s.id === t.schoolId)?.name || 'su centro';
        const photographerId = settings?.id || 'pujaltecreativestudio';
        
        // Obtener solo el primer nombre del tutor
        const firstName = (t.name || 'Tutor/a').split(' ')[0].toUpperCase();
        
        // URL base para el formulario
        const baseUrl = window.location.origin + window.location.pathname;
        const formUrl = `${baseUrl}?view=staff-form&f=${photographerId}&s=${t.schoolId}&c=${encodeURIComponent(t.courseName || '')}&g=${encodeURIComponent(t.groupName || '')}&t=${encodeURIComponent(t.name || '')}`;

        const msg = `¡Hola ${firstName}! 👋\n\n` +
            `Estamos preparando el diseño de las orlas y necesitamos que nos confirméis el listado del *EQUIPO DOCENTE* del centro *${schoolName.toUpperCase()}* (${t.courseName || ''} ${t.groupName || ''}).\n\n` +
            `He preparado un formulario muy rápido para que podáis completarlo en 1 minuto desde el móvil:\n\n` +
            `📎 *RELLENAR AQUÍ:* ${formUrl}\n\n` +
            `¡Muchas gracias por tu colaboración! 🙏`;

        const cleanPhone = t.phone.replace(/\s+/g, '').replace('+', '');
        window.open(`https://wa.me/34${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
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
                        <UserCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Gestión de Tutores</h3>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Datos de contacto por clase y grupo</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Botones de acción: solo aparecen si está abierto */}
                    <div className={`flex items-center gap-3 transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none translate-x-4'}`}>
                        <a
                            href="mailto:?subject=Gestión de Tutores - Orlas 2026"
                            className="bg-primary/5 hover:bg-orange-500/10 text-orange-500 w-11 h-11 rounded-xl flex items-center justify-center transition-all border border-orange-500/20 shadow-lg"
                            title="Email rápido"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Mail size={20} />
                        </a>
                        <button
                            onClick={addTutor}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 uppercase text-[10px] active:scale-95 shrink-0"
                        >
                            <Plus size={16} /> NUEVO TUTOR
                        </button>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-orange-500/20 text-orange-500 rotate-180' : 'bg-primary/5 text-secondary'}`}>
                        <ChevronDown size={24} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100 p-8 pt-4' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
                {/* Buscador y Multi-borrado */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="BUSCAR TUTOR POR NOMBRE, CENTRO O CURSO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-dark w-full pl-14 py-4.5 text-[11px] font-black tracking-widest uppercase rounded-2xl"
                        />
                    </div>

                    <div className="flex gap-4 items-center shrink-0">
                        <div className="flex bg-primary/5 rounded-xl p-1 gap-1 h-[52px]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-12 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-xl text-orange-600' : 'text-secondary/40 hover:text-orange-500'}`}
                                title="Vista Cuadrícula"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-12 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-xl text-orange-600' : 'text-secondary/40 hover:text-orange-500'}`}
                                title="Vista Lista"
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => removeTutors(selectedIds)}
                                className="flex items-center gap-3 px-8 py-4.5 bg-rose-500/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95 whitespace-nowrap border border-rose-500/20"
                            >
                                <Trash2 size={16} /> ELIMINAR ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    {filtered.map(t => {
                        const isExpanded = expandedId === t.id;
                        const schoolName = schools.find(s => s.id === t.schoolId)?.name || 'SIN ASIGNAR';

                        return (
                            <div
                                key={t.id}
                                className={`group relative flex flex-col border transition-all duration-500 cursor-pointer
                                    ${viewMode === 'list' ? 'p-3 px-5 rounded-2xl bg-primary/2' : 'p-6 rounded-[2rem] bg-primary/2'}
                                    ${isExpanded
                                        ? 'border-orange-500/40 shadow-xl shadow-orange-500/5 !bg-orange-500/10'
                                        : 'border-primary/5 hover:border-orange-500/30 hover:bg-orange-500/5 hover:-translate-y-1'}`}
                                onClick={() => setExpandedId(isExpanded ? null : t.id)}
                            >
                                {/* Cabecera / Resumen */}
                                <div className="flex justify-between items-start w-full gap-4">
                                    <div className="flex gap-4 items-start flex-1 min-w-0">
                                        <div className="pt-1">
                                            <div
                                                onClick={(e) => toggleSelect(t.id, e)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(t.id) ? 'bg-orange-600 border-orange-600 text-white' : 'border-primary/10 bg-primary/5 hover:border-orange-500/50'}`}
                                            >
                                                {selectedIds.includes(t.id) && <Plus size={14} className="rotate-45" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`${viewMode === 'list' ? 'text-[11px]' : 'text-sm'} font-black uppercase tracking-tight block truncate transition-colors ${isExpanded ? 'text-orange-500' : 'text-primary'}`}>
                                                    {t.name || 'NUEVO TUTOR'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 opacity-60">
                                                <p className={`${viewMode === 'list' ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0`}>
                                                    <Phone size={viewMode === 'list' ? 10 : 11} className="text-orange-500" /> {t.phone || 'SIN TEL'}
                                                </p>
                                                <p className={`${viewMode === 'list' ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-[0.1em] truncate`}>
                                                    {schoolName}
                                                </p>
                                            </div>
                                            {!isExpanded && (
                                                <div className="mt-2 text-[8px] font-black text-orange-500/60 uppercase tracking-widest flex gap-2">
                                                    <span>{t.courseName || 'CURSO'} {t.groupName}</span>
                                                    {t.newsletter && <span className="text-emerald-500/60 flex items-center gap-1"><Mail size={8} /> NEWSLETTER ACTIVADO</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0 bg-primary/5 p-1 rounded-xl">
                                        <a
                                            href={`mailto:${t.email || ''}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${t.email ? 'text-orange-500 hover:bg-orange-500/20' : 'text-orange-500/30'}`}
                                            title={t.email ? `Enviar email a ${t.email}` : "Sin email configurado"}
                                        >
                                            <Mail size={16} />
                                        </a>
                                        {t.phone && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); sendStaffRequest(t); }}
                                                    className="w-9 h-9 flex items-center justify-center text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition-all"
                                                    title="Pedir Listado Docentes (WhatsApp)"
                                                >
                                                    <Users size={16} />
                                                </button>
                                                <a
                                                    href={`https://wa.me/34${t.phone.replace(/\s+/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-9 h-9 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all"
                                                    title="WhatsApp Directo"
                                                >
                                                    <MessageCircle size={16} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Desplegable de Edición */}
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 mt-6 pt-6 border-t border-orange-500/10' : 'max-h-0 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2 ml-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={t.name}
                                                onChange={e => updateTutor(t.id, { name: e.target.value })}
                                                placeholder="NOMBRE"
                                                className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/20"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2 ml-1">Teléfono</label>
                                                <input
                                                    type="tel"
                                                    value={t.phone}
                                                    onChange={e => updateTutor(t.id, { phone: e.target.value })}
                                                    placeholder="6XX XXX XXX"
                                                    className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2 ml-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={t.email}
                                                    onChange={e => updateTutor(t.id, { email: e.target.value })}
                                                    placeholder="EMAIL"
                                                    className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/20"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2 ml-1">Centro Educativo</label>
                                            <div className="relative">
                                                <select
                                                    value={t.schoolId}
                                                    onChange={e => updateTutor(t.id, { schoolId: e.target.value, courseName: '', groupName: '' })}
                                                    className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/20 appearance-none"
                                                >
                                                    <option value="">SIN ASIGNAR</option>
                                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2 ml-1">Curso</label>
                                                <div className="relative">
                                                    <select
                                                        value={t.courseName}
                                                        onChange={e => updateTutor(t.id, { courseName: e.target.value, groupName: '' })}
                                                        className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/20 appearance-none"
                                                    >
                                                        <option value="">CURSO</option>
                                                        {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2 ml-1">Grupo</label>
                                                <div className="relative">
                                                    <select
                                                        value={t.groupName}
                                                        onChange={e => updateTutor(t.id, { groupName: e.target.value })}
                                                        className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/20 appearance-none"
                                                    >
                                                        <option value="">GRUPO</option>
                                                        {(COURSE_GROUPS.flatMap(g => g.courses).find(c => c.name === t.courseName)?.lines || []).map(l => (
                                                            <option key={l} value={l}>{l}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => updateTutor(t.id, { newsletter: !t.newsletter })}>
                                                <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${t.newsletter ? 'bg-emerald-500' : 'bg-primary/20'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${t.newsletter ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-emerald-500 transition-colors">Permiso Recibir Info Orlas</span>
                                                    <span className="text-[8px] font-bold uppercase text-secondary/50 pt-1">Mandar información puntual sobre orlas en próximos cursos. No mandaremos nada más.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setExpandedId(null)}
                                                className="flex-1 bg-orange-600 hover:bg-orange-50 text-orange-600 font-bold rounded-xl py-3 text-[10px] uppercase tracking-widest transition-all bg-orange-600/10 border border-orange-600/20"
                                            >
                                                CERRAR EDICIÓN
                                            </button>
                                            <button
                                                onClick={() => removeTutors([t.id])}
                                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
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
                        <UserCircle size={40} className="text-secondary/20 mb-6" />
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary/30">
                            {searchTerm ? `No se encontraron resultados` : "No hay tutores registrados"}
                        </span>
                    </div>
                )}
            </div>


        </div>
    );
};

export default TutorsPanel;
