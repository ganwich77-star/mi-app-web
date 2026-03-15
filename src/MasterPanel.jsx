import React, { useState, useEffect } from 'react';
import { db } from './firebase.js';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import {
    Users, Shield, AlertTriangle, CheckCircle, Globe,
    Settings, Search, ArrowLeft, ExternalLink, Activity, Edit, X, Save,
    MessageSquare, Copy, Sparkles, Trash2, QrCode, Download, Mail, FileText, Upload
} from 'lucide-react';
import { deleteDoc } from 'firebase/firestore';
import BulkUploadModal from './components/admin/BulkUploadModal.jsx';

// Componente Error Boundary simple para depuración en vivo
function MasterErrorBoundary({ children }) {
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        const handleError = (e) => {
            console.error("Master Error:", e);
            setError(e.message || "Error desconocido");
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (error) {
        return (
            <div className="fixed inset-0 z-[999] bg-slate-950 p-10 font-mono text-red-400 overflow-auto">
                <h1 className="text-2xl font-black mb-4 uppercase">⚠️ Falla Crítica Detectada</h1>
                <p className="bg-red-400/10 p-4 rounded-xl border border-red-500/20">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs"
                >
                    Reintentar Carga
                </button>
            </div>
        );
    }
    return children;
}

export default function MasterPanel({ onBack }) {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPhotographer, setEditingPhotographer] = useState(null);
    const [editData, setEditData] = useState({});
    const [qrPhotographer, setQrPhotographer] = useState(null);
    const [mailModal, setMailModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isClientsOpen, setIsClientsOpen] = useState(false);
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [billingSearch, setBillingSearch] = useState('');
    const [invoicePreview, setInvoicePreview] = useState(null);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [targetPhotographerForUpload, setTargetPhotographerForUpload] = useState(null);

    const emailTemplates = [
        {
            title: "Bienvenida y Accesos",
            subject: "¡Bienvenido a tu nueva App de Orlas Interactivas! 🎉",
            body: (brand) => `¡Hola equipo de ${brand}! 👋\n\nBienvenidos a vuestra nueva plataforma integral de gestión de orlas escolares. Nos alegra comunicaros que vuestra cuenta ya está activada y lista para usarse.\n\nPodéis acceder a vuestro panel de control desde el enlace proporcionado y comenzar a dar de alta vuestros primeros centros y alumnos.\n\nSi tenéis cualquier duda o consulta durante los primeros pasos, estamos a vuestra entera disposición para ayudaros.\n\nUn saludo y mucho éxito en esta campaña,\nEl equipo técnico 🚀.`
        },
        {
            title: "Recordatorio de Pago",
            subject: "Recordatorio: Pago Pendiente - Suscripción App Orlas 🔔",
            body: (brand) => `Hola ${brand} 👋,\n\nOs escribimos desde el departamento de cobros para recordaros amistosamente que tenéis pendiente el abono de vuestra suscripción actual en la App de Orlas.\n\nPor favor, os rogamos que realicéis el ingreso a la mayor brevedad posible para que todo siga funcionando con normalidad y sin interrupciones en el servicio a vuestros clientes.\n\nQuedamos a la espera, muchas gracias.\nEquipo Administrativo.`
        },
        {
            title: "Aviso de Cierre de Cuenta",
            subject: "AVISO IMPORTANTE: Suspensión inminente de cuenta por impago ⚠️",
            body: (brand) => `Hola ${brand},\n\nLamentamos tener que informarte que, tras varios avisos sobre el estado irregular de vuestra cuenta y debido a la falta de pago prolongada, nos veremos en la obligación de suspender de forma cautelar y temporal el acceso a la plataforma.\n\nSi no se regulariza la situación en las próximas horas, el acceso será denegado automáticamente por el servidor.\n\nPor favor, contacta con nosotros si ha habido algún error.\n\nUn saludo.`
        },
        {
            title: "Novedades y Actualizaciones",
            subject: "¡Nuevas funciones disponibles en tu App! 🛠️",
            body: (brand) => `Hola ${brand} 👋,\n\nDesde el equipo de desarrollo no paramos de trabajar para que tengas la mejor herramienta. Te escribimos para avisarte de que hemos lanzado una nueva actualización automática en tu App con novedades muy interesantes.\n\nTe invitamos a entrar y descubrirlas en tu panel de control.\n\nUn saludo,\nEquipo de Desarrollo.`
        }
    ];

    const handleSendMail = (p, template) => {
        const dest = p.notificationEmail || p.email || 'correo@ejemplo.com';
        const subject = encodeURIComponent(template.subject);
        const body = encodeURIComponent(template.body(p.brandName || p.id).trim());
        window.open(`mailto:${dest}?subject=${subject}&body=${body}`, '_blank');
        setMailModal(null);
    };

    useEffect(() => {
        const colRef = collection(db, 'orlas2026_photographers');
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const list = [];
            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setPhotographers(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            // Actualizamos en la ruta de configuración para el funcionamiento interno
            const configRef = doc(db, 'orlas2026_photographers', id, 'config', 'main');
            await updateDoc(configRef, { isSuspended: !currentStatus });

            // Actualizamos también en el documento raíz para que se refleje en la lista del MasterPanel
            const rootRef = doc(db, 'orlas2026_photographers', id);
            await updateDoc(rootRef, { isSuspended: !currentStatus });
        } catch (error) {
            console.error("Error actualizando estado:", error);
        }
    };

    const togglePaidStatus = async (id, currentPaidStatus) => {
        try {
            const configRef = doc(db, 'orlas2026_photographers', id, 'config', 'main');
            await updateDoc(configRef, { isPaid: !currentPaidStatus });

            const rootRef = doc(db, 'orlas2026_photographers', id);
            await updateDoc(rootRef, { isPaid: !currentPaidStatus });
        } catch (error) {
            console.error("Error actualizando pago:", error);
        }
    };

    const handleEdit = (p) => {
        setEditingPhotographer(p);
        setEditData({
            brandName: p.brandName || '',
            notificationEmail: p.notificationEmail || '',
            adminPin: p.adminPin || '7373',
            giftDiscount: p.giftDiscount || 25,
            fiscalName: p.fiscalName || '',
            cif: p.cif || '',
            address: p.address || '',
            postalCode: p.postalCode || '',
            city: p.city || '',
            province: p.province || '',
            plan: p.plan || 'starter',
            isPaid: p.isPaid || false
        });
    };

    const saveEdit = async () => {
        try {
            const docRef = doc(db, 'orlas2026_photographers', editingPhotographer.id, 'config', 'main');
            await updateDoc(docRef, editData);

            const rootRef = doc(db, 'orlas2026_photographers', editingPhotographer.id);
            await updateDoc(rootRef, {
                brandName: editData.brandName,
                plan: editData.plan,
                isPaid: editData.isPaid
            });

            setEditingPhotographer(null);
        } catch (error) {
            console.error("Error guardando cambios:", error);
        }
    };

    const handleDelete = async (id) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = async () => {
        const id = deleteConfirm;
        try {
            console.log("Intentando eliminar fotógrafo:", id);

            // 1. Borrar documento de configuración primero
            const configRef = doc(db, 'orlas2026_photographers', id, 'config', 'main');
            await deleteDoc(configRef);
            console.log("Configuración borrada");

            // 2. Borrar documento raíz (esto es lo que lo quita de la lista)
            const rootRef = doc(db, 'orlas2026_photographers', id);
            console.log("Documento raíz borrado");

            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error crítico al eliminar:", error);
        }
    };

    const filteredClients = (photographers || []).filter(p => {
        if (!p || !p.id) return false;
        const search = (clientSearch || '').toLowerCase();
        const idMatch = p.id.toLowerCase().includes(search);
        const brandMatch = p.brandName && p.brandName.toLowerCase().includes(search);
        return idMatch || brandMatch;
    });

    const filteredBilling = (photographers || []).filter(p => {
        if (!p || !p.id) return false;
        const search = (billingSearch || '').toLowerCase();
        const idMatch = p.id.toLowerCase().includes(search);
        const brandMatch = p.brandName && p.brandName.toLowerCase().includes(search);
        return idMatch || brandMatch;
    });

    // Sub-componente para calcular las estadísticas de cada fotógrafo de manera eficiente
    const PhotographerStats = ({ id }) => {
        const [counts, setCounts] = useState({ students: 0, staff: 0, loading: true });

        useEffect(() => {
            let isMounted = true;
            const fetchStats = async () => {
                try {
                    const ordersRef = collection(db, 'orlas2026_photographers', id, 'orders');
                    const staffRef = collection(db, 'orlas2026_photographers', id, 'staff');

                    const [ordersSnap, staffSnap] = await Promise.all([
                        getDocs(ordersRef),
                        getDocs(staffRef)
                    ]);

                    let students = 0;
                    ordersSnap.forEach(d => { students += (d.data().items || []).length; });

                    let staffCount = 0;
                    staffSnap.forEach(d => { staffCount += (d.data().items || []).length; });

                    if (isMounted) {
                        setCounts({ students, staff: staffCount, loading: false });
                    }
                } catch (err) {
                    console.error("Error obteniendo estadísticas para", id, err);
                    if (isMounted) setCounts({ students: 0, staff: 0, loading: false });
                }
            };
            fetchStats();
            return () => { isMounted = false; };
        }, [id]);

        if (counts.loading) return <div className="text-[10px] uppercase text-white/20 font-black animate-pulse">Cargando...</div>;

        return (
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-black text-white">{counts.students}</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Niños</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className="text-xs font-black text-white">{counts.staff}</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Docentes</span>
                </div>
            </div>
        );
    };

    // Nuevo componente para cargar el logo desde la sub-colección config/main
    const PhotographerBranding = () => {
        return (
            <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                <Globe size={18} className="text-white/20" />
            </div>
        );
    };

    const getInvoiceHTML = (p) => {
        const amount = p.plan === 'pro' ? 449 : p.plan === 'flex' ? 249 : 149;
        const iva = (amount * 0.21).toFixed(2);
        const base = amount.toFixed(2);
        const total = (parseFloat(base) + parseFloat(iva)).toFixed(2);
        const currentYear = new Date().getFullYear();
        const currentDateFormatted = new Intl.DateTimeFormat('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(new Date());

        const emisor = {
            name: 'PUJALTE CREATIVE STUDIO',
            legalName: 'PujalteFotografía',
            cif: '48427310M',
            address: 'C/ CHILE nº 21, 30565, Las Torres de Cotillas, Murcia',
            email: 'hola@pujaltefotografia.es',
            web: 'www.pujalte.studio'
        };

        const bank = {
            titular: 'JOSE PUJALTE MOLINA',
            iban: 'ES75 0081 1117 1100 0113 4919',
            entidad: 'Banco Sabadell'
        };

        const color = '#4F46E5';

        return `
            <!DOCTYPE html>
            <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>FAC-ORLAS2026</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm;
                        }
                        @media print {
                            body { background-color: white !important; }
                            .no-print { display: none !important; }
                            .print-m-0 { margin: 0 !important; }
                            .print-shadow-none { box-shadow: none !important; }
                            .invoice-card { max-height: 285mm; width: 100% !important; border: none !important; }
                        }
                        body { 
                            font-family: 'Outfit', sans-serif;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            background-color: #f8fafc;
                        }
                        .premium-gradient {
                            background: linear-gradient(135deg, ${color} 0%, #312E81 100%);
                        }
                    </style>
                </head>
                <body class="p-4 md:p-8">
                    <div class="max-w-[210mm] mx-auto bg-white shadow-2xl overflow-hidden print-shadow-none print-m-0 rounded-xl invoice-card border border-slate-100 p-0.5">
                        <div class="h-1.5 w-full premium-gradient"></div>

                        <div class="p-6">
                            <!-- Header Superior -->
                            <div class="flex flex-col md:flex-row justify-between items-start mb-6">
                                <div class="w-full md:max-w-xl text-left">
                                    <div class="space-y-0 text-slate-500 text-left">
                                        <h1 class="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                                            ${emisor.name}
                                        </h1>
                                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center gap-4">
                                            <div class="space-y-0.5">
                                                <p class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Datos Legales</p>
                                                <p class="font-bold text-slate-800 text-xs">${emisor.legalName}</p>
                                                <div class="flex items-center gap-2 text-xs font-medium">
                                                    <span class="text-slate-400 font-bold">NIF/CIF:</span>
                                                    <span class="text-slate-700 font-bold">${emisor.cif}</span>
                                                </div>
                                                <p class="text-xs text-slate-600 leading-tight max-w-xs">${emisor.address}</p>
                                            </div>
                                            <div class="flex-shrink-0">
                                                <img src="/graduaciones2026/logos/logo_negro.png" alt="Logo" class="w-32 h-auto" />
                                            </div>
                                        </div>
                                        <div class="pt-2 flex flex-col gap-0.5 text-[10px] font-bold text-indigo-600">
                                            <p>${emisor.email}</p>
                                            <p>${emisor.web}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-4 md:mt-0 text-right min-w-[200px] flex flex-col items-end">
                                    <div class="mb-6">
                                        <h2 class="text-5xl font-black text-slate-100 uppercase tracking-tighter leading-none select-none">FACTURA</h2>
                                        <p class="text-indigo-600 font-black text-[10px] tracking-[0.4em] uppercase -mt-2 pr-1">Centro de Control</p>
                                    </div>

                                    <div class="space-y-2">
                                        <div class="border-r-4 border-indigo-600 pr-4 mr-1">
                                            <p class="text-[8px] text-slate-400 uppercase tracking-[0.2em] font-black">Cód. Operación</p>
                                            <p class="font-mono text-lg font-black text-slate-900">FAC-ORLAS2026</p>
                                        </div>
                                        <div>
                                            <p class="text-[8px] text-slate-400 uppercase tracking-[0.2em] font-black">Fecha de Registro</p>
                                            <p class="font-bold text-slate-700 text-sm">${currentDateFormatted}</p>
                                        </div>
                                        <div class="bg-indigo-50 p-2 rounded-lg border border-indigo-100 inline-block w-full">
                                            <p class="text-[8px] text-indigo-400 uppercase tracking-[0.2em] font-black">Campaña Activa</p>
                                            <p class="font-black text-indigo-700 text-[10px]">Graduaciones ESCOLARES ${currentYear}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <!-- Cliente -->
                            <div class="grid md:grid-cols-2 gap-4 mb-6">
                                <div class="bg-slate-900 p-4 rounded-xl border border-white/5 relative overflow-hidden text-left">
                                    <p class="text-[8px] uppercase tracking-[0.3em] font-black text-indigo-400 mb-2">Fotógrafo Registrado</p>
                                    <h3 class="text-lg font-black text-white mb-1 tracking-tighter capitalize">${p.fiscalName || p.brandName || p.id}</h3>
                                    <div class="text-xs text-slate-400 space-y-1 font-medium">
                                        <p class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> CIF/NIF: ${p.cif || '---'}</p>
                                        <p class="flex items-start gap-2 leading-tight"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></span> ${p.address || 'Pendiente de dirección'}</p>
                                        <p class="flex items-center gap-2 leading-tight"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> ${p.postalCode || ''} ${p.city || ''}</p>
                                    </div>
                                </div>
                                
                                <div class="flex flex-col justify-center items-end text-right pr-6 space-y-2">
                                    <h4 class="text-lg font-bold text-indigo-600 leading-tight">La tecnología al servicio de los recuerdos</h4>
                                    <p class="text-xs text-slate-400 font-medium max-w-xs leading-tight italic">Este documento certifica la activación de licencia en la plataforma Orlas 2026.</p>
                                    <div class="pt-2 flex items-center gap-2">
                                        <span class="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                                        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-600">Licencia Verificada</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabla de Items -->
                            <div class="mb-8 overflow-hidden rounded-lg border border-slate-100 text-left">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-slate-50 border-b-2 border-slate-200 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                                            <th class="py-3 px-4">Descripción del Servicio</th>
                                            <th class="py-3 px-4 text-center w-24">Cant.</th>
                                            <th class="py-3 px-4 text-right w-40">Precio</th>
                                            <th class="py-3 px-4 text-right w-40">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td class="py-4 px-4">
                                                <p class="font-bold text-slate-700 text-sm">Licencia App Orlas 2026 - Plan ${p.plan?.toUpperCase() || 'STARTER'}</p>
                                            </td>
                                            <td class="py-4 px-4 text-center font-bold text-slate-700 text-sm">1</td>
                                            <td class="py-4 px-4 text-right font-mono text-slate-600 font-bold text-sm">${base}€</td>
                                            <td class="py-4 px-4 text-right font-black font-mono text-slate-900 text-base">${base}€</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Resumen y Pago -->
                            <div class="flex flex-col md:flex-row justify-between items-stretch gap-6 pt-2">
                                <div class="flex-1 bg-slate-900 text-white p-4 rounded-lg border-l-4 text-left" style="border-color: ${color}">
                                    <p class="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400 mb-3 flex items-center gap-2">
                                        Información de Pago
                                    </p>
                                    <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                                        <div class="border-b border-slate-800 pb-1.5 col-span-2">
                                            <p class="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Titular</p>
                                            <p class="text-xs font-bold text-white leading-none">${bank.titular}</p>
                                        </div>
                                        <div class="border-b border-slate-800 pb-1.5">
                                            <p class="text-[8px] text-slate-500 uppercase tracking-wider font-bold">IBAN</p>
                                            <p class="text-xs font-mono font-black text-white leading-none tracking-tight">${bank.iban}</p>
                                        </div>
                                        <div class="border-b border-slate-800 pb-1.5">
                                            <p class="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Entidad</p>
                                            <p class="text-xs font-bold text-slate-300 leading-none">${bank.entidad}</p>
                                        </div>
                                    </div>
                                    <p class="text-[8px] text-indigo-300/60 uppercase font-black tracking-widest mt-4 bg-indigo-500/10 p-2 rounded border border-indigo-500/20 inline-block leading-none">
                                        ⚠️ Incluir nº factura en concepto
                                    </p>
                                </div>

                                <div class="w-full md:w-64 space-y-1.5 px-4 text-right">
                                    <div class="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <span>Base Neto</span>
                                        <span class="font-mono text-slate-900">${base}€</span>
                                    </div>
                                    <div class="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <span>IVA Incl.</span>
                                        <span class="font-mono text-slate-900">${iva}€</span>
                                    </div>
                                    <div class="flex justify-between items-center pt-3 border-t-2 border-slate-900 mt-2" style="color: ${color}">
                                        <span class="text-lg font-black uppercase tracking-tighter">TOTAL</span>
                                        <span class="text-3xl font-black font-mono tracking-tighter">${total}€</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer LOPD -->
                            <div class="mt-8 pt-4 border-t border-slate-100">
                                <div class="flex flex-col md:flex-row gap-6 items-start">
                                    <div class="flex-1 text-left">
                                        <p class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">RGPD / LOPD</p>
                                        <p class="text-[10px] text-slate-400 leading-tight">
                                            PujalteFotografía tratará sus datos para la gestión administrativa y fiscal. Derechos: hola@pujaltefotografia.es.
                                        </p>
                                    </div>
                                    
                                    <div class="text-right shrink-0">
                                        <p class="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                            © ${currentYear} ${emisor.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 text-center no-print pb-8">
                            <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-black transition-all shadow-lg uppercase tracking-widest text-xs flex items-center gap-3 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                Imprimir o Guardar PDF
                            </button>
                        </div>
                    </div>
                </body>
            </html>
        `;
    };

    const handleDownloadInvoice = (p) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(getInvoiceHTML(p));
        printWindow.document.close();
    };


    return (
        <MasterErrorBoundary>
            <div className="min-h-screen bg-[#020617] text-white p-6 font-sans relative">
                <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 md:gap-5">
                        <button onClick={onBack} className="p-3 md:p-4 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 border border-white/5 shadow-xl shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <ArrowLeft size={20} className="text-white md:size-[22px]" />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3">
                                <Shield className="text-indigo-400 shrink-0" size={20} />
                                <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter truncate">Centro de Control</h1>
                            </div>
                            <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2 truncate">Gestión Global de Fotógrafos</p>
                        </div>
                    </div>



                    <div className="relative w-full md:min-w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar fotógrafo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900 border-2 border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-indigo-500/50 transition-all w-full font-bold text-white placeholder:text-slate-600 shadow-inner text-sm md:text-base"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-[24px] md:rounded-[30px] flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                            <Users size={20} className="md:size-[24px]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">Clientes</p>
                            <p className="text-lg md:text-2xl font-black">{photographers.length}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-[24px] md:rounded-[30px] flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                            <Activity size={20} className="md:size-[24px]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">Activos</p>
                            <p className="text-lg md:text-2xl font-black">{photographers.filter(p => !p.isSuspended).length}</p>
                        </div>
                    </div>
                    <div className="col-span-2 lg:col-span-1 bg-white/5 border border-white/10 p-4 md:p-6 rounded-[24px] md:rounded-[30px] flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                            <AlertTriangle size={20} className="md:size-[24px]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">Suspendidos</p>
                            <p className="text-lg md:text-2xl font-black">{photographers.filter(p => p.isSuspended).length}</p>
                        </div>
                    </div>
                </div>

                {/* Demo Sharing Section */}
                <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700" />
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10 text-center md:text-left">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-2xl shadow-indigo-500/20 text-indigo-600 shrink-0">
                            <Sparkles size={28} className="md:size-[32px]" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h3 className="text-lg md:text-2xl font-black tracking-tight leading-none uppercase md:normal-case">Compartir Demo</h3>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-[8px] font-black uppercase tracking-widest">Nuevo</span>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm font-bold mt-2 max-w-[280px] md:max-w-none">Envía el acceso de prueba a otros compañeros fotógrafos</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:justify-center gap-3 md:gap-4 relative z-10 w-full lg:w-auto">
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${import.meta.env.BASE_URL}?f=demo_photographer&view=user&demo=true`;
                                window.open(url, '_blank');
                            }}
                            className="bg-indigo-600 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 min-h-[48px]"
                        >
                            <ExternalLink size={14} className="md:size-[16px]" /> Ver App
                        </button>

                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${import.meta.env.BASE_URL}?f=demo_photographer&view=user&demo=true`;
                                navigator.clipboard.writeText(url);
                            }}
                            className="bg-slate-900 border border-white/10 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 min-h-[48px]"
                        >
                            <Copy size={14} className="md:size-[16px]" /> Copiar
                        </button>

                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${import.meta.env.BASE_URL}?f=demo_photographer&view=user&demo=true`;
                                const msg = `¡Hola! He pensado que te gustaría probar la nueva app de gestión de orlas que estoy usando. Te paso el enlace a la versión demo para que le eches un vistazo:\n\n🔗 ${url}\n\n¡Ya me dirás qué te parece!`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="col-span-2 md:col-auto bg-emerald-600 px-6 md:px-8 py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95 min-h-[48px]"
                        >
                            <MessageSquare size={14} className="md:size-[16px]" /> Enviar WhatsApp
                        </button>
                    </div>
                </div>

                {/* Sección CLIENTES */}
                <div className="bg-white/5 border border-white/10 rounded-[35px] overflow-hidden backdrop-blur-xl">
                    <button 
                        onClick={() => setIsClientsOpen(!isClientsOpen)}
                        className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all ${isClientsOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-400'}`}>
                                <Users size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Gestión de Clientes</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Fotógrafos registrados, estados y accesos</p>
                            </div>
                        </div>
                        <div className={`transition-transform duration-500 ${isClientsOpen ? 'rotate-180' : ''}`}>
                            <Users size={20} className="text-white/20" />
                        </div>
                    </button>
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isClientsOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-4 border-t border-white/5 space-y-4">
                            {/* Búsqueda Clientes */}
                            <div className="relative w-full max-w-md mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente por nombre o ID..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600 text-sm"
                                />
                                {clientSearch && (
                                    <button 
                                        onClick={() => setClientSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Fotógrafo / Plan</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Registros</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Acceso / Estado</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Pago Suscrip.</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-white/20 font-bold">Cargando datos...</td></tr>
                                        ) : filteredClients.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-white/20 font-bold">No se han encontrado resultados</td></tr>
                                        ) : filteredClients.map(p => (
                                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <PhotographerBranding id={p.id} />
                                                        <div className="flex flex-col">
                                                            <p className="font-black text-lg tracking-tight leading-none uppercase">{p.id}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${p.plan === 'starter' ? 'bg-slate-500 text-white' :
                                                                    p.plan === 'flex' ? 'bg-indigo-500 text-white' :
                                                                        p.plan === 'pro' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                                                    }`}>Plan {p.plan || 'starter'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <PhotographerStats id={p.id} />
                                                </td>
                                                <td className="px-6 py-6">
                                                    {p.isSuspended ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider border border-red-500/20">
                                                            <AlertTriangle size={12} /> ACCESO CERRADO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                                                            <CheckCircle size={12} /> ACCESO ACTIVO
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <button
                                                        onClick={() => togglePaidStatus(p.id, p.isPaid)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${p.isPaid
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                                                            }`}
                                                    >
                                                        {p.isPaid ? 'CONFIRMADO' : 'PENDIENTE'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setMailModal(p)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 hover:text-blue-400 transition-all border border-white/5"
                                                            title="Enviar Email (Plantillas)"
                                                        >
                                                            <Mail size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleEdit(p)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 hover:text-indigo-400 transition-all border border-white/5"
                                                            title="Editar Datos"
                                                        >
                                                            <Edit size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() => setQrPhotographer(p)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 hover:text-amber-400 transition-all border border-white/5"
                                                            title="Descargar QR"
                                                        >
                                                            <QrCode size={14} />
                                                        </button>

                                                        <a
                                                            href={`${window.location.pathname}?f=${p.id}&view=user`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 hover:text-emerald-400 transition-all border border-white/5"
                                                            title="Ver App"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>

                                                        <button
                                                            onClick={() => {
                                                                setTargetPhotographerForUpload(p.id);
                                                                setIsBulkUploadOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 text-indigo-400 transition-all border border-indigo-500/20"
                                                            title="Subida Masiva de Fotos"
                                                        >
                                                            <Upload size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() => toggleStatus(p.id, p.isSuspended)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${p.isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                                                        >
                                                            {p.isSuspended ? 'Abrir' : 'Cerrar'}
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                            title="Eliminar Registro"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección FACTURACIÓN */}
                <div className="bg-white/5 border border-white/10 rounded-[35px] overflow-hidden backdrop-blur-xl">
                    <button 
                        onClick={() => setIsBillingOpen(!isBillingOpen)}
                        className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all ${isBillingOpen ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-slate-800 text-slate-400'}`}>
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Facturación y Planes</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Suscripciones, pagos y facturas PDF</p>
                            </div>
                        </div>
                        <div className={`transition-transform duration-500 ${isBillingOpen ? 'rotate-180' : ''}`}>
                            <FileText size={20} className="text-white/20" />
                        </div>
                    </button>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isBillingOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-4 border-t border-white/5 space-y-4">
                            {/* Búsqueda Facturación */}
                            <div className="relative w-full max-w-md mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar facturación por cliente o ID..."
                                    value={billingSearch}
                                    onChange={(e) => setBillingSearch(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-violet-500/50 transition-all font-bold text-white placeholder:text-slate-600 text-sm"
                                />
                                {billingSearch && (
                                    <button 
                                        onClick={() => setBillingSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Cliente</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Plan Contratado</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Estado de Pago</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Documentación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-white/20 font-bold">Cargando datos...</td></tr>
                                        ) : filteredBilling.length === 0 ? (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-white/20 font-bold">No se han encontrado resultados</td></tr>
                                        ) : filteredBilling.map(p => (
                                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm uppercase text-white tracking-tight">{p.brandName || p.id}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold">{p.email || p.id + '@basecode.es'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                                                        p.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' :
                                                        p.plan === 'flex' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                        {p.plan?.toUpperCase() || 'STARTER'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 font-mono text-[10px] font-bold">
                                                    {p.isPaid ? (
                                                        <span className="text-emerald-500">PAGADO</span>
                                                    ) : (
                                                        <span className="text-amber-500">PENDIENTE</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => setInvoicePreview(p)}
                                                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all border border-indigo-500/20 group flex items-center gap-2"
                                                            title="Vista Previa"
                                                        >
                                                            <Search size={14} className="group-hover:scale-110 transition-transform" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Vista Previa</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadInvoice(p)}
                                                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all border border-emerald-500/20 group flex items-center gap-2"
                                                            title="Descargar PDF"
                                                        >
                                                            <Download size={14} className="group-hover:scale-110 transition-transform" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Modal de Edición */}
            {
                editingPhotographer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
                        <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <Edit className="text-indigo-400" size={20} />
                                    <h2 className="text-xl font-black uppercase tracking-tighter">Editar Fotógrafo</h2>
                                </div>
                                <button onClick={() => setEditingPhotographer(null)} className="p-2 text-white/40 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Nombre de Marca</label>
                                        <input
                                            type="text"
                                            value={editData.brandName}
                                            onChange={e => setEditData({ ...editData, brandName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Email de Notificaciones</label>
                                        <input
                                            type="email"
                                            value={editData.notificationEmail}
                                            onChange={e => setEditData({ ...editData, notificationEmail: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">PIN de Administración</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={editData.adminPin}
                                            onChange={e => setEditData({ ...editData, adminPin: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-center tracking-widest outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">% Regalo Comercial</label>
                                        <input
                                            type="number"
                                            value={editData.giftDiscount}
                                            onChange={e => setEditData({ ...editData, giftDiscount: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-center outline-none focus:border-indigo-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Plan Contratado</label>
                                        <select
                                            value={editData.plan}
                                            onChange={e => setEditData({ ...editData, plan: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="starter" className="bg-slate-900">STARTER</option>
                                            <option value="flex" className="bg-slate-900">FLEX</option>
                                            <option value="pro" className="bg-slate-900">PRO</option>
                                            <option value="custom" className="bg-slate-900">CUSTOM</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Estado de Pago</label>
                                        <select
                                            value={editData.isPaid ? 'paid' : 'pending'}
                                            onChange={e => setEditData({ ...editData, isPaid: e.target.value === 'paid' })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="paid" className="bg-slate-900">PAGADO (Confirmado)</option>
                                            <option value="pending" className="bg-slate-900">PENDIENTE (Bloqueado)</option>
                                        </select>
                                    </div>

                                    {/* Campos de Facturación */}
                                    <div className="col-span-2 pt-4 border-t border-white/5">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Datos de Facturación</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Nombre Fiscal / Razón Social</label>
                                        <input
                                            type="text"
                                            value={editData.fiscalName}
                                            onChange={e => setEditData({ ...editData, fiscalName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">CIF / NIF</label>
                                        <input
                                            type="text"
                                            value={editData.cif}
                                            onChange={e => setEditData({ ...editData, cif: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">C.P.</label>
                                        <input
                                            type="text"
                                            value={editData.postalCode}
                                            onChange={e => setEditData({ ...editData, postalCode: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Dirección</label>
                                        <input
                                            type="text"
                                            value={editData.address}
                                            onChange={e => setEditData({ ...editData, address: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Ciudad</label>
                                        <input
                                            type="text"
                                            value={editData.city}
                                            onChange={e => setEditData({ ...editData, city: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Provincia</label>
                                        <input
                                            type="text"
                                            value={editData.province}
                                            onChange={e => setEditData({ ...editData, province: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                <button
                                    onClick={() => setEditingPhotographer(null)}
                                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all text-white/60"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Modal de QR */}
            {qrPhotographer && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
                    <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-slide-up text-center">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <QrCode className="text-amber-400" size={20} />
                                <h2 className="text-xl font-black uppercase tracking-tighter text-left">Código QR Acceso</h2>
                            </div>
                            <button onClick={() => setQrPhotographer(null)} className="p-2 text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-indigo-500/20 relative group">
                                <img
                                    id="qr-image"
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?f=${qrPhotographer.id}&view=user`)}`}
                                    alt="QR Code"
                                    className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]">
                                    <Sparkles className="text-indigo-400" size={32} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-lg font-black uppercase tracking-tight">{qrPhotographer.brandName || qrPhotographer.id}</p>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{`ID: ${qrPhotographer.id}`}</p>
                            </div>

                            <button
                                onClick={async () => {
                                    const url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?f=${qrPhotographer.id}&view=user`)}`;
                                    try {
                                        const response = await fetch(url);
                                        const blob = await response.blob();
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = `QR_ACCESO_${qrPhotographer.id.toUpperCase()}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(blobUrl);
                                    } catch (err) {
                                        window.open(url, '_blank');
                                    }
                                }}
                                className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 group"
                            >
                                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Descargar Calidad Alta
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <p className="text-slate-600 text-[9px] font-bold uppercase tracking-wider">Escanea para acceder directamente a la toma de datos</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Confirmación de Borrado Premium */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
                    <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto border-4 border-red-500/20 mb-4 animate-pulse">
                                <AlertTriangle size={40} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">¿Eliminar Fotógrafo?</h3>
                                <p className="text-red-400 font-black text-xs uppercase tracking-widest">{deleteConfirm}</p>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    Esta acción es definitiva. Se borrará el acceso y la configuración, aunque los pedidos históricos se mantendrán por seguridad.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all text-white/60"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-600/30 transition-all active:scale-95"
                                >
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Plantillas de Email */}
            {mailModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
                    <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <Mail className="text-blue-400" size={20} />
                                <h2 className="text-xl font-black uppercase tracking-tighter">Comunicación Rápida</h2>
                            </div>
                            <button onClick={() => setMailModal(null)} className="p-2 text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <p className="text-slate-400 text-xs md:text-sm mb-6">
                                Selecciona una plantilla para abrirla directamente en tu gestor de correo predeterminado, dirigida a <strong className="text-white">{mailModal.notificationEmail || mailModal.email || 'el correo principal'}</strong>:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {emailTemplates.map((template, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMail(mailModal, template)}
                                        className="text-left bg-white/5 border border-white/10 p-5 rounded-[24px] hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                                    >
                                        <h4 className="text-blue-400 font-black uppercase text-xs md:text-sm mb-2 group-hover:text-blue-300 transition-colors">
                                            {template.title}
                                        </h4>
                                        <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed line-clamp-3">
                                            {template.body(mailModal.brandName || mailModal.id).replace(/\n/g, ' ')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Vista Previa de Factura */}
            {invoicePreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl">
                    <div className="bg-slate-900 w-full max-w-5xl h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                        {/* Header Modal */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <FileText size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-tighter">Vista Previa de Factura</h3>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] italic">
                                        ID Operación: FAC-2026-{invoicePreview?.id?.toUpperCase() || 'ERROR'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setInvoicePreview(null)}
                                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Iframe Contenido */}
                        <div className="flex-1 bg-slate-100 overflow-hidden relative">
                            <iframe 
                                srcDoc={invoicePreview ? getInvoiceHTML(invoicePreview) : ''}
                                className="w-full h-full border-none"
                                title="Invoice Preview"
                            />
                        </div>

                        {/* Footer Modal con acciones */}
                        <div className="p-4 border-t border-white/5 bg-slate-900/80 flex justify-end gap-3">
                            <button 
                                onClick={() => setInvoicePreview(null)}
                                className="px-6 py-2.5 rounded-xl text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                            >
                                Cerrar
                            </button>
                            <button 
                                onClick={() => {
                                    if (invoicePreview) {
                                        handleDownloadInvoice(invoicePreview);
                                        setInvoicePreview(null);
                                    }
                                }}
                                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                            >
                                <Download size={14} />
                                Abrir para Impresión
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <BulkUploadModal 
                isOpen={isBulkUploadOpen}
                onClose={() => setIsBulkUploadOpen(false)}
                photographerId={targetPhotographerForUpload}
                schools={photographers}
            />
        </div>
    </MasterErrorBoundary>
    );
}
