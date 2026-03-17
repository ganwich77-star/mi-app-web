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
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] animate-slide-up space-y-6 overflow-y-auto max-h-[90vh] border border-slate-100">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100">📝</div>
                    <div>
                        <p className="text-xl font-black text-slate-800 leading-tight">Editar Pedido</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">{orderToEdit.schoolName}</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Subida de Foto Digital */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Foto Digital para QR</label>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {orderToEdit.digitalPhotoUrl ? '✓ LISTA' : 'PENDIENTE'}
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
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                    uploading ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 bg-white'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                        <p className="text-[11px] font-black text-slate-800 uppercase">Subiendo... {Math.round(uploadProgress)}%</p>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {orderToEdit.digitalPhotoUrl ? (
                                            <div className="relative group w-full flex flex-col items-center">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/20 mb-3 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                    <img src={orderToEdit.digitalPhotoUrl} className="w-full h-full object-cover" alt="Vista previa" />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide">CAMBIAR FOTOGRAFÍA</p>
                                                <p className="text-[9px] text-slate-400 mt-1 font-bold italic">Presiona para subir una nueva</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2 border border-emerald-100 shadow-sm">
                                                    <Upload size={22} />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide">SUBIR FOTO ORIGINAL</p>
                                                <p className="text-[9px] text-slate-400 mt-1 font-bold italic">3600 x 2400 (3:2) • JPG</p>
                                            </>
                                        )}
                                    </>
                                )}
                            </label>
                        </div>
                        
                        {orderToEdit.digitalPhotoUrl && (
                            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                <CheckCircle2 className="text-emerald-500" size={14} />
                                <span className="text-[10px] text-emerald-700 font-bold truncate">Imagen vinculada correctamente</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Nombre del Alumno</label>
                        <input type="text" value={orderToEdit.studentName}
                            onChange={e => setOrderToEdit(p => ({ ...p, studentName: e.target.value }))}
                            onBlur={e => setOrderToEdit(p => ({ ...p, studentName: toTitleCase(e.target.value) }))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Curso</label>
                            <select value={orderToEdit.tempCourse} onChange={e => setOrderToEdit(p => ({ ...p, tempCourse: e.target.value, tempGroup: '' }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 cursor-pointer transition-all">
                                <option value="" className="text-slate-900">— SELECCIONAR —</option>
                                {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name} className="text-slate-900 font-bold">{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Grupo</label>
                            <select value={orderToEdit.tempGroup} onChange={e => setOrderToEdit(p => ({ ...p, tempGroup: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 cursor-pointer transition-all">
                                <option value="" className="text-slate-900">— G —</option>
                                {['A', 'B', 'C', 'D'].map(g => <option key={g} value={g} className="text-slate-900 font-bold">{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Pack Seleccionado</label>
                            <select value={orderToEdit.packId} onChange={e => setOrderToEdit(p => ({ ...p, packId: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 cursor-pointer transition-all">
                                {allPacks.map(pack => <option key={pack.id} value={pack.id} className="text-slate-900 font-bold">{pack.name}</option>)}
                                <option value="manual" className="text-slate-900 font-bold">Personalizado</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Cantidad</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setOrderToEdit(p => ({ ...p, packQuantity: Math.max(1, p.packQuantity - 1) }))}
                                    className="w-11 h-11 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90 shadow-sm">
                                    <Minus size={16} />
                                </button>
                                <span className="flex-1 text-center font-black text-xl text-slate-800">{orderToEdit.packQuantity}</span>
                                <button onClick={() => setOrderToEdit(p => ({ ...p, packQuantity: p.packQuantity + 1 }))}
                                    className="w-11 h-11 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90 shadow-sm">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Estado del Pedido</label>
                            <select value={orderToEdit.tempStatus} onChange={e => setOrderToEdit(p => ({ ...p, tempStatus: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 cursor-pointer">
                                <option value="Pendiente" className="text-slate-900">PENDIENTE DE PAGO</option>
                                <option value="Pagado" className="text-slate-900">HACER FOTO (PAGADO)</option>
                                <option value="Producido" className="text-slate-900">LISTO / PRODUCIDO</option>
                                <option value="Entregado" className="text-slate-900">ENTREGADO</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Método Pago</label>
                            <select value={orderToEdit.tempPayment} onChange={e => setOrderToEdit(p => ({ ...p, tempPayment: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-3.5 outline-none focus:border-emerald-500 cursor-pointer">
                                <option value="Bizum" className="text-slate-900">Bizum</option>
                                <option value="Efectivo" className="text-slate-900">Efectivo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Fichero Cámara (Nº)</label>
                        <input type="text" value={orderToEdit.tempPhotoFile} onChange={e => setOrderToEdit(p => ({ ...p, tempPhotoFile: e.target.value }))}
                            placeholder="0001" className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono font-black text-lg rounded-xl px-4 py-4 outline-none shadow-inner focus:ring-2 focus:ring-emerald-500/10 transition-all" />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={() => setOrderToEdit(null)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Descartar</button>
                    <button
                        disabled={uploading}
                        onClick={() => {
                            const selectedPackObj = allPacks.find(pk => pk.id === orderToEdit.packId);
                            const updatedOrder = {
                                ...orderToEdit, 
                                course: orderToEdit.tempGroup ? `${orderToEdit.tempCourse} ${orderToEdit.tempGroup}`.trim() : orderToEdit.tempCourse,
                                pack: selectedPackObj ? { id: selectedPackObj.id, label: selectedPackObj.name } : { id: 'manual', label: 'Personalizado' },
                                photo_file_number: orderToEdit.tempPhotoFile,
                                status: orderToEdit.tempStatus,
                                paymentMethod: orderToEdit.tempPayment,
                                digitalPhotoUrl: orderToEdit.digitalPhotoUrl
                            };
                            delete updatedOrder.tempCourse;
                            delete updatedOrder.tempGroup;
                            delete updatedOrder.tempStatus;
                            delete updatedOrder.tempPayment;
                            delete updatedOrder.tempPhotoFile;

                            updateOrder(orderToEdit.id, updatedOrder);
                            setOrderToEdit(null);
                        }}
                        className={`flex-[2] py-4 text-xs font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest ${
                            uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-slate-800 active:scale-95 shadow-slate-200'
                        }`}
                    >{uploading ? 'PROCESANDO...' : 'GUARDAR CAMBIOS'}</button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModal;

