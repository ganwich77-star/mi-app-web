import React, { useState, useCallback } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { storage, db } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * BulkUploadModal
 * Permite seleccionar múltiples archivos, comprimirlos en el cliente
 * y subirlos a Firebase Storage, vinculándolos automáticamente con las órdenes.
 */
const BulkUploadModal = ({ isOpen, onClose, photographerId, schools, currentSchoolId }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({}); // { fileName: percentage }
    const [results, setResults] = useState([]); // { fileName, status, message }
    const [dragActive, setDragActive] = useState(false);
    const [config, setConfig] = useState({ overwrite: false });

    // Resetear al abrir
    React.useEffect(() => {
        if (isOpen) {
            setFiles([]);
            setResults([]);
            setProgress({});
            setUploading(false);
        }
    }, [isOpen]);

    // Función para cerrar y resetear todo
    const handleClose = () => {
        setFiles([]);
        setResults([]);
        setProgress({});
        setUploading(false);
        onClose();
    };

    // Compresión de imagen simple usando Canvas
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

                    // Redimensionar si es muy grande (max 1600px para equilibrio orla/digital)
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

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    }, 'image/jpeg', 0.75); // Calidad 75% (Ideal para ahorrar espacio)
                };
            };
        });
    };

    const handleFileSelection = (selectedFiles) => {
        const fileList = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
        setFiles(fileList);
        setResults([]);
        setProgress({});
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        const newResults = [];

        console.log("🚀 Iniciando subida masiva...");
        console.log("👤 photographerId:", photographerId);
        console.log("🏫 Colegios cargados en modal:", schools?.length, schools);

        if (!photographerId) {
            setResults([{ fileName: 'General', status: 'error', message: 'ERROR: Falta ID de Fotógrafo en la sesión.' }]);
            setUploading(false);
            return;
        }

        const availableSchools = Array.isArray(schools) ? schools : [];
        if (availableSchools.length === 0) {
            console.warn("⚠️ Atencion: No hay lista de colegios disponible.");
        }

        // Creamos una lista de búsqueda. Si no hay colegios, usamos el colegio actual como fallback.
        const searchList = availableSchools.length > 0 ? availableSchools : (currentSchoolId ? [{ id: currentSchoolId, name: 'Centro Actual (Fallback)' }] : []);

        for (const file of files) {
            try {
                // fileId es el nombre del archivo sin extensión (ej: 0001)
                const fileName = file.name;
                const fileIdRaw = fileName.split('.')[0].trim(); 
                const fileIdNormal = fileIdRaw.replace(/^0+/, '') || '0'; // '0001' -> '1'
                
                const compressedFile = await compressImage(file);
                let foundMatch = false;

                console.log(`--- Procesando archivo: ${fileName} (ID Raw: "${fileIdRaw}" | Normal: "${fileIdNormal}") ---`);

                for (const school of searchList) {
                    if (foundMatch) break;

                    console.log(`  🔍 Buscando en [${school.name}] (ID: ${school.id})`);
                    
                    // A. BUSCAR EN ALUMNOS (ORDERS)
                    const ordersDocRef = doc(db, 'orlas2026_photographers', photographerId, 'orders', school.id);
                    let oSnap;
                    try {
                        oSnap = await getDoc(ordersDocRef);
                    } catch (e) {
                        console.error(`    ❌ Error al leer grupo ${school.id}:`, e);
                        continue;
                    }

                    if (oSnap.exists()) {
                        const items = oSnap.data().items || [];
                        
                        // Calculamos el Ranking Global (igual que en ShootingPanel)
                        // Para alumnos, necesitamos saber cuántos docentes hay en este mismo colegio
                        let staffCount = 0;
                        const staffDocRefForCount = doc(db, 'orlas2026_photographers', photographerId, 'staff', school.id);
                        const sSnapForCount = await getDoc(staffDocRefForCount);
                        if (sSnapForCount.exists()) {
                            staffCount = (sSnapForCount.data().items || []).length;
                        }

                        // Ordenamos alumnos por nombre para determinar su Rank
                        const sortedItems = [...items].sort((a, b) => (a.studentName || '').localeCompare(b.studentName || ''));
                        
                        // Comparación flexible: Exacta (0001 === 0001) o Numérica (0001 === 1)
                        const itemIdx = items.findIndex(item => {
                            const dbValRaw = String(item.photo_file_number || '').trim();
                            const dbValNormal = dbValRaw.replace(/^0+/, '') || '0';
                            
                            // Match por Nº Archivo Foto (Base de datos)
                            if (dbValRaw === fileIdRaw || dbValNormal === fileIdNormal) return true;

                            // Match por Nº ORLA (Fallback dinámico)
                            // El rank de este alumno es su posición en la lista ordenada + el offset de docentes
                            const rank = sortedItems.findIndex(si => si.id === item.id) + 1 + staffCount;
                            return rank.toString() === fileIdNormal;
                        });
                        
                        if (itemIdx !== -1) {
                            foundMatch = true;
                            console.log(`    ✅ ¡ENCONTRADO ALUMNO! Vinculando a: ${items[itemIdx].studentName}`);
                            
                            try {
                                const storagePath = `photographers/${photographerId}/photos/${items[itemIdx].id}_${fileName}`;
                                const storageRef = ref(storage, storagePath);
                                const uploadTask = uploadBytesResumable(storageRef, compressedFile);

                                await new Promise((resolve, reject) => {
                                    uploadTask.on('state_changed', 
                                        (snapshot) => {
                                            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                            setProgress(prev => ({ ...prev, [fileName]: p }));
                                        }, 
                                        (err) => {
                                            console.error("    ❌ Error de Storage:", err);
                                            reject(err);
                                        }, 
                                        () => resolve()
                                    );
                                });

                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                                const newItems = [...items];
                                newItems[itemIdx] = {
                                    ...newItems[itemIdx],
                                    photoFile: downloadURL,
                                    digitalPhotoUrl: downloadURL,
                                    status: 'Producido', 
                                    updatedAt: new Date().toISOString()
                                };

                                await updateDoc(ordersDocRef, { items: newItems });
                                newResults.push({ 
                                    fileName: fileName, 
                                    status: 'success', 
                                    message: `Vinculado a ${newItems[itemIdx].studentName} (${school.name})` 
                                });
                                break; // Salir del bucle de centros para este archivo
                            } catch (err) {
                                console.error("    ❌ Fallo crítico en subida/update:", err);
                                throw err;
                            }
                        }
                    }

                    // B. BUSCAR EN DOCENTES (STAFF)
                    const staffDocRef = doc(db, 'orlas2026_photographers', photographerId, 'staff', school.id);
                    let sSnap;
                    try { sSnap = await getDoc(staffDocRef); } catch (e) { continue; }
                    
                    if (sSnap.exists()) {
                        const items = sSnap.data().items || [];
                        
                        // Ordenamos docentes por nombre Completo (igual que en ShootingPanel)
                        const sortedItems = [...items].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

                        const itemIdx = items.findIndex(item => {
                            const dbValRaw = String(item.photo_file_number || '').trim();
                            const dbValNormal = dbValRaw.replace(/^0+/, '') || '0';

                            // Match por Nº Archivo Foto (Base de datos)
                            if (dbValRaw === fileIdRaw || dbValNormal === fileIdNormal) return true;

                            // Match por Nº ORLA (Fallback dinámico)
                            // Los docentes van primero, su rank es su posición en la lista ordenada + 1
                            const rank = sortedItems.findIndex(si => si.id === item.id) + 1;
                            return rank.toString() === fileIdNormal;
                        });
                        
                        if (itemIdx !== -1) {
                            foundMatch = true;
                            console.log(`    ✅ ¡ENCONTRADO DOCENTE! Vinculando a: ${items[itemIdx].firstName || items[itemIdx].name}`);
                            try {
                                const storagePath = `photographers/${photographerId}/photos/${items[itemIdx].id}_${fileName}`;
                                const storageRef = ref(storage, storagePath);
                                const uploadTask = uploadBytesResumable(storageRef, compressedFile);

                                await new Promise((resolve, reject) => {
                                    uploadTask.on('state_changed', (snapshot) => {
                                        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                        setProgress(prev => ({ ...prev, [fileName]: p }));
                                    }, reject, resolve);
                                });

                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                                const newItems = [...items];
                                newItems[itemIdx] = {
                                    ...newItems[itemIdx],
                                    photoFile: downloadURL,
                                    digitalPhotoUrl: downloadURL, // También para docentes por si acaso
                                    updatedAt: new Date().toISOString()
                                };

                                await updateDoc(staffDocRef, { items: newItems });
                                newResults.push({ 
                                    fileName: fileName, 
                                    status: 'success', 
                                    message: `Vinculado a ${newItems[itemIdx].firstName || 'Docente'} (${school.name})` 
                                });
                            } catch (err) {
                                console.error("    ❌ Fallo en Docente:", err);
                                throw err;
                            }
                        }
                    }
                }

                if (!foundMatch) {
                    console.warn(`  ⚠️ No se encontró match para "${fileIdRaw}" en ninguno de los centros consultados.`);
                    newResults.push({ fileName: fileName, status: 'error', message: 'No se encontró registro con este número en ningún colegio.' });
                }

            } catch (error) {
                console.error("❌ Error subida:", error);
                newResults.push({ 
                    fileName: file.name, 
                    status: 'error', 
                    message: error.code === 'permission-denied' ? 'Error de permisos (Firebase Rules).' : `Error: ${error.message}` 
                });
            }
        }

        setResults(newResults);
        setUploading(false);
    };

    if (!isOpen) return null;

    return (
        <div 
            onClick={(e) => { if(e.target === e.currentTarget) handleClose(); }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
        >
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Subida Masiva de Fotos</h2>
                            <p className="text-indigo-100 text-xs">Asocia fotos automáticamente por número de archivo</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Instrucciones */}
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex gap-3 text-sm text-amber-700 dark:text-amber-300">
                        <AlertCircle size={20} className="shrink-0" />
                        <p>
                            Nombra tus archivos con el número asignado en la ficha del alumno (ej: <strong>101.jpg</strong>). 
                            El sistema las comprimirá y asociará automáticamente.
                        </p>
                    </div>

                    {/* Dropzone */}
                    {!uploading && results.length === 0 && (
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelection(e.dataTransfer.files); }}
                            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-white/10'}`}
                        >
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                                <ImageIcon size={32} />
                            </div>
                            <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">Arrastra tus fotos aquí</p>
                            <p className="text-slate-500 text-sm mb-6">o haz clic para seleccionar archivos</p>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                className="hidden" 
                                id="bulk-file-input" 
                                onChange={(e) => handleFileSelection(e.target.files)}
                            />
                            <label 
                                htmlFor="bulk-file-input"
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Seleccionar Carpeta/Archivos
                            </label>
                        </div>
                    )}

                    {/* File List / Progress */}
                    {files.length > 0 && results.length === 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{files.length} archivos seleccionados</h3>
                                {!uploading && (
                                    <button onClick={() => setFiles([])} className="text-red-500 text-xs font-bold hover:underline">Limpiar todo</button>
                                )}
                            </div>
                            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {files.map((file, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <ImageIcon size={16} className="text-slate-400 shrink-0" />
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{file.name}</span>
                                        </div>
                                        {uploading && (
                                            <div className="flex items-center gap-2 w-24">
                                                <div className="h-1.5 flex-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 transition-all duration-300"
                                                        style={{ width: `${progress[file.name] || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-500 w-6">{Math.round(progress[file.name] || 0)}%</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Resultado de la subida</h3>
                            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {results.map((res, idx) => (
                                    <div key={idx} className={`p-3 rounded-xl flex items-center justify-between ${res.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                                        <div className="flex items-center gap-3">
                                            {res.status === 'success' ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{res.fileName}</span>
                                                <span className={`text-[10px] ${res.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{res.message}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
                    {results.length > 0 ? (
                        <button 
                            onClick={handleClose}
                            className="flex-1 py-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                        >
                            FINALIZAR
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleClose}
                                disabled={uploading}
                                className="flex-1 py-4 text-slate-500 font-bold hover:text-slate-700 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleUpload}
                                disabled={uploading || files.length === 0}
                                className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        SUBIENDO...
                                    </>
                                ) : (
                                    <>
                                        INICIAR SUBIDA ({files.length})
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
