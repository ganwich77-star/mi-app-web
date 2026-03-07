import React from 'react';
import {
    CreditCard, Shield, Gift, Sparkles, Sun, Moon, Tag,
    Mail, Database, Download, Upload, FileText,
    Calendar, Camera, ShoppingCart, GraduationCap, Trash2, Plus, AlertTriangle
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
    photographerId
}) => {
    const [notifForm, setNotifForm] = React.useState({ title: '', body: '' });
    const [sendingNotif, setSendingNotif] = React.useState(false);

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
    return (
        <div className="space-y-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <CriticalDatesPanel
                        settings={settings}
                        updateSettings={updateSettings}
                        schools={schools}
                    />
                </div>

                {/* Bloque 1: Pagos y Seguridad */}
                <div className="card p-6 flex flex-col h-full">
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-6"><CreditCard size={18} className="text-accent" /> Pagos y Seguridad</h3>

                        <div className="grid grid-cols-1 gap-3 mb-4">
                            {paymentMethods.map(method => (
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
                            ))}
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
                                <button onClick={syncWithDrive} className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isBackingUp ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed' : 'bg-primary/5 border border-primary/10 hover:bg-primary/10'}`}>
                                    <Upload size={14} className={isBackingUp ? 'animate-spin' : ''} />
                                    {isBackingUp ? 'Sincronizando...' : 'Subir a Google Drive (PRO)'}
                                </button>
                                <p className="text-[9px] text-secondary/60 font-medium px-4 text-center leading-tight">Guarda una copia de seguridad con todos tus pedidos, diseños y configuraciones actuales.</p>
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

                {/* Bloque 5: Servidor de Notificaciones Masivas (PWA) */}
                <div className="card p-6 col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-violet-600/5 to-transparent border-violet-500/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="max-w-md">
                            <h3 className="text-xl font-black text-primary flex items-center gap-2 mb-2">
                                <Sparkles size={22} className="text-violet-500" /> Servidor de Notificaciones
                            </h3>
                            <p className="text-[11px] font-medium text-secondary leading-relaxed">
                                Envía avisos instantáneos (Push) a todos los alumnos que hayan guardado la App en sus dispositivos.
                                <span className="block mt-1 text-violet-500/80 font-bold uppercase tracking-widest text-[9px]">Uso: Avisar de fotos listas, fin de plazo o eventos.</span>
                            </p>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Título del Aviso</label>
                                    <input
                                        type="text"
                                        placeholder="¡Fotos Listas! 🎓"
                                        value={notifForm.title}
                                        onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                                        className="input-dark w-full py-4 px-5 text-sm font-black rounded-2xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Cuerpo del Mensaje</label>
                                    <input
                                        type="text"
                                        placeholder="Ya puedes ver las fotos de la Graduación..."
                                        value={notifForm.body}
                                        onChange={e => setNotifForm({ ...notifForm, body: e.target.value })}
                                        className="input-dark w-full py-4 px-5 text-sm font-black rounded-2xl"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={sendMassiveNotification}
                                disabled={sendingNotif}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${sendingNotif ? 'bg-violet-600/40 cursor-not-allowed text-white/50' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20'}`}
                            >
                                {sendingNotif ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        PROCESANDO ENVÍO...
                                    </>
                                ) : (
                                    <>
                                        🚀 ENVIAR AVISO A TODOS LOS ALUMNOS
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
