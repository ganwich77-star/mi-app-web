import { useState } from 'react';
import { Trash2, ChevronDown, Edit2 } from 'lucide-react';

const STATUS_CONFIG = {
    'Pendiente': { bg: 'bg-amber-500/10  border-amber-500/30  text-amber-500' },
    'Pagado': { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' },
    'Producido': { bg: 'bg-blue-500/10   border-blue-500/30   text-blue-500' },
    'Entregado': { bg: 'bg-slate-500/10  border-slate-500/30  text-secondary' },
};

// Anchos idénticos a la cabecera en App.jsx (sin columna Beneficio), ampliando la última para 2 botones
const GRID = 'grid-cols-[minmax(120px,1.5fr)_minmax(110px,1.2fr)_minmax(160px,2fr)_minmax(100px,1fr)_minmax(130px,1.5fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_70px]';

export default function OrderRow({ order, onStatusChange, onDelete, onEdit }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const status = order.status || 'Pendiente';
    const sc = STATUS_CONFIG[status] || STATUS_CONFIG['Pendiente'];
    const date = new Date(order.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
        <>
            {/* ── VISTA ESCRITORIO ──────────────────────────────────────── */}
            <div className={`hidden sm:grid ${GRID} gap-2 items-center px-4 py-3.5 hover:bg-primary/3 transition-colors group`}>

                {/* Alumno + fichero */}
                <div className="flex items-center gap-2 min-w-0">
                    <p className="text-xs font-black text-primary truncate">{order.studentName}</p>
                    {order.photoFile && (
                        <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex-shrink-0">{order.photoFile}</span>
                    )}
                </div>

                {/* Curso */}
                <p className="text-[10px] text-secondary font-semibold truncate text-center">{order.course}</p>

                {/* Centro Educativo */}
                <p className="text-[10px] text-secondary font-semibold truncate text-center" title={order.schoolName}>{order.schoolName}</p>

                {/* Pack */}
                <span className="mx-auto bg-primary/8 text-secondary text-[9px] font-black px-2.5 py-1 rounded-lg uppercase border border-primary/10 whitespace-nowrap truncate max-w-full text-center flex items-center gap-1">
                    {order.packQuantity > 1 && <span className="text-indigo-400 font-bold">{order.packQuantity}x</span>}
                    {typeof order.pack === 'object' ? order.pack.label : order.pack?.replace('Pack ', '')}
                </span>

                {/* Extras */}
                <p className="text-[10px] text-secondary text-center truncate" title={order.extrasDesc || '—'}>
                    {order.extrasDesc || <span className="opacity-30">—</span>}
                </p>

                {/* Método de pago */}
                <p className="text-[10px] font-black text-accent uppercase tracking-wider text-center truncate">{order.paymentMethod}</p>

                {/* Estado */}
                <div className="relative flex justify-center">
                    <select
                        value={status}
                        onChange={e => onStatusChange(e.target.value)}
                        className={`text-[9px] font-black px-2 py-1.5 rounded-xl border cursor-pointer outline-none appearance-none pr-5 transition-all w-full ${sc.bg}`}
                    >
                        {Object.keys(STATUS_CONFIG).map(s => (
                            <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                        ))}
                    </select>
                    <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>

                {/* Acciones */}
                <div className="flex justify-center flex-nowrap gap-1">
                    {confirmDelete ? (
                        <div className="flex items-center gap-1 animate-fade-in">
                            <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-1 flex-1 rounded-lg active:scale-90 transition-all text-center">Sí</button>
                            <button onClick={() => setConfirmDelete(false)} className="text-[9px] font-black text-secondary bg-primary/5 border border-primary/10 px-2 py-1 flex-1 rounded-lg active:scale-90 transition-all text-center">No</button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => onEdit && onEdit(order)}
                                className="w-7 h-7 rounded-xl hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 flex items-center justify-center text-secondary hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            >
                                <Edit2 size={13} />
                            </button>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-7 h-7 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30 flex items-center justify-center text-secondary hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            >
                                <Trash2 size={13} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── VISTA MÓVIL ───────────────────────────────────────────── */}
            <div className="sm:hidden flex items-center gap-3 px-3 py-3 hover:bg-primary/3 transition-colors group border-b border-primary/5 last:border-0">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="font-black text-[13px] text-primary truncate leading-tight">{order.studentName}</p>
                        {order.photoFile && (
                            <span className="text-[8px] font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/10 px-1 py-0.5 rounded flex-shrink-0">{order.photoFile}</span>
                        )}
                    </div>
                    <p className="text-[9px] text-secondary font-bold mt-0.5 truncate opacity-60">
                        {order.course} · <span className="opacity-50">{order.schoolName}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="bg-primary/5 text-secondary text-[8px] font-black px-1.5 py-0.5 rounded border border-primary/5 uppercase tracking-tighter">
                            {order.packQuantity > 1 && <span className="text-indigo-400 mr-1">{order.packQuantity}x</span>}
                            {typeof order.pack === 'object' ? order.pack.label : order.pack?.replace('Pack ', '')}
                        </span>
                        {order.paymentMethod && <span className="text-[8px] font-black text-accent/60 uppercase tracking-widest">{order.paymentMethod}</span>}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="relative">
                        <select value={status} onChange={e => onStatusChange(e.target.value)} className={`text-[9px] font-black px-2 py-1.5 rounded-lg border cursor-pointer outline-none appearance-none pr-5 transition-all ${sc.bg} min-h-[32px]`}>
                            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                        </select>
                        <ChevronDown size={8} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                    <div className="flex gap-1">
                        {confirmDelete ? (
                            <>
                                <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="text-[8px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">SI</button>
                                <button onClick={() => setConfirmDelete(false)} className="text-[8px] font-black text-secondary bg-primary/5 border border-primary/10 px-2 py-1 rounded-md">NO</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => onEdit && onEdit(order)} className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-secondary active:scale-90 transition-all">
                                    <Edit2 size={12} />
                                </button>
                                <button onClick={() => setConfirmDelete(true)} className="w-8 h-8 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400 active:scale-90 transition-all">
                                    <Trash2 size={12} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
