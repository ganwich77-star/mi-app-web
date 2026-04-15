import { useState } from 'react';
import { db, functions } from './firebase.js';
import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import {
    GraduationCap, User, Mail, Phone, Building,
    CheckCircle, ArrowRight, ShieldCheck, Sparkles, Copy, ChevronLeft, CreditCard,
    MapPin, Smartphone, X
} from 'lucide-react';
import PricingTiers from './components/PricingTiers.jsx';
import { NEW_PHOTOGRAPHER_PACKS, NEW_PHOTOGRAPHER_EXTRAS } from './constants.js';
import { PoliticaPrivacidad, CondicionesVenta } from './components/LegalModals.jsx';

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

    // Configuración de Precios de Selección de Plan (Pago Inicial)
    const ONBOARDING_PLAN_PRICES = {
        flex: 0,
        starter: 149,
        pro: 449,
        custom: 850
    };
    const [copyStatus, setCopyStatus] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '', // photographerId (el slug)
        brandName: '',
        fiscalName: '',
        cif: '',
        notificationEmail: '',
        contactPhone: '',
        address: '',
        addressNumber: '',
        addressFloor: '',
        addressLetter: '',
        city: '',
        postalCode: '',
        province: '',
        logoUrl: '', // Por ahora guardaremos un placeholder o base64 si es necesario, pero idealmente una URL
        plan: '', // Plan seleccionado en el paso 1
        acceptedTerms: false, // Aceptación de LOPD y Términos
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
        } else if (name === 'notificationEmail') {
            setFormData(prev => ({ ...prev, [name]: value.toLowerCase().trim() }));
        } else if (name === 'contactPhone' || name === 'postalCode') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9\s+]/g, '') }));
        } else if (name === 'acceptedTerms') {
            setFormData(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };

    const handleRegister = async () => {
        // Validación de Integridad
        const requiredFields = ['fiscalName', 'cif', 'notificationEmail', 'contactPhone', 'address', 'city', 'postalCode', 'province'];
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
                fiscalName: formData.fiscalName,
                cif: formData.cif,
                notificationEmail: formData.notificationEmail,
                contactPhone: formData.contactPhone,
                address: formData.address,
                addressNumber: formData.addressNumber,
                addressFloor: formData.addressFloor,
                addressLetter: formData.addressLetter,
                city: formData.city,
                postalCode: formData.postalCode,
                province: formData.province,
                createdAt: new Date().toISOString(),
                registered: true,
                isSuspended: false
            });

            // 2. Crear la configuración inicial
            const configRef = doc(db, 'orlas2026_photographers', formData.id, 'config', 'main');
            await setDoc(configRef, {
                brandName: formData.brandName,
                fiscalName: formData.fiscalName,
                cif: formData.cif,
                address: formData.address,
                addressNumber: formData.addressNumber,
                addressFloor: formData.addressFloor,
                addressLetter: formData.addressLetter,
                city: formData.city,
                postalCode: formData.postalCode,
                province: formData.province,
                notificationEmail: formData.notificationEmail,
                contactPhone: formData.contactPhone,
                logoUrl: formData.logoUrl,
                isSuspended: false,
                isPaid: formData.plan === 'flex',
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
            const publicUrl = `https://basecode.es${import.meta.env.BASE_URL}?f=${formData.id}`;

            // Email para el Fotógrafo (Premium Design)
            await addDoc(collection(db, 'mail'), {
                to: formData.notificationEmail,
                message: {
                    subject: `🚀 ¡Bienvenido a Orlas 2026! - ${formData.brandName}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #1e293b; background-color: #f8fafc; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0;">
                            <!-- Header con Gradiente -->
                            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em;">¡BIENVENIDO A BORDO!</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">${formData.brandName}</p>
                            </div>
                            
                            <div style="padding: 40px 30px; background-color: white;">
                                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Estamos encantados de tenerte con nosotros. Hemos preparado tu plataforma personalizada para que puedas empezar a gestionar tus orlas de forma profesional y eficiente desde hoy mismo.</p>
                                
                                <!-- Credenciales -->
                                <div style="background: #f1f5f9; padding: 30px; border-radius: 20px; border: 1px dashed #cbd5e1; margin-bottom: 30px;">
                                    <h3 style="margin: 0 0 15px 0; color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">ACCESO ADMINISTRACIÓN (SOLO PARA TI)</h3>
                                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">Este es tu enlace privado para gestionar alumnos, pedidos y orlas:</p>
                                    <a href="${adminUrl}" style="display: block; width: fit-content; background: #6366f1; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 12px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">CONFIGURAR PANEL</a>
                                    <p style="margin: 0; font-size: 13px;"><strong>PIN de seguridad:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">7373</span></p>
                                </div>

                                <div style="background: #eff6ff; padding: 30px; border-radius: 20px; border: 1px solid #dbeafe; margin-bottom: 30px;">
                                    <h3 style="margin: 0 0 15px 0; color: #2563eb; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">TU APP PÚBLICA (PARA CLIENTES)</h3>
                                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #1e40af;">Comparte este enlace con los centros y padres para realizar los pedidos:</p>
                                    <a href="${publicUrl}" style="display: block; width: fit-content; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;">VER MI APP PÚBLICA</a>
                                </div>

                                <p style="font-size: 14px; color: #64748b; text-align: center; margin: 0;">Si tienes cualquier duda, estamos a tu disposición.</p>
                            </div>

                            <!-- Footer con LOPD -->
                            <div style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                                <p style="font-size: 10px; color: #94a3b8; line-height: 1.5; text-align: justify; margin-bottom: 20px;">
                                    <strong>Información básica sobre protección de datos (RGPD/LOPD):</strong> De acuerdo con lo establecido por la normativa vigente, le informamos que sus datos serán tratados por PUJALTE FOTOGRAFÍA (Responsable del Tratamiento) con la finalidad de gestionar su alta en la plataforma, la prestación de los servicios contratados y el envío de comunicaciones operativas. Sus datos se conservarán mientras exista un interés mutuo para mantener el fin del tratamiento o cuando sea necesario por obligación legal. No se comunicarán los datos a terceros, salvo obligación legal. Puede ejercer sus derechos de acceso, rectificación, portabilidad y supresión de sus datos y los de limitación y oposición a su tratamiento dirigiéndose a apps@pujaltefotografia.es.
                                </p>
                                <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                    <p style="font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em; margin: 20px 0 0 0;">Orlas 2026 • Pujalte Creative Studio</p>
                                </div>
                            </div>
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
                                <p><strong>Razón Social:</strong> ${formData.fiscalName}</p>
                                <p><strong>CIF:</strong> ${formData.cif}</p>
                                <p><strong>Email:</strong> ${formData.notificationEmail}</p>
                                <p><strong>Teléfono:</strong> ${formData.contactPhone}</p>
                                <p><strong>Dirección:</strong> ${formData.address} nº${formData.addressNumber} ${formData.addressFloor} ${formData.addressLetter}, ${formData.postalCode} - ${formData.city} (${formData.province})</p>
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

    const handlePayment = async (method) => {
        setLoading(true);
        try {
            const createPaycometIntent = httpsCallable(functions, 'createPaycometIntent');
            const basePrice = ONBOARDING_PLAN_PRICES[formData.plan] || 0;
            
            // Lógica de impuestos (21% en península/baleares, 0% en canarias/ceuta/melilla por ahora)
            const islands = ["LAS PALMAS", "SANTA CRUZ DE TENERIFE", "CEUTA", "MELILLA"];
            const isPeninsula = !islands.includes((formData.province || '').toUpperCase());
            const taxFactor = isPeninsula ? 1.21 : 1.0;
            const finalAmount = Math.round(basePrice * taxFactor * 100) / 100;

            // Generar un ID de transacción basado en el fotógrafo
            const transactionId = `onboarding_${formData.id}_${Date.now()}`;

            const response = await createPaycometIntent({
                studentId: transactionId,
                amount: finalAmount,
                photographerId: formData.id,
                schoolId: 'onboarding',
                payMethod: method
            });

            if (response.data?.success && response.data?.paycometUrl) {
                window.location.href = response.data.paycometUrl;
            } else {
                throw new Error("No se pudo obtener la URL de pago.");
            }
        } catch (error) {
            console.error("Error al procesar pago:", error);
            alert("❌ Hubo un error al conectar con la pasarela. Inténtalo de nuevo.");
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
                                onBack={() => setStep(0)}
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
                                                basecode.es${import.meta.env.BASE_URL}?f=<span className="text-indigo-400">{formData.id || 'tu-identificador'}</span>
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const url = `basecode.es${import.meta.env.BASE_URL}?f=${formData.id || 'tu-identificador'}`;
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

                            {/* Checkbox de Privacidad y Términos */}
                            <div className="bg-slate-950/30 p-5 rounded-[24px] border border-white/5 space-y-4">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative mt-1">
                                        <input
                                            type="checkbox"
                                            name="acceptedTerms"
                                            checked={formData.acceptedTerms}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${formData.acceptedTerms ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-900 border-white/20 group-hover:border-indigo-500/50'}`}>
                                            {formData.acceptedTerms && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left select-none">
                                        <p className="text-[11px] sm:text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
                                            Acepto la <span 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrivacyModal(true); }}
                                                className="text-indigo-400 hover:text-indigo-300 transition-colors underline decoration-indigo-500/30 underline-offset-2 cursor-pointer"
                                            >Protección de Datos (LOPD/RGPD)</span> y los <span 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                                                className="text-indigo-400 font-black hover:text-indigo-300 transition-colors underline decoration-indigo-500/30 underline-offset-2 cursor-pointer"
                                            >Términos de Uso</span> de la plataforma.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={() => (formData.brandName && formData.id && formData.acceptedTerms) ? setStep(3) : alert("⚠️ Debes completar los datos de marca y aceptar los términos legales para continuar.")}
                                className={`w-full font-black text-base uppercase tracking-widest rounded-3xl py-5 transition-all active:scale-95 flex items-center justify-center gap-3 group ${formData.brandName && formData.id && formData.acceptedTerms 
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)]' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            >
                                Siguiente paso <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setStep(2)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="space-y-2">
                                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-left">Datos de Facturación</h2>
                                    <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider leading-relaxed text-left opacity-70">Información administrativa para la gestión.</p>
                                </div>
                            </div>

                            <div className="space-y-4 sm:space-y-6 text-left">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Nombre o Razón Social</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                        <input
                                            name="fiscalName"
                                            value={formData.fiscalName}
                                            onChange={handleChange}
                                            placeholder="Nombre completo o Empresa SL"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">CIF / NIF</label>
                                        <input
                                            name="cif"
                                            value={formData.cif}
                                            onChange={handleChange}
                                            placeholder="B12345678"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest opacity-100">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/50 hidden sm:block" size={16} />
                                            <input
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleChange}
                                                placeholder="600000000"
                                                className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 sm:pl-12 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-6 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Dirección / Calle</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="CALLE, AVENIDA..."
                                                className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4 md:col-span-2 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Nº</label>
                                        <input
                                            name="addressNumber"
                                            value={formData.addressNumber}
                                            onChange={handleChange}
                                            placeholder="12"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Piso</label>
                                        <input
                                            name="addressFloor"
                                            value={formData.addressFloor}
                                            onChange={handleChange}
                                            placeholder="2º"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Letra</label>
                                        <input
                                            name="addressLetter"
                                            value={formData.addressLetter}
                                            onChange={handleChange}
                                            placeholder="B"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-4 md:col-span-2 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">C.P.</label>
                                        <input
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            placeholder="28001"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="col-span-8 md:col-span-5 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Localidad</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="MADRID"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-5 space-y-2 text-left">
                                        <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Provincia</label>
                                        <input
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            placeholder="MADRID"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl px-4 py-3 sm:py-4 !text-white font-bold text-sm sm:text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-indigo-300 uppercase ml-2 tracking-widest">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                        <input
                                            name="notificationEmail"
                                            value={formData.notificationEmail}
                                            onChange={handleChange}
                                            placeholder="hola@tuestudio.com"
                                            className="w-full bg-slate-950/50 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-3 sm:py-4 !text-white font-bold text-base placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                {(() => {
                                    const isComplete = formData.fiscalName && formData.cif && formData.notificationEmail && formData.contactPhone && formData.address && formData.addressNumber && formData.city && formData.postalCode && formData.province;
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
                                <p className="text-white/80 text-sm font-bold leading-relaxed max-w-[320px] mx-auto px-4">
                                    Tu plataforma para <span className="text-white uppercase font-black">{formData.brandName}</span> ya está lista.
                                </p>
                            </div>

                            <div className="bg-slate-950/50 rounded-[30px] p-6 border border-white/5 space-y-4">
                                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">URL de Administración:</p>
                                <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-indigo-500/20">
                                    <span className="text-indigo-400">@</span>
                                    <span className="text-white font-black text-sm truncate flex-1 tracking-tight">
                                        basecode.es{import.meta.env.BASE_URL}?f={formData.id}&view=admin
                                    </span>
                                    <button
                                        onClick={() => {
                                            const url = `basecode.es${import.meta.env.BASE_URL}?f=${formData.id}&view=admin`;
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
                    <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-[40px] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slide-up relative text-left">
                        {/* Botón Cerrar */}
                        <button 
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <ShieldCheck className="text-indigo-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight font-black">Finalizar Registro</h3>
                            </div>

                            <div className="space-y-4">
                                {formData.plan === 'flex' ? (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
                                        <p className="text-indigo-200 text-sm font-bold uppercase tracking-wide mb-2">Modalidad Post-Pago</p>
                                        <p className="text-indigo-300/80 text-xs leading-relaxed">
                                            Tu plan <strong>Flexible</strong> no requiere pago inicial. Se activará tu cuenta de inmediato y pagarás <strong>2,00€ por cada alumno</strong> procesado. Solicita tu liquidación desde el panel al terminar.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-6">
                                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                                <span className="text-slate-400 text-xs uppercase tracking-widest font-black">Plan Seleccionado</span>
                                                <span className="text-white font-black">{formData.plan === 'pro' ? 'PROFESIONAL' : 'BÁSICO'}</span>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {(() => {
                                                    const islands = ['LAS PALMAS', 'SANTA CRUZ DE TENERIFE', 'CEUTA', 'MELILLA'];
                                                    const isPeninsula = !islands.includes((formData.province || '').toUpperCase());
                                                    const taxRate = isPeninsula ? 0.21 : 0;
                                                    const priceNum = ONBOARDING_PLAN_PRICES[formData.plan] || 0;
                                                    const tax = priceNum * taxRate;
                                                    const total = priceNum + tax;
                                                    return (
                                                        <>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-slate-400 font-bold">Subtotal</span>
                                                                <span className="text-white font-bold">{priceNum}€</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-slate-400 font-bold">{isPeninsula ? 'IVA (21%)' : 'Impuestos (0%)'}</span>
                                                                <span className="text-white font-bold">{tax.toFixed(2)}€</span>
                                                            </div>
                                                            <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                                                                <span className="text-white font-black uppercase tracking-widest text-xs">Total</span>
                                                                <span className="text-3xl font-black text-white">{total.toFixed(2)}€</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* INFO DE PAGO CRÍTICA */}
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-3 mb-8">
                                            <div className="flex items-center gap-2 text-amber-400">
                                                <Wallet size={20} />
                                                <span className="font-black uppercase tracking-widest text-[10px]">Información de Activación</span>
                                            </div>
                                            <p className="text-xs text-amber-200/80 leading-relaxed font-bold">
                                                El pago se realiza mediante <span className="text-white underline decoration-amber-500/50 underline-offset-4">pasarela segura</span>. Recibirás el recibo por email inmediatamente después.
                                            </p>
                                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-amber-500 font-black uppercase tracking-wider leading-tight">
                                                    IMPORTANTE: Las herramientas de descarga y finalización no estarán activas hasta que se confirme el pago.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handlePayment('card')}
                                                disabled={loading}
                                                className="h-14 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-black rounded-2xl transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <CreditCard size={18} className="text-indigo-600" />
                                                <span className="uppercase tracking-widest text-xs">Tarjeta</span>
                                            </button>
                                            <button
                                                onClick={() => handlePayment('bizum')}
                                                disabled={loading}
                                                className="h-14 bg-[#00AAAD] hover:bg-[#009295] disabled:opacity-50 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <Smartphone size={18} />
                                                <span className="uppercase tracking-widest text-xs">Bizum</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-3">
                                    {formData.plan === 'flex' && (
                                        <button
                                            onClick={() => { setShowPaymentModal(false); setStep(4); }}
                                            disabled={loading}
                                            className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 group uppercase tracking-widest"
                                        >
                                            {loading ? 'Activando...' : 'Activar Mi Plataforma'}
                                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                        </button>
                                    )}
                                    <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed px-4 opacity-70">
                                        {formData.plan === 'flex' ? '🚀 SIN PAGO INICIAL. ACTIVACIÓN AHORA.' : '⚠️ LA PLATAFORMA SE ACTIVARÁ TRAS EL PAGO.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PoliticaPrivacidad isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
            <CondicionesVenta isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
    );
}
