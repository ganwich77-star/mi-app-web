import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users, Hash, ArrowRight, ArrowLeft,
    Sparkles, XCircle, RotateCcw, Tv, Camera, CheckCircle2, Zap,
    ChevronRight, AlertCircle, CreditCard, ChevronDown, ChevronUp, Mail, FileText
} from 'lucide-react';
import { COURSE_GROUPS, PACKS, EXTRAS } from '../../constants.js';
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
    const [modalSearch, setModalSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(true);
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
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Filtrado de pedidos
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        return orders.filter(order => {
            if (adminSchool && order.schoolId !== adminSchool) return false;

            // Filtro de búsqueda
            if (shootSearch) {
                const searchLower = shootSearch.toLowerCase();
                const matchesSearch =
                    order.studentName?.toLowerCase().includes(searchLower) ||
                    order.parentName?.toLowerCase().includes(searchLower) ||
                    order.phone?.includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Filtro de curso/grupo
            if (shootFilters.course && getCourseBase(order.course) !== shootFilters.course) return false;
            if (shootFilters.group && getGroup(order.course) !== shootFilters.group) return false;

            return true;
        });
    }, [orders, adminSchool, shootSearch, shootFilters]);

    // Grupos únicos para el curso seleccionado (usando constantes para ser proactivos)
    const availableGroups = shootFilters.course
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === shootFilters.course))
            ?.courses.find(c => c.name === shootFilters.course)?.lines || [])
        : [];

    // Cursos únicos de la escuela (mejorado para usar constantes si hay adminSchool)
    const activeCourses = useMemo(() => {
        if (!adminSchool || !orders) return [];
        const schoolCourses = new Set(orders.filter(o => o.schoolId === adminSchool).map(o => getCourseBase(o.course)));
        // Si no hay pedidos aún, podríamos mostrar todos los de las constantes, 
        // pero por ahora mantenemos los que tienen pedidos para no saturar.
        return [...schoolCourses].sort().map(name => ({ name }));
    }, [orders, adminSchool]);

    const getStaffAssignments = (member) => {
        if (!member.assignments) return [];
        return member.assignments.filter(a => !adminSchool || a.schoolId === adminSchool);
    };

    // Función auxiliar para obtener el nombre del pack de forma segura
    const getPackName = (packData) => {
        if (!packData) return 'Sin Pack';
        const packId = typeof packData === 'object' ? packData.id : packData;
        const pack = PACKS.find(p => p.id === packId);
        return pack ? pack.name : (typeof packData === 'object' ? packData.label : packId);
    };

    const handleConfirmPhoto = () => {
        if (!activeStudent || !photoNumber) return;

        // Usamos updateStatus (que por ahora solo acepta ID y Status) 
        // y luego deberíamos actualizar la foto. 
        // NOTA: Lo ideal sería que App pasara bulkUpdateStatus.
        updateStatus(activeStudent.id, 'production');
        // Si existe updatePhotoFile en las props (parece que no se pasa), lo usaríamos.
        // Por ahora, al menos no crasheamos y el estado cambia.

        if (autoAdvance) {
            // Lógica de auto-avance (opcional si se requiere)
        }
        setActiveStudent(null);
    };

    return (
        <div className="flex flex-col h-full bg-main overflow-hidden transition-colors duration-500">
            {/* TOOLBAR SUPERIOR */}
            <div className="bg-card border-b border-primary/5 p-4 flex flex-col gap-4 shrink-0 transition-colors">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex bg-primary/5 p-1 rounded-[22px] w-full max-w-md border border-primary/5 shadow-inner">
                            <button onClick={() => { setShootMode('students'); setShootSearch(''); }} className={`flex-1 lg:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shootMode === 'students' ? 'bg-card text-primary shadow-sm border border-primary/5' : 'text-secondary hover:text-primary opacity-60'} min-h-[44px]`}>
                                <Users size={16} /> Alumnos
                            </button>
                            <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`flex-1 lg:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shootMode === 'staff' ? 'bg-indigo-500 text-white shadow-lg' : 'text-secondary hover:text-primary opacity-60'} min-h-[44px]`}>
                                <UserCheck size={16} /> Profesores
                            </button>
                        </div>

                        <select value={adminSchool} onChange={e => { setAdminSchool(e.target.value); setShootFilters({ course: '', group: '' }); }} className="hidden md:block bg-primary/5 border border-primary/10 text-xs font-bold rounded-2xl px-4 py-3 outline-none appearance-none cursor-pointer hover:bg-primary/10 transition-colors text-primary">
                            <option value="">TODOS LOS CENTROS</option>
                            {sortedSchools.map(s => (
                                <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex flex-col items-end">
                            <h2 className="text-sm font-black text-primary tracking-tight">
                                {getSchoolName(adminSchool) || 'GLOBAL VIEW'}
                            </h2>
                            <p className="text-[11px] font-black text-emerald-400 tracking-widest uppercase italic">
                                {shootFilters.course || 'TODOS LOS CURSOS'} {shootFilters.group ? `· GRUPO ${shootFilters.group}` : ''}
                            </p>
                        </div>

                        {/* Botón Backup */}
                        <button onClick={downloadMasterBackup} className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500/20 transition-all active:scale-95 shadow-sm min-h-[44px] shrink-0">
                            <Database size={16} /> Backup SOS
                        </button>
                    </div>
                </div>

                {shootMode === 'students' && (
                    <div className="card p-4 flex items-center gap-3 shrink-0">
                        <select value={shootFilters.course} onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="bg-primary/5 border border-primary/10 text-[10px] font-black rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer text-primary">
                            <option value="">CURSO</option>
                            {activeCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>

                        <select value={shootFilters.group} onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))} className="bg-primary/5 border border-primary/10 text-[10px] font-black rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer transition-all text-primary">
                            <option value="">GRUPO</option>
                            {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>

                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" />
                            <input type="text" lang="es" value={shootSearch} onChange={e => setShootSearch(e.target.value)} placeholder="Buscar alumno..." className="w-full bg-primary/5 border border-primary/10 focus:border-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder-primary/30 outline-none transition-colors" />
                        </div>
                    </div>
                )}
            </div>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {shootMode === 'students' && (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* SECCIÓN ALTA RÁPIDA (COLAPSABLE) */}
                        {adminSchool && (
                            <div className="px-4 pt-4 shrink-0">
                                <div className="bg-card border border-primary/5 rounded-3xl shadow-sm overflow-hidden border-l-4 border-l-emerald-400">
                                    {/* Cabecera colapsable */}
                                    <button
                                        onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)}
                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-400/10 rounded-xl text-emerald-500">
                                                <Zap size={18} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-wider">Alta Rápida</h3>
                                                <p className="text-[10px] text-secondary font-bold opacity-60 uppercase">Nuevo alumno directo al disparo</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isQuickAddExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                        </div>
                                    </button>

                                    {/* Formulario colapsable */}
                                    {isQuickAddExpanded && (
                                        <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                                                <div className="space-y-1.5 md:col-span-1">
                                                    <label className="text-[9px] font-black text-primary/40 uppercase ml-1">Alumno</label>
                                                    <input type="text" lang="es" value={newStudentForm.studentName || newStudentForm.name} onChange={e => setNewStudentForm(p => ({ ...p, studentName: e.target.value, name: e.target.value }))} placeholder="Nombre y apellidos" className="w-full bg-primary/5 border border-primary/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-sm font-bold placeholder:font-medium placeholder:opacity-30 outline-none transition-all text-primary" />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-1">
                                                    <label className="text-[9px] font-black text-primary/40 uppercase ml-1">Padre/Madre</label>
                                                    <input type="text" lang="es" value={newStudentForm.parentName} onChange={e => setNewStudentForm(p => ({ ...p, parentName: e.target.value }))} placeholder="Opcional" className="w-full bg-primary/5 border border-primary/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-sm font-bold placeholder:font-medium placeholder:opacity-30 outline-none transition-all text-primary" />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-1 lg:col-span-1">
                                                    <label className="text-[9px] font-black text-primary/40 uppercase ml-1">Pack</label>
                                                    <select value={newStudentForm.packId || newStudentForm.pack} onChange={e => setNewStudentForm(p => ({ ...p, packId: e.target.value, pack: e.target.value }))} className="w-full bg-primary/5 border border-primary/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-sm font-black outline-none appearance-none cursor-pointer text-primary">
                                                        <option value="">Seleccionar Pack</option>
                                                        {PACKS.map(p => <option key={p.id} value={p.id}>{p.id.toUpperCase()} - {p.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-1.5 md:col-span-1 lg:col-span-2 flex items-end">
                                                    <button onClick={addOrder} disabled={(!newStudentForm.studentName && !newStudentForm.name) || (!newStudentForm.pack && !newStudentForm.packId)} className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-500 disabled:bg-primary/10 text-white text-xs font-black uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-emerald-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                        <Zap size={16} /> Alta y Empezar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LISTADO DE ALUMNOS */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 content-start">
                                {filteredOrders.map((order) => {
                                    const isSelected = activeStudent?.id === order.id;
                                    const hasPhoto = order.status === 'production' || order.photoFile;

                                    return (
                                        <button key={order.id} onClick={() => selectStudent(order)} className={`relative flex flex-col items-center bg-card p-3 rounded-2xl border transition-all duration-300 active:scale-90 ${isSelected ? 'ring-2 ring-emerald-400 border-transparent shadow-xl translate-y-[-4px]' : 'border-primary/5 hover:border-primary/20 shadow-sm'}`}>
                                            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-2 overflow-hidden ring-4 ring-primary/5 group-hover:ring-primary/10 transition-all">
                                                {hasPhoto ? <Camera size={24} className="text-emerald-400" /> : <Users size={24} className="text-primary opacity-20" />}
                                            </div>
                                            <p className="text-[10px] font-black text-center text-primary leading-tight line-clamp-2 w-full uppercase">{order.studentName}</p>
                                            <span className="text-[8px] font-bold text-secondary opacity-40 uppercase tracking-widest mt-1">{order.course}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {shootMode === 'staff' && (
                    <div className="flex flex-col h-full overflow-hidden animate-fade-in p-4">
                        <div className="card p-4 flex items-center gap-3 flex-wrap shrink-0">
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
                            }} className="px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/10 transition-colors text-primary">
                                <CheckSquare size={14} /> {selectedStaffIds.length === staff.length ? 'Desmarcar' : 'Marcar Todos'}
                            </button>
                            <button onClick={() => deleteStaff(selectedStaffIds)} disabled={selectedStaffIds.length === 0} className="px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 transition-colors disabled:opacity-30">
                                <Trash2 size={14} /> Eliminar ({selectedStaffIds.length})
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                                {staff.filter(m => !shootSearch || m.name.toLowerCase().includes(shootSearch.toLowerCase())).map(member => {
                                    const isExpanded = expandedId === member.id;
                                    const isSelected = selectedStaffIds.includes(member.id);

                                    return (
                                        <div key={member.id} className={`group bg-card rounded-3xl border border-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden ${isSelected ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}>
                                            <div className="p-4 flex items-center justify-between gap-4">
                                                <button onClick={() => setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id])} className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-primary/10 text-transparent hover:border-indigo-500'}`}>
                                                    <CheckCircle size={14} />
                                                </button>

                                                <button onClick={() => setExpandedId(isExpanded ? null : member.id)} className="flex-1 flex items-center justify-between text-left">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                                            {member.photoFile ? <CheckCircle2 size={24} className="text-indigo-500" /> : <Users size={24} className="text-secondary/20" />}
                                                        </div>
                                                        <div>
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
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL DISPARO ACTIVO */}
            {activeStudent && (
                <div
                    className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300 cursor-pointer"
                    onClick={(e) => e.target === e.currentTarget && selectStudent(null)}
                >
                    <div className="w-full max-w-4xl bg-card rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20 cursor-default relative">

                        <div className="flex flex-col lg:flex-row h-full">
                            {/* Lado Izquierdo: Info Alumno */}
                            <div className="w-full lg:w-2/5 p-8 lg:p-12 bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col justify-between text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Camera size={200} />
                                </div>
                                <div className="relative z-10 lg:mt-16">
                                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <Camera size={32} />
                                    </div>
                                    <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight leading-none mb-6 italic text-white drop-shadow-xl">
                                        {activeStudent.studentName}
                                    </h1>

                                    {/* Isla Unificada de Centro y Curso */}
                                    <div className="p-5 bg-black/20 rounded-3xl backdrop-blur-md border border-white/10 text-white mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Centro y Curso</p>
                                        <p className="text-sm font-bold leading-tight mb-1">{getSchoolName(activeStudent.schoolId)}</p>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-200">{activeStudent.course}</p>
                                    </div>

                                    <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 text-white">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Pack Seleccionado</p>
                                        <p className="text-xl font-black italic text-emerald-100">{getPackName(activeStudent.pack)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lado Derecho: Captura Nº Foto */}
                            <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-main flex flex-col justify-center relative">
                                {/* Botón Volver (Reubicado a la derecha) */}
                                <button
                                    onClick={() => selectStudent(null)}
                                    className="absolute top-8 right-8 w-12 h-12 bg-primary/5 hover:bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all active:scale-90 z-30"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                <div className="max-w-xs mx-auto w-full space-y-8">
                                    <div className="text-center">
                                        <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4">Introduce Nº de Foto</p>
                                        <div className="relative group">
                                            <input
                                                ref={inputRef}
                                                type="number"
                                                value={photoNumber}
                                                onChange={e => setPhotoNumber(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleConfirmPhoto()}
                                                placeholder="0000"
                                                className="w-full text-7xl md:text-9xl font-black text-center text-primary placeholder:text-primary/5 focus:outline-none bg-transparent transition-all border-b-4 border-primary/10 focus:border-emerald-500 selection:bg-emerald-500 selection:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={handleConfirmPhoto}
                                            disabled={!photoNumber}
                                            className="w-full py-7 bg-emerald-500 hover:bg-emerald-600 disabled:bg-primary/5 disabled:text-primary/10 text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                        >
                                            <CheckCircle2 size={24} className="group-hover:scale-125 transition-transform" /> CONFIRMAR
                                        </button>

                                        {/* Buscador de Alumnos con Autocompletado */}
                                        <div className="relative">
                                            <div className="relative group/search">
                                                <input
                                                    type="text"
                                                    value={modalSearch}
                                                    onChange={e => setModalSearch(e.target.value)}
                                                    placeholder="BUSCAR OTRO ALUMNO..."
                                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest text-primary placeholder:text-primary/20 focus:outline-none focus:border-emerald-500 transition-all"
                                                />
                                                <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/search:text-emerald-500 transition-colors" />
                                            </div>

                                            {modalSearch.length > 1 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="max-h-[200px] overflow-y-auto">
                                                        {orders
                                                            .filter(o =>
                                                                (adminSchool ? o.schoolId === adminSchool : true) &&
                                                                o.studentName.toLowerCase().includes(modalSearch.toLowerCase()) &&
                                                                o.id !== activeStudent.id
                                                            )
                                                            .slice(0, 5)
                                                            .map(student => (
                                                                <button
                                                                    key={student.id}
                                                                    onClick={() => {
                                                                        selectStudent(student);
                                                                        setModalSearch("");
                                                                    }}
                                                                    className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 group/item"
                                                                >
                                                                    <div className="text-left">
                                                                        <p className="text-[10px] font-black text-primary uppercase">{student.studentName}</p>
                                                                        <p className="text-[8px] font-bold text-primary/40 uppercase">{student.course}</p>
                                                                    </div>
                                                                    <ArrowRight size={12} className="text-primary/20 group-hover/item:text-emerald-500 group-hover/item:translate-x-1 transition-all" />
                                                                </button>
                                                            ))
                                                        }
                                                        {orders.filter(o =>
                                                            (adminSchool ? o.schoolId === adminSchool : true) &&
                                                            o.studentName.toLowerCase().includes(modalSearch.toLowerCase()) &&
                                                            o.id !== activeStudent.id
                                                        ).length === 0 && (
                                                                <div className="p-4 text-center">
                                                                    <p className="text-[9px] font-black text-primary/30 uppercase italic">No hay resultados</p>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(ShootingPanel);
