import { useState } from 'react';
import { db } from './firebase.js';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import {
    GraduationCap, User, Mail, Phone, Building,
    CheckCircle, ArrowRight, ShieldCheck, Sparkles, Copy, ChevronLeft, CreditCard
} from 'lucide-react';
import PricingTiers from './components/PricingTiers.jsx';
import { NEW_PHOTOGRAPHER_PACKS, NEW_PHOTOGRAPHER_EXTRAS } from './constants.js';

export default function Onboarding({ onComplete }) {
    // Estilos de animación inyectados
    const animationStyles = `
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
        }
        @keyframes pulse-heart {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
            50% { transform: scale(1.04); box-shadow: 0 0 30px rgba(255, 255, 255, 0.4); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-heart { animation: pulse-heart 1.5s ease-in-out infinite; }
    `;

    const [step, setStep] = useState(0); // 0: Welcome, 1: Plans, 2: Brand, 3: Billing, 4: Success
    const [loading, setLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '', // photographerId (el slug)
        brandName: '',
        legalName: '',
        cif: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        province: '',
        logoUrl: '', // Por ahora guardaremos un placeholder o base64 si es necesario, pero idealmente una URL
        plan: '', // Plan seleccionado en el paso 1
    });

    const normalizeString = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'brandName') {
            const slug = normalizeString(value).toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, brandName: value.toUpperCase(), id: slug }));
        } else if (name === 'id') {
            const cleanId = normalizeString(value).toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, id: cleanId }));
        } else if (name === 'email') {
            setFormData(prev => ({ ...prev, [name]: value.toLowerCase().trim() }));
        } else if (name === 'phone' || name === 'zip') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9\s+]/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };

    const handleRegister = async () => {
        // Validación de Integridad
        const requiredFields = ['legalName', 'cif', 'email', 'phone', 'address', 'zip', 'province'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert("⚠️ Por favor, completa todos los campos de facturación obligatorios.");
            return;
        }

        setLoading(true);
        try {
            // 1. Crear el documento base del fotógrafo con datos fiscales completos
            const photographerRef = doc(db, 'orlas2026_photographers', formData.id);
            await setDoc(photographerRef, {
                brandName: formData.brandName,
                legalName: formData.legalName,
                cif: formData.cif,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                zip: formData.zip,
                province: formData.province,
                createdAt: new Date().toISOString(),
                registered: true,
                isSuspended: false
            });

            // 2. Crear la configuración inicial
            const configRef = doc(db, 'orlas2026_photographers', formData.id, 'config', 'main');
            await setDoc(configRef, {
                brandName: formData.brandName,
                legalName: formData.legalName,
                cif: formData.cif,
                address: formData.address,
                zip: formData.zip,
                province: formData.province,
                email: formData.email,
                phone: formData.phone,
                logoUrl: formData.logoUrl,
                isSuspended: false,
                isPaid: formData.plan === 'starter',
                plan: formData.plan,
                adminPin: '7373', // PIN por defecto
                schools: [],
                paymentMethods: [
                    { id: 'efectivo', label: 'Efectivo', enabled: true },
                    { id: 'bizum', label: 'Bizum', enabled: true }
                ],
                packs: NEW_PHOTOGRAPHER_PACKS,
                extras: NEW_PHOTOGRAPHER_EXTRAS
            });

            // 3. Enviar Emails de Notificación
            const adminUrl = `${window.location.origin}${window.location.pathname}?f=${formData.id}&view=admin`;
            const publicUrl = `https://basecode.es/graduaciones2026/?f=${formData.id}`;

            // Email para el Fotógrafo
            await addDoc(collection(db, 'mail'), {
                to: formData.email,
                message: {
                    subject: `🚀 ¡Bienvenido a Orlas 2026! - ${formData.brandName}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
                            <h2 style="color: #6366f1;">¡Hola ${formData.brandName}!</h2>
                            <p>Tu plataforma personalizada ya está lista para empezar a trabajar. Aquí tienes tus accesos:</p>
                            
                            <div style="background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
                                <p style="margin-top: 0; font-weight: bold; color: #6366f1;">Acceso Administración (Solo para ti):</p>
                                <a href="${adminUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-bottom: 10px;">Panel de Control</a>
                                <p style="font-size: 11px; color: #64748b; margin: 0;">URL: ${adminUrl}</p>
                                <p style="margin-top: 10px; font-size: 13px;"><strong>PIN de acceso:</strong> 7373</p>
                            </div>

                            <div style="background: #eff6ff; padding: 25px; border-radius: 20px; border: 1px solid #dbeafe; margin: 20px 0;">
                                <p style="margin-top: 0; font-weight: bold; color: #2563eb;">Tu App Pública (Para tus clientes):</p>
                                <a href="${publicUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-bottom: 10px;">Ver mi App</a>
                                <p style="font-size: 11px; color: #64748b; margin: 0;">URL: ${publicUrl}</p>
                            </div>

                            <p style="font-size: 14px; color: #475569;">Te recomendamos guardar este email para tener tus accesos siempre a mano.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Orlas 2026 | Pujalte Creative Studio</p>
                        </div>
                    `
                }
            });

            // Email para Administración (Pujalte)
            await addDoc(collection(db, 'mail'), {
                to: 'apps@pujaltefotografia.es',
                message: {
                    subject: `🔔 NUEVO REGISTRO: ${formData.brandName}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #6366f1;">🚀 Nuevo Fotógrafo Registrado</h2>
                            <div style="background: #f1f5f9; padding: 20px; border-radius: 15px;">
                                <p><strong>Marca:</strong> ${formData.brandName}</p>
                                <p><strong>ID/Slug:</strong> ${formData.id}</p>
                                <p><strong>Razón Social:</strong> ${formData.legalName}</p>
                                <p><strong>CIF:</strong> ${formData.cif}</p>
                                <p><strong>Email:</strong> ${formData.email}</p>
                                <p><strong>Teléfono:</strong> ${formData.phone}</p>
                                <p><strong>Dirección:</strong> ${formData.address}, ${formData.zip} - ${formData.province}</p>
                            </div>
                            <p style="margin-top: 20px;">Acceso Admin: <a href="${adminUrl}">${adminUrl}</a></p>
                        </div>
                    `
                }
            });

            setShowPaymentModal(true);
        } catch (error) {
            console.error("Error en registro:", error);
            alert("Hubo un error al registrar. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <style>{animationStyles}</style>
            {/* Orbes decorativos de fondo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-blue-500 blur-[100px] rounded-full" />
            </div>

            <div className={`w-full relative z-10 pt-4 pb-10 md:py-10 transition-all duration-700 mx-auto ${step === 1 ? 'max-w-4xl' : 'max-w-xl'}`}>
                {/* Logo Superior (Sustituye a la estrellita) */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center mb-6">
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="Pujalte Fotografía"
                            className="h-14 w-auto brightness-0 invert opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl">
                        Únete a<br />
                        <span className="text-indigo-400">Orlas 2026</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-80">
                        Plataforma Profesional para Fotógrafos
                    </p>
                </div>

                <div className="bg-slate-900/50 border border-white/10 rounded-[40px] px-6 py-8 md:p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    {/* Progress Bar */}
                    {step > 0 && (
                        <div className="absolute top-0 left-0 h-1.5 bg-indigo-500 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${(step / 4) * 100}%` }} />
                    )}

                    {step === 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-10 py-4">
                            <div className="space-y-4 text-center">
                                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase italic">
                                    Revoluciona tu <br />
                                    <span className="text-indigo-400 not-italic">Flujo de Trabajo</span>
                                </h1>
                                <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed px-4">
                                    La plataforma "Todo en Uno" diseñada por fotógrafos para fotógrafos. Digitaliza tus trabajos, automatiza registros y maximiza tus beneficios.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="p-5 md:p-6 bg-white/5 rounded-[32px] border border-white/10 text-center space-y-3 hover:bg-white/10 transition-all group animate-float" style={{ animationDuration: '3s' }}>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={22} className="md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest">Digitalización 100%</h3>
                                    <p className="text-slate-500 text-[9px] md:text-[10px] font-bold leading-relaxed uppercase">Adiós a los papeles y errores de escritura manual.</p>
                                </div>
                                <div className="p-5 md:p-6 bg-white/5 rounded-[32px] border border-white/10 text-center space-y-3 hover:bg-white/10 transition-all group animate-float" style={{ animationDuration: '4.5s' }}>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-110 transition-transform">
                                        <CheckCircle size={22} className="md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest">Pagos Garantizados</h3>
                                    <p className="text-slate-500 text-[9px] md:text-[10px] font-bold leading-relaxed uppercase">Gestión de cobros integrada y control de impagos.</p>
                                </div>
                                <div className="p-5 md:p-6 bg-white/5 rounded-[32px] border border-white/10 text-center space-y-3 hover:bg-white/10 transition-all group animate-float" style={{ animationDuration: '3.8s' }}>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                                        <Sparkles size={22} className="md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest">Marca Propia</h3>
                                    <p className="text-slate-500 text-[9px] md:text-[10px] font-bold leading-relaxed uppercase">App personalizada con tu logo.</p>
                                </div>
                            </div>

                            <div className="pt-6 text-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full bg-white text-[#020617] font-black text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] rounded-[35px] py-7 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-4 group animate-heart"
                                >
                                    PRUÉBALO GRATIS • SIN PERMANENCIA
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <PricingTiers
                                currentPlan={formData.plan}
                                onSelectPlan={(planId) => {
                                    setFormData(prev => ({ ...prev, plan: planId }));
                                    setStep(2);
                                }}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setStep(1)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight text-left">Tu Marca Profesional</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-relaxed text-left">Configura la identidad de tu App para clientes.</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Nombre Comercial</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                                        <input
                                            name="brandName"
                                            value={formData.brandName}
                                            onChange={handleChange}
                                            placeholder="Ej: Pujalte Creative Studio"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-3 sm:py-4 !text-white font-bold text-base sm:text-lg placeholder:text-slate-600 shadow-inner focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Identificador único (Link)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 font-black text-xl">@</span>
                                        <input
                                            name="id"
                                            value={formData.id}
                                            readOnly
                                            placeholder="ej: pujalte"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 !text-white font-black text-xl lowercase placeholder:text-slate-600 shadow-inner outline-none transition-all cursor-not-allowed opacity-80"
                                        />
                                    </div>
                                    <div className="px-4 py-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center justify-between gap-4 group hover:bg-indigo-500/10 transition-all">
                                        <div className="flex items-center gap-3 flex-1">
                                            <p className="text-[11px] text-indigo-400/80 font-black uppercase tracking-widest shrink-0">
                                                URL:
                                            </p>
                                            <span className="text-white font-black text-sm whitespace-nowrap overflow-hidden">
                                                basecode.es/graduaciones2026/?f=<span className="text-indigo-400">{formData.id || 'tu-identificador'}</span>
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const url = `basecode.es/graduaciones2026/?f=${formData.id || 'tu-identificador'}`;
                                                navigator.clipboard.writeText(url);
                                                setCopyStatus(true);
                                                setTimeout(() => setCopyStatus(false), 2000);
                                            }}
                                            className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-90 shrink-0"
                                        >
                                            {copyStatus ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => (formData.brandName && formData.id) ? setStep(3) : alert("Por favor, completa los datos de marca.")}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base uppercase tracking-widest rounded-3xl py-5 shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                Siguiente paso <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-left">Datos de Facturación</h2>
                                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider leading-relaxed text-left opacity-70">Información administrativa para la gestión.</p>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Nombre o Razón Social</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                        <input
                                            name="legalName"
                                            value={formData.legalName}
                                            onChange={handleChange}
                                            placeholder="Nombre completo o Empresa SL"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">CIF / NIF</label>
                                        <input
                                            name="cif"
                                            value={formData.cif}
                                            onChange={handleChange}
                                            placeholder="B12345678"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/50 hidden sm:block" size={16} />
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="600000000"
                                                className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 sm:pl-12 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Dirección Fiscal</label>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Calle, número, piso..."
                                        className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-6 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">C.P.</label>
                                        <input
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            placeholder="28001"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Localidad / Prov.</label>
                                        <input
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            placeholder="Madrid"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Email de Gestión</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="hola@tuestudio.com"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                {(() => {
                                    const isComplete = formData.legalName && formData.cif && formData.email && formData.phone && formData.address && formData.zip && formData.province;
                                    return (
                                        <button
                                            onClick={handleRegister}
                                            disabled={loading || !isComplete}
                                            className={`w-full text-white font-black text-base uppercase tracking-widest rounded-3xl py-5 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isComplete
                                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
                                                : 'bg-slate-700 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Activar mi Plataforma <ShieldCheck size={20} /></>
                                            )}
                                        </button>
                                    );
                                })()}
                                <button onClick={() => setStep(2)} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Volver a marca</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-8 space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-[35px] flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
                                    <CheckCircle className="text-emerald-400" size={48} />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-indigo-500 p-2 rounded-xl shadow-lg animate-bounce">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">¡Bienvenido!</h1>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-[320px] mx-auto px-4">
                                    Tu plataforma para <span className="text-white uppercase font-black">{formData.brandName}</span> ya está lista.
                                </p>
                            </div>

                            <div className="bg-slate-950/50 rounded-[30px] p-6 border border-white/5 space-y-4">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">URL de Administración:</p>
                                <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-indigo-500/20">
                                    <code className="flex-1 text-indigo-400 font-mono text-xs whitespace-nowrap overflow-hidden">
                                        basecode.es/graduaciones2026/?f={formData.id}&view=admin
                                    </code>
                                    <button
                                        onClick={() => {
                                            const url = `basecode.es/graduaciones2026/?f=${formData.id}&view=admin`;
                                            navigator.clipboard.writeText(url);
                                            setCopyStatus(true);
                                            setTimeout(() => setCopyStatus(false), 2000);
                                        }}
                                        className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-90"
                                    >
                                        {copyStatus ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <a
                                    href={`${window.location.pathname}?f=${formData.id}&view=admin`}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Abrir mi Panel <ArrowRight size={20} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Pago / Aviso Plan */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
                    <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-[40px] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slide-up">
                        <div className="p-8 space-y-6">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-indigo-500/30 mb-6">
                                <ShieldCheck className="text-indigo-400" size={32} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">PLAN {formData.plan.toUpperCase()}</h3>
                                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-relaxed">
                                    Has seleccionado el plan <span className="text-indigo-400 font-black">{formData.plan.toUpperCase()}</span>
                                </p>
                            </div>

                            {formData.plan === 'flex' ? (
                                <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-4 text-center">
                                    <p className="text-slate-300 text-sm font-bold leading-relaxed px-2">
                                        Con este plan podrás usar la plataforma <span className="text-emerald-400">sin restricciones</span>, excepto entrar a la sección de edición de orla, hasta que pagues por los niños listados.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-4 text-center">
                                    <p className="text-slate-300 text-sm font-bold leading-relaxed px-2">
                                        El importe total de tu plan <span className="text-indigo-400 font-black">{formData.plan.toUpperCase()}</span> es de <span className="text-white font-black text-lg">{formData.plan === 'starter' ? '149€' : formData.plan === 'pro' ? '449€' : '0€'}</span>.
                                    </p>
                                    <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">
                                        Puedes realizar el pago por la pasarela segura directamente
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 space-y-3">
                                {formData.plan === 'flex' ? (
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setStep(4);
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base uppercase tracking-widest rounded-3xl py-5 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        ACTIVAR GRATIS <CheckCircle size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setStep(4);
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[13px] sm:text-sm uppercase tracking-widest rounded-3xl py-5 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        PAGAR POR PASARELA SEGURA <CreditCard size={20} />
                                    </button>
                                )}
                                <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed px-4 opacity-70">
                                    {formData.plan === 'flex' ? 'Sin pago inicial requerido. Pagas por alumno.' : 'Conexión 100% segura y cifrada para tu plataforma.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
