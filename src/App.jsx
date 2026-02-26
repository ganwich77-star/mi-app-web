import { useState, useEffect, useMemo } from 'react';
import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import {
    GraduationCap, User, CreditCard, Plus, Minus, CheckCircle,
    Download, Settings, Search, DollarSign, BarChart3, Copy,
    MessageSquare, ChevronRight, Lock, Shield, Package, Sparkles, Gift, Mail, Phone,
    TrendingUp, Users, Trash2, Sun, Moon, ChevronDown, ToggleLeft, ToggleRight, Database, Upload, AlertTriangle, Share,
    Square, CheckSquare, X
} from 'lucide-react';
import { SCHOOLS, PACKS, EXTRAS, CONTACT_PHONE, COURSE_GROUPS, STAFF_ROLES, DRIVE_API_KEY, DRIVE_CLIENT_ID } from './constants.js';
import { useOrders } from './hooks/useOrders.js';
import { useSettings } from './hooks/useSettings.js';
import { useStaff } from './hooks/useStaff.js';
import StepIndicator from './components/StepIndicator.jsx';
import PackCard from './components/PackCard.jsx';
import ExtraItem from './components/ExtraItem.jsx';
import StatCard from './components/StatCard.jsx';
import OrderRow from './components/OrderRow.jsx';

