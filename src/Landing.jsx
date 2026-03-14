import React, { useState, useEffect, useMemo } from 'react';
import {
    Zap,
    Target,
    Crown,
    TrendingDown,
    Wallet,
    MessageCircle,
    TrendingUp,
    ShieldCheck,
    Info,
    Camera,
    Smartphone,
    Layout,
    Star,
    Award,
    ChevronRight,
    ArrowRight,
    MousePointer2,
    Shield
} from 'lucide-react';
import PricingTiers from './components/PricingTiers.jsx';
import OptimizedImage from './components/common/OptimizedImage.jsx';

/**
 * LANDING PAGE INTEGRAL V8.3 - FULL COLOR RESTORED
 * Diseño equilibrado (comedido) pero con todos los colores, brillos y orbes restaurados.
 */
const Landing = ({ onAdminAccess, onOpenAvisoLegal, onOpenPrivacidad, onOpenCondiciones }) => {
    const [numStudents, setNumStudents] = useState(160);
    const [numSchools, setNumSchools] = useState(1);
    const [avgTicket, setAvgTicket] = useState(25);
    const productionCost = 9.33;

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      @keyframes float-gentle {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
      }
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.2); }
        50% { box-shadow: 0 0 50px rgba(79, 70, 229, 0.5); }
      }
      @keyframes slide-reveal-premium {
        from { transform: translateY(30px); opacity: 0; filter: blur(10px); }
        to { transform: translateY(0); opacity: 1; filter: blur(0); }
      }
      .animate-float-gentle { animation: float-gentle 6s ease-in-out infinite; }
      .animate-glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }
      .reveal { opacity: 0; transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
      .reveal.active { opacity: 1; animation: slide-reveal-premium 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      
      .gradient-text-white {
        background: linear-gradient(to bottom, #ffffff 30%, #a5b4fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .glass-card-dark {
        background: rgba(11, 14, 20, 0.6);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .text-glow { text-shadow: 0 0 15px rgba(255,255,255,0.2); }
      
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background: #6366f1;
        cursor: pointer;
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        border: 4px solid #fff;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      input[type=range]::-webkit-slider-thumb:hover {
        transform: scale(1.2) rotate(90deg);
        box-shadow: 0 0 25px rgba(99, 102, 241, 0.6);
      }
      .shadow-glow-orange { box-shadow: 0 15px 40px rgba(249, 115, 22, 0.2); }
      .shadow-glow-indigo { box-shadow: 0 15px 40px rgba(79, 70, 229, 0.2); }
      .shadow-glow-emerald { box-shadow: 0 15px 40px rgba(16, 185, 129, 0.2); }
    `;
        document.head.appendChild(style);

        // Intersection Observer para animaciones de Reveal
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }, 100);

        return () => {
            document.head.removeChild(style);
            observer.disconnect();
        };
    }, []);

    const plans = [
        {
            id: 'flex',
            label: 'FLEX',
            basePrice: 2.00,
            isFixed: false,
            color: 'from-orange-500 to-red-600',
            accentColor: 'text-orange-500',
            glowClass: 'shadow-glow-orange',
            icon: <Zap size={48} />,
            miniIcon: <Zap size={20} />,
            conditions: "0€ Inversión. 2,00€ por alumno.",
            description: "Sin riesgo. Ideal para probar o uso ocasional."
        },
        {
            id: 'starter',
            label: 'STARTER',
            basePrice: 149,
            isFixed: true,
            studentLimit: 150,
            schoolLimit: 2,
            color: 'from-indigo-500 to-blue-600',
            accentColor: 'text-indigo-500',
            glowClass: 'shadow-glow-indigo',
            icon: <Target size={48} />,
            miniIcon: <Target size={20} />,
            conditions: "Tarifa Plana. Máx 150 alumnos / 2 centros.",
            description: "Opción más rentable entre 75 y 150 alumnos."
        },
        {
            id: 'pro',
            label: 'PRO',
            basePrice: 449,
            isFixed: true,
            studentLimit: Infinity,
            schoolLimit: Infinity,
            color: 'from-emerald-500 to-teal-700',
            accentColor: 'text-emerald-400',
            glowClass: 'shadow-glow-emerald',
            icon: <Crown size={48} />,
            miniIcon: <Crown size={20} />,
            conditions: "Ilimitado. Máximo ahorro por volumen.",
            description: "A partir de 225 alumnos, este es tu plan."
        }
    ];

    const results = useMemo(() => {
        const grossIncome = numStudents * avgTicket;
        const totalProdCost = numStudents * productionCost;
        const grossProfit = grossIncome - totalProdCost;

        return plans.map(plan => {
            const planCost = plan.isFixed ? plan.basePrice : (numStudents * plan.basePrice);
            const netProfit = grossProfit - planCost;
            const costPerStudent = planCost / numStudents;
            const isDisabled = (plan.studentLimit && numStudents > plan.studentLimit) ||
                (plan.schoolLimit && numSchools > plan.schoolLimit);

            return {
                ...plan,
                planCost,
                netProfit,
                costPerStudent,
                isDisabled,
                grossIncome
            };
        });
    }, [numStudents, numSchools, avgTicket]);

    const filteredResults = useMemo(() => {
        // Regla 2026: Si supera 150 alumnos, Starter desaparece (límite técnico)
        return results.filter(p => !(p.id === 'starter' && numStudents > 150));
    }, [results, numStudents]);

    const verdictMessage = useMemo(() => {
        if (numStudents < 75) return "Estás en zona protegida FLEX. Ideal para arrancar sin riesgo.";
        if (numStudents >= 75 && numStudents < 225) {
            if (numSchools > 2 || numStudents > 150) return "Campaña de volumen. El Plan PRO es tu única opción segura.";
            return "Punto de ahorro Starter. Estás pagando menos de 1€ por alumno.";
        }
        return "Eficiencia PRO detectada. Tu coste por alumno es marginal.";
    }, [numStudents, numSchools]);

    const bestPlan = useMemo(() => {
        // Regla: Solo puede seleccionar planesEnabled
        const enabledPlans = filteredResults.filter(p => !p.isDisabled);
        if (enabledPlans.length === 0) return filteredResults[0];

        return [...enabledPlans].sort((a, b) => b.netProfit - a.netProfit)[0];
    }, [filteredResults]);

    return (
        <div className="min-h-screen bg-[#020408] font-sans text-white uppercase italic selection:bg-indigo-500/30 overflow-x-hidden">

            {/* NAVEGACIÓN - LOGO CENTRADO */}
            <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-2xl px-4 md:px-6 h-14 md:h-16 flex items-center justify-center">
                {/* Links Izquierda (solo escritorio) */}
                <div className="absolute left-4 md:left-8 hidden md:flex gap-6 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase italic">
                    <a href="#dashboard" className="hover:text-indigo-400 transition-colors">roi dashboard</a>
                    <a href="#nosotros" className="hover:text-indigo-400 transition-colors">estudio</a>
                </div>

                <div className="flex items-center">
                    <img
                        src={`${import.meta.env.BASE_URL || '/'}logo_white.png`}
                        alt="Pujalte Studio"
                        className="h-12 md:h-16 w-auto cursor-pointer active:scale-95 transition-transform"
                        onClick={onAdminAccess}
                    />
                </div>

                {/* Botón Derecha */}
                <div className="absolute right-4 md:right-8">
                    <a href="#contacto" className="bg-indigo-600/20 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-[9px] font-black tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-indigo-600/10 uppercase italic">contacto</a>
                </div>
            </nav>

            {/* HERO SECTION - COMPACTO EN MÓVIL */}
            <header className="relative pt-20 md:pt-44 pb-12 md:pb-32 overflow-hidden px-6 md:px-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[100%] bg-gradient-to-b from-indigo-600/20 via-transparent to-transparent blur-[120px] -z-10 animate-pulse" />
                <div className="max-w-7xl mx-auto relative z-10 text-center reveal">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] font-black tracking-[0.4em] mb-4 md:mb-8 uppercase">v8.3.2 - 15/03/2026 01:00</span>
                    <h1 className="text-3xl sm:text-5xl md:text-[110px] font-black tracking-tight mb-4 md:mb-8 leading-[1.2] md:leading-[1.15] text-glow px-4 py-8">
                        <span className="gradient-text-white inline-block pr-6">EL FIN DE </span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-600 to-indigo-300 inline-block pr-6">LAS ERRATAS.</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-slate-400 text-sm md:text-xl font-medium mb-8 md:pb-12 italic tracking-tight leading-relaxed reveal px-4">
                        Automatización <span className="relative inline-block px-2 group">
                            <span className="absolute inset-0 bg-indigo-600/30 blur-lg rounded-full animate-pulse -z-10" />
                            <span className="relative z-10 text-white font-black italic tracking-widest drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]">real</span>
                        </span> para fotógrafos que no perdonan un minuto de su tiempo.
                    </p>
                    <div className="flex justify-center gap-5 reveal">
                        <a href="#dashboard" className="bg-white text-black px-6 py-3.5 rounded-[20px] font-black text-[10px] md:text-[12px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-3 active:scale-95 group">
                            CALCULAR MI MARGEN <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                        </a>
                    </div>
                </div>
            </header>

            {/* DASHBOARD DE INVERSIÓN */}
            <section id="dashboard" className="py-8 md:py-24 px-3 md:px-8 bg-[#05070a] border-y border-white/5 relative">
                <div className="max-w-[1500px] mx-auto w-full">
                    <div className="flex flex-col xl:flex-row gap-6 md:gap-10 items-stretch">

                        {/* 1. CONFIGURACIÓN - ULTRA COMPACTA EN MÓVIL */}
                        <div className="xl:w-[28%] flex flex-col gap-4 reveal">
                            <div className="glass-card-dark border border-white/10 rounded-[24px] md:rounded-[40px] p-4 md:p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between backdrop-blur-xl">
                                <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-gradient-to-b from-indigo-600 to-violet-600"></div>
                                <div className="mb-4 md:mb-8 relative z-10 hidden md:block">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1 flex items-center gap-2">
                                        <Wallet size={14} /> CONFIGURACIÓN
                                    </h3>
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Ajusta los parámetros reales</p>
                                </div>

                                <div className="flex flex-row xl:flex-col gap-4 md:gap-12 relative z-10">
                                    <div className="flex-[1.8] xl:flex-1">
                                        <div className="flex justify-between mb-2 md:mb-3 items-end">
                                            <label className="text-[8px] md:text-[10px] font-black text-slate-300 tracking-widest uppercase">Alumnos</label>
                                            <span className="text-2xl md:text-5xl font-black text-white leading-none tracking-tighter">{numStudents}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={
                                                numStudents <= 200
                                                    ? (numStudents - 10) / 190 * 60
                                                    : numStudents <= 1000
                                                        ? 60 + (numStudents - 200) / 800 * 25
                                                        : 85 + (numStudents - 1000) / 4000 * 15
                                            }
                                            onChange={(e) => {
                                                const pos = parseFloat(e.target.value);
                                                let val;
                                                if (pos <= 60) {
                                                    val = 10 + (pos / 60) * 190;
                                                    val = Math.round(val);
                                                } else if (pos <= 85) {
                                                    val = 200 + ((pos - 60) / 25) * 800;
                                                    val = Math.round(val / 10) * 10;
                                                } else {
                                                    val = 1000 + ((pos - 85) / 15) * 4000;
                                                    val = Math.round(val / 100) * 100;
                                                }
                                                setNumStudents(val);
                                            }}
                                            className="w-full h-1.5 md:h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${numStudents <= 200
                                                    ? (numStudents - 10) / 190 * 60
                                                    : numStudents <= 1000
                                                        ? 60 + (numStudents - 200) / 800 * 25
                                                        : 85 + (numStudents - 1000) / 4000 * 15
                                                    }%, rgba(255, 255, 255, 0.05) ${numStudents <= 200
                                                        ? (numStudents - 10) / 190 * 60
                                                        : numStudents <= 1000
                                                            ? 60 + (numStudents - 200) / 800 * 25
                                                            : 85 + (numStudents - 1000) / 4000 * 15
                                                    }%, rgba(255, 255, 255, 0.05) 100%)`
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2 md:mb-3 items-end">
                                            <label className="text-[8px] md:text-[10px] font-black text-slate-300 tracking-widest uppercase">Centros</label>
                                            <span className="text-2xl md:text-5xl font-black text-white leading-none tracking-tighter">{numSchools}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="25"
                                            step="1"
                                            value={numSchools}
                                            onChange={(e) => setNumSchools(parseInt(e.target.value))}
                                            className="w-full h-1.5 md:h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(numSchools - 1) / (25 - 1) * 100}%, rgba(255, 255, 255, 0.05) ${(numSchools - 1) / (25 - 1) * 100}%, rgba(255, 255, 255, 0.05) 100%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. MAESTRO 1:1 + LISTA */}
                        <div className="xl:flex-1 flex flex-col md:flex-row gap-6 md:gap-10">

                            {/* BLOQUE HERO - MEJOR OPCIÓN (Muy compacto en móvil) */}
                            <div className="md:w-1/2 flex flex-col gap-6 md:gap-10">
                                <div className={`aspect-auto md:aspect-square rounded-[24px] md:rounded-[60px] bg-gradient-to-br ${bestPlan.color} p-5 md:p-12 flex flex-col justify-between ${bestPlan.glowClass} relative overflow-hidden transition-all duration-700 hover:scale-[1.01] animate-glow-pulse shadow-2xl flex-1`}>
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                                    <div className="relative z-10 flex justify-between items-start text-white">
                                        <div className="flex items-center gap-3 md:gap-6">
                                            <div className="glass-card p-3 md:p-6 rounded-xl md:rounded-[28px] border border-white/20 shadow-xl text-white">
                                                {React.cloneElement(bestPlan.icon, { size: window.innerWidth < 768 ? 24 : 48 })}
                                            </div>
                                            <div>
                                                <p className="text-[8px] md:text-[11px] font-black tracking-[0.4em] text-white/50 leading-none mb-1 md:mb-2 uppercase italic">mejor opción</p>
                                                <p className="text-xl md:text-4xl font-black tracking-tighter uppercase leading-none italic gradient-text-white">{bestPlan.label}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 py-2 md:py-10 text-center md:text-left">
                                        <p className="text-[8px] md:text-[12px] font-black tracking-[0.6em] text-white/30 mb-0 md:mb-2 md:ml-4 uppercase italic">coste / alumno</p>
                                        <div className="flex items-baseline justify-center md:justify-start gap-1 md:gap-3">
                                            <span className="text-[44px] md:text-[100px] lg:text-[140px] font-black leading-[0.8] tracking-tighter text-white drop-shadow-2xl italic">
                                                {bestPlan.costPerStudent.toFixed(2)}
                                            </span>
                                            <span className="text-base md:text-5xl font-black text-white/40 italic">€</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 md:mt-8 p-3 md:p-5 bg-black/20 rounded-xl md:rounded-[30px] border border-white/10 backdrop-blur-md animate-reveal hidden md:block">
                                        <p className="text-[8px] md:text-[10px] font-bold text-indigo-100 uppercase tracking-[0.15em] leading-relaxed italic">
                                            <span className="text-white font-black">Veredicto 2026:</span> {verdictMessage}
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-4 md:pt-8 border-t border-white/20 flex items-center justify-between text-white uppercase font-black text-[9px] md:text-[11px] tracking-[0.2em] mt-auto">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown size={14} className="md:size-5" />
                                            <span>Máxima rentabilidad</span>
                                        </div>
                                        <Award size={20} className="text-white/30 md:size-7" />
                                    </div>
                                </div>
                            </div>

                            {/* 3. LISTADO DETALLE (Muy compacto en móvil) */}
                            <div className="md:w-1/2 flex flex-col gap-2 md:gap-4 justify-between">
                                {filteredResults.map((plan) => (
                                    <div key={plan.id} className={`flex-1 min-h-0 border-2 rounded-2xl md:rounded-[40px] overflow-hidden transition-all duration-500 relative ${plan.isDisabled ? 'opacity-20 grayscale scale-[0.98]' : bestPlan.id === plan.id ? 'bg-white border-white shadow-2xl z-20 scale-[1.01] md:scale-[1.03]' : 'glass-card border-white/5 hover:border-indigo-500/30'}`}>
                                        <div className="flex h-full items-stretch">
                                            <div className={`w-20 lg:w-32 flex flex-col items-center justify-center border-r ${bestPlan.id === plan.id ? 'border-sky-50 bg-sky-50/10' : 'border-white/5 bg-white/5'}`}>
                                                <div className={`mb-1 ${plan.accentColor} scale-75 md:scale-100`}>{plan.miniIcon}</div>
                                                {!plan.isDisabled ? (
                                                    <>
                                                        <div className="flex items-baseline gap-0.5">
                                                            <p className={`text-xl md:text-2xl lg:text-4xl font-black tracking-tighter leading-none ${plan.accentColor}`}>{plan.costPerStudent.toFixed(2)}</p>
                                                            <span className={`text-[10px] font-black italic ${plan.accentColor}`}>€</span>
                                                        </div>
                                                        <span className="text-[7px] md:text-[9px] font-black text-slate-500 mt-1 tracking-[0.1em] uppercase">unitario</span>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center opacity-40">
                                                        <Shield size={20} className="text-slate-500 mb-1" />
                                                        <span className="text-[7px] font-black uppercase">N/A</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 p-3 md:p-6 flex flex-col justify-center gap-1 md:gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className={`text-sm md:text-2xl font-black tracking-tighter italic leading-none ${bestPlan.id === plan.id ? 'text-black' : 'text-white'}`}>{plan.label}</h4>
                                                        {!plan.isDisabled && <p className={`text-[7px] md:text-[10px] font-black italic mt-0.5 md:mt-1.5 tracking-widest ${bestPlan.id === plan.id ? 'opacity-40 text-black' : 'text-slate-500'}`}>SOFTWARE: {plan.planCost.toFixed(0)}€</p>}
                                                    </div>
                                                </div>
                                                <div className={`p-2 rounded-xl border flex items-start gap-2 ${plan.isDisabled ? 'bg-red-500/5 border-red-500/10 text-red-500/60' : bestPlan.id === plan.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                                    <Info size={12} className="shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 leading-none">{plan.isDisabled ? 'Límite técnico excedido' : plan.conditions}</p>
                                                        <p className="text-[7px] md:text-[9px] font-medium opacity-70 italic leading-tight lowercase line-clamp-1">{plan.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ARGUMENTARIO ESTRATÉGICO 2026 */}
                <div className="max-w-[1500px] mx-auto w-full px-3 md:px-0 py-12 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    <div className="glass-card-dark p-8 md:p-10 rounded-[40px] border-white/5 reveal relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <ShieldCheck size={60} className="text-emerald-500" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-black italic text-emerald-400 mb-4 uppercase tracking-tighter">Seguro de Erratas</h4>
                        <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed uppercase italic">
                            Un nombre mal escrito en una orla A3 te obliga a repetir la impresión para <span className="text-white font-black">toda la clase</span>. Nuestro software traslada la responsabilidad al padre: el riesgo de error desaparece.
                        </p>
                    </div>

                    <div className="glass-card-dark p-8 md:p-10 rounded-[40px] border-white/5 reveal relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <TrendingUp size={60} className="text-indigo-500" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-black italic text-indigo-400 mb-4 uppercase tracking-tighter">Recupera tu tiempo</h4>
                        <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed uppercase italic">
                            De <span className="text-white font-black">20 horas</span> de oficina por campaña a solo <span className="text-white font-black">10 minutos</span> con nuestro script. Recupera tus fines de semana de mayo y junio.
                        </p>
                    </div>

                    <div className="glass-card-dark p-8 md:p-10 rounded-[40px] border-white/5 reveal relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <Smartphone size={60} className="text-violet-500" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-black italic text-violet-400 mb-4 uppercase tracking-tighter">Imagen & Bizum</h4>
                        <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed uppercase italic">
                            Gestionar pagos por <span className="text-white font-black">Bizum</span> te permite subir el precio de tu pack. Si subes solo 3€ por niño, ¡el software te sale gratis y además ganas más margen neto!
                        </p>
                    </div>
                </div>

                {/* CTA de contacto directo post-calculadora - POSICIONADO DEBAJO */}
                <div className="max-w-[1500px] mx-auto w-full px-3 md:px-0">
                    <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-indigo-600 rounded-[30px] md:rounded-[50px] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] gap-6 md:gap-8 relative overflow-hidden group animate-reveal">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="relative z-10 text-center md:text-left">
                            <h4 className="text-2xl md:text-4xl font-black tracking-tighter italic leading-none mb-3 uppercase">¿ES LO QUE BUSCABAS?</h4>
                            <p className="text-indigo-100 text-sm md:text-lg font-bold uppercase tracking-widest opacity-90 max-w-xl">No pierdas más tiempo en gestión. Hablemos por WhatsApp y activamos tu cuenta en minutos.</p>
                        </div>
                        <a href="https://wa.me/34650494728" className="relative z-10 bg-white text-indigo-600 px-8 md:px-12 py-4 md:py-6 rounded-[20px] md:rounded-[30px] font-black text-sm md:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl italic whitespace-nowrap">
                            <MessageCircle size={24} className="fill-indigo-600" /> ¡EMPEZAR YA!
                        </a>
                    </div>
                </div>
            </section>

            {/* SECCIÓN PLANES PARA FOTÓGRAFOS - NUEVA */}
            <section id="planes" className="py-20 md:py-32 px-6 md:px-8 bg-[#020408] reveal">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 md:mb-24">
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] md:text-[9px] font-black tracking-[0.4em] mb-6 uppercase">TARIFAS PROFESIONALES 2026</span>
                        <h2 className="text-4xl md:text-[80px] font-black italic tracking-tight text-white leading-[1.1] md:leading-[1] uppercase text-glow">
                            PLANES QUE <br /> <span className="text-indigo-600">ESCALAN CONTIGO.</span>
                        </h2>
                    </div>

                    <div className="p-4 md:p-12 glass-card rounded-[40px] md:rounded-[60px] border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                        <PricingTiers
                            onSelectPlan={() => document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' })}
                            currentPlan=""
                        />
                    </div>

                </div>
            </section>

            {/* SECCIÓN SOBRE EL CREADOR */}
            <section id="nosotros" className="py-16 md:py-28 px-6 md:px-8 max-w-6xl mx-auto reveal" >
                <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
                    <div className="lg:w-[45%] relative group reveal w-full max-w-[400px] lg:max-w-none mx-auto">
                        <div className="absolute inset-0 bg-indigo-600 rounded-[40px] md:rounded-[60px] rotate-2 -z-10 opacity-10" />
                        <div className="aspect-[4/5] rounded-[40px] md:rounded-[60px] overflow-hidden border-[8px] md:border-[12px] border-[#0c0f14] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-[1.01]">
                            <OptimizedImage src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=1470" alt="Pujalte" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 glass-card bg-white/10 text-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] shadow-xl border border-white/20 animate-float-gentle backdrop-blur-xl">
                            <Camera size={24} className="mb-3 text-indigo-400 md:size-[32px]" />
                            <h4 className="text-2xl md:text-3xl font-black italic mb-1 tracking-tighter gradient-text-white">15 AÑOS</h4>
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">en el sector</p>
                        </div>
                    </div>
                    <div className="lg:w-[55%] text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 bg-indigo-500/10 px-4 py-1 rounded-full border border-indigo-500/20 text-indigo-400 text-[8px] md:text-[9px] font-black tracking-[0.3em] mb-6 md:mb-8 uppercase italic">insight fotográfico</div>
                        <h2 className="text-4xl md:text-[70px] font-black italic tracking-tighter mb-6 md:mb-8 leading-[0.9] md:leading-[0.85] text-white uppercase text-glow">SOFTWARE <br /> <span className="text-indigo-600">ARTESANAL.</span></h2>
                        <div className="space-y-4 md:space-y-6">
                            <p className="text-slate-300 text-lg md:text-2xl font-medium italic leading-relaxed lowercase">
                                soy <span className="text-white font-black underline decoration-indigo-600 uppercase tracking-widest text-glow">fotógrafo</span> hoy, igual que tú.
                            </p>
                            <p className="text-slate-500 text-sm md:text-base italic leading-relaxed lowercase px-4 lg:px-0">
                                He construido esta herramienta para eliminar las 48 horas de gestión manual que matan la creatividad de nuestro estudio cada temporada. lo que ves es eficiencia bruta aplicada a nuestra realidad.
                            </p>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8">
                            <div>
                                <h5 className="text-indigo-500 font-black text-lg mb-1 italic uppercase">0 erratas</h5>
                                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-widest leading-tight">precisión absoluta en alumnos.</p>
                            </div>
                            <div>
                                <h5 className="text-indigo-500 font-black text-lg mb-1 italic uppercase">0 fricción</h5>
                                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-widest leading-tight">pagos y control integrado.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER / CONTACTO */}
            <footer id="contacto" className="bg-[#05070a] border-t border-white/5 pt-24 md:pt-40 pb-12 md:pb-16 text-center px-6 md:px-8 relative overflow-hidden" >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>

                <div className="max-w-4xl mx-auto relative z-10 reveal">
                    <h2 className="text-4xl md:text-[90px] font-black italic tracking-tighter text-white mb-10 md:mb-16 leading-[0.9] uppercase text-glow italic">
                        ¿HACEMOS <br /> <span className="gradient-text-white underline decoration-white/10">HISTORIA?</span>
                    </h2>

                    <div className="flex justify-center mb-16 md:mb-24 px-2">
                        <a href="https://wa.me/34650494728" className="inline-flex items-center gap-4 md:gap-8 p-3 md:p-4 bg-white/5 border border-white/10 rounded-[30px] md:rounded-[40px] pr-8 md:pr-16 hover:bg-white/10 transition-all hover:scale-105 group shadow-[0_0_50px_rgba(79,70,229,0.2)] hover:shadow-[0_0_60px_rgba(79,70,229,0.4)] relative">
                            {/* Indicador de "Clickeable" pulsante */}
                            <div className="absolute -top-3 -right-2 md:-top-3 md:-right-3 bg-indigo-600 text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1.5 rounded-full shadow-lg animate-bounce border-2 border-[#05070a] uppercase tracking-widest">
                                ¡Escríbeme!
                            </div>

                            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-[22px] md:rounded-[28px] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500 relative shrink-0">
                                <MessageCircle className="size-8 md:size-9" />
                                <div className="absolute inset-0 bg-white rounded-[22px] md:rounded-[28px] animate-ping opacity-20"></div>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-0.5 md:mb-1 italic">habla conmigo ahora</p>
                                <p className="text-2xl md:text-4xl font-black italic tracking-tighter text-white leading-none mb-1 md:mb-2 italic">WHATSAPP DIRECTO</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Soporte estratégico activo</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-8 text-center border-y border-white/5 py-12 mb-16 max-w-2xl mx-auto">
                        <div>
                            <Smartphone className="mx-auto text-indigo-500 mb-3" size={24} />
                            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500">pwa mobile</p>
                        </div>
                        <div>
                            <Layout className="mx-auto text-indigo-500 mb-3" size={24} />
                            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500">intuitivo</p>
                        </div>
                        <div>
                            <MousePointer2 className="mx-auto text-indigo-500 mb-3" size={24} />
                            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500">one click</p>
                        </div>
                    </div>

                    <div className="text-[12px] font-black text-white tracking-[0.8em] uppercase italic opacity-100 whitespace-nowrap mb-8">
                        © 2026 PUJALTE STUDIO · MURCIA · TECNOLOGÍA FOTOGRÁFICA
                    </div>

                    {/* SECCIÓN LEGAL Y PAGOS PARA VALIDACIÓN BANCARIA (PAYCOMET) */}
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
                        {/* Datos Fiscales */}
                        <div className="text-left space-y-2 opacity-40 hover:opacity-100 transition-opacity">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identificación Legal</p>
                            <p className="text-[10px] font-bold text-white uppercase italic">JOSE PUJALTE MOLINA · NIF: 48427310M</p>
                            <p className="text-[9px] font-medium text-slate-500 lowercase italic">C/ CHILE, 21, 30565 LAS TORRES DE COTILLAS (MURCIA)</p>
                        </div>

                        {/* Enlaces Legales */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                            <button onClick={onOpenAvisoLegal} className="text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-colors italic">Aviso Legal</button>
                            <button onClick={onOpenPrivacidad} className="text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-colors italic">Privacidad</button>
                            <button onClick={onOpenCondiciones} className="text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-colors italic">Condiciones de Venta</button>
                        </div>

                        {/* Logos de Pago */}
                        <div className="flex items-center gap-6 opacity-60">
                            <img src={`${import.meta.env.BASE_URL || '/'}visa.png`} alt="Visa" className="h-4 md:h-5 w-auto object-contain brightness-0 invert" />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black italic text-white tracking-widest">MASTERCARD</span>
                                <div className="flex -space-x-1">
                                    <div className="w-4 h-4 rounded-full bg-red-500 opacity-80"></div>
                                    <div className="w-4 h-4 rounded-full bg-orange-500 opacity-80"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Landing;
