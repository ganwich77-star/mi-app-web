import { useState } from 'react';
import { Trash2, ChevronDown, Edit2, MessageSquare } from 'lucide-react';

const STATUS_CONFIG = {
    'Pendiente': { bg: 'bg-amber-500/10  border-amber-500/30  text-amber-500' },
    'Pagado': { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' },
    'Producido': { bg: 'bg-blue-500/10   border-blue-500/30   text-blue-500' },
    'Entregado': { bg: 'bg-slate-500/10  border-slate-500/30  text-secondary' },
};

// Anchos idénticos a la cabecera en App.jsx (sin columna Beneficio), ampliando la última para 2 botones
// Anchos sincronizados con OrdersPanel.jsx
const GRID = 'grid-cols-[40px_1.8fr_1.2fr_1.8fr_1fr_1.5fr_0.8fr_130px_140px]';

export default function OrderRow({ 
    order, 
    onStatusChange, 
    onDelete, 
    onEdit, 
    isSelected, 
    onSelect, 
    sendWhatsAppNotification 
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const status = order.status || 'Pendiente';
    const sc = STATUS_CONFIG[status] || STATUS_CONFIG['Pendiente'];
    const date = new Date(order.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
        <>
            {/* ── VISTA ESCRITORIO ──────────────────────────────────────── */}
            <div className={`hidden sm:grid ${GRID} gap-2 items-center px-8 py-4 hover:bg-primary/3 transition-colors group ${isSelected ? 'bg-indigo-500/5' : ''}`}>

                {/* Checkbox Selección */}
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(e.target.checked)}
                        className="w-4 h-4 rounded border-primary/20 accent-indigo-500 cursor-pointer"
                    />
                </div>

                {/* Alumno + Padre/Teléfono */}
                <div className="flex flex-col min-w-0">
                    <p className="text-xs font-black text-primary leading-tight uppercase">{order.studentName}</p>
                    <div className="flex items-center gap-2 mt-1 opacity-60">
                        <span className="text-[8px] font-bold text-secondary uppercase bg-primary/5 px-1.5 py-0.5 rounded italic">
                           {order.parentName ? order.parentName : <span className="opacity-40">SIN TUTOR</span>}
                        </span>
                        <span className="text-[8px] font-black text-indigo-500 tracking-tighter">
                            {order.parentPhone ? order.parentPhone : '--'}
                        </span>
                    </div>
                </div>

                {/* Curso */}
                <p className="text-[10px] text-secondary font-semibold text-center leading-tight">{order.course}</p>

                {/* Centro Educativo */}
                <p className="text-[10px] text-secondary font-semibold text-center leading-tight" title={order.schoolName}>{order.schoolName}</p>

                {/* Pack */}
                <div className="flex justify-center">
                    <span className="bg-primary/8 text-secondary text-[9px] font-black px-2.5 py-1.5 rounded-xl uppercase border border-primary/10 flex items-center gap-1 shadow-sm">
                        {order.packQuantity > 1 && <span className="text-indigo-400 font-bold">{order.packQuantity}x</span>}
                        {typeof order.pack === 'object' ? order.pack.label : (order.pack?.replace('Pack ', '') || '—')}
                    </span>
                </div>

                {/* Extras */}
                <p className="text-[10px] text-secondary text-center leading-tight italic opacity-80" title={order.extrasDesc || '—'}>
                    {order.extrasDesc || <span className="opacity-30">—</span>}
                </p>

                {/* Método de pago */}
                <div className="flex justify-center">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10">
                        {order.paymentMethod}
                    </p>
                </div>

                {/* Estado */}
                <div className="relative flex justify-center">
                    <select
                        value={status}
                        onChange={e => onStatusChange(e.target.value)}
                        className={`text-[9px] font-black px-2 py-2 rounded-xl border cursor-pointer outline-none appearance-none pr-6 transition-all w-full text-center ${sc.bg}`}
                    >
                        {Object.keys(STATUS_CONFIG).map(s => (
                            <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                        ))}
                    </select>
                    <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>

                {/* Acciones */}
                <div className="flex justify-end flex-nowrap gap-1 pr-6">
                    {confirmDelete ? (
                        <div className="flex items-center gap-1 animate-fade-in">
                            <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-1 flex-1 rounded-lg active:scale-90 transition-all text-center">Sí</button>
                            <button onClick={() => setConfirmDelete(false)} className="text-[9px] font-black text-secondary bg-primary/5 border border-primary/10 px-2 py-1 flex-1 rounded-lg active:scale-90 transition-all text-center">No</button>
                        </div>
                    ) : (
                        <>
                            {order.parentPhone && (
                                <button
                                    onClick={() => sendWhatsAppNotification && sendWhatsAppNotification(order)}
                                    title="Enviar notificación WhatsApp"
                                    className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-90 shadow-sm"
                                >
                                    <MessageSquare size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => onEdit && onEdit(order)}
                                title="Editar alumno"
                                className="w-8 h-8 rounded-xl hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 flex items-center justify-center text-secondary hover:text-blue-400 transition-all opacity-40 group-hover:opacity-100 active:scale-90"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                title="Eliminar registro"
                                className="w-8 h-8 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30 flex items-center justify-center text-secondary hover:text-red-400 transition-all opacity-40 group-hover:opacity-100 active:scale-90"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── VISTA MÓVIL ───────────────────────────────────────────── */}
            <div className={`sm:hidden flex items-center gap-3 px-4 py-4 hover:bg-primary/3 transition-colors group border-b border-primary/5 last:border-0 ${isSelected ? 'bg-indigo-500/5' : ''}`}>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-primary/20 accent-indigo-500 cursor-pointer"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="font-black text-[14px] text-primary leading-tight">{order.studentName}</p>
                    </div>
                    <p className="text-[10px] text-secondary font-bold mt-1 truncate opacity-60">
                        {order.course} · <span className="opacity-50">{order.schoolName}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-primary/70 uppercase">
                            {order.parentName || 'SIN TUTOR'}
                        </span>
                        <span className="text-[9px] font-bold text-indigo-500">
                            {order.parentPhone || '--'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="bg-primary/5 text-secondary text-[9px] font-black px-2 py-1 rounded border border-primary/5 uppercase tracking-tighter shadow-sm">
                            {order.packQuantity > 1 && <span className="text-indigo-400 mr-1">{order.packQuantity}x</span>}
                            {typeof order.pack === 'object' ? order.pack.label : order.pack?.replace('Pack ', '')}
                        </span>
                        {order.paymentMethod && <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest bg-indigo-500/5 px-1.5 py-0.5 rounded italic">PAGO: {order.paymentMethod}</span>}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="relative">
                        <select value={status} onChange={e => onStatusChange(e.target.value)} className={`text-[9px] font-black px-2 py-2 rounded-xl border cursor-pointer outline-none appearance-none pr-6 transition-all ${sc.bg} min-h-[36px]`}>
                            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                        </select>
                        <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                    <div className="flex gap-1">
                        {confirmDelete ? (
                            <>
                                <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">SI</button>
                                <button onClick={() => setConfirmDelete(false)} className="text-[9px] font-black text-secondary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg">NO</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => onEdit && onEdit(order)} className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-secondary active:scale-95 shadow-sm">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => setConfirmDelete(true)} className="w-9 h-9 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400 active:scale-95 shadow-sm">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
