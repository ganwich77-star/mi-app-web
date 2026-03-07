import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { toTitleCase } from '../../utils/formatters.js';
import { COURSE_GROUPS } from '../../constants.js';

const EditOrderModal = ({
    orderToEdit,
    setOrderToEdit,
    allPacks,
    updateOrder
}) => {
    if (!orderToEdit) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-card rounded-3xl p-7 border border-primary/10 shadow-2xl animate-slide-up space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/20">📝</div>
                    <div>
                        <p className="text-lg font-black text-primary leading-tight">Editar Pedido</p>
                        <p className="text-xs text-secondary uppercase tracking-widest font-bold">{orderToEdit.schoolName}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nombre del Alumno</label>
                        <input type="text" value={orderToEdit.studentName}
                            onChange={e => setOrderToEdit(p => ({ ...p, studentName: e.target.value }))}
                            onBlur={e => setOrderToEdit(p => ({ ...p, studentName: toTitleCase(e.target.value) }))}
                            className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-400/50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Curso</label>
                            <select value={orderToEdit.tempCourse} onChange={e => setOrderToEdit(p => ({ ...p, tempCourse: e.target.value, tempGroup: '' }))}
                                className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none">
                                <option value="" className="text-slate-900">— Seleccionar —</option>
                                {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name} className="text-slate-900">{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Grupo</label>
                            <select value={orderToEdit.tempGroup} onChange={e => setOrderToEdit(p => ({ ...p, tempGroup: e.target.value }))}
                                className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none">
                                <option value="" className="text-slate-900">— G —</option>
                                {['A', 'B', 'C', 'D'].map(g => <option key={g} value={g} className="text-slate-900">{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Pack Seleccionado</label>
                            <select value={orderToEdit.packId} onChange={e => setOrderToEdit(p => ({ ...p, packId: e.target.value }))}
                                className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-400/50">
                                {allPacks.map(pack => <option key={pack.id} value={pack.id} className="text-slate-900">{pack.name}</option>)}
                                <option value="manual" className="text-slate-900">Personalizado / Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nº de Packs</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setOrderToEdit(p => ({ ...p, packQuantity: Math.max(1, p.packQuantity - 1) }))}
                                    className="w-10 h-10 bg-primary/5 border border-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/10 transition-all active:scale-90">
                                    <Minus size={14} />
                                </button>
                                <span className="flex-1 text-center font-black text-lg text-primary">{orderToEdit.packQuantity}</span>
                                <button onClick={() => setOrderToEdit(p => ({ ...p, packQuantity: p.packQuantity + 1 }))}
                                    className="w-10 h-10 bg-primary/5 border border-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/10 transition-all active:scale-90">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Estado</label>
                            <select value={orderToEdit.tempStatus} onChange={e => setOrderToEdit(p => ({ ...p, tempStatus: e.target.value }))}
                                className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none">
                                <option value="Pendiente" className="text-slate-900">Pendiente</option>
                                <option value="Pagado" className="text-slate-900">Pagado</option>
                                <option value="Producido" className="text-slate-900">Producido</option>
                                <option value="Entregado" className="text-slate-900">Entregado</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Pago</label>
                            <select value={orderToEdit.tempPayment} onChange={e => setOrderToEdit(p => ({ ...p, tempPayment: e.target.value }))}
                                className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none">
                                <option value="Bizum" className="text-slate-900">Bizum</option>
                                <option value="Efectivo" className="text-slate-900">Efectivo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nº Fichero Cámara</label>
                        <input type="text" value={orderToEdit.tempPhotoFile} onChange={e => setOrderToEdit(p => ({ ...p, tempPhotoFile: e.target.value }))}
                            placeholder="DSC_0000" className="w-full bg-primary/10 border border-primary/20 text-emerald-400 font-mono text-base rounded-xl px-4 py-3 outline-none" />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={() => setOrderToEdit(null)} className="flex-1 py-3 text-xs font-bold text-secondary border border-primary/10 rounded-2xl hover:bg-primary/5 transition-all">Cancelar</button>
                    <button
                        onClick={() => {
                            const selectedPackObj = allPacks.find(pk => pk.id === orderToEdit.packId);
                            const updatedOrder = {
                                ...orderToEdit, // Keep existing properties
                                course: orderToEdit.tempGroup ? `${orderToEdit.tempCourse} ${orderToEdit.tempGroup}`.trim() : orderToEdit.tempCourse,
                                pack: selectedPackObj ? { id: selectedPackObj.id, label: selectedPackObj.name } : { id: 'manual', label: 'Personalizado' },
                                photoFile: orderToEdit.tempPhotoFile,
                                status: orderToEdit.tempStatus,
                                paymentMethod: orderToEdit.tempPayment
                            };
                            // Remove temporary state properties before updating
                            delete updatedOrder.tempCourse;
                            delete updatedOrder.tempGroup;
                            delete updatedOrder.tempStatus;
                            delete updatedOrder.tempPayment;
                            delete updatedOrder.tempPhotoFile;

                            updateOrder(orderToEdit.id, updatedOrder);
                            setOrderToEdit(null);
                        }}
                        className="flex-[1.5] py-3 text-xs font-black bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >ACTUALIZAR PEDIDO</button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModal;
