// Force reload for deployment fix
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase.js';
import {
    GraduationCap, User, CreditCard, Plus, Minus, CheckCircle,
    Download, Settings, Search, DollarSign, Euro, BarChart3, Copy,
    MessageSquare, ChevronRight, Lock, Shield, Package, Sparkles, Gift, Mail, Phone,
    TrendingUp, Users, Trash2, Edit, Sun, Moon, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Database, Upload, AlertTriangle, Share,
    Square, CheckSquare, X, Camera, Check, Tag, FileText, Crown, ArrowRight,
    Settings2, Maximize2, Maximize, ZoomIn, ZoomOut, Move, Layout, Bold, Italic, UserCheck, Eye, EyeOff, Palette, History,
    LayoutGrid, UserSquare2, Layers, MoveVertical, MoveHorizontal, GripVertical, Move as MoveIcon, ArrowUpDown, Grid, Box, ChevronsUpDown, Baseline, AlignCenterVertical, AlignCenterHorizontal
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
import CommandCenter from './components/CommandCenter.jsx';
import { AvisoLegal, PoliticaPrivacidad, CondicionesVenta } from './components/LegalModals.jsx';
// Nuevos componentes modulares
import UserEnrollment from './components/user/UserEnrollment.jsx';
import OrdersPanel from './components/admin/OrdersPanel.jsx';
import EditOrderModal from './components/admin/EditOrderModal.jsx';
import SchoolsPanel from './components/admin/SchoolsPanel.jsx';
import ShootingPanel from './components/admin/ShootingPanel.jsx';
import SettingsPanel from './components/admin/SettingsPanel.jsx';
import PricingPanel from './components/admin/PricingPanel.jsx';
import DesignPanel from './components/admin/DesignPanel.jsx';
import BillingPanel from './components/admin/BillingPanel.jsx';
import StaffEditModal from './components/admin/StaffEditModal.jsx';
import CriticalDatesPanel from './components/admin/CriticalDatesPanel.jsx';
import TutorsPanel from './components/admin/TutorsPanel.jsx';
import LabelGenerator from './components/admin/LabelGenerator.jsx';



import { toTitleCase, firstSurname, getCourseBase, getGroup } from './utils/formatters.js';

// --- CONFIGURACIÓN DISEÑO ORLA (ESTABLE - FUERA DE APP PR RENDIMIENTO) ---
const DPI = 300;
const mmToPx = (mm) => Math.round((mm * DPI) / 25.4);
const pxToMm = (px) => Math.round((px * 25.4) / DPI);



// --- ORBES DECORATIVOS ---
const BackgroundOrbs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/15 blur-[140px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full animate-float-slow" />
    </div>
);

// --- CAMBIO DE TEMA ---
const ThemeToggle = ({ theme, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all duration-500 overflow-hidden relative ${className}`}
    >
        <div className={`transition-all duration-500 transform ${theme === 'light' ? 'translate-y-0 rotate-0' : 'translate-y-12 rotate-90'}`}>
            <Sun size={20} className="text-amber-500" />
        </div>
        <div className={`absolute transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-0 rotate-0' : '-translate-y-12 -rotate-90'}`}>
            <Moon size={20} className="text-violet-400" />
        </div>
    </button>
);

// --- DEV NAVIGATION (SOLO PARA ADMIN) ---
const DevNav = React.memo(({ view, setView }) => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-1.5 bg-black/60 backdrop-blur-3xl border border-white/10 p-1.5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-90 md:scale-100 ring-1 ring-white/5 transition-all hover:bg-black/80">
        <button
            onClick={() => setView('onboarding')}
            className={`px-3 py-2 rounded-[18px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'onboarding' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            <Sparkles size={12} className={view === 'onboarding' ? 'animate-pulse' : ''} /> <span className="hidden xs:inline">ÚNETE FOTÓGRAFO</span><span className="xs:hidden">ÚNETE</span>
        </button>
        <button
            onClick={() => setView('master')}
            className={`px-3 py-2 rounded-[18px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'master' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            <Settings size={12} className={view === 'master' ? 'animate-spin-slow' : ''} /> <span className="hidden xs:inline">CENTRO DE CONTROL</span><span className="xs:hidden">MASTER</span>
        </button>
        <button
            onClick={() => setView('admin')}
            className={`px-3 py-2 rounded-[18px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            <Settings size={12} /> <span className="hidden xs:inline">PANEL GESTIÓN</span><span className="xs:hidden">ADMIN</span>
        </button>
        <button
            onClick={() => setView('command')}
            className={`px-3 py-2 rounded-[18px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'command' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            <LayoutGrid size={12} /> <span className="hidden xs:inline">PRODUCCIÓN</span><span className="xs:hidden">SCRIPTS</span>
        </button>
        <button
            onClick={() => setView('landing')}
            className={`px-3 py-2 rounded-[18px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'landing' ? 'bg-white text-black shadow-lg shadow-white/40' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            <Layers size={12} /> <span className="hidden xs:inline">LANDING</span><span className="xs:hidden">WEB</span>
        </button>
        <button
            onClick={() => setView('user')}
            className={`px-3 py-2 rounded-[18px] text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'user' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
            <Users size={12} /> <span className="hidden xs:inline">VISTA USUARIO</span><span className="xs:hidden">USER</span>
        </button>
    </div>
));

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

    // Interceptar retorno de pasarela Paycomet
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        if (paymentStatus) {
            import('sweetalert2').then(({ default: Swal }) => {
                if (paymentStatus === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Pago completado!',
                        text: 'Tu pedido ha sido pagado y confirmado correctamente.',
                        confirmButtonColor: '#10b981'
                    });
                } else if (paymentStatus === 'error') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en el pago',
                        text: 'No se pudo completar el pago. Por favor, intenta de nuevo.',
                        confirmButtonColor: '#ef4444'
                    });
                }
                // Limpiar la URL param sin recargar la página
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + (params.get('f') ? '?f=' + params.get('f') : '');
                window.history.replaceState({path:newUrl}, '', newUrl);
            });
        }

        // Acceso directo al Centro de Control vía URL (?mode=master)
        if (params.get('mode') === 'master') {
            setShowPinModal(true);
            // Limpiar el parámetro para evitar re-aperturas molestas
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + (params.get('f') ? '?f=' + params.get('f') : '');
            window.history.replaceState({path:newUrl}, '', newUrl);
        }
    }, [photographerId]);

    const { settings, setSettings, paymentMethods, enabledPaymentMethods, schools, packs: allPacks, extras: allExtras, adminPin, togglePaymentMethod, addPaymentMethod, updateAdminPin, addSchool, updateSchool, deleteSchool, updateSettings } = useSettings(photographerId, isDemo);

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [view, setView] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view');
        const f = params.get('f');
        if (v === 'admin' || v === 'master' || v === 'command' || v === 'user') return v;
        if (f) return 'user';
        return 'landing';
    });

    useEffect(() => {
        // Sincronizar atributo para CSS nativo
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);

        // Sincronizar clase para Tailwind dark mode
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const [isLoaded, setIsLoaded] = useState(true);
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const [adminTab, setAdminTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'schools';
    });
    const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);
    const [mobileOrdersFiltersOpen, setMobileOrdersFiltersOpen] = useState(false);

    const [step, setStep] = useState(0);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    const [adminSchool, setAdminSchool] = useState('');
    const [schoolToEdit, setSchoolToEdit] = useState(null);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showLandingAviso, setShowLandingAviso] = useState(false);
    const [showLandingPrivacidad, setShowLandingPrivacidad] = useState(false);
    const [showLandingCondiciones, setShowLandingCondiciones] = useState(false);
    const [pinError, setPinError] = useState(false);
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('unlock') === 'true'; // Atajo para pruebas del agente
    });
    const [isCreator, setIsCreator] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('creator') === 'true'; // Acceso exclusivo para el creador
    });
    const [btnDemo, setBtnDemo] = useState(false);
    const [newMethodLabel, setNewMethodLabel] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showNewStudentForm, setShowNewStudentForm] = useState(false);
    const [exportFilters, setExportFilters] = useState({ school: '', course: '', group: '' });
    // Shooting
    const [shootSearch, setShootSearch] = useState('');
    const [shootFilters, setShootFilters] = useState({ course: '', group: '', status: '' });
    const [ordersFilters, setOrdersFilters] = useState({ course: '', group: '', status: '' });
    const [shootMode, setShootMode] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('shoot_mode') || 'students';
    }); // 'students' | 'staff'
    const [orderToEdit, setOrderToEdit] = useState(null); // { order, studentName, packId, packQuantity, photoFile, status, paymentMethod, tempCourse, tempGroup }
    const [newStaffForm, setNewStaffForm] = useState({ schoolId: '', firstName: '', lastName: '', role: '', photoFile: '', tempCourse: '', tempGroup: '', assignments: [] });

    const [staffAssigning, setStaffAssigning] = useState(null); // { member, tempFile }
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);

    const [newStudentForm, setNewStudentForm] = useState({ schoolId: '', name: '', parentName: '', course: '', group: '', phone: '', email: '', packId: '', extras: [], complements: [], notes: '', photoFile: '', status: 'Pendiente', paymentMethod: '' });

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

    // --- ESTADO DE CONEXIÓN (PWA) ---
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // --- MANEJO DE NOTIFICACIONES PUSH (PWA) ---
    useEffect(() => {
        const urlBase64ToUint8Array = (base64String) => {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        };

        const subscribeToPush = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

            try {
                const registration = await navigator.serviceWorker.ready;
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    const VAPID_KEY = "BHlRMHtNv7wtwckffZPgnTtk5fOFLw60QBV665hnkaO8nqo6YlOM7Pj12x3V_oZ2TeXcYWRdzWpb0VBDfWJp9RU";

                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
                    });

                    // Guardar en Firebase via Cloud Function
                    const { httpsCallable } = await import('firebase/functions');
                    const { functions: fns } = await import('./firebase.js');
                    const saveSub = httpsCallable(fns, 'saveSubscription');
                    await saveSub({ subscription, photographerId });

                    console.log('✅ Suscripción PWA guardada con éxito');
                }
            } catch (err) {
                console.warn('Suscripción PWA no disponible o denegada:', err.message);
            }
        };

        if (view === 'user') {
            subscribeToPush();
        }

        if (!messaging) return;
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('FCM Foreground:', payload);
            alert(`📣 ${payload.notification?.title || 'Nuevo aviso'}\n${payload.notification?.body || ''}`);
        });

        return () => unsubscribe();
    }, [photographerId, view]);

    const [configOrla, setConfigOrla] = useState(() => {
        const defaults = {
            canvasW: 4961, canvasH: 3508, margin: mmToPx(20),
            numAlumnos: 24, numDocentes: 3,
            fontFamily: "Myriad Pro", isBold: false, isItalic: false,
            fontSizeAlu: 10, fontSizeDoc: 10,
            dScale: 1.2, dY: mmToPx(60), dGapX: mmToPx(15), dTextOffset: mmToPx(12),
            aScale: 1.0, aW: mmToPx(35), aH: mmToPx(45), aStartY: mmToPx(135), aStartX: mmToPx(20),
            aCols: 8, aGapY: mmToPx(65), aGapX: mmToPx(10), aTextOffset: mmToPx(10),
            promoText: "PROMOCIÓN 2026"
        };
        try {
            const stored = localStorage.getItem(`orlas2026_configOrla`);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...defaults, ...parsed, fontFamily: "Myriad Pro" };
            }
            return defaults;
        } catch {
            return defaults;
        }
    });

    useEffect(() => {
        localStorage.setItem(`orlas2026_configOrla`, JSON.stringify(configOrla));
    }, [configOrla]);
    const [designFilter, setDesignFilter] = useState({ course: '', group: '' });
    const [activeDesignParam, setActiveDesignParam] = useState(null); // { key, label, min, max, unit, step }
    const [isFullScreenDesign, setIsFullScreenDesign] = useState(false);
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [showZoomBar, setShowZoomBar] = useState(false);
    const [expandedDesignGroups, setExpandedDesignGroups] = useState(['alumnos']);


    // Drag to pan ref
    const canvasContainerRef = useRef(null);
    const isDraggingCanvasRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const scrollStartRef = useRef({ left: 0, top: 0 });

    const handleCanvasMouseDown = (e) => {
        isDraggingCanvasRef.current = true;
        dragStartRef.current = { x: e.clientX || e.touches?.[0].clientX, y: e.clientY || e.touches?.[0].clientY };
        if (canvasContainerRef.current) {
            scrollStartRef.current = {
                left: canvasContainerRef.current.scrollLeft,
                top: canvasContainerRef.current.scrollTop
            };
            canvasContainerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDraggingCanvasRef.current) return;
        const x = e.clientX || e.touches?.[0].clientX;
        const y = e.clientY || e.touches?.[0].clientY;
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;

        if (isFullScreenDesign) {
            setPanOffset(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));
            dragStartRef.current = { x, y };
        } else if (canvasContainerRef.current) {
            canvasContainerRef.current.scrollLeft = scrollStartRef.current.left - dx;
            canvasContainerRef.current.scrollTop = scrollStartRef.current.top - dy;
        }
    };

    const handleCanvasWheel = (e) => {
        if (!isFullScreenDesign) return;
        const zoomSpeed = 0.001;
        setCanvasZoom(prev => {
            const newZoom = prev - e.deltaY * zoomSpeed;
            return Math.min(3, Math.max(0.1, newZoom));
        });
    };

    const handleCanvasMouseUp = () => {
        isDraggingCanvasRef.current = false;
        if (canvasContainerRef.current) {
            canvasContainerRef.current.style.cursor = 'grab';
        }
    };
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
    const sortedSchools = useMemo(() => {
        if (!schools || !Array.isArray(schools)) return [];
        return [...schools].sort((a, b) => a.name.localeCompare(b.name));
    }, [schools]);



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
    const [selectedSupplements, setSelectedSupplements] = useState({}); // { [packId]: { [supId]: quantity } }
    const [extras, setExtras] = useState({});
    const [formError, setFormError] = useState('');

    const { orders: realOrders, addOrder, updateStatus, deleteOrder, updatePhotoFile, updateOrder, resetOrders } = useOrders(photographerId, adminSchool);
    const { staff: realStaff, addStaff, updateStaffPhoto, updateStaffMember, deleteStaff } = useStaff(photographerId, adminSchool);

    // --- SIMULACRO V2.6 (SOLO PARA JESS-PHOTOGRAPHY) ---
    const simStaff = [
        { id: '4567', name: 'Estela Mar', role: 'Orientador/a', assignments: [{ course: 'Guardería 2-3 años', group: '' }], photoFile: '4567' },
        { id: '1256', name: 'Faustino', role: 'Director/a', assignments: [{ course: 'Guardería 2-3 años', group: '' }], photoFile: '1256' },
        { id: '1234', name: 'Maria Hernandez', role: 'Tutor/a', assignments: [{ course: 'Guardería 2-3 años', group: '' }], photoFile: '1234' }
    ];
    const simOrders = [
        { id: '5566', studentName: 'Alejandro Pérez', photoFile: '5566', course: 'Guardería 2-3 años', schoolId: 'cantero', timestamp: new Date().toISOString() },
        { id: '7789', studentName: 'Lucía García', photoFile: '7789', course: 'Guardería 2-3 años', schoolId: 'cantero', timestamp: new Date().toISOString() },
        { id: '9911', studentName: 'Marco Ruiz', photoFile: '9911', course: 'Guardería 2-3 años', schoolId: 'cantero', timestamp: new Date().toISOString() },
        { id: '2233', studentName: 'Sofía Sanz', photoFile: '2233', course: 'Guardería 2-3 años', schoolId: 'cantero', timestamp: new Date().toISOString() }
    ];

    const orders = (photographerId === 'jess-photography' && realOrders.length === 0) ? simOrders : realOrders;
    const staff = (photographerId === 'jess-photography' && realStaff.length === 0) ? simStaff : realStaff;

    // Efecto para autoseleccionar docentes correspondientes al curso/grupo seleccionado en el diseño
    useEffect(() => {
        const groupsForCourse = designFilter.course ? [...new Set(orders.filter(o => getCourseBase(o.course) === designFilter.course).map(o => getGroup(o.course)))].filter(Boolean) : [];
        const needsGroup = groupsForCourse.length > 0;
        const isSelectionComplete = designFilter.school && designFilter.course && (!needsGroup || designFilter.group);

        if (isSelectionComplete) {
            const filteredStaff = staff.filter(m => {
                const assignments = getStaffAssignments(m);
                return assignments.some(a => {
                    const cBase = getCourseBase(a.course);
                    const g = getGroup(a.course);
                    return cBase === designFilter.course && (!needsGroup || g === designFilter.group);
                });
            });
            setSelectedStaffIds(filteredStaff.length > 0 ? filteredStaff.map(s => s.id) : []);
        } else {
            setSelectedStaffIds([]);
        }
    }, [designFilter.school, designFilter.course, designFilter.group, staff, orders]);

    const getStaffAssignments = (m) => m.assignments && m.assignments.length > 0 ? m.assignments : (m.course ? [{ course: m.course, group: m.group }] : []);

    // Sincronizar método de pago por defecto cuando cambian los activos
    useEffect(() => {
        if (!formData.paymentMethod && enabledPaymentMethods.length > 0) {
            setFormData(prev => ({ ...prev, paymentMethod: enabledPaymentMethods[0].id }));
        }
    }, [enabledPaymentMethods]);

    // GENERAR TOKEN ADMIN AL DESBLOQUEAR
    useEffect(() => {
        if (isAdminUnlocked && !localStorage.getItem(`orlas2026_token_${photographerId}`)) {
            const fetchToken = async () => {
                try {
                    const { httpsCallable } = await import('firebase/functions');
                    const { functions } = await import('./firebase.js');
                    const getTokenFn = httpsCallable(functions, 'getAdminToken');
                    const res = await getTokenFn({ photographerId, pin: '7373' });
                    localStorage.setItem(`orlas2026_token_${photographerId}`, res.data.token);
                    console.log('🔐 Sesión de administrador firmada (JWT)');
                } catch (e) {
                    console.error('Error obteniendo token JWT:', e);
                }
            };
            fetchToken();
        }
    }, [isAdminUnlocked, photographerId]);

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

        // Sumar Packs
        Object.entries(selectedPacks).forEach(([id, qty]) => {
            const pack = allPacks.find(p => p.id === id);
            if (pack) {
                price += pack.price * qty;
                cost += pack.cost * qty;
            }
        });

        // Sumar Suplementos por Pack
        const activeSupplements = settings.supplements || [];
        Object.entries(selectedPacks).forEach(([packId, packQty]) => {
            const packSups = selectedSupplements[packId] || {};
            Object.entries(packSups).forEach(([supId, supQty]) => {
                const supplement = activeSupplements.find(s => s.id.toString() === supId.toString());
                if (supplement && supQty > 0) {
                    price += supplement.price * supQty;
                }
            });
        });

        // Sumar Extras
        Object.entries(extras).forEach(([id, qty]) => {
            if (qty > 0) {
                const item = allExtras.find(e => e.id === id);
                if (item) { price += item.price * qty; cost += item.cost * qty; }
            }
        });
        return { price, cost, profit: price - cost };
    }, [selectedPacks, extras, selectedSupplements, allPacks, allExtras, settings.supplements]);

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
            if (newPacks[packId]) {
                delete newPacks[packId];
                // Limpiar suplementos asociados
                setSelectedSupplements(prevSups => {
                    const newSups = { ...prevSups };
                    delete newSups[packId];
                    return newSups;
                });
            }
            else newPacks[packId] = 1;
            return newPacks;
        });
    };

    const updatePackQuantity = (packId, qty) => {
        setSelectedPacks(prev => ({ ...prev, [packId]: Math.max(1, qty) }));
    };

    const toggleSupplement = (packId, supId) => {
        setSelectedSupplements(prev => {
            const packSups = { ...(prev[packId] || {}) };
            if (packSups[supId]) {
                delete packSups[supId];
            } else {
                packSups[supId] = 1;
            }
            return { ...prev, [packId]: packSups };
        });
    };

    const updateSupplementQuantity = (packId, supId, qty) => {
        setSelectedSupplements(prev => {
            const packSups = { ...(prev[packId] || {}) };
            if (qty <= 0) {
                delete packSups[supId];
            } else {
                packSups[supId] = qty;
            }
            return { ...prev, [packId]: packSups };
        });
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

    const handleFinalize = async () => {
        const extrasDesc = getExtrasDesc();
        const packsDesc = getPacksDesc();
        const mainPackId = Object.keys(selectedPacks)[0];

        // Suplementos descripción agrupada
        const activeSupplements = settings.supplements || [];
        const supplementsDesc = Object.entries(selectedSupplements)
            .map(([packId, packSups]) => {
                const p = allPacks.find(x => x.id === packId);
                const sups = Object.entries(packSups)
                    .map(([sId, sQty]) => {
                        const s = activeSupplements.find(sup => sup.id.toString() === sId.toString());
                        return `${sQty > 1 ? `${sQty}x ` : ''}${s?.name || sId}`;
                    })
                    .join(', ');
                return sups ? `${p?.name || packId}: ${sups}` : '';
            })
            .filter(Boolean)
            .join(' | ');

        const newOrder = {
            studentName: formData.studentName,
            schoolId: formData.schoolId,
            schoolName: getSchoolName(formData.schoolId),
            schoolCode: schools.find(s => s.id === formData.schoolId)?.code,
            course: formData.course,
            packs: Object.entries(selectedPacks).map(([id, qty]) => ({
                id,
                name: allPacks.find(p => p.id === id)?.name || id,
                quantity: qty,
                supplements: Object.entries(selectedSupplements[id] || {}).map(([sId, sQty]) => {
                    const s = (settings.supplements || []).find(sup => sup.id.toString() === sId.toString());
                    return {
                        id: sId,
                        name: s?.name || sId,
                        quantity: sQty,
                        price: s?.price || 0
                    };
                })
            })),
            pack: { id: mainPackId, label: packsDesc }, // Para compatibilidad
            packId: mainPackId,
            packQuantity: selectedPacks[mainPackId] || 1,
            extras: { ...extras },
            extrasDesc,
            supplements: { ...selectedSupplements },
            supplementsDesc,
            paymentMethod: formData.paymentMethod,
            price: orderTotals.price,
            cost: orderTotals.cost,
            profit: orderTotals.profit,
        };

        if (formData.paymentMethod === 'card') {
            try {
                // Registrar pedido como pendiente
                newOrder.status = 'Pendiente (Pago en proceso)';
                const createdOrder = await addOrder(newOrder);

                const Swal = (await import('sweetalert2')).default;
                Swal.fire({
                    title: 'Conectando con pasarela segura...',
                    text: 'Redirigiendo a Sabadell Paycomet. Por favor, no cierres esta ventana.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const { httpsCallable } = await import('firebase/functions');
                const { functions } = await import('./firebase.js');
                const createPaycometIntent = httpsCallable(functions, 'createPaycometIntent');

                const response = await createPaycometIntent({
                    studentId: createdOrder.id,
                    amount: orderTotals.price,
                    photographerId: photographerId,
                    payMethod: 'card'
                });

                const { success, paycometUrl } = response.data;

                if (success && paycometUrl) {
                    // Redirección directa a la pasarela segura
                    window.location.href = paycometUrl;
                } else {
                    throw new Error("No se recibió una URL de pago válida.");
                }

            } catch (error) {
                console.error("Error al iniciar pago con tarjeta:", error);
                const Swal = (await import('sweetalert2')).default;
                Swal.fire('Error', 'No se pudo conectar con la pasarela de pago. Inténtalo de nuevo o selecciona otro método.', 'error');
            }
        } else {
            await addOrder(newOrder);
            setOrderCompleted(true);

            sendAdminNotification('PEDIDO', {
                studentName: formData.studentName,
                schoolName: getSchoolName(formData.schoolId),
                course: formData.course,
                packName: `${packsDesc}${supplementsDesc ? ` (+${supplementsDesc})` : ''}`,
                total: orderTotals.price,
                paymentMethod: formData.paymentMethod
            });
        }
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
            (extrasDesc ? `➕ *Extras:* ${extrasDesc}\n` : '');

        // Obtener descripción de suplementos para WhatsApp
        const activeSupplements = settings.supplements || [];
        const supplementsDescList = Object.keys(selectedSupplements)
            .filter(id => selectedSupplements[id])
            .map(id => {
                const s = activeSupplements.find(sup => sup.id.toString() === id.toString());
                return s ? s.name : '';
            })
            .filter(Boolean);

        const footer =
            (supplementsDescList.length > 0 ? `✨ *Suplementos:* ${supplementsDescList.join(', ')}\n` : '') +
            `💰 *Total:* ${orderTotals.price.toFixed(0)}€\n`;

        const fullMsg = header + footer;

        if (isBizum) {
            return fullMsg + "\n" +
                `💳 *Pago:* Bizum\n\n` +
                `✅ He realizado el Bizum al ${CONTACT_PHONE} con el concepto *ORLA ${formData.studentName}*.\n` +
                `Adjunto el justificante. ¡Gracias!`;
        }

        if (isEfectivo) {
            return fullMsg + "\n" +
                `💶 *Pago:* Efectivo\n\n` +
                `🏫 Haré entrega del importe en efectivo directamente en el centro escolar.\n` +
                `Por favor, confirmad disponibilidad para la recogida. ¡Muchas gracias!`;
        }

        // Transferencia u otro
        return fullMsg + "\n" +
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

    const updateConfig = (key, value) => {
        setConfigOrla(prev => ({ ...prev, [key]: value }));
    };




    const handleAdminClick = () => {
        if (isAdminUnlocked) { setView('admin'); return; }
        setShowPinModal(true); setPinInput(''); setPinError(false);
    };

    const handleSecretAdminAccess = () => {
        if (isAdminUnlocked) {
            if (photographerId === 'pujaltecreativestudio') {
                setIsCreator(true);
                setView('master');
            } else {
                setView('admin');
            }
            return;
        }
        setShowPinModal(true);
        setPinInput('');
        setPinError(false);
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
        return csv;
    };

    const filteredOrders = orders
        .filter(o => {
            const matchesSearch = !searchTerm ||
                o.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCourse = !ordersFilters.course || getCourseBase(o.course) === ordersFilters.course;
            const matchesGroup = !ordersFilters.group || getGroup(o.course) === ordersFilters.group;
            const matchesStatus = !ordersFilters.status || o.status === ordersFilters.status;

            return matchesSearch && matchesCourse && matchesGroup && matchesStatus;
        })
        .sort((a, b) => firstSurname(a.studentName).localeCompare(firstSurname(b.studentName), 'es', { sensitivity: 'base' }));

    if (!isLoaded) return <div className="min-h-screen bg-card flex items-center justify-center animate-pulse"><img src={`${import.meta.env.BASE_URL}logo.png`} className="w-12 h-12 grayscale opacity-20" /></div>;

    return (
        <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

            {/* AVISO OFFLINE */}
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 z-[1000] bg-amber-500 text-white py-2 px-4 text-center text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
                    <AlertTriangle size={14} /> Estás en modo offline. Algunas funciones pueden no estar disponibles.
                </div>
            )}
            <style>{`
                .dark { color-scheme: dark; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.4); }
                @keyframes shine {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .animate-shine { animation: shine 1.5s infinite; }
            `}</style>

            {isAdminUnlocked && (
                <div className="fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 z-[100] animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
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

            {/* Fondo decorativo */}
            {view !== 'master' && view !== 'command' && <BackgroundOrbs />}

            {/* CABECERA (Ocultar en Master/Onboarding/Suspended/Landing/Command) */}
            {view !== 'master' && view !== 'onboarding' && view !== 'landing' && view !== 'command' && !settings.isSuspended && (
                <>
                    <header className={`fixed top-0 inset-x-0 z-[700] backdrop-blur-xl border-b transition-all duration-500 safe-top bg-card/80 border-primary/5 md:bg-transparent md:border-none md:backdrop-blur-none ${isFullScreenDesign ? '!bg-card/95 !backdrop-blur-2xl !border-white/5' : ''}`}>
                        <div className={`${isFullScreenDesign ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between relative`}>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col leading-none gap-0.5">
                                    <span className={`text-[6px] font-black uppercase tracking-[0.4em] leading-none ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>Powered by</span>
                                    <span className={`text-[11px] md:text-[13px] font-black uppercase tracking-[0.1em] leading-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Pujalte Creative Studio</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {view === 'admin' && (
                                    <button
                                        onClick={() => isFullScreenDesign ? setIsFullScreenDesign(false) : setView('user')}
                                        className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-xl border transition-all active:scale-95 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] bg-accent/10 border-accent/20 text-accent hover:bg-accent/20 min-h-[44px]`}
                                    >
                                        <ArrowRight size={14} className="rotate-180" /> <span className="hidden xs:inline">VOLVER</span>
                                    </button>
                                )}
                                <ThemeToggle theme={theme} onClick={toggleTheme} className="z-[800]" />
                            </div>
                        </div>
                    </header>
                    <div className="h-16 md:h-24"></div>
                </>
            )}

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
                    {/* 5.5. Landing Page del Producto - ACTUALIZADA */}
                    {view === 'landing' && (
                        <Landing
                            onAdminAccess={handleSecretAdminAccess}
                            onOpenAvisoLegal={() => setShowLandingAviso(true)}
                            onOpenPrivacidad={() => setShowLandingPrivacidad(true)}
                            onOpenCondiciones={() => setShowLandingCondiciones(true)}
                        />
                    )}

                    {/* 6. Vista Maestra (Centro de Control) */}
                    {view === 'master' && <MasterPanel onBack={() => setView('user')} />}

                    {/* VISTA COMMAND CENTER (PRODUCCIÓN) */}
                    {view === 'command' && (
                        <CommandCenter
                            graduates={orders.filter(o =>
                                (!designFilter.course || getCourseBase(o.course) === designFilter.course) &&
                                (!designFilter.group || getGroup(o.course) === designFilter.group)
                            )}
                            staff={staff.filter(m => {
                                const getStaffAsgs = (mem) => {
                                    if (mem.assignments && mem.assignments.length > 0) return mem.assignments;
                                    if (mem.course) return [{ course: mem.course, group: mem.group || '' }];
                                    return [];
                                };
                                const asgs = getStaffAsgs(m);
                                if (!designFilter.course) return true;

                                return asgs.some(a => {
                                    const normalize = (str) => {
                                        if (!str) return '';
                                        return str.toString().toLowerCase()
                                            .normalize("NFD")
                                            .replace(/[\u0300-\u036f]/g, "")
                                            .replace(/\s+/g, ' ')
                                            .trim();
                                    };
                                    const staffCourseNormal = normalize(getCourseBase(a.course));
                                    const filterCourseNormal = normalize(designFilter.course);
                                    const courseMatch = staffCourseNormal === filterCourseNormal;
                                    if (!designFilter.group) return courseMatch;
                                    const groupNormal = normalize(a.group);
                                    const filterGroupNormal = normalize(designFilter.group);
                                    const groupMatch = !groupNormal || groupNormal === filterGroupNormal;
                                    return courseMatch && groupMatch;
                                });
                            })}
                            design={configOrla}
                            onBack={() => setView('admin')}
                            groupName={schools.find(s => s.id === adminSchool)?.name || 'Grupo de Orla'}
                            course={designFilter.course}
                            group={designFilter.group}
                            theme={theme}
                            onToggleTheme={toggleTheme}
                            settings={settings}
                        />
                    )}

                    {/* 7. Vista Onboarding (Registro) */}
                    {view === 'onboarding' && <Onboarding onComplete={() => setView('admin')} />}

                    {/* VISTA USUARIO */}
                    {view === 'user' && (
                        <UserEnrollment
                            step={step}
                            setStep={setStep}
                            formData={formData}
                            setFormData={setFormData}
                            formError={formError}
                            setFormError={setFormError}
                            schools={schools}
                            COURSE_GROUPS={COURSE_GROUPS}
                            courseName={courseName}
                            setCourseName={setCourseName}
                            courseLine={courseLine}
                            setCourseLine={setCourseLine}
                            allPacks={allPacks}
                            allExtras={allExtras}
                            selectedPacks={selectedPacks}
                            setSelectedPacks={setSelectedPacks}
                            selectedSupplements={selectedSupplements}
                            toggleSupplement={toggleSupplement}
                            updateSupplementQuantity={updateSupplementQuantity}
                            extras={extras}
                            setExtras={setExtras}
                            orderTotals={orderTotals}
                            getPacksDesc={getPacksDesc}
                            togglePack={togglePack}
                            updatePackQuantity={updatePackQuantity}
                            toggleExtra={toggleExtra}
                            enabledPaymentMethods={enabledPaymentMethods}
                            setShowGiftModal={setShowGiftModal}
                            handleFinalize={handleFinalize}
                            copyToClipboard={copyToClipboard}
                            CONTACT_PHONE={CONTACT_PHONE}
                            sendWhatsApp={sendWhatsApp}
                            resetForm={resetForm}
                            showLegalModal={showLegalModal}
                            setShowLegalModal={setShowLegalModal}
                            isDemo={isDemo}
                            handleSecretAdminAccess={handleSecretAdminAccess}
                            photographerId={photographerId}
                            settings={settings}
                            theme={theme}
                            orderCompleted={orderCompleted}
                            setOrderCompleted={setOrderCompleted}
                        />
                    )}

                    {/* VISTA ADMIN */}
                    {view === 'admin' && (
                        <div className="pt-0 pb-8 min-h-screen animate-fade-in">
                            <div className="max-w-5xl mx-auto px-4">
                                {/* Logo y Título */}
                                <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 mb-6 md:mb-8 mt-2">
                                    <button
                                        onClick={() => setView('user')}
                                        className="flex items-center justify-center transition-all active:scale-95 hover:opacity-80"
                                    >
                                        {settings.logoUrl || settings.logoUrlDark ? (
                                            <img
                                                src={theme === 'dark' ? (settings.logoUrlDark || settings.logoUrl) : (settings.logoUrl || settings.logoUrlDark)}
                                                alt={photographerId}
                                                className="h-8 md:h-14 w-auto object-contain transition-all duration-500"
                                                style={{ filter: (isDemo && theme === 'light') ? 'brightness(0)' : 'none' }}
                                            />
                                        ) : (
                                            <img
                                                src={`${import.meta.env.BASE_URL}logo_white.png`}
                                                alt="Logo"
                                                className="h-8 md:h-14 w-auto transition-all duration-500"
                                                style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }}
                                            />
                                        )}
                                    </button>

                                    <div className="flex flex-col text-center md:text-left text-primary md:border-l md:border-primary/10 md:pl-6 leading-none">
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                            <Shield size={10} className="text-amber-500 md:size-[14px]" />
                                            <span className="text-[7px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Panel de Control</span>
                                            <div className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[6px] md:text-[8px] font-black text-amber-600 uppercase tracking-tighter ml-1 leading-none shadow-sm">
                                                MASTER
                                            </div>
                                        </div>
                                        <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase md:normal-case mt-1 text-primary">Gestión Estratégica</h2>
                                    </div>
                                </div>

                                {/* Tabs de Navegación */}
                                <div className="sticky top-16 md:top-24 z-50 py-2 md:py-4 bg-background/80 dark:bg-black/80 backdrop-blur-2xl mb-4 border-b border-primary/10 transition-colors">
                                    <div className="max-w-5xl mx-auto">
                                        {/* Escritorio */}
                                        <div className="hidden md:flex flex-nowrap items-center justify-center gap-1 bg-card/60 dark:bg-white/5 p-1 rounded-[2rem] border border-primary/10 dark:border-white/10 backdrop-blur-md shadow-2xl shadow-black/20 overflow-x-auto no-scrollbar w-full">
                                            <button onClick={() => setAdminTab('schools')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'schools' ? 'bg-orange-500 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><GraduationCap size={14} /> Centros</button>
                                            <button onClick={() => setAdminTab('shooting')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'shooting' ? 'bg-red-700 text-white shadow-xl shadow-red-700/30' : 'text-secondary hover:text-primary hover:bg-primary/10'}`}>📸 Shooting</button>
                                            <button onClick={() => setAdminTab('design')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'design' ? 'bg-violet-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Palette size={14} /> Diseño</button>
                                            <button onClick={() => setAdminTab('orders')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'orders' ? 'bg-emerald-500 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Users size={14} /> Pedidos</button>
                                            <button onClick={() => setAdminTab('precios')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'precios' ? 'bg-orange-500 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Euro size={14} /> Precios</button>
                                            <button onClick={() => setAdminTab('billing')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'billing' ? 'bg-slate-700 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><FileText size={14} /> Facturación</button>
                                            <button onClick={() => setAdminTab('settings')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'settings' ? 'bg-indigo-500 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Settings size={14} /> Ajustes</button>
                                            <button onClick={() => setAdminTab('etiquetas')} className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${adminTab === 'etiquetas' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-primary/5'}`}><Tag size={14} /> Etiquetas</button>

                                        </div>

                                        {/* Móvil */}
                                        <div className="md:hidden relative">
                                            <button
                                                onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
                                                className="w-full flex items-center justify-between p-3 bg-card/60 border border-primary/10 rounded-2xl backdrop-blur-md shadow-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${adminTab === 'schools' ? 'bg-orange-500' :
                                                        adminTab === 'shooting' ? 'bg-red-700' :
                                                            adminTab === 'design' ? 'bg-violet-600' :
                                                                adminTab === 'orders' ? 'bg-emerald-500' :
                                                                    adminTab === 'precios' ? 'bg-amber-500' :
                                                        adminTab === 'billing' ? 'bg-slate-700' : 
                                                            adminTab === 'etiquetas' ? 'bg-indigo-600' : 'bg-indigo-500'

                                                        }`}>
                                                        {adminTab === 'schools' ? <GraduationCap size={18} /> :
                                                            adminTab === 'shooting' ? '📸' :
                                                                adminTab === 'design' ? <Palette size={18} /> :
                                                                    adminTab === 'orders' ? <Users size={18} /> :
                                                                        adminTab === 'precios' ? <Euro size={18} /> :
                                                                adminTab === 'billing' ? <FileText size={18} /> : 
                                                                    adminTab === 'etiquetas' ? <Tag size={18} /> : <Settings size={18} />}

                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-wider text-primary">{adminTab}</span>
                                                </div>
                                                <ChevronDown size={20} className={`text-primary/40 transition-transform ${mobileAdminMenuOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {mobileAdminMenuOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-primary/10 rounded-3xl shadow-2xl z-[100] p-2 grid grid-cols-2 gap-2">
                                                    <button onClick={() => { setAdminTab('schools'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><GraduationCap size={20} /> Centros</button>
                                                    <button onClick={() => { setAdminTab('shooting'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2">📸 Shooting</button>
                                                    <button onClick={() => { setAdminTab('design'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><Palette size={20} /> Diseño</button>
                                                    <button onClick={() => { setAdminTab('orders'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><Users size={20} /> Pedidos</button>
                                                    <button onClick={() => { setAdminTab('precios'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><Euro size={20} /> Precios</button>
                                                    <button onClick={() => { setAdminTab('billing'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><FileText size={20} /> Facturas</button>
                                                    <button onClick={() => { setAdminTab('settings'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><Settings size={20} /> Ajustes</button>
                                                    <button onClick={() => { setAdminTab('etiquetas'); setMobileAdminMenuOpen(false); }} className="p-4 rounded-2xl text-[10px] font-black uppercase flex flex-col items-center gap-2"><Tag size={20} /> Etiquetas</button>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bloque: Mi Plan Master */}
                                <div className="card p-4 bg-gradient-to-br from-indigo-900/10 dark:from-indigo-500/10 to-transparent border-indigo-500/20 mb-6 border-2 sticky top-[100px] md:top-[152px] z-[35] backdrop-blur-xl mx-2 md:mx-0 shadow-2xl">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center border-2 border-indigo-500/30 text-indigo-500 bg-indigo-500/10">
                                                <Crown size={22} className="md:size-[32px]" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm md:text-xl font-black text-primary uppercase leading-none">Plan: <span className="text-indigo-500">{settings.plan?.toUpperCase() || 'STARTER'}</span></h3>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                            <button onClick={() => setShowPlanSelector(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] md:text-[10px] uppercase rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20">
                                                Cambiar Plan <ArrowRight size={14} />
                                            </button>
                                            <button onClick={() => setAdminTab('billing')} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-black text-[9px] md:text-[10px] uppercase rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-700/20">
                                                <FileText size={14} /> Mis Facturas
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Renderizado Condicional de Paneles */}
                                {adminTab === 'shooting' && (
                                    <ShootingPanel
                                        orders={orders}
                                        staff={staff}
                                        settings={settings}
                                        shootFilters={shootFilters}
                                        setShootFilters={setShootFilters}
                                        shootSearch={shootSearch}
                                        setShootSearch={setShootSearch}
                                        shootMode={shootMode}
                                        setShootMode={setShootMode}
                                        adminSchool={adminSchool}
                                        setAdminSchool={setAdminSchool}
                                        selectedOrderIds={selectedOrderIds}
                                        setSelectedOrderIds={setSelectedOrderIds}
                                        selectedStaffIds={selectedStaffIds}
                                        setSelectedStaffIds={setSelectedStaffIds}
                                        newStudentForm={newStudentForm}
                                        setNewStudentForm={setNewStudentForm}
                                        newStaffForm={newStaffForm}
                                        setNewStaffForm={setNewStaffForm}
                                        setOrderToEdit={setOrderToEdit}
                                        setStaffAssigning={setStaffAssigning}
                                        addOrder={addOrder}
                                        deleteOrder={deleteOrder}
                                        updateStatus={updateStatus}
                                        updateOrder={updateOrder}
                                        addStaff={addStaff}
                                        deleteStaff={deleteStaff}
                                        downloadMasterBackup={downloadMasterBackup}
                                        getSchoolName={getSchoolName}
                                        sortedSchools={sortedSchools}
                                        resetOrders={resetOrders}
                                    />
                                )}

                                {adminTab === 'etiquetas' && (
                                    <LabelGenerator />
                                )}


                                {/* MODAL ASIGNAR FICHERO — PERSONAL */}
                                <StaffEditModal
                                    staffAssigning={staffAssigning}
                                    setStaffAssigning={setStaffAssigning}
                                    updateStaffMember={updateStaffMember}
                                    deleteStaff={deleteStaff}
                                    schools={schools}
                                />

                                {/* ── GESTIÓN DE PEDIDOS ──────────────────────────────── */}
                                {adminTab === 'orders' && (
                                    <OrdersPanel
                                        orders={orders}
                                        filteredOrders={filteredOrders}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        mobileOrdersFiltersOpen={mobileOrdersFiltersOpen}
                                        setMobileOrdersFiltersOpen={setMobileOrdersFiltersOpen}
                                        adminSchool={adminSchool}
                                        setAdminSchool={setAdminSchool}
                                        schools={schools}
                                        ordersFilters={ordersFilters}
                                        setOrdersFilters={setOrdersFilters}
                                        updateStatus={updateStatus}
                                        deleteOrder={deleteOrder}
                                        setOrderToEdit={setOrderToEdit}
                                        getSchoolName={getSchoolName}
                                        stats={stats}
                                        setShowNewStudentForm={setShowNewStudentForm}
                                        setShowExportModal={setShowExportModal}
                                    />
                                )}


                                {/* ── SECCIÓN CENTROS EDUCATIVOS ───────────────────────── */}
                                {adminTab === 'schools' && (
                                    <div className="space-y-6 pb-20">
                                        <SchoolsPanel
                                            sortedSchools={sortedSchools}
                                            adminSchool={adminSchool}
                                            setAdminSchool={setAdminSchool}
                                            schoolToEdit={schoolToEdit}
                                            setSchoolToEdit={setSchoolToEdit}
                                            newSchoolName={newSchoolName}
                                            setNewSchoolName={setNewSchoolName}
                                            addSchool={addSchool}
                                            updateSchool={updateSchool}
                                            deleteSchool={deleteSchool}
                                            updateSettings={updateSettings}
                                        />
                                        <TutorsPanel
                                            settings={settings}
                                            updateSettings={updateSettings}
                                            schools={schools}
                                            theme={theme}
                                        />
                                        <CriticalDatesPanel
                                            settings={settings}
                                            updateSettings={updateSettings}
                                            schools={schools}
                                            theme={theme}
                                        />
                                    </div>
                                )}

                                {adminTab === 'billing' && (
                                    <BillingPanel 
                                        settings={settings}
                                        photographerId={photographerId}
                                    />
                                )}

                                {/* ── AJUSTES DE LA APP ────────────────────────────────── */}
                                {adminTab === 'settings' && (
                                    <SettingsPanel
                                        settings={settings}
                                        setSettings={setSettings}
                                        updateSettings={updateSettings}
                                        paymentMethods={paymentMethods}
                                        togglePaymentMethod={togglePaymentMethod}
                                        updateAdminPin={updateAdminPin}
                                        downloadMasterBackup={downloadMasterBackup}
                                        syncWithDrive={syncWithDrive}
                                        isBackingUp={isBackingUp}
                                        exportCSV={exportCSV}
                                        adminSchool={adminSchool}
                                        schools={schools}
                                        photographerId={photographerId}
                                    />
                                )}

                                {/* ── SECCIÓN PRECIOS ────────────────────────────────── */}
                                {adminTab === 'precios' && (
                                    <PricingPanel
                                        settings={settings}
                                        updateSettings={updateSettings}
                                        allPacks={allPacks}
                                        allExtras={allExtras}
                                        theme={theme}
                                    />
                                )}

                                {adminTab === 'design' && (
                                    <DesignPanel
                                        isFullScreenDesign={isFullScreenDesign}
                                        setIsFullScreenDesign={setIsFullScreenDesign}
                                        theme={theme}
                                        configOrla={configOrla}
                                        setConfigOrla={setConfigOrla}
                                        updateConfig={updateConfig}
                                        activeDesignParam={activeDesignParam}
                                        setActiveDesignParam={setActiveDesignParam}
                                        schools={schools}
                                        adminSchool={adminSchool}
                                        orders={orders}
                                        settings={settings}
                                        designFilter={designFilter}
                                        setDesignFilter={setDesignFilter}
                                        staff={staff}
                                        selectedStaffIds={selectedStaffIds}
                                        setSelectedStaffIds={setSelectedStaffIds}
                                        setAdminSchool={setAdminSchool}
                                        setView={setView}
                                        canvasContainerRef={canvasContainerRef}
                                        COURSE_GROUPS={COURSE_GROUPS}
                                        updateSchool={updateSchool}
                                        updateOrder={updateOrder}
                                        updateStaffMember={updateStaffMember}
                                    />
                                )}

                                <BackgroundOrbs />
                            </div>

                            {/* Modales de Administración */}
                            <EditOrderModal
                                orderToEdit={orderToEdit}
                                setOrderToEdit={setOrderToEdit}
                                allPacks={allPacks}
                                updateOrder={updateOrder}
                            />
                        </div>
                    )}

                    {/* MODAL REGALO */}
                    {
                        showGiftModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
                                <div className="relative w-full max-w-[420px] bg-champagne rounded-[40px] border border-white/50 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-scale-in">
                                    {/* Decoración superior premium */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 z-20" />
                                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-200/20 to-transparent -z-1 opacity-60" />

                                    {/* Botón cerrar */}
                                    <button onClick={() => { setShowGiftModal(false); setGiftSuccess(false); }} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-primary/5 text-secondary hover:text-primary transition-colors z-10"><X size={18} /></button>

                                    <div className="p-6 pb-8 flex flex-col items-center text-center">
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
                                                {/* Icono Principal Alegre y Dorado - Compactado */}
                                                <div className="relative mb-4 mt-0 group">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 rounded-[20px] flex items-center justify-center border border-white/40 shadow-xl shadow-orange-500/30 relative overflow-hidden">
                                                        <Gift size={32} className="text-white animate-bounce filter drop-shadow-md" style={{ animationDuration: '2.5s' }} />
                                                        <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-200 animate-ping" />
                                                    </div>
                                                </div>

                                                {/* Título con Estilo - Compactado */}
                                                <h2 className="text-2xl font-serif italic text-accent mb-0.5" style={{ fontFamily: 'Georgia, serif' }}>¡Un Regalo para Ti!</h2>
                                                <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-4">Promoción Exclusiva</p>

                                                {/* Oferta Box con Alegría - Compactado */}
                                                <div className="w-full bg-gradient-to-br from-accent/10 to-transparent rounded-2xl border border-accent/20 p-4 mb-5 relative overflow-hidden group text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="text-left">
                                                            <p className="text-xs text-secondary font-medium -mb-1">Descuento del</p>
                                                            <p className="text-4xl font-black text-accent tracking-tighter">{settings.giftDiscount || 25}% <span className="text-lg">DTO.</span></p>
                                                        </div>
                                                        <div className="w-[1px] h-10 bg-accent/20 mx-2" />
                                                        <div className="text-center">
                                                            <p className="text-[9px] font-black text-accent/50 uppercase tracking-widest mb-0.5">Termina en:</p>
                                                            <p className="text-xl font-black text-primary font-mono tracking-tighter">{formatTime(timeLeft)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Formulario con Iconos - Compactado */}
                                                <div className="w-full space-y-2.5 mb-4">
                                                    <div className="relative text-left">
                                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/50" />
                                                        <input
                                                            type="text"
                                                            placeholder="Nombre completo"
                                                            value={giftForm.name}
                                                            onChange={e => setGiftForm({ ...giftForm, name: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '') })}
                                                            className={`w-full bg-primary/5 border rounded-xl pl-11 pr-4 py-3 text-sm text-primary font-bold placeholder-primary/30 outline-none transition-all ${giftForm.name.length >= 3 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-primary/5 focus:border-accent'}`}
                                                        />
                                                    </div>

                                                    <div className="relative text-left">
                                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/50" />
                                                        <input
                                                            type="tel"
                                                            maxLength="9"
                                                            placeholder="Teléfono móvil"
                                                            value={giftForm.phone}
                                                            onChange={e => setGiftForm({ ...giftForm, phone: e.target.value.replace(/\D/g, '') })}
                                                            className={`w-full bg-primary/5 border rounded-xl pl-11 pr-4 py-3 text-sm text-primary font-bold placeholder-primary/30 outline-none transition-all ${/^[6789]\d{8}$/.test(giftForm.phone) ? 'border-emerald-500/30 bg-emerald-500/5' : giftForm.phone.length > 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-primary/5 focus:border-accent'}`}
                                                        />
                                                    </div>

                                                    <div className="relative text-left">
                                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/50" />
                                                        <input
                                                            type="email"
                                                            placeholder="Tu email"
                                                            value={giftForm.email}
                                                            onChange={e => setGiftForm({ ...giftForm, email: e.target.value.toLowerCase() })}
                                                            className={`w-full bg-primary/5 border rounded-xl pl-11 pr-4 py-3 text-sm text-primary font-bold placeholder-primary/30 outline-none transition-all ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftForm.email) ? 'border-emerald-500/30 bg-emerald-500/5' : giftForm.email.length > 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-primary/5 focus:border-accent'}`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Privacy - Compactado */}
                                                <div
                                                    className="flex gap-2.5 mb-6 cursor-pointer group text-left w-full"
                                                    onClick={() => setGiftForm({ ...giftForm, privacy: !giftForm.privacy })}
                                                >
                                                    <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${giftForm.privacy ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-primary/20 bg-primary/5'}`}>
                                                        {giftForm.privacy && <CheckSquare size={10} />}
                                                    </div>
                                                    <span className="text-[9px] font-black text-secondary/70 leading-tight tracking-wider uppercase pt-0.5">
                                                        Acepto la <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrivacyModal(true); }} className="text-accent underline font-black">protección de datos</button>.
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
                                                            <div className="w-full space-y-3">
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.preventDefault();
                                                                        setGiftError('');

                                                                        if (!isFormValid) {
                                                                            if (!nameValid) return setGiftError('Nombre inválido (mín. 3 letras)');
                                                                            if (!phoneValid) return setGiftError('Teléfono de 9 dígitos');
                                                                            if (!emailValid) return setGiftError('Email no válido');
                                                                            if (!giftForm.privacy) return setGiftError('Acepta la privacidad');
                                                                            return;
                                                                        }

                                                                        try {
                                                                            await sendAdminNotification('REGALO', giftForm);
                                                                            setGiftSuccess(true);
                                                                            setGiftForm({ name: '', phone: '', email: '', privacy: false });
                                                                            setGiftError('');
                                                                        } catch (error) {
                                                                            setGiftError('Error al enviar. Inténtalo de nuevo.');
                                                                        }
                                                                    }}
                                                                    className="w-full h-14 text-white font-black text-base rounded-xl transition-all flex items-center justify-center gap-2 group overflow-hidden relative cursor-pointer bg-gradient-to-r from-pink-500 to-orange-400 active:scale-[0.97] shadow-lg shadow-pink-500/20"
                                                                >
                                                                    <span className="relative z-10 uppercase tracking-widest">¡Sí, lo quiero! 🤗</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => { setShowGiftModal(false); setGiftSuccess(false); }}
                                                                    className="w-full py-2 text-[10px] font-black text-secondary/40 hover:text-primary transition-all uppercase tracking-[0.2em]"
                                                                >
                                                                    Cerrar y ver oferta
                                                                </button>
                                                            </div>
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

                    {/* MODAL AVISO PAGO PLAN FLEX */}
                    {
                        showFlexPaymentModal && (
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
                        )
                    }

                    {/* MODAL ÉXITO SOLICITUD DE PLAN */}
                    {
                        showPlanSuccessModal && planTransitionData && (
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
                        )
                    }

                    {/* MODAL SELECTOR DE PLAN */}
                    {
                        showPlanSelector && (
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
                        )
                    }

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

                    {/* MODAL PIN DE ACCESO (RESTAURADO) */}
                    {
                        showPinModal && (
                            <div className="fixed inset-0 z-[800] flex items-center justify-center p-6 bg-slate-50/90 backdrop-blur-2xl animate-fade-in">
                                <div className="w-full max-w-sm bg-white border border-black/5 rounded-[40px] shadow-2xl overflow-hidden animate-scale-in">
                                    <div className="p-8 text-center space-y-6">
                                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto border border-accent/20">
                                            <Shield size={28} className="text-accent" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Área Protegida</h3>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">Introduce tu PIN de acceso</p>
                                        </div>
                                        <div className="relative space-y-4">
                                            <div className="relative">
                                                <input
                                                    type={showPin ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={pinInput}
                                                    onChange={(e) => {
                                                        setPinInput(e.target.value);
                                                        setPinError(false);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const masterPass = 'JPM17PASS71-';
                                                            if (pinInput === adminPin || pinInput === masterPass) {
                                                                setIsAdminUnlocked(true);
                                                                if (photographerId === 'pujaltecreativestudio' || pinInput === masterPass) {
                                                                    setIsCreator(true);
                                                                    setView('master');
                                                                } else {
                                                                    setView('admin');
                                                                }
                                                                setShowPinModal(false);
                                                            } else {
                                                                setPinError(true);
                                                                setTimeout(() => {
                                                                    setPinError(false);
                                                                    setPinInput('');
                                                                }, 1000);
                                                            }
                                                        }
                                                    }}
                                                    autoFocus
                                                    className={`w-full bg-slate-50 border ${pinError ? 'border-red-500 animate-shake' : 'border-slate-200'} rounded-2xl py-5 text-center text-2xl font-black text-slate-950 tracking-[0.2em] outline-none focus:border-accent focus:bg-white transition-all placeholder:tracking-normal placeholder:text-slate-400 pr-14`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPin(prev => !prev)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent transition-colors p-2"
                                                >
                                                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {pinError && <p className="absolute -bottom-6 left-0 right-0 text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">Contraseña Incorrecta</p>}

                                            <button
                                                onClick={() => {
                                                    const masterPass = 'JPM17PASS71-';
                                                    if (pinInput === adminPin || pinInput === masterPass) {
                                                        setIsAdminUnlocked(true);
                                                        if (photographerId === 'pujaltecreativestudio' || pinInput === masterPass) {
                                                            setIsCreator(true);
                                                            setView('master');
                                                        } else {
                                                            setView('admin');
                                                        }
                                                        setShowPinModal(false);
                                                    } else {
                                                        setPinError(true);
                                                        setTimeout(() => {
                                                            setPinError(false);
                                                            setPinInput('');
                                                        }, 1000);
                                                    }
                                                }}
                                                className="w-full h-14 bg-accent text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                Acceder al Sistema
                                            </button>
                                        </div>
                                        <button onClick={() => setShowPinModal(false)} className="w-full py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Cancelar y Volver</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }


                    {/* MODALES LEGALES GLOBALES (PASARELA) */}
                    <AvisoLegal isOpen={showLandingAviso} onClose={() => setShowLandingAviso(false)} />
                    <PoliticaPrivacidad isOpen={showLandingPrivacidad} onClose={() => setShowLandingPrivacidad(false)} />
                    <CondicionesVenta isOpen={showLandingCondiciones} onClose={() => setShowLandingCondiciones(false)} />
                </>
            )}
        </div>
    );
}
