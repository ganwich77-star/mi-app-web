import React, { useState } from 'react';
import { Minus, Plus, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toTitleCase } from '../../utils/formatters.js';
import { COURSE_GROUPS } from '../../constants.js';
import { storage } from '../../firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const EditOrderModal = ({
    orderToEdit,
    setOrderToEdit,
    allPacks,
    updateOrder
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    if (!orderToEdit) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño/tipo si es necesario
        setUploading(true);
        setUploadProgress(0);

        try {
            // Crear referencia en Storage: fotos_digitales/ID_PEDIDO/nombre_archivo
            const storageRef = ref(storage, `fotos_digitales/${orderToEdit.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                }, 
                (error) => {
                    console.error("Error subiendo archivo:", error);
                    setUploading(false);
                }, 
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    // Actualizamos orderToEdit con la URL de la foto y el nombre del archivo
                    setOrderToEdit(prev => ({
                        ...prev,
                        digitalPhotoUrl: downloadURL,
                        tempPhotoFile: file.name // Sugerimos el nombre del archivo como ref
                    }));
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error("Error en handleFileUpload:", error);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-card rounded-3xl p-7 border border-primary/10 shadow-2xl animate-slide-up space-y-5 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/20">📝</div>
                    <div>
                        <p className="text-lg font-black text-primary leading-tight">Editar Pedido</p>
                        <p className="text-xs text-secondary uppercase tracking-widest font-bold">{orderToEdit.schoolName}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Subida de Foto Digital */}
                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Foto Digital para QR</label>
                            <span className="text-[9px] font-bold text-emerald-400/60 break-words max-w-[150px] text-right">
                                {orderToEdit.digitalPhotoUrl ? '✓ Lista para descargar' : 'Pendiente de subir'}
                            </span>
                        </div>

                        <div className="relative">
                            <input 
                                type="file" 
                                id="photo-upload"
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="photo-upload"
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                    uploading ? 'border-emerald-500/30 bg-emerald-500/5 pointer-events-none' : 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                        <p className="text-[11px] font-black text-primary">SUBIENDO... {Math.round(uploadProgress)}%</p>
                                        <div className="w-full h-1 bg-emerald-500/20 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-[11px] font-black text-primary">
                                            {orderToEdit.digitalPhotoUrl ? 'REEMPLAZAR FOTO ACTUAL' : 'SUBIR FOTO ORIGINAL'}
                                        </p>
                                        <p className="text-[9px] text-secondary mt-1 font-bold">Tamaño ideal: 3600 x 2400 (3:2) • JPG</p>
                                    </>
                                )}
                            </label>
                        </div>
                        
                        {orderToEdit.digitalPhotoUrl && (
                            <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg">
                                <CheckCircle2 className="text-emerald-500" size={14} />
                                <span className="text-[10px] text-emerald-400 font-bold truncate">URL guardada correctamente</span>
                            </div>
                        )}
                    </div>

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
                        disabled={uploading}
                        onClick={() => {
                            const selectedPackObj = allPacks.find(pk => pk.id === orderToEdit.packId);
                            const updatedOrder = {
                                ...orderToEdit, 
                                course: orderToEdit.tempGroup ? `${orderToEdit.tempCourse} ${orderToEdit.tempGroup}`.trim() : orderToEdit.tempCourse,
                                pack: selectedPackObj ? { id: selectedPackObj.id, label: selectedPackObj.name } : { id: 'manual', label: 'Personalizado' },
                                photoFile: orderToEdit.tempPhotoFile,
                                status: orderToEdit.tempStatus,
                                paymentMethod: orderToEdit.tempPayment,
                                digitalPhotoUrl: orderToEdit.digitalPhotoUrl // Aseguramos que se guarde la URL
                            };
                            delete updatedOrder.tempCourse;
                            delete updatedOrder.tempGroup;
                            delete updatedOrder.tempStatus;
                            delete updatedOrder.tempPayment;
                            delete updatedOrder.tempPhotoFile;

                            updateOrder(orderToEdit.id, updatedOrder);
                            setOrderToEdit(null);
                        }}
                        className={`flex-[1.5] py-3 text-xs font-black rounded-2xl transition-all shadow-lg ${
                            uploading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white active:scale-95 shadow-emerald-500/20'
                        }`}
                    >{uploading ? 'ESPERE...' : 'ACTUALIZAR PEDIDO'}</button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModal;

