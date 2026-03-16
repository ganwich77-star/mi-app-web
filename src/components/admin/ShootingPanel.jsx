import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, CheckSquare, Square, Trash2, CheckCircle, Phone,
    MessageSquare, Database, UserCheck, Users, Hash, ArrowRight, ArrowLeft,
    Sparkles, XCircle, RotateCcw, Tv, Camera, CheckCircle2, Zap, FolderUp,
    ChevronRight, AlertCircle, CreditCard, ChevronDown, ChevronUp, Mail, FileText,
    Package, Plus, LayoutGrid, List, Upload, X, User, Home, Pencil
} from 'lucide-react';

import { COURSE_GROUPS, PACKS, EXTRAS, STAFF_ROLES } from '../../constants.js';
import { toTitleCase, getCourseBase, getGroup } from '../../utils/formatters.js';
import BulkUploadModal from './BulkUploadModal.jsx';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


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
    photographerId
}) => {

    const [activeStudent, setActiveStudent] = useState(null);
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
    const [viewStyle, setViewStyle] = useState('list');
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

            let importStrategy = 'add'; // 'add', 'overwrite', 'skip'

            if (studentDuplicates.length > 0 || staffDuplicates.length > 0) {
                const totalDupes = studentDuplicates.length + staffDuplicates.length;
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
                    reverseButtons: true
                });

                if (result.isConfirmed) importStrategy = 'overwrite';
                else if (result.isDenied) importStrategy = 'skip';
                else {
                    Swal.fire('Importación cancelada', '', 'info');
                    return;
                }
            }

            let finalOrders = [...orders];
            let finalStaff = [...staff];
            let addedCount = 0;
            let updatedCount = 0;

            // Procesar Alumnos
            newStudents.forEach(newS => {
                const key = newS.studentName.toUpperCase().trim();
                const existing = existingStudentMap.get(key);

                if (existing) {
                    if (importStrategy === 'overwrite') {
                        // Actualizar existente manteniendo su ID y campos que no vienen en Excel
                        const index = finalOrders.findIndex(o => o.id === existing.id);
                        if (index !== -1) {
                            finalOrders[index] = { ...existing, ...newS, id: existing.id };
                            updatedCount++;
                        }
                    }
                    // Si es 'skip', no hacemos nada
                } else {
                    // Es nuevo
                    finalOrders.push({
                        ...newS,
                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        status: 'Pendiente',
                        timestamp: new Date().toISOString()
                    });
                    addedCount++;
                }
            });

            // Procesar Personal
            newStaffMembers.forEach(newSt => {
                const key = `${newSt.firstName} ${newSt.lastName}`.toUpperCase().trim();
                const existing = existingStaffMap.get(key);

                if (existing) {
                    if (importStrategy === 'overwrite') {
                        const index = finalStaff.findIndex(s => s.id === existing.id);
                        if (index !== -1) {
                            finalStaff[index] = { ...existing, ...newSt, id: existing.id };
                            updatedCount++;
                        }
                    }
                } else {
                    finalStaff.push({
                        ...newSt,
                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: `${newSt.firstName} ${newSt.lastName}`.trim()
                    });
                    addedCount++;
                }
            });

            // Guardar cambios finales
            await updateAllOrders(finalOrders);
            await updateAllStaff(finalStaff);

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
            const matchesCourse = !shootFilters.course || m.assignments?.some(a => 
                (!adminSchool || a.schoolId === adminSchool) && 
                getCourseBase(a.course) === shootFilters.course && 
                (!shootFilters.group || getGroup(a.course) === shootFilters.group)
            );
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

    // Grupos únicos para el curso seleccionado
    const availableGroups = shootFilters.course
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === shootFilters.course))
            ?.courses.find(c => c.name === shootFilters.course)?.lines || [])
        : [];

    // Grupos únicos para el curso del formulario de alta rápida de alumnos
    const formAvailableGroups = newStudentForm.course
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === newStudentForm.course))
            ?.courses.find(c => c.name === newStudentForm.course)?.lines || [])
        : [];

    // Grupos únicos para el curso del formulario de alta rápida de docentes
    const staffFormAvailableGroups = newStaffForm.tempCourse
        ? (COURSE_GROUPS.find(g => g.courses.some(c => c.name === newStaffForm.tempCourse))
            ?.courses.find(c => c.name === newStaffForm.tempCourse)?.lines || [])
        : [];

    // Cursos únicos de la escuela
    const activeCourses = useMemo(() => {
        if (!adminSchool || !orders) return [];
        const schoolCourses = new Set(orders.filter(o => o.schoolId === adminSchool).map(o => getCourseBase(o.course)));
        return [...schoolCourses].sort().map(name => ({ name }));
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
            tempFile: member.photoFile || '',
            schoolId: member.schoolId || adminSchool || ''
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
                <div className="flex items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 text-primary">
                        {/* Selector Alumnos / Docentes */}
                        <div className="flex p-1.5 rounded-[14px] bg-primary/[0.03] border border-primary/10 shrink-0 w-full max-w-[220px] md:max-w-[260px] gap-1">
                            <button onClick={() => { setShootMode('students'); setShootSearch(''); }} className={`flex-1 px-3 py-2 rounded-[10px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shootMode === 'students' ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'text-primary/40 hover:text-primary hover:bg-white/50'}`} title="Modo Alumnos: Ver y gestionar listado de estudiantes">
                                <Users size={14} /> Alumnos
                            </button>
                            <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`flex-1 px-3 py-2 rounded-[10px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shootMode === 'staff' ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'text-primary/40 hover:text-primary hover:bg-white/50'}`} title="Modo Docentes: Ver y gestionar listado de personal">
                                <UserCheck size={14} /> Docentes
                            </button>
                        </div>

                        {/* Selector Centro y Clase */}
                        <div className="flex-1 hidden md:flex items-center justify-center gap-4 max-w-5xl mx-auto">
                            {/* SECTOR CENTRO */}
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[9px] font-black text-indigo-500/50 uppercase tracking-tighter pl-1">CENTRO EDUCATIVO</span>
                                <div className="relative min-w-[300px]">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 pointer-events-none">
                                        <Home size={12} />
                                    </div>
                                    <select 
                                        value={adminSchool} 
                                        onChange={e => { setAdminSchool(e.target.value); setShootFilters({ course: '', group: '' }); }} 
                                        className="w-full bg-white border border-primary/10 text-primary text-[11px] font-black uppercase tracking-widest rounded-xl pl-12 pr-10 py-2.5 h-11 outline-none appearance-none cursor-pointer hover:border-indigo-500/30 transition-all shadow-sm"
                                    >
                                        <option value="">SELECCIONAR CENTRO</option>
                                        {sortedSchools.map(s => (
                                            <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                                </div>
                            </div>

                            <div className="h-10 w-px bg-primary/10" />

                            {/* SECTOR CLASE */}
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-tighter pl-1">CLASE / CURSO</span>
                                <div className="flex items-center gap-2">
                                    <div className="relative min-w-[180px]">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 pointer-events-none">
                                            <Hash size={12} />
                                        </div>
                                        <select 
                                            value={shootFilters.course} 
                                            onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))}
                                            className="w-full bg-white border border-primary/10 text-primary text-[11px] font-black uppercase tracking-widest rounded-xl pl-12 py-2.5 h-11 outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm pr-10"
                                        >
                                            <option value="">CURSO COMPLETO</option>
                                            {activeCourses.map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                                    </div>

                                    {(shootFilters.course) && (
                                        <div className="relative min-w-[90px]">
                                            <select 
                                                value={shootFilters.group} 
                                                onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))}
                                                className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-2.5 h-11 outline-none appearance-none cursor-pointer hover:bg-emerald-100/50 transition-all shadow-sm pr-10 text-center"
                                            >
                                                <option value="">GRUPO</option>
                                                {availableGroups.map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                                        </div>
                                    )}

                                    {(shootFilters.course || shootFilters.group) && (
                                        <button 
                                            onClick={() => setShootFilters({ course: '', group: '' })}
                                            className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-all border border-rose-100 shadow-sm shrink-0"
                                            title="Limpiar filtros"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Acciones Derecha - Backup SOS se mantiene aquí por ahora o se mueve a ajustes */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <button onClick={downloadMasterBackup} className="px-4 py-2 h-[38px] md:h-[42px] bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/20 text-[10px] md:text-[11px] font-bold uppercase tracking-wide rounded-[10px] transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm" title="Backup SOS: Descargar copia de seguridad de todos los datos">
                            <Database size={14} /> <span className="hidden sm:inline">Backup SOS</span>
                        </button>
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
                                        <button 
                                            onClick={() => setShowBulkUpload(true)} 
                                            className="h-[44px] flex-1 md:flex-none flex items-center justify-center gap-2 px-6 bg-indigo-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/20 active:scale-95 border border-transparent"
                                            title="Subida Masiva: Subir fotos de alumnos o docentes por lote"
                                        >
                                            <Upload size={16} />
                                            <span>Subir Fotos</span>
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
                                <button onClick={() => setIsStudentListExpanded(!isStudentListExpanded)} className="w-full p-4 md:p-5 border-b border-primary/5 flex justify-between items-center shrink-0 hover:bg-primary/[0.02] transition-colors cursor-pointer text-left">
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
                                                        confirmButtonColor: '#3b82f6',
                                                        cancelButtonColor: '#6b7280',
                                                        confirmButtonText: 'Sí, Numerar',
                                                        cancelButtonText: 'Cancelar'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            const updated = orders.map(o => {
                                                                const fIndex = filteredOrders.findIndex(fo => fo.id === o.id);
                                                                if (fIndex !== -1) {
                                                                    return { ...o, photo_file_number: (fIndex + 1).toString().padStart(4, '0') };
                                                                }
                                                                return o;
                                                            });
                                                            updateAllOrders(updated);
                                                            Swal.fire({ icon: 'success', title: 'Numeración Aplicada', text: 'Se ha asignado el Nº de foto secuencial a los alumnos.', timer: 1500, showConfirmButton: false });
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
                                </button>
                                {isStudentListExpanded && (
                                    <div className="flex flex-col flex-1 animate-in slide-in-from-top-2 duration-300">
                                        {viewStyle === 'grid' ? (
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
                                                            <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center mb-3 overflow-hidden transition-all ${isPhotoSelected ? 'bg-orange-100 text-orange-600' : isBulkSelected ? 'bg-orange-100/50 text-orange-500' : 'bg-primary/5 text-primary/40'}`}>
                                                                {hasPhoto ? <Camera size={20} className="text-emerald-500" /> : <Users size={20} />}
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
                                                            onClick={() => {
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
                                                    <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[50px] text-center bg-white border-r border-primary/5">Nº</th>
                                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[30%] bg-white">Alumno / Tutor</th>
                                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[200px] bg-white">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-secondary">Pack</span>
                                                            <button 
                                                                onClick={() => {
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
                                                                className="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded-lg hover:bg-emerald-700 transition-all font-black shadow-sm"
                                                            >
                                                                APLICAR A TODOS
                                                            </button>
                                                        </div>
                                                    </th>
                                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 text-center w-[160px] bg-white">Estado</th>
                                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 text-center w-[120px] bg-white">Nº Foto</th>
                                                    <th className="py-3 px-3 text-right text-[10px] font-black uppercase tracking-wider text-primary/40 w-[120px] bg-white">Acciones</th>
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
                                                                {(idx + 1).toString().padStart(4, '0')}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-3 overflow-hidden">
                                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                                <p className="text-[13px] font-black text-slate-800 uppercase leading-none tracking-tight truncate">{order.studentName}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                                                                    {order.parentName || 'SIN TUTOR ASIGNADO'}
                                                                </p>
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
                                                                <button onClick={(e) => { e.stopPropagation(); setOrderToEdit(order); }} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100 rounded-lg transition-colors shadow-sm" title="Editar Ficha del Alumno">
                                                                    <Pencil size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredOrders.length === 0 && (
                                            <div className="p-8 text-center text-primary/40">
                                                <p className="text-xs font-black uppercase tracking-widest">No hay alumnos para mostrar</p>
                                            </div>
                                        )}
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
                                <button 
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
                                                        onClick={() => setStaffViewStyle('grid')} 
                                                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${staffViewStyle === 'grid' ? 'bg-white shadow-sm text-slate-900 border border-primary/5' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} 
                                                        title="Cuadrícula"
                                                    >
                                                        <LayoutGrid size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setStaffViewStyle('list')} 
                                                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${staffViewStyle === 'list' ? 'bg-white shadow-sm text-slate-900 border border-primary/5' : 'text-primary/40 hover:text-primary hover:bg-primary/5'}`} 
                                                        title="Lista"
                                                    >
                                                        <List size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/5 transition-colors">
                                            {isStaffListExpanded ? <ChevronUp size={20} className="text-primary/40" /> : <ChevronDown size={20} className="text-primary/40" />}
                                        </div>
                                    </div>
                                </button>

                                {isStaffListExpanded && (
                                    <div className="flex-1 custom-scrollbar p-0">
                                        {staffViewStyle === 'grid' ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 content-start p-4 md:p-5 pb-20">
                                                {filteredStaff.map(member => {
                                                    const isSelected = activeStudent?.id === member.id;
                                                    const isBulkSelected = selectedStaffIds.includes(member.id);
                                                    const hasPhoto = member.photo_file_number;
                                                    
                                                    return (
                                                        <div key={member.id} className="relative group/card">
                                                            <button 
                                                                onClick={() => selectStudent({ ...member, isStaff: true, studentName: member.name || `${member.firstName} ${member.lastName}` })}
                                                                className={`w-full relative flex flex-col items-center p-5 rounded-[20px] border transition-all duration-300 active:scale-95 ${
                                                                    isSelected 
                                                                        ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/10 z-10 scale-[1.02]' 
                                                                        : isBulkSelected 
                                                                            ? 'border-indigo-300 bg-indigo-50/30' 
                                                                            : 'border-primary/10 bg-white hover:border-indigo-500/30 hover:shadow-md'
                                                                }`}
                                                            >
                                                                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center mb-4 transition-all ${
                                                                    isSelected ? 'bg-indigo-100 text-indigo-600' : isBulkSelected ? 'bg-indigo-100/50 text-indigo-500' : 'bg-primary/5 text-primary/40'
                                                                }`}>
                                                                    {hasPhoto ? <Camera size={24} className="text-emerald-500" /> : <User size={24} />}
                                                                </div>
                                                                
                                                                <div className="flex flex-col items-center w-full min-w-0">
                                                                    <p className="text-[12px] font-black text-center text-slate-800 leading-tight uppercase truncate w-full">
                                                                        {member.firstName}
                                                                    </p>
                                                                    <p className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest truncate w-full mt-0.5">
                                                                        {member.lastName}
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
                                                            <th className="py-4 px-5 text-[10px] font-black uppercase tracking-widest text-primary/40 w-[60px] text-center bg-white border-r border-primary/5">Nº</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 w-[25%] bg-white">Docente</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 text-center w-[20%] bg-white">Cargo / Función</th>
                                                            <th className="py-3 px-3 text-[10px] font-black uppercase tracking-wider text-primary/40 text-center w-[120px] bg-white">Estado</th>
                                                            <th className="py-3 px-3 text-center text-[10px] font-black uppercase tracking-wider text-primary/40 w-[100px] bg-white">Nº Foto</th>
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
                                                                        <span className="text-[11px] font-mono font-black text-indigo-500">{(idx + 1).toString().padStart(4, '0')}</span>
                                                                    </td>
                                                                    <td className="py-4 px-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${hasPhoto ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-primary/5 text-primary/30'}`}>
                                                                                {hasPhoto ? <Camera size={16} /> : <Users size={16} />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-black text-primary uppercase leading-tight">{member.firstName} {member.lastName}</p>
                                                                                <p className="text-[9px] font-bold text-primary/40 uppercase mt-0.5">{member.assignments?.[0]?.course || 'General'}</p>
                                                                            </div>
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
                                                                                }).then(result => {
                                                                                    if (result.isConfirmed) deleteStaff([member.id]);
                                                                                });
                                                                            }} className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl shadow-sm transition-colors" title="Eliminar Docente">
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                {filteredStaff.length === 0 && (
                                                    <div className="p-12 text-center text-primary/30">
                                                        <p className="text-xs font-black uppercase tracking-widest">No hay docentes para mostrar</p>
                                                    </div>
                                                )}
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
                                    <div className="relative z-10 lg:mt-16">
                                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                            {settings?.logo ? <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-xl brightness-0 invert" /> : <Camera size={32} />}
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
                                                    <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em]">Introduce Nº de Foto</p>
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
                                        { id: 'type', label: 'Tipo (Alumno/Staff)', icon: <Database size={12} />, color: 'purple' },
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

            {/* Modal de Confirmación de Borrado */}
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
        </div >
    );
};


export default React.memo(ShootingPanel);
