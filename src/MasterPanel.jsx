import React, { useState, useEffect } from 'react';
import { db } from './firebase.js';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import {
    Users, Shield, AlertTriangle, CheckCircle, Globe,
    Settings, Search, ArrowLeft, ExternalLink, Activity, Edit, X, Save,
    MessageSquare, Copy, Sparkles, Trash2, QrCode, Download, Mail
} from 'lucide-react';
import { deleteDoc } from 'firebase/firestore';

export default function MasterPanel({ onBack }) {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPhotographer, setEditingPhotographer] = useState(null);
    const [editData, setEditData] = useState({});
    const [qrPhotographer, setQrPhotographer] = useState(null);
    const [mailModal, setMailModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Nuevo estado para el modal de borrado

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

    const filtered = photographers.filter(p =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
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
                                const url = `https://basecode.es/graduaciones2026/?f=demo_photographer&view=user&demo=true`;
                                window.open(url, '_blank');
                            }}
                            className="bg-indigo-600 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 min-h-[48px]"
                        >
                            <ExternalLink size={14} className="md:size-[16px]" /> Ver App
                        </button>

                        <button
                            onClick={() => {
                                const url = `https://basecode.es/graduaciones2026/?f=demo_photographer&view=user&demo=true`;
                                navigator.clipboard.writeText(url);
                            }}
                            className="bg-slate-900 border border-white/10 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 min-h-[48px]"
                        >
                            <Copy size={14} className="md:size-[16px]" /> Copiar
                        </button>

                        <button
                            onClick={() => {
                                const url = `https://basecode.es/graduaciones2026/?f=demo_photographer&view=user&demo=true`;
                                const msg = `¡Hola! He pensado que te gustaría probar la nueva app de gestión de orlas que estoy usando. Te paso el enlace a la versión demo para que le eches un vistazo:\n\n🔗 ${url}\n\n¡Ya me dirás qué te parece!`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="col-span-2 md:col-auto bg-emerald-600 px-6 md:px-8 py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95 min-h-[48px]"
                        >
                            <MessageSquare size={14} className="md:size-[16px]" /> Enviar WhatsApp
                        </button>
                    </div>
                </div>

                {/* Table */}
                < div className="bg-white/5 border border-white/10 rounded-[35px] overflow-hidden backdrop-blur-xl" >
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
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-white/20 font-bold">Cargando datos...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-white/20 font-bold">No se han encontrado resultados</td></tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                                                    {p.logoUrl ? (
                                                        <img src={p.logoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
                                                    ) : (
                                                        <Globe size={20} className="text-white/20" />
                                                    )}
                                                </div>
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
                </div >
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
        </div >

    );
}
