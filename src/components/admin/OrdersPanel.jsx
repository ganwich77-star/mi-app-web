import { Search, Tag, Users, DollarSign, Package, TrendingUp, LayoutGrid, List, Trash2, ChevronDown } from 'lucide-react';
import OrderRow from '../OrderRow.jsx';
import StatCard from '../StatCard.jsx';
import { getCourseBase, getGroup } from '../../utils/formatters.js';
import { useState } from 'react';

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
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [ordersOpen, setOrdersOpen] = useState(true);
    const [metricsOpen, setMetricsOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* 1. ISLA DE GESTIÓN DE PEDIDOS */}
            <div className={`card overflow-hidden transition-all duration-500 ${ordersOpen ? 'ring-2 ring-indigo-500/20 shadow-2xl' : 'hover:ring-1 hover:ring-indigo-500/10 shadow-lg'}`}>
                {/* Header Isla Pedidos */}
                <div
                    onClick={() => setOrdersOpen(!ordersOpen)}
                    className={`flex items-center justify-between p-7 cursor-pointer transition-all ${ordersOpen ? 'bg-indigo-500/5' : 'hover:bg-primary/2'}`}
                >
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${ordersOpen ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Gestión de Alumnos</h3>
                            <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Listado, filtros y estados de pedido</p>
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${ordersOpen ? 'bg-indigo-500/20 text-indigo-400 rotate-180' : 'bg-primary/5 text-secondary'}`}>
                        <ChevronDown size={22} />
                    </div>
                </div>

                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${ordersOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 border-t border-primary/5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                            {/* Buscador */}
                            <div className="md:col-span-3 relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                                <input
                                    className="input-dark w-full pl-12 pr-4 py-3.5 text-xs font-medium"
                                    placeholder="Buscar alumno..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Selectores */}
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

                                {/* Selector Vista (Ahora a la derecha) */}
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

                        {/* Cabecera Tabla escritorio */}
                        {viewMode === 'list' && (
                            <div className="hidden sm:grid grid-cols-[minmax(120px,1.5fr)_minmax(110px,1.2fr)_minmax(160px,2fr)_minmax(100px,1fr)_minmax(130px,1.5fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_70px] gap-2 px-8 py-2.5 bg-primary/3 border-y border-primary/5">
                                {['Alumno', 'Curso', 'Centro Educativo', 'Pack', 'Extras', 'Pago', 'Estado', ''].map((h, i) => (
                                    <span key={i} className="text-[9px] font-black text-secondary tracking-widest uppercase text-center first:text-left last:text-right opacity-50">{h}</span>
                                ))}
                            </div>
                        )}

                        {filteredOrders.length === 0 ? <div className="py-24 text-center text-secondary font-black uppercase tracking-[0.3em] opacity-20">No hay registros</div> : (
                            viewMode === 'list' ? (
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
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 bg-black/5">
                                    {filteredOrders.map(order => (
                                        <div key={order.id} className="bg-primary/2 border border-primary/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group relative overflow-hidden">
                                            <div className="absolute top-4 right-4">
                                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        order.status === 'Producido' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            order.status === 'Entregado' ? 'bg-slate-500/10 text-secondary border border-slate-500/20' :
                                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                    {order.status || 'Pendiente'}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">🎓</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-primary truncate tracking-tight">{order.studentName}</h4>
                                                    <p className="text-[10px] font-bold text-secondary opacity-60 truncate uppercase tracking-widest">{order.course}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 py-2">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-secondary/60">
                                                    <span className="uppercase tracking-widest">Pack:</span>
                                                    <span className="text-primary font-black uppercase">{typeof order.pack === 'string' ? order.pack : order.pack?.label || 'Estandar'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] font-bold text-secondary/60">
                                                    <span className="uppercase tracking-widest">Pago:</span>
                                                    <span className="text-indigo-400 font-black tracking-widest uppercase">{order.paymentMethod || '—'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-2 pt-4 border-t border-primary/5">
                                                <button
                                                    onClick={() => setOrderToEdit({ ...order, schoolName: order.schoolName || getSchoolName(order.schoolId) })}
                                                    className="flex-1 py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                                                >
                                                    EDITAR
                                                </button>
                                                <button onClick={() => { if (confirm('¿Eliminar pedido?')) deleteOrder(order.id) }} className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* 2. ISLA DE MÉTRICAS */}
            <div className={`card overflow-hidden transition-all duration-500 ${metricsOpen ? 'ring-2 ring-emerald-500/20 shadow-2xl' : 'hover:ring-1 hover:ring-emerald-500/10 shadow-lg'}`}>
                {/* Header Isla Métricas */}
                <div
                    onClick={() => setMetricsOpen(!metricsOpen)}
                    className={`flex items-center justify-between p-7 cursor-pointer transition-all ${metricsOpen ? 'bg-emerald-500/5' : 'hover:bg-primary/2'}`}
                >
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${metricsOpen ? 'bg-emerald-600 text-white scale-110 rotate-3' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-primary tracking-tight">Estadísticas y Métricas</h3>
                            <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Rendimiento, ingresos y ticket medio</p>
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${metricsOpen ? 'bg-emerald-500/20 text-emerald-400 rotate-180' : 'bg-primary/5 text-secondary'}`}>
                        <ChevronDown size={22} />
                    </div>
                </div>

                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${metricsOpen ? 'max-h-[2000px] opacity-100 p-8 pt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                        <StatCard icon={<Users size={16} />} label="Alumnos Inscritos" value={stats.count} color="indigo" />
                        <StatCard icon={<DollarSign size={16} />} label="Total Facturado" value={`${stats.revenue.toFixed(0)}€`} color="emerald" />
                        <StatCard icon={<Package size={16} />} label="Pdte. Producción" value={stats.pending} color="amber" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gráficos y Ticket Medio integrados... (manteniendo lógica previa) */}
                        <div className="card p-6 bg-primary/2 flex flex-col items-center justify-center min-h-[160px]">
                            <h3 className="text-[9px] font-black text-secondary uppercase tracking-widest mb-6 opacity-50">Distribución de Ventas</h3>
                            <div className="flex items-center gap-8">
                                <div className="relative w-24 h-24">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const packStats = orders.reduce((acc, o) => {
                                                const id = o.packId || 'esencial';
                                                acc[id] = (acc[id] || 0) + 1;
                                                return acc;
                                            }, {});
                                            const totalPacks = Object.values(packStats).reduce((a, b) => a + b, 1);
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
                                        <circle cx="50" cy="50" r="30" className="fill-card" />
                                    </svg>
                                </div>
                                <div className="space-y-1.5">
                                    {['#6366f1', '#10b981', '#f59e0b'].map((c, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                                            <span className="text-[8px] font-black text-secondary tracking-widest uppercase opacity-40">Pack {i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 bg-primary/2 col-span-1 md:col-span-2 min-h-[160px]">
                            <h3 className="text-[9px] font-black text-secondary uppercase tracking-widest mb-6 opacity-50">Rendimiento por Nivel Educativo</h3>
                            <div className="flex items-end gap-3 h-20">
                                {[60, 85, 40, 95, 70, 55, 30].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-t-xl transition-all h-full relative">
                                            <div className="absolute bottom-0 w-full bg-emerald-500/40 rounded-t-xl" style={{ height: `${h}%` }} />
                                        </div>
                                        <span className="text-[7px] font-black text-secondary opacity-30">N{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card p-8 lg:col-span-3 min-h-[120px] flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center text-4xl border border-emerald-500/20 shadow-inner">💎</div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Ticket Medio de Venta</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-4xl font-black text-primary tracking-tighter">
                                            {stats.count > 0 ? (stats.revenue / stats.count).toFixed(2) : '0.00'}€
                                        </p>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">ÓPTIMO</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block text-right opacity-40">
                                <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Cálculo dinámico</p>
                                <p className="text-[10px] font-bold text-primary italic">Auditoría en tiempo real</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPanel;
