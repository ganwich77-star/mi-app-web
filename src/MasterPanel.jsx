import React, { useState, useEffect } from 'react';
import { db } from './firebase.js';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import {
    Users, Shield, AlertTriangle, CheckCircle, Globe,
    Settings, Search, ArrowLeft, ExternalLink, Activity, Edit, X, Save,
    MessageSquare, Copy, Sparkles
} from 'lucide-react';

export default function MasterPanel({ onBack }) {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPhotographer, setEditingPhotographer] = useState(null);
    const [editData, setEditData] = useState({});

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

            alert('✅ Cambios guardados');
            setEditingPhotographer(null);
        } catch (error) {
            console.error("Error guardando cambios:", error);
            alert('❌ Error al guardar');
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
                    <div className="flex items-center gap-5">
                        <button onClick={onBack} className="p-4 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 border border-white/5 shadow-xl">
                            <ArrowLeft size={22} className="text-white" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <Shield className="text-indigo-400" size={24} />
                                <h1 className="text-3xl font-black uppercase tracking-tighter">Centro de Control</h1>
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Gestión Global de Fotógrafos</p>
                        </div>
                    </div>

                    <div className="relative min-w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar fotógrafo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900 border-2 border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-indigo-500/50 transition-all w-full font-bold text-white placeholder:text-slate-600 shadow-inner"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[30px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Total Clientes</p>
                            <p className="text-2xl font-black">{photographers.length}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[30px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Activos Ahora</p>
                            <p className="text-2xl font-black">{photographers.filter(p => !p.isSuspended).length}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[30px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Suspendidos</p>
                            <p className="text-2xl font-black">{photographers.filter(p => p.isSuspended).length}</p>
                        </div>
                    </div>
                </div>

                {/* Demo Sharing Section */}
                <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700" />
                    <div className="flex items-center gap-6 relative z-10 text-center md:text-left">
                        <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-indigo-500/20 text-indigo-600">
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black tracking-tight leading-none">Compartir Demo</h3>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-[8px] font-black uppercase tracking-widest">Nuevo</span>
                            </div>
                            <p className="text-slate-400 text-sm font-bold mt-2">Envía el acceso de prueba a otros compañeros fotógrafos</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 relative z-10 w-full md:w-auto">
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}?demo=true`;
                                window.open(url, '_blank');
                            }}
                            className="bg-indigo-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
                        >
                            <ExternalLink size={16} /> Ver App
                        </button>

                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}?demo=true`;
                                navigator.clipboard.writeText(url);
                                alert('✅ Enlace de demo copiado al portapapeles');
                            }}
                            className="bg-slate-900 border border-white/10 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <Copy size={16} /> Copiar Enlace
                        </button>

                        <button
                            onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}?demo=true`;
                                const msg = `¡Hola! He pensado que te gustaría probar la nueva app de gestión de orlas que estoy usando. Te paso el enlace a la versión demo para que le eches un vistazo:\n\n🔗 ${url}\n\n¡Ya me dirás qué te parece!`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="bg-emerald-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95"
                        >
                            <MessageSquare size={16} /> Enviar WhatsApp
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-[35px] overflow-hidden backdrop-blur-xl">
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
                                                    onClick={() => handleEdit(p)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/60 hover:text-indigo-400 transition-all border border-white/5"
                                                    title="Editar Datos"
                                                >
                                                    <Edit size={14} />
                                                </button>

                                                <a
                                                    href={`/?f=${p.id}`}
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
        </div >
    );
}
