import React from 'react';
import { Search, Tag, Users, DollarSign, Package, TrendingUp } from 'lucide-react';
import OrderRow from '../OrderRow.jsx';
import StatCard from '../StatCard.jsx';
import { getCourseBase, getGroup } from '../../utils/formatters.js';

const OrdersPanel = ({
    orders,
    filteredOrders,
    searchTerm,
    setSearchTerm,
    mobileOrdersFiltersOpen,
    setMobileOrdersFiltersOpen,
    adminSchool,
    setAdminSchool,
    schools,
    ordersFilters,
    setOrdersFilters,
    updateStatus,
    deleteOrder,
    setOrderToEdit,
    getSchoolName,
    stats
}) => {
    return (
        <div className="space-y-8">
            {/* 1. BLOQUE DE ALUMNOS (PRIMERO) */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-primary/5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Buscador: Siempre visible */}
                        <div className="md:col-span-4 relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                            <input
                                className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-primary placeholder-primary/30 outline-none focus:border-indigo-500/30 transition-all font-medium"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Toggle Filtros Móvil */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileOrdersFiltersOpen(!mobileOrdersFiltersOpen)}
                                className={`w-full py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileOrdersFiltersOpen ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20' : 'bg-primary/5 text-secondary border-primary/10'}`}
                            >
                                <Tag size={14} /> {mobileOrdersFiltersOpen ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                            </button>
                        </div>

                        {/* Selectores: Grid en escritorio, stack colapsable en móvil */}
                        <div className={`${mobileOrdersFiltersOpen ? 'grid animate-slide-up' : 'hidden md:grid'} md:col-span-8 grid-cols-2 md:grid-cols-4 gap-2 md:gap-3`}>
                            <div className="col-span-1">
                                <select value={adminSchool} onChange={e => setAdminSchool(e.target.value)} className="w-full bg-primary/5 border border-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl px-3 md:px-4 py-3 md:py-3 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] md:bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat min-h-[44px]">
                                    {schools.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <select value={ordersFilters.course} onChange={e => setOrdersFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl px-3 md:px-4 py-3 md:py-3 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] md:bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat min-h-[44px]">
                                    <option value="" className="text-slate-900">— Cursos —</option>
                                    {[...new Set(orders.map(o => getCourseBase(o.course)))].filter(Boolean).sort().map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <select value={ordersFilters.group} onChange={e => setOrdersFilters(p => ({ ...p, group: e.target.value }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl px-3 md:px-4 py-3 md:py-3 cursor-pointer outline-none uppercase hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] md:bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat min-h-[44px]">
                                    <option value="" className="text-slate-900">Grupo</option>
                                    {(ordersFilters.course
                                        ? [...new Set(orders.filter(o => getCourseBase(o.course) === ordersFilters.course).map(o => getGroup(o.course)))].filter(Boolean).sort()
                                        : [...new Set(orders.map(o => getGroup(o.course)))].filter(Boolean).sort()
                                    ).map(g => <option key={g} value={g} className="text-slate-900">{g}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <select value={ordersFilters.status} onChange={e => setOrdersFilters(p => ({ ...p, status: e.target.value }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl px-3 md:px-4 py-3 md:py-3 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] md:bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat min-h-[44px]">
                                    <option value="" className="text-slate-900">Estado</option>
                                    <option value="Pendiente" className="text-slate-900">Pendiente</option>
                                    <option value="Pagado" className="text-slate-900">Pagado</option>
                                    <option value="Producido" className="text-slate-900">Producido</option>
                                    <option value="Entregado" className="text-slate-900">Entregado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:grid grid-cols-[minmax(120px,1.5fr)_minmax(110px,1.2fr)_minmax(160px,2fr)_minmax(100px,1fr)_minmax(130px,1.5fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_70px] gap-2 px-4 py-2.5 bg-primary/3 border-b border-primary/5">
                        {['Alumno', 'Curso', 'Centro Educativo', 'Pack', 'Extras', 'Pago', 'Estado', ''].map((h, i) => (
                            <span key={i} className="text-[9px] font-black text-secondary uppercase tracking-widest text-center first:text-left last:text-right">{h}</span>
                        ))}
                    </div>
                    {filteredOrders.length === 0 ? <div className="py-16 text-center text-secondary font-semibold opacity-50">Sin resultados</div> : (
                        <div className="divide-y divide-primary/5">
                            {filteredOrders.map(order => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
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
                    )}
                </div>

                {/* 2. MÉTRICAS Y GRÁFICAS */}
                <div className="p-8 border-t border-primary/10">
                    <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <TrendingUp size={16} /> Resumen de Métricas
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        <StatCard icon={<Users size={14} />} label="Pedidos Totales" value={stats.count} color="indigo" />
                        <StatCard icon={<DollarSign size={14} />} label="Ingresos Brutos" value={`${stats.revenue.toFixed(0)}€`} color="blue" />
                        <StatCard icon={<Package size={14} />} label="Entregas Pendientes" value={stats.pending} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Donut mini */}
                        <div className="card p-5 flex flex-col items-center justify-center min-h-[140px]">
                            <h3 className="text-[9px] font-black text-secondary uppercase tracking-widest mb-4 opacity-50">Ventas Pack</h3>
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const packStats = orders.reduce((acc, o) => {
                                                const id = o.packId || 'esencial';
                                                acc[id] = (acc[id] || 0) + 1;
                                                return acc;
                                            }, {});
                                            const totalPacks = Object.values(packStats).reduce((a, b) => a + b, 0);
                                            let currentOffset = 0;
                                            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
                                            return Object.entries(packStats).map(([id, count], i) => {
                                                const percentage = (count / totalPacks) * 100;
                                                const dashArray = `${percentage} ${100 - percentage}`;
                                                const offset = -currentOffset;
                                                currentOffset += percentage;
                                                return <circle key={id} cx="50" cy="50" r="40" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="15" strokeDasharray={dashArray} strokeDashoffset={offset} />;
                                            });
                                        })()}
                                        <circle cx="50" cy="50" r="28" className="fill-card" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    {(() => {
                                        const packStats = orders.reduce((acc, o) => {
                                            const id = o.packId || 'esencial';
                                            acc[id] = (acc[id] || 0) + 1;
                                            return acc;
                                        }, {});
                                        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
                                        return Object.entries(packStats).slice(0, 3).map(([id, count], i) => (
                                            <div key={id} className="flex items-center gap-1.5 leading-none">
                                                <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter truncate w-16 opacity-60">{id}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Barras mini */}
                        <div className="card p-5 flex flex-col col-span-1 md:col-span-2 min-h-[140px]">
                            <h3 className="text-[9px] font-black text-secondary uppercase tracking-widest mb-4 opacity-50">Distribución por Nivel</h3>
                            <div className="flex-1 flex items-end gap-2 h-16">
                                {(() => {
                                    const courseStats = orders.reduce((acc, o) => {
                                        const level = o.course?.split(' ')[0] || 'S/D';
                                        acc[level] = (acc[level] || 0) + 1;
                                        return acc;
                                    }, {});
                                    const max = Math.max(...Object.values(courseStats), 1);
                                    return Object.entries(courseStats).slice(0, 10).map(([level, count]) => (
                                        <div key={level} className="flex-1 flex flex-col items-center gap-1.5 group">
                                            <div className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-md transition-all h-full flex items-end">
                                                <div className="w-full bg-indigo-500/40 rounded-t-md" style={{ height: `${(count / max) * 100}%` }} />
                                            </div>
                                            <span className="text-[7px] font-black text-secondary opacity-40 uppercase truncate w-full text-center tracking-tighter">{level}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Métrica Ticket Medio */}
                        <div className="card p-5 lg:col-span-3 min-h-[100px] flex items-center justify-between bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl border border-indigo-500/20 shadow-inner">🎫</div>
                                <div>
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">Ticket Medio de Venta</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black text-primary leading-none tracking-tighter">
                                            {stats.count > 0 ? (stats.revenue / stats.count).toFixed(2) : '0.00'}€
                                        </p>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Ratio Óptimo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block text-right">
                                <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40 mb-1">Cálculo en tiempo real</p>
                                <p className="text-[10px] font-bold text-primary/60 italic">Ingresos brutos ÷ nº alumnos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPanel;
