import React, { useState, useMemo } from 'react';
import { Search, List, LayoutGrid, ChevronDown, Trash2, ArrowRight } from 'lucide-react';
import OrderRow from '../OrderRow.jsx';
import { getCourseBase, getGroup } from '../../utils/formatters.js';
import Swal from 'sweetalert2';

export default function OrdersPanel({
    orders,
    filteredOrders,
    searchTerm,
    setSearchTerm,
    adminSchool,
    setAdminSchool,
    schools,
    ordersFilters,
    setOrdersFilters,
    updateStatus,
    deleteOrder,
    setOrderToEdit,
    getSchoolName,
    moveToSchool
}) {
    const [viewMode, setViewMode] = useState('list');
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        }
    };

    const handleMoveToSchoolAction = async () => {
        if (selectedOrderIds.length === 0) {
            Swal.fire('Atención', 'Selecciona primero los alumnos que deseas mover.', 'info');
            return;
        }

        const schoolOptions = {};
        schools.forEach(s => {
            if (s.id !== adminSchool) {
                schoolOptions[s.id] = s.name;
            }
        });

        const { value: targetSchoolId } = await Swal.fire({
            title: 'Traspasar Alumnos',
            html: `Vas a mover <b>${selectedOrderIds.length}</b> alumnos al centro seleccionado.<br/><br/>Esto corregirá su ubicación en la base de datos.`,
            input: 'select',
            inputOptions: schoolOptions,
            inputPlaceholder: 'Seleccionar centro de destino...',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Mover ahora',
            cancelButtonText: 'Cancelar'
        });

        if (targetSchoolId) {
            Swal.fire({ title: 'Moviendo...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
            try {
                await moveToSchool(selectedOrderIds, targetSchoolId);
                setSelectedOrderIds([]);
                Swal.fire('¡Éxito!', 'Los alumnos han sido trasladados correctamente.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudieron mover los registros.', 'error');
            }
        }
    };

    return (
        <div className="bg-card rounded-[30px] border border-primary/10 shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 md:p-8 space-y-6">
                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/5 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Gestión de Alumnos</h2>
                        <p className="text-[10px] text-secondary font-bold uppercase opacity-60 tracking-widest mt-1">Listado, filtros y estados de pedido</p>
                    </div>
                </div>

                {/* Filtros Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-3 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                        <input
                            className="input-dark w-full pl-12 pr-4 py-3.5 text-xs font-medium"
                            placeholder="Buscar alumno..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-5 gap-2">
                        <select value={adminSchool} onChange={e => setAdminSchool(e.target.value)} className="input-dark text-[10px] md:text-xs font-bold py-3.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.8rem_center] bg-no-repeat">
                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select value={ordersFilters.course} onChange={e => setOrdersFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="input-dark text-[10px] md:text-xs font-bold py-3.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.8rem_center] bg-no-repeat">
                            <option value="">— Cursos —</option>
                            {[...new Set(orders.map(o => getCourseBase(o.course)))].filter(Boolean).sort().map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={ordersFilters.group} onChange={e => setOrdersFilters(p => ({ ...p, group: e.target.value }))} className="input-dark text-[10px] md:text-xs font-bold py-3.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.8rem_center] bg-no-repeat">
                            <option value="">Grupo</option>
                            {(ordersFilters.course
                                ? [...new Set(orders.filter(o => getCourseBase(o.course) === ordersFilters.course).map(o => getGroup(o.course)))].filter(Boolean).sort()
                                : [...new Set(orders.map(o => getGroup(o.course)))].filter(Boolean).sort()
                            ).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select value={ordersFilters.status} onChange={e => setOrdersFilters(p => ({ ...p, status: e.target.value }))} className="input-dark text-[10px] md:text-xs font-bold py-3.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.8rem_center] bg-no-repeat">
                            <option value="">Estado</option>
                            {['Pendiente', 'Pagado', 'Producido', 'Entregado'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
                            <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary opacity-40 hover:opacity-100'}`}>
                                <List size={16} />
                            </button>
                            <button onClick={() => setViewMode('grid')} className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary opacity-40 hover:opacity-100'}`}>
                                <LayoutGrid size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selección masiva Info */}
                {selectedOrderIds.length > 0 && (
                    <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl animate-fade-in">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedOrderIds.length} Alumnos seleccionados</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={handleMoveToSchoolAction}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                            >
                                <ArrowRight size={14} />
                                <span>Traspasar a otro centro</span>
                            </button>
                            <button
                                onClick={() => setSelectedOrderIds([])}
                                className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Cabecera Tabla escritorio */}
                {viewMode === 'list' && (
                    <div className="hidden sm:grid grid-cols-[40px_minmax(120px,1.5fr)_minmax(110px,1.2fr)_minmax(160px,2fr)_minmax(100px,1fr)_minmax(130px,1.5fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_70px] gap-2 px-8 py-2.5 bg-primary/3 border-y border-primary/5">
                        <div className="flex justify-center">
                            <input
                                type="checkbox"
                                checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-primary/20 accent-indigo-500 cursor-pointer"
                            />
                        </div>
                        {['Alumno', 'Curso', 'Centro Educativo', 'Pack', 'Extras', 'Pago', 'Estado', ''].map((h, i) => (
                            <span key={i} className="text-[9px] font-black text-secondary tracking-widest uppercase text-center first:text-left last:text-right opacity-50">{h}</span>
                        ))}
                    </div>
                )}

                {filteredOrders.length === 0 ? <div className="py-24 text-center text-secondary font-black uppercase tracking-[0.3em] opacity-20">No hay registros</div> : (
                    viewMode === 'list' ? (
                        <div className="divide-y divide-primary/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {filteredOrders.map(order => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    isSelected={selectedOrderIds.includes(order.id)}
                                    onSelect={(selected) => setSelectedOrderIds(prev => selected ? [...prev, order.id] : prev.filter(id => id !== order.id))}
                                    onStatusChange={(s) => updateStatus(order.id, s)}
                                    onDelete={() => deleteOrder(order.id)}
                                    onEdit={(o) => setOrderToEdit({
                                        ...o,
                                        tempPhotoFile: o.photoFile || '',
                                        tempStatus: o.status || 'Pendiente',
                                        tempPayment: o.paymentMethod || 'Efectivo',
                                        tempCourse: getCourseBase(o.course),
                                        tempGroup: getGroup(o.course),
                                        packId: o.pack?.id || o.packId || (typeof o.pack === 'string' ? o.pack : 'esencial'),
                                        packQuantity: o.packQuantity || 1,
                                        schoolName: o.schoolName || getSchoolName(o.schoolId)
                                    })}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
                            {filteredOrders.map(order => (
                                <div key={order.id} className="bg-primary/3 rounded-2xl p-4 border border-primary/5">
                                     <div className="flex justify-between items-start mb-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order.id)}
                                            onChange={(e) => setSelectedOrderIds(prev => e.target.checked ? [...prev, order.id] : prev.filter(id => id !== order.id))}
                                            className="w-4 h-4 rounded border-primary/20 accent-indigo-500 cursor-pointer"
                                        />
                                        <div className={`w-3 h-3 rounded-full ${order.status === 'Pagado' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_rgba(16,185,129,0.3)]`} />
                                    </div>
                                    <p className="text-[11px] font-black text-primary uppercase truncate">{order.studentName}</p>
                                    <p className="text-[9px] text-secondary font-bold opacity-60 truncate mt-1">{order.course}</p>
                                    <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center">
                                        <span className="text-[9px] font-black text-indigo-500 uppercase">{typeof order.pack === 'object' ? order.pack.label : order.pack}</span>
                                        <div className="flex gap-1">
                                             <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-secondary/40 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
