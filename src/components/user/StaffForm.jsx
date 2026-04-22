import React, { useState, useEffect } from 'react';
import { 
    Users, Plus, Trash2, CheckCircle, GraduationCap, 
    ArrowRight, Sparkles, User, Briefcase, ChevronRight,
    FileText, Upload, Paperclip
} from 'lucide-react';
import Swal from 'sweetalert2';
import { db, storage } from '../../firebase.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { STAFF_ROLES } from '../../constants.js';


const StaffForm = ({ theme = 'light' }) => {
    const isDark = theme === 'dark';
    
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const photographerId = params.get('f') || 'pujaltecreativestudio';
    const schoolId = params.get('s');
    const courseName = params.get('c');
    const groupName = params.get('g') || '';
    const tutorName = params.get('t') || '';

    const [schoolName, setSchoolName] = useState('Su Centro');
    const [staffList, setStaffList] = useState([
        { id: Date.now(), firstName: '', lastName: '', roles: [] }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [studentFile, setStudentFile] = useState(null);

    // Cargar nombre del colegio para el encabezado

    useEffect(() => {
        const fetchSchool = async () => {
            if (!schoolId) return;
            try {
                const docRef = doc(db, 'orlas2026_photographers', photographerId, 'config', 'main');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const schools = docSnap.data().schools || [];
                    const school = schools.find(s => s.id === schoolId);
                    if (school) setSchoolName(school.name);
                }
            } catch (error) {
                console.error("Error fetching school:", error);
            }
        };

        fetchSchool();
    }, [schoolId, photographerId]);

    const addTeacher = () => {
        setStaffList([...staffList, { id: Date.now(), firstName: '', lastName: '', roles: [] }]);
    };

    const removeTeacher = (id) => {
        if (staffList.length > 1) {
            setStaffList(staffList.filter(t => t.id !== id));
        }
    };

    const updateTeacher = (id, field, value) => {
        setStaffList(staffList.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const toggleRole = (teacherId, role) => {
        setStaffList(staffList.map(t => {
            if (t.id === teacherId) {
                const roles = t.roles.includes(role) 
                    ? t.roles.filter(r => r !== role)
                    : [...t.roles, role];
                return { ...t, roles };
            }
            return t;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación básica de docentes
        const invalid = staffList.some(t => !t.firstName || !t.lastName || t.roles.length === 0);
        if (invalid) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, rellena nombre, apellidos y al menos un cargo para cada docente.',
                confirmButtonColor: '#f97316'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Inyectar Docentes
            const newStaffMembers = staffList.map(t => ({
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                firstName: t.firstName.trim().toUpperCase(),
                lastName: t.lastName.trim().toUpperCase(),
                name: `${t.firstName.trim()} ${t.lastName.trim()}`.toUpperCase(),
                role: t.roles.join(' y ').toUpperCase(),
                assignments: [{ 
                    course: groupName ? `${courseName} ${groupName}`.toUpperCase() : courseName.toUpperCase(),
                    schoolId: schoolId 
                }],
                schoolId: schoolId,
                photoFile: '',
                uploadedAt: new Date().toISOString()
            }));


            const staffDocRef = doc(db, 'orlas2026_photographers', photographerId, 'staff', schoolId);
            const staffSnap = await getDoc(staffDocRef);
            let currentStaff = staffSnap.exists() ? (staffSnap.data().items || []) : [];
            await setDoc(staffDocRef, { items: [...currentStaff, ...newStaffMembers] }, { merge: true });

            // 2. Gestionar Listado de Alumnos (Archivo)
            let fileData = null;
            if (studentFile) {
                const fileExt = studentFile.name.split('.').pop();
                const fileName = `${schoolId}_${courseName}_${groupName}_LISTA_${Date.now()}.${fileExt}`;
                const storagePath = `orlas2026_photographers/${photographerId}/lists/${schoolId}/${fileName}`;
                const fileRef = ref(storage, storagePath);
                
                await uploadBytes(fileRef, studentFile);
                const downloadUrl = await getDownloadURL(fileRef);
                
                fileData = {
                    course: courseName.toUpperCase(),
                    group: groupName.toUpperCase(),
                    fileUrl: downloadUrl,
                    fileName: studentFile.name,
                    storagePath: storagePath,
                    tutorName: tutorName,
                    uploadedAt: new Date().toISOString()
                };


                // Registrar en la colección de listados para que el fotógrafo lo descargue
                const listDocRef = doc(db, 'orlas2026_photographers', photographerId, 'student_lists', schoolId);
                const listSnap = await getDoc(listDocRef);
                let currentLists = listSnap.exists() ? (listSnap.data().items || []) : [];
                await setDoc(listDocRef, { items: [...currentLists, fileData] }, { merge: true });
            }

            setSubmitted(true);
            Swal.fire({
                icon: 'success',
                title: '¡Envío Completado!',
                text: studentFile 
                    ? 'Los docentes han sido registrados y el listado de alumnos se ha subido correctamente.'
                    : 'Los docentes han sido registrados correctamente.',
                confirmButtonColor: '#10b981'
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Hubo un problema al procesar la solicitud. Por favor, revisa tu conexión e inténtalo de nuevo.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (submitted) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <img 
                        src={isDark ? "logos/logo_white.png" : "logos/logo_negro.png"} 
                        alt="Pujalte Creative Studio" 
                        className="h-10 mx-auto mb-6 opacity-80"
                    />

                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                        <CheckCircle size={48} className="text-emerald-500 animate-bounce-slow" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-black tracking-tight uppercase">¡Datos Recibidos!</h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed">
                            Muchas gracias {tutorName ? tutorName.split(' ')[0] : 'Tutor/a'}. El equipo docente ha sido registrado con éxito para el curso {courseName} {groupName}.
                        </p>
                    </div>
                    <button 
                        onClick={() => window.close()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-2xl w-full transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest text-xs"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-20 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Header Animado */}
            <div className="relative h-64 overflow-hidden bg-indigo-600 flex items-center justify-center text-center p-6">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/20 blur-[80px] rounded-full animate-pulse-slow" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/30 blur-[100px] rounded-full animate-pulse-slow" />
                </div>
                
                <div className="relative space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                        <Sparkles size={14} className="text-amber-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Listado Oficial Orla 2026</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                        EQUIPO <span className="text-indigo-200">DOCENTE</span>
                    </h1>
                    <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap">
                        {schoolName} • {courseName} {groupName}
                    </p>
                </div>
            </div>

            {/* Formulario Principal */}
            <div className="max-w-2xl mx-auto -mt-12 px-4 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {staffList.map((teacher, index) => (
                        <div key={teacher.id} className={`p-8 rounded-[2.5rem] shadow-2xl transition-all border animate-in slide-in-from-bottom-4 duration-500 delay-${index * 100} ${isDark ? 'bg-slate-900/80 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xs">
                                        {index + 1}
                                    </div>
                                    <h2 className="text-xs font-black uppercase tracking-widest text-indigo-500">Docente #{index + 1}</h2>
                                </div>
                                {staffList.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeTeacher(teacher.id)}
                                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nombre</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Ej: Manuel"
                                        value={teacher.firstName}
                                        onChange={(e) => updateTeacher(teacher.id, 'firstName', e.target.value)}
                                        className={`w-full py-4 px-6 rounded-2xl text-xs font-bold uppercase transition-all ${isDark ? 'bg-white/5 border-white/10 focus:bg-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500'} border shadow-sm outline-none`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Apellidos</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Ej: García López"
                                        value={teacher.lastName}
                                        onChange={(e) => updateTeacher(teacher.id, 'lastName', e.target.value)}
                                        className={`w-full py-4 px-6 rounded-2xl text-xs font-bold uppercase transition-all ${isDark ? 'bg-white/5 border-white/10 focus:bg-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500'} border shadow-sm outline-none`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block">Cargo / Función</label>
                                
                                <div className={`p-5 rounded-[2rem] border transition-all ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    {/* Lista de tags seleccionados */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {teacher.roles.length === 0 ? (
                                            <div className="flex items-center gap-2 text-slate-500 py-1 px-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 animate-pulse" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest italic opacity-50">Sin selección</span>
                                            </div>
                                        ) : (
                                            teacher.roles.map(role => (
                                                <span key={role} className="inline-flex items-center gap-2 bg-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-900/20 animate-in zoom-in duration-300">
                                                    {role}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => toggleRole(teacher.id, role)}
                                                        className="hover:text-rose-300 transition-colors"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                    </div>

                                    {/* Selector Compacto */}
                                    <div className="relative group/sel">
                                        <select 
                                            className={`w-full appearance-none bg-transparent border-none py-2 pr-10 text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'CUSTOM') {
                                                    Swal.fire({
                                                        title: 'Añadir Cargo Personalizado',
                                                        input: 'text',
                                                        inputPlaceholder: 'Ej: Coordinador de Proyecto...',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#4f46e5',
                                                        confirmButtonText: 'AÑADIR',
                                                        cancelButtonText: 'Cancelar',
                                                        background: isDark ? '#0f172a' : '#fff',
                                                        color: isDark ? '#fff' : '#000',
                                                        customClass: {
                                                            input: 'custom-swal-input'
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed && result.value) {
                                                            toggleRole(teacher.id, result.value.trim().toUpperCase());
                                                        }
                                                    });
                                                } else if (val) {
                                                    toggleRole(teacher.id, val);
                                                }
                                                e.target.value = '';
                                            }}
                                        >
                                            <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>+ AÑADIR CARGO</option>

                                            {STAFF_ROLES.map(group => (
                                                <optgroup key={group.group} label={group.group.toUpperCase()}>
                                                    {group.roles.map(role => (
                                                        <option 
                                                            key={role} 
                                                            value={role} 
                                                            disabled={teacher.roles.includes(role)}
                                                            className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                                                        >
                                                            {role}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                            <option value="CUSTOM" className="bg-indigo-600 text-white font-black">✨ AÑADIR OTRO CARGO...</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none text-indigo-500/40 group-hover/sel:text-indigo-500 transition-colors">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button 
                        type="button"
                        onClick={addTeacher}
                        className={`w-full py-6 rounded-[2rem] border-2 border-dashed flex items-center justify-center gap-3 transition-all group ${isDark ? 'border-indigo-500/30 hover:bg-indigo-500/5 text-indigo-400' : 'border-indigo-200 hover:bg-indigo-50 text-indigo-600'}`}
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Añadir otro Docente</span>
                    </button>

                    {/* ADJUNTAR LISTADO DE ALUMNOS (NUEVO) */}
                    <div className={`p-8 rounded-[2.5rem] shadow-2xl transition-all border animate-in slide-in-from-bottom-4 duration-500 delay-300 ${isDark ? 'bg-slate-900/80 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500">Listado de Alumnos (Opcional)</h2>
                        </div>
                        
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Si tienes un archivo Excel, PDF o imagen con la lista de alumnos de tu clase, puedes adjuntarlo aquí para agilizar el proceso.
                        </p>

                        <div className="relative">
                            <input 
                                type="file" 
                                id="studentListFile"
                                onChange={(e) => setStudentFile(e.target.files[0])}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                            />

                            <label 
                                htmlFor="studentListFile"
                                className={`flex flex-col items-center justify-center gap-4 py-10 px-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer group ${
                                    studentFile 
                                    ? 'bg-emerald-500/5 border-emerald-500/50' 
                                    : isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                    studentFile ? 'bg-emerald-500 text-white' : isDark ? 'bg-white/5 text-slate-500 group-hover:text-indigo-400' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600'
                                }`}>
                                    {studentFile ? <CheckCircle size={28} /> : <Upload size={28} />}
                                </div>
                                
                                <div className="text-center">
                                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${studentFile ? 'text-emerald-500' : 'text-primary'}`}>
                                        {studentFile ? '¡Archivo seleccionado!' : 'Haz clic para adjuntar archivo'}
                                    </p>
                                    <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">
                                        {studentFile ? studentFile.name : 'PDF, EXCEL, WORD, CSV O IMAGEN'}
                                    </p>

                                </div>
                                
                                {studentFile && (
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setStudentFile(null); }}
                                        className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-2"
                                    >
                                        Eliminar archivo
                                    </button>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="pt-8">

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-6 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-4 active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    PROCESANDO INYECCIÓN...
                                </>
                            ) : (
                                <>
                                    ENVIAR LISTADO
                                </>
                            )}

                        </button>
                    </div>
                </form>
                
                <p className="mt-12 text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-loose opacity-60">
                    Al enviar este formulario confirmas que los datos son correctos.<br />
                    Powered by Pujalte Creative Studio © 2026
                </p>
            </div>
        </div>
    );
};

export default StaffForm;
