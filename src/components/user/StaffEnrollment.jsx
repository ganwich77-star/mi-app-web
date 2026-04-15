import React, { useState } from 'react';
import { UserPlus, Trash2, CheckCircle, GraduationCap, Users, Shield, BookOpen, Briefcase, Plus, Send, X, AlertCircle } from 'lucide-react';
import { STAFF_ROLES } from '../../constants.js';
import Swal from 'sweetalert2';
import { db } from '../../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const StaffEnrollment = ({ photographerId, schoolId, getSchoolName, theme = 'light' }) => {
    const [staffList, setStaffList] = useState([]);
    const [currentMember, setCurrentMember] = useState({
        firstName: '',
        lastName: '',
        roles: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const schoolName = getSchoolName(schoolId);
    const isDark = theme === 'dark';

    const toggleRole = (role) => {
        setCurrentMember(prev => ({
            ...prev,
            roles: prev.roles.includes(role) 
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }));
    };

    const addMemberToList = () => {
        if (!currentMember.firstName.trim() || !currentMember.lastName.trim()) {
            Swal.fire({
                title: 'Faltan datos',
                text: 'Por favor, rellena el nombre y los apellidos',
                icon: 'warning',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        if (currentMember.roles.length === 0) {
            Swal.fire({
                title: 'Sin cargos',
                text: 'Debes seleccionar al menos un cargo o asignatura para este docente',
                icon: 'warning',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        setStaffList(prev => [...prev, { 
            ...currentMember, 
            id: Date.now(),
            firstName: currentMember.firstName.trim().toUpperCase(),
            lastName: currentMember.lastName.trim().toUpperCase()
        }]);
        
        setCurrentMember({
            firstName: '',
            lastName: '',
            roles: []
        });
    };

    const removeMember = (id) => {
        setStaffList(prev => prev.filter(m => m.id !== id));
    };

    const handleSubmit = async () => {
        if (staffList.length === 0) return;

        setIsSubmitting(true);
        try {
            const docRef = doc(db, 'orlas2026_photographers', photographerId, 'staff', schoolId);
            const docSnap = await getDoc(docRef);
            
            let existingItems = [];
            if (docSnap.exists()) {
                existingItems = docSnap.data().items || [];
            }

            // Mapear los roles seleccionados al formato de assignments
            const newItems = staffList.map(m => ({
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                firstName: m.firstName,
                lastName: m.lastName,
                name: `${m.firstName} ${m.lastName}`,
                role: m.roles.join(', '), // Resumen para vista rápida
                assignments: m.roles.map(r => ({
                    schoolId: schoolId,
                    role: r,
                    course: '',
                    isMain: false
                })),
                photoFile: '',
                schoolId: schoolId
            }));

            await setDoc(docRef, { items: [...existingItems, ...newItems] }, { merge: true });

            setIsFinished(true);
            Swal.fire({
                title: '¡Recibido!',
                text: `Se han registrado ${staffList.length} docentes correctamente.`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error enviando docentes:", error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar la información. Inténtalo de nuevo.',
                icon: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">¡LISTADO ENVIADO!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Muchas gracias. Los datos de los docentes han sido enviados directamente al fotógrafo para la orla de <strong>{schoolName}</strong>.
                    </p>
                    <button 
                        onClick={() => setIsFinished(false)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all active:scale-95"
                    >
                        AÑADIR MÁS DOCENTES
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-3 bg-indigo-600/10 text-indigo-600 px-6 py-2 rounded-full mb-6">
                        <GraduationCap size={20} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">ORLAS 2026</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none uppercase">
                        Listado de <span className="text-indigo-600">Personal Docente</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] opacity-60">
                        Centro Educativo: {schoolName || 'CARGANDO...'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Formulario de Alta */}
                    <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight text-slate-900">
                            <Plus className="text-indigo-600" /> Añadir Nuevo Docente
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                                    <input 
                                        type="text" 
                                        value={currentMember.firstName}
                                        onChange={e => setCurrentMember(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold uppercase focus:border-indigo-500/30 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Ej: MARÍA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellidos</label>
                                    <input 
                                        type="text" 
                                        value={currentMember.lastName}
                                        onChange={e => setCurrentMember(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold uppercase focus:border-indigo-500/30 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Ej: GARCÍA LÓPEZ"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Shield size={14} className="text-indigo-600" /> Selecciona Cargos / Asignaturas
                                </label>
                                
                                <div className="space-y-6 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                                    {STAFF_ROLES.map((group, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] pb-1 border-b border-slate-100">{group.group}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {group.roles.map((role, rIdx) => {
                                                    const isSelected = currentMember.roles.includes(role);
                                                    return (
                                                        <button
                                                            key={rIdx}
                                                            onClick={() => toggleRole(role)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                                                                isSelected 
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                                                            }`}
                                                        >
                                                            {role}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={addMemberToList}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Plus size={18} /> AÑADIR A LA LISTA
                            </button>
                        </div>
                    </div>

                    {/* Lista Temporal */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                            <h3 className="text-lg font-black mb-6 flex items-center justify-between uppercase tracking-tight">
                                <div className="flex items-center gap-3">
                                    <Users className="text-indigo-400" /> Tu Listado
                                </div>
                                <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px]">{staffList.length}</span>
                            </h3>

                            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                {staffList.map(m => (
                                    <div key={m.id} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all animate-in slide-in-from-right-2 duration-300">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="text-[11px] font-black uppercase tracking-wider truncate">{m.firstName} {m.lastName}</div>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {m.roles.map((r, ri) => (
                                                    <span key={ri} className="text-[8px] font-bold bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded-md uppercase tracking-widest leading-none border border-indigo-500/20">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeMember(m.id)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all active:scale-90"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {staffList.length === 0 && (
                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                        <AlertCircle size={48} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Lista vacía</p>
                                    </div>
                                )}
                            </div>

                            {staffList.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>ENVIANDO...</>
                                        ) : (
                                            <>
                                                <Send size={18} /> ENVIAR LISTADO FINAL
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mt-4">
                                        Una vez enviado, el fotógrafo podrá asignar las fotos
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tip Informativo */}
                        <div className="bg-indigo-600/5 border border-indigo-600/10 p-6 rounded-3xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1">Nota importante</h4>
                                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                    Recomendamos añadir a todo el equipo directivo, tutores de los cursos participantes y especialistas que deban figurar en la orla.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffEnrollment;
