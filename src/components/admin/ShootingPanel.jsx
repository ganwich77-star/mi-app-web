import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users, Hash, ArrowRight, ArrowLeft,
    Sparkles, XCircle, RotateCcw, Tv, Camera, CheckCircle2, Zap,
    ChevronRight, AlertCircle, CreditCard, ChevronDown, ChevronUp, Mail, FileText,
    Package, Plus, LayoutGrid, List
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
    schools,
    settings
}) => {
    const [activeStudent, setActiveStudent] = useState(null);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [photoNumber, setPhotoNumber] = useState("");
    const [photoPrefix, setPhotoPrefix] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [modalSearch, setModalSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [isStudentListExpanded, setIsStudentListExpanded] = useState(true);
    const [showQuickExtras, setShowQuickExtras] = useState(false);
    const [viewStyle, setViewStyle] = useState('grid');
    const inputRef = useRef(null);

    // Funciones locales para Alta Rápida
    const calculateQuickTotal = () => {
        const packId = newStudentForm.packId || newStudentForm.pack;
        const selectedPack = PACKS.find(p => p.id === packId);
        let total = selectedPack?.price || 0;

        const activeSupplements = settings?.supplements || [];
        (newStudentForm.complements || []).forEach(id => {
            const supp = activeSupplements.find(s => s.id === id);
            if (supp) total += supp.price;
        });

        return total;
    };

    const handleWhatsAppQuickAdd = () => {
        if (!newStudentForm.phone) return;

        const packId = newStudentForm.packId || newStudentForm.pack;
        const pack = PACKS.find(p => p.id === packId);
        const packName = pack ? pack.name : 'Pack no seleccionado';
        const total = calculateQuickTotal();

        const activeSupplements = settings?.supplements || [];
        const supplementsNames = (newStudentForm.complements || [])
            .map(id => activeSupplements.find(s => s.id === id)?.name)
            .filter(Boolean);

        const photographerName = settings?.fiscalName || 'Pujalte Creative Studio';
        const currentYear = 2026;

        const msg = `¡Hola! 👋 Soy *${photographerName}*.\n\n` +
            `Confirmamos el alta de *${newStudentForm.studentName || newStudentForm.name}* para hacerse la foto para la orla de graduación ${currentYear}. 📸\n\n` +
            `📦 *Pack:* ${packName}\n` +
            (supplementsNames.length > 0 ? `✨ *Suplementos:* ${supplementsNames.join(', ')}\n` : '') +
            `💰 *Total pagado:* ${total}€\n\n` +
            `Hemos recibido el dinero en EFECTIVO en el momento de la sesión. Si necesita cualquier aclaración, estamos a su entera disposición.\n\n` +
            `¡Muchas gracias!`;

        const cleanPhone = newStudentForm.phone.replace(/\s+/g, '').replace('+', '');
        window.open(`https://wa.me/34${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleSaveQuickAdd = () => {
        if ((!newStudentForm.studentName && !newStudentForm.name) || (!newStudentForm.packId && !newStudentForm.pack)) return;

        const packId = newStudentForm.packId || newStudentForm.pack;
        const selectedPack = PACKS.find(p => p.id === packId);
        const total = calculateQuickTotal();

        const orderData = {
            ...newStudentForm,
            studentName: newStudentForm.studentName || newStudentForm.name,
            schoolId: adminSchool,
            schoolName: getSchoolName(adminSchool),
            course: newStudentForm.course || shootFilters.course || 'PENDIENTE',
            group: newStudentForm.group || shootFilters.group || '',
            pack: { id: packId, label: selectedPack?.name || packId },
            packId: packId,
            price: total,
            timestamp: new Date().toISOString(),
            status: 'Pendiente',
            paymentMethod: 'efectivo'
        };

        addOrder(orderData);

        // Reset form
        setNewStudentForm({
            schoolId: '',
            studentName: '',
            name: '',
            parentName: '',
            course: '',
            group: '',
            phone: '',
            email: '',
            packId: '',
            extras: [],
            complements: [],
            notes: '',
            photoFile: '',
            status: 'Pendiente',
            paymentMethod: ''
        });
        setShowQuickExtras(false);
    };

    // Función para calcular el tamaño inteligente del texto
    const getFontSize = (text, isPrefix = false) => {
        const length = text?.length || 0;
        if (isPrefix) {
            if (length > 12) return 'text-xs md:text-sm';
            if (length > 8) return 'text-sm md:text-base';
            if (length > 5) return 'text-xl md:text-2xl';
            return 'text-3xl md:text-4xl';
        }
        if (length > 6) return 'text-5xl md:text-6xl';
        if (length > 4) return 'text-7xl md:text-8xl';
        return 'text-8xl md:text-9xl';
    };

    // Activar/Desactivar a un niño y poner el foco en el input
    const selectStudent = (student) => {
        if (student === null) {
            setActiveStudent(null);
            setIsFocused(false);
            return;
        }
        if (!student) return;
        if (activeStudent?.id === student.id) {
            setActiveStudent(null);
            setIsFocused(false);
            return;
        }
        setActiveStudent(student);
        setPhotoNumber("");
        // Mantenemos el prefijo si ya estaba puesto para ahorrar tiempo al fotógrafo
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Filtrado de pedidos
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        return orders.filter(order => {
            if (adminSchool && order.schoolId !== adminSchool) return false;
            if (shootSearch) {
                const searchLower = shootSearch.toLowerCase();
                const matchesSearch =
                    order.studentName?.toLowerCase().includes(searchLower) ||
                    order.parentName?.toLowerCase().includes(searchLower) ||
                    order.phone?.includes(searchLower);
                if (!matchesSearch) return false;
            }
            if (shootFilters.course && getCourseBase(order.course) !== shootFilters.course) return false;
            if (shootFilters.group && getGroup(order.course) !== shootFilters.group) return false;
            return true;
        });
    }, [orders, adminSchool, shootSearch, shootFilters]);

    // Grupos únicos para el curso seleccionado
    const availableGroups = shootFilters.course
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === shootFilters.course))
            ?.courses.find(c => c.name === shootFilters.course)?.lines || [])
        : [];

    // Grupos únicos para el curso del formulario de alta rápida
    const formAvailableGroups = newStudentForm.course
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === newStudentForm.course))
            ?.courses.find(c => c.name === newStudentForm.course)?.lines || [])
        : [];

    // Cursos únicos de la escuela
    const activeCourses = useMemo(() => {
        if (!adminSchool || !orders) return [];
        const schoolCourses = new Set(orders.filter(o => o.schoolId === adminSchool).map(o => getCourseBase(o.course)));
        return [...schoolCourses].sort().map(name => ({ name }));
    }, [orders, adminSchool]);

    const getStaffAssignments = (member) => {
        if (!member.assignments) return [];
        return member.assignments.filter(a => !adminSchool || a.schoolId === adminSchool);
    };

    const getPackName = (packData) => {
        if (!packData) return 'Sin Pack';
        const packId = typeof packData === 'object' ? packData.id : packData;
        const pack = PACKS.find(p => p.id === packId);
        return pack ? pack.name : (typeof packData === 'object' ? packData.label : packId);
    };

    const handleConfirmPhoto = () => {
        if (!activeStudent || !photoNumber) return;
        const finalPhotoId = `${photoPrefix}${photoNumber}`;
        updateStatus(activeStudent.id, 'production', finalPhotoId);
        setActiveStudent(null);
        setPhotoNumber("");
    };

    return (
        <div className="flex flex-col h-full bg-main overflow-hidden transition-colors duration-500">
            {/* TOOLBAR SUPERIOR */}
            <div className="bg-card border-b border-primary/5 p-3 md:p-4 flex flex-col gap-3 md:gap-4 shrink-0 transition-colors text-primary relative z-50">
                <div className="flex items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 text-primary">
                        {/* Selector Alumnos / Docentes */}
                        <div className="flex p-1 rounded-[12px] bg-primary/[0.03] border border-primary/10 shrink-0 w-full max-w-[200px] md:max-w-[240px]">
                            <button onClick={() => { setShootMode('students'); setShootSearch(''); }} className={`flex-1 px-2 py-2 rounded-[8px] text-[10px] md:text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 ${shootMode === 'students' ? 'bg-white text-primary shadow-sm' : 'text-primary/50 hover:text-primary hover:bg-white/50'}`}>
                                <Users size={14} /> Alumnos
                            </button>
                            <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`flex-1 px-2 py-2 rounded-[8px] text-[10px] md:text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 ${shootMode === 'staff' ? 'bg-white text-primary shadow-sm' : 'text-primary/50 hover:text-primary hover:bg-white/50'}`}>
                                <UserCheck size={14} /> Docentes
                            </button>
                        </div>

                        {/* Selector Centro */}
                        <div className="flex-1 hidden md:block relative max-w-2xl mx-auto">
                            <select value={adminSchool} onChange={e => { setAdminSchool(e.target.value); setShootFilters({ course: '', group: '' }); }} className="w-full bg-primary/[0.02] border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-wide rounded-[12px] px-6 py-3 h-[42px] outline-none appearance-none cursor-pointer hover:bg-primary/[0.04] transition-colors shadow-sm text-center truncate pr-10">
                                <option value="">TODOS LOS CENTROS</option>
                                {sortedSchools.map(s => (
                                    <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                        </div>
                    </div>

                    {/* Acciones Derecha */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <button onClick={downloadMasterBackup} className="px-4 py-2 h-[38px] md:h-[42px] bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/20 text-[10px] md:text-[11px] font-bold uppercase tracking-wide rounded-[10px] transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm">
                            <Database size={14} /> <span className="hidden sm:inline">Backup SOS</span>
                        </button>
                    </div>
                </div>

            </div>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {shootMode === 'students' && (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="px-4 pt-4 shrink-0">
                            <div className="bg-card border border-primary/10 border-l-4 border-l-blue-500 rounded-[16px] shadow-sm overflow-hidden">
                                <button onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-primary border-b border-primary/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                            <Search size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Filtros de Alumnos</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider italic">Búsqueda rápida y segmentación por curso/grupo</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isFiltersExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                    </div>
                                </button>

                                {isFiltersExpanded && (
                                    <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-5">
                                            <div className="md:col-span-5 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Buscador</p>
                                                <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all group/field">
                                                    <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <Search size={18} />
                                                    </div>
                                                    <input type="text" lang="es" value={shootSearch} onChange={e => setShootSearch(e.target.value)} placeholder="Nombre, padre o teléfono..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-5 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Curso</p>
                                                <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all group/field relative">
                                                    <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <Users size={18} />
                                                    </div>
                                                    <select value={shootFilters.course} onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-[80px]">
                                                        <option value=""></option>
                                                        {activeCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Grupo</p>
                                                <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all group/field relative">
                                                    <div className="px-3 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <Hash size={18} />
                                                    </div>
                                                    <select value={shootFilters.group} onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))} className="flex-1 bg-transparent px-3 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0 text-center">
                                                        <option value=""></option>
                                                        {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                                    </select>
                                                    <div className="absolute right-3 pointer-events-none text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {adminSchool && (
                            <div className="px-4 pt-4 shrink-0 focus-within:z-50">
                                <div className="bg-card border border-primary/10 border-l-4 border-l-emerald-500 rounded-[16px] overflow-hidden text-primary">
                                    <button onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-primary border-b border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-400/10 rounded-xl text-emerald-500"><Zap size={18} /></div>
                                            <div className="text-left">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-wider">Alta Rápida</h3>
                                                <p className="text-[10px] text-secondary font-bold opacity-60 uppercase">Doble fila de gestión instantánea</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-4 mr-4">
                                                {newStudentForm.studentName && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">En curso</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isQuickAddExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                        </div>
                                    </button>

                                    {isQuickAddExpanded && (
                                        <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                            {/* FILA 1: PADRE Y WHATSAPP */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 border-b border-dashed border-primary/20">
                                                <div className="md:col-span-4 space-y-2">
                                                    <div className="flex items-center justify-between pl-1">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Padre / Madre</p>
                                                        {(newStudentForm.parentName || newStudentForm.phone) && (
                                                            <button
                                                                onClick={() => setNewStudentForm(p => ({ ...p, parentName: '', phone: '' }))}
                                                                className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-tighter transition-colors flex items-center gap-1"
                                                            >
                                                                <RotateCcw size={10} /> Limpiar
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <UserCheck size={18} />
                                                        </div>
                                                        <input type="text" lang="es" value={newStudentForm.parentName} onChange={e => setNewStudentForm(p => ({ ...p, parentName: e.target.value }))} placeholder="Nombre tutor..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Teléfono Móvil</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Phone size={18} />
                                                        </div>
                                                        <input type="tel" value={newStudentForm.phone} onChange={e => setNewStudentForm(p => ({ ...p, phone: e.target.value }))} placeholder="9 dígitos..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2 flex flex-col justify-end">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-transparent pointer-events-none select-none pl-1 opacity-0">Acción</p>
                                                    <button onClick={handleWhatsAppQuickAdd} disabled={!newStudentForm.phone || (!newStudentForm.studentName && !newStudentForm.name)} className="w-full h-[46px] bg-transparent border border-primary/10 text-primary/50 hover:bg-primary/[0.02] hover:text-primary hover:border-primary/20 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-20 shadow-sm font-bold text-[13px] tracking-wide group">
                                                        <MessageSquare size={16} className="group-hover:animate-bounce" />
                                                        <span>RECIBO</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* FILA 2: ALUMNO, CURSO, GRUPO */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 border-b border-dashed border-primary/20 items-end">
                                                <div className="md:col-span-5 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Nombre Alumno/a</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3.5 border-r border-primary/20 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input type="text" lang="es" value={newStudentForm.studentName || newStudentForm.name} onChange={e => setNewStudentForm(p => ({ ...p, studentName: e.target.value, name: e.target.value }))} placeholder="Nombre completo..." className="flex-1 bg-transparent px-4 py-3.5 text-sm font-bold text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Curso</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3.5 border-r border-primary/20 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <select value={newStudentForm.course} onChange={e => setNewStudentForm(p => ({ ...p, course: e.target.value, group: '' }))} className="flex-1 bg-transparent px-4 py-3.5 text-sm font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-[80px]">
                                                            <option value="">Elegir Curso</option>
                                                            {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Grupo</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-3 py-3.5 border-r border-primary/20 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <Hash size={18} />
                                                        </div>
                                                        <select value={newStudentForm.group} onChange={e => setNewStudentForm(p => ({ ...p, group: e.target.value }))} className="flex-1 bg-transparent px-3 py-3.5 text-sm font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0 text-center">
                                                            <option value="">-</option>
                                                            {formAvailableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                        <div className="absolute right-3 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FILA 3: PACK Y OBSERVACIONES */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 items-end border-b border-dashed border-primary/20">
                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Pack Selección</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <Package size={18} />
                                                        </div>
                                                        <select value={newStudentForm.packId || newStudentForm.pack} onChange={e => setNewStudentForm(p => ({ ...p, packId: e.target.value, pack: e.target.value }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-0">
                                                            <option value="">Elegir Pack</option>
                                                            {PACKS.map(p => <option key={p.id} value={p.id}>{p.id.toUpperCase()}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-5 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Observaciones / Notas del pedido</p>
                                                    <div className="flex items-start bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors self-stretch flex items-center">
                                                            <FileText size={18} />
                                                        </div>
                                                        <textarea value={newStudentForm.notes} onChange={e => setNewStudentForm(p => ({ ...p, notes: e.target.value }))} placeholder="Detalles o suplementos..." rows={1} className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none resize-none custom-scrollbar" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 flex items-end">
                                                    <button onClick={handleSaveQuickAdd} disabled={(!newStudentForm.studentName && !newStudentForm.name) || (!newStudentForm.packId && !newStudentForm.pack) || !newStudentForm.course} className="w-full h-[46px] bg-[#52b788] hover:bg-[#40a075] disabled:bg-primary/5 disabled:border disabled:border-primary/10 disabled:text-primary/20 text-white text-[14px] font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                        <CheckCircle size={18} /> Guardar Alumno
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Isla Contenedora de Alumnos */}
                        <div className="flex-1 px-4 py-4 text-primary flex flex-col items-center overflow-hidden">
                            <div className="w-full max-w-[1700px] bg-card rounded-[16px] border border-primary/10 border-l-4 border-l-orange-500 shadow-xl overflow-hidden flex flex-col h-full">
                                <button onClick={() => setIsStudentListExpanded(!isStudentListExpanded)} className="w-full p-4 md:p-5 border-b border-primary/5 flex justify-between items-center shrink-0 hover:bg-primary/[0.02] transition-colors cursor-pointer text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Listado de Alumnos</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">{filteredOrders?.length || 0} alumnos encontrados</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isStudentListExpanded && filteredOrders.length > 0 && (
                                            <div className="hidden md:flex items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (selectedOrderIds.length === filteredOrders.length) setSelectedOrderIds([]);
                                                    else setSelectedOrderIds(filteredOrders.map(o => o.id));
                                                }} className="px-3 py-1.5 bg-primary/[0.03] border border-primary/10 rounded-[8px] text-[10px] font-bold tracking-wide flex items-center gap-2 hover:bg-primary/[0.06] transition-colors text-primary shadow-sm">
                                                    <CheckSquare size={14} /> {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
                                                </button>
                                                {selectedOrderIds.length > 0 && (
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteOrder(selectedOrderIds);
                                                        setSelectedOrderIds([]);
                                                    }} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-[10px] font-bold text-red-500 tracking-wide flex items-center gap-2 hover:bg-red-500/20 transition-colors shadow-sm">
                                                        <Trash2 size={14} /> Eliminar ({selectedOrderIds.length})
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="hidden md:flex items-center gap-1 p-1 rounded-[10px] bg-primary/[0.02] border border-primary/10 shadow-sm" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setViewStyle('grid')} className={`w-8 h-8 rounded-[6px] transition-all flex items-center justify-center ${viewStyle === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Cuadrícula">
                                                <LayoutGrid size={16} />
                                            </button>
                                            <button onClick={() => setViewStyle('list')} className={`w-8 h-8 rounded-[6px] transition-all flex items-center justify-center ${viewStyle === 'list' ? 'bg-white shadow-sm text-primary' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Lista / Edición">
                                                <List size={18} />
                                            </button>
                                        </div>
                                        {isStudentListExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                    </div>
                                </button>
                                {isStudentListExpanded && (
                                    <div className="flex flex-col flex-1 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                        {viewStyle === 'grid' ? (
                                    <div className="p-4 md:p-5 overflow-y-auto custom-scrollbar w-full" style={{ maxHeight: 'calc(4 * 148px)' }}>
                                        {/* Grid forzado a 8 columnas */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 content-start">
                                            {filteredOrders.map((order) => {
                                                const isSelected = activeStudent?.id === order.id;
                                                const hasPhoto = order.status === 'production' || order.photoFile;
                                                return (
                                                    <button key={order.id} onClick={() => selectStudent(order)} className={`relative flex flex-col items-center p-4 rounded-[16px] border transition-all duration-300 active:scale-95 ${isSelected ? 'border-orange-500 bg-orange-50/50 shadow-md shadow-orange-500/10' : 'border-primary/10 bg-card hover:border-primary/30 hover:shadow-md'}`}>
                                                        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center mb-3 overflow-hidden transition-all ${isSelected ? 'bg-orange-100 text-orange-500' : 'bg-primary/5 text-primary/40'}`}>
                                                            {hasPhoto ? <Camera size={20} className="text-emerald-500" /> : <Users size={20} className={isSelected ? 'text-orange-500' : 'text-primary/40'} />}
                                                        </div>
                                                        <p className="text-[11px] font-bold text-center text-primary leading-tight line-clamp-2 w-full">{order.studentName}</p>
                                                        <span className="text-[9px] font-medium text-primary/50 mt-1">{order.course}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-0 overflow-y-auto custom-scrollbar w-full flex-1">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-primary/5 sticky top-0 z-10 backdrop-blur-md">
                                                <tr>
                                                    <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 w-12 text-center">
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (selectedOrderIds.length === filteredOrders.length) setSelectedOrderIds([]);
                                                            else setSelectedOrderIds(filteredOrders.map(o => o.id));
                                                        }} className="text-primary/40 hover:text-orange-500 transition-colors">
                                                            {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? <CheckSquare size={16} className="text-orange-500" /> : <Square size={16} />}
                                                        </button>
                                                    </th>
                                                    <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40">Alumno</th>
                                                    <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40">Curso / Grupo</th>
                                                    <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40">Pack Seleccionado</th>
                                                    <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-center">Estado</th>
                                                    <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map(order => (
                                                    <tr key={order.id} className={`border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group ${selectedOrderIds.includes(order.id) ? 'bg-orange-50/50' : ''}`}>
                                                        <td className="py-4 px-5 text-center align-middle">
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                                                            }} className="text-primary/20 hover:text-orange-500 transition-colors">
                                                                {selectedOrderIds.includes(order.id) ? <CheckSquare size={16} className="text-orange-500" /> : <Square size={16} />}
                                                            </button>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${order.status === 'production' || order.photoFile ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/5 text-primary/30'}`}>
                                                                    {order.status === 'production' || order.photoFile ? <Camera size={16} /> : <Users size={16} />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-primary uppercase leading-tight">{order.studentName}</p>
                                                                    <p className="text-[9px] font-bold text-primary/40 uppercase mt-1">{order.parentName || 'Sin tutor reg.'} {order.phone && `· ${order.phone}`}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5 align-middle">
                                                            <span className="text-[10px] font-bold text-secondary uppercase bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/5 inline-flex items-center">
                                                                {order.course} {order.group && <span className="ml-1 text-primary/40 block"> | {order.group}</span>}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5 align-middle">
                                                            <span className="text-[11px] font-black text-emerald-600 uppercase italic">{getPackName(order.pack)}</span>
                                                        </td>
                                                        <td className="py-4 px-5 text-center align-middle">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {order.paymentMethod ? (
                                                                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20" title={`Pagado: ${order.paymentMethod}`}>
                                                                        <CheckCircle2 size={14} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20" title="Pendiente de pago">
                                                                        <AlertCircle size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5 text-right align-middle">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => selectStudent(order)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-colors border border-blue-100 tooltip-trigger shadow-sm" title="Modo Disparo">
                                                                    <Camera size={16} />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); setOrderToEdit(order); }} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm">
                                                                    Editar Ficha
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredOrders.length === 0 && (
                                            <div className="p-8 text-center text-primary/40">
                                                <p className="text-xs font-black uppercase tracking-widest">No hay alumnos para mostrar</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {shootMode === 'staff' && (
                    <div className="flex flex-col h-full overflow-hidden animate-fade-in p-4 text-primary">
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
            {
                activeStudent && (
                    <div className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300 cursor-pointer text-primary" onClick={(e) => e.target === e.currentTarget && selectStudent(null)}>
                        <div className="w-full max-w-4xl bg-card rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20 cursor-default relative">
                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="w-full lg:w-2/5 p-8 lg:p-12 bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col justify-between text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        {settings?.logo ? <img src={settings.logo} alt="Logo" className="w-48 h-48 object-contain drop-shadow-2xl brightness-0 invert" /> : <Camera size={200} />}
                                    </div>
                                    <div className="relative z-10 lg:mt-16">
                                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                            {settings?.logo ? <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-xl brightness-0 invert" /> : <Camera size={32} />}
                                        </div>
                                        <h1 className={`text-3xl lg:text-5xl font-black uppercase tracking-tight leading-none italic text-white drop-shadow-xl ${activeStudent.photoFile ? 'mb-2' : 'mb-6'}`}>
                                            {activeStudent.studentName}
                                        </h1>
                                        {activeStudent.photoFile && (
                                            <p className="text-3xl lg:text-4xl font-black tracking-widest mb-6 text-white drop-shadow-xl break-all">
                                                {activeStudent.photoFile}
                                            </p>
                                        )}
                                        <div className="p-5 bg-black/20 rounded-3xl backdrop-blur-md border border-white/10 text-white mb-6 mt-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Centro y Curso</p>
                                            <p className="text-sm font-bold leading-tight mb-1">{getSchoolName(activeStudent.schoolId)}</p>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-200">{activeStudent.course}</p>
                                        </div>
                                        <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 text-white">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Pack Seleccionado</p>
                                            <p className="text-xl font-black italic text-emerald-100 mb-0">{getPackName(activeStudent.pack)}</p>
                                        </div>

                                        <div className="p-5 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 text-white mt-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">Estado Actual</p>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeStudent.paymentMethod ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                        {activeStudent.paymentMethod ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-wider leading-none">
                                                            {activeStudent.paymentMethod ? 'Pagado' : 'Pendiente de Pago'}
                                                        </p>
                                                        {activeStudent.paymentMethod && (
                                                            <p className="text-[9px] font-bold text-emerald-200/60 uppercase mt-0.5 tracking-widest">{activeStudent.paymentMethod}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeStudent.status === 'production' || activeStudent.photoFile ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                        <Camera size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-wider leading-none">
                                                            {activeStudent.status === 'production' || activeStudent.photoFile ? 'Foto Realizada' : 'Foto Pendiente'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {(activeStudent.complements?.length > 0 || activeStudent.extras?.length > 0) && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                                                            <Sparkles size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase tracking-wider leading-none text-blue-200">Adicionales</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-main flex flex-col justify-center relative">
                                    <button onClick={() => selectStudent(null)} className="absolute top-8 right-8 w-12 h-12 bg-primary/5 hover:bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all active:scale-90 z-30">
                                        <ArrowLeft size={24} />
                                    </button>

                                    <div className="w-full space-y-8">
                                        <div className="text-center flex flex-col items-center gap-12">
                                            <div className="w-full flex flex-col items-center gap-8">
                                                <div className="flex items-center justify-between w-full max-w-md">
                                                    <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em]">Introduce Nº de Foto</p>
                                                    {(photoPrefix || photoNumber) && (
                                                        <button
                                                            onClick={() => { setPhotoPrefix(""); setPhotoNumber(""); }}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-wider"
                                                        >
                                                            <RotateCcw size={14} />
                                                            Limpiar Todo
                                                        </button>
                                                    )}
                                                </div>

                                                {/* PREFIJO ARRIBA - Ancho aumentado para visibilidad total */}
                                                <div className="flex flex-col items-center gap-2 group/prefix w-full max-w-[280px]">
                                                    <div className="w-full flex justify-between items-center px-2">
                                                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest leading-none">Prefijo</span>
                                                        {photoPrefix && (
                                                            <button onClick={() => setPhotoPrefix("")} className="text-rose-500 hover:text-rose-600 transition-colors p-1.5"><RotateCcw size={12} /></button>
                                                        )}
                                                    </div>
                                                    <input type="text" value={photoPrefix} onChange={e => setPhotoPrefix(e.target.value.toUpperCase())} placeholder="ABCD" className={`w-full font-black text-center text-primary/60 placeholder:text-primary/10 focus:outline-none bg-primary/5 border-b-2 border-primary/10 focus:border-indigo-400 py-4 px-4 rounded-2xl transition-all uppercase ${getFontSize(photoPrefix, true)}`} />
                                                </div>

                                                {/* NÚMERO ABAJO - Ancho aumentado */}
                                                <div className="flex flex-col items-center gap-4 group/number w-full max-w-md">
                                                    <div className="w-full flex justify-between items-center px-2 mt-4">
                                                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest leading-none">Nº Archivo</span>
                                                        {photoNumber && (
                                                            <button onClick={() => setPhotoNumber("")} className="text-rose-500 hover:text-rose-600 transition-colors p-1.5"><RotateCcw size={12} /></button>
                                                        )}
                                                    </div>
                                                    <input ref={inputRef} type="number" value={photoNumber} onChange={e => setPhotoNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConfirmPhoto()} placeholder="0000" className={`w-full font-black text-center text-primary placeholder:text-primary/10 focus:outline-none bg-transparent transition-all border-b-4 border-primary/10 focus:border-emerald-500 selection:bg-emerald-500 selection:text-white ${getFontSize(photoNumber)}`} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-w-xs mx-auto w-full flex flex-col gap-4">
                                            <button onClick={handleConfirmPhoto} disabled={!photoNumber} className="w-full py-7 bg-emerald-500 hover:bg-emerald-600 disabled:bg-primary/5 disabled:text-primary/10 text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                                                <CheckCircle2 size={24} className="group-hover:scale-125 transition-transform" /> CONFIRMAR
                                            </button>

                                            <div className="relative">
                                                <div className="relative group/search flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <input type="text" value={modalSearch} onFocus={() => setIsFocused(true)} onChange={e => setModalSearch(e.target.value)} placeholder="BUSCAR OTRO ALUMNO..." className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest text-primary placeholder:text-primary/20 focus:outline-none focus:border-emerald-500 transition-all" />
                                                        <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/search:text-emerald-500 transition-colors" />
                                                    </div>
                                                    <button onClick={() => { setModalSearch(""); setIsFocused(!isFocused); }} className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95 transition-all shrink-0">
                                                        <ChevronUp size={20} className={isFocused ? "" : "rotate-180"} />
                                                    </button>
                                                </div>

                                                {(modalSearch.length > 0 || isFocused) && (
                                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-primary/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                            {orders.filter(o => {
                                                                const matchesSchool = adminSchool ? o.schoolId === adminSchool : true;
                                                                const matchesSearch = modalSearch.length > 0 ? o.studentName.toLowerCase().includes(modalSearch.toLowerCase()) : (o.course === activeStudent.course);
                                                                const hasPhoto = o.status === 'production' || o.photoFile;
                                                                return matchesSchool && matchesSearch && o.id !== activeStudent.id && !hasPhoto;
                                                            }).slice(0, 10).map(student => (
                                                                <button key={student.id} onClick={() => { selectStudent(student); setModalSearch(""); setIsFocused(false); }} className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 group/item">
                                                                    <div className="text-left">
                                                                        <p className="text-[10px] font-black text-primary uppercase">{student.studentName}</p>
                                                                        <p className="text-[8px] font-bold text-primary/40 uppercase">{student.course} {student.group ? `· ${student.group}` : ""}</p>
                                                                    </div>
                                                                    <ArrowRight size={12} className="text-primary/20 group-hover/item:text-emerald-500 group-hover/item:translate-x-1 transition-all" />
                                                                </button>
                                                            ))}
                                                            {orders.filter(o => (adminSchool ? o.schoolId === adminSchool : true) && (modalSearch.length > 0 ? o.studentName.toLowerCase().includes(modalSearch.toLowerCase()) : o.course === activeStudent.course) && o.id !== activeStudent.id).length === 0 && (
                                                                <div className="p-4 text-center">
                                                                    <p className="text-[9px] font-black text-primary/30 uppercase italic">No hay más alumnos en esta clase</p>
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
                )
            }
        </div >
    );
};

export default React.memo(ShootingPanel);
