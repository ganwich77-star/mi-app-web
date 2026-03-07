import React from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users
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
    // Lógica de filtrado de alumnos
    let shootOrders = [...orders];
    if (shootFilters.course) shootOrders = shootOrders.filter(o => getCourseBase(o.course) === shootFilters.course);
    if (shootFilters.group) shootOrders = shootOrders.filter(o => getGroup(o.course) === shootFilters.group);
    if (shootFilters.status) shootOrders = shootOrders.filter(o => (o.status || 'Pendiente') === shootFilters.status);

    const q = shootSearch.trim().toLowerCase();
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
    const activeCourses = availCourses.filter(c => orders.some(o => getCourseBase(o.course) === c.name));
    const selCourse = availCourses.find(c => c.name === shootFilters.course);
    const availGroups = selCourse?.lines || [];

    // Lógica para Personal Docente
    const getStaffAssignments = (m) => m.assignments && m.assignments.length > 0 ? m.assignments : (m.course ? [{ course: m.course, group: m.group }] : []);

    const sqStaff = shootSearch.trim().toLowerCase();
    const filteredStaff = staff.filter(m => {
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
            {/* Toggle modo */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 bg-primary/2 p-1.5 rounded-[22px] border border-primary/10 w-full lg:w-fit shadow-inner">
                    <button onClick={() => setShootMode('students')} className={`flex-1 lg:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shootMode === 'students' ? 'bg-emerald-500 text-white shadow-lg' : 'text-secondary hover:text-primary opacity-60'} min-h-[44px]`}>
                        <span className="text-sm md:text-base">👧</span> Alumnos {orders.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[9px]">{orders.length}</span>}
                    </button>
                    <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`flex-1 lg:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shootMode === 'staff' ? 'bg-indigo-500 text-white shadow-lg' : 'text-secondary hover:text-primary opacity-60'} min-h-[44px]`}>
                        <span className="text-sm md:text-base">👨‍🏫</span> Equipo {staff.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[9px]">{staff.length}</span>}
                    </button>
                </div>
                <button onClick={downloadMasterBackup} className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500/20 transition-all active:scale-95 shadow-sm min-h-[44px]">
                    <Database size={16} /> Backup SOS
                </button>
            </div>

            {shootMode === 'students' && (
                <>
                    <div className="card p-4 md:p-6 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <label className="text-[8px] font-black text-secondary uppercase mb-1 ml-1 block opacity-50">Curso</label>
                                <select value={shootFilters.course} onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-black rounded-xl px-4 py-3.5 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat min-h-[48px]">
                                    <option value="">— Cursos ativos ({activeCourses.length}) —</option>
                                    {activeCourses.map(c => <option key={c.name} value={c.name} className="bg-card text-primary">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="text-[8px] font-black text-secondary uppercase mb-1 ml-1 block opacity-50">Grupo</label>
                                <select value={shootFilters.group} onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-black rounded-xl px-4 py-3.5 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat min-h-[48px]">
                                    <option value="">— Todos —</option>
                                    {availGroups.map(g => <option key={g} value={g} className="bg-card text-primary">Grupo {g}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="text-[8px] font-black text-secondary uppercase mb-1 ml-1 block opacity-50">Estado</label>
                                <select value={shootFilters.status} onChange={e => setShootFilters(p => ({ ...p, status: e.target.value }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-black rounded-xl px-4 py-3.5 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat min-h-[48px]">
                                    <option value="">— Todos —</option>
                                    <option value="Pendiente" className="bg-card text-primary">Pendiente</option>
                                    <option value="Pagado" className="bg-card text-primary">Pagado</option>
                                    <option value="Producido" className="bg-card text-primary">Producido</option>
                                    <option value="Entregado" className="bg-card text-primary">Entregado</option>
                                </select>
                            </div>
                        </div>
                        {/* Barra de progreso de ancho completo */}
                        <div className="mt-4 pt-4 border-t border-primary/5">
                            <div className="flex justify-between text-[10px] font-black text-secondary mb-2">
                                <span>Progreso alumnos</span>
                                <span className={pctOrders === 100 ? 'text-emerald-500' : 'text-red-700'}>{doneOrders}/{totalOrders} · {pctOrders}%</span>
                            </div>
                            <div className="h-2.5 bg-primary/10 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full bg-gradient-to-r rounded-full transition-all duration-700 ease-out shadow-lg ${pctOrders === 100 ? 'from-emerald-600 to-emerald-400' : 'from-red-800 to-red-600'}`} style={{ width: `${pctOrders}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="card p-4 bg-red-700/3 border-red-700/10 mb-4 space-y-3 animate-fade-in">
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none">Alta rápida (Sin pedido previo)</p>
                        <div className="flex gap-2">
                            <input type="text" value={newStudentForm.name}
                                onChange={e => setNewStudentForm(p => ({ ...p, name: e.target.value }))}
                                onBlur={e => setNewStudentForm(p => ({ ...p, name: toTitleCase(e.target.value) }))}
                                placeholder="Nombre completo del alumno" className="flex-1 bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-red-500/50 transition-all font-bold" />
                            <div className="relative w-full sm:w-[220px]">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 opacity-50" />
                                <input type="tel" value={newStudentForm.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                                        setNewStudentForm(p => ({ ...p, phone: val }));
                                    }}
                                    placeholder="Teléfono móvil"
                                    className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl pl-9 pr-12 py-3 outline-none focus:border-red-500/50 transition-all font-bold" />
                                {newStudentForm.phone.length === 9 && (
                                    <button
                                        onClick={() => {
                                            const msg = `Hola ${newStudentForm.name} 👋\n\nConfirmación de Pedido - Pujalte Studio\n\n¡En breve te enviaremos los detalles! 📷`;
                                            window.open(`https://wa.me/34${newStudentForm.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600 transition-colors"
                                    >
                                        <MessageSquare size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <select value={newStudentForm.schoolId || adminSchool} onChange={e => {
                                const sid = e.target.value;
                                setNewStudentForm(p => ({ ...p, schoolId: sid }));
                                setAdminSchool(sid);
                            }} className="flex-1 min-w-[150px] bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-2.5 cursor-pointer outline-none transition-colors focus:border-red-500/50">
                                <option value="" className="text-primary">— Centro —</option>
                                {sortedSchools.map(s => <option key={s.id} value={s.id} className="text-primary">{s.name}</option>)}
                            </select>
                            <select value={newStudentForm.course} onChange={e => setNewStudentForm(p => ({ ...p, course: e.target.value }))} className="flex-1 min-w-[140px] bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-2.5 cursor-pointer outline-none transition-colors focus:border-red-500/50">
                                <option value="" className="text-primary">— Curso —</option>
                                {availCourses.map(c => <option key={c.name} value={c.name} className="text-primary">{c.name}</option>)}
                            </select>
                            <select value={newStudentForm.group} onChange={e => setNewStudentForm(p => ({ ...p, group: e.target.value }))} className="w-[85px] bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-2 py-2.5 cursor-pointer uppercase outline-none focus:border-red-500/50">
                                <option value="" className="text-primary">GRUPO</option>
                                <option value="A" className="text-primary">A</option>
                                <option value="B" className="text-primary">B</option>
                                <option value="C" className="text-primary">C</option>
                                <option value="D" className="text-primary">D</option>
                            </select>
                            <input type="text" value={newStudentForm.photoFile} onChange={e => setNewStudentForm(p => ({ ...p, photoFile: e.target.value }))}
                                placeholder="Nº FOTO (ej: 001)" className="w-[130px] bg-primary/5 border border-primary/20 text-primary text-[10px] font-black rounded-xl px-3 py-2.5 outline-none placeholder-primary/40 focus:border-red-700/50 uppercase tracking-tighter" />
                            <select value={newStudentForm.status} onChange={e => setNewStudentForm(p => ({ ...p, status: e.target.value }))} className={`w-[110px] text-[10px] font-black rounded-xl px-2 py-2.5 border cursor-pointer outline-none transition-all ${newStudentForm.status === 'Pagado' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-600'}`}>
                                <option value="Pendiente">PENDIENTE</option>
                                <option value="Pagado">PAGADO</option>
                            </select>
                            <select value={newStudentForm.paymentMethod} onChange={e => setNewStudentForm(p => ({ ...p, paymentMethod: e.target.value }))} className="w-[150px] bg-primary/10 border border-primary/20 text-white text-[10px] font-black rounded-xl px-2 py-2.5 cursor-pointer uppercase outline-none focus:border-red-700/50">
                                <option value="" disabled className="text-primary">FORMA DE PAGO</option>
                                <option value="Efectivo" className="text-primary">Efectivo</option>
                                <option value="Bizum" className="text-primary">Bizum</option>
                            </select>
                            <button
                                disabled={!newStudentForm.name.trim() || !newStudentForm.course || (newStudentForm.phone && newStudentForm.phone.length < 9)}
                                onClick={() => {
                                    const fullCourse = `${newStudentForm.course}${newStudentForm.group ? ' ' + newStudentForm.group.toUpperCase() : ''}`;
                                    const sid = newStudentForm.schoolId || adminSchool;
                                    const newOrder = {
                                        studentName: newStudentForm.name,
                                        schoolId: sid,
                                        schoolName: schools.find(s => s.id === sid)?.name || '',
                                        course: fullCourse,
                                        pack: { id: 'manual', label: 'PENDIENTE' },
                                        packQuantity: 1,
                                        extras: [],
                                        paymentMethod: newStudentForm.paymentMethod,
                                        status: newStudentForm.status,
                                        total: 0,
                                        cost: 0,
                                        photoFile: newStudentForm.photoFile,
                                        phone: newStudentForm.phone,
                                        id: `MANUAL_${Date.now()}`,
                                        timestamp: Date.now()
                                    };
                                    addOrder(newOrder);
                                    setNewStudentForm({ schoolId: '', name: '', course: '', group: '', phone: '', photoFile: '', status: 'Pendiente', paymentMethod: '' });
                                }}
                                className="flex-1 sm:flex-none bg-red-700 text-white font-black text-[10px] rounded-xl px-6 py-2.5 hover:bg-red-800 transition-all active:scale-95 disabled:opacity-30 shadow-sm shadow-red-700/20 whitespace-nowrap">GUARDAR ALUMNO</button>
                        </div>
                    </div>

                    {/* Buscador alumnos */}
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-primary/5 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1">
                                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                                    <input type="text" lang="es" value={shootSearch} onChange={e => { setShootSearch(e.target.value); setSelectedOrderIds([]); }}
                                        placeholder="Escribe nombre o apellido para encontrar al alumno..."
                                        className="w-full bg-primary/5 border-2 border-red-700/30 focus:border-red-700 rounded-2xl pl-12 pr-4 py-4 text-base text-primary placeholder-primary/30 outline-none font-medium transition-colors" />
                                </div>
                                {visibleOrders.length > 0 && (
                                    <button onClick={() => {
                                        if (selectedOrderIds.length === visibleOrders.length) setSelectedOrderIds([]);
                                        else setSelectedOrderIds(visibleOrders.map(o => o.id));
                                    }} className="px-4 py-4 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                        {selectedOrderIds.length === visibleOrders.length ? <CheckSquare size={16} className="text-red-700" /> : <Square size={16} />}
                                        <span className="hidden sm:inline">Todos</span>
                                    </button>
                                )}
                            </div>

                            {selectedOrderIds.length > 0 && (
                                <div className="flex items-center justify-between bg-red-700/10 p-3 rounded-xl border border-red-700/20 animate-fade-in">
                                    <p className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
                                        <Trash2 size={14} /> {selectedOrderIds.length} seleccionados
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedOrderIds([])} className="px-3 py-1.5 text-[10px] font-black uppercase text-secondary hover:text-primary">Cancelar</button>
                                        <button onClick={() => {
                                            if (confirm(`¿Estás seguro de que quieres borrar ${selectedOrderIds.length} alumnos? Esta acción no se puede deshacer.`)) {
                                                selectedOrderIds.forEach(id => deleteOrder(id));
                                                setSelectedOrderIds([]);
                                            }
                                        }} className="px-4 py-1.5 bg-red-700 text-white text-[10px] font-black uppercase rounded-lg shadow-sm shadow-red-700/20 active:scale-95 transition-all">Borrar permanentemente</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="divide-y divide-primary/5 max-h-[55vh] overflow-y-auto">
                            {visibleOrders.length === 0
                                ? <div className="py-16 text-center text-secondary font-semibold opacity-50">{totalOrders === 0 ? 'Sin pedidos registrados' : 'Sin resultados'}</div>
                                : visibleOrders.map(order => (
                                    <div key={order.id} className="w-full flex items-center hover:bg-red-700/5 transition-colors group">
                                        <button
                                            onClick={() => {
                                                setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                                            }}
                                            className="pl-5 py-6 flex-shrink-0"
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedOrderIds.includes(order.id) ? 'bg-red-700 border-red-700 text-white' : 'border-primary/20 bg-primary/5 text-transparent'}`}>
                                                <CheckCircle size={14} strokeWidth={3} />
                                            </div>
                                        </button>
                                        <div className="flex-1 flex items-center gap-4 px-3 py-4">
                                            {/* Icono de Estado Interactivo */}
                                            <div className="relative z-20 shrink-0">
                                                <select
                                                    value={order.status || 'Pendiente'}
                                                    onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                >
                                                    <option value="Pendiente">Pendiente 📷</option>
                                                    <option value="Pagado">Pagado ✅</option>
                                                    <option value="Producido">Producido 📦</option>
                                                    <option value="Entregado">Entregado 🏁</option>
                                                </select>
                                                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all duration-300 border ${order.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                                                    order.status === 'Producido' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' :
                                                        order.status === 'Entregado' ? 'bg-slate-500/10 text-secondary border-slate-500/30' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                                    }`}>
                                                    {order.status === 'Pagado' ? '✅' :
                                                        order.status === 'Producido' ? '📦' :
                                                            order.status === 'Entregado' ? '🏁' : '📷'}
                                                </span>
                                            </div>

                                            {/* Botón WhatsApp independiente */}
                                            {order.phone && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const packsDesc = typeof order.pack === 'object' ? order.pack.label : (PACKS.find(p => p.id === order.pack)?.name || order.pack || 'Personalizado');
                                                        const msg = `Hola ${order.studentName} 👋\n\n` +
                                                            `🎓 *Confirmación de Pedido - Pujalte Studio*\n\n` +
                                                            `🏫 *Centro:* ${order.schoolName}\n` +
                                                            `📚 *Curso:* ${order.course}\n` +
                                                            `📦 *Pack:* ${packsDesc}\n` +
                                                            `💰 *Estado:* ${order.status.toUpperCase()}\n` +
                                                            `💳 *Pago:* ${order.paymentMethod || 'Efectivo'}\n\n` +
                                                            `¡Gracias por confiar en nosotros! 📷`;
                                                        window.open(`https://wa.me/34${order.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                                    }}
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all active:scale-90 shrink-0"
                                                    title="Enviar recibo por WhatsApp"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            )}

                                            {/* Botón de Edición (Cuerpo principal) */}
                                            <button
                                                onClick={() => setOrderToEdit({
                                                    ...order,
                                                    tempPhotoFile: order.photoFile || '',
                                                    tempStatus: order.status || 'Pendiente',
                                                    tempPayment: order.paymentMethod || 'Efectivo',
                                                    tempCourse: getCourseBase(order.course),
                                                    tempGroup: getGroup(order.course),
                                                    packId: order.pack?.id || order.packId || (typeof order.pack === 'string' ? order.pack : 'esencial'),
                                                    packQuantity: order.packQuantity || 1,
                                                    schoolName: order.schoolName || getSchoolName(order.schoolId)
                                                })}
                                                className="flex-1 flex items-center justify-between gap-4 text-left"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-primary truncate leading-none">{order.studentName}</p>
                                                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter shrink-0">{order.total || 0}€</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-secondary flex items-center gap-2 mt-1">
                                                        <span className="text-indigo-400 uppercase tracking-widest text-[9px]">{order.schoolName || getSchoolName(order.schoolId)}</span>
                                                        <span className="w-1 h-1 bg-secondary/20 rounded-full"></span>
                                                        <span className="opacity-70">{order.course}</span>
                                                        <span className="w-1 h-1 bg-secondary/20 rounded-full"></span>
                                                        <span className="text-[8px] font-black text-indigo-400 bg-indigo-400/10 px-1 py-0.5 rounded border border-indigo-400/20 uppercase truncate max-w-[80px]">{(typeof order.pack === 'object' ? order.pack.label : order.pack) || 'SIN PACK'}</span>
                                                    </p>
                                                </div>
                                                {order.photoFile
                                                    ? <span className="text-xs font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex-shrink-0">{order.photoFile}</span>
                                                    : <span className="text-[10px] font-black text-secondary opacity-0 group-hover:opacity-40 transition-all shrink-0">TAP →</span>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
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
                                            const sq = shootSearch.trim().toLowerCase();
                                            const filtered = sq ? staff.filter(m => m.name.toLowerCase().includes(sq)) : staff;
                                            if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                            else setSelectedStaffIds(filtered.map(m => m.id));
                                        }} className="px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                            {selectedStaffIds.length > 0 && selectedStaffIds.length === (shootSearch.trim() ? staff.filter(m => m.name.toLowerCase().includes(shootSearch.trim().toLowerCase())).length : staff.length) ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />}
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
                                        <select value={newStaffForm.tempGroup} onChange={e => setNewStaffForm(p => ({ ...p, tempGroup: e.target.value }))} className="w-12 bg-primary/5 border border-primary/10 text-[9px] font-bold rounded-lg px-1 py-1.5 outline-none">
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
                                        photoFile: newStaffForm.photoFile
                                    });
                                    setNewStaffForm({ schoolId: '', name: '', role: '', roles: [], tempRole: '', photoFile: '', tempCourse: '', tempGroup: '', assignments: [] });
                                }}
                                className="w-full bg-red-700 text-white font-black text-[10px] rounded-xl py-2.5 hover:bg-red-800 transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-red-700/20 uppercase tracking-widest">
                                GUARDAR FICHA PERSONAL
                            </button>
                        </div>
                    </div>
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-primary/5 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                                    <input type="text" lang="es" value={shootSearch} onChange={e => { setShootSearch(e.target.value); setSelectedStaffIds([]); }}
                                        placeholder="Buscar por nombre..."
                                        className="w-full bg-primary/5 border border-indigo-400/20 focus:border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder-primary/30 outline-none transition-colors" />
                                </div>
                                {staff.length > 0 && (
                                    <button onClick={() => {
                                        const filtered = shootSearch.trim() ? staff.filter(m => m.name.toLowerCase().includes(shootSearch.trim().toLowerCase())) : staff;
                                        if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                        else setSelectedStaffIds(filtered.map(m => m.id));
                                    }} className="px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                        {selectedStaffIds.length > 0 && selectedStaffIds.length === (shootSearch.trim() ? staff.filter(m => m.name.toLowerCase().includes(shootSearch.trim().toLowerCase())).length : staff.length) ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />}
                                        <span className="hidden sm:inline">Todos</span>
                                    </button>
                                )}
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
                        <div className="divide-y divide-primary/5 max-h-[55vh] overflow-y-auto">
                            {filteredStaff.length === 0
                                ? <div className="py-16 text-center text-secondary font-semibold opacity-50">{staff.length === 0 ? 'Sin personal registrado' : 'Sin resultados'}</div>
                                : [...filteredStaff].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })).map(member => (
                                    <div key={member.id} className="w-full flex items-center hover:bg-indigo-500/3 transition-colors group">
                                        <button
                                            onClick={() => {
                                                setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                            }}
                                            className="pl-5 py-6 flex-shrink-0"
                                        >
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedStaffIds.includes(member.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-primary/20 bg-primary/5 text-transparent'}`}>
                                                <CheckCircle size={12} strokeWidth={3} />
                                            </div>
                                        </button>
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
                                                tempFile: member.photoFile || ''
                                            });
                                        }}
                                            className="flex-1 flex items-center gap-4 px-3 py-4 text-left">
                                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${member.photoFile ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/5 text-secondary'}`}>
                                                {member.photoFile ? '✅' : '👤'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-black text-primary truncate">{member.name}</p>
                                                    {member.photoFile && (
                                                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 px-2 py-0.5 rounded-md leading-none">{member.photoFile}</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-secondary flex items-center gap-2">
                                                    <span className="text-violet-500 uppercase tracking-widest text-[9px] truncate max-w-[120px]">{member.role}</span>
                                                    <span className="w-1 h-1 bg-secondary/20 rounded-full"></span>
                                                    <span className="opacity-60 truncate">
                                                        {getStaffAssignments(member).map(a => `${a.course}${a.group ? ' ' + a.group : ''}`).join(', ') || 'Sin clases'}
                                                    </span>
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-secondary opacity-0 group-hover:opacity-40 transition-all shrink-0">EDITAR →</span>
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(ShootingPanel);
