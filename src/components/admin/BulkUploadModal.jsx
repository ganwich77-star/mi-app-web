import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Image as ImageIcon, Loader2, Hash, List, Info, Database, Users } from 'lucide-react';
import { storage, db } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * BulkUploadModal
 * Permite subir fotos masivamente asociándolas por número de archivo o por orden.
 */
const BulkUploadModal = ({ isOpen, onClose, photographerId, schools, currentSchoolId }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({});
    const [results, setResults] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    
    // Configuración: modo de emparejamiento
    // 'number' -> busca al alumno con ese photo_file_number (ej: 009.jpg -> Alumno 009)
    // 'sequential' -> asocia las fotos por orden alfabético de alumnos (1ª foto -> 1º alumno)
    const [matchMode, setMatchMode] = useState('number'); 
    
    // 'both' -> busca en ambos
    // 'students' -> solo alumnos
    // 'staff' -> solo docentes
    const [targetGroup, setTargetGroup] = useState('both'); 

    useEffect(() => {
        if (isOpen) {
            setFiles([]);
            setResults([]);
            setProgress({});
            setUploading(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (uploading) return;
        setFiles([]);
        setResults([]);
        setProgress({});
        setUploading(false);
        onClose();
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1600;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    let mimeType = 'image/jpeg';
                    if (file.type === 'image/png') mimeType = 'image/png';
                    else if (file.type === 'image/webp') mimeType = 'image/webp';

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: mimeType,
                            lastModified: Date.now(),
                        }));
                    }, mimeType, 0.80);
                };
            };
        });
    };

    const handleFileSelection = (selectedFiles) => {
        const newList = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
        
        setFiles(prev => {
            const combined = [...prev, ...newList];
            // Eliminar duplicados por nombre
            const unique = [];
            const names = new Set();
            combined.forEach(f => {
                if (!names.has(f.name)) {
                    names.add(f.name);
                    unique.push(f);
                }
            });
            return unique.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        });
        setResults([]);
        setProgress({});
    };

    const handleUpload = async () => {
        if (files.length === 0 || !photographerId) return;
        setUploading(true);
        const newResults = [];

        // 1. CARGA DE DATOS DE COLEGIOS
        const searchList = Array.isArray(schools) ? (schools.length > 0 ? schools : []) : [];
        if (searchList.length === 0 && currentSchoolId) {
            searchList.push({ id: currentSchoolId, name: 'Centro Actual' });
        }

        const schoolStates = {};
        for (const school of searchList) {
            try {
                const [oSnap, sSnap] = await Promise.all([
                    getDoc(doc(db, 'orlas2026_photographers', photographerId, 'orders', school.id)),
                    getDoc(doc(db, 'orlas2026_photographers', photographerId, 'staff', school.id))
                ]);
                
                schoolStates[school.id] = {
                    orders: oSnap.exists() ? (oSnap.data().items || []) : [],
                    staff: sSnap.exists() ? (sSnap.data().items || []) : [],
                    ordersRef: oSnap.ref,
                    staffRef: sSnap.ref,
                    ordersModified: false,
                    staffModified: false
                };
            } catch (e) { console.error(`❌ Error cargando ${school.id}:`, e); }
        }

        // 2. ORDENACIÓN PREVIA PARA MODO SECUENCIAL (Alfabético A-Z por defecto)
        const flattenedStudents = [];
        const flattenedStaff = [];
        
        for (const schoolId in schoolStates) {
            const state = schoolStates[schoolId];
            if (targetGroup === 'both' || targetGroup === 'students') {
                state.orders.forEach((s, idx) => flattenedStudents.push({ ...s, originalIdx: idx, schoolId, _isStudent: true }));
            }
            if (targetGroup === 'both' || targetGroup === 'staff') {
                // Modificar la ordenación de staff para usar la misma lógica que ShootingPanel.jsx (priorizar photo_file_number)
                const staff = (state.staff || []).sort((a, b) => {
                    const numA = (a.photo_file_number || "").toString().replace(/^0+/, '');
                    const numB = (b.photo_file_number || "").toString().replace(/^0+/, '');
                    
                    // Prioridad 1: Comparar por photo_file_number si ambos existen y son números
                    if (numA && numB && !isNaN(numA) && !isNaN(numB)) {
                        const diff = parseInt(numA) - parseInt(numB);
                        if (diff !== 0) return diff; // Si son diferentes, devuelve la diferencia
                    }
                    
                    // Prioridad 2: Si solo uno tiene número, ese va primero
                    if (numA && !isNaN(numA)) return -1; // a tiene número, b no
                    if (numB && !isNaN(numB)) return 1;  // b tiene número, a no

                    // Fallback: Si los números son iguales o no existen/no son comparables, ordenar por nombre
                    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
                    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                flattenedStaff.push(...staff.map((s, idx) => ({ ...s, originalIdx: idx, schoolId, _isStaff: true })));
            }
        }

        // Función para obtener texto de ordenación por apellido (mueve primera palabra al final si no hay coma)
        const getSortName = (n) => {
            const s = (n || '').trim().toUpperCase();
            if (!s || s.includes(',')) return s;
            const p = s.split(' ');
            if (p.length <= 1) return s;
            return p.slice(1).join(' ') + ', ' + p[0]; // "JUAN PEREZ" -> "PEREZ, JUAN"
        };

        // Orden alfabético inteligente para alumnos (por apellido)
        flattenedStudents.sort((a, b) => getSortName(a.studentName).localeCompare(getSortName(b.studentName)));
        
        // Orden para docentes: alineado con ShootingPanel (firstName + lastName)
        flattenedStaff.sort((a, b) => {
            const nameA = ((a.firstName || '') + ' ' + (a.lastName || '')).trim().toUpperCase();
            const nameB = ((b.firstName || '') + ' ' + (b.lastName || '')).trim().toUpperCase();
            return nameA.localeCompare(nameB);
        });

        // 3. PROCESAMIENTO DE ARCHIVOS
        for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
            const file = files[fileIdx];
            const fileName = file.name;
            const fileIdRaw = fileName.split('.')[0].trim();
            const fileIdNormal = fileIdRaw.replace(/^0+/, '') || '0';

            let targets = [];
            let matchReason = '';

            try {
                if (matchMode === 'number') {
                    // Buscar en todas las escuelas cargadas
                    for (const schoolId in schoolStates) {
                        const state = schoolStates[schoolId];
                        
                        // BÚSQUEDA DE TODOS LOS DESTINOS QUE COINCIDAN
                        // Prioridad 1: Coincidencia EXACTA
                        if (targetGroup === 'staff' || targetGroup === 'both') {
                            state.staff.forEach((s, idx) => {
                                if ((s.photo_file_number || "").toString().trim() === fileIdRaw) {
                                    targets.push({ ...s, originalIdx: idx, schoolId, _isStaff: true });
                                }
                            });
                        }
                        if (targetGroup === 'students' || targetGroup === 'both') {
                            state.orders.forEach((s, idx) => {
                                if ((s.photo_file_number || "").toString().trim() === fileIdRaw) {
                                    targets.push({ ...s, originalIdx: idx, schoolId, _isStudent: true });
                                }
                            });
                        }

                        // Si no hay exactas, probar normalizadas
                        if (targets.length === 0) {
                            if (targetGroup === 'students' || targetGroup === 'both') {
                                state.orders.forEach((s, idx) => {
                                    const dbValNormal = (s.photo_file_number || "").toString().replace(/^0+/, '');
                                    const globalRank = (idx + 1).toString();
                                    if ((dbValNormal && dbValNormal === fileIdNormal) || globalRank === fileIdNormal) {
                                        targets.push({ ...s, originalIdx: idx, schoolId, _isStudent: true });
                                    }
                                });
                            }
                            if (targetGroup === 'staff' || targetGroup === 'both') {
                                const studentsCount = state.orders.length;
                                state.staff.forEach((st, idx) => {
                                    const dbValNormal = (st.photo_file_number || "").toString().replace(/^0+/, '');
                                    const globalRank = (studentsCount + idx + 1).toString();
                                    if ((dbValNormal && dbValNormal === fileIdNormal) || globalRank === fileIdNormal) {
                                        targets.push({ ...st, originalIdx: idx, schoolId, _isStaff: true });
                                    }
                                });
                            }
                        }

                        if (targets.length > 0) {
                            matchReason = `nº archivo ${fileIdRaw}`;
                            break; // Se encontraron coincidencias en esta escuela
                        }
                    }
                } else if (matchMode === 'sequential') {
                    const combined = [...flattenedStudents, ...flattenedStaff];
                    if (fileIdx < combined.length) {
                        const targetItem = combined[fileIdx];
                        targets = [targetItem];
                        matchReason = `orden alfabético (${fileIdx + 1}º)`;
                    }
                }

                if (targets.length > 0) {
                    // Procesamos cada destino para este archivo
                    for (const targetItem of targets) {
                        const targetType = targetItem._isStudent ? 'student' : 'staff';
                        const compressedFile = await compressImage(file);
                        const storagePath = `photographers/${photographerId}/photos/${targetItem.id}_${fileName}`;
                        const storageRef = ref(storage, storagePath);
                        const metadata = { contentType: compressedFile.type };
                        const uploadTask = uploadBytesResumable(storageRef, compressedFile, metadata);

                        await new Promise((resolve, reject) => {
                            uploadTask.on('state_changed', 
                                (snapshot) => {
                                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    setProgress(prev => ({ ...prev, [fileName]: p }));
                                }, reject, resolve
                            );
                        });

                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        const schoolState = schoolStates[targetItem.schoolId];
                        
                        if (targetType === 'student') {
                            schoolState.orders[targetItem.originalIdx] = {
                                ...schoolState.orders[targetItem.originalIdx],
                                digitalPhotoUrl: downloadURL,
                                photo_file_number: fileIdRaw,
                                status: 'Producido',
                                updatedAt: new Date().toISOString()
                            };
                            schoolState.ordersModified = true;
                        } else if (targetType === 'staff') {
                            schoolState.staff[targetItem.originalIdx] = {
                                ...schoolState.staff[targetItem.originalIdx],
                                digitalPhotoUrl: downloadURL,
                                photo_file_number: fileIdRaw,
                                status: 'Producido',
                                updatedAt: new Date().toISOString()
                            };
                            schoolState.staffModified = true;
                        }
                        newResults.push({ fileName, status: 'success', message: `✅ ${targetItem.studentName || (targetItem.firstName + ' ' + targetItem.lastName)} (${matchReason})` });
                    }
                } else {
                    newResults.push({ fileName, status: 'error', message: '❌ Sin coincidencia' });
                }
            } catch (err) {
                console.error("❌ Error procesando archivo:", err);
                newResults.push({ fileName, status: 'error', message: `ERROR: ${err.message}` });
            }
        }

        // 4. PERSISTENCIA FINAL
        for (const schoolId in schoolStates) {
            const state = schoolStates[schoolId];
            if (state.ordersModified) await updateDoc(state.ordersRef, { items: state.orders });
            if (state.staffModified) await updateDoc(state.staffRef, { items: state.staff });
        }

        setUploading(false);
        setResults(newResults);
    };

    if (!isOpen) return null;

    return (
        <div 
            onClick={(e) => { if(e.target === e.currentTarget) handleClose(); }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-md"
        >
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header Premium */}
                <div className="p-7 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                            <Upload size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">Subida Masiva Pro</h2>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Asocia fotos de forma inteligente</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 text-white/60 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-7 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                    {/* 1. SELECTOR DE DESTINO Y MODO (Solo si no estamos subiendo ni hay resultados) */}
                    {!uploading && results.length === 0 && (
                        <>
                            <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-[2rem] border border-indigo-100 dark:border-indigo-500/10 space-y-6">
                                {/* A QUIÉN */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} className="text-indigo-500" /> 1. ¿A quién vas a subir fotos?
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button 
                                            onClick={() => setTargetGroup('students')}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${targetGroup === 'students' ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-lg shadow-emerald-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-60'}`}
                                        >
                                            <span className={`text-[10px] font-black uppercase ${targetGroup === 'students' ? 'text-emerald-600' : 'text-slate-500'}`}>Solo Alumnos</span>
                                        </button>
                                        <button 
                                            onClick={() => setTargetGroup('staff')}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${targetGroup === 'staff' ? 'border-amber-500 bg-white dark:bg-slate-800 shadow-lg shadow-amber-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-60'}`}
                                        >
                                            <span className={`text-[10px] font-black uppercase ${targetGroup === 'staff' ? 'text-amber-600' : 'text-slate-500'}`}>Solo Docentes</span>
                                        </button>
                                        <button 
                                            onClick={() => setTargetGroup('both')}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${targetGroup === 'both' ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-60'}`}
                                        >
                                            <span className={`text-[10px] font-black uppercase ${targetGroup === 'both' ? 'text-indigo-600' : 'text-slate-500'}`}>Ambos</span>
                                        </button>
                                    </div>
                                </div>

                                {/* CÓMO (MODO) */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Database size={14} className="text-indigo-500" /> 2. Modo de Emparejamiento
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setMatchMode('number')}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${matchMode === 'number' ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-60'}`}
                                        >
                                            <Hash className={matchMode === 'number' ? 'text-indigo-500' : 'text-slate-400'} size={20} />
                                            <div className="text-center">
                                                <p className={`text-[10px] font-black uppercase ${matchMode === 'number' ? 'text-indigo-600' : 'text-slate-500'}`}>Por Nombre de Archivo</p>
                                                <p className="text-[8px] font-bold text-slate-400">Ej: 101.jpg {"->"} #101</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setMatchMode('sequential')}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${matchMode === 'sequential' ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-60'}`}
                                        >
                                            <List className={matchMode === 'sequential' ? 'text-indigo-500' : 'text-slate-400'} size={20} />
                                            <div className="text-center">
                                                <p className={`text-[10px] font-black uppercase ${matchMode === 'sequential' ? 'text-indigo-600' : 'text-slate-500'}`}>Orden por Apellido</p>
                                                <p className="text-[8px] font-bold text-slate-400">1ª Foto {"->"} 1er Apellido</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Instrucciones Dinámicas */}
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex gap-3 text-[10px] text-indigo-700 dark:text-indigo-300">
                                <Info size={16} className="shrink-0" />
                                <p className="font-bold uppercase tracking-tight leading-normal">
                                    {matchMode === 'number' 
                                        ? "Asegura que el nombre de cada foto coincida con el Nº asignado. El sistema buscará coincidencias en el grupo seleccionado."
                                        : "Las fotos se asignarán por orden alfabético de apellidos. Primero alumnos y luego docentes (si ambos están seleccionados)."
                                    }
                                </p>
                            </div>
                        </>
                    )}

                    {/* 2. DROPZONE / LISTA DE ARCHIVOS / PROGRESO / RESULTADOS */}
                    {!uploading && results.length === 0 ? (
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelection(e.dataTransfer.files); }}
                            className={`border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-100 dark:border-white/5'}`}
                        >
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-500 mb-4">
                                <ImageIcon size={32} />
                            </div>
                            <p className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest text-[11px] mb-1">
                                {files.length > 0 ? `${files.length} archivos listos` : "Suelta tus fotos"}
                            </p>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-6">o haz clic para explorar</p>
                            <input type="file" multiple accept="image/*, .png, .jpg, .jpeg, .webp, image/png, image/jpeg, image/webp" className="hidden" id="bulk-file-input" onChange={(e) => handleFileSelection(e.target.files)} />
                            <div className="flex flex-col items-center gap-4">
                                <label htmlFor="bulk-file-input" className="px-8 py-4 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.5rem] cursor-pointer hover:scale-105 transition-all shadow-xl active:scale-95">
                                    {files.length > 0 ? "Añadir más fotos" : "Seleccionar Fotos"}
                                </label>
                                
                                {files.length > 0 && (
                                    <button 
                                        onClick={() => { setFiles([]); setResults([]); }}
                                        className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                                    >
                                        Limpiar selección
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : uploading ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Procesando {files.length} archivos...</h3>
                                <div className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse">
                                    En curso
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3 w-1/2">
                                            <ImageIcon size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 w-1/2 justify-end">
                                            <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex-1 max-w-[80px]">
                                                <div 
                                                    className="h-full bg-indigo-500 transition-all duration-300"
                                                    style={{ width: `${progress[file.name] || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 w-8 text-right">{Math.round(progress[file.name] || 0)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Resumen del proceso</h3>
                            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {results.map((res, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between border ${res.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                        <div className="flex items-center gap-3">
                                            {res.status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-tight">{res.fileName}</span>
                                                <span className="text-[9px] font-bold opacity-70 uppercase">{res.message}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Visual */}
                <div className="p-7 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex gap-4">
                    {results.length > 0 ? (
                        <button 
                            onClick={handleClose}
                            className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            FINALIZAR Y CERRAR
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleClose}
                                disabled={uploading}
                                className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-30"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleUpload}
                                disabled={uploading || files.length === 0}
                                className="flex-[2] py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:grayscale disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        SUBIENDO...
                                    </>
                                ) : (
                                    <>
                                        INICIAR PROCESO ({files.length})
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