export default function App() {
    // Orbes decorativos de fondo
    const BackgroundOrbs = () => (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 blur-[120px] rounded-full" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-violet-200 blur-[100px] rounded-full" />
        </div>
    );

    const { settings, paymentMethods, enabledPaymentMethods, schools, adminPin, togglePaymentMethod, addPaymentMethod, updateAdminPin, addSchool, deleteSchool, updateSettings } = useSettings();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [view, setView] = useState('user');       // 'user' | 'admin'

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const [adminTab, setAdminTab] = useState('shooting');
    const [step, setStep] = useState(1);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    const [adminSchool, setAdminSchool] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [pinError, setPinError] = useState(false);
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
    const [newMethodLabel, setNewMethodLabel] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilters, setExportFilters] = useState({ school: '', course: '', group: '' });
    // Shooting
    const [shootSearch, setShootSearch] = useState('');
    const [shootFilters, setShootFilters] = useState({ course: '', group: '' });
    const [shootAssigning, setShootAssigning] = useState(null);
    const [shootMode, setShootMode] = useState('students'); // 'students' | 'staff'
    const [orderToEdit, setOrderToEdit] = useState(null); // { order, studentName, packId, packQuantity, photoFile, status, paymentMethod }
    const [newStaffForm, setNewStaffForm] = useState({ name: '', role: '', photoFile: '', tempCourse: '', tempGroup: '', assignments: [] });

    const [staffAssigning, setStaffAssigning] = useState(null); // { member, tempFile }
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [showNewStudentForm, setShowNewStudentForm] = useState(false);
    const [newStudentForm, setNewStudentForm] = useState({ name: '', course: '', group: '', photoFile: '', status: 'Pendiente', paymentMethod: '' });

    // Regalo
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3587); // Simular tiempo corrido como en captura
    const [giftForm, setGiftForm] = useState({ name: '', phone: '', email: '', privacy: false });
    const [giftSuccess, setGiftSuccess] = useState(false);
    const [giftError, setGiftError] = useState('');

    useEffect(() => {
        let interval;
        if (showGiftModal && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [showGiftModal, timeLeft]);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sc = s % 60;
        return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${sc.toString().padStart(2, '0')}s`;
    };


    const [formData, setFormData] = useState({
        studentName: '',
        schoolId: '',
        course: '',
        paymentMethod: '',
    });

    // Inicializa el colegio de administración la primera vez
    useEffect(() => {
        if (!adminSchool && schools.length > 0) setAdminSchool(schools[0].id);
    }, [schools, adminSchool]);

    // Si se borra el colegio activo, salta al primero disponible
    useEffect(() => {
        if (!schools.length) return;
        if (adminSchool && !schools.find(s => s.id === adminSchool)) {
            setAdminSchool(schools[0].id);
        }
    }, [schools]); // eslint-disable-line react-hooks/exhaustive-deps

    const [courseName, setCourseName] = useState('');   // ej: "6º Primaria"
    const [courseLine, setCourseLine] = useState('');   // ej: "A"
    const [selectedPack, setSelectedPack] = useState(null);
    const [packQuantity, setPackQuantity] = useState(1);
    const [extras, setExtras] = useState({});
    const [formError, setFormError] = useState('');

    const { orders, addOrder, updateStatus, deleteOrder, updatePhotoFile, updateOrder } = useOrders(adminSchool);
    const { staff, addStaff, updateStaffPhoto, updateStaffMember, deleteStaff } = useStaff(adminSchool);

    const getStaffAssignments = (m) => m.assignments && m.assignments.length > 0 ? m.assignments : (m.course ? [{ course: m.course, group: m.group }] : []);

    // Sincronizar método de pago por defecto cuando cambian los activos
    useEffect(() => {
        if (!formData.paymentMethod && enabledPaymentMethods.length > 0) {
            setFormData(prev => ({ ...prev, paymentMethod: enabledPaymentMethods[0].id }));
        }
    }, [enabledPaymentMethods]);

    // Notificaciones Email para Administrador
    const sendAdminNotification = async (type, data) => {
        try {
            const mailRef = collection(db, 'mail');
            let subject = '';
            let html = '';

            if (type === 'REGALO') {
                subject = `🎁 Solicitud de Regalo - ${data.name}`;
                html = `
                    <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
                        <h2 style="color: #c49b48;">Nueva solicitud de regalo (25% descuento)</h2>
                        <p><strong>Nombre:</strong> ${data.name}</p>
                        <p><strong>Teléfono:</strong> ${data.phone}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 10px; color: #999;">Aplicación: <strong>App Orlas 2026</strong> | Enviado el ${new Date().toLocaleString('es-ES')}</p>
                    </div>
                `;
            } else if (type === 'PEDIDO') {
                subject = `🎓 Nuevo Pedido Orla - ${data.studentName}`;
                html = `
                    <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
                        <h2 style="color: #6366f1;">Nuevo pedido de orla recibido</h2>
                        <p><strong>Alumno:</strong> ${data.studentName}</p>
                        <p><strong>Colegio:</strong> ${data.schoolName}</p>
                        <p><strong>Curso:</strong> ${data.course}</p>
                        <p><strong>Pack:</strong> ${data.packName}</p>
                        <p><strong>Total:</strong> ${data.total}€</p>
                        <p><strong>Método Pago:</strong> ${data.paymentMethod}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 10px; color: #999;">Aplicación: <strong>App Orlas 2026</strong> | Enviado el ${new Date().toLocaleString('es-ES')}</p>
                    </div>
                `;
            }

            await addDoc(mailRef, {
                to: 'apps@pujaltefotografia.es',
                message: { subject, html }
            });
        } catch (error) {
            console.error("Error enviando notificación mail:", error);
        }
    };

    const orderTotals = useMemo(() => {
        let price = selectedPack ? (selectedPack.price * packQuantity) : 0;
        let cost = selectedPack ? (selectedPack.cost * packQuantity) : 0;
        Object.entries(extras).forEach(([id, qty]) => {
            if (qty > 0) {
                const item = EXTRAS.find(e => e.id === id);
                if (item) { price += item.price * qty; cost += item.cost * qty; }
            }
        });
        return { price, cost, profit: price - cost };
    }, [selectedPack, packQuantity, extras]);

    const stats = useMemo(() => orders.reduce((acc, o) => ({
        revenue: acc.revenue + (o.price || 0),
        cost: acc.cost + (o.cost || 0),
        profit: acc.profit + (o.profit || 0),
        count: acc.count + 1,
        pending: acc.pending + (o.status === 'Pendiente' ? 1 : 0),
    }), { revenue: 0, cost: 0, profit: 0, count: 0, pending: 0 }), [orders]);

    const toggleExtra = (id, delta) => {
        setExtras(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
    };

    // Helpers comunes
    const getExtrasDesc = () =>
        Object.entries(extras)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => { const e = EXTRAS.find(x => x.id === id); return `${qty}x ${e.name}`; })
            .join(', ');

    const getSchoolName = (schoolId) => schools.find(s => s.id === schoolId)?.name || '';

    const handleFinalize = () => {
        const extrasDesc = getExtrasDesc();
        const newOrder = {
            studentName: formData.studentName,
            schoolId: formData.schoolId,
            schoolName: getSchoolName(formData.schoolId),
            schoolCode: schools.find(s => s.id === formData.schoolId)?.code,
            course: formData.course,
            pack: { id: selectedPack.id, label: selectedPack.name },
            packId: selectedPack.id,
            packQuantity: packQuantity,
            extras: { ...extras },
            extrasDesc,
            paymentMethod: formData.paymentMethod,
            price: orderTotals.price,
            cost: orderTotals.cost,
            profit: orderTotals.profit,
        };
        addOrder(newOrder);
        setOrderCompleted(true);

        // Notificación Email
        sendAdminNotification('PEDIDO', {
            studentName: formData.studentName,
            schoolName: getSchoolName(formData.schoolId),
            course: formData.course,
            packName: selectedPack.name,
            total: orderTotals.price,
            paymentMethod: formData.paymentMethod
        });
    };

    // Mensaje WhatsApp diferenciado por método de pago
    const buildWhatsAppMsg = () => {
        const school = getSchoolName(formData.schoolId);
        const extrasDesc = getExtrasDesc();
        const isBizum = formData.paymentMethod === 'bizum';
        const isEfectivo = formData.paymentMethod === 'efectivo';
        const methodLabel = enabledPaymentMethods.find(m => m.id === formData.paymentMethod)?.label || formData.paymentMethod;

        const header =
            `Hola Pujalte Studio 👋\n\n` +
            `📋 *Resumen del pedido:*\n\n` +
            `🎓 *Alumno:* ${formData.studentName}\n` +
            `🏫 *Colegio:* ${school}\n` +
            `📚 *Curso:* ${formData.course}\n` +
            `📦 *Pack:* ${packQuantity > 1 ? `${packQuantity}x ` : ''}${selectedPack?.name}\n` +
            (extrasDesc ? `➕ *Extras:* ${extrasDesc}\n` : '') +
            `💰 *Total:* ${orderTotals.price.toFixed(0)}€\n`;

        if (isBizum) {
            return header +
                `💳 *Pago:* Bizum\n\n` +
                `✅ He realizado el Bizum al ${CONTACT_PHONE} con el concepto *ORLA ${formData.studentName}*.\n` +
                `Adjunto el justificante. ¡Gracias!`;
        }

        if (isEfectivo) {
            return header +
                `💶 *Pago:* Efectivo\n\n` +
                `🏫 Haré entrega del importe en efectivo directamente en el centro escolar.\n` +
                `Por favor, confirmad disponibilidad para la recogida. ¡Muchas gracias!`;
        }

        // Transferencia u otro
        return header +
            `🏦 *Pago:* ${methodLabel}\n\n` +
            `En cuanto realice el pago os aviso. ¡Gracias!`;
    };

    const sendWhatsApp = () => {
        window.open(`https://wa.me/34${CONTACT_PHONE}?text=${encodeURIComponent(buildWhatsAppMsg())}`, '_blank');
    };

    const [gapiInited, setGapiInited] = useState(false);
    const [tokenClient, setTokenClient] = useState(null);

    // Inicialización de Google API
    useEffect(() => {
        const initGapi = async () => {
            try {
                await new Promise(resolve => window.gapi.load('client', resolve));
                await window.gapi.client.init({
                    apiKey: DRIVE_API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                });
                setGapiInited(true);
            } catch (e) { console.error('Gapi error:', e); }
        };

        const initGsi = () => {
            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: DRIVE_CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/drive.file',
                    callback: '', // Se define al llamar
                });
                setTokenClient(client);
            } catch (e) { console.error('Gsi error:', e); }
        };

        if (window.gapi && window.google) {
            initGapi();
            initGsi();
        }
    }, []);

    const uploadToDrive = async (content, filename) => {
        if (!gapiInited || !tokenClient) return;

        return new Promise((resolve, reject) => {
            tokenClient.callback = async (response) => {
                if (response.error !== undefined) {
                    reject(response);
                    return;
                }

                try {
                    // 1. Buscar carpeta "BACKUPS ORLAS 2026"
                    let folderId;
                    const res = await window.gapi.client.drive.files.list({
                        q: "name = 'BACKUPS ORLAS 2026' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                        fields: 'files(id)',
                    });

                    if (res.result.files.length > 0) {
                        folderId = res.result.files[0].id;
                    } else {
                        // 2. Crear si no existe
                        const folderRes = await window.gapi.client.drive.files.create({
                            resource: { name: 'BACKUPS ORLAS 2026', mimeType: 'application/vnd.google-apps.folder' },
                            fields: 'id',
                        });
                        folderId = folderRes.result.id;
                    }

                    // 3. Subir archivo
                    const fileMetadata = {
                        name: filename,
                        parents: [folderId]
                    };
                    const boundary = 'foo_bar_baz';
                    const delimiter = "\r\n--" + boundary + "\r\n";
                    const close_delim = "\r\n--" + boundary + "--";

                    const body =
                        delimiter +
                        'Content-Type: application/json\r\n\r\n' +
                        JSON.stringify(fileMetadata) +
                        delimiter +
                        'Content-Type: application/json\r\n\r\n' +
                        content +
                        close_delim;

                    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + gapi.auth.getToken().access_token,
                            'Content-Type': 'multipart/related; boundary=' + boundary
                        },
                        body: body
                    });

                    resolve(true);
                } catch (err) {
                    console.error('Drive upload failed:', err);
                    reject(err);
                }
            };

            if (window.gapi.client.getToken() === null) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    };

    const [isBackingUp, setIsBackingUp] = useState(false);

    const downloadMasterBackup = () => {
        const allData = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('orlas2026_')) {
                try { allData[key] = JSON.parse(localStorage.getItem(key)); } catch (e) { }
            }
        });
        const content = JSON.stringify(allData, null, 2);
        const date = new Date().toISOString().slice(0, 10);
        const filename = `Respaldo_Orlas2026_${date}.json`;

        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const syncWithDrive = async () => {
        if (!gapiInited || !tokenClient) {
            alert('⚠️ Google Drive no está inicializado o ha fallado. Revisa tu conexión.');
            return;
        }

        setIsBackingUp(true);
        try {
            const allData = {};
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('orlas2026_')) {
                    try { allData[key] = JSON.parse(localStorage.getItem(key)); } catch (e) { }
                }
            });
            const content = JSON.stringify(allData, null, 2);
            const date = new Date().toISOString().slice(0, 10);
            const filename = `Respaldo_Orlas2026_${date}.json`;

            await uploadToDrive(content, filename);
            alert('✅ Backup guardado en Drive con éxito');
        } catch (err) {
            console.error('Error en backup Drive:', err);
            if (err.error === 'idpiframe_initialization_failed' || err.status === 400) {
                alert('❌ Error de Google Drive (400: redirect_uri_mismatch). Asegúrate de estar usando "localhost:5173" y de que tu dominio esté autorizado en Google Cloud Console.');
            } else {
                alert('❌ Fallo al subir a Drive. ¿Cancelaste el permiso?');
            }
        } finally {
            setIsBackingUp(false);
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).catch(() => {
            const el = document.createElement('textarea');
            el.value = text; document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el);
        });
        setCopyStatus(label);
        setTimeout(() => setCopyStatus(''), 2500);
    };

    const resetForm = () => {
        setStep(1); setSelectedPack(null); setExtras({}); setOrderCompleted(false);
        setCourseName(''); setCourseLine('');
        setFormData({
            studentName: '', schoolId: schools[0]?.id || '', course: '',
            paymentMethod: enabledPaymentMethods[0]?.id || '',
        });
    };

    const handleAdminClick = () => {
        if (isAdminUnlocked) { setView('admin'); return; }
        setShowPinModal(true); setPinInput(''); setPinError(false);
    };

    const exportCSV = (filters) => {
        const school = schools.find(s => s.id === filters.school) || schools.find(s => s.id === adminSchool);
        // Filtrar pedidos por código de colegio, curso y grupo
        let rows = orders;
        if (filters.school) rows = rows.filter(o => o.schoolId === filters.school);
        if (filters.course) rows = rows.filter(o => o.course?.startsWith(filters.course));
        if (filters.group) rows = rows.filter(o => o.course?.endsWith(filters.group));
        // Orden alfabético por primer apellido
        const _firstSurname = (name = '') => {
            if (!name) return '';
            const parts = name.trim().split(/\s+/);
            return parts[1] || parts[0] || '';
        };
        rows = [...rows].sort((a, b) => _firstSurname(a.studentName).localeCompare(_firstSurname(b.studentName), 'es', { sensitivity: 'base' }));

        let csv = '\uFEFF';

        // ── SECCIÓN 1: ALUMNOS ──────────────────────────────────────────
        csv += '[[ SECCIÓN: ALUMNOS ]],,,,,,,,,\n';
        csv += 'Alumno,Fichero,Curso,Centro Educativo,Pack,Extras,Método Pago,Estado,Total,Fecha\n';

        if (rows.length > 0) {
            rows.forEach(o => {
                const date = new Date(o.timestamp).toLocaleDateString('es-ES');
                const packLabel = typeof o.pack === 'object' ? o.pack.label : (o.pack || 'S/Q');
                const extrasLabels = Array.isArray(o.extras) ? o.extras.map(e => e.label || e.name || '') :
                    Object.entries(o.extras || {}).filter(([, q]) => q > 0).map(([id]) => EXTRAS.find(e => e.id === id)?.name || id);

                csv += `"${o.studentName}","${o.photoFile || ''}","${o.course}","${o.schoolName}","${packLabel}","${extrasLabels.join('; ')}","${o.paymentMethod}","${o.status}","${o.total || o.price || 0}€","${date}"\n`;
            });
        } else {
            csv += 'Sin alumnos registrados,,,,,,,,,\n';
        }

        // Espacio de separación
        csv += '\n\n';

        // ── SECCIÓN 2: EQUIPO DOCENTE ───────────────────────────────────
        csv += '[[ SECCIÓN: EQUIPO DOCENTE ]],,,,,,,,,\n';
        csv += 'Nombre completo,Fichero,Puesto / Cargo,Centro Educativo,Curso vinculado,Grupo vinculado,,,,,\n';

        let exportStaff = staff;
        // Si el colegio del filtro es diferente al actual, cargamos su personal del localStorage
        if (filters.school && filters.school !== adminSchool) {
            try {
                const stored = localStorage.getItem(`orlas2026_staff_${filters.school}`);
                exportStaff = stored ? JSON.parse(stored) : [];
            } catch (e) { exportStaff = []; }
        }

        if (filters.course) {
            exportStaff = exportStaff.filter(m => {
                const asgs = getStaffAssignments(m);
                if (!asgs.length) return false;
                const matchesCourse = asgs.some(a => (a.course === filters.course || a.course?.startsWith(filters.course)));
                if (!matchesCourse) return false;
                if (filters.group) {
                    return asgs.some(a => (a.course === filters.course || a.course?.startsWith(filters.course)) && (!a.group || a.group === filters.group));
                }
                return true;
            });
        }

        if (exportStaff.length > 0) {
            csv += `\n\n=== EQUIPO DOCENTE ===\n`;
            csv += `"Nombre","Foto","Puesto","Colegio","Clases Asignadas"\n`;
            exportStaff.forEach(m => {
                const combined = getStaffAssignments(m).map(a => `${a.course || ''} ${a.group || ''}`.trim()).join(' / ');
                csv += `"${m.name}","${m.photoFile || ''}","${m.role}","${school?.name || ''}","${combined}"\n`;
            });
        } else {
            csv += 'Sin personal docente registrado,,,,,,,,,\n';
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        const parts = ['Orlas2026'];
        if (school) parts.push(school.name.replace(/\s+/g, '-'));
        if (filters.course) parts.push(filters.course.replace(/\s+/g, '-'));
        if (filters.group) parts.push(`Grupo-${filters.group}`);
        parts.push(new Date().toISOString().slice(0, 10));
        a.download = parts.join('_') + '.csv';
        a.click(); URL.revokeObjectURL(url);
        setShowExportModal(false);
    };

    // Extrae el primer apellido (segunda palabra) para ordenar
    const firstSurname = (name = '') => {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        return parts[1] || parts[0] || '';
    };

    const filteredOrders = orders
        .filter(o =>
            o.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.course?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => firstSurname(a.studentName).localeCompare(firstSurname(b.studentName), 'es', { sensitivity: 'base' }));

    // Helpers
    // Primera letra de cada palabra en mayúscula, resto en minúscula
    const toTitleCase = (str) =>
        str.toLowerCase().replace(/(^|[\s-])(.)/g, (_, sep, char) => sep + char.toUpperCase());

    return (
        <div className="min-h-screen transition-colors duration-500">
            {/* CABECERA */}
            <header className="fixed top-0 inset-x-0 z-50 bg-main/80 backdrop-blur-xl border-b border-primary/5 safe-top">
                <div className="max-w-lg mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={handleAdminClick} className="flex items-center gap-3 active:scale-95 transition-transform group">
                        <div className="text-left">
                            <h1 className="text-xs font-black tracking-widest leading-none text-primary/80 group-hover:text-primary uppercase transition-colors">Powered by</h1>
                            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-primary/40">Creative Studio</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-3">
                        {view === 'admin' ? (
                            <button onClick={() => setView('user')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                                <User size={12} /> Salir Admin
                            </button>
                        ) : (
                            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all duration-500 overflow-hidden relative">
                                <div className={`transition-all duration-500 transform ${theme === 'light' ? 'translate-y-0 rotate-0' : 'translate-y-12 rotate-90'}`}>
                                    <Sun size={20} className="text-amber-500" />
                                </div>
                                <div className={`absolute transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-0 rotate-0' : '-translate-y-12 -rotate-90'}`}>
                                    <Moon size={20} className="text-accent" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="h-24"></div>

            {/* MODAL EXPORTAR */}
            {showExportModal && (() => {
                const ef = exportFilters;
                const selSchool = schools.find(s => s.id === ef.school);
                const selCourseObj = COURSE_GROUPS.flatMap(g => g.courses).find(c => c.name === ef.course);
                const hasGroups = selCourseObj?.lines?.length > 0;

                // Preview del nombre de archivo
                const parts = ['Orlas2026'];
                if (selSchool) parts.push(selSchool.name.replace(/\s+/g, '-'));
                if (ef.course) parts.push(ef.course.replace(/\s+/g, '-'));
                if (ef.group) parts.push(`Grupo-${ef.group}`);
                parts.push(new Date().toISOString().slice(0, 10));
                const previewName = parts.join('_') + '.csv';

                return (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="w-full max-w-md bg-card rounded-3xl p-8 border border-primary/10 shadow-2xl animate-slide-up space-y-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                    <Download size={18} className="text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-primary">Exportar Pedidos</h3>
                                    <p className="text-xs text-secondary">Filtra antes de exportar</p>
                                </div>
                            </div>

                            {/* Centro */}
                            <div>
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Centro Educativo</label>
                                <select value={ef.school} onChange={e => setExportFilters(p => ({ ...p, school: e.target.value, course: '', group: '' }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold rounded-2xl px-4 py-3 cursor-pointer">
                                    <option value="">— Todos los centros —</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Curso */}
                            <div>
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Curso</label>
                                {(() => {
                                    // Pedidos del centro seleccionado (o todos)
                                    const baseOrders = ef.school ? orders.filter(o => o.schoolId === ef.school) : orders;
                                    // Cursos únicos presentes en esos pedidos
                                    const usedCourses = [...new Set(baseOrders.map(o => o.course?.split(' ').slice(0, -1).join(' ') || o.course))];
                                    // Curso base sin la letra de grupo al final
                                    const getCourseBase = (courseName) => {
                                        const parts = courseName?.split(' ') || [];
                                        const last = parts[parts.length - 1];
                                        return (last?.length === 1 && last === last.toUpperCase() && last !== last.toLowerCase())
                                            ? parts.slice(0, -1).join(' ')
                                            : courseName;
                                    };
                                    const usedBases = [...new Set(baseOrders.map(o => getCourseBase(o.course)))];
                                    const filtered = COURSE_GROUPS.map(g => ({
                                        ...g,
                                        courses: g.courses.filter(c => usedBases.includes(c.name)),
                                    })).filter(g => g.courses.length > 0);

                                    return (
                                        <select value={ef.course} onChange={e => setExportFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold rounded-2xl px-4 py-3 cursor-pointer">
                                            <option value="">— Todos los cursos —</option>
                                            {filtered.map(g => {
                                                const emoji = g.group.split(' ')[0];
                                                return g.courses.map(c => <option key={c.name} value={c.name}>{emoji} {c.name}</option>);
                                            })}
                                        </select>
                                    );
                                })()}
                            </div>

                            {/* Grupo (solo si el curso tiene líneas) */}
                            {hasGroups && (
                                <div>
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Grupo / Línea</label>
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={() => setExportFilters(p => ({ ...p, group: '' }))} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${!ef.group ? 'bg-accent/10 border-accent text-accent' : 'bg-primary/5 border-primary/10 text-secondary'}`}>Todos</button>
                                        {selCourseObj.lines.map(l => (
                                            <button key={l} onClick={() => setExportFilters(p => ({ ...p, group: l }))} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${ef.group === l ? 'bg-accent/10 border-accent text-accent' : 'bg-primary/5 border-primary/10 text-secondary'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview nombre */}
                            <div className="bg-primary/5 rounded-2xl px-4 py-3 border border-primary/10">
                                <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Nombre del archivo</p>
                                <p className="text-xs font-mono text-accent truncate">{previewName}</p>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 text-sm font-bold text-secondary border border-primary/10 rounded-2xl hover:bg-primary/5 transition-all">Cancelar</button>
                                <button onClick={() => exportCSV(ef)} className="flex-1 py-3 text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 text-black rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"><Download size={15} /> Descargar</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* MODAL PIN */}

            {showPinModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-sm bg-card rounded-3xl p-8 border border-primary/10 shadow-2xl animate-slide-up">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                                <Lock size={28} className="text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black text-primary">Panel Admin</h3>
                            <p className="text-sm text-secondary mt-1">Introduce el código de acceso</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-center gap-3 mb-6">
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pinInput.length > i ? 'border-amber-400 bg-amber-400/10 text-amber-500' : 'border-primary/10 text-primary'}`}>
                                        {pinInput.length > i ? '●' : ''}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k, i) => (
                                    <button key={i} onClick={() => {
                                        if (k === '⌫') { setPinInput(p => p.slice(0, -1)); setPinError(false); }
                                        else if (k !== '' && pinInput.length < 4) {
                                            const next = pinInput + k;
                                            setPinInput(next);
                                            if (next.length === 4) {
                                                setTimeout(() => {
                                                    if (next === adminPin) {
                                                        setIsAdminUnlocked(true); setShowPinModal(false); setView('admin');
                                                    } else { setPinError(true); setPinInput(''); }
                                                }, 200);
                                            }
                                        }
                                    }} className={`h-16 rounded-2xl text-xl font-black text-primary transition-all active:scale-90 ${k === '' ? 'invisible' : 'bg-primary/5 hover:bg-primary/10 border border-primary/10'}`}>
                                        {k}
                                    </button>
                                ))}
                            </div>
                            {pinError && <p className="text-center text-red-500 text-sm font-bold">✗ Código incorrecto</p>}
                        </div>
                        <button onClick={() => { setShowPinModal(false); setPinError(false); }} className="w-full mt-6 py-3 text-sm text-secondary hover:text-primary font-semibold transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* VISTA USUARIO */}
            {view === 'user' && (
                <div className="pb-safe min-h-[calc(100vh-120px)] animate-fade-in">
                    <div className="relative px-4 pt-8 pb-12 text-center">
                        <button
                            onClick={handleAdminClick}
                            className="w-36 flex items-center justify-center mx-auto mb-6 active:scale-95 transition-transform"
                        >
                            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className={`w-full h-auto object-contain transition-all duration-500 ${theme === 'light' ? 'brightness-0' : ''}`} />
                        </button>
                        <h1 className="text-4xl font-black text-primary tracking-tight leading-none">
                            Orlas<br /><span className="text-accent">2026</span>
                        </h1>

                    </div>

                    <main className="max-w-lg mx-auto px-4 space-y-6">
                        {!orderCompleted ? (
                            <>
                                <StepIndicator step={step} />

                                {/* PASO 1 */}
                                {step === 1 && (
                                    <div className="card p-8 space-y-6 animate-slide-up">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                                <User size={18} className="text-accent" />
                                            </div>
                                            <h2 className="text-xl font-black text-primary">Datos del Alumno</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-primary font-bold">Nombre y Apellidos *</label>
                                                <input
                                                    type="text"
                                                    lang="es"
                                                    spellCheck={true}
                                                    autoCorrect="on"
                                                    autoCapitalize="words"
                                                    className={`input-dark ${formError && !formData.studentName.trim() ? 'border-red-500 bg-red-50' : ''}`}
                                                    placeholder="Ej: Mario López Pérez"
                                                    value={formData.studentName}
                                                    onChange={e => { setFormData({ ...formData, studentName: e.target.value }); if (formError) setFormError(''); }}
                                                    onBlur={e => setFormData(prev => ({ ...prev, studentName: toTitleCase(e.target.value) }))}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-primary font-bold">Centro Educativo *</label>
                                                <div className="relative">
                                                    <select className={`input-dark appearance-none pr-10 ${formError && !formData.schoolId ? 'border-red-500 bg-red-50' : ''}`} value={formData.schoolId} onChange={e => { setFormData({ ...formData, schoolId: e.target.value }); if (formError) setFormError(''); }}>
                                                        <option value="">Selecciona tu Centro</option>
                                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-primary font-bold">Curso / Clase *</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <select className="input-dark appearance-none pr-10" value={courseName} onChange={e => {
                                                            const selected = e.target.value; setCourseName(selected); setCourseLine('');
                                                            setFormData(prev => ({ ...prev, course: selected }));
                                                        }}>
                                                            <option value="">Curso</option>
                                                            {COURSE_GROUPS.map(group => {
                                                                const emoji = group.group.split(' ')[0];
                                                                return group.courses.map(c => <option key={c.name} value={c.name}>{emoji} {c.name}</option>);
                                                            })}
                                                        </select>
                                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                                                    </div>
                                                    {(() => {
                                                        const allCourses = COURSE_GROUPS.flatMap(g => g.courses);
                                                        const courseObj = allCourses.find(c => c.name === courseName);
                                                        const lines = courseObj?.lines || [];
                                                        return lines.length > 0 ? (
                                                            <div className="relative">
                                                                <select className="input-dark appearance-none pr-10" value={courseLine} onChange={e => {
                                                                    const line = e.target.value; setCourseLine(line);
                                                                    setFormData(prev => ({ ...prev, course: line ? `${courseName} ${line}` : courseName }));
                                                                }}>
                                                                    <option value="">Grupo</option>
                                                                    {lines.map(l => <option key={l} value={l}>Grupo {l}</option>)}
                                                                </select>
                                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center rounded-2xl bg-white/3 border border-white/5 px-4"><span className="text-xs text-slate-600 font-semibold">Sin grupo</span></div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-4">
                                            {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">{formError}</div>}
                                            <button onClick={() => {
                                                if (!formData.studentName.trim()) { setFormError('Introduce el nombre del alumno'); return; }
                                                if (!formData.schoolId) { setFormError('Selecciona tu centro educativo'); return; }
                                                if (!formData.course) { setFormError('Selecciona el curso completo'); return; }
                                                setFormError(''); setShowLegalModal(true);
                                            }} className="btn-primary w-full text-base font-black flex items-center justify-center gap-2">
                                                Elegir Pack <ChevronRight size={18} />
                                            </button>
                                        </div>

                                        {/* MODAL LEGAL */}
                                        {showLegalModal && (
                                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                                                <div className="w-full max-w-md bg-card border border-glass-border rounded-[32px] p-8 shadow-2xl animate-slide-up space-y-6">
                                                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 text-blue-500"><Shield size={32} /></div>
                                                    <div className="text-center space-y-2">
                                                        <h3 className="text-xl font-black text-primary">Términos y Privacidad</h3>
                                                        <p className="text-sm text-secondary leading-relaxed">Para continuar, es necesario que revises y aceptes las siguientes condiciones:</p>
                                                    </div>
                                                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 max-h-56 overflow-y-auto custom-scrollbar shadow-inner text-left">
                                                        <div className="space-y-4 text-sm text-secondary/80 leading-relaxed font-medium">
                                                            <p><strong className="text-primary block font-black mb-1 text-base">Responsabilidad de Datos:</strong>El padre o madre asume la <strong className="text-primary font-bold">responsabilidad total</strong> de la exactitud de los datos introducidos.</p>
                                                            <div className="w-full h-px bg-primary/10"></div>
                                                            <p><strong className="text-primary block font-black mb-1 text-base">Error en la Impresión:</strong>Si por un error en los datos fuera necesaria la <strong className="text-primary font-bold">repetición de la impresión</strong>, los costes correrán a cuenta del solicitante.</p>
                                                            <div className="w-full h-px bg-primary/10"></div>
                                                            <p><strong className="text-primary block font-black mb-1 text-base">Protección de Datos:</strong>Los datos se usarán exclusivamente para la gestión del pedido por Pujalte Creative Studio.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <button onClick={() => { setShowLegalModal(false); setStep(2); }} className="btn-primary w-full py-4 text-sm">Acepto y elegir Pack</button>
                                                        <button onClick={() => setShowLegalModal(false)} className="text-xs font-bold text-secondary hover:text-primary transition-colors py-2">Volver atrás</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* PASO 2 */}
                                {step === 2 && (
                                    <div className="space-y-4 animate-slide-right">
                                        <div className="flex items-center gap-3 px-1">
                                            <button onClick={() => setStep(1)} className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-secondary hover:text-primary transition-colors active:scale-90 shadow-sm">
                                                <ChevronRight size={18} className="rotate-180" />
                                            </button>
                                            <h2 className="text-xl font-black text-primary">Elige tu Pack</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {PACKS.map(pack => (
                                                <PackCard
                                                    key={pack.id}
                                                    pack={pack}
                                                    selected={selectedPack?.id === pack.id}
                                                    quantity={selectedPack?.id === pack.id ? packQuantity : 1}
                                                    onSelect={() => { setSelectedPack(pack); setPackQuantity(1); }}
                                                    onUpdateQuantity={setPackQuantity}
                                                />
                                            ))}
                                            <button disabled={!selectedPack} onClick={() => setStep(3)} className="btn-primary w-full text-base font-black flex items-center justify-center gap-2">
                                                Continuar <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* PASO 3 */}
                                {step === 3 && (
                                    <div className="space-y-5 animate-slide-right">
                                        <div className="flex items-center gap-3 px-1">
                                            <button onClick={() => setStep(2)} className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-secondary hover:text-primary transition-colors active:scale-90 shadow-sm">
                                                <ChevronRight size={18} className="rotate-180" />
                                            </button>
                                            <h2 className="text-xl font-black text-primary">Resumen y Extras</h2>
                                        </div>

                                        <div className="relative overflow-hidden rounded-[30px] p-8 text-center bg-accent/5 border-accent/20 shadow-2xl">
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
                                            <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-2 opacity-80">Total del pedido</p>
                                            <p className="text-6xl font-black text-primary leading-none">{orderTotals.price.toFixed(0)}<span className="text-3xl text-accent ml-1">€</span></p>
                                            <p className="text-xs text-secondary mt-3 font-black uppercase tracking-widest">{selectedPack?.name}</p>
                                        </div>

                                        <div className="card p-6 space-y-4">
                                            <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Package size={18} className="text-accent" /> Añadir extras opcionales</h3>
                                            {EXTRAS.map(extra => <ExtraItem key={extra.id} extra={extra} qty={extras[extra.id] || 0} onToggle={(delta) => toggleExtra(extra.id, delta)} />)}

                                            {/* Aviso de precio especial */}
                                            <div className="flex gap-3 items-start p-4 rounded-2xl bg-amber-400/8 border border-amber-400/20 mt-2">
                                                <span className="text-lg leading-none mt-0.5">⚡</span>
                                                <div>
                                                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Precio exclusivo al hacer el pedido</p>
                                                    <p className="text-xs text-secondary leading-relaxed">Estos precios están disponibles <strong className="text-primary">únicamente a través de la app</strong> en el momento del pedido. Si se solicitan posteriormente, se aplicarán las tarifas vigentes del estudio.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card p-6">
                                            <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-5"><CreditCard size={18} className="text-accent" /> Método de pago</h3>
                                            {enabledPaymentMethods.length > 0 ? (
                                                <div className={`grid ${enabledPaymentMethods.length === 1 ? 'grid-cols-1 max-w-[200px] mx-auto w-full' : 'grid-cols-2'} gap-3`}>
                                                    {enabledPaymentMethods.map(m => (
                                                        <button key={m.id} onClick={() => setFormData({ ...formData, paymentMethod: m.id })} className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all duration-200 active:scale-95 ${formData.paymentMethod === m.id ? 'border-accent bg-accent/5 text-accent shadow-lg shadow-accent/5' : 'border-primary/5 bg-primary/5 text-secondary hover:border-primary/20 hover:text-primary'}`}>
                                                            {m.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : <p className="text-slate-500 text-sm text-center py-3">Sin métodos de pago activos.</p>}
                                        </div>

                                        {/* BANNER REGALO */}
                                        <button
                                            onClick={() => setShowGiftModal(true)}
                                            className="w-full card p-5 flex items-center justify-center gap-3 group active:scale-95 transition-all bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10 hover:border-accent/30"
                                        >
                                            <span className="text-lg">✨</span>
                                            <span className="text-lg font-black text-primary tracking-tight">¡Tu regalo te espera! 🎁</span>
                                        </button>

                                        <button onClick={handleFinalize} disabled={!formData.paymentMethod} className="btn-primary w-full text-xl py-6"><CheckCircle size={24} /> Confirmar Pedido</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* PANTALLA ÉXITO */
                            <div className="card p-10 space-y-8 text-center animate-scale-in">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-[30px] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xl shadow-emerald-500/5"><CheckCircle size={56} className="text-emerald-500" /></div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-primary tracking-tight">¡Reserva Completada!</h2>
                                    <p className="text-secondary text-sm font-black uppercase tracking-widest opacity-60 px-4">{formData.paymentMethod === 'bizum' ? 'Completa el Bizum y envíanos el justificante.' : 'Realiza el pago y avísanos por WhatsApp.'}</p>
                                </div>
                                <div className="bg-primary/5 rounded-[30px] p-8 border border-primary/10 text-left space-y-5 backdrop-blur-md">
                                    <div className="flex justify-between items-center border-b border-primary/10 pb-5">
                                        <span className="text-secondary text-sm font-black uppercase tracking-widest opacity-60">Total:</span>
                                        <span className="text-3xl font-black text-primary">{orderTotals.price.toFixed(0)}€</span>
                                    </div>
                                    {formData.paymentMethod === 'bizum' && (
                                        <div className="space-y-4">
                                            <button onClick={() => copyToClipboard(CONTACT_PHONE, 'teléfono')} className="w-full flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/10 active:bg-primary/10 transition-all"><div className="text-left"><p className="text-[10px] text-secondary font-black tracking-widest opacity-40 uppercase">Teléfono Bizum</p><p className="text-xl font-black text-primary mt-1">{CONTACT_PHONE}</p></div><Copy size={20} className="text-secondary opacity-60" /></button>
                                            <button onClick={() => copyToClipboard(`ORLA ${formData.studentName}`, 'concepto')} className="w-full flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/10 active:bg-primary/10 transition-all"><div className="text-left"><p className="text-[10px] text-secondary font-black tracking-widest opacity-40 uppercase">Concepto</p><p className="text-lg font-black text-primary mt-1 truncate max-w-[200px]">ORLA {formData.studentName}</p></div><Copy size={20} className="text-secondary opacity-60" /></button>
                                        </div>
                                    )}
                                    {formData.paymentMethod === 'efectivo' && <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-center text-amber-700 text-sm font-semibold">Entrega del importe en el centro escolar.</div>}
                                </div>
                                <button onClick={sendWhatsApp} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl font-black text-base active:scale-95 transition-all flex items-center justify-center gap-3 shadow-glow-green"><MessageSquare size={20} /> Enviar WhatsApp</button>
                                <button onClick={resetForm} className="w-full py-3 text-sm text-slate-500 hover:text-slate-300 font-semibold transition-colors">Hacer otro pedido</button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* VISTA ADMIN */}
            {view === 'admin' && (
                <div className="pt-0 pb-8 min-h-screen animate-fade-in">
                    <div className="max-w-5xl mx-auto px-4">
                        {/* Logo y Título integrados */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 mb-8 mt-2">
                            <img
                                src={`${import.meta.env.BASE_URL}logo.png`}
                                alt="Pujalte Creative Studio"
                                className={`h-14 w-auto transition-all duration-500 ${theme === 'light' ? 'invert brightness-0' : ''}`}
                            />
                            <div className="flex flex-col text-primary sm:border-l sm:border-primary/10 sm:pl-6 leading-none">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Panel Admin</span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Control de Campaña</h2>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex gap-1.5 bg-primary/5 p-1.5 rounded-2xl border border-primary/10 backdrop-blur-md">
                                <button onClick={() => { setAdminTab('shooting'); setShootSearch(''); }} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'shooting' ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}>📸 Shooting</button>
                                <button onClick={() => setAdminTab('settings')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'settings' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Settings size={14} className="inline mr-2" /> Ajustes App</button>
                                <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Users size={14} className="inline mr-2" /> Gestión Pedidos</button>
                            </div>
                        </div>

                        {/* ── VISTA SHOOTING ─────────────────────────────────────── */}
                        {adminTab === 'shooting' && (() => {
                            const getCourseBase = (name = '') => {
                                const parts = name.split(' ');
                                const last = parts[parts.length - 1];
                                return (last.length === 1 && last === last.toUpperCase() && isNaN(last)) ? parts.slice(0, -1).join(' ') : name;
                            };
                            const getGroup = (name = '') => {
                                const parts = name.split(' ');
                                const last = parts[parts.length - 1];
                                return (last.length === 1 && last === last.toUpperCase() && isNaN(last)) ? last : '';
                            };
                            let shootOrders = [...orders];
                            if (shootFilters.course) shootOrders = shootOrders.filter(o => getCourseBase(o.course) === shootFilters.course);
                            if (shootFilters.group) shootOrders = shootOrders.filter(o => getGroup(o.course) === shootFilters.group);

                            const q = shootSearch.trim().toLowerCase();
                            const visible = q
                                ? shootOrders.filter(o => o.studentName?.toLowerCase().includes(q))
                                : [...shootOrders].sort((a, b) => {
                                    const fa = (a.studentName || '').trim().split(/\s+/)[1] || '';
                                    const fb = (b.studentName || '').trim().split(/\s+/)[1] || '';
                                    return fa.localeCompare(fb, 'es', { sensitivity: 'base' });
                                });

                            const total = shootOrders.length;
                            const done = shootOrders.filter(o => o.photoFile).length;
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                            const availCourses = COURSE_GROUPS.flatMap(g => g.courses);
                            const activeCourses = availCourses.filter(c => orders.some(o => getCourseBase(o.course) === c.name));
                            const selCourse = availCourses.find(c => c.name === shootFilters.course);
                            const availGroups = selCourse?.lines || [];

                            return (
                                <div className="space-y-4">
                                    {/* Toggle modo */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <div className="flex gap-2 bg-primary/5 p-1.5 rounded-2xl border border-primary/10 w-fit mx-auto sm:mx-0">
                                            <button onClick={() => setShootMode('students')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${shootMode === 'students' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'text-secondary hover:text-primary opacity-60'}`}>
                                                👧 Alumnos {orders.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px]">{orders.length}</span>}
                                            </button>
                                            <button onClick={() => { setShootMode('staff'); setShootSearch(''); }} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${shootMode === 'staff' ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'text-secondary hover:text-primary opacity-60'}`}>
                                                👨‍🏫 Equipo Docente {staff.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px]">{staff.length}</span>}
                                            </button>
                                        </div>
                                        <button onClick={downloadMasterBackup} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-500/20 transition-all active:scale-95 shadow-sm">
                                            <Database size={14} /> Backup SOS
                                        </button>
                                    </div>

                                    {shootMode === 'students' && (<>
                                        <div className="card p-4 flex items-center gap-3 flex-wrap">
                                            <select value={shootFilters.course} onChange={e => setShootFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-2 cursor-pointer">
                                                <option value="">— Cursos activos ({activeCourses.length}) —</option>
                                                {activeCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                            {availGroups.length > 0 && (
                                                <select value={shootFilters.group} onChange={e => setShootFilters(p => ({ ...p, group: e.target.value }))} className="bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-2 cursor-pointer">
                                                    <option value="">— Todos —</option>
                                                    {availGroups.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                                                </select>
                                            )}
                                            <div className="flex-1 min-w-[150px]">
                                                <div className="flex justify-between text-[10px] font-black text-secondary mb-1">
                                                    <span>Progreso alumnos</span>
                                                    <span className={pct === 100 ? 'text-emerald-500' : 'text-red-700'}>{done}/{total} · {pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${pct === 100 ? 'from-emerald-500 to-emerald-400' : 'from-red-700 to-red-600'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card p-4 bg-red-700/3 border-red-700/10 mb-4 space-y-3 animate-fade-in">
                                            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none">Alta rápida (Sin pedido previo)</p>
                                            <input type="text" value={newStudentForm.name}
                                                onChange={e => {
                                                    const val = e.target.value.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                                                    setNewStudentForm(p => ({ ...p, name: val }));
                                                }}
                                                placeholder="Nombre completo del alumno" className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none" />
                                            <div className="flex flex-wrap items-center gap-2">
                                                <select value={newStudentForm.course} onChange={e => setNewStudentForm(p => ({ ...p, course: e.target.value }))} className="flex-1 min-w-[140px] bg-primary/10 border border-primary/20 text-white text-xs font-bold rounded-xl px-3 py-2.5 cursor-pointer outline-none transition-colors focus:border-red-700/50">
                                                    <option value="" className="text-primary">— Curso —</option>
                                                    {availCourses.map(c => <option key={c.name} value={c.name} className="text-primary">{c.name}</option>)}
                                                </select>
                                                <select value={newStudentForm.group} onChange={e => setNewStudentForm(p => ({ ...p, group: e.target.value }))} className="w-[95px] bg-primary/10 border border-primary/20 text-white text-xs font-bold rounded-xl px-2 py-2.5 cursor-pointer uppercase outline-none focus:border-red-700/50">
                                                    <option value="" className="text-primary">GRUPO</option>
                                                    <option value="A" className="text-primary">A</option>
                                                    <option value="B" className="text-primary">B</option>
                                                    <option value="C" className="text-primary">C</option>
                                                    <option value="D" className="text-primary">D</option>
                                                </select>
                                                <input type="text" value={newStudentForm.photoFile} onChange={e => setNewStudentForm(p => ({ ...p, photoFile: e.target.value }))}
                                                    placeholder="Nº Foto" className="w-[100px] bg-primary/10 border border-primary/20 text-white text-xs font-mono rounded-xl px-3 py-2.5 outline-none placeholder-white/40 focus:border-red-700/50" />
                                                <select value={newStudentForm.status} onChange={e => setNewStudentForm(p => ({ ...p, status: e.target.value }))} className={`w-[110px] text-[10px] font-black rounded-xl px-2 py-2.5 border cursor-pointer outline-none transition-all ${newStudentForm.status === 'Pagado' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-600'}`}>
                                                    <option value="Pendiente">PENDIENTE</option>
                                                    <option value="Pagado">PAGADO</option>
                                                </select>
                                                <select value={newStudentForm.paymentMethod} onChange={e => setNewStudentForm(p => ({ ...p, paymentMethod: e.target.value }))} className="w-[150px] bg-primary/10 border border-primary/20 text-white text-[10px] font-black rounded-xl px-2 py-2.5 cursor-pointer uppercase outline-none focus:border-red-700/50">
                                                    <option value="" disabled className="text-primary">FORMA DE PAGO</option>
                                                    <option value="Efectivo" className="text-primary">Efectivo</option>
                                                    <option value="Bizum" className="text-primary">Bizum</option>
                                                    <option value="Transferencia" className="text-primary">Transferencia</option>
                                                </select>
                                                <button
                                                    disabled={!newStudentForm.name.trim() || !newStudentForm.course}
                                                    onClick={() => {
                                                        const fullCourse = `${newStudentForm.course}${newStudentForm.group ? ' ' + newStudentForm.group.toUpperCase() : ''}`;
                                                        const newOrder = {
                                                            studentName: newStudentForm.name,
                                                            schoolId: adminSchool,
                                                            schoolName: schools.find(s => s.id === adminSchool)?.name || '',
                                                            course: fullCourse,
                                                            pack: { id: 'manual', label: 'PENDIENTE' },
                                                            packQuantity: 1,
                                                            extras: [],
                                                            paymentMethod: newStudentForm.paymentMethod,
                                                            status: newStudentForm.status,
                                                            total: 0,
                                                            cost: 0,
                                                            photoFile: newStudentForm.photoFile,
                                                            id: `MANUAL_${Date.now()}`,
                                                            timestamp: Date.now()
                                                        };
                                                        addOrder(newOrder);
                                                        setNewStudentForm({ name: '', course: '', group: '', photoFile: '', status: 'Pendiente', paymentMethod: '' });
                                                        setShowNewStudentForm(false);
                                                    }}
                                                    className="flex-1 sm:flex-none bg-red-700 text-white font-black text-[10px] rounded-xl px-6 py-2.5 hover:bg-red-800 transition-all active:scale-95 disabled:opacity-30 shadow-sm shadow-red-700/20 whitespace-nowrap">GUARDAR ALUMNO</button>
                                            </div>
                                        </div>
                                        {/* Buscador alumnos */}
                                        <div className="card overflow-hidden">
                                            <div className="p-4 border-b border-primary/5 flex flex-col gap-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="relative flex-1">
                                                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                                                        <input type="text" lang="es" value={shootSearch} onChange={e => { setShootSearch(e.target.value); setSelectedOrderIds([]); }}
                                                            placeholder="Escribe nombre o apellido para encontrar al alumno..."
                                                            className="w-full bg-primary/5 border-2 border-red-700/30 focus:border-red-700 rounded-2xl pl-12 pr-4 py-4 text-base text-primary placeholder-primary/30 outline-none font-medium transition-colors" />
                                                    </div>
                                                    {visible.length > 0 && (
                                                        <button onClick={() => {
                                                            if (selectedOrderIds.length === visible.length) setSelectedOrderIds([]);
                                                            else setSelectedOrderIds(visible.map(o => o.id));
                                                        }} className="px-4 py-4 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                                            {selectedOrderIds.length === visible.length ? <CheckSquare size={16} className="text-red-700" /> : <Square size={16} />}
                                                            <span className="hidden sm:inline">Todos</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {selectedOrderIds.length > 0 && (
                                                    <div className="flex items-center justify-between bg-red-700/10 p-3 rounded-xl border border-red-700/20 animate-fade-in">
                                                        <p className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
                                                            <Trash2 size={14} /> {selectedOrderIds.length} seleccionados
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setSelectedOrderIds([])} className="px-3 py-1.5 text-[10px] font-black uppercase text-secondary hover:text-primary">Cancelar</button>
                                                            <button onClick={() => {
                                                                if (confirm(`¿Estás seguro de que quieres borrar ${selectedOrderIds.length} alumnos? Esta acción no se puede deshacer.`)) {
                                                                    selectedOrderIds.forEach(id => deleteOrder(id));
                                                                    setSelectedOrderIds([]);
                                                                }
                                                            }} className="px-4 py-1.5 bg-red-700 text-white text-[10px] font-black uppercase rounded-lg shadow-sm shadow-red-700/20 active:scale-95 transition-all">Borrar permanentemente</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="divide-y divide-primary/5 max-h-[55vh] overflow-y-auto">
                                                {visible.length === 0
                                                    ? <div className="py-16 text-center text-secondary font-semibold opacity-50">{total === 0 ? 'Sin pedidos registrados' : 'Sin resultados'}</div>
                                                    : visible.map(order => (
                                                        <div key={order.id} className="w-full flex items-center hover:bg-red-700/5 transition-colors group">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                                                                }}
                                                                className="pl-5 py-6 flex-shrink-0"
                                                            >
                                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedOrderIds.includes(order.id) ? 'bg-red-700 border-red-700 text-white' : 'border-primary/20 bg-primary/5 text-transparent'}`}>
                                                                    <CheckCircle size={14} strokeWidth={3} />
                                                                </div>
                                                            </button>
                                                            <button onClick={() => setShootAssigning({ order, tempFile: order.photoFile || '' })}
                                                                className="flex-1 flex items-center gap-4 px-3 py-4 text-left">
                                                                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${order.photoFile ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/5 text-secondary'}`}>
                                                                    {order.photoFile ? '✅' : '📷'}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-black text-primary truncate">{order.studentName}</p>
                                                                    <p className="text-[10px] text-secondary font-semibold">{order.course}</p>
                                                                </div>
                                                                {order.photoFile
                                                                    ? <span className="text-xs font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex-shrink-0">{order.photoFile}</span>
                                                                    : <span className="text-[10px] font-black text-secondary opacity-0 group-hover:opacity-40 transition-all">TAP →</span>
                                                                }
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </>)
                                    }

                                    {/* ── EQUIPO DOCENTE ────────────────────────── */}
                                    {shootMode === 'staff' && (<>
                                        <div className="card p-4 flex items-center gap-3 flex-wrap">
                                            <div className="flex-1">
                                                {staff.length > 0 && (
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="relative flex-1">
                                                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                                <input type="text" lang="es" value={shootSearch} onChange={e => { setShootSearch(e.target.value); setSelectedStaffIds([]); }}
                                                                    placeholder="Buscar por nombre..."
                                                                    className="w-full bg-primary/5 border border-indigo-400/20 focus:border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder-primary/30 outline-none transition-colors" />
                                                            </div>
                                                            <button onClick={() => {
                                                                const sq = shootSearch.trim().toLowerCase();
                                                                const filtered = sq ? staff.filter(m => m.name.toLowerCase().includes(sq)) : staff;
                                                                if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                                                else setSelectedStaffIds(filtered.map(m => m.id));
                                                            }} className="px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                                                {(() => {
                                                                    const sq = shootSearch.trim().toLowerCase();
                                                                    const filtered = sq ? staff.filter(m => m.name.toLowerCase().includes(sq)) : staff;
                                                                    return selectedStaffIds.length > 0 && selectedStaffIds.length === filtered.length ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />;
                                                                })()}
                                                                <span className="hidden sm:inline">Todos</span>
                                                            </button>
                                                        </div>

                                                        {selectedStaffIds.length > 0 && (
                                                            <div className="flex items-center justify-between bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 animate-fade-in">
                                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                                                    <Trash2 size={14} /> {selectedStaffIds.length} seleccionados
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setSelectedStaffIds([])} className="px-3 py-1.5 text-[10px] font-black uppercase text-secondary hover:text-primary">Cancelar</button>
                                                                    <button onClick={() => {
                                                                        if (confirm(`¿Estás seguro de que quieres borrar ${selectedStaffIds.length} miembros del equipo? Esta acción no se puede deshacer.`)) {
                                                                            selectedStaffIds.forEach(id => deleteStaff(id));
                                                                            setSelectedStaffIds([]);
                                                                        }
                                                                    }} className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg shadow-sm shadow-indigo-500/20 active:scale-95 transition-all">Borrar selección</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="card p-4 bg-indigo-500/3 border-indigo-500/10 mb-4 space-y-3">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Alta rápida de personal</p>
                                            <input type="text" value={newStaffForm.name}
                                                onChange={e => {
                                                    const val = e.target.value.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                                                    setNewStaffForm(p => ({ ...p, name: val }));
                                                }}
                                                placeholder="Nombre completo" className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none" />
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex-1 min-w-[200px] relative">
                                                    <input type="text" list="roles-list" value={newStaffForm.role} onChange={e => setNewStaffForm(p => ({ ...p, role: e.target.value }))}
                                                        placeholder="Puesto (ej: Tutor, Director...)" className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50" />
                                                    <datalist id="roles-list">
                                                        {STAFF_ROLES.flatMap(g => g.roles).map(r => <option key={r} value={r} />)}
                                                    </datalist>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    {newStaffForm.assignments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-1 p-2 bg-primary/2 rounded-xl border border-primary/5">
                                                            {newStaffForm.assignments.map((a, i) => (
                                                                <span key={i} className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-indigo-500/20">
                                                                    {a.course} {a.group}
                                                                    <button onClick={() => setNewStaffForm(p => ({ ...p, assignments: p.assignments.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors ml-1">x</button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-3">
                                                        <select value={newStaffForm.tempCourse} onChange={e => setNewStaffForm(p => ({ ...p, tempCourse: e.target.value }))} className="flex-1 min-w-[130px] bg-primary/10 border border-primary/20 text-white text-xs font-bold rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-indigo-400/50 text-center">
                                                            <option value="" className="text-primary">CLASE</option>
                                                            {availCourses.map(c => <option key={c.name} value={c.name} className="text-primary">{c.name}</option>)}
                                                        </select>
                                                        <select value={newStaffForm.tempGroup} onChange={e => setNewStaffForm(p => ({ ...p, tempGroup: e.target.value }))} className="w-[95px] bg-primary/10 border border-primary/20 text-white text-xs font-bold rounded-xl px-3 py-2 cursor-pointer uppercase outline-none focus:border-indigo-400/50">
                                                            <option value="" className="text-primary">GRUPO</option>
                                                            <option value="A" className="text-primary">A</option>
                                                            <option value="B" className="text-primary">B</option>
                                                            <option value="C" className="text-primary">C</option>
                                                            <option value="D" className="text-primary">D</option>
                                                        </select>
                                                        <button
                                                            disabled={!newStaffForm.tempCourse}
                                                            onClick={() => setNewStaffForm(p => ({ ...p, assignments: [...p.assignments, { course: p.tempCourse, group: p.tempGroup }], tempCourse: '', tempGroup: '' }))}
                                                            className="bg-indigo-500/20 text-indigo-400 font-black text-[10px] rounded-xl px-4 py-2 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-30">
                                                            + Asignar
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2 w-full mt-2">
                                                        <input type="text" value={newStaffForm.photoFile} onChange={e => setNewStaffForm(p => ({ ...p, photoFile: e.target.value }))}
                                                            placeholder="Nº Foto (opcional)" className="w-1/3 min-w-[120px] bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none font-mono focus:border-indigo-400/50" />
                                                        <button
                                                            disabled={!newStaffForm.name.trim() || !newStaffForm.role.trim() || newStaffForm.assignments.length === 0}
                                                            onClick={() => {
                                                                addStaff({
                                                                    name: newStaffForm.name,
                                                                    role: newStaffForm.role,
                                                                    assignments: newStaffForm.assignments,
                                                                    photoFile: newStaffForm.photoFile
                                                                });
                                                                setNewStaffForm({ name: '', role: '', photoFile: '', tempCourse: '', tempGroup: '', assignments: [] });
                                                            }}
                                                            className="flex-1 bg-red-700 text-white font-black text-[10px] rounded-xl px-4 py-3 hover:bg-red-800 transition-all active:scale-95 disabled:opacity-30 shadow-sm shadow-red-700/20">GUARDAR FICHA</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card overflow-hidden">
                                            <div className="p-4 border-b border-primary/5 flex flex-col gap-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="relative flex-1">
                                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                        <input type="text" lang="es" value={shootSearch} onChange={e => { setShootSearch(e.target.value); setSelectedStaffIds([]); }}
                                                            placeholder="Buscar por nombre..."
                                                            className="w-full bg-primary/5 border border-indigo-400/20 focus:border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder-primary/30 outline-none transition-colors" />
                                                    </div>
                                                    {staff.length > 0 && (
                                                        <button onClick={() => {
                                                            const filtered = shootSearch.trim() ? staff.filter(m => m.name.toLowerCase().includes(shootSearch.trim().toLowerCase())) : staff;
                                                            if (selectedStaffIds.length === filtered.length) setSelectedStaffIds([]);
                                                            else setSelectedStaffIds(filtered.map(m => m.id));
                                                        }} className="px-4 py-2.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-primary/10 transition-all flex items-center gap-2">
                                                            {((sq) => {
                                                                const filtered = sq ? staff.filter(m => m.name.toLowerCase().includes(sq)) : staff;
                                                                return selectedStaffIds.length > 0 && selectedStaffIds.length === filtered.length ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />;
                                                            })(shootSearch.trim().toLowerCase())}
                                                            <span className="hidden sm:inline">Todos</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {selectedStaffIds.length > 0 && (
                                                    <div className="flex items-center justify-between bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 animate-fade-in">
                                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                                            <Trash2 size={14} /> {selectedStaffIds.length} seleccionados
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setSelectedStaffIds([])} className="px-3 py-1.5 text-[10px] font-black uppercase text-secondary hover:text-primary">Cancelar</button>
                                                            <button onClick={() => {
                                                                if (confirm(`¿Estás seguro de que quieres borrar ${selectedStaffIds.length} miembros del equipo? Esta acción no se puede deshacer.`)) {
                                                                    selectedStaffIds.forEach(id => deleteStaff(id));
                                                                    setSelectedStaffIds([]);
                                                                }
                                                            }} className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg shadow-sm shadow-indigo-500/20 active:scale-95 transition-all">Borrar selección</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="divide-y divide-primary/5 max-h-[55vh] overflow-y-auto">
                                                {(() => {
                                                    const sq = shootSearch.trim().toLowerCase();
                                                    const filteredStaff = staff.filter(m => {
                                                        if (sq && !m.name.toLowerCase().includes(sq)) return false;

                                                        if (shootFilters.course) {
                                                            const asgs = getStaffAssignments(m);
                                                            if (!asgs.length) return false;
                                                            // Check if any assignment matches the selected course
                                                            const matchesCourse = asgs.some(a => a.course === shootFilters.course);
                                                            if (!matchesCourse) return false;
                                                            // Check if group is required
                                                            if (shootFilters.group) {
                                                                const matchesGroup = asgs.some(a => a.course === shootFilters.course && (!a.group || a.group === shootFilters.group));
                                                                if (!matchesGroup) return false;
                                                            }
                                                        }
                                                        return true;
                                                    });

                                                    if (filteredStaff.length === 0) {
                                                        return <div className="py-16 text-center text-secondary font-semibold opacity-50">{staff.length === 0 ? 'Sin personal registrado' : 'Sin resultados'}</div>;
                                                    }

                                                    return [...filteredStaff].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })).map(member => (
                                                        <div key={member.id} className="w-full flex items-center hover:bg-indigo-500/3 transition-colors group">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedStaffIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                                                                }}
                                                                className="pl-5 py-6 flex-shrink-0"
                                                            >
                                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedStaffIds.includes(member.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-primary/20 bg-primary/5 text-transparent'}`}>
                                                                    <CheckCircle size={12} strokeWidth={3} />
                                                                </div>
                                                            </button>
                                                            <button onClick={() => setStaffAssigning({ member, name: member.name, role: member.role, assignments: getStaffAssignments(member), tempCourse: '', tempGroup: '', tempFile: member.photoFile || '' })}
                                                                className="flex-1 flex items-center gap-4 px-3 py-4 text-left">
                                                                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${member.photoFile ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/5 text-secondary'}`}>
                                                                    {member.photoFile ? '✅' : '👤'}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <p className="text-sm font-black text-primary truncate">{member.name}</p>
                                                                        {member.photoFile && (
                                                                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 px-2 py-0.5 rounded-md leading-none">{member.photoFile}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                        <p className="text-[10px] text-indigo-400 font-semibold">{member.role}</p>
                                                                        {getStaffAssignments(member).length > 0 && (
                                                                            <div className="flex gap-1.5 flex-wrap mt-0.5">
                                                                                {getStaffAssignments(member).map((a, i) => (
                                                                                    <span key={i} className="text-[9px] text-primary/50 font-bold bg-primary/5 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-primary/10">
                                                                                        <Users size={9} /> {a.course} {a.group}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </>)}
                                </div>
                            );
                        })()
                        }

                        {/* ── MODAL ASIGNAR FICHERO — PERSONAL ─────────── */}
                        {
                            staffAssigning && (
                                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                                    <div className="w-full max-w-sm bg-card rounded-3xl p-7 border border-primary/10 shadow-2xl animate-slide-up space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20">👤</div>
                                            <div>
                                                <p className="text-lg font-black text-primary leading-tight">Editar Ficha</p>
                                                <p className="text-xs text-secondary uppercase tracking-widest font-bold">Personal Docente</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nombre Completo</label>
                                                <input type="text" value={staffAssigning.name} onChange={e => setStaffAssigning(p => ({ ...p, name: e.target.value }))}
                                                    className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50" />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Puesto / Cargo</label>
                                                <input type="text" list="roles-list-edit" value={staffAssigning.role} onChange={e => setStaffAssigning(p => ({ ...p, role: e.target.value }))}
                                                    placeholder="Puesto (ej: Tutor)" className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50" />
                                                <datalist id="roles-list-edit">
                                                    {STAFF_ROLES.flatMap(g => g.roles).map(r => <option key={r} value={r} />)}
                                                </datalist>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-0.5 block">Clases Asignadas</label>
                                                {staffAssigning.assignments.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 p-2 bg-primary/2 rounded-xl border border-primary/5">
                                                        {staffAssigning.assignments.map((a, i) => (
                                                            <span key={i} className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-indigo-500/20">
                                                                {a.course} {a.group}
                                                                <button onClick={() => setStaffAssigning(p => ({ ...p, assignments: p.assignments.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors ml-1">x</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <select value={staffAssigning.tempCourse} onChange={e => setStaffAssigning(p => ({ ...p, tempCourse: e.target.value }))} className="flex-1 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-3 outline-none focus:border-indigo-400/50">
                                                        <option value="">CLASE</option>
                                                        {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <select value={staffAssigning.tempGroup} onChange={e => setStaffAssigning(p => ({ ...p, tempGroup: e.target.value }))} className="w-[85px] bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-3 outline-none focus:border-indigo-400/50 uppercase">
                                                        <option value="">GRUPO</option>
                                                        <option value="A">A</option>
                                                        <option value="B">B</option>
                                                        <option value="C">C</option>
                                                        <option value="D">D</option>
                                                    </select>
                                                    <button
                                                        disabled={!staffAssigning.tempCourse}
                                                        onClick={() => setStaffAssigning(p => ({ ...p, assignments: [...p.assignments, { course: p.tempCourse, group: p.tempGroup }], tempCourse: '', tempGroup: '' }))}
                                                        className="bg-indigo-500/10 text-indigo-400 font-black text-xl rounded-xl px-4 py-2 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-30">
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nº Fichero de Cámara</label>
                                            <input type="text" value={staffAssigning.tempFile} onChange={e => setStaffAssigning(p => ({ ...p, tempFile: e.target.value }))}
                                                placeholder="DSC_0000" className="w-full bg-primary/5 border border-primary/10 text-primary font-mono text-base rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50" />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button onClick={() => setStaffAssigning(null)} className="flex-1 py-3 text-xs font-bold text-secondary border border-primary/10 rounded-2xl hover:bg-primary/5 transition-all">Cancelar</button>
                                            <button
                                                disabled={!staffAssigning.name.trim() || !staffAssigning.role.trim() || staffAssigning.assignments.length === 0}
                                                onClick={() => {
                                                    updateStaffMember(staffAssigning.member.id, {
                                                        name: staffAssigning.name,
                                                        role: staffAssigning.role,
                                                        assignments: staffAssigning.assignments,
                                                        photoFile: staffAssigning.tempFile
                                                    });
                                                    setStaffAssigning(null);
                                                }}
                                                className="flex-[1.5] py-3 text-xs font-black bg-gradient-to-r from-indigo-500 to-indigo-400 text-white rounded-2xl active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-indigo-500/20"
                                            >GUARDAR CAMBIOS</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* ── MODAL ASIGNAR FICHERO ─────────────────────────────── */}
                        {
                            shootAssigning && (
                                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                                    <div className="w-full max-w-sm bg-card rounded-3xl p-7 border border-primary/10 shadow-2xl animate-slide-up">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-2xl">📷</span>
                                            <div>
                                                <p className="text-lg font-black text-primary leading-tight">{shootAssigning.order.studentName}</p>
                                                <p className="text-xs text-secondary">{shootAssigning.order.course}</p>
                                            </div>
                                        </div>
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">Nombre del fichero de cámara</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={shootAssigning.tempFile}
                                            onChange={e => setShootAssigning(p => ({ ...p, tempFile: e.target.value }))}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && shootAssigning.tempFile.trim()) {
                                                    updatePhotoFile(shootAssigning.order.id, shootAssigning.tempFile.trim());
                                                    setShootAssigning(null);
                                                }
                                            }}
                                            placeholder="DSC_0047"
                                            className="w-full bg-primary/5 border border-primary/10 text-primary font-mono text-base rounded-2xl px-4 py-3.5 outline-none mb-5"
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => setShootAssigning(null)} className="flex-1 py-3 text-sm font-bold text-secondary border border-primary/10 rounded-2xl hover:bg-primary/5 transition-all">Cancelar</button>
                                            {shootAssigning.order.photoFile && (
                                                <button onClick={() => { updatePhotoFile(shootAssigning.order.id, ''); setShootAssigning(null); }} className="py-3 px-4 text-sm font-bold text-red-400 border border-red-400/20 rounded-2xl hover:bg-red-500/5 transition-all">Borrar</button>
                                            )}
                                            <button
                                                disabled={!shootAssigning.tempFile.trim()}
                                                onClick={() => {
                                                    updatePhotoFile(shootAssigning.order.id, shootAssigning.tempFile.trim());
                                                    setShootAssigning(null);
                                                }}
                                                className="flex-1 py-3 text-sm font-black bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-red-700/20"
                                            >
                                                ✓ Asignar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* ── GESTIÓN DE PEDIDOS ──────────────────────────────── */}
                        {
                            adminTab === 'orders' && (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <StatCard icon={<Users size={16} />} label="Pedidos" value={stats.count} color="indigo" />
                                        <StatCard icon={<DollarSign size={16} />} label="Ingresos" value={`${stats.revenue.toFixed(0)}€`} color="blue" />
                                        <StatCard icon={<TrendingUp size={16} />} label="Beneficio" value={`${stats.profit.toFixed(0)}€`} color="emerald" />
                                        <StatCard icon={<Package size={16} />} label="Pendientes" value={stats.pending} color="amber" />
                                    </div>
                                    <div className="card overflow-hidden">
                                        <div className="p-4 border-b border-primary/5">
                                            <div className="relative">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                                                <input className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-primary placeholder-primary/30 outline-none" placeholder="Buscar alumno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="hidden sm:grid grid-cols-[minmax(120px,1.5fr)_minmax(110px,1.2fr)_minmax(160px,2fr)_minmax(100px,1fr)_minmax(130px,1.5fr)_minmax(80px,0.7fr)_minmax(80px,0.7fr)_70px] gap-2 px-4 py-2.5 bg-primary/3 border-b border-primary/5">
                                            {['Alumno', 'Curso', 'Centro Educativo', 'Pack', 'Extras', 'Pago', 'Estado', ''].map((h, i) => (
                                                <span key={i} className="text-[9px] font-black text-secondary uppercase tracking-widest text-center first:text-left last:text-right">{h}</span>
                                            ))}
                                        </div>
                                        {filteredOrders.length === 0 ? <div className="py-16 text-center text-secondary font-semibold opacity-50">Sin resultados</div> : (
                                            <div className="divide-y divide-primary/5">
                                                {filteredOrders.map(order => (
                                                    <OrderRow
                                                        key={order.id}
                                                        order={order}
                                                        onStatusChange={(s) => updateStatus(order.id, s)}
                                                        onDelete={() => deleteOrder(order.id)}
                                                        onEdit={(o) => setOrderToEdit({
                                                            ...o,
                                                            studentName: o.studentName,
                                                            packId: o.pack?.id || o.pack || 'esencial',
                                                            packQuantity: o.packQuantity || 1,
                                                            tempPhotoFile: o.photoFile || '',
                                                            tempStatus: o.status || 'Pendiente',
                                                            tempPayment: o.paymentMethod || ''
                                                        })}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )
                        }

                        {/* ── MODAL EDITAR PEDIDO ────────────────────────────────── */}
                        {
                            orderToEdit && (
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
                                                <input type="text" value={orderToEdit.studentName} onChange={e => setOrderToEdit(p => ({ ...p, studentName: e.target.value }))}
                                                    className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-400/50" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Pack Seleccionado</label>
                                                    <select value={orderToEdit.packId} onChange={e => setOrderToEdit(p => ({ ...p, packId: e.target.value }))}
                                                        className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-400/50">
                                                        {PACKS.map(pack => <option key={pack.id} value={pack.id} className="text-slate-900">{pack.name}</option>)}
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
                                                        <option value="Transferencia" className="text-slate-900">Transferencia</option>
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
                                                    const selectedPackObj = PACKS.find(pk => pk.id === orderToEdit.packId);
                                                    const updatedOrder = {
                                                        studentName: orderToEdit.studentName,
                                                        pack: selectedPackObj ? { id: selectedPackObj.id, label: selectedPackObj.name } : { id: 'manual', label: 'Personalizado' },
                                                        packQuantity: orderToEdit.packQuantity,
                                                        photoFile: orderToEdit.tempPhotoFile,
                                                        status: orderToEdit.tempStatus,
                                                        paymentMethod: orderToEdit.tempPayment
                                                    };
                                                    updateOrder(orderToEdit.id, updatedOrder);
                                                    setOrderToEdit(null);
                                                }}
                                                className="flex-[1.5] py-3 text-xs font-black bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                            >ACTUALIZAR PEDIDO</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* ── AJUSTES DE LA APP ────────────────────────────────── */}
                        {/* ── AJUSTES DE LA APP ────────────────────────────────── */}
                        {
                            adminTab === 'settings' && (
                                <div className="space-y-6 pb-20">
                                    {/* Fila Superior: 2 Columnas */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Bloque 1: Pagos y Seguridad (Columna Izquierda) */}
                                        <div className="card p-6 flex flex-col h-full">
                                            <div className="flex flex-col h-full">
                                                <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><CreditCard size={18} className="text-accent" /> Pagos y Seguridad</h3>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    {paymentMethods.filter(m => m.id !== 'transferencia').map(method => {
                                                        const emoji = method.label.split(' ')[0];
                                                        const name = method.label.split(' ').slice(1).join(' ');
                                                        return (
                                                            <div key={method.id} className={`flex items-center justify-between p-4 rounded-2xl border ${method.enabled ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/3 border-white/5'}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${method.enabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-secondary opacity-40'}`}>
                                                                        {emoji}
                                                                    </div>
                                                                    <span className={`text-[11px] font-black uppercase tracking-wider ${method.enabled ? 'text-primary' : 'text-secondary'}`}>{name}</span>
                                                                </div>
                                                                <button onClick={() => togglePaymentMethod(method.id)} className={`w-10 h-6 rounded-full relative transition-colors ${method.enabled ? 'bg-indigo-500' : 'bg-primary/10'}`}>
                                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${method.enabled ? 'right-1' : 'left-1'}`} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-primary/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="text-sm font-black text-primary flex items-center gap-2 mb-4">
                                                            <Shield size={16} className="text-accent" /> Cambiar PIN de Acceso
                                                        </h3>
                                                        <input type="text" maxLength={4} className="input-dark w-full py-3 text-sm tracking-[1em] font-black text-center" placeholder="XXXX" onChange={e => {
                                                            const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                            if (val.length === 4) { updateAdminPin(val); alert('✅ PIN actualizado'); e.target.value = ''; }
                                                        }} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-primary flex items-center gap-2 mb-4">
                                                            <Gift size={16} className="text-pink-500" /> % Regalo Comercial
                                                        </h3>
                                                        <div className="flex items-center gap-3">
                                                            <input type="number" min="0" max="100" defaultValue={settings?.giftDiscount || 25} className="input-dark w-full py-3 text-sm font-black text-center" placeholder="25" onChange={e => {
                                                                const val = parseInt(e.target.value);
                                                                if (!isNaN(val) && val >= 0 && val <= 100) {
                                                                    updateSettings({ giftDiscount: val });
                                                                }
                                                            }} />
                                                            <span className="text-secondary font-black text-xl">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bloque 2: Gestión de Datos (Columna Derecha) */}
                                        <div className="card p-6 flex flex-col h-full">
                                            <div className="flex flex-col h-full">
                                                <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><Database size={18} className="text-indigo-500" /> Gestión de Datos</h3>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <button onClick={downloadMasterBackup} className="py-4 bg-white/5 border border-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all">
                                                        <Download size={14} /> Descargar JSON
                                                    </button>
                                                    <button onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = '.json';
                                                        input.onchange = (e) => {
                                                            const file = e.target.files[0];
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                try {
                                                                    const data = JSON.parse(event.target.result);
                                                                    if (confirm('⚠️ Esto sobrescribirá todos los datos actuales. ¿Estás seguro?')) {
                                                                        Object.keys(data).forEach(key => { if (key.startsWith('orlas2026_')) localStorage.setItem(key, JSON.stringify(data[key])); });
                                                                        window.location.reload();
                                                                    }
                                                                } catch (err) { alert('Archivo no válido'); }
                                                            };
                                                            reader.readAsText(file);
                                                        };
                                                        input.click();
                                                    }} className="py-4 bg-white/5 border border-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all">
                                                        <Upload size={14} /> Restaurar JSON
                                                    </button>
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-primary/5">
                                                    <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6">
                                                        <Share size={18} className="text-indigo-500" /> Exportar Datos Orla
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <button onClick={() => {
                                                            const selectedSchoolObj = schools.find(s => s.id === adminSchool);
                                                            if (!selectedSchoolObj) return alert('Selecciona un centro primero');
                                                            exportCSV({ school: adminSchool });
                                                        }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                                            <Download size={16} /> Descargar Excel {schools.find(s => s.id === adminSchool)?.name}
                                                        </button>
                                                        <p className="text-[9px] text-secondary font-black opacity-40 uppercase tracking-widest text-center italic">Se exportarán las tablas de alumnos y personal del centro seleccionado abajo</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fila Inferior: Centros Educativos (Ancho Completo) */}
                                    <div className="card p-8">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                                            <h3 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tight">
                                                <GraduationCap size={28} className="text-indigo-500" /> Centros Educativos
                                            </h3>
                                            <div className="flex gap-3 w-full sm:w-96">
                                                <input
                                                    id="new-school-input-final"
                                                    className="input-dark flex-1 py-4 text-sm px-6"
                                                    placeholder="Nombre del nuevo centro..."
                                                    onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { addSchool(e.target.value.trim()); e.target.value = ''; } }}
                                                />
                                                <button
                                                    onClick={() => { const input = document.getElementById('new-school-input-final'); if (input.value.trim()) { addSchool(input.value.trim()); input.value = ''; } }}
                                                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                                >
                                                    <Plus size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {schools.map(s => (
                                                <div key={s.id} className={`flex justify-between items-center p-5 rounded-[24px] border transition-all ${adminSchool === s.id ? 'bg-indigo-500/5 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-primary/5 border-primary/5 hover:border-primary/20'}`}>
                                                    <button onClick={() => setAdminSchool(s.id)} className="flex-1 text-left">
                                                        <span className={`text-sm font-black uppercase tracking-wider ${adminSchool === s.id ? 'text-indigo-400' : 'text-primary'}`}>{s.name}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Código: {s.code}</p>
                                                            {adminSchool === s.id && <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md">ACTUAL</span>}
                                                        </div>
                                                    </button>
                                                    <button onClick={() => deleteSchool(s.id)} className="w-10 h-10 flex items-center justify-center text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        <BackgroundOrbs />
                    </div>
                </div>
            )
            }
            {/* MODAL REGALO */}
            {
                showGiftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
                        <div className="relative w-full max-w-[420px] bg-main rounded-[40px] border border-primary/10 overflow-hidden shadow-2xl animate-scale-in">
                            {/* Decoración superior */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/20 to-transparent -z-1 opacity-50" />

                            {/* Botón cerrar */}
                            <button onClick={() => { setShowGiftModal(false); setGiftSuccess(false); }} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 text-secondary hover:text-primary transition-colors z-10"><X size={20} /></button>

                            <div className="p-8 pb-10 flex flex-col items-center text-center">
                                {giftSuccess ? (
                                    <div className="flex flex-col items-center py-6 animate-fade-in w-full">
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center border border-emerald-500/20 mb-8 relative">
                                            <CheckCircle size={44} className="text-emerald-500 animate-scale-in" />
                                            <Sparkles size={20} className="absolute -top-1 -right-1 text-emerald-400 animate-ping" />
                                        </div>
                                        <h2 className="text-3xl font-serif italic text-primary mb-4" style={{ fontFamily: 'Georgia, serif' }}>¡Casi tuyo!</h2>
                                        <p className="text-secondary text-base mb-10 px-4 leading-relaxed">Nos pondremos en contacto contigo muy pronto para darte todos los detalles de la sesión y aplicar tu descuento.</p>
                                        <button
                                            onClick={() => { setShowGiftModal(false); setGiftSuccess(false); }}
                                            className="w-full h-[60px] bg-primary/5 text-primary hover:bg-primary/10 font-black text-lg rounded-2xl transition-all"
                                        >
                                            Muchas gracias
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Icono Principal Alegre */}
                                        <div className="relative mb-6 mt-2">
                                            <div className="w-24 h-24 bg-gradient-to-br from-accent/30 to-accent/10 rounded-[32px] flex items-center justify-center border border-accent/20 shadow-xl shadow-accent/10 relative">
                                                <Gift size={44} className="text-accent animate-bounce" style={{ animationDuration: '2.5s' }} />
                                                <Sparkles size={20} className="absolute -top-1 -right-1 text-emerald-500 animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Título con Estilo */}
                                        <h2 className="text-3xl font-serif italic text-accent mb-1" style={{ fontFamily: 'Georgia, serif' }}>¡Un Regalo para Ti!</h2>
                                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-6">Promoción Exclusiva</p>

                                        {/* Oferta Box con Alegría */}
                                        <div className="w-full bg-gradient-to-br from-accent/10 to-transparent rounded-3xl border border-accent/20 p-6 mb-8 relative overflow-hidden group">
                                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/30 transition-all" />

                                            <p className="text-sm text-secondary font-medium mb-1 relative z-10">Te regalamos un</p>
                                            <p className="text-5xl font-black text-accent tracking-tighter mb-4 animate-pulse relative z-10">{settings.giftDiscount || 25}% <span className="text-xl">DTO.</span></p>
                                            <p className="text-[11px] text-secondary/60 leading-snug px-4 italic relative z-10">Válido en todos nuestros packs de sesiones <br />(no aplicable a campañas especiales)</p>

                                            <div className="mt-6 pt-6 border-t border-accent/10 flex flex-col items-center relative z-10">
                                                <p className="text-[10px] font-black text-accent/50 uppercase tracking-widest mb-2">La oferta termina en:</p>
                                                <p className="text-3xl font-black text-primary font-mono tracking-tighter">{formatTime(timeLeft)}</p>
                                            </div>
                                        </div>

                                        {/* Formulario con Iconos */}
                                        <div className="w-full space-y-3.5 mb-6">
                                            <div className="relative text-left">
                                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/50" />
                                                <input
                                                    type="text"
                                                    placeholder="Tu nombre completo"
                                                    value={giftForm.name}
                                                    onChange={e => setGiftForm({ ...giftForm, name: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '') })}
                                                    className={`w-full bg-primary/5 border rounded-2xl pl-12 pr-5 py-4 text-primary font-bold placeholder-primary/30 outline-none transition-all ${giftForm.name.length >= 3 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-primary/5 focus:border-accent'}`}
                                                />
                                            </div>

                                            <div className="relative text-left transition-all">
                                                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/50" />
                                                <input
                                                    type="tel"
                                                    maxLength="9"
                                                    placeholder="Tu teléfono móvil"
                                                    value={giftForm.phone}
                                                    onChange={e => setGiftForm({ ...giftForm, phone: e.target.value.replace(/\D/g, '') })}
                                                    className={`w-full bg-primary/5 border rounded-2xl pl-12 pr-5 py-4 text-primary font-bold placeholder-primary/30 outline-none transition-all ${/^[6789]\d{8}$/.test(giftForm.phone) ? 'border-emerald-500/30 bg-emerald-500/5' : giftForm.phone.length > 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-primary/5 focus:border-accent'}`}
                                                />
                                                {giftForm.phone.length > 0 && !/^[6789]\d{8}$/.test(giftForm.phone) && (
                                                    <div className="flex items-center gap-1 mt-2 ml-2 text-rose-500">
                                                        <AlertTriangle size={12} />
                                                        <p className="text-[10px] font-bold">Inicia por 6, 7, 8 o 9 (9 dígitos)</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative text-left">
                                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/50" />
                                                <input
                                                    type="email"
                                                    placeholder="Tu email principal"
                                                    value={giftForm.email}
                                                    onChange={e => setGiftForm({ ...giftForm, email: e.target.value.toLowerCase() })}
                                                    className={`w-full bg-primary/5 border rounded-2xl pl-12 pr-5 py-4 text-primary font-bold placeholder-primary/30 outline-none transition-all ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftForm.email) ? 'border-emerald-500/30 bg-emerald-500/5' : giftForm.email.length > 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-primary/5 focus:border-accent'}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Privacy */}
                                        <div
                                            className="flex gap-3 mb-8 cursor-pointer group text-left w-full mt-2"
                                            onClick={() => setGiftForm({ ...giftForm, privacy: !giftForm.privacy })}
                                            style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'flex-start' }}
                                        >
                                            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${giftForm.privacy ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-primary/20 bg-primary/5 group-hover:border-accent/50'}`}>
                                                {giftForm.privacy && <CheckSquare size={14} />}
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-black text-secondary/70 leading-snug tracking-widest uppercase pt-1 inline-block">
                                                Acepto el tratamiento de mis datos según la <a href="#" onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="text-accent underline group-hover:no-underline transition-all">política de privacidad</a>.
                                            </span>
                                        </div>

                                        {/* Error y Submit */}
                                        <div className="w-full relative flex flex-col items-center">
                                            {giftError && (
                                                <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold px-4 py-3 rounded-xl mb-4 flex items-start gap-2 animate-fade-in text-left">
                                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                                    <p>{giftError}</p>
                                                </div>
                                            )}
                                            {(() => {
                                                const nameValid = giftForm.name.length >= 3;
                                                const phoneValid = /^[6789]\d{8}$/.test(giftForm.phone);
                                                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftForm.email);
                                                const isFormValid = nameValid && phoneValid && emailValid && giftForm.privacy;

                                                return (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            setGiftError('');

                                                            if (!isFormValid) {
                                                                if (!nameValid) return setGiftError('Por favor, introduce un nombre válido (mínimo 3 letras).');
                                                                if (!phoneValid) return setGiftError('El teléfono debe tener 9 números y empezar por 6, 7, 8 o 9.');
                                                                if (!emailValid) return setGiftError('Por favor, introduce un email válido.');
                                                                if (!giftForm.privacy) return setGiftError('Debes aceptar la política de privacidad para recibir el regalo.');
                                                                return;
                                                            }

                                                            try {
                                                                await sendAdminNotification('REGALO', giftForm);
                                                                setGiftSuccess(true);
                                                                setGiftForm({ name: '', phone: '', email: '', privacy: false });
                                                                setGiftError('');
                                                            } catch (error) {
                                                                setGiftError('Hubo un error al enviar. Por favor, inténtalo de nuevo.');
                                                            }
                                                        }}
                                                        className="w-full h-[60px] text-white font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-2 group overflow-hidden relative cursor-pointer bg-gradient-to-r from-pink-500 to-orange-400 active:scale-[0.97] shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[800ms] skew-x-[-20deg]" />
                                                        <span className="relative z-10 uppercase tracking-widest text-shadow-sm">¡Sí, lo quiero! 🤗</span>
                                                        <Sparkles size={20} className="relative z-10 hidden group-hover:block animate-pulse" />
                                                    </button>
                                                );
                                            })()}
                                            <p className="text-[10px] text-secondary/40 font-bold mt-4 uppercase tracking-tighter">Proceso gratuito y sin compromiso</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
