import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users, Hash, ArrowRight, ArrowLeft,
    Sparkles, XCircle, RotateCcw, Tv, Camera, CheckCircle2, Zap, FolderUp,
    ChevronRight, AlertCircle, CreditCard, ChevronDown, ChevronUp, Mail, FileText,
    Package, Plus, LayoutGrid, List, Upload, X, User, Home, Pencil, Wand2,
    Maximize, Maximize2, ZoomIn, Eye, Check
} from 'lucide-react';

import { COURSE_GROUPS, PACKS, EXTRAS, STAFF_ROLES } from '../../constants.js';
import { toTitleCase, getCourseBase, getGroup } from '../../utils/formatters.js';
import BulkUploadModal from './BulkUploadModal.jsx';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { PHOTO_SHAPES, getShapeStyle } from '../../constants/shapes.js';


const ShootingPanel = ({
    orders,
    staff,
    shootFilters,
    setShootFilters,
    shootSearch,
    setShootSearch,
    shootMode,
    setShootMode,
    adminSchool,
    setAdminSchool,
    selectedOrderIds,
    setSelectedOrderIds,
    selectedStaffIds,
    setSelectedStaffIds,
    newStudentForm,
    setNewStudentForm,
    newStaffForm,
    setNewStaffForm,
    setOrderToEdit,
    setStaffAssigning,
    addOrder,
    deleteOrder,
    updateStatus,
    updateOrder,
    bulkUpdateOrders,
    updateStaff,
    addStaff,
    deleteStaff,
    bulkAddOrders,
    bulkAddStaff,
    updateAllOrders,
    updateAllStaff,
    downloadMasterBackup,
    getSchoolName,
    sortedSchools,
    schools,
    settings,
    photographerId,
    configOrla = {},
    setConfigOrla,
    setAdminTab
}) => {

    const [activeStudent, setActiveStudent] = useState(null);
    const [reframingItem, setReframingItem] = useState(null); // { id, type, photoUrl, name }
    const [viewStyle, setViewStyle] = useState('list'); // 'list' | 'grid' | 'gallery'

    const handleAutoReframe = () => {
        if (!reframingItem) return;
        setReframingItem(prev => ({
            ...prev,
            photoConfig: {
                zoom: 1.25,
                x: 0,
                y: -15, 
                rotation: 0
            }
        }));
    };
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [photoNumber, setPhotoNumber] = useState("");
    const [photoPrefix, setPhotoPrefix] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [modalSearch, setModalSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isStaffQuickAddExpanded, setIsStaffQuickAddExpanded] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);
    const [isStudentListExpanded, setIsStudentListExpanded] = useState(false);
    const [isStaffListExpanded, setIsStaffListExpanded] = useState(false); // Faltaba esta declaración
    const [staffViewStyle, setStaffViewStyle] = useState('grid');
    const [showQuickExtras, setShowQuickExtras] = useState(false);
    const [showPaymentSelector, setShowPaymentSelector] = useState(false);
    const [showStatusSelector, setShowStatusSelector] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // 'orders' o 'staff'
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [showExcelMappingModal, setShowExcelMappingModal] = useState(false);
    const [excelColumns, setExcelColumns] = useState([]);
    const [excelContent, setExcelContent] = useState([]);
    const [excelMapping, setExcelMapping] = useState({
        studentName: '',
        lastName: '',
        lastName2: '',
        course: '',
        group: '',
        schoolName: '',
        pack: '',
        phone: '',
        email: '',
        notes: '',
        photoNum: '',
        parentName: '',
        role: '',
        type: ''
    });
    const [uploadingFor, setUploadingFor] = useState(null); // { id, type: 'student' | 'staff' }
    const fileInputRef = useRef(null);
    const [excelDefaults, setExcelDefaults] = useState({
        pack: 'esencial',
        course: '',
        group: '',
        schoolName: ''
    });
    const inputRef = useRef(null);


    // Funciones locales para Alta Rápida
    const allExistingCourses = useMemo(() => {
        const courses = new Set();
        orders.forEach(o => o.course && courses.add(o.course));
        staff.forEach(s => s.course && courses.add(s.course));
        COURSE_GROUPS.forEach(g => {
            g.courses.forEach(c => courses.add(c.name));
        });
        return Array.from(courses).sort();
    }, [orders, staff]);

    const availablePacks = useMemo(() => settings?.packs || PACKS, [settings]);

    const calculateQuickTotal = () => {
        const packId = newStudentForm.packId || newStudentForm.pack;
        const selectedPack = availablePacks.find(p => p.id === packId);
        let total = selectedPack?.price || 0;

        const activeSupplements = settings?.supplements || [];
        (newStudentForm.complements || []).forEach(id => {
            const supp = activeSupplements.find(s => s.id === id);
            if (supp) total += supp.price;
        });

        return total;
    };

    const handleWhatsAppQuickAdd = () => {
        // ... (resto del código de whatsapp)
        if (!newStudentForm.phone) return;

        const packId = newStudentForm.packId || newStudentForm.pack;
        const pack = availablePacks.find(p => p.id === packId);
        const packName = pack ? pack.name : 'Pack no seleccionado';
        const total = calculateQuickTotal();

        const activeSupplements = settings?.supplements || [];
        const supplementsNames = (newStudentForm.complements || [])
            .map(id => activeSupplements.find(s => s.id === id)?.name)
            .filter(Boolean);

        const photographerName = settings?.fiscalName || 'Pujalte Creative Studio';
        const currentYear = 2026;

        const paymentMethodLabel = (newStudentForm.paymentMethod || 'efectivo').toUpperCase();
        const msg = `¡Hola! 👋 Soy *${photographerName}*.\n\n` +
            `Confirmamos el alta de *${newStudentForm.studentName || newStudentForm.name}* para hacerse la foto para la orla de graduación ${currentYear}. 📸\n\n` +
            `📦 *Pack:* ${packName}\n` +
            (supplementsNames.length > 0 ? `✨ *Suplementos:* ${supplementsNames.join(', ')}\n` : '') +
            `💰 *Total pagado:* ${total}€\n\n` +
            `Hemos recibido el dinero en *${paymentMethodLabel}* en el momento de la sesión. Si necesita cualquier aclaración, estamos a su entera disposición.\n\n` +
            `¡Muchas gracias!`;

        const cleanPhone = newStudentForm.phone.replace(/\s+/g, '').replace('+', '');
        window.open(`https://wa.me/34${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleExcelImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            if (data.length === 0) {
                Swal.fire('Error', 'El archivo Excel está vacío', 'error');
                return;
            }

            // Obtener todas las cabeceras posibles del primer registro
            const headers = Object.keys(data[0]);
            setExcelColumns(headers);
            setExcelContent(data);

            // Intento de mapeo automático inteligente
            const autoMap = {
                studentName: headers.find(h => ['NOMBRE', 'NAME', 'ALUMNO', 'STUDENT'].includes(h.toUpperCase())) || '',
                lastName: headers.find(h => ['APELLIDO 1', 'APELLIDO1', 'PRIMER APELLIDO', 'APELLIDO', 'APELLIDOS', 'LAST NAME', 'SURNAME'].includes(h.toUpperCase())) || '',
                lastName2: headers.find(h => ['APELLIDO 2', 'APELLIDO2', 'SEGUNDO APELLIDO', 'SURNAME 2'].includes(h.toUpperCase())) || '',
                course: headers.find(h => ['CURSO', 'NIVEL', 'COURSE', 'CLASS'].includes(h.toUpperCase())) || '',
                group: headers.find(h => ['GRUPO', 'SECTION', 'GROUP', 'LETRA', 'CLASE'].includes(h.toUpperCase())) || '',
                photoNum: headers.find(h => ['FOTO', 'NUMERO', 'NUMBER', 'Nº FOTO', 'NÚMERO FOTO'].includes(h.toUpperCase())) || '',
                parentName: headers.find(h => ['TUTOR', 'PADRE', 'MADRE', 'REPRESENTANTE', 'PARENT'].includes(h.toUpperCase())) || '',
                role: headers.find(h => ['CARGO', 'PUESTO', 'ROLE', 'STAFF', 'POSITION'].includes(h.toUpperCase())) || '',
                type: headers.find(h => ['TIPO', 'CATEGORIA', 'CATEGORY', 'TYPE'].includes(h.toUpperCase())) || '',
                schoolName: headers.find(h => ['CENTRO', 'COLEGIO', 'ESCUELA', 'SCHOOL', 'CENTER'].includes(h.toUpperCase())) || '',
                pack: headers.find(h => ['PACK', 'PAQUETE', 'PRODUCTO', 'PACKAGE'].includes(h.toUpperCase())) || '',
                phone: headers.find(h => ['TELEFONO', 'TELÉFONO', 'PHONE', 'MOBILE', 'MOVIL', 'MÓVIL'].includes(h.toUpperCase())) || '',
                email: headers.find(h => ['EMAIL', 'CORREO', 'MAIL'].includes(h.toUpperCase())) || '',
                notes: headers.find(h => ['NOTAS', 'OBSERVACIONES', 'NOTES', 'COMENTARIOS'].includes(h.toUpperCase())) || ''
            };
            setExcelMapping(autoMap);
            setShowExcelMappingModal(true);
        };
        reader.readAsBinaryString(file);
        // Reset input value to allow re-uploading the same file
        e.target.value = '';
    };

    const processExcelImport = async () => {
        if (!excelMapping.studentName && !excelMapping.role) {
            Swal.fire('Atención', 'Debes mapear al menos el campo de Nombre o Cargo.', 'warning');
            return;
        }

        setShowExcelMappingModal(false);
        
        Swal.fire({
            title: 'Procesando...',
            text: 'Preparando inyección de datos masiva',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const newStudents = [];
        const newStaffMembers = [];
        let count = 0;

        // --- CÁLCULO DE SIGUIENTE NÚMERO DE FICHERO ---
        // Buscamos el número más alto ya asignado en el sistema
        const allExistingNums = [
            ...orders.map(o => parseInt(o.photo_file_number)),
            ...staff.map(s => parseInt(s.photo_file_number))
        ].filter(n => !isNaN(n));
        let nextFileNum = allExistingNums.length > 0 ? Math.max(...allExistingNums) + 1 : 1;

        try {
            for (const row of excelContent) {
                const name = row[excelMapping.studentName] || '';
                const lastName1 = row[excelMapping.lastName] || '';
                const lastName2 = row[excelMapping.lastName2] || '';
                const fullLastName = (lastName1 + ' ' + lastName2).trim();
                const fullName = (name + ' ' + fullLastName).trim().replace(/\s+/g, ' ');
                const courseColumn = row[excelMapping.course] || '';
                const groupColumn = row[excelMapping.group] || '';
                const photoNum = row[excelMapping.photoNum] || '';
                const role = row[excelMapping.role] || '';
                const type = row[excelMapping.type] || '';
                const customSchool = row[excelMapping.schoolName] || '';
                const customPack = row[excelMapping.pack] || '';
                const phone = row[excelMapping.phone] || '';
                const email = row[excelMapping.email] || '';
                const tutorFromExcel = row[excelMapping.parentName] || '';
                const notes = row[excelMapping.notes] || '';

                if (fullName || role || type) {
                    const isStaff = role || (type && type.toString().toUpperCase().includes('DOCENTE'));
                    
                    if (isStaff) {
                        newStaffMembers.push({
                            firstName: name,
                            lastName: fullLastName,
                            role: role || 'DOCENTE',
                            course: courseColumn || excelDefaults.course || shootFilters.course || 'GENERAL',
                            photo_file_number: photoNum?.toString() || '',
                            schoolId: adminSchool,
                            schoolName: customSchool || excelDefaults.schoolName || getSchoolName(adminSchool),
                            phone: phone?.toString() || '',
                            email: email?.toString() || '',
                            notes: notes?.toString() || ''
                        });
                    } else {
                        newStudents.push({
                            studentName: fullName,
                            course: courseColumn || excelDefaults.course || shootFilters.course || 'PENDIENTE',
                            group: groupColumn || excelDefaults.group || shootFilters.group || '',
                            photo_file_number: photoNum?.toString() || '',
                            schoolId: adminSchool,
                            schoolName: customSchool || excelDefaults.schoolName || getSchoolName(adminSchool),
                            parentName: tutorFromExcel || findTutorForClass(courseColumn || excelDefaults.course || shootFilters.course, groupColumn || excelDefaults.group || shootFilters.group) || '',
                            pack: customPack 
                                ? { id: 'custom', label: customPack.toString() } 
                                : availablePacks.find(p => p.id === excelDefaults.pack) 
                                    ? { id: excelDefaults.pack, label: availablePacks.find(p => p.id === excelDefaults.pack).name }
                                    : { id: availablePacks[0]?.id || 'esencial', label: availablePacks[0]?.name || 'Pack Esencial' },
                            phone: phone?.toString() || '',
                            email: email?.toString() || '',
                            notes: notes?.toString() || ''
                        });
                    }
                    count++;
                }
            }

            // --- LÓGICA INTELIGENTE DE DUPLICADOS ---
             const existingStudentMap = new Map(orders.map(o => [o.studentName.toUpperCase().trim(), o]));
             const existingStaffMap = new Map(staff.map(s => [`${s.firstName} ${s.lastName}`.toUpperCase().trim(), s]));
 
             const studentDuplicates = newStudents.filter(s => existingStudentMap.has(s.studentName.toUpperCase().trim()));
             const staffDuplicates = newStaffMembers.filter(s => {
                 const fullName = `${s.firstName} ${s.lastName}`.toUpperCase().trim();
                 return existingStaffMap.has(fullName);
             });
 
             let importStrategy = 'add'; 
 
             if (studentDuplicates.length > 0 || staffDuplicates.length > 0) {
                 const totalDupes = studentDuplicates.length + staffDuplicates.length;
                 
                 // IMPORTANTE: Detener el cargador para que aparezcan los botones
                 Swal.hideLoading();
                 
                 const result = await Swal.fire({
                     title: 'Registros Duplicados Detectados',
                     html: `Se han encontrado <b>${totalDupes}</b> personas que ya están registradas.<br/><br/>¿Qué deseas hacer?`,
                     icon: 'question',
                     showCancelButton: true,
                     showDenyButton: true,
                     confirmButtonText: 'Sobreescribir Datos',
                     denyButtonText: 'Ignorar Duplicados',
                     cancelButtonText: 'Cancelar Importación',
                     confirmButtonColor: '#6366f1',
                     denyButtonColor: '#52b788',
                     reverseButtons: true,
                     allowOutsideClick: false,
                     // Aseguramos que no haya input residual
                     input: undefined 
                 });
 
                 if (result.isConfirmed) importStrategy = 'overwrite';
                 else if (result.isDenied) importStrategy = 'skip';
                 else {
                     Swal.fire('Importación cancelada', '', 'info');
                     return;
                 }
             }

             // Mostrar cargador de nuevo para la fase de inyección
             Swal.fire({
                 title: 'Inyectando datos...',
                 text: 'Finalizando proceso de importación',
                 allowOutsideClick: false,
                 didOpen: () => Swal.showLoading()
             });

            let finalOrders = [...orders];
            let finalStaff = [...staff];
            let addedCount = 0;
            let updatedCount = 0;

            // Procesar Alumnos (ORDEN PRIORITARIO 1)
            newStudents.forEach(newS => {
                const key = newS.studentName.toUpperCase().trim();
                const existing = existingStudentMap.get(key);

                if (existing) {
                    if (importStrategy === 'overwrite') {
                        const finalPhotoNum = newS.photo_file_number || existing.photo_file_number || '';
                        const index = finalOrders.findIndex(o => o.id === existing.id);
                        if (index !== -1) {
                            finalOrders[index] = { 
                                ...existing, 
                                ...newS, 
                                id: existing.id,
                                photo_file_number: finalPhotoNum
                            };
                            updatedCount++;
                        }
                    }
                } else {
                    // Es nuevo: Si no tiene número de foto, se lo asignamos
                    let photoNumToAssign = newS.photo_file_number;
                    if (!photoNumToAssign) {
                        photoNumToAssign = nextFileNum.toString();
                        nextFileNum++;
                    }

                    finalOrders.push({
                        ...newS,
                        photo_file_number: photoNumToAssign,
                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        status: 'Pendiente',
                        timestamp: new Date().toISOString()
                    });
                    addedCount++;
                }
            });

            // Procesar Personal (ORDEN PRIORITARIO 2)
            newStaffMembers.forEach(newSt => {
                const key = `${newSt.firstName} ${newSt.lastName}`.toUpperCase().trim();
                const existing = existingStaffMap.get(key);

                if (existing) {
                    if (importStrategy === 'overwrite') {
                        const finalPhotoNum = newSt.photo_file_number || existing.photo_file_number || '';
                        const index = finalStaff.findIndex(s => s.id === existing.id);
                        if (index !== -1) {
                            finalStaff[index] = { 
                                ...existing, 
                                ...newSt, 
                                id: existing.id,
                                photo_file_number: finalPhotoNum
                            };
                            updatedCount++;
                        }
                    }
                } else {
                    // Es nuevo y no tiene número -> auto-asignar
                    let photoNumToAssign = newSt.photo_file_number;
                    if (!photoNumToAssign) {
                        photoNumToAssign = nextFileNum.toString();
                        nextFileNum++;
                    }

                    finalStaff.push({
                        ...newSt,
                        photo_file_number: photoNumToAssign,
                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: `${newSt.firstName} ${newSt.lastName}`.trim()
                    });
                    addedCount++;
                }
            });

            // Guardar cambios finales
            await updateAllOrders(finalOrders);
            await updateAllStaff(finalStaff);

            // AUTO-ABRIR TABLA SI HAY DATOS
            if (newStudents.length > 0) {
                setViewStyle('list');
                setIsStudentListExpanded(true);
            }
            if (newStaffMembers.length > 0) {
                setStaffViewStyle('list');
                setIsStaffListExpanded(true);
            }

            Swal.fire({
                title: '¡Importación Finalizada!',
                html: `Nuevos registros: <b>${addedCount}</b><br/>Actualizados: <b>${updatedCount}</b>`,
                icon: 'success',
                confirmButtonColor: '#52b788'
            });
        } catch (error) {
            console.error("Error en importación masiva:", error);
            Swal.fire('Error', 'Hubo un problema al inyectar los datos masivamente.', 'error');
        }
    };

    const handleBulkStatusChange = async (type = 'students') => {
        const items = type === 'students' ? filteredOrders : filteredStaff;
        if (items.length === 0) {
            Swal.fire({
                title: 'No hay datos',
                text: 'No hay registros visibles para actualizar en este momento.',
                icon: 'info',
                confirmButtonColor: '#6366f1'
            });
            return;
        }

        const { value: newStatus } = await Swal.fire({
            title: 'Cambio de Estado General',
            html: `Se actualizarán <b>${items.length}</b> registros visibles.<br/><br/>Selecciona el nuevo estado:`,
            input: 'select',
            inputOptions: {
                'Pendiente': 'PENDIENTE PAGO',
                'Pagado': 'HACER FOTO (PAGADO)',
                'Producido': 'LISTO / PRODUCIDO',
                'Entregado': 'ENTREGADO'
            },
            inputPlaceholder: 'Selecciona un estado...',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Aplicar a Todos',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'rounded-[30px] border-none shadow-2xl',
                input: 'premium-select-swal',
                confirmButton: 'btn-primary !px-10 !py-4 !rounded-[20px] !text-[12px]',
                cancelButton: 'btn-ghost !px-10 !py-4 !rounded-[20px] !text-[12px]'
            }
        });

        if (newStatus) {
            Swal.fire({
                title: 'Procesando...',
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false
            });

            if (type === 'students') {
                const updated = orders.map(o => {
                    const isVisible = filteredOrders.some(fo => fo.id === o.id);
                    return isVisible ? { ...o, status: newStatus } : o;
                });
                await updateAllOrders(updated);
            } else {
                const updated = staff.map(s => {
                    const isVisible = filteredStaff.some(fs => fs.id === s.id);
                    return isVisible ? { ...s, status: newStatus, photo_file_number: s.photo_file_number || '' } : s;
                });
                await updateAllStaff(updated);
            }

            Swal.fire({
                icon: 'success',
                title: 'Estados Actualizados',
                text: `Se ha cambiado el estado a ${items.length} registros correctamente.`,
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleBulkAssign = async () => {
        const schoolName = sortedSchools.find(s => s.id === adminSchool)?.name || "Sin Centro seleccionado";
        const groupName = shootFilters.group || "";
        const fullCourseString = groupName ? `${shootFilters.course} ${groupName}` : (shootFilters.course || "Sin Clase seleccionada");

        if (!adminSchool && !shootFilters.course) {
            Swal.fire('Atención', 'Selecciona al menos un Centro o una Clase en los filtros superiores para poder asignar.', 'warning');
            return;
        }

        if (filteredOrders.length === 0 && filteredStaff.length === 0) {
            Swal.fire('Sin resultados', 'No hay alumnos ni docentes visibles que coincidan con tu búsqueda actual.', 'info');
            return;
        }

        const result = await Swal.fire({
            title: 'Asignación Masiva Manual',
            html: `Se inyectarán los siguientes datos a <b>${filteredOrders.length}</b> alumnos y <b>${filteredStaff.length}</b> docentes:<br/><br/>
                   <div class="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p class="text-[11px] font-black uppercase tracking-widest text-primary/60 mb-2">Datos a registrar:</p>
                    <p class="text-[12px] font-bold">🏢 CENTRO: <span class="text-indigo-600">${schoolName.toUpperCase()}</span></p>
                    <p class="text-[12px] font-bold">📚 CLASE: <span class="text-emerald-600">${fullCourseString.toUpperCase()}</span></p>
                   </div><br/>
                   <p class="text-[11px] text-primary/40 italic uppercase font-bold tracking-tighter">Esto sobreescribirá el centro y clase actual de los registros visibles.</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar datos',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#6366f1',
            customClass: {
                popup: 'rounded-[30px]',
                confirmButton: 'rounded-[20px] px-8 py-3 text-[12px] font-black uppercase tracking-widest',
                cancelButton: 'rounded-[20px] px-8 py-3 text-[12px] font-black uppercase tracking-widest'
            }
        });

        if (result.isConfirmed) {
            Swal.fire({ title: 'Sincronizando...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

            try {
                if (filteredOrders.length > 0) {
                    const ids = filteredOrders.map(o => o.id);
                    const updates = {};
                    if (adminSchool) updates.schoolId = adminSchool;
                    if (shootFilters.course) updates.course = fullCourseString;
                    await bulkUpdateOrders(ids, updates);
                }

                if (filteredStaff.length > 0) {
                    const updatedStaff = staff.map(member => {
                        const isTarget = filteredStaff.some(fm => fm.id === member.id);
                        if (isTarget) {
                            return {
                                ...member,
                                schoolId: adminSchool || member.schoolId,
                                course: shootFilters.course ? fullCourseString : member.course
                            };
                        }
                        return member;
                    });
                    await updateAllStaff(updatedStaff);
                }

                Swal.fire('Completado', 'Los datos se han registrado correctamente.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Hubo un problema al realizar la asignación masiva.', 'error');
            }
        }
    };

    const handleSaveQuickAdd = () => {
        // Validación de campos requeridos
        const missingFields = [];
        const studentName = newStudentForm.studentName || newStudentForm.name;
        const packId = newStudentForm.packId || newStudentForm.pack;
        const course = newStudentForm.course || shootFilters.course;

        if (!studentName) missingFields.push('Nombre del Alumno/a');
        if (!course) missingFields.push('Curso');
        if (!packId) missingFields.push('Pack de Selección');

        if (missingFields.length > 0) {
            Swal.fire({
                title: 'Campos incompletos',
                html: `Por favor, completa los siguientes campos obligatorios:<br/><br/><b class="text-red-500">${missingFields.join('<br/>')}</b>`,
                icon: 'warning',
                confirmButtonColor: '#52b788',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const selectedPack = availablePacks.find(p => p.id === packId);
        const total = calculateQuickTotal();

        const orderData = {
            ...newStudentForm,
            studentName: newStudentForm.studentName || newStudentForm.name,
            schoolId: adminSchool,
            schoolName: getSchoolName(adminSchool),
            course: newStudentForm.course || shootFilters.course || 'PENDIENTE',
            group: newStudentForm.group || shootFilters.group || '',
            parentName: newStudentForm.parentName || findTutorForClass(newStudentForm.course || shootFilters.course, newStudentForm.group || shootFilters.group) || '',
            pack: { id: packId, label: selectedPack?.name || packId },
            packId: packId,
            price: total,
            timestamp: new Date().toISOString(),
            status: 'Pendiente',
            paymentMethod: newStudentForm.paymentMethod || 'efectivo'
        };

        addOrder(orderData);

        // Reset form completo
        setNewStudentForm({
            schoolId: '',
            studentName: '',
            name: '',
            parentName: '',
            course: '',
            group: '',
            phone: '',
            email: '',
            packId: '',
            pack: '', // Aseguramos limpieza de ambos
            extras: [],
            complements: [],
            notes: '',
            photoFile: '',
            status: 'Pendiente',
            paymentMethod: 'efectivo'
        });
        setShowQuickExtras(false);
    };

    const handleSaveStaffQuickAdd = () => {
        const missingFields = [];
        if (!newStaffForm.firstName?.trim()) missingFields.push('Nombre');
        if (!newStaffForm.lastName?.trim()) missingFields.push('Apellidos');
        if (!newStaffForm.role?.trim()) missingFields.push('Cargo Principal');
        
        if (missingFields.length > 0) {
            import('sweetalert2').then(({ default: Swal }) => {
                Swal.fire({
                    icon: 'warning',
                    title: 'Faltan datos del docente',
                    text: `Por favor, completa: ${missingFields.join(', ')}`,
                    confirmButtonColor: '#6366f1'
                });
            });
            return;
        }

        // Limpiamos campos temporales antes de guardar
        const { tempCourse, tempGroup, ...staffData } = newStaffForm;
        
        const finalStaffData = {
            ...staffData,
            schoolId: adminSchool || staffData.schoolId
        };

        addStaff(finalStaffData);

        // Reset form
        setNewStaffForm({
            schoolId: '',
            firstName: '',
            lastName: '',
            role: '',
            photoFile: '',
            tempCourse: '',
            tempGroup: '',
            assignments: []
        });
        setIsStaffQuickAddExpanded(false); // Cerramos tras guardar para feedback visual
    };

    const handlePaymentChange = (method) => {
        if (!activeStudent) return;
        updateOrder(activeStudent.id, { paymentMethod: method });
        setActiveStudent(prev => prev?.id === activeStudent.id ? { ...prev, paymentMethod: method } : prev);
        setShowPaymentSelector(false);
    };

    const handleStatusChange = (status) => {
        if (!activeStudent) return;
        updateOrder(activeStudent.id, { status: status });
        setActiveStudent(prev => prev?.id === activeStudent.id ? { ...prev, status: status } : prev);
        setShowStatusSelector(false);
    };

    const handleIndividualFileClick = (id, type) => {
        setUploadingFor({ id, type });
        fileInputRef.current?.click();
    };

    const handleIndividualFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingFor) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const base64 = evt.target.result;
            // En un entorno real, aquí subiríamos a Cloud Storage y obtendríamos la URL
            // Por ahora asociaremos el base64 como preview si el backend lo soporta, o simplemente actualizamos el registro
            const photoData = { digitalPhotoUrl: base64, status: 'production' };
            
            if (uploadingFor.type === 'student') {
                updateOrder(uploadingFor.id, photoData);
                if (activeStudent?.id === uploadingFor.id) {
                    setActiveStudent(prev => ({ ...prev, ...photoData }));
                }
            } else {
                updateStaff(uploadingFor.id, { ...photoData, photoFile: 'Digital' });
            }

            Swal.fire({
                icon: 'success',
                title: 'Foto Actualizada',
                text: 'La fotografía se ha vinculado correctamente al registro.',
                timer: 1500,
                showConfirmButton: false
            });
            setUploadingFor(null);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset
    };

    // Función para calcular el tamaño inteligente del texto
    const getFontSize = (text, isPrefix = false) => {
        const length = text?.length || 0;
        if (isPrefix) {
            if (length > 12) return 'text-xs md:text-sm';
            if (length > 8) return 'text-sm md:text-base';
            if (length > 5) return 'text-xl md:text-2xl';
            return 'text-3xl md:text-4xl';
        }
        if (length > 6) return 'text-5xl md:text-6xl';
        if (length > 4) return 'text-7xl md:text-8xl';
        return 'text-8xl md:text-9xl';
    };

    // Activar/Desactivar a un niño y poner el foco en el input
    const selectStudent = (student) => {
        if (student === null) {
            setActiveStudent(null);
            setIsFocused(false);
            return;
        }
        if (!student) return;
        if (activeStudent?.id === student.id) {
            setActiveStudent(null);
            setIsFocused(false);
            return;
        }
        setActiveStudent(student);
        setPhotoNumber("");
        // Mantenemos el prefijo si ya estaba puesto para ahorrar tiempo al fotógrafo
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Filtrado de pedidos
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        return orders.filter(order => {
            // Filtro por centro
            if (adminSchool && order.schoolId !== adminSchool) return false;

            if (shootSearch) {
                const searchLower = shootSearch.toLowerCase();
                const matchesSearch =
                    order.studentName?.toLowerCase().includes(searchLower) ||
                    order.parentName?.toLowerCase().includes(searchLower) ||
                    order.phone?.includes(searchLower);
                if (!matchesSearch) return false;
            }
            if (shootFilters.course && getCourseBase(order.course) !== shootFilters.course) return false;
            if (shootFilters.group && getGroup(order.course) !== shootFilters.group) return false;
            return true;
        });
    }, [orders, adminSchool, shootSearch, shootFilters]);

    // Filtrado de docentes
    const filteredStaff = useMemo(() => {
        if (!staff || !Array.isArray(staff)) return [];
        const sq = (shootSearch || '').trim().toLowerCase();
        return staff.filter(m => {
            const matchesSearch = !sq || (m.firstName + ' ' + m.lastName + ' ' + (m.name || '')).toLowerCase().includes(sq);
            
            // Verificamos si tiene el curso/grupo en sus asignaciones
            const matchesCourse = !shootFilters.course || (Array.isArray(m.assignments) && m.assignments.some(a => 
                (!adminSchool || a.schoolId === adminSchool) && 
                getCourseBase(a.course) === shootFilters.course && 
                (!shootFilters.group || getGroup(a.course) === shootFilters.group)
            ));
            
            return matchesSearch && matchesCourse;
        });
    }, [staff, adminSchool, shootSearch, shootFilters]);

    // MAPA DE TUTORES PARA AUTO-ASIGNACIÓN
    const tutorMap = useMemo(() => {
        const map = {};
        if (!staff || !Array.isArray(staff)) return map;
        staff.forEach(member => {
            const role = (member.role || '').toUpperCase();
            if (role.includes('TUTOR')) {
                const name = (member.name || `${member.firstName || ''} ${member.lastName || ''}`).trim();
                member.assignments?.forEach(a => {
                    const aBase = getCourseBase(a.course);
                    const aGroup = getGroup(a.course) || a.group;
                    const key = `${aBase}|${aGroup || ''}`.toUpperCase();
                    if (!map[key]) map[key] = name;
                });
            }
        });
        return map;
    }, [staff]);

    // --- LÓGICA DE NUMERACIÓN GLOBAL CORRELATIVA ---
    const globalSequence = useMemo(() => {
        if (!adminSchool) return [];
        // Filtramos todos los registros del centro actual
        const schoolStaff = staff.filter(s => s.schoolId === adminSchool)
            .sort((a, b) => (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName));
        const schoolStudents = orders.filter(o => o.schoolId === adminSchool)
            .sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
        
        // Unimos ambos: Docentes primero, luego Alumnos (O según modo preferido)
        return [...schoolStaff, ...schoolStudents];
    }, [staff, orders, adminSchool]);

    const getGlobalRank = (id) => {
        const idx = globalSequence.findIndex(item => item.id === id);
        return idx !== -1 ? (idx + 1).toString().padStart(4, '0') : '--';
    };

    const findTutorForClass = (courseName, groupLetter) => {
        if (!courseName) return null;
        const key = `${courseName}|${groupLetter || ''}`.toUpperCase();
        return tutorMap[key] || tutorMap[`${courseName.toUpperCase()}|`] || null;
    };

    const handleAutoAssignTutors = () => {
        let count = 0;
        const updated = orders.map(o => {
            const isVisible = filteredOrders.some(fo => fo.id === o.id);
            if (isVisible && !o.parentName) {
                const tutorName = findTutorForClass(o.course, o.group);
                if (tutorName) {
                    count++;
                    return { ...o, parentName: tutorName };
                }
            }
            return o;
        });

        if (count > 0) {
            updateAllOrders(updated);
            Swal.fire({ 
                icon: 'success', 
                title: 'Tutores Asignados', 
                text: `Se ha asignado tutor a ${count} alumnos automáticamente basándose en el personal docente.`, 
                timer: 2000, 
                showConfirmButton: false 
            });
        } else {
            Swal.fire({ 
                icon: 'info', 
                title: 'Sin cambios', 
                text: 'No se encontraron tutores coincidentes para los alumnos sin asignar.', 
                timer: 2000, 
                showConfirmButton: false 
            });
        }
    };

    const handleGlobalAutoNumbering = async () => {
        if (filteredOrders.length === 0 && filteredStaff.length === 0) {
            Swal.fire('Atención', 'No hay registros visibles para numerar.', 'warning');
            return;
        }

        const { value: orderType } = await Swal.fire({
            title: 'Auto-Numeración Global',
            text: 'Selecciona el orden de prelación para la numeración de los registros visibles:',
            input: 'select',
            inputOptions: {
                'ALU-PRO': '1º Alumnos, 2º Profesores',
                'PRO-ALU': '1º Profesores, 2º Alumnos'
            },
            inputValue: 'ALU-PRO',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Aplicar Numeración',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'rounded-[30px]',
                confirmButton: 'rounded-[20px] px-8 py-3 text-[12px] font-black uppercase tracking-widest',
                cancelButton: 'rounded-[18px] px-8 py-3 text-[12px] font-black uppercase tracking-widest'
            }
        });

        if (orderType) {
            Swal.fire({ title: 'Numerando registros...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

            // Preparar listas con flag para distinguir
            const aluList = filteredOrders.map(o => ({ ...o, _isStaff: false }));
            const staffList = filteredStaff.map(s => ({ ...s, _isStaff: true }));

            // Ordenar alfabéticamente
            aluList.sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
            staffList.sort((a, b) => {
                const nameA = a.name || `${a.firstName} ${a.lastName}`;
                const nameB = b.name || `${b.firstName} ${b.lastName}`;
                return nameA.localeCompare(nameB);
            });

            let finalSequence = [];
            if (orderType === 'ALU-PRO') {
                finalSequence = [...aluList, ...staffList];
            } else {
                finalSequence = [...staffList, ...aluList];
            }

            try {
                // Actualizaciones de Alumnos
                const studentUpdates = finalSequence
                    .filter(item => !item._isStaff)
                    .map(item => {
                        const globalIndex = finalSequence.findIndex(fs => !fs._isStaff && fs.id === item.id);
                        const newNum = (finalSequence.indexOf(item) + 1).toString().padStart(4, '0');
                        return updateOrder(item.id, { photo_file_number: newNum });
                    });

                // Actualizaciones de Docentes
                const updatedStaff = staff.map(m => {
                    const match = finalSequence.find(fs => fs._isStaff && fs.id === m.id);
                    if (match) {
                        const newNum = (finalSequence.indexOf(match) + 1).toString().padStart(4, '0');
                        return { ...m, photo_file_number: newNum };
                    }
                    return m;
                });

                if (studentUpdates.length > 0) await Promise.all(studentUpdates);
                if (staffList.length > 0) await updateAllStaff(updatedStaff);

                Swal.fire({
                    icon: 'success',
                    title: '¡Operación Exitosa!',
                    text: `Se han numerado ${finalSequence.length} registros secuencialmente.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error en numeración global:", error);
                Swal.fire('Error', 'No se pudo completar la numeración masiva.', 'error');
            }
        }
    };

    // Grupos únicos para el curso seleccionado (Memoizado para evitar re-calculos innecesarios y cuelgues)
    const availableGroups = useMemo(() => {
        if (!shootFilters?.course) return [];
        const groupMatch = COURSE_GROUPS.find(g => g.courses && g.courses.some(c => c.name === shootFilters.course));
        return groupMatch?.courses?.find(c => c.name === shootFilters.course)?.lines || [];
    }, [shootFilters.course]);

    // Grupos únicos para el curso del formulario de alta rápida de alumnos
    const formAvailableGroups = useMemo(() => {
        if (!newStudentForm?.course) return [];
        const groupMatch = COURSE_GROUPS.find(g => g.courses && g.courses.some(c => c.name === newStudentForm.course));
        return groupMatch?.courses?.find(c => c.name === newStudentForm.course)?.lines || [];
    }, [newStudentForm.course]);

    // Grupos únicos para el curso del formulario de alta rápida de docentes
    const staffFormAvailableGroups = useMemo(() => {
        if (!newStaffForm?.tempCourse) return [];
        const groupMatch = COURSE_GROUPS.find(g => g.courses && g.courses.some(c => c.name === newStaffForm.tempCourse));
        return groupMatch?.courses?.find(c => c.name === newStaffForm.tempCourse)?.lines || [];
    }, [newStaffForm.tempCourse]);

    // Cursos únicos de la escuela
    const activeCourses = useMemo(() => {
        if (!adminSchool) return [];

        // 1. Obtener cursos del catálogo maestro (COURSE_GROUPS)
        const masterCourses = COURSE_GROUPS.flatMap(g => g.courses.map(c => c.name));

        // 2. Obtener cursos que ya existen en los pedidos del centro actual (por si hay personalizados)
        const existingInOrders = orders 
            ? orders
                .filter(o => o.schoolId === adminSchool)
                .map(o => getCourseBase(o.course))
                .filter(c => c && c.toUpperCase() !== 'PENDIENTE')
            : [];

        // Combinar ambos y eliminar duplicados
        const combined = new Set([...masterCourses, ...existingInOrders]);
        
        return [...combined].sort((a, b) => a.localeCompare(b)).map(name => ({ name }));
    }, [orders, adminSchool]);

    const getStaffAssignments = (member) => {
        if (!member.assignments) return [];
        return member.assignments.filter(a => !adminSchool || a.schoolId === adminSchool);
    };

    const handleStartEditStaff = (member) => {
        const initialRoles = member.roles || (member.role ? member.role.split(' • ') : []);
        setStaffAssigning({
            member,
            firstName: member.firstName || member.name?.split(' ')[0] || '',
            lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
            roles: initialRoles,
            tempRole: '',
            assignments: getStaffAssignments(member),
            tempCourse: '',
            tempGroup: '',
            tempFile: member.photo_file_number || '',
            schoolId: member.schoolId || adminSchool || ''
        });
    };

    const handleStartEditOrder = (order) => {
        const courseParts = order.course ? order.course.split(' ') : ['', ''];
        const group = ['A', 'B', 'C', 'D'].includes(courseParts[courseParts.length - 1]) ? courseParts.pop() : '';
        const courseBase = courseParts.join(' ').trim();

        setOrderToEdit({
            ...order,
            studentName: order.studentName || '',
            packId: order.pack?.id || 'manual',
            packQuantity: order.packQuantity || 1,
            tempStatus: order.status || 'Pendiente',
            tempPayment: order.paymentMethod || 'Bizum',
            tempCourse: courseBase,
            tempGroup: group,
            tempPhotoFile: order.photo_file_number || ''
        });
    };

    const getPackName = (packData) => {
        if (!packData) return 'Sin Pack';
        const packId = typeof packData === 'object' ? packData.id : packData;
        const pack = availablePacks.find(p => p.id === packId);
        return pack ? pack.name : (typeof packData === 'object' ? packData.label : packId);
    };

    const handleConfirmPhoto = () => {
        if (!activeStudent || !photoNumber) return;
        const finalPhotoId = `${photoPrefix}${photoNumber}`;
        updateStatus(activeStudent.id, 'production', finalPhotoId);
        setActiveStudent(null);
        setPhotoNumber("");
    };

    return (
        <div className="flex flex-col bg-main transition-colors duration-500">
            {/* TOOLBAR SUPERIOR */}
            <div className="bg-card border-b border-primary/5 p-3 md:p-4 flex flex-col gap-3 md:gap-4 shrink-0 transition-colors text-primary relative z-50">
                <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-4">
                    {/* FILA 1: SELECTORES PRINCIPALES (Una sola línea) */}
                    <div className="flex flex-wrap md:flex-nowrap items-end gap-3 md:gap-4 w-full">
                        {/* Selector Alumnos / Docentes */}
                        <div className="flex flex-col gap-1.5 shrink-0 w-full md:w-auto">
                            <span className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest pl-1">VISTA ACTUAL</span>
                            <div className="flex p-1 rounded-[14px] bg-primary/[0.03] border border-primary/10 md:min-w-[240px] gap-1 h-[48px] transition-all items-center">
                                <button onClick={() => { setShootMode('students'); setShootSearch(''); setIsStudentListExpanded(true); }} className={`flex-1 h-full px-3 rounded-[10px] text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shootMode === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-primary/40 hover:text-primary'}`} title="Modo Alumnos">
                                    <Users size={14} /> Alumnos
                                </button>
                                <button onClick={() => { setShootMode('staff'); setShootSearch(''); setIsStudentListExpanded(true); }} className={`flex-1 h-full px-3 rounded-[10px] text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shootMode === 'staff' ? 'bg-white text-indigo-600 shadow-sm' : 'text-primary/40 hover:text-primary'}`} title="Modo Docentes">
                                    <UserCheck size={14} /> Docentes
                                </button>
                            </div>
                        </div>

                        {/* SECTOR CENTRO */}
                        <div className="filter-item min-w-[200px] md:min-w-[0] flex-[2] md:flex-1 shrink-0 flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest pl-1">CENTRO EDUCATIVO</span>
                            <div className="relative w-full h-[48px]">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 pointer-events-none z-10">
                                    <Home size={14} />
                                </div>
                                <select 
                                    value={adminSchool} 
                                    onChange={e => { 
                                        setAdminSchool(e.target.value); 
                                        setShootFilters(p => ({ ...p, course: '', group: '' })); 
                                    }} 
                                    className="w-full h-full bg-white border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest rounded-xl pl-14 pr-10 outline-none appearance-none cursor-pointer hover:border-indigo-500/30 transition-all shadow-sm py-0 flex items-center"
                                >
                                    <option value="">FILTRAR POR CENTRO</option>
                                    {sortedSchools.map(s => (
                                        <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                            </div>
                        </div>

                        {/* SECTOR CLASE */}
                        <div className="filter-item min-w-[180px] md:min-w-[0] flex-[1.5] md:flex-1 shrink-0 flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest pl-1">CURSO / NIVEL</span>
                            <div className="relative w-full h-[48px]">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 pointer-events-none z-10">
                                    <Hash size={14} />
                                </div>
                                <select 
                                    value={shootFilters.course} 
                                    onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))}
                                    className="w-full h-full bg-white border border-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest rounded-xl pl-14 outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm pr-10 py-0 flex items-center"
                                >
                                    <option value="">TODOS LOS CURSOS</option>
                                    {activeCourses.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                            </div>
                        </div>

                        {/* SECTOR GRUPO */}
                        {shootFilters.course && (
                            <div className="filter-item min-w-[90px] w-[90px] shrink-0 flex flex-col gap-1.5">
                                <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest pl-1">GRUPO</span>
                                <div className="relative w-full h-[48px]">
                                    <select 
                                        value={shootFilters.group} 
                                        onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))}
                                        className="btn-group-selector w-full h-full outline-none appearance-none cursor-pointer transition-all shadow-sm pr-7 text-center text-[11px] font-bold uppercase rounded-xl py-0 flex items-center justify-center"
                                    >
                                        <option value="">GRUPO</option>
                                        {availableGroups.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FILA 2: ACCIONES (Debajo el resto) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-primary/5">
                        <div className="flex items-center gap-3">
                            {/* Botón Asignar */}
                            {((adminSchool && adminSchool !== '') || shootFilters.course) && (
                                <button 
                                    onClick={handleBulkAssign}
                                    className="h-[48px] px-8 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border-2 border-indigo-200/20"
                                >
                                    <Wand2 size={18} />
                                    <span>Asignar</span>
                                </button>
                            )}

                            {/* Botón Reset (X) */}
                            {(shootFilters.course || shootFilters.group || adminSchool) && (
                                <button 
                                    onClick={() => {
                                        setAdminSchool('');
                                        setShootFilters(p => ({ ...p, course: '', group: '' }));
                                    }}
                                    className="w-[48px] h-[48px] flex items-center justify-center bg-white text-red-500 rounded-xl hover:bg-red-50 transition-all border border-red-100 shadow-sm"
                                    title="Limpiar filtros"
                                >
                                    <X size={22} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleGlobalAutoNumbering}
                                className="px-6 h-[48px] bg-white border border-indigo-500/20 text-indigo-600 hover:bg-indigo-50 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Hash size={16} /> <span>Numeración Global</span>
                            </button>
                            <button 
                                onClick={downloadMasterBackup} 
                                className="px-6 h-[48px] bg-amber-500/5 border border-amber-500/20 text-amber-600 hover:bg-amber-500/10 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Database size={16} /> <span>Backup SOS</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <main className="flex-1 flex flex-col relative">
                {shootMode === 'students' && (
                    <div className="flex flex-col h-full">
                        {/* NUEVA SECCIÓN: GESTIÓN DE ARCHIVOS E IMPORTACIÓN */}
                        <div className="px-4 pt-4 shrink-0">
                            <div className="bg-card border border-primary/10 border-l-4 border-l-indigo-500 rounded-[16px] shadow-sm overflow-hidden">
                                <div className="px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                            <FolderUp size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Gestión de Archivos</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider italic">Subida de fotos masiva e importación de listados</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="h-[44px] flex items-center gap-3 px-5 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                <Camera size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-indigo-400 text-[9px] font-black uppercase leading-tight">Fotos Subidas</span>
                                                <span className="text-indigo-700 text-[11px] font-black leading-tight">
                                                    {filteredOrders.filter(o => o.photoFile || o.digitalPhotoUrl).length} / {filteredOrders.length}
                                                </span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                setViewStyle('gallery');
                                                setIsStudentListExpanded(true);
                                            }}
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10 active:scale-95 border border-transparent"
                                            title="Galería: Ver todas las fotos y reencuadrar"
                                        >
                                            <LayoutGrid size={16} />
                                            <span>Galería</span>
                                        </button>

                                        <button 
                                            onClick={() => setShowBulkUpload(true)} 
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md shadow-slate-500/10 active:scale-95 border border-transparent"
                                            title="Subida Masiva: Subir fotos de alumnos o docentes por lote"
                                        >
                                            <Upload size={16} />
                                            <span>Subir Fotos</span>
                                        </button>

                                        <button 
                                            onClick={() => setAdminTab('design')}
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-violet-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-violet-700 transition-all shadow-md shadow-violet-500/10 active:scale-95 border border-transparent"
                                            title="Ver Diseño: Previsualizar estas fotos en el diseño de la orla"
                                        >
                                            <Eye size={16} />
                                            <span>Ver Orla</span>
                                        </button>


                                        
                                        <button 
                                            onClick={() => document.getElementById('excel-import-input').click()}
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 rounded-xl transition-all border border-blue-500/20 font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-sm"
                                            title="Importación Excel: Cargar listado de alumnos desde un archivo .xlsx o .xls"
                                        >
                                            <FileText size={16} />
                                            <span>Importar Excel</span>
                                            <input 
                                                id="excel-import-input"
                                                type="file" 
                                                accept=".xlsx, .xls" 
                                                onChange={handleExcelImport} 
                                                className="hidden" 
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 pt-4 shrink-0">
                            <div className="bg-card border border-primary/10 border-l-4 border-l-blue-500 rounded-[16px] shadow-sm overflow-hidden">
                                <button onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-primary border-b border-primary/5" title={isFiltersExpanded ? "Contraer filtros" : "Expandir filtros y buscador"}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                            <Search size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Filtros de Alumnos</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider italic">Búsqueda rápida y segmentación por curso/grupo</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isFiltersExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                    </div>
                                </button>

                                {isFiltersExpanded && (
                                    <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-5">
                                            <div className="md:col-span-7 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Buscador</p>
                                                <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all group/field">
                                                    <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <Search size={18} />
                                                    </div>
                                                    <input type="text" lang="es" value={shootSearch} onChange={e => setShootSearch(e.target.value)} placeholder="Nombre, padre o teléfono..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-3 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Curso</p>
                                                <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all group/field relative">
                                                    <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <Users size={18} />
                                                    </div>
                                                    <select value={shootFilters.course} onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-[80px]">
                                                        <option value=""></option>
                                                        {activeCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Grupo</p>
                                                <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all group/field relative">
                                                    <div className="px-3 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <Hash size={18} />
                                                    </div>
                                                    <select value={shootFilters.group} onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))} className="flex-1 bg-transparent px-3 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0 text-center">
                                                        <option value=""></option>
                                                        {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                                    </select>
                                                    <div className="absolute right-3 pointer-events-none text-primary/30 group-focus-within/field:text-blue-500 transition-colors">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {adminSchool && (
                            <div className="px-4 pt-4 shrink-0 focus-within:z-50">
                                <div className="bg-card border border-primary/10 border-l-4 border-l-emerald-500 rounded-[16px] overflow-hidden text-primary">
                                    <button onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-primary border-b border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-400/10 rounded-xl text-emerald-500"><Zap size={18} /></div>
                                            <div className="text-left">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-wider">Alta Rápida</h3>
                                                <p className="text-[10px] text-secondary font-bold opacity-60 uppercase">Gestión instantánea e Importación Excel</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {newStudentForm.studentName && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">En curso</span>
                                                </div>
                                            )}
                                            {isQuickAddExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                        </div>
                                    </button>

                                    {isQuickAddExpanded && (
                                        <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                            {/* FILA 1: PADRE Y WHATSAPP */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 border-b border-dashed border-primary/20">
                                                <div className="md:col-span-4 space-y-2">
                                                    <div className="flex items-center justify-between pl-1">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Padre / Madre</p>
                                                        {(newStudentForm.parentName || newStudentForm.phone) && (
                                                            <button
                                                                onClick={() => setNewStudentForm(p => ({ ...p, parentName: '', phone: '' }))}
                                                                className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-tighter transition-colors flex items-center gap-1"
                                                                title="Limpiar datos del tutor"
                                                            >
                                                                <RotateCcw size={10} /> Limpiar
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <UserCheck size={18} />
                                                        </div>
                                                        <input type="text" lang="es" value={newStudentForm.parentName} onChange={e => setNewStudentForm(p => ({ ...p, parentName: e.target.value }))} placeholder="Nombre tutor..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Teléfono Móvil</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Phone size={18} />
                                                        </div>
                                                        <input type="tel" value={newStudentForm.phone} onChange={e => setNewStudentForm(p => ({ ...p, phone: e.target.value }))} placeholder="9 dígitos..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2 flex flex-col justify-end">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-transparent pointer-events-none select-none pl-1 opacity-0">Acción</p>
                                                    <button onClick={handleWhatsAppQuickAdd} disabled={!newStudentForm.phone || (!newStudentForm.studentName && !newStudentForm.name)} className="w-full h-[46px] bg-transparent border border-primary/10 text-primary/50 hover:bg-primary/[0.02] hover:text-primary hover:border-primary/20 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-20 shadow-sm font-bold text-[13px] tracking-wide group" title="Enviar recibo de pedido por WhatsApp">
                                                        <MessageSquare size={16} className="group-hover:animate-bounce" />
                                                        <span>RECIBO</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* FILA 2: ALUMNO, CURSO, GRUPO */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 border-b border-dashed border-primary/20 items-end">
                                                <div className="md:col-span-5 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Nombre Alumno/a</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3.5 border-r border-primary/20 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input type="text" lang="es" value={newStudentForm.studentName || newStudentForm.name} onChange={e => setNewStudentForm(p => ({ ...p, studentName: e.target.value, name: e.target.value }))} placeholder="Nombre completo..." className="flex-1 bg-transparent px-4 py-3.5 text-sm font-bold text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Curso</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3.5 border-r border-primary/20 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <select value={newStudentForm.course} onChange={e => setNewStudentForm(p => ({ ...p, course: e.target.value, group: '' }))} className="flex-1 bg-transparent px-4 py-3.5 text-sm font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-[80px]">
                                                            <option value="">Elegir Curso</option>
                                                            {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Grupo</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-3 py-3.5 border-r border-primary/20 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <Hash size={18} />
                                                        </div>
                                                        <select value={newStudentForm.group} onChange={e => setNewStudentForm(p => ({ ...p, group: e.target.value }))} className="flex-1 bg-transparent px-3 py-3.5 text-sm font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0 text-center">
                                                            <option value="">-</option>
                                                            {formAvailableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                        <div className="absolute right-3 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 items-end border-b border-dashed border-primary/20">
                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Pack Selección</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <Package size={18} />
                                                        </div>
                                                        <select value={newStudentForm.packId || newStudentForm.pack} onChange={e => setNewStudentForm(p => ({ ...p, packId: e.target.value, pack: e.target.value }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-0">
                                                            <option value="">Elegir Pack</option>
                                                            {availablePacks.map(p => <option key={p.id} value={p.id}>{p.id.toUpperCase()}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Forma de Pago</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <select value={newStudentForm.paymentMethod || 'efectivo'} onChange={e => setNewStudentForm(p => ({ ...p, paymentMethod: e.target.value }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-0">
                                                            <option value="efectivo">Efectivo</option>
                                                            <option value="bizum">Bizum</option>
                                                            <option value="card">Tarjeta</option>
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Notas / Observaciones</p>
                                                    <div className="flex items-start bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors self-stretch flex items-center">
                                                            <FileText size={18} />
                                                        </div>
                                                        <textarea value={newStudentForm.notes} onChange={e => setNewStudentForm(p => ({ ...p, notes: e.target.value }))} placeholder="Detalles..." rows={1} className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none resize-none custom-scrollbar" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 flex items-end">
                                                    <button onClick={handleSaveQuickAdd} className="w-full h-[46px] bg-[#52b788] hover:bg-[#40a075] disabled:bg-primary/5 disabled:border disabled:border-primary/10 disabled:text-primary/20 text-white text-[14px] font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2" title="Guardar cambios y dar de alta al alumno">
                                                        <CheckCircle size={18} /> Guardar Alumno
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Isla Contenedora de Alumnos */}
                        <div className="flex-1 px-4 py-4 text-primary flex flex-col items-center">
                            <div className="w-full max-w-[1700px] bg-card rounded-[16px] border border-primary/10 border-l-4 border-l-orange-500 shadow-xl flex flex-col">
                                <div onClick={() => setIsStudentListExpanded(!isStudentListExpanded)} className="w-full p-4 md:p-5 border-b border-primary/5 flex justify-between items-center shrink-0 hover:bg-primary/[0.02] transition-colors cursor-pointer text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                Listado de Alumnos 
                                                {shootFilters.course && (
                                                    <span className="text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md text-[10px] border border-orange-500/10">
                                                        {shootFilters.course} {shootFilters.group && `- GRUPO ${shootFilters.group}`}
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">{filteredOrders?.length || 0} alumnos encontrados</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isStudentListExpanded && filteredOrders.length > 0 && (
                                            <div className="hidden md:flex items-center gap-3 mr-3" onClick={e => e.stopPropagation()}>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    Swal.fire({
                                                        title: '¿Auto-Numerar Alumnos?',
                                                        text: `Se asignarán números del 0001 al ${filteredOrders.length.toString().padStart(4, '0')} a los alumnos visibles.`,
                                                        icon: 'question',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#6366f1',
                                                        cancelButtonColor: '#94a3b8',
                                                        confirmButtonText: 'Sí, Numerar',
                                                        cancelButtonText: 'Cancelar',
                                                        customClass: {
                                                            popup: 'rounded-[30px] border-none shadow-2xl',
                                                            confirmButton: 'btn-primary !px-10 !py-4 !rounded-[20px] !text-[12px]',
                                                            cancelButton: 'btn-ghost !px-10 !py-4 !rounded-[20px] !text-[12px]'
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            // Mostramos un cargador porque esto va a la base de datos
                                                            Swal.fire({ title: 'Numerando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                                                            
                                                            Promise.all(filteredOrders.map((o, index) => {
                                                                const newNum = (index + 1).toString().padStart(4, '0');
                                                                return updateOrder(o.id, { photo_file_number: newNum });
                                                            })).then(() => {
                                                                Swal.fire({ icon: 'success', title: '¡Hecho!', text: 'Numeración guardada en la base de datos.', timer: 1500, showConfirmButton: false });
                                                            });
                                                        }
                                                    });
                                                }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-2" title="Asignar números de foto 0001, 0002... a los alumnos filtrados">
                                                    <Hash size={15} /> Auto-Numerar
                                                </button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAutoAssignTutors();
                                                }} className="px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] font-black tracking-wider flex items-center gap-2 hover:bg-orange-500/20 transition-colors text-orange-600 shadow-sm" title="Asignar Tutores automáticamente según personal docente">
                                                    <UserCheck size={14} /> Auto-Tutor
                                                </button>
                                            </div>
                                        )}
                                        {isStudentListExpanded && (
                                            <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-primary/[0.02] border border-primary/10 shadow-sm mr-2" onClick={e => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => setViewStyle('gallery')}
                                                    className={`h-8 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${viewStyle === 'gallery' ? 'bg-indigo-600 shadow-sm text-white' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`}
                                                    title="Modo Galería"
                                                >
                                                    <LayoutGrid size={14} /> <span className="text-[9px] font-black uppercase">Galería</span>
                                                </button>
                                                <button onClick={() => setViewStyle('grid')} className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${viewStyle === 'grid' ? 'bg-white shadow-sm text-slate-900 border border-primary/5' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Cuadrícula">
                                                    <LayoutGrid size={16} />
                                                </button>
                                                <button onClick={() => setViewStyle('list')} className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${viewStyle === 'list' ? 'bg-white shadow-sm text-slate-900 border border-primary/5' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} title="Lista / Edición">
                                                    <List size={18} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/5 transition-colors">
                                            {isStudentListExpanded ? <ChevronUp size={20} className="text-primary/40" /> : <ChevronDown size={20} className="text-primary/40" />}
                                        </div>
                                    </div>
                                </div>
                                {isStudentListExpanded && (
                                    <div className="flex flex-col flex-1 animate-in slide-in-from-top-2 duration-300">
                                        {viewStyle === 'gallery' ? (
                                            <div className="p-4 md:p-6 w-full animate-in fade-in duration-500">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                                    {filteredOrders.map(order => (
                                                        <div 
                                                            key={order.id} 
                                                            onClick={() => {
                                                                if (order.digitalPhotoUrl || order.photoFile) {
                                                                    setReframingItem({ 
                                                                        id: order.id, 
                                                                        type: 'student', 
                                                                        photoUrl: order.digitalPhotoUrl || order.photoFile, 
                                                                        name: order.studentName 
                                                                    });
                                                                }
                                                            }}
                                                            className="relative aspect-[3/4] bg-primary/5 rounded-2xl border border-primary/10 overflow-hidden group/gallery hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer"
                                                        >
                                                            {order.digitalPhotoUrl || order.photoFile ? (
                                                                <div className="w-full h-full relative p-2">
                                                                    <div 
                                                                        className="w-full h-full overflow-hidden shadow-sm"
                                                                        style={getShapeStyle(configOrla.photoShape || 'rect34', 120, 160)}
                                                                    >
                                                                        <img 
                                                                            src={order.digitalPhotoUrl || order.photoFile} 
                                                                            className="w-full h-full object-cover transition-transform group-hover/gallery:scale-110" 
                                                                            alt={order.studentName} 
                                                                        />
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity flex flex-col justify-end p-3 rounded-2xl">
                                                                        <p className="text-[10px] font-black text-white uppercase truncate">{order.studentName}</p>
                                                                        <div className="flex gap-2 mt-2">
                                                                            <button 
                                                                                className="flex-1 py-1.5 bg-white text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                                                                            >
                                                                                <Maximize2 size={12} /> Reencuadrar
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md shadow-sm z-20 border border-white/20">
                                                                        {getGlobalRank(order.id)}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-primary/20 gap-2 p-4">
                                                                     <Camera size={24} />
                                                                     <span className="text-[9px] font-black uppercase text-center">Sin Foto Registrada</span>
                                                                     <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleIndividualFileClick(order.id, 'student'); }}
                                                                        className="mt-2 px-3 py-1 bg-white border border-primary/10 text-primary/40 rounded-lg text-[8px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                     >
                                                                        Subir Ahora
                                                                     </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : viewStyle === 'grid' ? (
                                    <div className="p-4 md:p-5 w-full">
                                        {/* Grid forzado a 8 columnas */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 content-start">
                                            {filteredOrders.map((order) => {
                                                const isPhotoSelected = activeStudent?.id === order.id;
                                                const isBulkSelected = selectedOrderIds.includes(order.id);
                                                const hasPhoto = order.status === 'production' || order.photoFile;
                                                return (
                                                    <div key={order.id} className="relative group/card">
                                                        <button 
                                                            onClick={() => selectStudent(order)} 
                                                            className={`w-full relative flex flex-col items-center p-4 rounded-[16px] border transition-all duration-300 active:scale-95 ${isPhotoSelected ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500/20 z-10 scale-[1.02]' : isBulkSelected ? 'border-orange-300 bg-orange-50/30' : 'border-primary/10 bg-card hover:border-primary/30 hover:shadow-md'}`}
                                                        >
                                                            <div 
                                                                className={`w-14 h-14 flex flex-col items-center justify-center mb-3 overflow-hidden transition-all shadow-sm ${isPhotoSelected ? 'bg-orange-100 text-orange-600' : isBulkSelected ? 'bg-orange-100/50 text-orange-500' : 'bg-primary/5 text-primary/40'} border-2 ${order.digitalPhotoUrl || order.photoFile?.toString().startsWith('http') ? 'border-emerald-500/30' : 'border-transparent'}`}
                                                                style={getShapeStyle(configOrla.photoShape || 'rect34', 56, 56)}
                                                            >
                                                                {order.digitalPhotoUrl ? (
                                                                    <img src={order.digitalPhotoUrl} className="w-full h-full object-cover" alt="Alumno" />
                                                                ) : order.photoFile?.toString().startsWith('http') ? (
                                                                    <img src={order.photoFile} className="w-full h-full object-cover" alt="Alumno" />
                                                                ) : hasPhoto ? (
                                                                    <Camera size={20} className="text-emerald-500" />
                                                                ) : (
                                                                    <Users size={20} />
                                                                )}
                                                            </div>
                                                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md shadow-sm z-20 border border-white/20">
                                                                {getGlobalRank(order.id)}
                                                            </div>
                                                            {/* Botón de subida rápida en Grid */}
                                                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleIndividualFileClick(order.id, 'student'); }}
                                                                    className="p-1.5 bg-white/90 hover:bg-emerald-500 hover:text-white rounded-lg text-emerald-600 transition-all border border-emerald-100 shadow-sm"
                                                                    title="Actualizar Foto"
                                                                >
                                                                    <Upload size={12} />
                                                                </button>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-center text-primary leading-tight line-clamp-2 w-full uppercase">{order.studentName}</p>
                                                            <span className="text-[9px] font-medium text-primary/50 mt-1 uppercase tracking-wider">{order.course}</span>
                                                        </button>
                                                        
                                                        {/* Checkbox para selección masiva en Grid */}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                                                            }}
                                                            className={`absolute top-2 left-2 w-6 h-6 rounded-lg border transition-all flex items-center justify-center z-20 ${isBulkSelected ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white/80 border-primary/10 text-primary/10 hover:border-orange-300 opacity-0 group-hover/card:opacity-100 backdrop-blur-sm'}`}
                                                        >
                                                            <CheckSquare size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full overflow-hidden">
                                        <table className="w-full text-left border-collapse table-fixed">
                                            <thead className="bg-white sticky top-0 md:top-0 z-[110] border-b-2 border-primary/10 shadow-sm">
                                                <tr className="bg-white">
                                                    <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[40px] text-center bg-white">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
                                                                    setSelectedOrderIds([]);
                                                                } else {
                                                                    setSelectedOrderIds(filteredOrders.map(o => o.id));
                                                                }
                                                            }}
                                                            className="flex items-center justify-center w-full h-full text-primary/20 hover:text-orange-500 transition-colors"
                                                        >
                                                            {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare size={18} className="text-orange-500" /> : <Square size={18} />}
                                                        </button>
                                                    </th>
                                                    <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[50px] text-center bg-white">Nº ORLA</th>
                                                    <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[60px] text-center bg-white">Foto</th>
                                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[25%] bg-white text-left">Alumno / Tutor</th>
                                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[180px] bg-white">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-secondary">Pack</span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const firstPack = filteredOrders[0]?.pack;
                                                                    if (!firstPack) {
                                                                        Swal.fire({
                                                                            title: 'Atención',
                                                                            text: 'Selecciona primero un pack para el primer alumno para poder replicarlo.',
                                                                            icon: 'warning'
                                                                        });
                                                                        return;
                                                                    }
                                                                    Swal.fire({
                                                                        title: '¿Sincronizar Packs?',
                                                                        text: `Se aplicará "${firstPack.label || firstPack}" a todos los alumnos mostrados.`,
                                                                        icon: 'question',
                                                                        showCancelButton: true,
                                                                        confirmButtonColor: '#10b981',
                                                                        confirmButtonText: 'Sí, aplicar a todos'
                                                                    }).then((result) => {
                                                                        if (result.isConfirmed) {
                                                                            const ids = filteredOrders.map(o => o.id);
                                                                            bulkUpdateOrders(ids, { pack: firstPack });
                                                                        }
                                                                    });
                                                                }}
                                                                className="bg-primary/5 hover:bg-orange-500 hover:text-white text-primary/40 p-1.5 rounded-lg transition-colors"
                                                                title="Sincronizar packs"
                                                            >
                                                                <Wand2 size={12} />
                                                            </button>
                                                        </div>
                                                    </th>
                                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[150px] text-center bg-white">
                                                        <div className="flex items-center justify-center gap-1.5 translate-x-1.5">
                                                            <span>Estado</span>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleBulkStatusChange('students'); }}
                                                                className="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 p-1.5 rounded-lg transition-colors border border-rose-500/10"
                                                                title="Cambio masivo de estado"
                                                            >
                                                                <CheckCircle size={12} />
                                                            </button>
                                                        </div>
                                                    </th>
                                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[120px] text-center bg-white">Nº Archivo</th>
                                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[100px] text-right bg-white">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map((order, idx) => (
                                                    <tr key={order.id} className={`relative z-0 border-b border-primary/5 hover:bg-primary/[0.01] transition-colors group ${selectedOrderIds.includes(order.id) ? 'bg-orange-50/70' : ''} ${activeStudent?.id === order.id ? 'ring-2 ring-inset ring-orange-500/50 bg-orange-50' : ''}`}>
                                                        <td className="py-4 px-3 text-center align-middle">
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                                                            }} className="text-primary/20 hover:text-orange-500 transition-colors">
                                                                {selectedOrderIds.includes(order.id) ? <CheckSquare size={18} className="text-orange-500" /> : <Square size={18} />}
                                                            </button>
                                                        </td>
                                                        <td className="py-4 px-3 text-center align-middle">
                                                            <span className="text-[10px] font-mono font-black text-primary/30 group-hover:text-orange-500 transition-colors">
                                                                {getGlobalRank(order.id)}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-3 text-center align-middle">
                                                            <div className="relative group/photo mx-auto w-12 h-12">
                                                                <div 
                                                                    onClick={() => handleIndividualFileClick(order.id, 'student')}
                                                                    style={getShapeStyle(configOrla.photoShape || 'rect34', 48, 48)}
                                                                    className={`w-full h-full overflow-hidden shadow-sm flex items-center justify-center border transition-all cursor-pointer ${(order.digitalPhotoUrl || (order.photoFile?.toString().startsWith('http'))) ? 'border-emerald-500/20 hover:border-emerald-500 scale-110' : 'border-primary/5 bg-primary/5 hover:border-indigo-300'}`}
                                                                    title="Clic para subir/cambiar foto"
                                                                >
                                                                    {order.digitalPhotoUrl ? (
                                                                        <img src={order.digitalPhotoUrl} className="w-full h-full object-cover transition-opacity group-hover/photo:opacity-40" alt="Previsualización" />
                                                                    ) : order.photoFile?.toString().startsWith('http') ? (
                                                                        <img src={order.photoFile} className="w-full h-full object-cover transition-opacity group-hover/photo:opacity-40" alt="Previsualización" />
                                                                    ) : (
                                                                        <Camera size={16} className="text-primary/10 group-hover/photo:text-indigo-500" />
                                                                    )}
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity bg-black/20">
                                                                        <Upload size={14} className="text-white drop-shadow-md" />
                                                                    </div>
                                                                </div>

                                                                {(order.digitalPhotoUrl || order.photoFile) && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setReframingItem({ 
                                                                                id: order.id, 
                                                                                type: 'student', 
                                                                                photoUrl: order.digitalPhotoUrl || order.photoFile, 
                                                                                name: order.studentName 
                                                                            });
                                                                        }}
                                                                        className="absolute -right-2 -bottom-2 w-7 h-7 bg-white text-orange-600 rounded-full shadow-lg border border-primary/10 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all hover:scale-110 z-10"
                                                                        title="Reencuadrar foto"
                                                                    >
                                                                        <Maximize2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-3 overflow-hidden">
                                                            <div className="flex flex-col gap-1 min-w-0">
                                                                <input 
                                                                    type="text" 
                                                                    value={order.studentName || ''} 
                                                                    onChange={(e) => updateOrder(order.id, { studentName: e.target.value.toUpperCase() })}
                                                                    className="bg-transparent border-none p-0 text-[12px] font-black text-slate-800 uppercase focus:ring-0 focus:bg-white/50 rounded px-1 -ml-1 w-full"
                                                                />
                                                                <div className="flex items-center gap-1">
                                                                    <User size={8} className="text-slate-400 shrink-0" />
                                                                    <input 
                                                                        type="text" 
                                                                        value={order.parentName || ''} 
                                                                        onChange={(e) => updateOrder(order.id, { parentName: e.target.value.toUpperCase() })}
                                                                        placeholder="SIN TUTOR"
                                                                        className="bg-transparent border-none p-0 text-[9px] font-bold text-slate-400 uppercase focus:ring-0 focus:bg-white/50 rounded px-1 -ml-1 w-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>


                                                        <td className="py-4 px-3 align-middle">
                                                            <div className="relative group/pack w-full">
                                                                <select 
                                                                    value={order.pack?.id || order.pack || ''} 
                                                                    onChange={(e) => {
                                                                        const selectedPack = availablePacks.find(p => p.id === e.target.value);
                                                                        if (selectedPack) {
                                                                            updateOrder(order.id, { pack: { id: selectedPack.id, label: selectedPack.name } });
                                                                        } else if (e.target.value === 'manual') {
                                                                            updateOrder(order.id, { pack: { id: 'manual', label: 'Personalizado' } });
                                                                        }
                                                                    }}
                                                                    className={`w-full appearance-none bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-tight px-3 py-2 rounded-lg border transition-all cursor-pointer outline-none ${
                                                                        (order.pack?.id || order.pack) ? 'border-emerald-500/20 hover:border-emerald-500' : 'border-rose-200 bg-rose-50 text-rose-600 animate-pulse'
                                                                    }`}
                                                                >
                                                                    <option value="" disabled>PACK?</option>
                                                                    {availablePacks.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                    <option value="manual">PERSONALIZADO</option>
                                                                </select>
                                                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500/40 pointer-events-none group-hover/pack:text-emerald-500" />
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-3 text-center align-middle">
                                                            <div className="relative inline-flex items-center">
                                                                <select 
                                                                    value={order.status || 'Pendiente'} 
                                                                    onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                                                                >
                                                                    <option value="Pendiente">PENDIENTE PAGO</option>
                                                                    <option value="Pagado">HACER FOTO (PAGADO)</option>
                                                                    <option value="Producido">LISTO / PRODUCIDO</option>
                                                                    <option value="Entregado">ENTREGADO</option>
                                                                </select>
                                                                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 min-w-[130px] transition-all shadow-sm border border-black/5 ${
                                                                    order.status === 'Entregado' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                                                                    order.status === 'Producido' ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 
                                                                    order.status === 'Pagado' || order.paymentMethod ? 'bg-amber-500 text-white shadow-amber-500/20' : 
                                                                    'bg-rose-500 text-white shadow-rose-500/20'
                                                                }`}>
                                                                    <div className="bg-white/20 p-1 rounded-md shrink-0">
                                                                        {order.status === 'Entregado' ? <CheckCircle2 size={12} /> : 
                                                                         order.status === 'Producido' ? <Package size={12} /> : 
                                                                         order.status === 'Pagado' || order.paymentMethod ? <Camera size={12} /> : 
                                                                         <AlertCircle size={12} />}
                                                                    </div>
                                                                    <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">
                                                                        {order.status === 'Entregado' ? 'ENTREGADO' : 
                                                                         order.status === 'Producido' ? 'PRODUCIDO' : 
                                                                         order.status === 'Pagado' || order.paymentMethod ? 'HACER FOTO' : 
                                                                         'PENDIENTE'}
                                                                    </span>
                                                                    <ChevronDown size={10} className="ml-auto opacity-60" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center align-middle">
                                                            <div className="flex items-center justify-center relative group/input mx-auto w-[100px]">
                                                                <Hash size={11} className="absolute left-3 text-orange-500 opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
                                                                <input 
                                                                    type="text" 
                                                                    value={order.photo_file_number || ''} 
                                                                    onChange={(e) => updateOrder(order.id, { photo_file_number: e.target.value })}
                                                                    placeholder={(idx + 1).toString().padStart(4, '0')}
                                                                    className="w-full bg-white border border-primary/10 rounded-lg pl-8 pr-2 py-1.5 text-[12px] font-black text-center text-primary placeholder:text-primary/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-right align-middle">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button onClick={() => selectStudent(order)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-100 shadow-sm" title="Modo Disparo">
                                                                    <Camera size={14} />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleStartEditOrder(order); }} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100 rounded-lg transition-colors shadow-sm" title="Editar Ficha del Alumno">
                                                                    <Pencil size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

        {shootMode === 'staff' && (
            <div className="flex flex-col h-full overflow-hidden animate-fade-in text-primary">
                {adminSchool && (
                    <>
                        {/* GESTIÓN DE ARCHIVOS PARA DOCENTES */}
                        <div className="px-4 mb-4 shrink-0">
                            <div className="bg-card border border-primary/10 border-l-4 border-l-emerald-500 rounded-[16px] shadow-sm overflow-hidden">
                                <div className="px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                            <FolderUp size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Gestión de Archivos (Docentes)</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider italic">Subida de fotos e importación de listado docente</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="h-[44px] flex items-center gap-3 px-5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Camera size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-emerald-400 text-[9px] font-black uppercase leading-tight">Fotos Subidas</span>
                                                <span className="text-emerald-700 text-[11px] font-black leading-tight">
                                                    {filteredStaff.filter(s => s.photoFile || s.digitalPhotoUrl).length} / {filteredStaff.length}
                                                </span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                setViewStyle('gallery');
                                                setIsStaffListExpanded(true);
                                            }}
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border border-transparent"
                                            title="Galería Docentes: Ver todas las fotos y reencuadrar"
                                        >
                                            <LayoutGrid size={16} />
                                            <span>Galería</span>
                                        </button>

                                        <button 
                                            onClick={() => setShowBulkUpload(true)} 
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md shadow-slate-500/10 active:scale-95 border border-transparent"
                                        >
                                            <Upload size={16} />
                                            <span>Subir Fotos</span>
                                        </button>


                                        
                                        <button 
                                            onClick={() => document.getElementById('excel-import-input-staff').click()}
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 rounded-xl transition-all border border-emerald-500/20 font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-sm"
                                        >
                                            <FileText size={16} />
                                            <span>Importar Excel</span>
                                            <input 
                                                id="excel-import-input-staff"
                                                type="file" 
                                                accept=".xlsx, .xls" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) handleExcelImport(file);
                                                }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 shrink-0 focus-within:z-50">
                                <div className="bg-card border border-primary/10 border-l-4 border-l-emerald-500 rounded-[16px] overflow-hidden text-primary shadow-sm">
                                    <button onClick={() => setIsStaffQuickAddExpanded(!isStaffQuickAddExpanded)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-primary border-b border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-400/10 rounded-xl text-emerald-500"><Zap size={18} /></div>
                                            <div className="text-left">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-wider">Alta Rápida Docente</h3>
                                                <p className="text-[10px] text-secondary font-bold opacity-60 uppercase">Nombre, apellidos y cargo instantáneo</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-4 mr-4">
                                                {newStaffForm.firstName && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">En curso</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isStaffQuickAddExpanded ? <ChevronUp size={20} className="text-primary/20" /> : <ChevronDown size={20} className="text-primary/20" />}
                                        </div>
                                    </button>

                                    {isStaffQuickAddExpanded && (
                                        <div className="px-5 pb-5 border-t border-primary/5 animate-in slide-in-from-top-2 duration-300">
                                            {/* FILA 1: NOMBRE, APELLIDOS Y CARGO */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 pb-5 border-b border-dashed border-primary/20 align-end">
                                                <div className="md:col-span-3 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Nombre</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input type="text" value={newStaffForm.firstName} onChange={e => setNewStaffForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-5 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Apellidos</p>
                                                    <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/field">
                                                        <div className="px-4 py-3 border-r border-primary/10 text-primary/30 group-focus-within/field:text-emerald-500 transition-colors">
                                                            <Users size={18} />
                                                        </div>
                                                        <input type="text" value={newStaffForm.lastName} onChange={e => setNewStaffForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-primary placeholder:text-primary/20 outline-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-4 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1">Cargo / Función</p>
                                                    <div className="flex items-center bg-transparent border border-primary/20 rounded-[14px] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all group/select relative">
                                                        <div className="px-4 py-3 border-r border-primary/20 text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <UserCheck size={18} />
                                                        </div>
                                                        <select value={newStaffForm.role} onChange={e => setNewStaffForm(p => ({ ...p, role: e.target.value }))} className="flex-1 bg-transparent px-4 py-3 text-[13px] font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-10 min-w-0">
                                                            <option value="">Seleccionar Cargo</option>
                                                            {Object.entries(STAFF_ROLES).map(([key, value]) => (
                                                                <option key={key} value={value}>{key}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 pointer-events-none text-primary/30 group-focus-within/select:text-emerald-500 transition-colors">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FILA 2: ASIGNACIÓN DE CLASES (DINÁMICA) */}
                                            <div className="pt-5 border-b border-dashed border-primary/20 pb-5">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 pl-1 mb-3 flex items-center gap-2">
                                                    <Users size={12} /> Asignación de Clases y Grupos
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {newStaffForm.assignments.map((asg, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group/asg">
                                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                                                {asg.course} {asg.group && `· ${asg.group}`}
                                                            </span>
                                                            <button 
                                                                onClick={() => setNewStaffForm(p => ({ ...p, assignments: p.assignments.filter((_, i) => i !== idx) }))}
                                                                className="text-indigo-400 hover:text-rose-500 transition-colors"
                                                                title="Eliminar esta asignación de clase"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {newStaffForm.assignments.length === 0 && (
                                                        <p className="text-[10px] font-bold text-primary/20 uppercase tracking-wider italic py-1">Sin clases asignadas aún</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-primary/[0.02] p-4 rounded-2xl border border-primary/5">
                                                    <div className="md:col-span-5 space-y-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 pl-1">Elegir Curso</p>
                                                        <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all group/sel relative">
                                                            <div className="px-3 py-2 border-r border-primary/10 text-primary/30 group-focus-within/sel:text-emerald-500 transition-colors">
                                                                <LayoutGrid size={16} />
                                                            </div>
                                                            <select value={newStaffForm.tempCourse} onChange={e => setNewStaffForm(p => ({ ...p, tempCourse: e.target.value, tempGroup: '' }))} className="flex-1 bg-transparent px-3 py-2 text-[12px] font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0">
                                                                <option value="">Curso...</option>
                                                                {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                            </select>
                                                            <div className="absolute right-3 pointer-events-none text-primary/30"><ChevronDown size={14} /></div>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-3 space-y-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 pl-1">Grupo</p>
                                                        <div className="flex items-center bg-transparent border border-primary/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all group/sel relative">
                                                            <div className="px-3 py-2 border-r border-primary/10 text-primary/30 group-focus-within/sel:text-emerald-500 transition-colors">
                                                                <Hash size={16} />
                                                            </div>
                                                            <select value={newStaffForm.tempGroup} onChange={e => setNewStaffForm(p => ({ ...p, tempGroup: e.target.value }))} className="flex-1 bg-transparent px-3 py-2 text-[12px] font-bold uppercase outline-none appearance-none cursor-pointer text-primary pr-8 min-w-0 text-center">
                                                                <option value="">-</option>
                                                                {staffFormAvailableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                                            </select>
                                                            <div className="absolute right-3 pointer-events-none text-primary/30"><ChevronDown size={14} /></div>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <button 
                                                            onClick={() => {
                                                                if (!newStaffForm.tempCourse) return;
                                                                const newAsg = { schoolId: adminSchool, course: newStaffForm.tempCourse, group: newStaffForm.tempGroup };
                                                                setNewStaffForm(p => ({
                                                                    ...p,
                                                                    assignments: [...p.assignments.filter(a => !(a.course === newAsg.course && a.group === newAsg.group)), newAsg],
                                                                    tempCourse: '',
                                                                    tempGroup: ''
                                                                }));
                                                            }}
                                                            disabled={!newStaffForm.tempCourse}
                                                            className="w-full h-[40px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-sm"
                                                            title="Vincular este curso al docente seleccionado"
                                                        >
                                                            <Plus size={14} /> Añadir Clase
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FILA 3: GUARDAR */}
                                            <div className="pt-5 flex justify-end">
                                                <button onClick={handleSaveStaffQuickAdd} disabled={!newStaffForm.firstName || !newStaffForm.lastName || !newStaffForm.role} className="w-full md:w-auto px-10 h-[46px] bg-[#52b788] hover:bg-[#40a075] disabled:bg-primary/5 disabled:border disabled:border-primary/10 disabled:text-primary/20 text-white text-[14px] font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2" title="Crear y guardar nuevo perfil docente en este centro">
                                                    <CheckCircle2 size={18} /> Guardar Docente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        <div className="flex-1 px-4 py-4 text-primary flex flex-col items-center">
                            <div className="w-full max-w-[1700px] bg-card rounded-[16px] border border-primary/10 border-l-4 border-l-indigo-500 shadow-xl flex flex-col">
                                <div 
                                    onClick={() => setIsStaffListExpanded(!isStaffListExpanded)} 
                                    className="w-full p-4 md:p-5 border-b border-primary/5 flex justify-between items-center shrink-0 hover:bg-primary/[0.02] transition-colors cursor-pointer text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                                            <UserCheck size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Listado de Docentes</h2>
                                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">
                                                {filteredStaff.length} docentes encontrados
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isStaffListExpanded && (
                                            <div className="flex items-center gap-3">
                                                <div className="hidden md:flex items-center gap-3 mr-3" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            Swal.fire({
                                                                title: '¿Auto-Numerar Docentes?',
                                                                text: `Se asignarán números del 0001 al ${filteredStaff.length.toString().padStart(4, '0')} a los docentes visibles.`,
                                                                icon: 'question',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#6366f1',
                                                                cancelButtonColor: '#6b7280',
                                                                confirmButtonText: 'Sí, Numerar',
                                                                cancelButtonText: 'Cancelar'
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    const updated = staff.map(m => {
                                                                        const fIndex = filteredStaff.findIndex(fm => fm.id === m.id);
                                                                        if (fIndex !== -1) {
                                                                            return { ...m, photo_file_number: (fIndex + 1).toString().padStart(4, '0') };
                                                                        }
                                                                        return m;
                                                                    });
                                                                    updateAllStaff(updated);
                                                                    Swal.fire({ icon: 'success', title: 'Numeración Aplicada', text: 'Se ha asignado el Nº de foto secuencial a los docentes.', timer: 1500, showConfirmButton: false });
                                                                }
                                                            });
                                                        }} 
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-2" 
                                                        title="Asignar números de foto 0001, 0002... a los docentes filtrados"
                                                    >
                                                        <Hash size={15} /> Auto-Numerar
                                                    </button>
                                                </div>
                                                <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-primary/[0.02] border border-primary/10 shadow-sm mr-2" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => setViewStyle('gallery')}
                                                        className={`h-8 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${viewStyle === 'gallery' ? 'bg-indigo-600 shadow-sm text-white' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`}
                                                        title="Modo Galería"
                                                    >
                                                        <LayoutGrid size={14} /> <span className="text-[9px] font-black uppercase">Galería</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => { setViewStyle('list'); setStaffViewStyle('grid'); }} 
                                                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${viewStyle !== 'gallery' && staffViewStyle === 'grid' ? 'bg-white shadow-sm text-slate-900 border border-primary/5' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} 
                                                        title="Cuadrícula"
                                                    >
                                                        <LayoutGrid size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setViewStyle('list'); setStaffViewStyle('list'); }} 
                                                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${viewStyle !== 'gallery' && staffViewStyle === 'list' ? 'bg-white shadow-sm text-slate-900 border border-primary/5' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} 
                                                        title="Lista"
                                                    >
                                                        <List size={18} />
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setAdminTab('design'); }}
                                                    className="h-[36px] px-4 bg-violet-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                                                >
                                                    <Eye size={14} /> Ver Orla
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/5 transition-colors">
                                            {isStaffListExpanded ? <ChevronUp size={20} className="text-primary/40" /> : <ChevronDown size={20} className="text-primary/40" />}
                                        </div>
                                    </div>
                                </div>

                                {isStaffListExpanded && (
                                    <div className="flex-1 custom-scrollbar p-0">
                                        {viewStyle === 'gallery' ? (
                                            <div className="p-4 md:p-6 w-full animate-in fade-in duration-500">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                                    {filteredStaff.map(member => (
                                                        <div 
                                                            key={member.id} 
                                                            onClick={() => {
                                                                if (member.digitalPhotoUrl || member.photoFile) {
                                                                    setReframingItem({ 
                                                                        id: member.id, 
                                                                        type: 'staff', 
                                                                        photoUrl: member.digitalPhotoUrl || member.photoFile, 
                                                                        name: `${member.firstName} ${member.lastName}` 
                                                                    });
                                                                }
                                                            }}
                                                            className="relative aspect-[3/4] bg-emerald-50/50 rounded-2xl border border-emerald-100 overflow-hidden group/gallery hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer"
                                                        >
                                                            {member.digitalPhotoUrl || member.photoFile ? (
                                                                <div className="w-full h-full relative p-2">
                                                                    <div 
                                                                        className="w-full h-full overflow-hidden shadow-sm"
                                                                        style={getShapeStyle(configOrla.photoShape || 'rect34', 120, 160)}
                                                                    >
                                                                        <img 
                                                                            src={member.digitalPhotoUrl || member.photoFile} 
                                                                            className="w-full h-full object-cover transition-transform group-hover/gallery:scale-110" 
                                                                            alt={member.name} 
                                                                        />
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity flex flex-col justify-end p-3 rounded-2xl">
                                                                        <p className="text-[10px] font-black text-white uppercase truncate">{member.firstName} {member.lastName}</p>
                                                                        <div className="flex gap-2 mt-2">
                                                                            <button 
                                                                                className="flex-1 py-1.5 bg-white text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1"
                                                                            >
                                                                                <Maximize2 size={12} /> Reencuadrar
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded-md shadow-sm z-20 border border-white/20">
                                                                        {getGlobalRank(member.id)}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200 gap-2 p-4">
                                                                     <Camera size={24} />
                                                                     <span className="text-[9px] font-black uppercase text-center">Sin Foto Registrada</span>
                                                                     <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleIndividualFileClick(member.id, 'staff'); }}
                                                                        className="mt-2 px-3 py-1 bg-white border border-emerald-100 text-emerald-400 rounded-lg text-[8px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                     >
                                                                        Subir Ahora
                                                                     </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : staffViewStyle === 'grid' ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 content-start p-4 md:p-5 pb-20">
                                                {filteredStaff.map(member => {
                                                    const isSelected = activeStudent?.id === member.id;
                                                    const isBulkSelected = selectedStaffIds.includes(member.id);
                                                    const hasPhoto = member.photo_file_number;
                                                    
                                                    return (
                                                        <div key={member.id} className="relative group/card">
                                                            <button 
                                                                onClick={() => selectStudent({ ...member, isStaff: true, studentName: member.name || `${member.firstName} ${member.lastName}` })}
                                                                className={`w-full relative flex flex-col items-center p-4 rounded-[16px] border transition-all duration-300 active:scale-95 ${
                                                                    isSelected 
                                                                        ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/10 z-10 scale-[1.02]' 
                                                                        : isBulkSelected 
                                                                            ? 'border-indigo-300 bg-indigo-50/30' 
                                                                            : 'border-primary/10 bg-card hover:border-indigo-500/30 hover:shadow-md'
                                                                }`}
                                                            >
                                                                <div 
                                                                    className={`w-14 h-14 flex flex-col items-center justify-center mb-3 overflow-hidden transition-all shadow-sm ${
                                                                        isSelected ? 'bg-indigo-100 text-indigo-600' : isBulkSelected ? 'bg-indigo-100/50 text-indigo-500' : 'bg-primary/5 text-primary/40'
                                                                    } border-2 ${member.digitalPhotoUrl || member.photoFile?.toString().startsWith('http') ? 'border-emerald-500/30' : 'border-transparent'}`}
                                                                    style={getShapeStyle(configOrla.photoShape || 'rect34', 56, 56)}
                                                                >
                                                                    {member.digitalPhotoUrl ? (
                                                                        <img src={member.digitalPhotoUrl} className="w-full h-full object-cover" alt="Docente" />
                                                                    ) : member.photoFile?.toString().startsWith('http') ? (
                                                                        <img src={member.photoFile} className="w-full h-full object-cover" alt="Docente" />
                                                                    ) : hasPhoto ? (
                                                                        <Camera size={20} className="text-emerald-500" />
                                                                    ) : (
                                                                        <User size={20} />
                                                                    )}
                                                                </div>

                                                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md shadow-sm z-20 border border-white/20">
                                                                    {getGlobalRank(member.id)}
                                                                </div>
                                                                {/* Botón de subida rápida en Grid Docentes */}
                                                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleIndividualFileClick(member.id, 'staff'); }}
                                                                        className="p-1.5 bg-white/90 hover:bg-emerald-500 hover:text-white rounded-lg text-emerald-600 transition-all border border-emerald-100 shadow-sm"
                                                                        title="Actualizar Foto"
                                                                    >
                                                                        <Upload size={12} />
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="flex flex-col items-center w-full min-w-0">
                                                                    <p className="text-[11px] font-bold text-center text-primary leading-tight line-clamp-2 w-full uppercase">
                                                                        {member.firstName} {member.lastName}
                                                                    </p>
                                                                    <span className={`mt-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                                                        hasPhoto ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                                    }`}>
                                                                        {hasPhoto ? member.photo_file_number : 'PENDIENTE'}
                                                                    </span>
                                                                </div>
                                                            </button>

                                                            {/* Checkbox para selección masiva */}
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                                                }}
                                                                className={`absolute top-2 left-2 w-7 h-7 rounded-lg border transition-all flex items-center justify-center z-20 ${
                                                                    isBulkSelected ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' : 'bg-white/90 border-primary/10 text-primary/10 hover:border-indigo-300 opacity-0 group-hover/card:opacity-100 backdrop-blur-sm'
                                                                }`}
                                                            >
                                                                <CheckSquare size={16} />
                                                            </button>

                                                            {/* Icono de Editar rápido */}
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                                                                <div className="p-1.5 bg-primary/5 hover:bg-indigo-500 hover:text-white rounded-lg text-primary/30 transition-all cursor-pointer border border-primary/5">
                                                                    <Pencil size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="w-full overflow-hidden">
                                                <table className="w-full text-left border-collapse table-fixed">
                                                    <thead className="bg-white sticky top-0 md:top-0 z-[110] border-b-2 border-primary/10 shadow-sm">
                                                        <tr className="bg-white">
                                                            <th className="py-4 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[60px] text-center bg-white">
                                                                <button 
                                                                    onClick={() => {
                                                                        if (selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0) {
                                                                            setSelectedStaffIds([]);
                                                                        } else {
                                                                            setSelectedStaffIds(filteredStaff.map(m => m.id));
                                                                        }
                                                                    }}
                                                                    className="flex items-center justify-center w-full h-full text-primary/20 hover:text-indigo-500 transition-colors"
                                                                >
                                                                    {selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0 ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} />}
                                                                </button>
                                                            </th>
                                                            <th className="py-4 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[60px] text-center bg-white border-r border-primary/5">Nº ORLA</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-primary/40 text-center w-[60px] bg-white">Foto</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[20%] bg-white">Docente</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 text-center w-[20%] bg-white">Cargo / Función</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 text-center w-[150px] bg-white">
                                                                <div className="flex items-center justify-center gap-1.5 translate-x-1.5">
                                                                    <span>Estado</span>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleBulkStatusChange('staff'); }}
                                                                        className="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 p-1.5 rounded-lg transition-colors border border-rose-500/10"
                                                                        title="Cambio masivo de estado"
                                                                    >
                                                                        <CheckCircle size={12} />
                                                                    </button>
                                                                </div>
                                                            </th>
                                                            <th className="py-3 px-3 text-center text-[10px] font-black uppercase tracking-wider text-primary/40 w-[100px] bg-white">Nº Archivo</th>
                                                            <th className="py-3 px-3 text-right text-[10px] font-black uppercase tracking-wider text-primary/40 w-[100px] bg-white">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-primary/5">
                                                        {filteredStaff.map((member, idx) => {
                                                            const isPhotoSelected = activeStudent?.id === member.id;
                                                            const hasPhoto = !!member.photoFile || !!member.photo_file_number;
                                                            return (
                                                                <tr key={member.id} className={`relative z-0 hover:bg-primary/[0.01] transition-colors group ${isPhotoSelected ? 'ring-2 ring-inset ring-primary/50 bg-primary/[0.03]' : ''} ${selectedStaffIds.includes(member.id) ? 'bg-indigo-50/50' : ''}`}>
                                                                    <td className="py-4 px-5 text-center">
                                                                        <button onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                                                        }} className="text-primary/40 hover:text-indigo-500 transition-colors">
                                                                            {selectedStaffIds.includes(member.id) ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} />}
                                                                        </button>
                                                                    </td>
                                                                    <td className="py-4 px-5 text-center">
                                                                        <span className="text-[11px] font-mono font-black text-indigo-500">{getGlobalRank(member.id)}</span>
                                                                    </td>
                                                                    <td className="py-4 px-3 text-center align-middle">
                                                                        <div 
                                                                            className="relative group/photo mx-auto w-12 h-12"
                                                                        >
                                                                            <div 
                                                                                onClick={() => handleIndividualFileClick(member.id, 'staff')}
                                                                                style={getShapeStyle(configOrla.photoShape || 'rect34', 48, 48)}
                                                                                className={`w-full h-full overflow-hidden shadow-sm flex items-center justify-center border transition-all cursor-pointer ${(member.digitalPhotoUrl || (member.photoFile?.toString().startsWith('http'))) ? 'border-emerald-500/20 hover:border-emerald-500 scale-110' : 'border-primary/5 bg-primary/5 hover:border-indigo-300'}`}
                                                                                title="Clic para subir/cambiar foto"
                                                                            >
                                                                                {member.digitalPhotoUrl ? (
                                                                                    <img src={member.digitalPhotoUrl} className="w-full h-full object-cover transition-opacity group-hover/photo:opacity-40" alt="Docente" />
                                                                                ) : member.photoFile?.toString().startsWith('http') ? (
                                                                                    <img src={member.photoFile} className="w-full h-full object-cover transition-opacity group-hover/photo:opacity-40" alt="Docente" />
                                                                                ) : (
                                                                                    <Camera size={16} className="text-primary/10 group-hover/photo:text-indigo-500" />
                                                                                )}
                                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity bg-black/20">
                                                                                    <Upload size={14} className="text-white drop-shadow-md" />
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {(member.digitalPhotoUrl || member.photoFile) && (
                                                                                <button 
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setReframingItem({ 
                                                                                            id: member.id, 
                                                                                            type: 'staff', 
                                                                                            photoUrl: member.digitalPhotoUrl || member.photoFile, 
                                                                                            name: member.firstName + ' ' + member.lastName 
                                                                                        });
                                                                                    }}
                                                                                    className="absolute -right-2 -bottom-2 w-7 h-7 bg-white text-indigo-600 rounded-full shadow-lg border border-primary/10 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all hover:scale-110 z-10"
                                                                                    title="Reencuadrar foto"
                                                                                >
                                                                                    <Maximize2 size={12} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-5">
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <input 
                                                                                    type="text" 
                                                                                    value={member.firstName || ''} 
                                                                                    onChange={(e) => updateStaff(member.id, { firstName: e.target.value.toUpperCase() })}
                                                                                    className="bg-transparent border-none p-0 text-xs font-black text-primary uppercase focus:ring-0 focus:bg-primary/5 rounded px-1 -ml-1 w-full"
                                                                                />
                                                                                <input 
                                                                                    type="text" 
                                                                                    value={member.lastName || ''} 
                                                                                    onChange={(e) => updateStaff(member.id, { lastName: e.target.value.toUpperCase() })}
                                                                                    className="bg-transparent border-none p-0 text-xs font-black text-primary uppercase focus:ring-0 focus:bg-primary/5 rounded px-1 w-full"
                                                                                />
                                                                            </div>
                                                                            <p className="text-[9px] font-bold text-primary/40 uppercase mt-0.5">{member.assignments?.[0]?.course || 'General'}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-3 text-center">
                                                                        <span className="px-2 py-1 bg-primary/5 text-primary/60 rounded-lg text-[9px] font-black uppercase tracking-tight border border-primary/5 truncate block">
                                                                            {member.role || 'DOCENTE'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-3 text-center">
                                                                        <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm border border-black/5 mx-auto w-[130px] ${
                                                                            hasPhoto ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                                                                        }`}>
                                                                            <div className="bg-white/20 p-1 rounded-md shrink-0">
                                                                                {hasPhoto ? <Camera size={12} /> : <AlertCircle size={12} />}
                                                                            </div>
                                                                            <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">
                                                                                {hasPhoto ? 'FOTO LISTA' : 'SIN FOTO'}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-3 text-center align-middle">
                                                                        <div className="flex items-center justify-center relative group/input mx-auto w-[100px]">
                                                                            <Hash size={11} className="absolute left-3 text-indigo-500 opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
                                                                            <input 
                                                                                type="text" 
                                                                                value={member.photo_file_number || ''} 
                                                                                onChange={(e) => updateStaff(member.id, { photo_file_number: e.target.value })}
                                                                                placeholder={(idx + 1).toString().padStart(4, '0')}
                                                                                className="w-full bg-white border border-primary/10 rounded-lg pl-8 pr-2 py-1.5 text-[12px] font-black text-center text-primary placeholder:text-primary/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-2 px-3 text-right align-middle">
                                                                        <div className="flex items-center justify-end gap-1.5">
                                                                            <button onClick={() => selectStudent({ ...member, isStaff: true, studentName: member.name || `${member.firstName} ${member.lastName}` })} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors border border-indigo-100 shadow-sm" title="Modo Disparo">
                                                                                <Camera size={14} />
                                                                            </button>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleStartEditStaff(member); }} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100 rounded-lg shadow-sm transition-colors" title="Editar Ficha del Docente">
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                Swal.fire({
                                                                                    title: '¿Eliminar docente?',
                                                                                    text: `Se eliminará permanentemente a ${member.firstName} ${member.lastName}.`,
                                                                                    icon: 'warning',
                                                                                    showCancelButton: true,
                                                                                    confirmButtonColor: '#ef4444',
                                                                                    confirmButtonText: 'Sí, borrar',
                                                                                    cancelButtonText: 'Cancelar'
                                                                                    }).then((result) => {
                                                                                        if (result.isConfirmed) {
                                                                                            deleteStaff(member.id);
                                                                                        }
                                                                                    });
                                                                                }} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-lg shadow-sm transition-colors" title="Eliminar Registro">
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </main>

            {/* MODAL DISPARO ACTIVO */}
            {
                activeStudent && (
                    <div className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300 cursor-pointer text-primary" onClick={(e) => e.target === e.currentTarget && selectStudent(null)}>
                        <div className="w-full max-w-4xl bg-card rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20 cursor-default relative">
                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="w-full lg:w-2/5 p-8 lg:p-12 bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col justify-between text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        {settings?.logo ? <img src={settings.logo} alt="Logo" className="w-48 h-48 object-contain drop-shadow-2xl brightness-0 invert" /> : <Camera size={200} />}
                                    </div>
                                    <div className="relative z-10 lg:mt-4">
                                        <div 
                                            className="w-full aspect-[3/4] max-w-[200px] bg-white/10 flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden mx-auto lg:mx-0 group transition-all duration-500 hover:scale-105 hover:border-white/40"
                                            style={getShapeStyle(configOrla.photoShape || 'rect34', 200, 260)}
                                        >
                                            {activeStudent.digitalPhotoUrl ? (
                                                <img src={activeStudent.digitalPhotoUrl} className="w-full h-full object-cover animate-fade-in" alt="Foto Alumno" />
                                            ) : activeStudent.photoFile?.toString().startsWith('http') ? (
                                                <img src={activeStudent.photoFile} className="w-full h-full object-cover animate-fade-in" alt="Foto Alumno" />
                                            ) : settings?.logo ? (
                                                <img src={settings.logo} alt="Logo" className="w-20 h-20 object-contain drop-shadow-xl brightness-0 invert opacity-40" />
                                            ) : (
                                                <Camera size={48} className="text-white/20" />
                                            )}
                                        </div>
                                        <h1 className={`text-3xl lg:text-5xl font-black uppercase tracking-tight leading-none italic text-white drop-shadow-xl ${activeStudent.photoFile ? 'mb-2' : 'mb-6'}`}>
                                            {activeStudent.studentName}
                                        </h1>
                                        {activeStudent.photoFile && (
                                            <p className="text-3xl lg:text-4xl font-black tracking-widest mb-6 text-white drop-shadow-xl break-all">
                                                {activeStudent.photoFile}
                                            </p>
                                        )}
                                        <div className="p-5 bg-black/20 rounded-3xl backdrop-blur-md border border-white/10 text-white mb-6 mt-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Centro y Curso</p>
                                            <p className="text-sm font-bold leading-tight mb-1">{getSchoolName(activeStudent.schoolId)}</p>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-200">{activeStudent.course}</p>
                                        </div>
                                        <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 text-white">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Pack Seleccionado</p>
                                            <p className="text-xl font-black italic text-emerald-100 mb-0">{getPackName(activeStudent.pack)}</p>
                                        </div>

                                        <div className="p-5 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 text-white mt-4">
                                            <div className="flex flex-col gap-2">
                                                {/* SELECTOR DE PAGO */}
                                                <div className="relative">
                                                    <div 
                                                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-2xl transition-all group/state ${showPaymentSelector ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                                                        onClick={() => {
                                                            setShowPaymentSelector(!showPaymentSelector);
                                                            setShowStatusSelector(false);
                                                        }}
                                                        title="Haga clic para cambiar el estado de pago del alumno"
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeStudent.paymentMethod ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                                            {activeStudent.paymentMethod ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-wider leading-none">
                                                                {activeStudent.paymentMethod ? 'Pagado' : 'Pendiente Pago'}
                                                            </p>
                                                            {activeStudent.paymentMethod && (
                                                                <p className="text-[9px] font-bold text-emerald-200/60 uppercase mt-1 tracking-widest">{activeStudent.paymentMethod}</p>
                                                            )}
                                                        </div>
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${showPaymentSelector ? 'rotate-180 text-emerald-400' : 'opacity-40'}`} />
                                                    </div>

                                                    {showPaymentSelector && (
                                                        <div className="mt-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                            {[
                                                                { id: '', label: 'Pendiente', color: 'text-rose-300', icon: AlertCircle },
                                                                { id: 'EFECTIVO', label: 'Efectivo', color: 'text-emerald-300', icon: CreditCard },
                                                                { id: 'TARJETA', label: 'Tarjeta', color: 'text-blue-300', icon: CreditCard },
                                                                { id: 'TRANSFERENCIA', label: 'Transferencia', color: 'text-indigo-300', icon: Database }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => handlePaymentChange(opt.id)}
                                                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-xl transition-all text-left group"
                                                                >
                                                                    <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${opt.color}`}>
                                                                        <opt.icon size={12} />
                                                                    </div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${opt.id === (activeStudent.paymentMethod || '') ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                    {opt.id === (activeStudent.paymentMethod || '') && (
                                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* SELECTOR DE ESTADO FOTO */}
                                                <div className="relative">
                                                    <div 
                                                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-2xl transition-all group/state ${showStatusSelector ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                                                        onClick={() => {
                                                            setShowStatusSelector(!showStatusSelector);
                                                            setShowPaymentSelector(false);
                                                        }}
                                                        title="Haga clic para cambiar si la foto ya ha sido realizada"
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeStudent.status === 'production' || activeStudent.photoFile ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                            <Camera size={16} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-wider leading-none">
                                                                {activeStudent.status === 'production' || activeStudent.photoFile ? 'Foto Realizada' : 'Foto Pendiente'}
                                                            </p>
                                                        </div>
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${showStatusSelector ? 'rotate-180 text-emerald-400' : 'opacity-40'}`} />
                                                    </div>

                                                    {showStatusSelector && (
                                                        <div className="mt-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                            {[
                                                                { id: 'Pendiente', label: 'Pendiente', color: 'text-amber-300', icon: Camera },
                                                                { id: 'production', label: 'Realizada', color: 'text-emerald-300', icon: CheckCircle2 }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => handleStatusChange(opt.id)}
                                                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-xl transition-all text-left group"
                                                                >
                                                                    <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${opt.color}`}>
                                                                        <opt.icon size={12} />
                                                                    </div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${opt.id === (activeStudent.status === 'production' || activeStudent.photoFile ? 'production' : 'Pendiente') ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                    {opt.id === (activeStudent.status === 'production' || activeStudent.photoFile ? 'production' : 'Pendiente') && (
                                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {(activeStudent.complements?.length > 0 || activeStudent.extras?.length > 0) && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                                                            <Sparkles size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase tracking-wider leading-none text-blue-200">Adicionales</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-main flex flex-col justify-center relative">
                                    <button onClick={() => selectStudent(null)} className="absolute top-8 right-8 w-12 h-12 bg-primary/5 hover:bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all active:scale-90 z-30" title="Cerrar ventana y volver al panel principal">
                                        <ArrowLeft size={24} />
                                    </button>

                                    <div className="w-full space-y-8">
                                        <div className="text-center flex flex-col items-center gap-12">
                                            <div className="w-full flex flex-col items-center gap-8">
                                                <div className="w-full flex items-center justify-between w-full max-w-md">
                                                    <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em]">Introduce Nº de Archivo</p>
                                                    {(photoPrefix || photoNumber) && (
                                                        <button
                                                            onClick={() => { setPhotoPrefix(""); setPhotoNumber(""); }}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-wider" title="Borrar prefijo y número de foto actuales"
                                                        >
                                                            <RotateCcw size={14} />
                                                            Limpiar Todo
                                                        </button>
                                                    )}
                                                </div>

                                                {/* PREFIJO ARRIBA - Ancho aumentado para visibilidad total */}
                                                <div className="flex flex-col items-center gap-2 group/prefix w-full max-w-[280px]">
                                                    <div className="w-full flex justify-between items-center px-2">
                                                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest leading-none">Prefijo</span>
                                                        {photoPrefix && (
                                                            <button onClick={() => setPhotoPrefix("")} className="text-rose-500 hover:text-rose-600 transition-colors p-1.5" title="Borrar prefijo"><RotateCcw size={12} /></button>
                                                        )}
                                                    </div>
                                                    <input type="text" value={photoPrefix} onChange={e => setPhotoPrefix(e.target.value.toUpperCase())} placeholder="ABCD" className={`w-full font-black text-center text-primary/60 placeholder:text-primary/10 focus:outline-none bg-primary/5 border-b-2 border-primary/10 focus:border-indigo-400 py-4 px-4 rounded-2xl transition-all uppercase ${getFontSize(photoPrefix, true)}`} />
                                                </div>

                                                {/* NÚMERO ABAJO - Ancho aumentado */}
                                                <div className="flex flex-col items-center gap-4 group/number w-full max-w-md">
                                                    <div className="w-full flex justify-between items-center px-2 mt-4">
                                                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest leading-none">Nº Archivo</span>
                                                        {photoNumber && (
                                                            <button onClick={() => setPhotoNumber("")} className="text-rose-500 hover:text-rose-600 transition-colors p-1.5" title="Borrar número"><RotateCcw size={12} /></button>
                                                        )}
                                                    </div>
                                                    <input ref={inputRef} type="number" value={photoNumber} onChange={e => setPhotoNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConfirmPhoto()} placeholder="0000" className={`w-full font-black text-center text-primary placeholder:text-primary/10 focus:outline-none bg-transparent transition-all border-b-4 border-primary/10 focus:border-emerald-500 selection:bg-emerald-500 selection:text-white ${getFontSize(photoNumber)}`} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-w-xs mx-auto w-full flex flex-col gap-4">
                                            <button onClick={handleConfirmPhoto} disabled={!photoNumber} className="w-full py-7 bg-emerald-500 hover:bg-emerald-600 disabled:bg-primary/5 disabled:text-primary/10 text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                                                <CheckCircle2 size={24} className="group-hover:scale-125 transition-transform" /> CONFIRMAR
                                            </button>

                                            <div className="relative">
                                                <div className="relative group/search flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <input type="text" value={modalSearch} onFocus={() => setIsFocused(true)} onChange={e => setModalSearch(e.target.value)} placeholder="BUSCAR OTRO ALUMNO..." className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest text-primary placeholder:text-primary/20 focus:outline-none focus:border-emerald-500 transition-all" />
                                                        <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/search:text-emerald-500 transition-colors" />
                                                    </div>
                                                    <button onClick={() => { setModalSearch(""); setIsFocused(!isFocused); }} className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95 transition-all shrink-0" title={isFocused ? "Cerrar lista de alumnos" : "Ver lista de alumnos del mismo curso"}>
                                                        <ChevronUp size={20} className={isFocused ? "" : "rotate-180"} />
                                                    </button>
                                                </div>

                                                {(modalSearch.length > 0 || isFocused) && (
                                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-primary/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                            {orders.filter(o => {
                                                                const matchesSchool = adminSchool ? o.schoolId === adminSchool : true;
                                                                const matchesSearch = modalSearch.length > 0 ? o.studentName.toLowerCase().includes(modalSearch.toLowerCase()) : (o.course === activeStudent.course);
                                                                const hasPhoto = o.status === 'production' || o.photoFile;
                                                                return matchesSchool && matchesSearch && o.id !== activeStudent.id && !hasPhoto;
                                                            }).slice(0, 10).map(student => (
                                                                <button key={student.id} onClick={() => { selectStudent(student); setModalSearch(""); setIsFocused(false); }} className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 group/item">
                                                                    <div className="text-left">
                                                                        <p className="text-[10px] font-black text-primary uppercase">{student.studentName}</p>
                                                                        <p className="text-[8px] font-bold text-primary/40 uppercase">{student.course} {student.group ? `· ${student.group}` : ""}</p>
                                                                    </div>
                                                                    <ArrowRight size={12} className="text-primary/20 group-hover/item:text-emerald-500 group-hover/item:translate-x-1 transition-all" />
                                                                </button>
                                                            ))}
                                                            {orders.filter(o => (adminSchool ? o.schoolId === adminSchool : true) && (modalSearch.length > 0 ? o.studentName.toLowerCase().includes(modalSearch.toLowerCase()) : o.course === activeStudent.course) && o.id !== activeStudent.id).length === 0 && (
                                                                <div className="p-4 text-center">
                                                                    <p className="text-[9px] font-black text-primary/30 uppercase italic">No hay más alumnos en esta clase</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* MODAL DE SUBIDA MASIVA (RESTAURADO) */}
            <BulkUploadModal 
                isOpen={showBulkUpload} 
                onClose={() => setShowBulkUpload(false)} 
                photographerId={photographerId}
                schools={schools}
                currentSchoolId={adminSchool}
            />

            {/* MODAL DE MAPEO DINÁMICO EXCEL (NAVAJA SUIZA) - REDISEÑO ORIENTADO A USUARIO */}
            {showExcelMappingModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card border border-primary/10 rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-primary/5 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <Database size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-primary tracking-tight uppercase">Navaja Suiza: Tu Configuración</h3>
                                    <p className="text-[11px] font-bold text-primary/40 uppercase tracking-widest mt-1">Dinos qué contiene cada una de tus columnas</p>
                                </div>
                            </div>
                            <button onClick={() => setShowExcelMappingModal(false)} className="p-3 hover:bg-rose-500/10 text-primary/20 hover:text-rose-500 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">
                                    <div className="col-span-1 flex items-center justify-center text-center">#</div>
                                    <div className="col-span-5">Tu Columna (Excel)</div>
                                    <div className="col-span-6">¿A qué corresponde en la App?</div>
                                </div>
                                
                                {excelColumns.map((col, index) => {
                                    const currentMappedField = Object.keys(excelMapping).find(key => excelMapping[key] === col);
                                    const systemField = [
                                        { id: 'studentName', label: 'Nombre Alumno (Oblig.)', icon: <User size={12} />, color: 'emerald' },
                                        { id: 'lastName', label: 'Apellidos / Apellido 1', icon: <User size={12} />, color: 'emerald' },
                                        { id: 'lastName2', label: 'Apellido 2', icon: <User size={12} />, color: 'emerald' },
                                        { id: 'parentName', label: 'Tutor / Padre (Ficha)', icon: <Users size={12} />, color: 'blue' },
                                        { id: 'course', label: 'Curso / Clase', icon: <Hash size={12} />, color: 'blue' },
                                        { id: 'group', label: 'Grupo / Letra', icon: <LayoutGrid size={12} />, color: 'blue' },
                                        { id: 'schoolName', label: 'Centro / Colegio', icon: <Home size={12} />, color: 'indigo' },
                                        { id: 'pack', label: 'Pack Elegido', icon: <Package size={12} />, color: 'amber' },
                                        { id: 'phone', label: 'Teléfono', icon: <Phone size={12} />, color: 'blue' },
                                        { id: 'email', label: 'Email', icon: <Mail size={12} />, color: 'blue' },
                                        { id: 'notes', label: 'Notas / Observaciones', icon: <MessageSquare size={12} />, color: 'slate' },
                                        { id: 'role', label: 'Cargo (Docentes)', icon: <UserCheck size={12} />, color: 'amber' },
                                        { id: 'type', label: 'Tipo (Alumno/Docente)', icon: <Database size={12} />, color: 'purple' },
                                        { id: 'photoNum', label: 'Nº Archivo Foto', icon: <Camera size={12} />, color: 'rose' }
                                    ];

                                    return (
                                        <div key={col} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all duration-300 ${currentMappedField ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' : 'bg-primary/5 border-primary/10 hover:border-primary/20'}`}>
                                            <div className="col-span-1 flex items-center justify-center text-[11px] font-black text-primary/20">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="col-span-5 font-black text-[12px] text-primary truncate pr-4">
                                                {col}
                                            </div>
                                            <div className="col-span-6">
                                                <div className="relative group">
                                                    <select 
                                                        value={currentMappedField || ""} 
                                                        onChange={(e) => {
                                                            const fieldId = e.target.value;
                                                            const newMapping = { ...excelMapping };
                                                            
                                                            // Limpiar cualquier campo que estuviera apuntando a esta columna
                                                            Object.keys(newMapping).forEach(key => {
                                                                if (newMapping[key] === col) newMapping[key] = '';
                                                            });

                                                            // Si selecciona un campo, limpiar donde estuviera ese campo antes y asignarlo a esta columna
                                                            if (fieldId) {
                                                                newMapping[fieldId] = col;
                                                            }
                                                            
                                                            setExcelMapping(newMapping);
                                                        }}
                                                        className={`w-full appearance-none bg-white border-2 rounded-xl px-5 py-3 text-[11px] font-black uppercase tracking-wider cursor-pointer focus:outline-none transition-all ${
                                                            currentMappedField 
                                                            ? 'border-emerald-500 text-emerald-600 focus:ring-4 focus:ring-emerald-500/10' 
                                                            : 'border-primary/10 text-primary/40 hover:border-primary/30 focus:border-primary focus:text-primary focus:ring-4 focus:ring-primary/5'
                                                        }`}
                                                        title="Asigna esta columna de Excel a un campo de la aplicación"
                                                    >
                                                        <option value="">-- Ignorar columna --</option>
                                                        {systemField.map(f => (
                                                            <option key={f.id} value={f.id}>{f.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${currentMappedField ? 'text-emerald-500' : 'text-primary/20'}`}>
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </div>
                                                {!currentMappedField && (
                                                    <p className="text-[9px] font-bold text-amber-500/60 uppercase mt-2 ml-1">
                                                        ⚠️ Usará valor por defecto configurado abajo
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* VALORES POR DEFECTO PARA CAMPOS NO ENCONTRADOS */}
                            <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-indigo-900 uppercase tracking-widest leading-none">Configuración de Seguridad</h4>
                                        <p className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest mt-1">Si una columna no existe, usaremos estos valores:</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-2">Pack por defecto</label>
                                        <select 
                                            value={excelDefaults.pack}
                                            onChange={(e) => setExcelDefaults({...excelDefaults, pack: e.target.value})}
                                            className="w-full bg-white border-2 border-indigo-500/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-wider focus:border-indigo-500 focus:outline-none transition-all"
                                        >
                                            <option value="">Selecciona un pack</option>
                                            {availablePacks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-2">Curso / Nivel</label>
                                        <select 
                                            value={excelDefaults.course}
                                            onChange={(e) => setExcelDefaults({...excelDefaults, course: e.target.value})}
                                            className="w-full bg-white border-2 border-indigo-500/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-wider focus:border-indigo-500 focus:outline-none transition-all"
                                        >
                                            <option value="">Selecciona clase</option>
                                            {allExistingCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-2">Centro (Opcional)</label>
                                        <select 
                                            value={excelDefaults.schoolName}
                                            onChange={(e) => setExcelDefaults({...excelDefaults, schoolName: e.target.value})}
                                            className="w-full bg-white border-2 border-indigo-500/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-wider focus:border-indigo-500 focus:outline-none transition-all"
                                        >
                                            <option value="">Centro actual ({getSchoolName(adminSchool)})</option>
                                            {sortedSchools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-5">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Mapeo Inteligente Activado</p>
                                    <p className="text-[10px] font-bold text-amber-600/70 uppercase leading-relaxed mt-1">Hemos detectado algunas columnas automáticamente. Por favor, asegúrate de que cada una de tus columnas tenga el rol correcto para evitar errores en la importación.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-primary/5 flex items-center justify-between gap-6 border-t border-primary/5">
                            <button 
                                onClick={() => setShowExcelMappingModal(false)}
                                className="px-10 py-5 text-[11px] font-black text-primary/30 uppercase tracking-[0.3em] hover:text-rose-500 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={processExcelImport}
                                disabled={!excelMapping.studentName}
                                className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-primary/10 disabled:text-primary/20 text-white font-black text-[12px] uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                            >
                                <Zap size={18} className="group-hover:animate-pulse" /> Finalizar y Cargar Tabla
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Barra de Selección Flotante */}
            {(selectedOrderIds.length > 0 || selectedStaffIds.length > 0) && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-5 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                        <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
                                {selectedOrderIds.length + selectedStaffIds.length}
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Elementos</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Seleccionados</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    setSelectedOrderIds([]);
                                    setSelectedStaffIds([]);
                                }}
                                className="px-6 py-3 text-[11px] font-black text-white/50 uppercase tracking-widest hover:text-white transition-colors" title="Deseleccionar todos los elementos marcados"
                            >
                                Desmarcar Todo
                            </button>
                            
                            <button 
                                onClick={() => {
                                    if (selectedOrderIds.length > 0) setShowDeleteConfirm('orders');
                                    else if (selectedStaffIds.length > 0) setShowDeleteConfirm('staff');
                                }}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                            >
                                <Trash2 size={16} /> Eliminar Selección
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INPUT DE ARCHIVO OCULTO PARA SUBIDA INDIVIDUAL */}
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleIndividualFileChange}
            />

            {/* MODAL ELIMINAR SELECCIONADOS */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/60 transition-all duration-500">
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-sm overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 ring-1 ring-rose-500/20 shadow-inner">
                                <Trash2 size={40} className="animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">¿Confirmas el borrado?</h3>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider leading-relaxed px-4">
                                Estás a punto de eliminar <span className="text-white font-black">{showDeleteConfirm === 'orders' ? selectedOrderIds.length : selectedStaffIds.length}</span> registros de forma permanente. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex bg-white/5 p-2 gap-2">
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-6 text-[11px] font-black text-white/30 hover:text-white hover:bg-white/5 uppercase tracking-[0.3em] transition-all rounded-[30px]"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    if (showDeleteConfirm === 'orders') {
                                        deleteOrder(selectedOrderIds);
                                        setSelectedOrderIds([]);
                                    } else if (showDeleteConfirm === 'staff') {
                                        deleteStaff(selectedStaffIds);
                                        setSelectedStaffIds([]);
                                    }
                                    setShowDeleteConfirm(null);
                                }}
                                className="flex-[1.5] py-6 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all rounded-[30px] shadow-xl shadow-rose-500/20"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* MODAL DE REENCUADRE (REFRAMING) */}
            {reframingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        onClick={() => setReframingItem(null)}
                    />
                    
                    <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border border-white/20">
                        {/* Área de Visualización (Preview) */}
                        <div className="flex-1 bg-slate-100 relative min-h-[400px] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                            
                            {/* El "Marco" de la Foto (Segun configOrla) */}
                            <div 
                                className="relative shadow-2xl bg-white overflow-hidden transition-all"
                                style={{
                                    width: '350px',
                                    height: '450px',
                                    ...getShapeStyle(configOrla?.photoShape || 'circle', 350, 450)
                                }}
                            >
                                <img 
                                    src={reframingItem.photoUrl} 
                                    alt="Reencuadre"
                                    draggable={false}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform: `scale(${reframingItem.photoConfig?.zoom || 1}) translate(${reframingItem.photoConfig?.x || 0}px, ${reframingItem.photoConfig?.y || 0}px)`,
                                        cursor: 'move'
                                    }}
                                    onMouseDown={(e) => {
                                        const startX = e.clientX;
                                        const startY = e.clientY;
                                        const initialX = reframingItem.photoConfig?.x || 0;
                                        const initialY = reframingItem.photoConfig?.y || 0;
                                        const currentZoom = reframingItem.photoConfig?.zoom || 1;

                                        const handleMouseMove = (mm) => {
                                            const dx = (mm.clientX - startX) / currentZoom;
                                            const dy = (mm.clientY - startY) / currentZoom;
                                            setReframingItem(prev => ({
                                                ...prev,
                                                photoConfig: {
                                                    ...prev.photoConfig,
                                                    x: initialX + dx,
                                                    y: initialY + dy,
                                                    zoom: currentZoom
                                                }
                                            }));
                                        };

                                        const handleMouseUp = () => {
                                            window.removeEventListener('mousemove', handleMouseMove);
                                            window.removeEventListener('mouseup', handleMouseUp);
                                        };

                                        window.addEventListener('mousemove', handleMouseMove);
                                        window.addEventListener('mouseup', handleMouseUp);
                                    }}
                                />
                            </div>
                            
                            {/* Etiquetas Informativas */}
                            <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase text-slate-500 shadow-sm border border-slate-200">Vista Previa Real</span>
                                <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase text-white shadow-md shadow-indigo-500/20">{PHOTO_SHAPES.find(s => s.id === (configOrla?.photoShape || 'circle'))?.label}</span>
                            </div>
                        </div>

                        {/* Controles Laterales */}
                        <div className="w-full md:w-[320px] p-8 flex flex-col gap-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-[20px] font-black text-slate-900 leading-tight uppercase">Reencuadrar</h3>
                                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mt-1">{reframingItem.name}</p>
                                </div>
                                <button 
                                    onClick={() => setReframingItem(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Control de Zoom */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ZoomIn size={14} className="text-indigo-500" /> Zoom
                                    </label>
                                    <span className="text-[12px] font-black text-indigo-600">{Math.round((reframingItem.photoConfig?.zoom || 1) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="3" 
                                    step="0.01"
                                    value={reframingItem.photoConfig?.zoom || 1}
                                    onChange={(e) => {
                                        const newZoom = parseFloat(e.target.value);
                                        setReframingItem(prev => ({
                                            ...prev,
                                            photoConfig: { ...prev.photoConfig, zoom: newZoom }
                                        }));
                                    }}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between px-1">
                                    <button onClick={() => setReframingItem(prev => ({ ...prev, photoConfig: { zoom: 1, x: 0, y: 0 }}))} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">1.0x</button>
                                    <button onClick={() => setReframingItem(prev => ({ ...prev, photoConfig: { ...prev.photoConfig, zoom: 2 }}))} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">2.0x</button>
                                    <button onClick={() => setReframingItem(prev => ({ ...prev, photoConfig: { ...prev.photoConfig, zoom: 3 }}))} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">3.0x</button>
                                </div>
                            </div>

                            {/* Selector de Formas */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Sparkles size={14} className="text-indigo-500" /> Forma de la Foto
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PHOTO_SHAPES.map(shape => (
                                        <button
                                            key={shape.id}
                                            onClick={() => {
                                                const currentShape = configOrla?.photoShape || 'circle';
                                                if (currentShape === shape.id) return;

                                                Swal.fire({
                                                    title: '<span class="text-[22px] font-black uppercase tracking-tight text-slate-800">¿Cambiar forma de la Orla?</span>',
                                                    html: '<p class="text-[14px] text-slate-500 font-medium leading-relaxed px-4">Esta es una acción <b>GLOBAL</b>. Todas las fotos de la orla cambiarán a esta nueva forma para mantener la uniformidad.</p>',
                                                    icon: 'warning',
                                                    iconColor: '#f59e0b',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'SÍ, CAMBIAR FORMA',
                                                    cancelButtonText: 'CANCELAR',
                                                    customClass: {
                                                        popup: 'rounded-[32px] border-none shadow-2xl p-8',
                                                        confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border-none',
                                                        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-500 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 border-none'
                                                    },
                                                    buttonsStyling: false
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        setConfigOrla(prev => ({ ...prev, photoShape: shape.id }));
                                                        Swal.fire({
                                                            title: '<span class="text-[18px] font-black uppercase text-indigo-600">Forma Actualizada</span>',
                                                            text: 'Se ha aplicado el cambio a toda la orla.',
                                                            icon: 'success',
                                                            iconColor: '#4f46e5',
                                                            timer: 1500,
                                                            showConfirmButton: false,
                                                            customClass: {
                                                                popup: 'rounded-[28px] border-none shadow-2xl p-6',
                                                            }
                                                        });
                                                    }
                                                });
                                            }}
                                            className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-2 group ${
                                                (configOrla?.photoShape || 'circle') === shape.id 
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                            }`}
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center opacity-80 group-hover:opacity-100">
                                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                                                    <g dangerouslySetInnerHTML={{ __html: shape.preview(100, 100) }} />
                                                </svg>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-center leading-tight">{shape.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Atajos / Acciones rápidas */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setReframingItem(prev => ({ ...prev, photoConfig: { zoom: 1, x: 0, y: 0 }}))}
                                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all flex flex-col items-center gap-2 uppercase tracking-tight"
                                >
                                    <Maximize size={16} /> Resetear
                                </button>
                                <button 
                                    onClick={handleAutoReframe}
                                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all flex flex-col items-center gap-2 uppercase tracking-tight"
                                >
                                    <Wand2 size={16} /> Auto
                                </button>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
                                <p className="text-[10px] text-slate-400 font-bold italic leading-tight mb-2 text-center">Arrastra la foto directamente para posicionarla dentro del marco.</p>
                                
                                <button 
                                    onClick={() => {
                                        // Guardar cambios
                                        if (reframingItem.type === 'student') {
                                            updateOrder(reframingItem.id, { photoConfig: reframingItem.photoConfig });
                                        } else {
                                            updateStaff(reframingItem.id, { photoConfig: reframingItem.photoConfig });
                                        }
                                        setReframingItem(null);
                                        Swal.fire({ 
                                            title: '<span class="text-[18px] font-black uppercase text-indigo-600">Ajuste Guardado</span>', 
                                            text: 'El reencuadre se aplicará a la orla.', 
                                            icon: 'success', 
                                            iconColor: '#4f46e5',
                                            timer: 1500, 
                                            showConfirmButton: false,
                                            customClass: {
                                                popup: 'rounded-[28px] border-none shadow-2xl p-6',
                                            }
                                        });
                                    }}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Aplicar Ajustes
                                </button>
                                
                                <button 
                                    onClick={() => setReframingItem(null)}
                                    className="w-full py-3 text-slate-400 hover:text-slate-600 font-black text-[11px] uppercase tracking-widest transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(ShootingPanel);
