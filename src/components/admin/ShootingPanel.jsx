import React, { useState, useEffect, useRef } from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users, Hash, ArrowRight, ArrowLeft,
    Sparkles, XCircle, RotateCcw, Tv, Camera, CheckCircle2, Zap,
    ChevronRight, AlertCircle, CreditCard, ChevronDown, ChevronUp, Mail, FileText
} from 'lucide-react';
import { COURSE_GROUPS, PACKS } from '../../constants.js';
import { toTitleCase, getCourseBase, getGroup } from '../../utils/formatters.js';

const ShootingPanel = ({
    orders,
    staff,
    shootFilters,
    setShootFilters,
    shootSearch,
    setShootSearch,
    shootMode,
    setShootMode,
    adminSchool,
    setAdminSchool,
    selectedOrderIds,
    setSelectedOrderIds,
    selectedStaffIds,
    setSelectedStaffIds,
    newStudentForm,
    setNewStudentForm,
    newStaffForm,
    setNewStaffForm,
    setOrderToEdit,
    setStaffAssigning,
    addOrder,
    deleteOrder,
    updateStatus,
    addStaff,
    deleteStaff,
    downloadMasterBackup,
    getSchoolName,
    sortedSchools,
    schools
}) => {
    const [activeStudent, setActiveStudent] = useState(null);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [photoNumber, setPhotoNumber] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Activar/Desactivar a un niño y poner el foco en el input
    const selectStudent = (student) => {
        if (!student) return;
        if (activeStudent?.id === student.id) {
            setActiveStudent(null);
            setIsFocused(false);
            return;
        }
        setActiveStudent(student);
        setPhotoNumber("");
        setIsFocused(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    // Lógica para dividir nombre y apellidos
    const getStudentNameParts = (fullName) => {
        if (!fullName) return { first: '', rest: '' };
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return { first: parts[0], rest: '' };
        return { first: parts[0], rest: parts.slice(1).join(' ') };
    };

    // Tipografía inteligente
    const getFontSize = (text) => {
        if (!text) return 'text-6xl';
        const len = text.length;
        if (len > 25) return 'text-4xl md:text-5xl';
        if (len > 15) return 'text-5xl md:text-6xl';
        return 'text-6xl md:text-8xl';
    };

    // Validar captura, guardar el número de foto y avanzar
    const validateAndNext = (e) => {
        if (e) e.preventDefault();
        if (!activeStudent || !photoNumber) return;

        updateStatus(activeStudent.id, activeStudent.status || 'Pendiente', photoNumber);

        if (autoAdvance) {
            const currentIndex = visibleOrders.findIndex(s => s.id === activeStudent.id);
            const nextPending = visibleOrders.slice(currentIndex + 1).find(s => !s.photoFile);
            if (nextPending) selectStudent(nextPending);
            else {
                setActiveStudent(null);
                setIsFocused(false);
            }
        } else {
            setActiveStudent(null);
            setIsFocused(false);
        }
    };

    // Lógica de filtrado de alumnos
    let shootOrders = [...(orders || [])];
    if (shootFilters.course) shootOrders = shootOrders.filter(o => getCourseBase(o.course) === shootFilters.course);
    if (shootFilters.group) shootOrders = shootOrders.filter(o => getGroup(o.course) === shootFilters.group);
    if (shootFilters.status) shootOrders = shootOrders.filter(o => (o.status || 'Pendiente') === shootFilters.status);

    const q = (shootSearch || "").trim().toLowerCase();
    const visibleOrders = q
        ? shootOrders.filter(o => o.studentName?.toLowerCase().includes(q))
        : [...shootOrders].sort((a, b) => {
            const fa = (a.studentName || '').trim().split(/\s+/)[1] || '';
            const fb = (b.studentName || '').trim().split(/\s+/)[1] || '';
            return fa.localeCompare(fb, 'es', { sensitivity: 'base' });
        });

    const totalOrders = shootOrders.length;
    const doneOrders = shootOrders.filter(o => o.photoFile).length;
    const pctOrders = totalOrders > 0 ? Math.round((doneOrders / totalOrders) * 100) : 0;

    const availCourses = COURSE_GROUPS.flatMap(g => g.courses);
    const activeCourses = availCourses.filter(c => (orders || []).some(o => getCourseBase(o.course) === c.name));
    const selCourse = availCourses.find(c => c.name === shootFilters.course);
    const availGroups = selCourse?.lines || [];

    // Lógica para Personal Docente
    const getStaffAssignments = (m) => m.assignments && m.assignments.length > 0 ? m.assignments : (m.course ? [{ course: m.course, group: m.group }] : []);

    const sqStaff = (shootSearch || '').trim().toLowerCase();
    const filteredStaff = (staff || []).filter(m => {
        if (sqStaff && !m.name.toLowerCase().includes(sqStaff)) return false;

        if (shootFilters.course) {
            const asgs = getStaffAssignments(m);
            if (!asgs.length) return false;
            const matchesCourse = asgs.some(a => getCourseBase(a.course) === shootFilters.course);
            if (!matchesCourse) return false;

            if (shootFilters.group) {
                const matchesGroup = asgs.some(a => getCourseBase(a.course) === shootFilters.course && (!getGroup(a.course) || getGroup(a.course) === shootFilters.group));
                if (!matchesGroup) return false;
            }
        }
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Toolbar Principal - Oculto en modo foco para maximizar espacio */}
            {!isFocused && (
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    {/* Selector de Modo */}
                    <div className="flex gap-2 bg-primary/2 p-1.5 rounded-[22px] border border-primary/10 w-full lg:w-fit shadow-inner shrink-0">
                        <button onClick={() => setShootMode('students')} className={`flex-1 lg:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shootMode === 'students' ? 'bg-emerald-400 text-white shadow-lg' : 'text-secondary hover:text-primary opacity-60'} min-h-[44px]`}>
                            <span className="text-sm md:text-base">👧</span> Alumnos {orders.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[9px]">{orders.length}</span>}
                        </button>
                        <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`flex-1 lg:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shootMode === 'staff' ? 'bg-indigo-500 text-white shadow-lg' : 'text-secondary hover:text-primary opacity-60'} min-h-[44px]`}>
                            <span className="text-sm md:text-base">👨‍🏫</span> Equipo {staff.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[9px]">{staff.length}</span>}
                        </button>
                    </div>

                    {/* Info del Centro/Clase/Grupo (CENTRE) */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 mb-1">
                            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase italic opacity-80">
                                {getSchoolName(adminSchool) || 'Sin Centro'}
                            </span>
                        </div>
                        <p className="text-[11px] font-black text-emerald-400 tracking-widest uppercase italic">
                            {shootFilters.course || 'TODOS LOS CURSOS'} {shootFilters.group ? `· GRUPO ${shootFilters.group}` : ''}
                        </p>
                    </div>

                    {/* Botón Backup */}
                    <button onClick={downloadMasterBackup} className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500/20 transition-all active:scale-95 shadow-sm min-h-[44px] shrink-0">
                        <Database size={16} /> Backup SOS
                    </button>
                </div>
            )}

            {shootMode === 'students' && (
                <div className={`flex flex-col lg:flex-row gap-0 h-[calc(100vh-280px)] overflow-hidden animate-fade-in ${isFocused ? 'lg:gap-0' : 'lg:gap-4'}`}>
                    {/* COLUMNA IZQUIERDA: LISTADO (Ocultable en foco) */}
                    <aside className={`w-full lg:w-[380px] flex flex-col gap-4 overflow-hidden transition-all duration-500 ${isFocused ? 'lg:-ml-[400px] opacity-0 pointer-events-none' : 'ml-0 opacity-100'}`}>
                        {/* Filtros y Buscador Compactos */}
                        <div className="card p-4 space-y-4 shrink-0 overflow-hidden mr-4">
                            <div className="grid grid-cols-2 gap-2">
                                <select value={shootFilters.course} onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="bg-primary/5 border border-primary/10 text-[10px] font-black rounded-xl px-3 py-2.5 outline-none appearance-none">
                                    <option value="">CURSO</option>
                                    {activeCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                                <select value={shootFilters.group} onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))} className="bg-primary/5 border border-primary/10 text-[10px] font-black rounded-xl px-3 py-2.5 outline-none appearance-none">
                                    <option value="">GRUPO</option>
                                    {availGroups.map(g => <option key={g} value={g}>G. {g}</option>)}
                                </select>
                            </div>

                            <div className="relative">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary opacity-30" />
                                <input type="text" value={shootSearch} onChange={e => setShootSearch(e.target.value)} placeholder="BUSCAR ALUMNO..." className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black outline-none focus:border-emerald-400/50 transition-all" />
                            </div>

                            <div className="pt-4 border-t border-primary/5">
                                <p className="text-[10px] font-black text-primary/30 text-center uppercase italic">
                                    {visibleOrders.length} Alumnos en listado
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-4 pb-12 custom-scrollbar touch-pan-y">
                            {visibleOrders.map((order) => {
                                const isActive = activeStudent?.id === order.id;

                                return (
                                    <div key={order.id} className={`rounded-[24px] border transition-all overflow-hidden ${isActive ? 'bg-card border-amber-500 shadow-xl ring-2 ring-amber-500/20' : 'bg-card border-primary/5 opacity-70 hover:opacity-100'} relative`}>
                                        <button
                                            onClick={() => selectStudent(order)}
                                            className={`w-full p-4 flex flex-col items-center gap-1 text-center transition-all ${isActive ? 'py-6' : 'py-4'}`}
                                        >
                                            <p className={`text-sm font-black tracking-tight leading-tight text-primary uppercase italic`}>
                                                {order.studentName}
                                            </p>
                                            <p className="text-[9px] font-bold text-secondary opacity-40 uppercase tracking-widest">{order.course}</p>

                                            {/* Acordeón de edición directa cuando está activo */}
                                            {isActive && (
                                                <div className="w-full mt-4 pt-4 border-t border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" onClick={e => e.stopPropagation()}>
                                                    <div className="grid grid-cols-2 gap-2 text-left">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60 ml-1">Pack Seleccionado</label>
                                                            <select
                                                                value={typeof order.pack === 'object' ? order.pack.id : order.pack}
                                                                onChange={(e) => {
                                                                    const pack = PACKS.find(p => p.id === e.target.value) || { id: 'manual', label: e.target.value };
                                                                    updateStatus(order.id, order.status, order.photoFile, pack);
                                                                }}
                                                                className="w-full bg-primary/5 border border-primary/10 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none text-primary appearance-none cursor-pointer"
                                                            >
                                                                {PACKS.map(p => <option key={p.id} value={p.id} className="text-black">{p.label}</option>)}
                                                                <option value="manual" className="text-black">PENDIENTE</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60 ml-1">Estado de Pago</label>
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => updateStatus(order.id, e.target.value, order.photoFile)}
                                                                className="w-full bg-primary/5 border border-primary/10 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none text-primary appearance-none cursor-pointer"
                                                            >
                                                                <option value="Pagado" className="text-black">PAGADO</option>
                                                                <option value="Pendiente" className="text-black">PENDIENTE</option>
                                                                <option value="Impagado" className="text-black">IMPAGADO</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <div className="bg-primary/5 rounded-xl p-2 flex items-center justify-between">
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[8px] font-black uppercase text-secondary opacity-40 tracking-widest">Curso y Grupo</span>
                                                                <span className="text-[9px] font-black uppercase text-primary">{order.course}</span>
                                                            </div>
                                                            <div className="flex flex-col text-right">
                                                                <span className="text-[8px] font-black uppercase text-secondary opacity-40 tracking-widest">Foto Grabada</span>
                                                                <span className={`text-[11px] font-mono font-black italic ${order.photoFile ? 'text-emerald-400' : 'text-secondary/30'}`}>
                                                                    {order.photoFile ? `#${order.photoFile}` : '—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    {/* COLUMNA CENTRAL: ESTACIÓN DE DISPARO (Isla de Sesión) */}
                    <main className={`flex-1 flex flex-col items-center justify-start relative overflow-hidden transition-all duration-500 ${isFocused ? 'p-4 md:pt-2 md:px-12 md:pb-12 bg-[#0a0c10]' : 'card p-8 pt-1'}`}>

                        {/* Botón de volver en la esquina superior derecha */}
                        {isFocused && (
                            <button
                                onClick={() => setIsFocused(false)}
                                className="absolute top-10 right-10 p-4 bg-primary/5 hover:bg-primary/10 rounded-full border border-primary/10 text-secondary hover:text-primary transition-all active:scale-95 group z-50 flex items-center justify-center shadow-lg"
                                title="Volver a la lista"
                            >
                                <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        )}

                        {activeStudent ? (
                            <div className="w-full flex flex-col items-center justify-start max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

                                {/* CABECERA DE SESIÓN */}
                                <div className="text-center space-y-6 w-full">
                                    <div className="shoot-badge-active mb-4">
                                        <div className="shoot-badge-dot"></div>
                                        <span className="text-[11px] font-black tracking-[0.4em] uppercase italic" style={{ color: 'var(--accent-gold)' }}>Sesión Activa</span>
                                    </div>

                                    <div className="space-y-0 leading-none">
                                        {(() => {
                                            const { first, rest } = getStudentNameParts(activeStudent.studentName);
                                            return (
                                                <>
                                                    <h2 className={`${getFontSize(first)} font-black italic tracking-tighter text-primary uppercase`}>
                                                        {first}
                                                    </h2>
                                                    {rest && (
                                                        <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter text-primary/40 uppercase mt-[-5px]">
                                                            {rest}
                                                        </h3>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* ISLA DE BÚSQUEDA CON AUTOCOMPLETADO */}
                                    <div className="w-full max-w-md mx-auto group">
                                        <div className="relative flex items-center bg-white/5 border border-[rgba(255,193,7,0.15)] hover:border-[rgba(255,193,7,0.3)] focus-within:border-[var(--accent-gold)] rounded-2xl pl-14 pr-6 shadow-xl backdrop-blur-md transition-all" style={{ boxShadow: 'none' }}>
                                            <Search
                                                size={18}
                                                className="absolute left-5 opacity-40 group-focus-within:opacity-100 transition-all"
                                                style={{ color: 'var(--accent-gold)' }}
                                            />

                                            <div className="relative flex-1 flex items-center overflow-hidden">
                                                {/* Ghost Text (Sugerencia) */}
                                                {(() => {
                                                    const cleanSearch = (shootSearch || '').trim();
                                                    const bestMatch = cleanSearch && visibleOrders.length > 0 ? visibleOrders[0].studentName : '';
                                                    const showGhost = bestMatch && bestMatch.toLowerCase().startsWith(cleanSearch.toLowerCase());

                                                    return showGhost && (
                                                        <div className="absolute left-0 text-xs font-bold text-white/20 pointer-events-none uppercase italic whitespace-nowrap">
                                                            <span className="opacity-0">{shootSearch}</span>
                                                            {bestMatch.slice(shootSearch.length)}
                                                        </div>
                                                    );
                                                })()}

                                                <input
                                                    type="text"
                                                    value={shootSearch}
                                                    onChange={(e) => setShootSearch(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        const bestMatch = (shootSearch || '').trim() && visibleOrders.length > 0 ? visibleOrders[0] : null;
                                                        if (e.key === 'Enter' && bestMatch) {
                                                            e.preventDefault();
                                                            selectStudent(bestMatch);
                                                            setShootSearch('');
                                                        }
                                                    }}
                                                    placeholder={!shootSearch ? "BUSCAR POR NOMBRE O APELLIDOS..." : ""}
                                                    className="w-full bg-transparent py-4 text-xs font-bold text-white outline-none uppercase placeholder:text-white/20 italic"
                                                />
                                            </div>
                                        </div>

                                        {/* Resultados de Búsqueda Flotantes */}
                                        {(shootSearch || '').trim().length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1c20]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                    {visibleOrders.slice(0, 5).map((order) => (
                                                        <button
                                                            key={order.id}
                                                            onClick={() => {
                                                                selectStudent(order);
                                                                setShootSearch('');
                                                            }}
                                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-white/90 uppercase italic">{order.studentName}</span>
                                                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{order.course}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {order.photoFile && <CheckCircle2 size={12} className="text-emerald-400" />}
                                                                <ArrowLeft size={12} className="text-white/20 rotate-180" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {visibleOrders.length === 0 && (
                                                        <div className="p-4 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest italic">
                                                            No se encontraron alumnos
                                                        </div>
                                                    )}
                                                </div>
                                                {visibleOrders.length > 5 && (
                                                    <div className="bg-white/5 px-4 py-1.5 text-center text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                                                        Y {visibleOrders.length - 5} más...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ISLA DE ENTRADA — NÚMERO DE FOTO */}
                                <div className="w-full max-w-2xl shoot-card p-1 px-1 shadow-[0_40px_100px_rgba(0,0,0,0.7)] relative">
                                    <div className="p-10 md:p-14 space-y-10 border-[2px] border-[rgba(255,193,7,0.08)] rounded-[54px]">

                                        <div className="space-y-2">
                                            <p className="text-center text-[10px] font-black tracking-[0.4em] uppercase italic" style={{ color: 'var(--accent-gold)', opacity: 0.6 }}>Introduce nº de foto (cámara)</p>
                                            <form onSubmit={validateAndNext} className="relative group">
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={photoNumber}
                                                    onChange={(e) => setPhotoNumber(e.target.value)}
                                                    placeholder="000"
                                                    autoFocus
                                                    className="shoot-input w-full py-10 text-7xl md:text-9xl font-black text-center text-[#d1d5db] tracking-tighter placeholder:opacity-[0.05]"
                                                    required
                                                />
                                            </form>
                                        </div>

                                        <button
                                            onClick={validateAndNext}
                                            disabled={!photoNumber}
                                            className="btn-shoot-cta"
                                        >
                                            <CheckCircle2 size={28} />
                                            VALIDAR Y SIGUIENTE
                                        </button>
                                    </div>
                                </div>

                                {/* INFO DEL CONTEXTO (CENTRO/CURSO/GRUPO) EN LUGAR DE CANCELAR */}
                                <div className="flex flex-col items-center gap-1 opacity-40 animate-fade-in py-4">
                                    <div className="px-4 py-1.5 rounded-full border shadow-sm" style={{ background: 'rgba(255,193,7,0.08)', borderColor: 'rgba(255,193,7,0.2)' }}>
                                        <span className="text-[10px] font-black tracking-[0.2em] uppercase italic" style={{ color: 'var(--accent-gold)' }}>
                                            {getSchoolName(adminSchool) || 'Sin Centro'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-black text-white/50 tracking-widest uppercase italic">
                                        {shootFilters.course || 'TODOS LOS CURSOS'} {shootFilters.group ? `· GRUPO ${shootFilters.group}` : ''}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-start max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-20">
                                {/* CABECERA ALTA RÁPIDA / NOMBRE */}
                                <div className="text-center space-y-4 w-full pt-10">
                                    <div className="inline-flex items-center gap-2 bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/20 mb-2">
                                        <Zap size={14} className="text-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase italic">Inscripción rápida</span>
                                    </div>

                                    <div className="space-y-0 leading-none min-h-[140px] flex flex-col justify-center">
                                        {!newStudentForm.name ? (
                                            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-primary/5 uppercase animate-pulse">
                                                Siguiente Alumno
                                            </h2>
                                        ) : (
                                            (() => {
                                                const { first, rest } = getStudentNameParts(newStudentForm.name);
                                                return (
                                                    <>
                                                        <h2 className={`${getFontSize(first)} font-black italic tracking-tighter text-primary uppercase animate-in slide-in-from-bottom-4`}>
                                                            {first}
                                                        </h2>
                                                        {rest && (
                                                            <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter text-primary/40 uppercase mt-[-5px] animate-in slide-in-from-bottom-2">
                                                                {rest}
                                                            </h3>
                                                        )}
                                                    </>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>

                                {/* CUADRÍCULA DE ISLAS DE DATOS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4 italic">

                                    {/* Isla 1: Identificación y Búsqueda */}
                                    <div className="card p-8 bg-card/60 backdrop-blur-xl border-primary/5 space-y-6 flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-indigo-500/10 rounded-2xl">
                                                    <Search size={20} className="text-indigo-400 font-black" strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black tracking-widest text-indigo-400/60 uppercase">Identificación</p>
                                                    <h4 className="text-sm font-black text-primary uppercase">Nombre y Búsqueda</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={newStudentForm.name}
                                                    onChange={e => setNewStudentForm(p => ({ ...p, name: e.target.value }))}
                                                    placeholder="NOMBRE COMPLETO"
                                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-xs font-black text-primary outline-none focus:border-indigo-500/50 transition-all uppercase placeholder:opacity-30"
                                                />
                                            </div>

                                            {/* Sugerencia rápida si coincide con alguien de la lista */}
                                            {newStudentForm.name.trim().length > 2 && visibleOrders.length > 0 && (
                                                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl animate-in fade-in zoom-in-95">
                                                    <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-2">¿Ya existe en la lista?</p>
                                                    <button
                                                        onClick={() => {
                                                            selectStudent(visibleOrders[0]);
                                                            setNewStudentForm(p => ({ ...p, name: '' }));
                                                        }}
                                                        className="w-full flex items-center justify-between p-3 bg-card rounded-xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-all group"
                                                    >
                                                        <div className="text-left">
                                                            <p className="text-[11px] font-black text-emerald-400 uppercase italic leading-none">{visibleOrders[0].studentName}</p>
                                                            <p className="text-[8px] font-bold text-secondary opacity-40 uppercase tracking-widest mt-1">{visibleOrders[0].course}</p>
                                                        </div>
                                                        <CheckCircle2 size={18} className="text-emerald-400 animate-pulse" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-bold text-secondary opacity-30 uppercase mt-auto">Si el alumno ya existe, selecciónalo arriba o en la lista lateral</p>
                                    </div>

                                    {/* Isla 2: Contacto */}
                                    <div className="card p-8 bg-card/60 backdrop-blur-xl border-primary/5 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-sky-500/10 rounded-2xl">
                                                <Phone size={20} className="text-sky-400" strokeWidth={3} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black tracking-widest text-sky-400/60 uppercase">Contacto</p>
                                                <h4 className="text-sm font-black text-primary uppercase">Datos de aviso</h4>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-secondary/40 tracking-widest ml-1">Teléfono móvil</label>
                                                <div className="relative">
                                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-20" />
                                                    <input
                                                        type="tel"
                                                        value={newStudentForm.phone}
                                                        onChange={e => setNewStudentForm(p => ({ ...p, phone: e.target.value }))}
                                                        placeholder="600 000 000"
                                                        className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-5 py-3.5 text-xs font-black text-primary outline-none focus:border-sky-500/50 transition-all placeholder:opacity-20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-secondary/40 tracking-widest ml-1">Correo electrónico</label>
                                                <div className="relative">
                                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-20" />
                                                    <input
                                                        type="email"
                                                        value={newStudentForm.email}
                                                        onChange={e => setNewStudentForm(p => ({ ...p, email: e.target.value }))}
                                                        placeholder="nombre@email.com"
                                                        className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-5 py-3.5 text-xs font-black text-primary outline-none focus:border-sky-500/50 transition-all placeholder:opacity-20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Isla 3: Detalles del Pedido */}
                                    <div className="card p-8 bg-card/60 backdrop-blur-xl border-primary/5 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-violet-500/10 rounded-2xl">
                                                <CreditCard size={20} className="text-violet-400" strokeWidth={3} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black tracking-widest text-violet-400/60 uppercase">Configuración</p>
                                                <h4 className="text-sm font-black text-primary uppercase">Pack y Pago</h4>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-secondary/40 tracking-widest ml-1">Pack Elegido</label>
                                                <select
                                                    value={newStudentForm.packId}
                                                    onChange={e => setNewStudentForm(p => ({ ...p, packId: e.target.value }))}
                                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3.5 text-[10px] font-black text-primary outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="">SELECCIONAR PACK</option>
                                                    {PACKS.map(p => <option key={p.id} value={p.id} className="text-black">{(p.label || p.id || '').split('(')[0]}</option>)}
                                                    <option value="manual" className="text-black">SIN PACK (PENDIENTE)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase text-secondary/40 tracking-widest ml-1">MÉTODO PAGO</label>
                                                <select
                                                    value={newStudentForm.paymentMethod}
                                                    onChange={e => setNewStudentForm(p => ({ ...p, paymentMethod: e.target.value }))}
                                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3.5 text-[10px] font-black text-primary outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="">MÉTODO PAGO</option>
                                                    <option value="Efectivo" className="text-black">EFECTIVO</option>
                                                    <option value="Bizum" className="text-black">BIZUM</option>
                                                    <option value="Tarjeta" className="text-black">TARJETA</option>
                                                    <option value="Pendiente" className="text-black">PENDIENTE</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black uppercase text-secondary/40 tracking-widest ml-1">Notas especiales</label>
                                            <div className="relative">
                                                <FileText size={14} className="absolute left-4 top-4 text-primary opacity-20" />
                                                <textarea
                                                    value={newStudentForm.notes || ''}
                                                    onChange={e => setNewStudentForm(p => ({ ...p, notes: e.target.value }))}
                                                    placeholder="Indicaciones adicionales..."
                                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-5 py-4 text-[10px] font-black text-primary outline-none focus:border-violet-500/50 transition-all min-h-[100px] resize-none placeholder:opacity-20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Isla 4: Ubicación y Acción Final */}
                                    <div className="card p-8 bg-[#1ec08d]/5 border-[#1ec08d]/10 space-y-8 flex flex-col items-center justify-center">
                                        <div className="text-center space-y-2">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1ec08d]/10 rounded-full border border-[#1ec08d]/20">
                                                <span className="text-[10px] font-black text-[#1ec08d] tracking-[0.2em] uppercase italic opacity-80">
                                                    Confirmar Alta
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-black text-primary/40 tracking-widest uppercase italic">
                                                Se añadirá a: {shootFilters.course || '—'} {shootFilters.group ? `· G. ${shootFilters.group}` : ''}
                                            </p>
                                        </div>

                                        <button
                                            disabled={!newStudentForm.name.trim() || !shootFilters.course}
                                            onClick={() => {
                                                const sid = adminSchool;
                                                const pack = PACKS.find(p => p.id === newStudentForm.packId) || { id: 'manual', label: 'PENDIENTE' };
                                                const newOrder = {
                                                    studentName: toTitleCase(newStudentForm.name),
                                                    schoolId: sid,
                                                    schoolName: schools.find(s => s.id === sid)?.name || '',
                                                    course: shootFilters.course + (shootFilters.group ? ` ${shootFilters.group}` : ''),
                                                    phone: newStudentForm.phone,
                                                    email: newStudentForm.email,
                                                    notes: newStudentForm.notes,
                                                    pack: pack,
                                                    packQuantity: 1,
                                                    extras: [],
                                                    paymentMethod: newStudentForm.paymentMethod || 'Efectivo',
                                                    status: newStudentForm.paymentMethod && newStudentForm.paymentMethod !== 'Pendiente' ? 'Pagado' : 'Pendiente',
                                                    total: 0,
                                                    cost: 0,
                                                    id: `MANUAL_${Date.now()}`,
                                                    timestamp: Date.now()
                                                };
                                                addOrder(newOrder);
                                                setNewStudentForm({ schoolId: '', name: '', course: '', group: '', phone: '', email: '', packId: '', photoFile: '', status: 'Pendiente', paymentMethod: '' });
                                                // Opcional: Seleccionar automáticamente el nuevo alumno para empezar sesión
                                                selectStudent(newOrder);
                                            }}
                                            className="w-full py-10 bg-[#1ec08d] text-white font-black text-2xl tracking-[0.3em] rounded-[32px] shadow-2xl shadow-emerald-500/20 hover:bg-[#19a87d] disabled:opacity-20 transition-all active:scale-95 flex flex-col items-center gap-2 group"
                                        >
                                            <Zap size={32} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                            ALTA Y EMPEZAR
                                        </button>

                                        {!shootFilters.course && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-amber-500/60 uppercase italic animate-bounce">
                                                <AlertCircle size={14} /> Selecciona curso en el menú superior
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Indicador inferior SHOOTING */}
                        {activeStudent && (
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-rose-500/30">
                                <Zap size={14} fill="currentColor" />
                                <span className="text-[10px] font-black tracking-[0.4em] uppercase italic">Shooting</span>
                            </div>
                        )}
                    </main>

                    {/* VENTANA EMERGENTE DE DETALLES (MINI-MODAL) */}
                    {showDetails && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetails(null)}></div>
                            <div className="bg-card w-full max-w-sm rounded-[32px] border border-primary/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xl">
                                                {showDetails.photoFile ? '✅' : '👤'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-primary leading-tight">{showDetails.studentName}</h4>
                                                <p className="text-[10px] font-bold text-secondary opacity-60 uppercase">{showDetails.course}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowDetails(null)} className="p-2 hover:bg-primary/5 rounded-full transition-colors">
                                            <XCircle size={20} className="text-secondary opacity-40" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-primary/5 p-4 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
                                                <span className="opacity-40">Pedido Actual</span>
                                                <span className="text-indigo-500">{(typeof showDetails.pack === 'object' ? showDetails.pack.label : showDetails.pack) || 'SIN PACK'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
                                                <span className="opacity-40">Estado Pago</span>
                                                <span className={showDetails.status === 'Pagado' ? 'text-emerald-500' : 'text-amber-500'}>{showDetails.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
                                                <span className="opacity-40">Centro</span>
                                                <span className="text-primary truncate ml-4">{showDetails.schoolName}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                selectStudent(showDetails);
                                                setShowDetails(null);
                                            }}
                                            className="w-full py-4 bg-emerald-400 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
                                        >
                                            Iniciar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {shootMode === 'staff' && (
                <>
                    <div className="card p-4 flex items-center gap-3 flex-wrap">
                        <div className="flex-1">
                            {staff.length > 0 && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="relative flex-1">
                                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                                            <input type="text" lang="es" value={shootSearch} onChange={e => { setShootSearch(e.target.value); setSelectedStaffIds([]); }}
                                                placeholder="Buscar por nombre..."
                                                className="w-full bg-primary/5 border border-indigo-400/20 focus:border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder-primary/30 outline-none transition-colors" />
                                        </div>
                                        <button onClick={() => {
                                            const sq = (shootSearch || '').trim().toLowerCase();
                                            const filtered = sq ? staff.filter(m => m.name.toLowerCase().includes(sq)) : staff;
                                            if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                            else setSelectedStaffIds(filtered.map(m => m.id));
                                        }} className="px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                            {selectedStaffIds.length > 0 && selectedStaffIds.length === ((shootSearch || '').trim() ? staff.filter(m => m.name.toLowerCase().includes((shootSearch || '').trim().toLowerCase())).length : staff.length) ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />}
                                            <span className="hidden sm:inline">Todos</span>
                                        </button>
                                    </div>

                                    {selectedStaffIds.length > 0 && (
                                        <div className="flex items-center justify-between bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 animate-fade-in">
                                            <p className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                                <Trash2 size={14} /> {selectedStaffIds.length} seleccionados
                                            </p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setSelectedStaffIds([])} className="px-3 py-1.5 text-[10px] font-black uppercase text-secondary hover:text-primary">Cancelar</button>
                                                <button onClick={() => {
                                                    if (confirm(`¿Estás seguro de que quieres borrar ${selectedStaffIds.length} miembros del equipo? Esta acción no se puede deshacer.`)) {
                                                        selectedStaffIds.forEach(id => deleteStaff(id));
                                                        setSelectedStaffIds([]);
                                                    }
                                                }} className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg shadow-sm shadow-indigo-500/20 active:scale-95 transition-all">Borrar selección</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card p-4 bg-indigo-500/5 border-indigo-500/10 mb-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-3 bg-indigo-500 rounded-full"></div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Alta rápida de personal</p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                                <label className="text-[8px] font-black text-secondary uppercase mb-1 ml-1 block opacity-60">Centro</label>
                                <select value={newStaffForm.schoolId || adminSchool} onChange={e => {
                                    const sid = e.target.value;
                                    setNewStaffForm(p => ({ ...p, schoolId: sid }));
                                    setAdminSchool(sid);
                                }} className="w-full bg-primary/5 border border-primary/10 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-primary cursor-pointer">
                                    <option value="">— Seleccionar Centro —</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            {/* Fila 1: Nombre y Foto */}
                            <div className="grid grid-cols-[1fr,120px] gap-3">
                                <div>
                                    <label className="text-[8px] font-black text-secondary uppercase mb-1 ml-1 block opacity-60">Nombre completo</label>
                                    <input type="text" value={newStaffForm.name}
                                        onChange={e => {
                                            const val = e.target.value.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                                            setNewStaffForm(p => ({ ...p, name: val }));
                                        }}
                                        placeholder="Ej: Maria García"
                                        className="w-full bg-primary/5 border border-primary/10 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-primary" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-secondary uppercase mb-1 ml-1 block opacity-60">Foto (opc.)</label>
                                    <input type="text" value={newStaffForm.photoFile} onChange={e => setNewStaffForm(p => ({ ...p, photoFile: e.target.value }))}
                                        placeholder="DSC_001"
                                        className="w-full bg-primary/5 border border-primary/10 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-all font-mono text-primary" />
                                </div>
                            </div>

                            {/* Fila 2: Puestos y Clases en 2 columnas */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Puestos y Cargos */}
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                                    <label className="text-[8px] font-black text-secondary uppercase mb-2 block opacity-60">Puestos / Cargos</label>

                                    <div className="flex gap-1.5 mb-2 h-7 overflow-x-auto scrollbar-hide">
                                        {newStaffForm.roles.length === 0 ? (
                                            <span className="text-[8px] text-secondary opacity-40 italic self-center">Ninguno añadido...</span>
                                        ) : (
                                            newStaffForm.roles.map((r, i) => (
                                                <span key={i} className="text-[8px] bg-violet-500/10 text-violet-500 font-black px-2 py-1 rounded-md flex items-center gap-1 border border-violet-500/20 whitespace-nowrap">
                                                    {r}
                                                    <button onClick={() => setNewStaffForm(p => ({ ...p, roles: p.roles.filter((_, idx) => idx !== i) }))} className="text-red-400 hover:text-red-500">✕</button>
                                                </span>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex gap-1.5">
                                        <input type="text" list="roles-list-new" value={newStaffForm.tempRole}
                                            onChange={e => setNewStaffForm(p => ({ ...p, tempRole: e.target.value }))}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && newStaffForm.tempRole.trim()) {
                                                    e.preventDefault();
                                                    if (!newStaffForm.roles.includes(newStaffForm.tempRole.trim())) {
                                                        setNewStaffForm(p => ({ ...p, roles: [...p.roles, p.tempRole.trim()], tempRole: '' }));
                                                    }
                                                }
                                            }}
                                            placeholder="Añadir..." className="flex-1 bg-primary/5 border border-primary/10 text-[10px] rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 text-primary" />
                                        <button type="button" onClick={() => {
                                            if (newStaffForm.tempRole.trim() && !newStaffForm.roles.includes(newStaffForm.tempRole.trim())) {
                                                setNewStaffForm(p => ({ ...p, roles: [...p.roles, p.tempRole.trim()], tempRole: '' }));
                                            }
                                        }} className="bg-violet-500 text-white w-7 h-7 rounded-lg flex items-center justify-center font-black shadow-sm">+</button>
                                    </div>
                                </div>

                                {/* Asignación de Clases */}
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                                    <label className="text-[8px] font-black text-secondary uppercase mb-2 block opacity-60">Asignar Clases</label>

                                    <div className="flex gap-1.5 mb-2 h-7 overflow-x-auto scrollbar-hide">
                                        {newStaffForm.assignments.length === 0 ? (
                                            <span className="text-[8px] text-secondary opacity-40 italic self-center">Ninguna...</span>
                                        ) : (
                                            newStaffForm.assignments.map((a, i) => (
                                                <span key={i} className="text-[8px] bg-indigo-500/10 text-indigo-500 font-black px-2 py-1 rounded-md flex items-center gap-1 border border-indigo-500/20 whitespace-nowrap">
                                                    {a.course} {a.group}
                                                    <button onClick={() => setNewStaffForm(p => ({ ...p, assignments: p.assignments.filter((_, idx) => idx !== i) }))} className="text-red-400 hover:text-red-500">✕</button>
                                                </span>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex gap-1">
                                        <select value={newStaffForm.tempCourse} onChange={e => setNewStaffForm(p => ({ ...p, tempCourse: e.target.value }))} className="flex-1 bg-primary/5 border border-primary/10 text-[9px] font-bold rounded-lg px-1.5 py-1.5 outline-none">
                                            <option value="">CLASE</option>
                                            {availCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <select value={newStaffForm.tempGroup} onChange={e => setNewStaffForm(p => ({ ...p, tempGroup: e.target.value }))} className="w-20 bg-primary/5 border border-primary/10 text-[9px] font-bold rounded-lg px-1 py-1.5 outline-none">
                                            <option value="">GRP</option>
                                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                        </select>
                                        <button type="button" disabled={!newStaffForm.tempCourse} onClick={() => setNewStaffForm(p => ({ ...p, assignments: [...p.assignments, { course: p.tempCourse, group: p.tempGroup }], tempCourse: '', tempGroup: '' }))} className="bg-indigo-500 text-white w-7 h-7 rounded-lg flex items-center justify-center font-black shadow-sm disabled:opacity-30">+</button>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Guardar */}
                            <button
                                disabled={!newStaffForm.name.trim() || (newStaffForm.roles.length === 0 && !newStaffForm.tempRole.trim()) || (newStaffForm.assignments.length === 0 && !newStaffForm.tempCourse)}
                                onClick={() => {
                                    const finalRoles = newStaffForm.tempRole.trim() && !newStaffForm.roles.includes(newStaffForm.tempRole.trim())
                                        ? [...newStaffForm.roles, newStaffForm.tempRole.trim()]
                                        : newStaffForm.roles;
                                    const finalAssignments = newStaffForm.tempCourse
                                        ? [...newStaffForm.assignments, { course: newStaffForm.tempCourse, group: newStaffForm.tempGroup }]
                                        : newStaffForm.assignments;

                                    addStaff({
                                        name: newStaffForm.name,
                                        role: finalRoles.join(' • '),
                                        roles: finalRoles,
                                        assignments: finalAssignments,
                                        photoFile: newStaffForm.photoFile,
                                        schoolId: newStaffForm.schoolId || adminSchool
                                    });
                                    setNewStaffForm({ schoolId: '', name: '', role: '', roles: [], tempRole: '', photoFile: '', tempCourse: '', tempGroup: '', assignments: [] });
                                }}
                                className="w-full bg-red-700 text-white font-black text-[10px] rounded-xl py-2.5 hover:bg-red-800 transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-red-700/20 uppercase tracking-widest">
                                GUARDAR FICHA PERSONAL
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 p-1 max-h-[55vh] overflow-y-auto custom-scrollbar">
                        {filteredStaff.length === 0
                            ? <div className="py-16 text-center text-secondary font-semibold opacity-50">{staff.length === 0 ? 'Sin personal registrado' : 'Sin resultados'}</div>
                            : [...filteredStaff].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })).map(member => {
                                const isExpanded = expandedId === member.id;
                                return (
                                    <div key={member.id} className="rounded-[24px] border border-primary/5 bg-card overflow-hidden">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                                }}
                                                className="pl-4 py-4"
                                            >
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedStaffIds.includes(member.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-primary/20 bg-primary/5 text-transparent'}`}>
                                                    <CheckCircle size={12} strokeWidth={3} />
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : member.id)}
                                                className="flex-1 p-4 flex items-center justify-between group"
                                            >
                                                <div className="flex flex-col items-center gap-1 text-center w-full py-2">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-1 ${member.photoFile ? 'bg-emerald-400/10 text-emerald-400' : 'bg-primary/5 text-secondary'}`}>
                                                        {member.photoFile ? '✅' : '👤'}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-black text-primary leading-tight">{member.name}</p>
                                                        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">{member.role}</p>
                                                    </div>
                                                </div>
                                                {isExpanded ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="p-3 rounded-xl bg-primary/5 space-y-2 mb-3">
                                                    <div className="flex justify-between items-center text-[9px]">
                                                        <span className="font-black uppercase opacity-40">Clases</span>
                                                        <span className="font-bold text-secondary">{getStaffAssignments(member).map(a => `${a.course}${a.group ? ' ' + a.group : ''}`).join(', ') || 'Sin clases'}</span>
                                                    </div>
                                                    {member.photoFile && (
                                                        <div className="flex justify-between items-center text-[9px]">
                                                            <span className="font-black uppercase opacity-40">Nº Foto</span>
                                                            <span className="font-mono text-emerald-400">#{member.photoFile}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button onClick={() => {
                                                    const initialRoles = member.roles || (member.role ? member.role.split(' • ') : []);
                                                    setStaffAssigning({
                                                        member,
                                                        name: member.name,
                                                        roles: initialRoles,
                                                        tempRole: '',
                                                        assignments: getStaffAssignments(member),
                                                        tempCourse: '',
                                                        tempGroup: '',
                                                        tempFile: member.photoFile || '',
                                                        schoolId: member.schoolId || adminSchool || ''
                                                    });
                                                }} className="w-full py-2.5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                                                    <Users size={14} /> Editar Ficha Docente
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(ShootingPanel);
