import React, { useState } from 'react';
import {
    CreditCard, Shield, Gift, Sparkles, Sun, Moon, Tag,
    Mail, Database, Download, Upload, FileText,
    ChevronDown, Trash2, Plus, Phone, MessageCircle, Settings2
} from 'lucide-react';
import { COURSE_GROUPS } from '../../constants.js';

import CriticalDatesPanel from './CriticalDatesPanel.jsx';

const SettingsPanel = ({
    settings,
    setSettings,
    updateSettings,
    paymentMethods,
    togglePaymentMethod,
    updateAdminPin,
    downloadMasterBackup,
    syncWithDrive,
    isBackingUp,
    exportCSV,
    adminSchool,
    schools,
    photographerId,
    theme = 'dark'
}) => {
    // Estados de apertura de secciones
    const [openSections, setOpenSections] = useState({
        general: false,
        billing: false,
        notifications: false
    });

    const [notifForm, setNotifForm] = useState({ title: '', body: '' });
    const [sendingNotif, setSendingNotif] = useState(false);

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const sendMassiveNotification = async () => {
        if (!notifForm.title || !notifForm.body) return alert('Rellena el mensaje');
        if (!confirm('🚀 Vas a enviar esta notificación a TODOS los alumnos suscritos. ¿Proceder?')) return;

        setSendingNotif(true);
        try {
            const token = localStorage.getItem(`orlas2026_token_${photographerId}`);
            if (!token) throw new Error('Sesión no autorizada. Re-accede al panel.');

            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../../firebase.js');
            const sender = httpsCallable(functions, 'sendMassiveNotifications');
            const res = await sender({ ...notifForm, photographerId, auth_token: token });
            alert(`✅ Enviado con éxito a ${res.data.sent} dispositivos.`);
            setNotifForm({ title: '', body: '' });
        } catch (err) {
            console.error(err);
            alert('Error al enviar: ' + err.message);
        } finally {
            setSendingNotif(false);
        }
    };

    const SectionHeader = ({ id, icon: Icon, title, subtitle, colorClass, isOpen }) => (
        <div
            onClick={() => toggleSection(id)}
            className={`flex items-center justify-between p-8 cursor-pointer transition-all duration-300 ${isOpen ? `bg-${colorClass}/5` : 'hover:bg-primary/2'}`}
        >
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isOpen ? `bg-${colorClass} text-white scale-110 rotate-3` : `bg-${colorClass}/10 text-${colorClass}`}`}>
                    <Icon size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight">{title}</h3>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">{subtitle}</p>
                </div>
            </div>
            {/* Solo mostramos la flecha si la sección no es la principal abierta por defecto o para feedback visual claro */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? `bg-${colorClass}/20 text-${colorClass} rotate-180` : 'bg-primary/5 text-secondary'}`}>
                <ChevronDown size={24} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Fechas Importantes */}
            <div className="w-full">
                <CriticalDatesPanel
                    settings={settings}
                    updateSettings={updateSettings}
                    schools={schools}
                    theme={theme}
                />
            </div>

            {/* 1. CONFIGURACIÓN GENERAL */}
            <div className={`card overflow-hidden transition-all duration-500 ${openSections.general ? 'ring-2 ring-indigo-500/20 shadow-2xl' : 'hover:ring-1 hover:ring-indigo-500/10 shadow-lg'}`}>
                <SectionHeader
                    id="general"
                    icon={Settings2}
                    title="Configuración de la Aplicación"
                    subtitle="PAGOS, IDENTIDAD Y GESTIÓN DE DATOS"
                    colorClass="indigo-600"
                    isOpen={openSections.general}
                />

                <div className={`transition-all duration-700 ease-in-out ${openSections.general ? 'max-h-[3000px] opacity-100 p-8 pt-2' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Sub-bloque: Pagos y Seguridad */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <Shield size={16} /> Pagos y Seguridad
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {paymentMethods.map(method => (
                                    <div key={method.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${method.enabled ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-primary/2 border-primary/5 opacity-40'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${method.enabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-primary/5 text-secondary'}`}>
                                                {method.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider">{method.label}</span>
                                        </div>
                                        <button onClick={() => togglePaymentMethod(method.id)} className={`w-10 h-6 rounded-full relative transition-all duration-300 ${method.enabled ? 'bg-indigo-500' : 'bg-primary/20'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${method.enabled ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 space-y-5">
                                <div>
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest block mb-2 opacity-60">Pin de Acceso</label>
                                    <input type="text" maxLength={4} className="input-dark w-full py-4 text-sm tracking-[1.2em] font-black text-center rounded-xl border-indigo-500/10" placeholder="XXXX" onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                        if (val.length === 4) { updateAdminPin(val); alert('✅ PIN actualizado'); e.target.value = ''; }
                                    }} />
                                </div>
                                <div className="p-5 bg-pink-500/5 border border-pink-500/10 rounded-2xl">
                                    <label className="text-[9px] font-black text-pink-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                        <Gift size={14} /> % Descuento Regalo
                                    </label>
                                    <div className="relative">
                                        <input type="number" min="0" max="100" defaultValue={settings?.giftDiscount || 25} className="input-dark bg-slate-900/50 w-full py-4 text-sm font-black text-center rounded-xl pr-10 border-pink-500/10" onChange={e => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val >= 0 && val <= 100) updateSettings({ giftDiscount: val });
                                        }} />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary font-black text-sm opacity-30">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub-bloque: Identidad y Logo */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-violet-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <Sparkles size={16} /> Identidad y Logo
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-secondary uppercase tracking-widest block opacity-40 text-center">LIGHT</label>
                                    <input type="file" accept="image/png" id="logo-light-upload" className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const img = new Image(); img.src = ev.target.result;
                                                    img.onload = () => {
                                                        const canvas = document.createElement('canvas');
                                                        const scale = Math.min(1, 800 / img.width);
                                                        canvas.width = img.width * scale; canvas.height = img.height * scale;
                                                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                                        updateSettings({ logoUrl: canvas.toDataURL('image/png', 0.8) });
                                                    };
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label htmlFor="logo-light-upload" className="w-full h-28 bg-white/5 border-2 border-dashed border-primary/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-violet-500 transition-all overflow-hidden p-3 group">
                                        {settings.logoUrl ? <img src={settings.logoUrl} alt="Light" className="w-full h-full object-contain" /> : <Sun size={20} className="text-secondary/20 group-hover:scale-110 transition-transform" />}
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-secondary uppercase tracking-widest block opacity-40 text-center">DARK</label>
                                    <input type="file" accept="image/png" id="logo-dark-upload" className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const img = new Image(); img.src = ev.target.result;
                                                    img.onload = () => {
                                                        const canvas = document.createElement('canvas');
                                                        const scale = Math.min(1, 800 / img.width);
                                                        canvas.width = img.width * scale; canvas.height = img.height * scale;
                                                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                                        updateSettings({ logoUrlDark: canvas.toDataURL('image/png', 0.8) });
                                                    };
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label htmlFor="logo-dark-upload" className="w-full h-28 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-violet-500 transition-all overflow-hidden p-3 group">
                                        {settings.logoUrlDark ? <img src={settings.logoUrlDark} alt="Dark" className="w-full h-full object-contain" /> : <Moon size={20} className="text-white/10 group-hover:scale-110 transition-transform" />}
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest block mb-2 opacity-60">Nombre Comercial</label>
                                    <input type="text" value={settings.brandName || ''} onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))} onBlur={(e) => updateSettings({ brandName: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-xl" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest block mb-2 opacity-60">Email de Soporte</label>
                                    <input type="email" value={settings.notificationEmail || ''} onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.value }))} onBlur={(e) => updateSettings({ notificationEmail: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black lowercase rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Sub-bloque: Gestión de Datos */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <Database size={16} /> Gestión de Datos
                            </h4>
                            <div className="space-y-4">
                                <button onClick={downloadMasterBackup} className="w-full py-4.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-emerald-500 flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5">
                                    <Download size={16} /> Bajar Backup JSON
                                </button>
                                <button onClick={syncWithDrive} className={`w-full py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${isBackingUp ? 'bg-indigo-500/20 text-indigo-400' : 'bg-primary/5 border border-primary/10 hover:border-indigo-500/30 text-secondary'}`}>
                                    <Upload size={16} className={isBackingUp ? 'animate-spin' : ''} /> DRIVE (PRO)
                                </button>
                            </div>
                            <div className="pt-6 border-t border-primary/5">
                                <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-4 ml-1">Exportar Listado</label>
                                <button onClick={() => {
                                    const selectedSchoolObj = schools.find(s => s.id === adminSchool);
                                    if (!selectedSchoolObj) return alert('Selecciona un centro primero');
                                    exportCSV({ school: adminSchool });
                                }} className="w-full py-6 bg-gradient-to-br from-emerald-600 to-emerald-400 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-1 hover:scale-[1.02] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                                    <span>EXCEL MAESTRO</span>
                                    <span className="text-[8px] opacity-70 tracking-widest font-bold">
                                        {schools.find(s => s.id === adminSchool)?.name.toUpperCase().replace('MAESTRO ', '').slice(0, 20) || 'SELECCIONA CENTRO'}...
                                    </span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 2. DATOS DE FACTURACIÓN */}
            <div className={`card overflow-hidden transition-all duration-500 ${openSections.billing ? 'ring-2 ring-slate-400/20 shadow-2xl' : 'hover:ring-1 hover:ring-slate-400/10'}`}>
                <SectionHeader
                    id="billing"
                    icon={FileText}
                    title="Datos de Facturación"
                    subtitle="INFORMACIÓN LEGAL Y FISCAL"
                    colorClass="slate-400"
                    isOpen={openSections.billing}
                />
                <div className={`transition-all duration-500 ease-in-out ${openSections.billing ? 'max-h-[1000px] opacity-100 p-8 pt-2' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-50 ml-1">Razón Social</label>
                            <input type="text" value={settings.fiscalName || ''} onChange={(e) => setSettings(prev => ({ ...prev, fiscalName: e.target.value }))} onBlur={(e) => updateSettings({ fiscalName: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-50 ml-1">CIF / NIF</label>
                            <input type="text" value={settings.cif || ''} onChange={(e) => setSettings(prev => ({ ...prev, cif: e.target.value }))} onBlur={(e) => updateSettings({ cif: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-50 ml-1">Dirección</label>
                            <input type="text" value={settings.address || ''} onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))} onBlur={(e) => updateSettings({ address: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-50 ml-1">C.P.</label>
                            <input type="text" value={settings.postalCode || ''} onChange={(e) => setSettings(prev => ({ ...prev, postalCode: e.target.value }))} onBlur={(e) => updateSettings({ postalCode: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-50 ml-1">Ciudad</label>
                            <input type="text" value={settings.city || ''} onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))} onBlur={(e) => updateSettings({ city: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block opacity-50 ml-1">Provincia</label>
                            <input type="text" value={settings.province || ''} onChange={(e) => setSettings(prev => ({ ...prev, province: e.target.value }))} onBlur={(e) => updateSettings({ province: e.target.value })} className="input-dark w-full py-4 text-[11px] font-black uppercase rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. NOTIFICACIONES MASIVAS (Ahora agrupado en una sola Isla de Escritura) */}
            <div className={`card overflow-hidden transition-all duration-500 ${openSections.notifications ? 'ring-2 ring-violet-600/30 shadow-2xl' : 'hover:ring-1 hover:ring-violet-600/10 shadow-lg'}`}>
                <SectionHeader
                    id="notifications"
                    icon={Sparkles}
                    title="Canal de Notificaciones"
                    subtitle="PUSH PWA MASIVO"
                    colorClass="violet-600"
                    isOpen={openSections.notifications}
                />
                <div className={`transition-all duration-700 ease-in-out ${openSections.notifications ? 'max-h-[1000px] opacity-100 p-8 pt-2' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
                    <div className="max-w-4xl mx-auto py-4">
                        <div className="bg-violet-600/5 border border-violet-600/10 p-8 rounded-[2.5rem] space-y-6 shadow-inner relative overflow-hidden group">
                            {/* Decoración sutil de fondo */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-violet-600/10 transition-colors duration-700" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-2">Título del Aviso</label>
                                    <input
                                        type="text"
                                        placeholder="¡FOTOS LISTAS! 🎓"
                                        value={notifForm.title}
                                        onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                                        className="input-dark w-full py-5 px-6 text-[11px] font-black uppercase rounded-2xl border-violet-600/10 bg-slate-900/40 focus:border-violet-600/40 transition-all placeholder:text-white/40"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-2">Cuerpo del Mensaje</label>
                                    <input
                                        type="text"
                                        placeholder="YA PUEDES VER LAS FOTOS..."
                                        value={notifForm.body}
                                        onChange={e => setNotifForm({ ...notifForm, body: e.target.value })}
                                        className="input-dark w-full py-5 px-6 text-[11px] font-black uppercase rounded-2xl border-violet-600/10 bg-slate-900/40 focus:border-violet-600/40 transition-all placeholder:text-white/40"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={sendMassiveNotification}
                                disabled={sendingNotif}
                                className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl relative z-10 ${sendingNotif ? 'bg-violet-600/40' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 active:scale-95'}`}
                            >
                                {sendingNotif ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        PROCESANDO ENVÍO...
                                    </>
                                ) : (
                                    <>🚀 LANZAR NOTIFICACIÓN A TODOS</>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-[9px] font-bold text-secondary uppercase tracking-[0.3em] opacity-40 mt-6 italic">
                            * El mensaje se enviará instantáneamente a todos los dispositivos suscritos.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SettingsPanel;
