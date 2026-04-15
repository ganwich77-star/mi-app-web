import React from 'react';
import {
    User, ChevronRight, Package, CreditCard, CheckCircle,
    MessageSquare, Copy, Shield, Camera, Check, Sparkles,
    Trash2, ChevronDown, Plus, Minus, ArrowRight, Clock, GraduationCap,
    Mail, Phone
} from 'lucide-react';
import StepIndicator from '../StepIndicator.jsx';
import PackCard from '../PackCard.jsx';
import ExtraItem from '../ExtraItem.jsx';
import PricingCalculator from '../PricingCalculator.jsx';
import { toTitleCase } from '../../utils/formatters.js';
import OptimizedImage from '../common/OptimizedImage.jsx';

import { AlertTriangle } from 'lucide-react';

// --------------------------------------------------------------------------------
// COMPONENTE: UserErrorBoundary (CAPTURADOR DE ERRORES DE VISTA DE USUARIO)
// --------------------------------------------------------------------------------
class UserErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) {
        this.setState({ error });
        console.error("USER VIEW ERROR:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
                    <div className="max-w-md w-full bg-white border border-red-200 rounded-[2rem] p-8 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase mb-2">Error en la Aplicación</h1>
                        <p className="text-slate-500 font-medium mb-6 text-sm">
                            Lo sentimos, la aplicación ha encontrado un problema al cargar los datos. Por favor, intenta recargar la página.
                        </p>
                        <button onClick={() => window.location.reload()} className="bg-slate-900 text-white font-black py-4 px-8 rounded-2xl w-full active:scale-95 transition-all shadow-xl">
                            REINTENTAR AHORA
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const UserEnrollment = ({
    settings,
    theme,
    step,
    setStep,
    orderCompleted,
    setOrderCompleted,
    formData,
    setFormData,
    formError,
    setFormError,
    schools,
    COURSE_GROUPS,
    courseName,
    setCourseName,
    courseLine,
    setCourseLine,
    allPacks,
    allExtras,
    selectedPacks,
    setSelectedPacks,
    extras,
    setExtras,
    orderTotals,
    getPacksDesc,
    togglePack,
    updatePackQuantity,
    toggleExtra,
    enabledPaymentMethods,
    setShowGiftModal,
    handleFinalize,
    selectedSupplements,
    toggleSupplement,
    updateSupplementQuantity,
    copyToClipboard,
    CONTACT_PHONE,
    sendWhatsApp,
    resetForm,
    showLegalModal,
    setShowLegalModal,
    isDemo,
    handleSecretAdminAccess,
    photographerId
}) => {
    return (
        <div className="pb-safe min-h-[calc(100vh-120px)] animate-fade-in">
            <div className={`relative px-4 transition-all duration-500 text-center ${(step === 0 || step === 1) ? 'pt-8 pb-10' : 'pt-4 pb-4'}`}>
                <button
                    onClick={handleSecretAdminAccess}
                    className={`flex items-center justify-center mx-auto active:scale-95 transition-all duration-500 relative z-[750] pointer-events-auto ${(step === 0 || step === 1) ? 'w-36 mb-6' : 'w-20 mb-2'}`}
                >
                    {settings.logoUrl || settings.logoUrlDark ? (
                        <img
                            src={theme === 'dark' ? (settings.logoUrlDark || settings.logoUrl) : (settings.logoUrl || settings.logoUrlDark)}
                            alt="Logo"
                            className="w-full h-auto object-contain transition-all duration-500"
                            style={{ filter: (isDemo && theme === 'light') ? 'brightness(0)' : 'none' }}
                        />
                    ) : (
                        <img 
                            src={`${import.meta.env.BASE_URL}logo_white.png`} 
                            alt="Logo" 
                            className="w-full h-auto object-contain transition-all duration-500" 
                            style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }} 
                        />
                    )}
                </button>
                <h1 className={`font-black text-primary tracking-tight leading-none transition-all duration-500 ${(step === 0 || step === 1) ? 'text-4xl' : 'text-xl'}`}>
                    {(step === 0 || step === 1) ? <>Orlas<br /><span className="text-accent">2026</span></> : <>Orlas <span className="text-accent">2026</span></>}
                </h1>
            </div>

            <main className={`max-w-lg mx-auto px-4 transition-all duration-500 ${(step === 0 || step === 1) ? 'space-y-8 mt-4' : 'space-y-4 mt-0'} sm:mt-0`}>
                {!orderCompleted ? (
                    <>
                        {step > 0 && <StepIndicator step={step} />}

                        {/* PASO 0 - BIENVENIDA */}
                        {step === 0 && (
                            <div className="card p-10 space-y-6 text-center animate-slide-up relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[40px] pointer-events-none" />

                                <h2 className="text-3xl font-black text-black tracking-tight leading-tight">¡Te damos la<br /><span className="text-accent">bienvenida!</span></h2>

                                <p className="text-black font-bold leading-relaxed px-2">Rellena tus datos en solo 3 pasos para asegurar tu plaza en la orla de este año.</p>

                                <button onClick={() => setStep(1)} className="btn-primary w-full text-lg py-5 mt-4 flex items-center justify-center gap-3 font-black shadow-xl">
                                    Comenzar reserva <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* PASO 1 */}
                        {step === 1 && (
                            <div className="card p-8 space-y-6 animate-slide-up relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-400/10 rounded-full blur-[60px] pointer-events-none" />

                                <div className="flex items-center gap-4 mb-2 relative">
                                    <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                                        <User size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-primary tracking-tight leading-none">Datos del Alumno</h2>
                                        <p className="text-[10px] font-black text-secondary/60 tracking-widest uppercase mt-1">Paso 1 de 3</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-black font-black uppercase text-[10px] tracking-widest">Nombre y Apellidos *</label>
                                        <input
                                            type="text"
                                            lang="es"
                                            spellCheck={true}
                                            autoCorrect="on"
                                            autoCapitalize="characters"
                                            style={{ textTransform: 'uppercase' }}
                                            className={`input-dark ${formError && !formData.studentName.trim() ? 'border-red-500 bg-red-50' : ''}`}
                                            placeholder="EJ: MARIO LÓPEZ PÉREZ"
                                            value={formData.studentName}
                                            onChange={e => { setFormData({ ...formData, studentName: e.target.value.toUpperCase() }); if (formError) setFormError(''); }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-black font-black uppercase text-[10px] tracking-widest">Centro Educativo *</label>
                                        <div className="relative">
                                            <select className={`input-dark appearance-none pr-10 ${formError && !formData.schoolId ? 'border-red-500 bg-red-50' : ''}`} value={formData.schoolId} onChange={e => { setFormData({ ...formData, schoolId: e.target.value }); if (formError) setFormError(''); }}>
                                                <option value="">Selecciona tu Centro</option>
                                                {(schools || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-black font-black uppercase text-[10px] tracking-widest">Curso / Clase *</label>
                                        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
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

                                {/* ISLA DE FECHAS CRÍTICAS - DETECCIÓN DE EXCEPCIONES */}
                                {(() => {
                                    const exceptions = settings.dateExceptions || [];
                                    const sId = formData.schoolId;
                                    const cB = courseName;
                                    const gL = courseLine;

                                    if (!sId || !cB) return null;

                                    let ex = exceptions.find(e => e.schoolId === sId && e.courseName === cB && e.groupName === gL);
                                    if (!ex) ex = exceptions.find(e => e.schoolId === sId && e.courseName === cB && !e.groupName);

                                    if (!ex) return null;

                                    const dates = {
                                        shooting: ex?.shootingDate || settings.shootingDateDefault,
                                        deadline: ex?.appDeadline || settings.appDeadlineDefault,
                                        graduation: ex?.graduationDate || settings.graduationDateDefault
                                    };

                                    const fmt = (d) => {
                                        if (!d) return '--';
                                        const dt = new Date(d);
                                        return dt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                                    };

                                    return (
                                        <div className={`p-5 rounded-[2rem] border shadow-xl animate-scale-in my-4 transition-all duration-500
                                            ${theme === 'dark'
                                                ? 'bg-[#1E243A] border-slate-800/60 text-white'
                                                : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">

                                                {/* 1. SHOOTING */}
                                                <div className="flex flex-col items-center text-center py-1">
                                                    <div className="h-12 flex items-center justify-center mb-1">
                                                        <Camera size={38} className="text-[#d946ef]" strokeWidth={1.5} />
                                                    </div>
                                                    <p className={`text-[9px] font-black uppercase tracking-[0.15em] mb-1 whitespace-nowrap ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>SHOOTING</p>
                                                    <p className="text-xl font-black uppercase leading-tight">{fmt(dates.shooting)}</p>
                                                </div>

                                                {/* 2. LIMITE PAGO */}
                                                <div className={`flex flex-col items-center text-center py-1 border-y sm:border-y-0 sm:border-x ${theme === 'dark' ? 'border-slate-800/40' : 'border-slate-100'}`}>
                                                    <div className="h-12 flex items-center justify-center mb-1">
                                                        <CreditCard size={38} className="text-[#f59e0b]" strokeWidth={1.5} />
                                                    </div>
                                                    <p className={`text-[9px] font-black uppercase tracking-[0.15em] mb-1 whitespace-nowrap ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>LIMITE PAGO</p>
                                                    <p className="text-xl font-black uppercase leading-tight">{fmt(dates.deadline)}</p>
                                                </div>

                                                {/* 3. GRADUACIÓN */}
                                                <div className="flex flex-col items-center text-center py-1">
                                                    <div className="h-12 flex items-center justify-center mb-1">
                                                        <GraduationCap size={38} className="text-[#10b981]" strokeWidth={1.5} />
                                                    </div>
                                                    <p className={`text-[9px] font-black uppercase tracking-[0.15em] mb-1 whitespace-nowrap ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>GRADUACIÓN</p>
                                                    <p className="text-xl font-black uppercase leading-tight">{fmt(dates.graduation)}</p>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })()}

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
                                <div className="flex items-center gap-4 mb-3 relative px-1 pt-0">
                                    <button onClick={() => setStep(1)} className="w-10 h-10 rounded-[14px] bg-white/5 border border-primary/10 flex items-center justify-center shadow-sm text-primary hover:bg-white/10 active:scale-95 transition-all">
                                        <ChevronRight size={18} className="rotate-180" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-black text-black tracking-tight leading-none">Selecciona tu Pack</h2>
                                        <p className="text-[9px] font-black text-black tracking-widest uppercase mt-0.5">Configura tu pedido · 2/3</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {(allPacks || []).map(pack => {
                                        const isSelected = !!selectedPacks?.[pack.id];
                                        const supplementsList = settings.supplements || [];
                                        const activeSupplements = supplementsList.filter(s => s.active);
                                        
                                        return (
                                            <div key={pack.id} className="mb-4">
                                                <PackCard
                                                    pack={pack}
                                                    selected={isSelected}
                                                    quantity={selectedPacks[pack.id] || 1}
                                                    onSelect={() => togglePack(pack.id)}
                                                    onUpdateQuantity={(q) => updatePackQuantity(pack.id, q)}
                                                />
                                                
                                                {/* Suplementos por Pack */}
                                                {isSelected && (
                                                    <div className="ml-4 pl-4 border-l-2 border-indigo-500/20 py-2 space-y-3 mt-2 bg-indigo-500/5 rounded-r-2xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Sparkles size={14} className="text-indigo-500" />
                                                            <span className="text-[10px] font-black text-black uppercase tracking-wider">Suplementos para este pack</span>
                                                        </div>
                                                        
                                                        {activeSupplements.length > 0 ? (
                                                            activeSupplements.map(s => {
                                                                const supQty = selectedSupplements[pack.id]?.[s.id] || 0;
                                                                return (
                                                                    <div key={s.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${supQty > 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-primary/5 border-transparent'}`}>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold text-black">{s.name}</span>
                                                                            <span className="text-[10px] font-black text-indigo-500">+{s.price}€/ud</span>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-2">
                                                                            {supQty > 0 ? (
                                                                                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-1 border border-white/10">
                                                                                    <button 
                                                                                        onClick={(e) => { e.stopPropagation(); updateSupplementQuantity(pack.id, s.id, supQty - 1); }}
                                                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-500 text-white active:scale-95 transition-all"
                                                                                    >
                                                                                        <Minus size={14} />
                                                                                    </button>
                                                                                    <span className="text-xs font-black text-primary w-4 text-center">{supQty}</span>
                                                                                    <button 
                                                                                        onClick={(e) => { e.stopPropagation(); updateSupplementQuantity(pack.id, s.id, supQty + 1); }}
                                                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-500 text-white active:scale-95 transition-all"
                                                                                    >
                                                                                        <Plus size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); toggleSupplement(pack.id, s.id); }}
                                                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                                                                                >
                                                                                    <Plus size={14} /> Añadir
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center py-2 italic opacity-60">Sin suplementos disponibles</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {formError && <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake uppercase">{formError}</div>}

                                    <button onClick={() => {
                                        if (Object.keys(selectedPacks).length === 0) {
                                            setFormError('SELECCIONA AL MENOS 1 PACK PARA CONTINUAR');
                                            return;
                                        }
                                        setFormError('');
                                        setStep(3);
                                    }} className="btn-primary w-full text-base font-black flex items-center justify-center gap-2">
                                        CONTINUAR <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PASO 3 */}
                        {step === 3 && (
                            <div className="space-y-5 animate-slide-right">
                                <div className="flex items-center gap-4 mb-3 relative px-1 pt-0">
                                    <button onClick={() => setStep(2)} className="w-10 h-10 rounded-[14px] bg-white/5 border border-primary/10 flex items-center justify-center shadow-sm text-primary hover:bg-white/10 active:scale-95 transition-all">
                                        <ChevronRight size={18} className="rotate-180" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-black text-black tracking-tight leading-none">Resumen de tu pedido</h2>
                                        <p className="text-[9px] font-black text-black tracking-widest uppercase mt-0.5">Finalizar pedido · 3/3</p>
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-[30px] p-8 text-center bg-accent/5 border-accent/20 shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
                                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-2">Total del pedido</p>
                                    <p className="text-6xl font-black text-black leading-none">{orderTotals.price.toFixed(0)}<span className="text-3xl text-accent ml-1">€</span></p>
                                    <p className="text-[10px] text-black mt-3 font-black uppercase tracking-widest leading-relaxed">
                                        {getPacksDesc()}
                                    </p>
                                </div>

                                <div className="card p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-black flex items-center gap-2"><Package size={18} className="text-accent" /> Añadir extras opcionales</h3>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {(allExtras || []).map(extra => <ExtraItem key={extra.id} extra={extra} qty={extras?.[extra.id] || 0} onToggle={(delta) => toggleExtra(extra.id, delta)} />)}
                                    </div>

                                    <div className="flex gap-3 items-start p-4 rounded-2xl bg-amber-400/8 border border-amber-400/20 mt-2">
                                        <span className="text-lg leading-none mt-0.5">⚡</span>
                                        <div>
                                            <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Precio exclusivo al hacer el pedido</p>
                                            <p className="text-xs text-secondary leading-relaxed">Estos precios están disponibles <strong className="text-primary">únicamente a través de la app</strong> en el momento del pedido. Si se solicitan posteriormente, se aplicarán las tarifas vigentes del estudio.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card p-6">
                                    <h3 className="text-sm font-bold text-black flex items-center gap-2 mb-5"><CreditCard size={18} className="text-accent" /> Método de pago</h3>
                                    {enabledPaymentMethods.length > 0 ? (
                                        <div className={`grid ${enabledPaymentMethods.length === 1 ? 'grid-cols-1 max-w-[280px] mx-auto w-full' : 'grid-cols-2'} gap-4`}>
                                            {enabledPaymentMethods.map(m => (
                                                <button 
                                                    key={m.id} 
                                                    onClick={() => setFormData({ ...formData, paymentMethod: m.id })} 
                                                    className={`
                                                        relative flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-3xl font-bold transition-all duration-300 active:scale-95 border-2
                                                        ${formData.paymentMethod === m.id 
                                                            ? 'border-accent bg-accent/10 text-accent shadow-xl shadow-accent/10 scale-[1.02]' 
                                                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-3xl transition-transform duration-300 ${formData.paymentMethod === m.id ? 'scale-110' : ''}`}>{m.icon}</span>
                                                    <span className="text-xs uppercase tracking-widest font-black">{m.label}</span>
                                                    {formData.paymentMethod === m.id && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                                            <CheckCircle size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-500 text-sm text-center py-3">Sin métodos de pago activos.</p>}
                                </div>

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
                            <h2 className="text-3xl font-black text-black tracking-tight">¡Reserva Completada!</h2>
                            <p className="text-black text-sm font-black uppercase tracking-widest px-4">{formData.paymentMethod === 'bizum' ? 'Completa el Bizum y envíanos el justificante.' : 'Realiza el pago y avísanos por WhatsApp.'}</p>
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
                                    <button onClick={() => copyToClipboard(settings.contactPhone || CONTACT_PHONE, 'teléfono')} className="w-full flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/10 active:bg-primary/10 transition-all"><div className="text-left"><p className="text-[10px] text-secondary font-black tracking-widest opacity-40 uppercase">Teléfono Bizum</p><p className="text-xl font-black text-primary mt-1">{settings.contactPhone || CONTACT_PHONE}</p></div><Copy size={20} className="text-secondary opacity-60" /></button>
                                    <button onClick={() => copyToClipboard(`ORLA ${formData.studentName}`, 'concepto')} className="w-full flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/10 active:bg-primary/10 transition-all"><div className="text-left"><p className="text-[10px] text-secondary font-black tracking-widest opacity-40 uppercase">Concepto</p><p className="text-lg font-black text-primary mt-1 truncate max-w-[200px]">ORLA {formData.studentName}</p></div><Copy size={20} className="text-secondary opacity-60" /></button>
                                </div>
                            )}

                            {/* Mostrar email y contacto si existe en ajustes */}
                            {(settings.notificationEmail || settings.contactPhone) && formData.paymentMethod !== 'bizum' && (
                                <div className="space-y-3 pt-4 border-t border-primary/5">
                                    {settings.notificationEmail && (
                                        <button onClick={() => copyToClipboard(settings.notificationEmail, 'email')} className="w-full flex items-center justify-between p-4 rounded-xl bg-primary/2 border border-primary/5 active:bg-primary/10 transition-all text-left">
                                            <div>
                                                <p className="text-[9px] text-secondary font-black tracking-widest opacity-40 uppercase">Email de soporte</p>
                                                <p className="text-xs font-black text-primary mt-0.5">{settings.notificationEmail}</p>
                                            </div>
                                            <Mail size={16} className="text-secondary opacity-40" />
                                        </button>
                                    )}
                                    {settings.contactPhone && (
                                        <button onClick={() => copyToClipboard(settings.contactPhone, 'teléfono')} className="w-full flex items-center justify-between p-4 rounded-xl bg-primary/2 border border-primary/5 active:bg-primary/10 transition-all text-left">
                                            <div>
                                                <p className="text-[9px] text-secondary font-black tracking-widest opacity-40 uppercase">Teléfono de contacto</p>
                                                <p className="text-xs font-black text-primary mt-0.5">{settings.contactPhone}</p>
                                            </div>
                                            <Phone size={16} className="text-secondary opacity-40" />
                                        </button>
                                    )}
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-2xl animate-slide-up space-y-5 relative my-auto">
                        
                        <div className="text-center space-y-2 relative">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 mb-2 shadow-inner">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Términos del Servicio</h3>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Seguridad y Privacidad</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-4 p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[12px] font-black text-slate-900 dark:text-white leading-tight mb-0.5">Responsabilidad de Datos</p>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">Errores de impresión por datos incorrectos serán costeados por el solicitante.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Shield size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[12px] font-black text-slate-900 dark:text-white leading-tight mb-0.5">Protección de Privacidad</p>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">Datos tratados exclusivamente para tu orla escolar.</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setFormData(prev => ({ ...prev, photoConsent: !prev.photoConsent }))}
                                className={`flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all duration-300 cursor-pointer text-center relative overflow-hidden group
                                    ${formData.photoConsent
                                        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30'
                                        : 'bg-slate-50 dark:bg-slate-800/80 border-amber-400 shadow-lg shadow-amber-500/20 animate-pulse'}`}
                            >
                                {formData.photoConsent && (
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none animate-slide-up" />
                                )}
                                
                                <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform duration-500 ${formData.photoConsent ? 'bg-white text-indigo-600 scale-110 shadow-xl' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                    {formData.photoConsent ? <Check size={28} strokeWidth={3} className="animate-scale-in" /> : <Camera size={24} className="animate-bounce" />}
                                </div>
                                
                                <div className="relative z-10 space-y-1.5">
                                    <h4 className={`text-sm font-black uppercase tracking-wider ${formData.photoConsent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                        {formData.photoConsent ? 'Autorización Firmada' : 'Firma de Autorización'}
                                    </h4>
                                    <p className={`text-[10px] max-w-[220px] mx-auto leading-relaxed ${formData.photoConsent ? 'text-white/90 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        Autorizo la toma y uso de imágenes de mi hijo/a para la orla escolar.
                                    </p>
                                </div>
                                
                                {!formData.photoConsent && (
                                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                disabled={!formData.photoConsent}
                                onClick={() => { setShowLegalModal(false); setStep(2); }}
                                className={`relative w-full py-4 text-sm font-black rounded-2xl transition-all duration-500 overflow-hidden group
                                    ${formData.photoConsent 
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.02]' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                            >
                                {formData.photoConsent && (
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {formData.photoConsent ? 'ACEPTAR Y CONTINUAR' : 'REQUIERE FIRMA PARA CONTINUAR'}
                                    {formData.photoConsent && <ChevronRight size={18} />}
                                </span>
                            </button>
                            <button onClick={() => setShowLegalModal(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest text-center py-2">
                                Cerrar y volver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserEnrollmentWithBoundary = (props) => (
    <UserErrorBoundary>
        <UserEnrollment {...props} />
    </UserErrorBoundary>
);

export default UserEnrollmentWithBoundary;
