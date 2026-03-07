import React from 'react';
import {
    User, ChevronRight, Package, CreditCard, CheckCircle,
    MessageSquare, Copy, Shield, Camera, Check, Sparkles,
    Trash2, ChevronDown, Plus, Minus, ArrowRight, Clock, GraduationCap
} from 'lucide-react';
import StepIndicator from '../StepIndicator.jsx';
import PackCard from '../PackCard.jsx';
import ExtraItem from '../ExtraItem.jsx';
import PricingCalculator from '../PricingCalculator.jsx';
import { toTitleCase } from '../../utils/formatters.js';
import OptimizedImage from '../common/OptimizedImage.jsx';

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
                        <OptimizedImage
                            src={theme === 'dark' ? (settings.logoUrlDark || settings.logoUrl) : (settings.logoUrl || settings.logoUrlDark)}
                            alt="Logo"
                            className="w-full h-auto object-contain transition-all duration-500"
                            style={{ filter: (isDemo && theme === 'light') ? 'brightness(0)' : 'none' }}
                        />
                    ) : (
                        <OptimizedImage src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="w-full h-auto object-contain transition-all duration-500" style={{ filter: theme === 'light' ? 'brightness(0)' : 'none' }} />
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

                                <h2 className="text-3xl font-black text-primary tracking-tight leading-tight">¡Te damos la<br /><span className="text-accent">bienvenida!</span></h2>

                                <p className="text-secondary font-medium leading-relaxed px-2">Rellena tus datos en solo 3 pasos para asegurar tu plaza en la orla de este año.</p>

                                <button onClick={() => setStep(1)} className="btn-primary w-full text-lg py-5 mt-4 flex items-center justify-center gap-3 font-black shadow-xl">
                                    Comenzar reserva <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* PASO 1 */}
                        {step === 1 && (
                            <div className="card p-8 space-y-6 animate-slide-up relative overflow-hidden">
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
                                        <h2 className="text-xl font-black text-primary tracking-tight leading-none">Selecciona tu Pack</h2>
                                        <p className="text-[9px] font-black text-secondary tracking-widest uppercase mt-0.5 opacity-50">Configura tu pedido · 2/3</p>
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

                                    {/* SECCIÓN SUPLEMENTOS */}
                                    {(settings.supplements || []).filter(s => s.active).length > 0 && (
                                        <div className="card p-6 mt-6 space-y-4 border-indigo-500/20 bg-indigo-500/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                                    <Sparkles size={16} />
                                                </div>
                                                <h3 className="text-sm font-black text-primary uppercase tracking-wider">Personaliza tu pedido</h3>
                                            </div>

                                            <div className="space-y-3">
                                                {settings.supplements.filter(s => s.active).map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => toggleSupplement(s.id)}
                                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98]
                                                            ${selectedSupplements[s.id]
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                : 'bg-primary/5 border-primary/5 text-secondary hover:border-indigo-500/30'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all
                                                                ${selectedSupplements[s.id] ? 'bg-white border-white text-indigo-600' : 'border-current opacity-20'}`}>
                                                                {selectedSupplements[s.id] && <Check size={14} strokeWidth={4} />}
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-tight">{s.name}</span>
                                                        </div>
                                                        <span className={`text-xs font-black ${selectedSupplements[s.id] ? 'text-white' : 'text-indigo-500'}`}>
                                                            +{s.price.toFixed(0)}€
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.15em] opacity-40 text-center px-4">
                                                Selecciona extras para mejorar el acabado de tu orla
                                            </p>
                                        </div>
                                    )}

                                    <button disabled={Object.keys(selectedPacks).length === 0} onClick={() => setStep(3)} className="btn-primary w-full text-base font-black flex items-center justify-center gap-2">
                                        Continuar <ChevronRight size={18} />
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
                                        <h2 className="text-xl font-black text-primary tracking-tight leading-none">Resumen de tu pedido</h2>
                                        <p className="text-[9px] font-black text-secondary tracking-widest uppercase mt-0.5 opacity-50">Finalizar pedido · 3/3</p>
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
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full blur-sm"></div>

                        <div className="text-center space-y-3 relative">
                            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mx-auto border border-primary/5 text-indigo-600 mb-2 shadow-xl shadow-indigo-500/10">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-primary tracking-tight">Términos del Servicio</h3>
                            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] opacity-40">Seguridad y Privacidad Garantizada</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-5 rounded-[28px] bg-white border border-primary/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-500">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 shadow-inner">
                                    <User size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[13px] font-black text-primary leading-tight">Responsabilidad de Datos</p>
                                    <p className="text-[11px] text-secondary leading-relaxed font-medium">Asumes la total exactitud de los datos. Errores de impresión por datos incorrectos serán costeados por el solicitante.</p>
                                </div>
                            </div>

                            <div className="flex gap-5 p-5 rounded-[28px] bg-white border border-primary/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-500">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
                                    <Shield size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[13px] font-black text-primary leading-tight">Protección de Privacidad</p>
                                    <p className="text-[11px] text-secondary leading-relaxed font-medium">Tus datos se tratarán exclusivamente para la gestión de este pedido por Pujalte Creative Studio.</p>
                                </div>
                            </div>

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
    );
};

export default UserEnrollment;
