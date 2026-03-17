import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { STAFF_ROLES, COURSE_GROUPS } from '../../constants.js';
import { toTitleCase } from '../../utils/formatters.js';
import { storage } from '../../firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';

const StaffEditModal = ({
    staffAssigning,
    setStaffAssigning,
    updateStaffMember,
    deleteStaff,
    schools = []
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    if (!staffAssigning) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const storageRef = ref(storage, `fotos_staff/${staffAssigning.member.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                }, 
                (error) => {
                    console.error("Error subiendo archivo staff:", error);
                    setUploading(false);
                }, 
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setStaffAssigning(prev => ({
                        ...prev,
                        digitalPhotoUrl: downloadURL,
                        tempFile: file.name
                    }));
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error("Error en handleFileUpload (staff):", error);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-7 border border-slate-100 shadow-2xl animate-slide-up space-y-4 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl border border-indigo-100 italic shadow-sm">👤</div>
                    <div>
                        <p className="text-lg font-black text-slate-800 leading-tight">Editar Ficha</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Personal Docente</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Sección de Foto */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Foto Digital</label>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {staffAssigning.digitalPhotoUrl ? '✓ LISTA' : 'PENDIENTE'}
                            </span>
                        </div>

                        <div className="relative">
                            <input 
                                type="file" 
                                id="staff-photo-upload"
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="staff-photo-upload"
                                className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                    uploading ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 bg-white'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                                        <p className="text-[10px] font-black text-slate-800 uppercase">{Math.round(uploadProgress)}%</p>
                                    </>
                                ) : (
                                    <>
                                        {staffAssigning.digitalPhotoUrl ? (
                                            <div className="relative group w-full flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-500/20 mb-2 shadow-sm">
                                                    <img src={staffAssigning.digitalPhotoUrl} className="w-full h-full object-cover" alt="Staff" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-800 uppercase">CAMBIAR FOTO</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={20} className="text-indigo-400 mb-1" />
                                                <p className="text-[10px] font-black text-slate-800 uppercase">SUBIR FOTO</p>
                                            </>
                                        )}
                                    </>
                                )}
                            </label>
                        </div>
                        
                        {staffAssigning.digitalPhotoUrl && (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                <CheckCircle2 className="text-emerald-500" size={12} />
                                <span className="text-[9px] text-emerald-700 font-bold truncate">Vinculada correctamente</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nombre</label>
                            <input type="text" value={staffAssigning.firstName}
                                onChange={e => setStaffAssigning(p => ({ ...p, firstName: e.target.value }))}
                                onBlur={e => setStaffAssigning(p => ({ ...p, firstName: toTitleCase(e.target.value) }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-indigo-400" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Apellidos</label>
                            <input type="text" value={staffAssigning.lastName}
                                onChange={e => setStaffAssigning(p => ({ ...p, lastName: e.target.value }))}
                                onBlur={e => setStaffAssigning(p => ({ ...p, lastName: toTitleCase(e.target.value) }))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-indigo-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Centro Educativo</label>
                        <select
                            value={staffAssigning.schoolId}
                            onChange={e => setStaffAssigning(p => ({ ...p, schoolId: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
                        >
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Puestos / Cargos</label>
                        {staffAssigning.roles && staffAssigning.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {staffAssigning.roles.map((r, i) => (
                                    <span key={i} className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-indigo-100">
                                        {r}
                                        <button onClick={() => setStaffAssigning(p => ({ ...p, roles: p.roles.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input type="text" list="roles-list-edit" value={staffAssigning.tempRole}
                                    onChange={e => setStaffAssigning(p => ({ ...p, tempRole: e.target.value }))}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && staffAssigning.tempRole?.trim()) {
                                            e.preventDefault();
                                            if (!staffAssigning.roles?.includes(staffAssigning.tempRole.trim())) {
                                                setStaffAssigning(p => ({ ...p, roles: [...(p.roles || []), p.tempRole.trim()], tempRole: '' }));
                                            }
                                        }
                                    }}
                                    placeholder="Añadir cargo..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400" />
                                <datalist id="roles-list-edit">
                                    {STAFF_ROLES.flatMap(g => g.roles).map(r => <option key={r} value={r} />)}
                                </datalist>
                            </div>
                            <button
                                onClick={() => {
                                    if (staffAssigning.tempRole?.trim() && !staffAssigning.roles?.includes(staffAssigning.tempRole.trim())) {
                                        setStaffAssigning(p => ({ ...p, roles: [...(p.roles || []), p.tempRole.trim()], tempRole: '' }));
                                    }
                                }}
                                className="bg-indigo-50 text-indigo-600 rounded-xl px-3 py-1 hover:bg-indigo-600 hover:text-white transition-all font-black text-lg shadow-sm border border-indigo-100">+</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Clases Asignadas</label>
                        {staffAssigning.assignments && staffAssigning.assignments.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                {staffAssigning.assignments.map((a, i) => (
                                    <span key={i} className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-slate-300">
                                        {a.course} {a.group}
                                        <button onClick={() => setStaffAssigning(p => ({ ...p, assignments: p.assignments.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors ml-1">x</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <select value={staffAssigning.tempCourse} onChange={e => setStaffAssigning(p => ({ ...p, tempCourse: e.target.value }))} className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-3 outline-none focus:border-indigo-400">
                                <option value="">CLASE</option>
                                {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select value={staffAssigning.tempGroup} onChange={e => setStaffAssigning(p => ({ ...p, tempGroup: e.target.value }))} className="w-[100px] bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-3 outline-none focus:border-indigo-400 uppercase">
                                <option value="">GRUPO</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                            <button
                                disabled={!staffAssigning.tempCourse}
                                onClick={() => setStaffAssigning(p => ({ ...p, assignments: [...(p.assignments || []), { course: p.tempCourse, group: p.tempGroup }], tempCourse: '', tempGroup: '' }))}
                                className="bg-indigo-50 text-indigo-600 font-black text-xl rounded-xl px-4 py-2 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-30 border border-indigo-100 shadow-sm">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nº Fichero de Cámara</label>
                    <input type="text" value={staffAssigning.tempFile} onChange={e => setStaffAssigning(p => ({ ...p, tempFile: e.target.value }))}
                        placeholder="0001" className="w-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-black text-base rounded-xl px-4 py-3 outline-none shadow-inner" />
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={() => setStaffAssigning(null)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancelar</button>
                    <button
                        disabled={uploading}
                        onClick={() => {
                            const missingFields = [];
                            if (!staffAssigning.firstName?.trim()) missingFields.push('Nombre');
                            if (!staffAssigning.lastName?.trim()) missingFields.push('Apellidos');

                            if (missingFields.length > 0) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Campos incompletos',
                                    text: `Por favor, completa: ${missingFields.join(', ')}`,
                                    confirmButtonColor: '#6366f1'
                                });
                                return;
                            }

                            updateStaffMember(staffAssigning.member.id, {
                                firstName: staffAssigning.firstName,
                                lastName: staffAssigning.lastName,
                                name: `${staffAssigning.firstName} ${staffAssigning.lastName}`.trim(),
                                role: staffAssigning.roles?.join(' • ') || '',
                                roles: staffAssigning.roles || [],
                                assignments: staffAssigning.assignments || [],
                                photo_file_number: staffAssigning.tempFile || '',
                                digitalPhotoUrl: staffAssigning.digitalPhotoUrl || '',
                                schoolId: staffAssigning.schoolId
                            });
                            setStaffAssigning(null);
                        }}
                        className={`flex-[1.5] py-3 text-xs font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest ${
                            uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-slate-800 active:scale-95'
                        }`}
                    >{uploading ? 'PROCESANDO...' : 'GUARDAR CAMBIOS'}</button>
                </div>
                {/* Botón de eliminar opcional, manteniendo la lógica original */}
                <button
                    onClick={() => {
                        if (confirm('¿ELIMINAR ESTE DOCENTE?')) {
                            deleteStaff(staffAssigning.member.id);
                            setStaffAssigning(null);
                        }
                    }}
                    className="w-full py-2 text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest mt-2 transition-colors"
                >
                    Eliminar Docente Permanentemente
                </button>
            </div>
        </div>
    );
};

export default StaffEditModal;
