import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users, Hash, ArrowRight, ArrowLeft,
    Sparkles, XCircle, RotateCcw, Tv, Camera, CheckCircle2, Zap,
    ChevronRight, AlertCircle, CreditCard, ChevronDown, ChevronUp, Mail, FileText,
    Package, Plus, LayoutGrid, List
} from 'lucide-react';
import { COURSE_GROUPS, PACKS, EXTRAS, STAFF_ROLES } from '../../constants.js';
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
    updateOrder,
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
    const [isStaffQuickAddExpanded, setIsStaffQuickAddExpanded] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);
    const [isStudentListExpanded, setIsStudentListExpanded] = useState(false);
    const [isStaffListExpanded, setIsStaffListExpanded] = useState(false); // Faltaba esta declaración
    const [viewStyle, setViewStyle] = useState('list');
    const [staffViewStyle, setStaffViewStyle] = useState('grid');
    const [showQuickExtras, setShowQuickExtras] = useState(false);
    const [showPaymentSelector, setShowPaymentSelector] = useState(false);
    const [showStatusSelector, setShowStatusSelector] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // 'orders' o 'staff'
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

    const handleSaveStaffQuickAdd = () => {
        if (!newStaffForm.firstName || !newStaffForm.lastName || !newStaffForm.role) return;

        // Limpiamos campos temporales antes de guardar
        const { tempCourse, tempGroup, ...staffData } = newStaffForm;
        
        const finalStaffData = {
            ...staffData,
            schoolId: adminSchool || staffData.schoolId
        };

        addStaff(finalStaffData);

        // Reset form
        setNewStaffForm({
            schoolId: '',
            firstName: '',
            lastName: '',
            role: '',
            photoFile: '',
            tempCourse: '',
            tempGroup: '',
            assignments: []
        });
        setIsStaffQuickAddExpanded(false); // Cerramos tras guardar para feedback visual
    };

    const handlePaymentChange = (method) => {
        if (!activeStudent) return;
        updateOrder(activeStudent.id, { paymentMethod: method });
        setActiveStudent(prev => prev?.id === activeStudent.id ? { ...prev, paymentMethod: method } : prev);
        setShowPaymentSelector(false);
    };

    const handleStatusChange = (status) => {
        if (!activeStudent) return;
        updateOrder(activeStudent.id, { status: status });
        setActiveStudent(prev => prev?.id === activeStudent.id ? { ...prev, status: status } : prev);
        setShowStatusSelector(false);
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

    // Grupos únicos para el curso del formulario de alta rápida de alumnos
    const formAvailableGroups = newStudentForm.course
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === newStudentForm.course))
            ?.courses.find(c => c.name === newStudentForm.course)?.lines || [])
        : [];

    // Grupos únicos para el curso del formulario de alta rápida de docentes
    const staffFormAvailableGroups = newStaffForm.tempCourse
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === newStaffForm.tempCourse))
            ?.courses.find(c => c.name === newStaffForm.tempCourse)?.lines || [])
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
                        <div className="flex p-1.5 rounded-[14px] bg-primary/[0.03] border border-primary/10 shrink-0 w-full max-w-[220px] md:max-w-[260px] gap-1">
                            <button onClick={() => { setShootMode('students'); setShootSearch(''); }} className={`flex-1 px-3 py-2 rounded-[10px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shootMode === 'students' ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'text-primary/40 hover:text-primary hover:bg-white/50'}`}>
                                <Users size={14} /> Alumnos
                            </button>
                            <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`flex-1 px-3 py-2 rounded-[10px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shootMode === 'staff' ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'text-primary/40 hover:text-primary hover:bg-white/50'}`}>
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
                                                        setShowDeleteConfirm('orders');
                                                    }} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-[10px] font-bold text-red-500 tracking-wide flex items-center gap-2 hover:bg-red-500/20 transition-colors shadow-sm">
                                                        <Trash2 size={14} /> Eliminar ({selectedOrderIds.length})
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {isStudentListExpanded && (
                                            <div className="hidden md:flex items-center gap-1 p-1 rounded-[10px] bg-primary/[0.02] border border-primary/10 shadow-sm" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => setViewStyle('grid')} className={`w-8 h-8 rounded-[6px] transition-all flex items-center justify-center ${viewStyle === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Cuadrícula">
                                                    <LayoutGrid size={16} />
                                                </button>
                                                <button onClick={() => setViewStyle('list')} className={`w-8 h-8 rounded-[6px] transition-all flex items-center justify-center ${viewStyle === 'list' ? 'bg-white shadow-sm text-primary' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Lista / Edición">
                                                    <List size={18} />
                                                </button>
                                            </div>
                                        )}
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
                                                const isPhotoSelected = activeStudent?.id === order.id;
                                                const isBulkSelected = selectedOrderIds.includes(order.id);
                                                const hasPhoto = order.status === 'production' || order.photoFile;
                                                return (
                                                    <div key={order.id} className="relative group/card">
                                                        <button 
                                                            onClick={() => selectStudent(order)} 
                                                            className={`w-full relative flex flex-col items-center p-4 rounded-[16px] border transition-all duration-300 active:scale-95 ${isPhotoSelected ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500/20 z-10 scale-[1.02]' : isBulkSelected ? 'border-orange-300 bg-orange-50/30 shadow-sm' : 'border-primary/10 bg-card hover:border-primary/30 hover:shadow-md'}`}
                                                        >
                                                            <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center mb-3 overflow-hidden transition-all ${isPhotoSelected ? 'bg-orange-100 text-orange-600' : isBulkSelected ? 'bg-orange-100/50 text-orange-500' : 'bg-primary/5 text-primary/40'}`}>
                                                                {hasPhoto ? <Camera size={20} className="text-emerald-500" /> : <Users size={20} />}
                                                            </div>
                                                            <p className="text-[11px] font-bold text-center text-primary leading-tight line-clamp-2 w-full uppercase">{order.studentName}</p>
                                                            <span className="text-[9px] font-medium text-primary/50 mt-1 uppercase tracking-wider">{order.course}</span>
                                                        </button>
                                                        
                                                        {/* Checkbox para selección masiva en Grid */}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                                                            }}
                                                            className={`absolute top-2 left-2 w-6 h-6 rounded-lg border transition-all flex items-center justify-center z-20 ${isBulkSelected ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white/80 border-primary/10 text-primary/10 hover:border-orange-300 opacity-0 group-hover/card:opacity-100 backdrop-blur-sm'}`}
                                                        >
                                                            <CheckSquare size={14} />
                                                        </button>
                                                    </div>
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
                                                    <tr key={order.id} className={`border-b border-primary/5 hover:bg-primary/[0.01] transition-colors group ${selectedOrderIds.includes(order.id) ? 'bg-orange-50/70' : ''} ${activeStudent?.id === order.id ? 'ring-2 ring-inset ring-orange-500/50 bg-orange-50' : ''}`}>
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
                        {adminSchool && (
                            <div className="mb-4 shrink-0 focus-within:z-50">
                                <div className="bg-card border border-primary/10 border-l-4 border-l-emerald-500 rounded-[16px] overflow-hidden text-primary shadow-sm">
                                    <button onClick={() => setIsStaffQuickAddExpanded(!isStaffQuickAddExpanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-primary border-b border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-400/10 rounded-xl text-emerald-500"><Zap size={18} /></div>
                                            <div className="text-left">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-wider">Alta Rápida Docente</h3>
                                                <p className="text-[10px] text-secondary font-bold opacity-60 uppercase">Nombre, apellidos y cargo instantáneo</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-4 mr-4">
                                                {newStaffForm.firstName && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">En curso</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isStaffQuickAddExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                        </div>
                                    </button>

                                    {isStaffQuickAddExpanded && (
                                        <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                            {/* FILA 1: NOMBRE, APELLIDOS Y CARGO */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 border-b border-dashed border-primary/20 align-end">
                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Nombre</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input type="text" value={newStaffForm.firstName} onChange={e => setNewStaffForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-5 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Apellidos</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input type="text" value={newStaffForm.lastName} onChange={e => setNewStaffForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Cargo / Función</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3 border-r border-primary/20 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <UserCheck size={18} />
                                                        </div>
                                                        <select value={newStaffForm.role} onChange={e => setNewStaffForm(p => ({ ...p, role: e.target.value }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-0">
                                                            <option value="">Seleccionar Cargo</option>
                                                            {Object.entries(STAFF_ROLES).map(([key, value]) => (
                                                                <option key={key} value={value}>{key}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FILA 2: ASIGNACIÓN DE CLASES (DINÁMICA) */}
                                            <div className="pt-5 border-b border-dashed border-primary/20 pb-5">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1 mb-3 flex items-center gap-2">
                                                    <Users size={12} /> Asignación de Clases y Grupos
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {newStaffForm.assignments.map((asg, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group/asg">
                                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                                                {asg.course} {asg.group && `· ${asg.group}`}
                                                            </span>
                                                            <button 
                                                                onClick={() => setNewStaffForm(p => ({ ...p, assignments: p.assignments.filter((_, i) => i !== idx) }))}
                                                                className="text-indigo-400 hover:text-rose-500 transition-colors"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {newStaffForm.assignments.length === 0 && (
                                                        <p className="text-[10px] font-bold text-primary/20 uppercase tracking-wider italic py-1">Sin clases asignadas aún</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-primary/[0.02] p-4 rounded-2xl border border-primary/5">
                                                    <div className="md:col-span-5 space-y-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 pl-1">Elegir Curso</p>
                                                        <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all group/sel relative">
                                                            <div className="px-3 py-2 border-r border-primary/10 text-primary/30 group-focus-within/sel:text-emerald-500 transition-colors">
                                                                <LayoutGrid size={16} />
                                                            </div>
                                                            <select value={newStaffForm.tempCourse} onChange={e => setNewStaffForm(p => ({ ...p, tempCourse: e.target.value, tempGroup: '' }))} className="flex-1 bg-transparent px-3 py-2 text-[12px] font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0">
                                                                <option value="">Curso...</option>
                                                                {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                            </select>
                                                            <div className="absolute right-3 pointer-events-none text-primary/30"><ChevronDown size={14} /></div>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-3 space-y-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 pl-1">Grupo</p>
                                                        <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all group/sel relative">
                                                            <div className="px-3 py-2 border-r border-primary/10 text-primary/30 group-focus-within/sel:text-emerald-500 transition-colors">
                                                                <Hash size={16} />
                                                            </div>
                                                            <select value={newStaffForm.tempGroup} onChange={e => setNewStaffForm(p => ({ ...p, tempGroup: e.target.value }))} className="flex-1 bg-transparent px-3 py-2 text-[12px] font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0 text-center">
                                                                <option value="">-</option>
                                                                {staffFormAvailableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                                            </select>
                                                            <div className="absolute right-3 pointer-events-none text-primary/30"><ChevronDown size={14} /></div>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <button 
                                                            onClick={() => {
                                                                if (!newStaffForm.tempCourse) return;
                                                                const newAsg = { schoolId: adminSchool, course: newStaffForm.tempCourse, group: newStaffForm.tempGroup };
                                                                setNewStaffForm(p => ({
                                                                    ...p,
                                                                    assignments: [...p.assignments.filter(a => !(a.course === newAsg.course && a.group === newAsg.group)), newAsg],
                                                                    tempCourse: '',
                                                                    tempGroup: ''
                                                                }));
                                                            }}
                                                            disabled={!newStaffForm.tempCourse}
                                                            className="w-full h-[40px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-sm"
                                                        >
                                                            <Plus size={14} /> Añadir Clase
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FILA 3: GUARDAR */}
                                            <div className="pt-5 flex justify-end">
                                                <button onClick={handleSaveStaffQuickAdd} disabled={!newStaffForm.firstName || !newStaffForm.lastName || !newStaffForm.role} className="w-full md:w-auto px-10 h-[46px] bg-[#52b788] hover:bg-[#40a075] disabled:bg-primary/5 disabled:border disabled:border-primary/10 disabled:text-primary/20 text-white text-[14px] font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                    <CheckCircle size={18} /> Guardar Docente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Isla Contenedora de Docentes */}
                        <div className="flex-1 px-0 py-4 text-primary flex flex-col items-center overflow-hidden">
                            <div className="w-full max-w-[1700px] bg-card rounded-[16px] border border-primary/10 border-l-4 border-l-indigo-500 shadow-xl overflow-hidden flex flex-col h-full">
                                <button onClick={() => setIsStaffListExpanded(!isStaffListExpanded)} className="w-full p-4 md:p-5 border-b border-primary/5 flex justify-between items-center shrink-0 hover:bg-primary/[0.02] transition-colors cursor-pointer text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                                            <UserCheck size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Listado de Docentes</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">
                                                {staff.filter(m => {
                                                    const sq = (shootSearch || '').trim().toLowerCase();
                                                    const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
                                                    const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                    return matchesSearch && matchesCourse;
                                                }).length} docentes encontrados
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isStaffListExpanded && (
                                            <div className="flex items-center gap-2">
                                                <div className="hidden md:flex items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const sq = (shootSearch || '').trim().toLowerCase();
                                                        const filtered = staff.filter(m => {
                                                            const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
                                                            const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                            return matchesSearch && matchesCourse;
                                                        });
                                                        if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                                        else setSelectedStaffIds(filtered.map(m => m.id));
                                                    }} className="px-3 py-1.5 bg-primary/[0.03] border border-primary/10 rounded-[8px] text-[10px] font-bold tracking-wide flex items-center gap-2 hover:bg-primary/[0.06] transition-colors text-primary shadow-sm">
                                                        <CheckSquare size={14} /> {selectedStaffIds.length > 0 ? 'Desmarcar' : 'Marcar Todos'}
                                                    </button>
                                                    {selectedStaffIds.length > 0 && (
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowDeleteConfirm('staff');
                                                        }} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-[10px] font-bold text-red-500 tracking-wide flex items-center gap-2 hover:bg-red-500/20 transition-colors shadow-sm">
                                                            <Trash2 size={14} /> Eliminar ({selectedStaffIds.length})
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="hidden md:flex items-center gap-1 p-1 rounded-[10px] bg-primary/[0.02] border border-primary/10 shadow-sm mr-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => setStaffViewStyle('grid')} className={`w-8 h-8 rounded-[6px] transition-all flex items-center justify-center ${staffViewStyle === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Cuadrícula">
                                                        <LayoutGrid size={16} />
                                                    </button>
                                                    <button onClick={() => setStaffViewStyle('list')} className={`w-8 h-8 rounded-[6px] transition-all flex items-center justify-center ${staffViewStyle === 'list' ? 'bg-white shadow-sm text-primary' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Lista">
                                                        <List size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {isStaffListExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                    </div>
                                </button>
                                {isStaffListExpanded && (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                        {staffViewStyle === 'grid' ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 content-start p-4 md:p-5 pb-20">
                                            {staff.filter(m => {
                                                const matchesSearch = !shootSearch || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(shootSearch.toLowerCase());
                                                const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                return matchesSearch && matchesCourse;
                                            }).map(member => {
                                                const isExpanded = expandedId === member.id;
                                                const isPhotoSelected = activeStudent?.id === member.id;
                                                const isBulkSelected = selectedStaffIds.includes(member.id);
                                                const hasPhoto = !!member.photoFile;
                                                return (
                                                    <div key={member.id} className="relative group/card">
                                                        <button onClick={() => selectStudent({ ...member, isStaff: true, studentName: member.name || `${member.firstName} ${member.lastName}` })} className={`w-full relative flex flex-col items-center p-4 rounded-[16px] border transition-all duration-300 active:scale-95 ${isPhotoSelected ? 'border-primary bg-primary/[0.03] shadow-md ring-2 ring-primary/20 z-10 scale-[1.02]' : isBulkSelected ? 'border-indigo-300 bg-indigo-50/30' : 'border-primary/10 bg-card hover:border-primary/30 hover:shadow-md'}`}>
                                                            <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center mb-3 overflow-hidden transition-all ${isPhotoSelected ? (hasPhoto ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-500') : isBulkSelected ? 'bg-indigo-100/50 text-indigo-500' : (hasPhoto ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500')}`}>
                                                                {hasPhoto ? <Camera size={20} /> : <Users size={20} />}
                                                            </div>
                                                            <p className="text-[11px] font-bold text-center text-primary leading-tight line-clamp-2 w-full uppercase">
                                                                {member.firstName ? `${member.firstName} ${member.lastName}` : member.name}
                                                            </p>
                                                            <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest mt-1">{member.role}</span>
                                                            
                                                            <div onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : member.id); }} className="absolute bottom-2 right-2 p-1 text-primary/20 hover:text-indigo-500 transition-colors">
                                                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                            </div>
                                                        </button>

                                                        {/* Checkbox para selección masiva en Grid (Docentes) */}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                                            }}
                                                            className={`absolute top-2 left-2 w-6 h-6 rounded-lg border transition-all flex items-center justify-center z-20 ${isBulkSelected ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' : 'bg-white/80 border-primary/10 text-primary/10 hover:border-indigo-300 opacity-0 group-hover/card:opacity-100 backdrop-blur-sm'}`}
                                                        >
                                                            <CheckSquare size={14} />
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="absolute top-full left-0 right-0 z-50 mt-2 p-4 bg-card border border-primary/10 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <div className="p-3 rounded-xl bg-primary/5 space-y-2 mb-3">
                                                                    <div className="flex justify-between items-center text-[9px]">
                                                                        <span className="font-black uppercase opacity-40">Clases</span>
                                                                        <span className="font-bold text-secondary text-right">{getStaffAssignments(member).map(a => `${a.course}${a.group ? ' ' + a.group : ''}`).join(', ') || 'Sin clases'}</span>
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
                                                                        firstName: member.firstName || member.name?.split(' ')[0] || '',
                                                                        lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
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
                                        ) : (
                                            <div className="w-full flex-1">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="bg-primary/5 sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 w-12 text-center">
                                                                <button onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const sq = (shootSearch || '').trim().toLowerCase();
                                                                    const filtered = staff.filter(m => {
                                                                        const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
                                                                        const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                                        return matchesSearch && matchesCourse;
                                                                    });
                                                                    if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                                                    else setSelectedStaffIds(filtered.map(m => m.id));
                                                                }} className="text-primary/40 hover:text-indigo-500 transition-colors">
                                                                    {selectedStaffIds.length > 0 && selectedStaffIds.length === staff.filter(m => {
                                                                        const sq = (shootSearch || '').trim().toLowerCase();
                                                                        const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
                                                                        const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                                        return matchesSearch && matchesCourse;
                                                                    }).length ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                                                                </button>
                                                            </th>
                                                            <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40">Docente</th>
                                                            <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40">Cargo / Dept.</th>
                                                            <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-center">Estado</th>
                                                            <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-right">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {staff.filter(m => {
                                                            const sq = (shootSearch || '').trim().toLowerCase();
                                                            const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
                                                            const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                            return matchesSearch && matchesCourse;
                                                        }).map(member => {
                                                            const isPhotoSelected = activeStudent?.id === member.id;
                                                            const isBulkSelected = selectedStaffIds.includes(member.id);
                                                            const hasPhoto = !!member.photoFile;
                                                            return (
                                                                <tr key={member.id} className={`border-b border-primary/5 hover:bg-primary/[0.01] transition-colors group ${isBulkSelected ? 'bg-indigo-50/70' : ''} ${isPhotoSelected ? 'ring-2 ring-inset ring-primary/50 bg-primary/[0.03]' : ''}`}>
                                                                    <td className="py-4 px-5 text-center align-middle">
                                                                        <button onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                                                        }} className="text-primary/20 hover:text-indigo-500 transition-colors">
                                                                            {isBulkSelected ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                                                                        </button>
                                                                    </td>
                                                                    <td className="py-4 px-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasPhoto ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/5 text-primary/30'}`}>
                                                                                {hasPhoto ? <Camera size={16} /> : <Users size={16} />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-black text-primary uppercase leading-tight">{member.firstName ? `${member.firstName} ${member.lastName}` : member.name}</p>
                                                                                <p className="text-[9px] font-bold text-primary/40 uppercase mt-1">{member.email || 'Sin email reg.'}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-5 align-middle">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[10px] font-bold text-secondary uppercase bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/5 inline-flex items-center w-fit">
                                                                                {member.role || 'Docente'}
                                                                            </span>
                                                                            {member.department && (
                                                                                <span className="text-[9px] font-bold text-primary/40 uppercase ml-1">{member.department}</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-5 text-center align-middle">
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            {hasPhoto ? (
                                                                                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20" title="Foto realizada">
                                                                                    <CheckCircle2 size={14} />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20" title="Sin foto">
                                                                                    <CameraOff size={14} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-5 text-right align-middle">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <button onClick={() => selectStudent({ ...member, isStaff: true, studentName: member.name || `${member.firstName} ${member.lastName}` })} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-colors border border-blue-100 tooltip-trigger shadow-sm" title="Modo Disparo">
                                                                                <Camera size={16} />
                                                                            </button>
                                                                            <button onClick={(e) => { e.stopPropagation(); setStaffToEdit(member); }} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm">
                                                                                Editar
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                {staff.filter(m => {
                                                    const sq = (shootSearch || '').trim().toLowerCase();
                                                    const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
                                                    const matchesCourse = !shootFilters.course || m.assignments?.some(a => getCourseBase(a.course) === shootFilters.course && (!shootFilters.group || getGroup(a.course) === shootFilters.group));
                                                    return matchesSearch && matchesCourse;
                                                }).length === 0 && (
                                                    <div className="p-8 text-center text-primary/40">
                                                        <p className="text-xs font-black uppercase tracking-widest">No hay docentes para mostrar</p>
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
                                            <div className="flex flex-col gap-2">
                                                {/* SELECTOR DE PAGO */}
                                                <div className="relative">
                                                    <div 
                                                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-2xl transition-all group/state ${showPaymentSelector ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                                                        onClick={() => {
                                                            setShowPaymentSelector(!showPaymentSelector);
                                                            setShowStatusSelector(false);
                                                        }}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeStudent.paymentMethod ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                            {activeStudent.paymentMethod ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-wider leading-none">
                                                                {activeStudent.paymentMethod ? 'Pagado' : 'Pendiente Pago'}
                                                            </p>
                                                            {activeStudent.paymentMethod && (
                                                                <p className="text-[9px] font-bold text-emerald-200/60 uppercase mt-1 tracking-widest">{activeStudent.paymentMethod}</p>
                                                            )}
                                                        </div>
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${showPaymentSelector ? 'rotate-180 text-emerald-400' : 'opacity-40'}`} />
                                                    </div>

                                                    {showPaymentSelector && (
                                                        <div className="mt-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                            {[
                                                                { id: '', label: 'Pendiente', color: 'text-rose-300', icon: AlertCircle },
                                                                { id: 'EFECTIVO', label: 'Efectivo', color: 'text-emerald-300', icon: CreditCard },
                                                                { id: 'TARJETA', label: 'Tarjeta', color: 'text-blue-300', icon: CreditCard },
                                                                { id: 'TRANSFERENCIA', label: 'Transferencia', color: 'text-indigo-300', icon: Database }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => handlePaymentChange(opt.id)}
                                                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-xl transition-all text-left group"
                                                                >
                                                                    <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${opt.color}`}>
                                                                        <opt.icon size={12} />
                                                                    </div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${opt.id === (activeStudent.paymentMethod || '') ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                    {opt.id === (activeStudent.paymentMethod || '') && (
                                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* SELECTOR DE ESTADO FOTO */}
                                                <div className="relative">
                                                    <div 
                                                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-2xl transition-all group/state ${showStatusSelector ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                                                        onClick={() => {
                                                            setShowStatusSelector(!showStatusSelector);
                                                            setShowPaymentSelector(false);
                                                        }}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeStudent.status === 'production' || activeStudent.photoFile ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                            <Camera size={16} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-wider leading-none">
                                                                {activeStudent.status === 'production' || activeStudent.photoFile ? 'Foto Realizada' : 'Foto Pendiente'}
                                                            </p>
                                                        </div>
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${showStatusSelector ? 'rotate-180 text-emerald-400' : 'opacity-40'}`} />
                                                    </div>

                                                    {showStatusSelector && (
                                                        <div className="mt-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                            {[
                                                                { id: 'Pendiente', label: 'Pendiente', color: 'text-amber-300', icon: Camera },
                                                                { id: 'production', label: 'Realizada', color: 'text-emerald-300', icon: CheckCircle2 }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => handleStatusChange(opt.id)}
                                                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-xl transition-all text-left group"
                                                                >
                                                                    <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${opt.color}`}>
                                                                        <opt.icon size={12} />
                                                                    </div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${opt.id === (activeStudent.status === 'production' || activeStudent.photoFile ? 'production' : 'Pendiente') ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                    {opt.id === (activeStudent.status === 'production' || activeStudent.photoFile ? 'production' : 'Pendiente') && (
                                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
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

            {/* MODAL CONFIRMACIÓN BORRADO MASIVO */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/10" onClick={e => e.stopPropagation()}>
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                                <Trash2 size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">¿Estás seguro?</h2>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                Estás a punto de eliminar {showDeleteConfirm === 'orders' ? selectedOrderIds.length : selectedStaffIds.length} {showDeleteConfirm === 'orders' ? 'alumnos' : 'docentes'} de forma permanente.
                            </p>
                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        if (showDeleteConfirm === 'orders') {
                                            deleteOrder(selectedOrderIds);
                                            setSelectedOrderIds([]);
                                        } else {
                                            deleteStaff(selectedStaffIds);
                                            setSelectedStaffIds([]);
                                        }
                                        setShowDeleteConfirm(null);
                                    }}
                                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                                >
                                    Sí, eliminar permanentemente
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all"
                                >
                                    No, cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default React.memo(ShootingPanel);
