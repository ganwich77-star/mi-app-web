import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import {
    GraduationCap, User, CreditCard, Plus, Minus, CheckCircle,
    Download, Settings, Search, DollarSign, Euro, BarChart3, Copy,
    MessageSquare, ChevronRight, Lock, Shield, Package, Sparkles, Gift, Mail, Phone,
    TrendingUp, Users, Trash2, Sun, Moon, ChevronDown, ToggleLeft, ToggleRight, Database, Upload, AlertTriangle, Share,
    Square, CheckSquare, X, Camera, Check, Tag, FileText, Crown, ArrowRight
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
import MasterPanel from './MasterPanel.jsx';
import Onboarding from './Onboarding.jsx';
import PricingCalculator from './components/PricingCalculator.jsx';
import PricingTiers from './components/PricingTiers.jsx';
import Landing from './Landing.jsx';

export default function App() {
    // 1. Detección de Modo Demo y Fotógrafo (Multitenancy)
    const [isDemo] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('demo') === 'true' || window.location.hostname.includes('demo');
    });

    const [photographerId] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const defaultId = isDemo ? 'demo_photographer' : 'pujaltecreativestudio';
        return params.get('f') || defaultId;
    });

    // Orbes decorativos de fondo con más color y dinamismo
    const BackgroundOrbs = () => (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[120px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/15 blur-[140px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full animate-float-slow" />
        </div>
    );

    const { settings, setSettings, paymentMethods, enabledPaymentMethods, schools, packs: allPacks, extras: allExtras, adminPin, togglePaymentMethod, addPaymentMethod, updateAdminPin, addSchool, deleteSchool, updateSettings } = useSettings(photographerId, isDemo);

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [view, setView] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view');
        if (v) return v;
        if (params.get('f')) return 'user';
        return 'landing'; // Landing por defecto para atraer fotógrafos
    });

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
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [pinError, setPinError] = useState(false);
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
    const [newMethodLabel, setNewMethodLabel] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilters, setExportFilters] = useState({ school: '', course: '', group: '' });
    // Shooting
    const [shootSearch, setShootSearch] = useState('');
    const [shootFilters, setShootFilters] = useState({ course: '', group: '' });
    const [ordersFilters, setOrdersFilters] = useState({ course: '', group: '' });
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
    const [showFlexPaymentModal, setShowFlexPaymentModal] = useState(false);
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [showPlanSuccessModal, setShowPlanSuccessModal] = useState(false);
    const [planTransitionData, setPlanTransitionData] = useState(null);

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

    // Listas ordenadas alfabéticamente
    const sortedSchools = useMemo(() =>
        [...schools].sort((a, b) => a.name.localeCompare(b.name)), [schools]);



    const [formData, setFormData] = useState({
        studentName: '',
        schoolId: '',
        course: '',
        paymentMethod: '',
        photoConsent: false,
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
    const [selectedPacks, setSelectedPacks] = useState({});
    const [extras, setExtras] = useState({});
    const [formError, setFormError] = useState('');

    const { orders, addOrder, updateStatus, deleteOrder, updatePhotoFile, updateOrder } = useOrders(photographerId, adminSchool);
    const { staff, addStaff, updateStaffPhoto, updateStaffMember, deleteStaff } = useStaff(photographerId, adminSchool);

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
            } else if (type === 'PLAN_REQUEST') {
                subject = `🚀 SOLICITUD DE PLAN: ${data.plan.toUpperCase()} - ${data.brandName}`;
                html = `
                    <div style="font-family: sans-serif; color: #333; padding: 30px; border: 1px solid #6366f1; border-radius: 30px;">
                        <h2 style="color: #6366f1; margin-top: 0;">🚀 Solicitud de Cambio de Plan</h2>
                        <p>Se ha recibido una nueva solicitud de actualización de plan en la plataforma.</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                            <p style="margin: 5px 0;"><strong>Fotógrafo:</strong> ${data.brandName}</p>
                            <p style="margin: 5px 0;"><strong>Nuevo Plan:</strong> <span style="color: #6366f1; font-weight: bold;">${data.plan.toUpperCase()}</span></p>
                            <p style="margin: 5px 0;"><strong>Condición:</strong> ${data.condition}</p>
                            <p style="margin: 5px 0;"><strong>Importe:</strong> ${data.amount}</p>
                            <p style="margin: 5px 0;"><strong>Email Contacto:</strong> ${data.email}</p>
                        </div>

                        <p style="font-size: 14px;"><strong>Próximos pasos:</strong> El fotógrafo ha recibido las instrucciones de transferencia. Una vez confirmada, procede a la activación manual desde Firebase o el Panel Maestro.</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="font-size: 10px; color: #999; text-align: center;">Orlas 2026 | Sistema de Notificaciones Automáticas</p>
                    </div>
                `;

                // Notificación extra para el Fotógrafo
                await addDoc(mailRef, {
                    to: data.email,
                    message: {
                        subject: `✅ Solicitud Recibida: Plan ${data.plan.toUpperCase()}`,
                        html: `
                            <div style="font-family: sans-serif; color: #333; padding: 30px; border: 1px solid #6366f1; border-radius: 30px; max-width: 600px; margin: 0 auto;">
                                <h1 style="color: #6366f1; text-align: center;">¡Hola ${data.brandName}!</h1>
                                <p style="text-align: center; font-size: 16px;">Hemos recibido tu solicitud para el <strong>Plan ${data.plan.toUpperCase()}</strong>.</p>
                                
                                <div style="background: #fdf2f2; border: 2px dashed #6366f1; padding: 20px; border-radius: 20px; margin: 30px 0; text-align: center;">
                                    <p style="margin: 0; font-[11px] font-weight: bold; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">Importe a abonar:</p>
                                    <p style="margin: 10px 0; font-size: 42px; font-weight: 900; color: #1e1b4b;">${data.amount}</p>
                                    <p style="margin: 10px 0 0 0; font-size: 12px;">Concepto: <strong>PAGO APP ORLAS - ${data.brandName.toUpperCase()}</strong></p>
                                </div>

                                <div style="background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0;">
                                    <p style="margin-top: 0; font-weight: bold; color: #1e1b4b;">Datos de transferencia:</p>
                                    <p style="margin: 5px 0; font-size: 14px;"><strong>Titular:</strong> JOSE PUJALTE MOLINA</p>
                                    <p style="margin: 5px 0; font-size: 14px;"><strong>IBAN:</strong> ES75 0081 1117 1100 0113 4919</p>
                                    <p style="margin: 5px 0; font-size: 14px;"><strong>Concepto:</strong> PAGO APP ORLAS - ${data.brandName.toUpperCase()}</p>
                                </div>

                                <p style="font-size: 14px; margin-top: 30px;">Una vez verifiquemos el pago, activaremos todas las funciones de tu nuevo plan de forma inmediata. ¡Gracias por confiar en nosotros!</p>
                                
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                                <p style="font-size: 10px; color: #999; text-align: center;">Orlas 2026 | Pujalte Creative Studio</p>
                            </div>
                        `
                    }
                });
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
        let price = 0;
        let cost = 0;
        Object.entries(selectedPacks).forEach(([id, qty]) => {
            const pack = allPacks.find(p => p.id === id);
            if (pack) {
                price += pack.price * qty;
                cost += pack.cost * qty;
            }
        });
        Object.entries(extras).forEach(([id, qty]) => {
            if (qty > 0) {
                const item = allExtras.find(e => e.id === id);
                if (item) { price += item.price * qty; cost += item.cost * qty; }
            }
        });
        return { price, cost, profit: price - cost };
    }, [selectedPacks, extras, allPacks, allExtras]);

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

    const togglePack = (packId) => {
        setSelectedPacks(prev => {
            const newPacks = { ...prev };
            if (newPacks[packId]) delete newPacks[packId];
            else newPacks[packId] = 1;
            return newPacks;
        });
    };

    const updatePackQuantity = (packId, qty) => {
        setSelectedPacks(prev => ({ ...prev, [packId]: Math.max(1, qty) }));
    };

    // Helpers comunes
    const getExtrasDesc = () =>
        Object.entries(extras)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => { const e = allExtras.find(x => x.id === id); return `${qty}x ${e.name}`; })
            .join(', ');

    const getPacksDesc = () =>
        Object.entries(selectedPacks)
            .map(([id, qty]) => {
                const p = allPacks.find(x => x.id === id);
                return `${qty > 1 ? `${qty}x ` : ''}${p?.name || id}`;
            })
            .join(' + ');

    const getSchoolName = (schoolId) => schools.find(s => s.id === schoolId)?.name || '';

    const handleFinalize = () => {
        const extrasDesc = getExtrasDesc();
        const packsDesc = getPacksDesc();
        const mainPackId = Object.keys(selectedPacks)[0];
        const mainPack = allPacks.find(p => p.id === mainPackId);

        const newOrder = {
            studentName: formData.studentName,
            schoolId: formData.schoolId,
            schoolName: getSchoolName(formData.schoolId),
            schoolCode: schools.find(s => s.id === formData.schoolId)?.code,
            course: formData.course,
            packs: Object.entries(selectedPacks).map(([id, qty]) => ({
                id,
                name: allPacks.find(p => p.id === id)?.name || id,
                quantity: qty
            })),
            pack: { id: mainPackId, label: packsDesc }, // Para compatibilidad
            packId: mainPackId,
            packQuantity: selectedPacks[mainPackId] || 1,
            extras: { ...extras },
            extrasDesc,
            paymentMethod: formData.paymentMethod,
            price: orderTotals.price,
            cost: orderTotals.cost,
            profit: orderTotals.profit,
        };
        addOrder(newOrder);
        setOrderCompleted(true);

        sendAdminNotification('PEDIDO', {
            studentName: formData.studentName,
            schoolName: getSchoolName(formData.schoolId),
            course: formData.course,
            packName: packsDesc,
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
            `📦 *Packs:* ${getPacksDesc()}\n` +
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

    const handlePlanChange = async (newPlanId) => {
        if (newPlanId === settings.plan) {
            setShowPlanSelector(false);
            return;
        }

        const oldPlan = settings.plan;
        // La activación es manual tras confirmar transferencia
        const isPaid = false;

        // Preparar detalles de la transición para el modal
        let details = {
            from: oldPlan,
            to: newPlanId,
            amount: 'Pendiente',
            condition: '',
            benefits: []
        };

        if (oldPlan === 'starter' && newPlanId === 'pro') {
            details.amount = '300 €';
            details.condition = 'Upgrade con pago de diferencia';
            details.benefits = [
                'Eliminación de límite de 100 alumnos',
                'Ahorro de 149€ ya invertidos en Starter',
                'Desbloqueo de descargas tras transfererencia'
            ];
        } else if (oldPlan === 'flex' && newPlanId === 'pro') {
            details.amount = '449 €';
            details.condition = 'Borrón y Cuenta Nueva';
            details.benefits = [
                'Cashback total de lo pagado en Flex',
                'Capacidad ilimitada total sin restricciones',
                'Control avanzado multi-colegio'
            ];
        } else if (newPlanId === 'flex') {
            details.amount = '2,50 € / niño';
            details.condition = 'Activación Pago por Uso';
            details.benefits = [
                'Sin cuotas fijas anuales',
                'Pagas solo cuando desees descargar',
                'Acceso a todas las herramientas Pro'
            ];
        } else if (newPlanId === 'starter') {
            details.amount = '149 €';
            details.condition = 'Plan Estándar fijo';
            details.benefits = [
                'Hasta 100 alumnos incluidos',
                'Soporte prioritario por email',
                'Ideal para flujo de trabajo ocasional'
            ];
        } else if (newPlanId === 'pro') {
            details.amount = '449 €';
            details.condition = 'Plan Ilimitado';
            details.benefits = [
                'Alumnos ilimitados',
                'Sin bloqueos de descarga',
                'Soporte técnico dedicado'
            ];
        }

        setPlanTransitionData(details);

        await updateSettings({
            plan: newPlanId,
            isPaid: isPaid
        });

        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const rootRef = doc(db, 'orlas2026_photographers', photographerId);
            await updateDoc(rootRef, {
                plan: newPlanId,
                isPaid: isPaid
            });
        } catch (e) { console.error(e); }

        setShowPlanSelector(false);
        setShowPlanSuccessModal(true);
    };

    const downloadMasterBackup = () => {
        if (settings?.plan === 'flex' && !settings?.isPaid) {
            setShowFlexPaymentModal(true);
            return;
        }
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
        if (settings?.plan === 'flex' && !settings?.isPaid) {
            setShowFlexPaymentModal(true);
            return;
        }
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
        setStep(1);
        setSelectedPacks({});
        setExtras({});
        setOrderCompleted(false);
        setCourseName('');
        setCourseLine('');
        setFormData({
            studentName: '',
            schoolId: schools[0]?.id || '',
            course: '',
            paymentMethod: enabledPaymentMethods[0]?.id || '',
            photoConsent: false
        });
        setShowLegalModal(false);
    };

    const handleAdminClick = () => {
        if (isAdminUnlocked) { setView('admin'); return; }
        setShowPinModal(true); setPinInput(''); setPinError(false);
    };

    const exportCSV = (filters) => {
        if (settings?.plan === 'flex' && !settings?.isPaid) {
            setShowFlexPaymentModal(true);
            return;
        }
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
                    Object.entries(o.extras || {}).filter(([, q]) => q > 0).map(([id]) => allExtras.find(e => e.id === id)?.name || id);

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

    const getCourseBase = (name = '') => {
        if (!name) return '';
        const parts = name.split(' ');
        const last = parts[parts.length - 1];
        return (last.length === 1 && last === last.toUpperCase() && isNaN(last)) ? parts.slice(0, -1).join(' ') : name;
    };

    const getGroup = (name = '') => {
        if (!name) return '';
        const parts = name.split(' ');
        const last = parts[parts.length - 1];
        return (last.length === 1 && last === last.toUpperCase() && isNaN(last)) ? last : '';
    };

    const filteredOrders = orders
        .filter(o => {
            const matchesSearch = !searchTerm ||
                o.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCourse = !ordersFilters.course || getCourseBase(o.course) === ordersFilters.course;
            const matchesGroup = !ordersFilters.group || getGroup(o.course) === ordersFilters.group;

            return matchesSearch && matchesCourse && matchesGroup;
        })
        .sort((a, b) => firstSurname(a.studentName).localeCompare(firstSurname(b.studentName), 'es', { sensitivity: 'base' }));

    // Helpers
    // Primera letra de cada palabra en mayúscula, resto en minúscula
    const toTitleCase = (str) => {
        if (!str) return '';
        // Limpiar espacios dobles y trim
        const cleanStr = str.trim().replace(/\s+/g, ' ');
        // Lista de partículas que deben ir en minúscula (opcional, pero profesional)
        const lowers = ['de', 'la', 'los', 'las', 'del', 'y'];

        return cleanStr.toLowerCase().split(' ').map((word, index) => {
            if (index > 0 && lowers.includes(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    return (
        <div className="min-h-screen transition-colors duration-500">
            {/* Orbes de fondo (incluidos en Landing para mantener la estética definida) */}
            {view !== 'master' && <BackgroundOrbs />}

            {/* CABECERA (Ocultar en Master/Onboarding/Suspended/Landing) */}
            {view !== 'master' && view !== 'onboarding' && view !== 'landing' && !settings.isSuspended && (
                <>
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
                </>
            )}

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

            {/* Banner de Modo Demo */}
            {isDemo && (
                <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-600 text-white py-1.5 px-4 text-center shadow-lg border-b border-white/20 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Versión de Demostración Activa</span>
                        <div className="h-4 w-px bg-white/30 hidden sm:block" />
                        <span className="text-[9px] font-medium opacity-90 hidden sm:block uppercase tracking-wider">Los datos introducidos no serán procesados de forma real</span>
                    </div>
                </div>
            )}

            {/* 5. Pantalla de Suspensión (Control Maestro) */}
            {settings.isSuspended ? (
                <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 z-[9999]">
                    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0 opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500 blur-[120px] rounded-full" />
                    </div>
                    <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500 relative z-10">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20 shadow-lg shadow-red-500/10">
                            <AlertTriangle size={48} className="text-red-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg">Servicio Suspendido</h1>
                            <p className="text-slate-400 font-bold leading-relaxed">
                                Esta cuenta ha sido desactivada temporalmente.<br />
                                Por favor, contacta con administración para regularizar tu situación.
                            </p>
                        </div>
                        <a href={`https://wa.me/34${CONTACT_PHONE}`} className="bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-600/20">
                            <MessageSquare size={18} /> Contactar con Gestión
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    {/* 5.5. Landing Page del Producto */}
                    {view === 'landing' && <Landing />}

                    {/* 6. Vista Maestra (Centro de Control) */}
                    {view === 'master' && <MasterPanel onBack={() => setView('user')} />}

                    {/* 7. Vista Onboarding (Registro) */}
                    {view === 'onboarding' && <Onboarding onComplete={() => setView('admin')} />}

                    {/* VISTA USUARIO */}
                    {view === 'user' && (
                        <div className="pb-safe min-h-[calc(100vh-120px)] animate-fade-in">
                            <div className="relative px-4 pt-8 pb-12 text-center">
                                <button
                                    onClick={handleAdminClick}
                                    className="w-36 flex items-center justify-center mx-auto mb-6 active:scale-95 transition-transform"
                                >
                                    {settings.logoUrl || settings.logoUrlDark ? (
                                        <img
                                            src={theme === 'dark' ? (settings.logoUrlDark || settings.logoUrl) : (settings.logoUrl || settings.logoUrlDark)}
                                            alt="Logo"
                                            className="w-full h-auto object-contain transition-all duration-500"
                                            style={{ filter: (isDemo && theme === 'light') ? 'brightness(0)' : 'none' }}
                                        />
                                    ) : (
                                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="w-full h-auto object-contain transition-all duration-500" style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }} />
                                    )}
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
                                            <div className="card p-8 space-y-6 animate-slide-up relative overflow-hidden">
                                                {/* Efectos de luz en la tarjeta */}
                                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-[40px] pointer-events-none" />
                                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-400/20 rounded-full blur-[40px] pointer-events-none" />

                                                <div className="flex items-center gap-4 mb-2 relative">
                                                    <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white">
                                                        <User size={22} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-black text-primary tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Datos del Alumno</h2>
                                                        <p className="text-[10px] font-black text-secondary tracking-widest uppercase mt-1 opacity-70">Paso 1 de 3</p>
                                                    </div>
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

                                            </div>
                                        )}

                                        {/* PASO 2 */}
                                        {step === 2 && (
                                            <div className="space-y-4 animate-slide-right">
                                                <div className="flex items-center gap-4 mb-2 relative px-2">
                                                    <button onClick={() => setStep(1)} className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white hover:scale-105 active:scale-95 transition-all">
                                                        <ChevronRight size={22} className="rotate-180" />
                                                    </button>
                                                    <div>
                                                        <h2 className="text-2xl font-black text-primary tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Selecciona tu Pack</h2>
                                                        <p className="text-[10px] font-black text-secondary tracking-widest uppercase mt-1 opacity-70">Paso 2 de 3</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {allPacks.map(pack => (
                                                        <PackCard
                                                            key={pack.id}
                                                            pack={pack}
                                                            selected={!!selectedPacks[pack.id]}
                                                            quantity={selectedPacks[pack.id] || 1}
                                                            onSelect={() => togglePack(pack.id)}
                                                            onUpdateQuantity={(q) => updatePackQuantity(pack.id, q)}
                                                        />
                                                    ))}
                                                    <button disabled={Object.keys(selectedPacks).length === 0} onClick={() => setStep(3)} className="btn-primary w-full text-base font-black flex items-center justify-center gap-2">
                                                        Continuar <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* PASO 3 */}
                                        {step === 3 && (
                                            <div className="space-y-5 animate-slide-right">
                                                <div className="flex items-center gap-4 mb-2 relative px-2">
                                                    <button onClick={() => setStep(2)} className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white hover:scale-105 active:scale-95 transition-all">
                                                        <ChevronRight size={22} className="rotate-180" />
                                                    </button>
                                                    <div>
                                                        <h2 className="text-2xl font-black text-primary tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Resumen de tu pedido</h2>
                                                        <p className="text-[10px] font-black text-secondary tracking-widest uppercase mt-1 opacity-70">Paso 3 de 3</p>
                                                    </div>
                                                </div>

                                                <div className="relative overflow-hidden rounded-[30px] p-8 text-center bg-accent/5 border-accent/20 shadow-2xl">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
                                                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-2 opacity-80">Total del pedido</p>
                                                    <p className="text-6xl font-black text-primary leading-none">{orderTotals.price.toFixed(0)}<span className="text-3xl text-accent ml-1">€</span></p>
                                                    <p className="text-[10px] text-secondary mt-3 font-black uppercase tracking-widest leading-relaxed">
                                                        {getPacksDesc()}
                                                    </p>
                                                </div>

                                                <div className="card p-6 space-y-4">
                                                    <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Package size={18} className="text-accent" /> Añadir extras opcionales</h3>
                                                    {allExtras.map(extra => <ExtraItem key={extra.id} extra={extra} qty={extras[extra.id] || 0} onToggle={(delta) => toggleExtra(extra.id, delta)} />)}

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
                                            <div className="pb-2">
                                                <p className="text-[10px] text-secondary font-black tracking-widest opacity-40 uppercase mb-1">Packs Seleccionados</p>
                                                <p className="text-sm font-black text-primary">{getPacksDesc()}</p>
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

                            {/* CALCULADORA ROI - SOLO MODO DEMO */}
                            {isDemo && <PricingCalculator />}

                            {/* MODAL LEGAL - POSICIÓN GLOBAL */}
                            {showLegalModal && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in overflow-y-auto">
                                    <div className="w-full max-w-md bg-champagne border border-white/50 rounded-[45px] p-9 shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-slide-up space-y-8 relative my-auto">
                                        {/* Decoración de luz premium superior */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full blur-sm"></div>

                                        <div className="text-center space-y-3 relative">
                                            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mx-auto border border-primary/5 text-indigo-600 mb-2 shadow-xl shadow-indigo-500/10">
                                                <Shield size={32} />
                                            </div>
                                            <h3 className="text-2xl font-black text-primary tracking-tight">Términos del Servicio</h3>
                                            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] opacity-40">Seguridad y Privacidad Garantizada</p>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Item 1 */}
                                            <div className="flex gap-5 p-5 rounded-[28px] bg-white border border-primary/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-500">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 shadow-inner">
                                                    <User size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[13px] font-black text-primary leading-tight">Responsabilidad de Datos</p>
                                                    <p className="text-[11px] text-secondary leading-relaxed font-medium">Asumes la total exactitud de los datos. Errores de impresión por datos incorrectos serán costeados por el solicitante.</p>
                                                </div>
                                            </div>

                                            {/* Item 2 */}
                                            <div className="flex gap-5 p-5 rounded-[28px] bg-white border border-primary/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-500">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
                                                    <Shield size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[13px] font-black text-primary leading-tight">Protección de Privacidad</p>
                                                    <p className="text-[11px] text-secondary leading-relaxed font-medium">Tus datos se tratarán exclusivamente para la gestión de este pedido por Pujalte Creative Studio.</p>
                                                </div>
                                            </div>

                                            {/* Consent Block Premium */}
                                            <div
                                                onClick={() => setFormData(prev => ({ ...prev, photoConsent: !prev.photoConsent }))}
                                                className={`flex gap-5 p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer group active:scale-[0.97] 
                                                    ${formData.photoConsent
                                                        ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/30'
                                                        : 'bg-white border-amber-500/20 animate-soft-pulse hover:border-amber-400 shadow-lg shadow-amber-500/5'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 shadow-md ${formData.photoConsent ? 'bg-white text-indigo-600 border-white' : 'bg-amber-50/20 text-amber-500 border-amber-100 group-hover:scale-110'}`}>
                                                    {formData.photoConsent ? <Check size={22} strokeWidth={3} /> : <Camera size={20} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-sm font-black transition-colors ${formData.photoConsent ? 'text-white' : 'text-primary'}`}>Autorización de Fotografía</p>
                                                        {!formData.photoConsent && <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></span>}
                                                    </div>
                                                    <p className={`text-[11px] leading-relaxed transition-colors ${formData.photoConsent ? 'text-white/80' : 'text-secondary font-bold'}`}>Autorizo la toma y procesamiento de fotos de mi hijo/a menor para la orla escolar.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 pt-4">
                                            <button
                                                disabled={!formData.photoConsent}
                                                onClick={() => { setShowLegalModal(false); setStep(2); }}
                                                className={`w-full py-6 text-base font-black rounded-3xl transition-all duration-500 shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${formData.photoConsent ? 'bg-emerald-600 text-white shadow-emerald-500/40 hover:-translate-y-1 hover:bg-emerald-500' : 'bg-primary/5 text-primary/20 cursor-not-allowed'}`}
                                            >
                                                {formData.photoConsent ? 'ACEPTAR Y CONTINUAR' : 'FIRMA PARA CONTINUAR'}
                                                <ChevronRight size={20} />
                                            </button>
                                            <button onClick={() => setShowLegalModal(false)} className="text-[10px] font-black text-secondary/30 hover:text-primary transition-all py-2 uppercase tracking-[0.25em]">Cerrar y volver</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                    }

                    {/* VISTA ADMIN */}
                    {
                        view === 'admin' && (
                            <div className="pt-0 pb-8 min-h-screen animate-fade-in">
                                <div className="max-w-5xl mx-auto px-4">
                                    {/* Logo y Título integrados */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 mb-8 mt-2">
                                        {settings.logoUrl || settings.logoUrlDark ? (
                                            <img
                                                src={theme === 'dark' ? (settings.logoUrlDark || settings.logoUrl) : (settings.logoUrl || settings.logoUrlDark)}
                                                alt={photographerId}
                                                className="h-14 w-auto object-contain transition-all duration-500"
                                                style={{ filter: (isDemo && theme === 'light') ? 'brightness(0)' : 'none' }}
                                            />
                                        ) : (
                                            <img
                                                src={`${import.meta.env.BASE_URL}logo.png`}
                                                alt="Pujalte Creative Studio"
                                                className="h-14 w-auto transition-all duration-500"
                                                style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }}
                                            />
                                        )}
                                        <div className="flex flex-col text-primary sm:border-l sm:border-primary/10 sm:pl-6 leading-none">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield size={14} className="text-amber-500" />
                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Panel Admin</span>
                                                <div className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-600 uppercase tracking-tighter ml-1">
                                                    {photographerId}
                                                </div>
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Control de Campaña</h2>
                                        </div>

                                        <div className="flex-1 flex justify-end">
                                            <button
                                                onClick={toggleTheme}
                                                className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition-all active:scale-95 border border-primary/10"
                                            >
                                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                        <div className="flex gap-1.5 bg-primary/5 p-1.5 rounded-2xl border border-primary/10 backdrop-blur-md">
                                            <button onClick={() => { setAdminTab('shooting'); setShootSearch(''); }} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'shooting' ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}>📸 Shooting</button>
                                            <button onClick={() => setAdminTab('schools')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'schools' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><GraduationCap size={14} className="inline mr-2" /> Centros</button>
                                            <button onClick={() => setAdminTab('settings')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'settings' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Settings size={14} className="inline mr-2" /> Ajustes App</button>
                                            <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'orders' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Users size={14} className="inline mr-2" /> Gestión Pedidos</button>
                                            <button onClick={() => setAdminTab('precios')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${adminTab === 'precios' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Euro size={14} className="inline mr-2" /> Precios</button>
                                        </div>
                                    </div>

                                    {/* Bloque: Mi Plan Master (Siempre Visible) */}
                                    <div className="card p-6 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20 mb-8 border-2">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg ${settings.plan === 'starter' ? 'bg-amber-400/10 border-amber-500/30 text-amber-500' :
                                                    settings.plan === 'pro' ? 'bg-blue-400/10 border-blue-500/30 text-blue-500' :
                                                        settings.plan === 'flex' ? 'bg-emerald-400/10 border-emerald-500/30 text-emerald-500' :
                                                            'bg-purple-400/10 border-purple-500/30 text-purple-500'
                                                    }`}>
                                                    <Crown size={28} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-primary uppercase tracking-tighter leading-none">Mi Plan: <span className="text-indigo-500">{settings.plan?.toUpperCase() || 'STARTER'}</span></h3>
                                                        {settings.isPaid ? (
                                                            <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest">Activo</span>
                                                        ) : (
                                                            <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-md border border-amber-500/20 uppercase tracking-widest leading-none">Esperando Pago</span>
                                                        )}
                                                    </div>
                                                    <p className="text-secondary text-[10px] font-bold uppercase tracking-wider mt-2 opacity-60 leading-tight">
                                                        {settings.plan === 'starter' ? 'Ideal para pequeños eventos de hasta 100 alumnos.' :
                                                            settings.plan === 'flex' ? 'Pago por uso sin cuotas fijas anuales.' :
                                                                settings.plan === 'pro' ? 'Control total e ilimitado para grandes volúmenes.' :
                                                                    'Solución a medida para flujo de trabajo especial.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowPlanSelector(true)}
                                                className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0"
                                            >
                                                Cambiar Plan <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── VISTA SHOOTING ─────────────────────────────────────── */}
                                    {adminTab === 'shooting' && (() => {
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
                                                            onChange={e => setNewStaffForm(p => ({ ...p, name: e.target.value }))}
                                                            onBlur={e => setNewStaffForm(p => ({ ...p, name: toTitleCase(e.target.value) }))}
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
                                                                        className="flex-1 bg-red-700 text-white font-black text-[10px] rounded-xl px-4 py-3 hover:bg-red-800 transition-all active:scale-95 disabled:opacity-30 shadow-sm shadow-red-700/20 whitespace-nowrap">GUARDAR FICHA</button>
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
                                                            <input type="text" value={staffAssigning.name}
                                                                onChange={e => setStaffAssigning(p => ({ ...p, name: e.target.value }))}
                                                                onBlur={e => setStaffAssigning(p => ({ ...p, name: toTitleCase(e.target.value) }))}
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

                                    {shootAssigning && (
                                        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                                            <div className="w-full max-w-sm bg-card rounded-3xl p-7 border border-primary/10 shadow-2xl animate-scale-in">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-12 h-12 bg-red-700/10 rounded-2xl flex items-center justify-center text-2xl border border-red-700/20">📷</div>
                                                    <div>
                                                        <p className="text-lg font-black text-primary leading-tight">{shootAssigning.order.studentName}</p>
                                                        <p className="text-xs text-secondary uppercase tracking-widest font-bold">{shootAssigning.order.course}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
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
                                                            className="w-full bg-primary/5 border border-primary/10 text-primary font-mono text-base rounded-2xl px-4 py-3.5 outline-none focus:border-red-700/50"
                                                        />
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        <button onClick={() => setShootAssigning(null)} className="flex-1 py-3 text-sm font-bold text-secondary border border-primary/10 rounded-2xl hover:bg-primary/5 transition-all">Cancelar</button>
                                                        <button
                                                            disabled={!shootAssigning.tempFile.trim()}
                                                            onClick={() => {
                                                                updatePhotoFile(shootAssigning.order.id, shootAssigning.tempFile.trim());
                                                                setShootAssigning(null);
                                                            }}
                                                            className="flex-[1.5] py-3 text-sm font-black bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-red-700/20"
                                                        >
                                                            ASIGNAR
                                                        </button>
                                                    </div>

                                                    {shootAssigning.order.photoFile && (
                                                        <button
                                                            onClick={() => { updatePhotoFile(shootAssigning.order.id, ''); setShootAssigning(null); }}
                                                            className="w-full py-2 text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors"
                                                        >
                                                            Borrar asignación actual
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── GESTIÓN DE PEDIDOS ──────────────────────────────── */}
                                    {
                                        adminTab === 'orders' && (
                                            <div className="space-y-8">
                                                {/* 1. BLOQUE DE ALUMNOS (PRIMERO) */}
                                                <div className="card overflow-hidden">
                                                    <div className="p-4 border-b border-primary/5">
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                            {/* Buscador: 4 columnas */}
                                                            <div className="md:col-span-4 relative">
                                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                                                                <input className="w-full bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-primary placeholder-primary/30 outline-none focus:border-indigo-500/30 transition-all font-medium" placeholder="Buscar alumno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                                            </div>

                                                            {/* Centro: 3 columnas */}
                                                            <div className="md:col-span-3">
                                                                <select value={adminSchool} onChange={e => setAdminSchool(e.target.value)} className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-2xl px-4 py-3 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat">
                                                                    {schools.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                                                                </select>
                                                            </div>

                                                            {/* Curso: 3 columnas */}
                                                            <div className="md:col-span-3">
                                                                <select value={ordersFilters.course} onChange={e => setOrdersFilters(p => ({ ...p, course: e.target.value, group: '' }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-2xl px-4 py-3 cursor-pointer outline-none hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat">
                                                                    <option value="" className="text-slate-900">— Cursos ativos —</option>
                                                                    {[...new Set(orders.map(o => getCourseBase(o.course)))].filter(Boolean).sort().map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                                                                </select>
                                                            </div>

                                                            {/* Grupo: 2 columnas */}
                                                            <div className="md:col-span-2">
                                                                <select value={ordersFilters.group} onChange={e => setOrdersFilters(p => ({ ...p, group: e.target.value }))} className="w-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-2xl px-4 py-3 cursor-pointer outline-none uppercase hover:bg-primary/10 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat">
                                                                    <option value="" className="text-slate-900">Grupo</option>
                                                                    {(ordersFilters.course
                                                                        ? [...new Set(orders.filter(o => getCourseBase(o.course) === ordersFilters.course).map(o => getGroup(o.course)))].filter(Boolean).sort()
                                                                        : [...new Set(orders.map(o => getGroup(o.course)))].filter(Boolean).sort()
                                                                    ).map(g => <option key={g} value={g} className="text-slate-900">{g}</option>)}
                                                                </select>
                                                            </div>
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

                                                {/* 2. MÉTRICAS Y GRÁFICAS (MÁS COMPACTAS AL FINAL) */}
                                                <div className="pt-8 border-t border-primary/10">
                                                    <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                        <TrendingUp size={16} /> Resumen de Métricas
                                                    </h3>

                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                                        <StatCard icon={<Users size={14} />} label="Pedidos Totales" value={stats.count} color="indigo" />
                                                        <StatCard icon={<DollarSign size={14} />} label="Ingresos Brutos" value={`${stats.revenue.toFixed(0)}€`} color="blue" />
                                                        <StatCard icon={<Package size={14} />} label="Entregas Pendientes" value={stats.pending} color="amber" />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Donut mini */}
                                                        <div className="card p-5 flex flex-col items-center justify-center min-h-[140px]">
                                                            <h3 className="text-[9px] font-black text-secondary uppercase tracking-widest mb-4 opacity-50">Ventas Pack</h3>
                                                            <div className="flex items-center gap-6">
                                                                <div className="relative w-20 h-20">
                                                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                                        {(() => {
                                                                            const packStats = orders.reduce((acc, o) => {
                                                                                const id = o.packId || 'esencial';
                                                                                acc[id] = (acc[id] || 0) + 1;
                                                                                return acc;
                                                                            }, {});
                                                                            const totalPacks = Object.values(packStats).reduce((a, b) => a + b, 0);
                                                                            let currentOffset = 0;
                                                                            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
                                                                            return Object.entries(packStats).map(([id, count], i) => {
                                                                                const percentage = (count / totalPacks) * 100;
                                                                                const dashArray = `${percentage} ${100 - percentage}`;
                                                                                const offset = -currentOffset;
                                                                                currentOffset += percentage;
                                                                                return <circle key={id} cx="50" cy="50" r="40" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="15" strokeDasharray={dashArray} strokeDashoffset={offset} />;
                                                                            });
                                                                        })()}
                                                                        <circle cx="50" cy="50" r="28" className="fill-card" />
                                                                    </svg>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {(() => {
                                                                        const packStats = orders.reduce((acc, o) => {
                                                                            const id = o.packId || 'esencial';
                                                                            acc[id] = (acc[id] || 0) + 1;
                                                                            return acc;
                                                                        }, {});
                                                                        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
                                                                        return Object.entries(packStats).slice(0, 3).map(([id, count], i) => (
                                                                            <div key={id} className="flex items-center gap-1.5 leading-none">
                                                                                <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                                                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter truncate w-16 opacity-60">{id}</span>
                                                                            </div>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Barras mini */}
                                                        <div className="card p-5 flex flex-col col-span-1 md:col-span-2 min-h-[140px]">
                                                            <h3 className="text-[9px] font-black text-secondary uppercase tracking-widest mb-4 opacity-50">Distribución por Nivel</h3>
                                                            <div className="flex-1 flex items-end gap-2 h-16">
                                                                {(() => {
                                                                    const courseStats = orders.reduce((acc, o) => {
                                                                        const level = o.course?.split(' ')[0] || 'S/D';
                                                                        acc[level] = (acc[level] || 0) + 1;
                                                                        return acc;
                                                                    }, {});
                                                                    const max = Math.max(...Object.values(courseStats), 1);
                                                                    return Object.entries(courseStats).slice(0, 10).map(([level, count]) => (
                                                                        <div key={level} className="flex-1 flex flex-col items-center gap-1.5 group">
                                                                            <div className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-md transition-all h-full flex items-end">
                                                                                <div className="w-full bg-indigo-500/40 rounded-t-md" style={{ height: `${(count / max) * 100}%` }} />
                                                                            </div>
                                                                            <span className="text-[7px] font-black text-secondary opacity-40 uppercase truncate w-full text-center tracking-tighter">{level}</span>
                                                                        </div>
                                                                    ));
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Métrica Ticket Medio */}
                                                        <div className="card p-5 lg:col-span-3 min-h-[100px] flex items-center justify-between bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl border border-indigo-500/20 shadow-inner">🎫</div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">Ticket Medio de Venta</p>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <p className="text-3xl font-black text-primary leading-none tracking-tighter">
                                                                            {stats.count > 0 ? (stats.revenue / stats.count).toFixed(2) : '0.00'}€
                                                                        </p>
                                                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Ratio Óptimo</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="hidden lg:block text-right">
                                                                <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40 mb-1">Cálculo en tiempo real</p>
                                                                <p className="text-[10px] font-bold text-primary/60 italic">Ingresos brutos ÷ nº alumnos</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                                            <input type="text" value={orderToEdit.studentName}
                                                                onChange={e => setOrderToEdit(p => ({ ...p, studentName: e.target.value }))}
                                                                onBlur={e => setOrderToEdit(p => ({ ...p, studentName: toTitleCase(e.target.value) }))}
                                                                className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-400/50" />
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
                                                                const selectedPackObj = allPacks.find(pk => pk.id === orderToEdit.packId);
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

                                    {/* ── SECCIÓN CENTROS EDUCATIVOS ───────────────────────── */}
                                    {
                                        adminTab === 'schools' && (
                                            <div className="space-y-6 pb-20">
                                                <div className="card p-8">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                                                        <h3 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tight">
                                                            <GraduationCap size={28} className="text-orange-500" /> Gestión de Centros
                                                        </h3>
                                                        <div className="flex gap-3 w-full sm:w-96 relative group">
                                                            <input
                                                                id="new-school-input-final"
                                                                list="predefined-schools-list"
                                                                className="input-dark flex-1 py-4 text-sm px-6 hover:border-orange-500/30 transition-all"
                                                                placeholder="Escribe o elige un centro..."
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                                                        addSchool(e.target.value.trim());
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                            <datalist id="predefined-schools-list">
                                                                {sortedSchools.map(s => (
                                                                    <option key={s.id} value={s.name}>{s.code}</option>
                                                                ))}
                                                            </datalist>
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.getElementById('new-school-input-final');
                                                                    if (input.value.trim()) {
                                                                        addSchool(input.value.trim());
                                                                        input.value = '';
                                                                    }
                                                                }}
                                                                className="w-14 h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 active:scale-95 transition-all shrink-0"
                                                            >
                                                                <Plus size={24} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                        {sortedSchools.map(s => (
                                                            <div key={s.id} className={`flex justify-between items-center p-5 rounded-[24px] border transition-all ${adminSchool === s.id ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-primary/5 border-primary/5 hover:border-primary/20'}`}>
                                                                <button onClick={() => setAdminSchool(s.id)} className="flex-1 text-left">
                                                                    <span className={`text-sm font-black uppercase tracking-wider ${adminSchool === s.id ? 'text-orange-400' : 'text-primary'}`}>{s.name}</span>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Código: {s.code}</p>
                                                                        {adminSchool === s.id && <span className="text-[8px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md">ACTUAL</span>}
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

                                    {/* ── AJUSTES DE LA APP ────────────────────────────────── */}
                                    {
                                        adminTab === 'settings' && (
                                            <div className="space-y-6 pb-20">

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {/* Bloque 1: Pagos y Seguridad */}
                                                    <div className="card p-6 flex flex-col h-full">
                                                        <div className="flex flex-col h-full">
                                                            <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><CreditCard size={18} className="text-accent" /> Pagos y Seguridad</h3>

                                                            <div className="grid grid-cols-1 gap-3 mb-4">
                                                                {paymentMethods.filter(m => m.id !== 'transferencia').map(method => {
                                                                    return (
                                                                        <div key={method.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${method.enabled ? 'bg-indigo-500/5 border-indigo-500/20 shadow-sm' : 'bg-primary/2 border-primary/5 opacity-60'}`}>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${method.enabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-primary/5 text-secondary'}`}>
                                                                                    {method.icon}
                                                                                </div>
                                                                                <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${method.enabled ? 'text-primary' : 'text-secondary'}`}>{method.label}</span>
                                                                            </div>
                                                                            <button onClick={() => togglePaymentMethod(method.id)} className={`w-10 h-6 rounded-full relative transition-all duration-300 ${method.enabled ? 'bg-indigo-500' : 'bg-primary/20'}`}>
                                                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${method.enabled ? 'right-1' : 'left-1'}`} />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="mt-auto pt-6 space-y-4 h-[220px] flex flex-col justify-center">
                                                                <div>
                                                                    <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-3">
                                                                        <Shield size={18} className="text-accent" /> Cambiar PIN de Acceso
                                                                    </h3>
                                                                    <input type="text" maxLength={4} className="input-dark w-full py-4 text-sm tracking-[1em] font-black text-center rounded-2xl" placeholder="XXXX" onChange={e => {
                                                                        const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                                        if (val.length === 4) { updateAdminPin(val); alert('✅ PIN actualizado'); e.target.value = ''; }
                                                                    }} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-3">
                                                                        <Gift size={18} className="text-pink-500" /> % Regalo Comercial
                                                                    </h3>
                                                                    <div className="relative">
                                                                        <input type="number" min="0" max="100" defaultValue={settings?.giftDiscount || 25} className="input-dark w-full py-4 text-sm font-black text-center rounded-2xl pr-10" placeholder="25" onChange={e => {
                                                                            const val = parseInt(e.target.value);
                                                                            if (!isNaN(val) && val >= 0 && val <= 100) {
                                                                                updateSettings({ giftDiscount: val });
                                                                            }
                                                                        }} />
                                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary font-black text-sm">%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bloque 2: Identidad y Logo Inteligente */}
                                                    <div className="card p-6 flex flex-col h-full">
                                                        <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><Sparkles size={18} className="text-indigo-500" /> Identidad y Logo Inteligente</h3>
                                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                                            {/* Logo Versión Luz */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-70">Logo para Modo Claro</label>
                                                                <div className="relative group">
                                                                    <input
                                                                        type="file" accept="image/png" id="logo-light-upload" className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onload = (ev) => {
                                                                                    const img = new Image();
                                                                                    img.src = ev.target.result;
                                                                                    img.onload = () => {
                                                                                        const canvas = document.createElement('canvas');
                                                                                        const scale = Math.min(1, 800 / img.width);
                                                                                        canvas.width = img.width * scale;
                                                                                        canvas.height = img.height * scale;
                                                                                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                                                                        updateSettings({ logoUrl: canvas.toDataURL('image/png', 0.8) });
                                                                                    };
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label htmlFor="logo-light-upload" className="w-full h-24 bg-white border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all overflow-hidden p-3">
                                                                        {settings.logoUrl ? (
                                                                            <img src={settings.logoUrl} alt="Light" className="w-full h-full object-contain" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center opacity-40">
                                                                                <Sun size={16} />
                                                                                <span className="text-[8px] font-black mt-1">LIGERO</span>
                                                                            </div>
                                                                        )}
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Logo Versión Noche */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-70">Logo para Modo Oscuro</label>
                                                                <div className="relative group">
                                                                    <input
                                                                        type="file" accept="image/png" id="logo-dark-upload" className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onload = (ev) => {
                                                                                    const img = new Image();
                                                                                    img.src = ev.target.result;
                                                                                    img.onload = () => {
                                                                                        const canvas = document.createElement('canvas');
                                                                                        const scale = Math.min(1, 800 / img.width);
                                                                                        canvas.width = img.width * scale;
                                                                                        canvas.height = img.height * scale;
                                                                                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                                                                        updateSettings({ logoUrlDark: canvas.toDataURL('image/png', 0.8) });
                                                                                    };
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label htmlFor="logo-dark-upload" className="w-full h-24 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden p-3">
                                                                        {settings.logoUrlDark ? (
                                                                            <img src={settings.logoUrlDark} alt="Dark" className="w-full h-full object-contain" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center text-white opacity-40">
                                                                                <Moon size={16} />
                                                                                <span className="text-[8px] font-black mt-1">OSCURO</span>
                                                                            </div>
                                                                        )}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex flex-col flex-1 justify-center">
                                                                <div className="flex flex-row items-center gap-2 mb-2">
                                                                    <Tag size={16} className="text-violet-500 shrink-0" />
                                                                    <span className="text-sm font-black text-primary leading-none">Nombre de tu Marca</span>
                                                                </div>
                                                                <input
                                                                    type="text" value={settings.brandName || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ brandName: e.target.value })}
                                                                    className="input-dark w-full py-3 text-sm font-black px-4 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col flex-1 justify-center">
                                                                <div className="flex flex-row items-center gap-2 mb-2">
                                                                    <Mail size={16} className="text-indigo-400 shrink-0" />
                                                                    <span className="text-sm font-black text-primary leading-none">Email Avisos</span>
                                                                </div>
                                                                <input
                                                                    type="email" value={settings.notificationEmail || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ notificationEmail: e.target.value })}
                                                                    className="input-dark w-full py-3 text-sm font-black px-4 rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bloque 3: Gestión de Datos */}
                                                    <div className="card p-6 flex flex-col h-full">
                                                        <div className="flex flex-col h-full">
                                                            <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><Database size={18} className="text-indigo-500" /> Gestión de Datos</h3>

                                                            <div className="grid grid-cols-1 gap-3 mb-4">
                                                                <div className="space-y-2 text-center flex flex-col items-center">
                                                                    <button onClick={downloadMasterBackup} className="w-full py-4 bg-primary/5 border border-primary/10 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
                                                                        <Download size={14} /> Descargar Copia JSON
                                                                    </button>
                                                                    <p className="text-[9px] text-secondary/60 font-medium px-4 text-center leading-tight">Guarda una copia de seguridad con todos tus pedidos y configuraciones actuales.</p>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <button onClick={() => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'file'; input.id = 'restore-input'; input.accept = '.json';
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
                                                                    }} className="w-full py-4 bg-primary/5 border border-primary/10 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
                                                                        <Upload size={14} /> Restaurar Copia JSON
                                                                    </button>
                                                                    <p className="text-[9px] text-secondary/60 font-medium px-4 text-center leading-tight">Recupera tus datos desde un archivo backup guardado previamente en tu equipo.</p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-auto pt-6 h-[220px] flex flex-col justify-center">
                                                                <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6">
                                                                    <Download size={18} className="text-indigo-500" /> Listado para Excel
                                                                </h3>
                                                                <div className="space-y-4">
                                                                    <button onClick={() => {
                                                                        const selectedSchoolObj = schools.find(s => s.id === adminSchool);
                                                                        if (!selectedSchoolObj) return alert('Selecciona un centro primero');
                                                                        exportCSV({ school: adminSchool });
                                                                    }} className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                                                        <span>EXCEL MAESTRO</span>
                                                                        <span className="text-[10px] opacity-70">{schools.find(s => s.id === adminSchool)?.name.replace('Maestro ', '').replace('MAESTRO ', '')}</span>
                                                                    </button>
                                                                    <p className="text-[9px] text-secondary font-black opacity-40 uppercase tracking-widest text-center italic">Tabla de alumnos compatible con Excel/Drive</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bloque 4: Datos de Facturación */}
                                                    <div className="card p-6 col-span-1 md:col-span-2 lg:col-span-3">
                                                        <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><FileText size={18} className="text-indigo-500" /> Datos de Facturación</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            <div>
                                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">Nombre Fiscal / Razón Social</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.fiscalName || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, fiscalName: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ fiscalName: e.target.value })}
                                                                    className="input-dark w-full py-4 text-sm font-black px-6 rounded-2xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">CIF / NIF</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.cif || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, cif: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ cif: e.target.value })}
                                                                    className="input-dark w-full py-4 text-sm font-black px-6 rounded-2xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">Dirección</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.address || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ address: e.target.value })}
                                                                    className="input-dark w-full py-4 text-sm font-black px-6 rounded-2xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">Código Postal</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.postalCode || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, postalCode: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ postalCode: e.target.value })}
                                                                    className="input-dark w-full py-4 text-sm font-black px-6 rounded-2xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">Ciudad</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.city || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ city: e.target.value })}
                                                                    className="input-dark w-full py-4 text-sm font-black px-6 rounded-2xl"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 block">Provincia</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.province || ''}
                                                                    onChange={(e) => setSettings(prev => ({ ...prev, province: e.target.value }))}
                                                                    onBlur={(e) => updateSettings({ province: e.target.value })}
                                                                    className="input-dark w-full py-4 text-sm font-black px-6 rounded-2xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        )
                                    }

                                    {/* ── SECCIÓN PRECIOS ────────────────────────────────── */}
                                    {
                                        adminTab === 'precios' && (
                                            <div className="space-y-8 animate-fade-in pb-20">
                                                {/* GESTIÓN DE PACKS */}
                                                <div className="card p-6">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h3 className="text-xl font-black text-primary flex items-center gap-3">
                                                            <Package size={24} className="text-amber-500" /> Gestión de Packs
                                                        </h3>
                                                        <button
                                                            onClick={() => {
                                                                const newPack = {
                                                                    id: `pack_${Date.now()}`,
                                                                    name: 'Nuevo Pack',
                                                                    subtitle: 'Descripción breve',
                                                                    items: ['Item 1', 'Item 2'],
                                                                    price: 20,
                                                                    cost: 5,
                                                                    popular: false
                                                                };
                                                                updateSettings({ packs: [...allPacks, newPack] });
                                                            }}
                                                            className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2"
                                                        >
                                                            <Plus size={14} /> Nuevo Pack
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {allPacks.map((pack, idx) => (
                                                            <div key={pack.id} className="relative group bg-primary/3 rounded-3xl p-6 border border-primary/10 hover:border-amber-500/30 transition-all">
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('¿Borrar este pack?')) {
                                                                            updateSettings({ packs: allPacks.filter(p => p.id !== pack.id) });
                                                                        }
                                                                    }}
                                                                    className="absolute top-4 right-4 p-2 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>

                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Nombre del Pack</label>
                                                                        <input
                                                                            type="text"
                                                                            value={pack.name}
                                                                            onChange={e => {
                                                                                const newPacks = [...allPacks];
                                                                                newPacks[idx].name = e.target.value;
                                                                                updateSettings({ packs: newPacks });
                                                                            }}
                                                                            className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 text-sm font-black text-primary outline-none focus:border-amber-500/50"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Subtítulo</label>
                                                                        <input
                                                                            type="text"
                                                                            value={pack.subtitle}
                                                                            onChange={e => {
                                                                                const newPacks = [...allPacks];
                                                                                newPacks[idx].subtitle = e.target.value;
                                                                                updateSettings({ packs: newPacks });
                                                                            }}
                                                                            className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 text-xs font-bold text-secondary outline-none focus:border-amber-500/50"
                                                                        />
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Precio Venta</label>
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="number"
                                                                                    value={pack.price}
                                                                                    onChange={e => {
                                                                                        const newPacks = [...allPacks];
                                                                                        newPacks[idx].price = parseFloat(e.target.value) || 0;
                                                                                        updateSettings({ packs: newPacks });
                                                                                    }}
                                                                                    className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-4 pr-8 py-2.5 text-sm font-black text-emerald-500 outline-none"
                                                                                />
                                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">€</span>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1.5 block">Coste (Base)</label>
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="number"
                                                                                    value={pack.cost}
                                                                                    onChange={e => {
                                                                                        const newPacks = [...allPacks];
                                                                                        newPacks[idx].cost = parseFloat(e.target.value) || 0;
                                                                                        updateSettings({ packs: newPacks });
                                                                                    }}
                                                                                    className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-4 pr-8 py-2.5 text-sm font-black text-red-500 outline-none"
                                                                                />
                                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">€</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => {
                                                                            const newPacks = [...allPacks];
                                                                            newPacks.forEach((p, i) => p.popular = i === idx);
                                                                            updateSettings({ packs: newPacks });
                                                                        }}
                                                                        className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${pack.popular ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' : 'bg-primary/5 text-secondary border-primary/10 hover:border-amber-500/30'}`}
                                                                    >
                                                                        {pack.popular ? '🌟 Pack Destacado' : 'Marcar como popular'}
                                                                    </button>

                                                                    <div className="pt-2">
                                                                        <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-2 opacity-50">Contenido del Pack</p>
                                                                        <div className="space-y-1.5">
                                                                            {(pack.items || []).map((item, iIdx) => (
                                                                                <div key={iIdx} className="flex gap-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={item}
                                                                                        onChange={e => {
                                                                                            const newPacks = [...allPacks];
                                                                                            newPacks[idx].items[iIdx] = e.target.value;
                                                                                            updateSettings({ packs: newPacks });
                                                                                        }}
                                                                                        className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-primary outline-none"
                                                                                    />
                                                                                    <button onClick={() => {
                                                                                        const newPacks = [...allPacks];
                                                                                        newPacks[idx].items.splice(iIdx, 1);
                                                                                        updateSettings({ packs: newPacks });
                                                                                    }} className="text-secondary hover:text-red-500">
                                                                                        <Minus size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newPacks = [...allPacks];
                                                                                    newPacks[idx].items = [...(newPacks[idx].items || []), 'Nuevo item'];
                                                                                    updateSettings({ packs: newPacks });
                                                                                }}
                                                                                className="text-[9px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mt-2 hover:text-indigo-300"
                                                                            >
                                                                                <Plus size={10} /> Añadir Item
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* GESTIÓN DE EXTRAS */}
                                                <div className="card p-6">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h3 className="text-xl font-black text-primary flex items-center gap-3">
                                                            <Tag size={24} className="text-emerald-500" /> Productos Extras
                                                        </h3>
                                                        <button
                                                            onClick={() => {
                                                                const newExtra = {
                                                                    id: `extra_${Date.now()}`,
                                                                    name: 'Nuevo Extra',
                                                                    price: 5,
                                                                    cost: 1,
                                                                    emoji: '🎁'
                                                                };
                                                                updateSettings({ extras: [...allExtras, newExtra] });
                                                            }}
                                                            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                                                        >
                                                            <Plus size={14} /> Nuevo Extra
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                        {allExtras.map((extra, idx) => (
                                                            <div key={extra.id} className="group bg-primary/3 rounded-2xl p-4 border border-primary/10 hover:border-emerald-500/30 transition-all relative">
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('¿Borrar este extra?')) {
                                                                            updateSettings({ extras: allExtras.filter(e => e.id !== extra.id) });
                                                                        }
                                                                    }}
                                                                    className="absolute top-3 right-3 p-1.5 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                                <div className="flex flex-col gap-3">
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={extra.emoji}
                                                                            onChange={e => {
                                                                                const newExtras = [...allExtras];
                                                                                newExtras[idx].emoji = e.target.value;
                                                                                updateSettings({ extras: newExtras });
                                                                            }}
                                                                            className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-center text-lg outline-none"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={extra.name}
                                                                            onChange={e => {
                                                                                const newExtras = [...allExtras];
                                                                                newExtras[idx].name = e.target.value;
                                                                                updateSettings({ extras: newExtras });
                                                                            }}
                                                                            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 text-xs font-bold text-primary outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                value={extra.price}
                                                                                onChange={e => {
                                                                                    const newExtras = [...allExtras];
                                                                                    newExtras[idx].price = parseFloat(e.target.value) || 0;
                                                                                    updateSettings({ extras: newExtras });
                                                                                }}
                                                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-3 pr-6 py-2 text-xs font-black text-emerald-500 outline-none"
                                                                            />
                                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold">€</span>
                                                                        </div>
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                value={extra.cost}
                                                                                onChange={e => {
                                                                                    const newExtras = [...allExtras];
                                                                                    newExtras[idx].cost = parseFloat(e.target.value) || 0;
                                                                                    updateSettings({ extras: newExtras });
                                                                                }}
                                                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-3 pr-6 py-2 text-xs font-black text-red-500 outline-none"
                                                                            />
                                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-bold">€</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
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
                                <div className="relative w-full max-w-[420px] bg-champagne rounded-[40px] border border-white/50 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-scale-in">
                                    {/* Decoración superior premium */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 z-20" />
                                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-200/20 to-transparent -z-1 opacity-60" />

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
                                                {/* Icono Principal Alegre y Dorado */}
                                                <div className="relative mb-6 mt-2 group">
                                                    <div className="w-24 h-24 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 rounded-[32px] flex items-center justify-center border border-white/40 shadow-xl shadow-orange-500/40 relative overflow-hidden">
                                                        {/* Brillo dinámico tipo cristal */}
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
                                                        <Gift size={44} className="text-white animate-bounce filter drop-shadow-md" style={{ animationDuration: '2.5s' }} />
                                                        <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-200 animate-ping" style={{ animationDuration: '1.5s' }} />
                                                        <Sparkles size={16} className="absolute -bottom-1 -left-1 text-orange-200 animate-pulse" />
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
                                                        Acepto el tratamiento de mis datos según la <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrivacyModal(true); }} className="text-accent underline hover:no-underline transition-all font-black">política de privacidad</button>.
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
                </>
            )
            }

            {/* MODAL AVISO PAGO PLAN FLEX */}
            {showFlexPaymentModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
                    <div className="w-full max-w-lg bg-card border border-indigo-500/30 rounded-[40px] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slide-up">
                        <div className="p-8 space-y-6">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-indigo-500/30 mb-6">
                                <AlertTriangle className="text-amber-500" size={32} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">Descarga Bloqueada</h3>
                                <p className="text-secondary text-xs font-bold uppercase tracking-widest leading-relaxed">
                                    Para descargar el <span className="text-indigo-500">Excel Maestro</span> o realizar <span className="text-indigo-500">Backups</span>, debes completar el pago del plan.
                                </p>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                                <div>
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1 opacity-50">Titular</p>
                                    <p className="text-primary font-bold text-lg uppercase tracking-wider">JOSE PUJALTE MOLINA</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1 opacity-50">IBAN</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-indigo-400 font-mono font-black text-sm sm:text-base tracking-widest">ES75 0081 1117 1100 0113 4919</p>
                                        <button
                                            onClick={() => copyToClipboard("ES7500811117110001134919", 'IBAN copiado')}
                                            className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shrink-0"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-primary/10">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1 opacity-50">Concepto Requerido</p>
                                    <p className="text-primary font-bold text-sm uppercase tracking-wider">PAGO APP ORLAS - {settings.brandName}</p>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => setShowFlexPaymentModal(false)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base uppercase tracking-widest rounded-3xl py-5 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    ENTENDIDO <CheckCircle size={20} />
                                </button>
                                <p className="text-center text-[10px] text-secondary font-black uppercase tracking-widest leading-relaxed px-4 opacity-50">
                                    Una vez realizada la transferencia, activa tu cuenta desde el centro de control o contacta con soporte.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ÉXITO SOLICITUD DE PLAN */}
            {showPlanSuccessModal && planTransitionData && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
                    <div className="w-full max-w-xl bg-slate-900 border border-indigo-500/30 rounded-[50px] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slide-up relative">
                        {/* Cabecera con efecto de luz */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                        <div className="p-10 text-center space-y-8">
                            {/* Icono Animado */}
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                                <div className="relative w-24 h-24 bg-indigo-600 rounded-[35%] flex items-center justify-center border-4 border-indigo-400 rotate-12 shadow-2xl">
                                    <Sparkles className="text-white" size={40} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                                    ¡Plan Solicitado!
                                </h3>
                                <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em]">
                                    {planTransitionData.condition}
                                </p>
                            </div>

                            {/* Detalles de la Transición */}
                            <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 text-left space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <span className="text-secondary text-[10px] font-black uppercase tracking-widest opacity-50">Importe a abonar</span>
                                    <span className="text-3xl font-black text-white">{planTransitionData.amount}</span>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-50">¿Qué sucede ahora?</p>
                                    <div className="grid gap-3">
                                        {planTransitionData.benefits.map((benefit, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                                    <Check className="text-emerald-500" size={12} />
                                                </div>
                                                <span className="text-sm font-bold text-white/80">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Instrucciones de Pago */}
                            <div className="space-y-6">
                                <p className="text-secondary text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
                                    Para activar el nuevo plan completamente, realiza la transferencia con el concepto:
                                    <span className="block text-white mt-2 font-black border-2 border-dashed border-indigo-500/30 p-3 rounded-2xl bg-indigo-500/5">
                                        PAGO APP ORLAS - {settings.brandName?.toUpperCase() || 'ESTUDIO'}
                                    </span>
                                </p>

                                <button
                                    onClick={() => {
                                        sendAdminNotification('PLAN_REQUEST', {
                                            brandName: settings.brandName,
                                            email: settings.email,
                                            plan: planTransitionData.to,
                                            condition: planTransitionData.condition,
                                            amount: planTransitionData.amount
                                        });
                                        setShowPlanSuccessModal(false);
                                    }}
                                    className="w-full bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black text-lg uppercase tracking-widest rounded-3xl py-6 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                                >
                                    Cerrar y Continuar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-[9px] text-secondary font-black uppercase tracking-widest opacity-40">
                                    *Las funciones de descarga se habilitarán tras la validación manual.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SELECTOR DE PLAN */}
            {showPlanSelector && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-2xl animate-fade-in">
                    <div className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in relative">
                        <button
                            onClick={() => setShowPlanSelector(false)}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8 md:p-16 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <PricingTiers
                                onSelectPlan={handlePlanChange}
                                currentPlan={settings.plan}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL POLÍTICA DE PRIVACIDAD */}
            {
                showPrivacyModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in text-left">
                        <div className="relative w-full max-w-[500px] bg-card rounded-[40px] border border-primary/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-scale-in">
                            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent"><Shield size={20} /></div>
                                        <h3 className="text-lg font-black text-primary uppercase tracking-[0.2em]">Privacidad</h3>
                                    </div>
                                    <button onClick={() => setShowPrivacyModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 text-secondary hover:text-primary transition-all active:scale-90"><X size={20} /></button>
                                </div>

                                <div className="space-y-6 text-[11px] text-secondary/80 leading-relaxed font-bold uppercase tracking-widest">
                                    <div className="p-5 bg-primary/2 rounded-3xl border border-primary/5">
                                        <p className="mb-4 text-accent">En cumplimiento del Reglamento General de Protección de Datos (RGPD), le informamos sobre el tratamiento de sus datos:</p>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-primary mb-1">1. RESPONSABLE DEL TRATAMIENTO</p>
                                                <p>Pujalte Creative Studio (Pujalte Fotografía).</p>
                                            </div>

                                            <div>
                                                <p className="text-primary mb-1">2. FINALIDAD</p>
                                                <p>Gestionar su solicitud de cupón descuento comercial y contactarle para informarle sobre la campaña fotográfica en curso y futuras promociones relacionadas.</p>
                                            </div>

                                            <div>
                                                <p className="text-primary mb-1">3. LEGITIMACIÓN</p>
                                                <p>Su consentimiento expreso al marcar la casilla de aceptación en el formulario.</p>
                                            </div>

                                            <div>
                                                <p className="text-primary mb-1">4. CONSERVACIÓN</p>
                                                <p>Los datos se conservarán mientras exista un interés mutuo para mantener el fin del tratamiento o hasta que usted solicite su supresión.</p>
                                            </div>

                                            <div>
                                                <p className="text-primary mb-1">5. DERECHOS</p>
                                                <p>Puede ejercer sus derechos de acceso, rectificación, portabilidad, limitación y supresión enviando un correo a apps@pujaltefotografia.es.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="italic text-center px-4">Al enviar el formulario, usted garantiza que los datos proporcionados son verdaderos y se compromete a comunicar cualquier modificación de los mismos.</p>
                                </div>
                            </div>
                            <div className="p-8 bg-primary/2 border-t border-primary/5">
                                <button onClick={() => setShowPrivacyModal(false)} className="w-full h-[60px] bg-accent text-card font-black rounded-2xl hover:shadow-xl hover:shadow-accent/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-sm">Entendido y Cerrar</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
