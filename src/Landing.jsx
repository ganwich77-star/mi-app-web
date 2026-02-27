import React, { useState, useMemo, useEffect } from 'react';
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
    MousePointer2
} from 'lucide-react';

/**
 * LANDING PAGE INTEGRAL V8.3 - FULL COLOR RESTORED
 * Diseño equilibrado (comedido) pero con todos los colores, brillos y orbes restaurados.
 */
const Landing = () => {
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
      @keyframes slide-reveal {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-float-gentle { animation: float-gentle 6s ease-in-out infinite; }
      .animate-glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }
      .animate-reveal { animation: slide-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .text-glow { text-shadow: 0 0 15px rgba(255,255,255,0.2); }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #4f46e5;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(79, 70, 229, 0.3);
        border: 3px solid #fff;
        transition: all 0.2s;
      }
      input[type=range]::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 0 20px rgba(79, 70, 229, 0.5);
      }
      .shadow-glow-orange { box-shadow: 0 0 40px rgba(249, 115, 22, 0.3); }
      .shadow-glow-indigo { box-shadow: 0 0 40px rgba(79, 70, 229, 0.3); }
      .shadow-glow-emerald { box-shadow: 0 0 40px rgba(16, 185, 129, 0.3); }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const plans = [
        {
            id: 'flex',
            label: 'FLEX',
            basePrice: 2.50,
            isFixed: false,
            color: 'from-orange-500 to-red-600',
            accentColor: 'text-orange-500',
            glowClass: 'shadow-glow-orange',
            icon: <Zap size={48} />,
            miniIcon: <Zap size={20} />,
            conditions: "Sin inversión inicial. Pago por uso.",
            description: "Ideal para inicios sin riesgos."
        },
        {
            id: 'starter',
            label: 'STARTER',
            basePrice: 149,
            isFixed: true,
            studentLimit: 100,
            schoolLimit: 2,
            color: 'from-indigo-500 to-blue-700',
            accentColor: 'text-indigo-400',
            glowClass: 'shadow-glow-indigo',
            icon: <Target size={48} />,
            miniIcon: <Target size={20} />,
            conditions: "Hasta 100 alumnos. 2 centros.",
            description: "La opción preferida local."
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
            conditions: "ILIMITADO. Soporte VIP.",
            description: "Máximo rendimiento de estudio."
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

            return { ...plan, planCost, netProfit, costPerStudent, isDisabled };
        });
    }, [numStudents, numSchools, avgTicket]);

    const bestPlan = [...results].filter(p => !p.isDisabled).sort((a, b) => b.netProfit - a.netProfit)[0] || results[0];

    return (
        <div className="min-h-screen bg-[#020408] font-sans text-white uppercase italic selection:bg-indigo-500/30 overflow-x-hidden">

            {/* NAVEGACIÓN */}
            <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-2xl px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">P</div>
                    <span className="font-black tracking-tighter text-lg">Pujalte <span className="text-indigo-500">Studio</span></span>
                </div>
                <div className="hidden md:flex gap-8 text-[10px] font-black tracking-[0.25em] text-slate-400">
                    <a href="#dashboard" className="hover:text-indigo-400 transition-colors uppercase">roi dashboard</a>
                    <a href="#nosotros" className="hover:text-white transition-colors uppercase">estudio</a>
                    <a href="#contacto" className="bg-indigo-600 px-5 py-1.5 rounded-full text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 uppercase">contacto</a>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="relative pt-44 pb-32 overflow-hidden px-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[100%] bg-gradient-to-b from-indigo-600/20 via-transparent to-transparent blur-[120px] -z-10 animate-pulse" />
                <div className="max-w-7xl mx-auto relative z-10 text-center animate-reveal">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black tracking-[0.4em] mb-8 uppercase">v8.3 integral precision</span>
                    <h1 className="text-6xl md:text-[110px] font-black tracking-tighter mb-8 leading-[0.85] text-glow">
                        EL FIN DE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-600 to-indigo-300">LAS ERRATAS.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-12 lowercase italic tracking-tight leading-relaxed">
                        automatización <span className="text-white font-black underline decoration-indigo-500 decoration-3">real</span> para fotógrafos que no perdonan un minuto de su tiempo.
                    </p>
                    <div className="flex justify-center gap-5">
                        <a href="#dashboard" className="bg-white text-black px-8 py-4 rounded-[24px] font-black text-[12px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-3 active:scale-95 group">
                            CALCULAR MI MARGEN <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </a>
                    </div>
                </div>
            </header>

            {/* DASHBOARD DE INVERSIÓN */}
            <section id="dashboard" className="py-24 px-8 bg-[#05070a] border-y border-white/5 relative">
                <div className="max-w-[1500px] mx-auto w-full">
                    <div className="flex flex-col xl:flex-row gap-10 items-stretch">

                        {/* 1. CONFIGURACIÓN */}
                        <div className="xl:w-[25%] flex flex-col gap-6 shrink-0">
                            <div className="bg-[#0b0e14] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between backdrop-blur-xl">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-600 to-violet-600"></div>
                                <div className="mb-8 relative z-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1 flex items-center gap-2">
                                        <Wallet size={14} /> CONFIGURACIÓN
                                    </h3>
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Ajusta los parámetros reales</p>
                                </div>

                                <div className="space-y-12 relative z-10">
                                    <div>
                                        <div className="flex justify-between mb-3 items-end">
                                            <label className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Nº de centros</label>
                                            <span className="text-5xl font-black text-white leading-none tracking-tighter">{numSchools}</span>
                                        </div>
                                        <input type="range" min="1" max="25" step="1" value={numSchools} onChange={(e) => setNumSchools(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-3 items-end">
                                            <label className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Alumnos totales</label>
                                            <span className="text-5xl font-black text-white leading-none tracking-tighter">{numStudents}</span>
                                        </div>
                                        <input type="range" min="10" max="2000" step="5" value={numStudents} onChange={(e) => setNumStudents(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-3 items-end">
                                            <label className="text-[10px] font-black text-slate-300 tracking-widest uppercase">PVP Pack Medio</label>
                                            <span className="text-5xl font-black text-white leading-none tracking-tighter">{avgTicket}€</span>
                                        </div>
                                        <input type="range" min="10" max="100" step="1" value={avgTicket} onChange={(e) => setAvgTicket(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-8 shadow-xl flex items-center justify-between border-b-4 border-indigo-950 relative overflow-hidden group">
                                <div className="flex flex-col relative z-10">
                                    <span className="text-[10px] font-black text-indigo-200 mb-1 uppercase tracking-widest">volumen negocio</span>
                                    <span className="text-4xl font-black italic tracking-tighter leading-none">{(numStudents * avgTicket).toLocaleString()}€</span>
                                </div>
                                <TrendingUp size={40} className="text-white opacity-20 relative z-10" />
                            </div>
                        </div>

                        {/* 2. MAESTRO 1:1 + LISTA */}
                        <div className="xl:flex-1 flex flex-col md:flex-row gap-10">

                            {/* BLOQUE HERO - MEJOR OPCIÓN */}
                            <div className={`md:w-1/2 aspect-square rounded-[60px] bg-gradient-to-br ${bestPlan.color} p-12 flex flex-col justify-between ${bestPlan.glowClass} relative overflow-hidden transition-all duration-700 hover:scale-[1.01] animate-glow-pulse`}>
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                                <div className="relative z-10 flex justify-between items-start text-white">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-black/30 p-6 rounded-[28px] backdrop-blur-xl border border-white/20 shadow-xl text-white">
                                            {bestPlan.icon}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black tracking-[0.4em] text-white/50 leading-none mb-2 uppercase italic">mejor opción</p>
                                            <p className="text-4xl font-black tracking-tighter uppercase leading-none italic">{bestPlan.label}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 py-6 text-center md:text-left">
                                    <p className="text-[12px] font-black tracking-[0.6em] text-white/30 mb-1 ml-4 uppercase italic">coste / alumno</p>
                                    <div className="flex items-baseline justify-center md:justify-start gap-3">
                                        <span className="text-[100px] lg:text-[140px] font-black leading-[0.8] tracking-tighter text-white drop-shadow-2xl italic">
                                            {bestPlan.costPerStudent.toFixed(2)}
                                        </span>
                                        <span className="text-4xl font-black text-white/40 italic">€</span>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-8 border-t border-white/20 flex items-center justify-between text-white uppercase font-black text-[11px] tracking-[0.2em]">
                                    <div className="flex items-center gap-4">
                                        <TrendingDown size={20} />
                                        <span>Máxima rentabilidad</span>
                                    </div>
                                    <Award size={28} className="text-white/30" />
                                </div>
                            </div>

                            {/* 3. LISTADO DETALLE */}
                            <div className="md:w-1/2 flex flex-col gap-4 justify-between">
                                {results.map((plan) => (
                                    <div key={plan.id} className={`flex-1 min-h-0 border-2 rounded-[40px] overflow-hidden transition-all duration-500 relative ${plan.isDisabled ? 'opacity-5 grayscale scale-[0.98] pointer-events-none' : bestPlan.id === plan.id ? 'bg-white border-white shadow-2xl z-20 scale-[1.03]' : 'bg-[#0c0f14] border-white/5 hover:border-indigo-500/30'}`}>
                                        <div className="flex h-full items-stretch">
                                            <div className={`w-24 lg:w-32 flex flex-col items-center justify-center border-r ${bestPlan.id === plan.id ? 'border-sky-50 bg-sky-50/10' : 'border-white/5 bg-white/5'}`}>
                                                <div className={`mb-2 ${plan.accentColor}`}>{plan.miniIcon}</div>
                                                <div className="flex items-baseline gap-1">
                                                    <p className={`text-3xl lg:text-4xl font-black tracking-tighter leading-none ${plan.accentColor}`}>{plan.costPerStudent.toFixed(2)}</p>
                                                    <span className={`text-sm font-black italic ${plan.accentColor}`}>€</span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 mt-2 tracking-[0.1em] uppercase">unitario</span>
                                            </div>
                                            <div className="flex-1 p-6 flex flex-col justify-center gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className={`text-2xl font-black tracking-tighter italic leading-none ${bestPlan.id === plan.id ? 'text-black' : 'text-white'}`}>{plan.label}</h4>
                                                        <p className={`text-[10px] font-black italic mt-1.5 tracking-widest ${bestPlan.id === plan.id ? 'opacity-40 text-black' : 'text-slate-500'}`}>TOTAL: {plan.planCost.toFixed(0)}€</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-1 italic uppercase">beneficio</p>
                                                        <p className={`text-3xl font-black tracking-tighter leading-none ${bestPlan.id === plan.id ? 'text-indigo-600' : 'text-white'}`}>{plan.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}€</p>
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-2xl border flex items-start gap-3 ${bestPlan.id === plan.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                                    <Info size={14} className="shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 leading-none">{plan.conditions}</p>
                                                        <p className="text-[9px] font-medium opacity-70 italic leading-tight lowercase">{plan.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA de contacto directo post-calculadora - POSICIONADO DEBAJO */}
                    <div className="mt-16 flex flex-col md:flex-row items-center justify-between p-12 bg-indigo-600 rounded-[50px] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] gap-8 relative overflow-hidden group animate-reveal">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="relative z-10 text-center md:text-left">
                            <h4 className="text-4xl font-black tracking-tighter italic leading-none mb-3">¿ESTO ES LO QUE BUSCABAS?</h4>
                            <p className="text-indigo-100 text-lg font-bold uppercase tracking-widest opacity-90 max-w-xl">No pierdas más tiempo en gestión. Hablemos por WhatsApp y activamos tu cuenta en minutos.</p>
                        </div>
                        <a href="https://wa.me/34650494728" className="relative z-10 bg-white text-indigo-600 px-12 py-6 rounded-[30px] font-black text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl italic whitespace-nowrap">
                            <MessageCircle size={24} className="fill-indigo-600" /> ¡QUIERO EMPEZAR YA!
                        </a>
                    </div>
                </div>
            </section>

            {/* SECCIÓN SOBRE EL CREADOR */}
            <section id="nosotros" className="py-28 px-8 max-w-6xl mx-auto" >
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-[45%] relative group">
                        <div className="absolute inset-0 bg-indigo-600 rounded-[60px] rotate-2 -z-10 opacity-10" />
                        <div className="aspect-[4/5] rounded-[60px] overflow-hidden border-[12px] border-[#0c0f14] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-[1.01]">
                            <img src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=1470" alt="Pujalte" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-white text-black p-8 rounded-[40px] shadow-xl border-4 border-[#020408] animate-float-gentle">
                            <Camera size={32} className="mb-4 text-indigo-600" />
                            <h4 className="text-3xl font-black italic mb-1 tracking-tighter">15 AÑOS</h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">en el sector</p>
                        </div>
                    </div>
                    <div className="lg:w-[55%]">
                        <div className="inline-flex items-center gap-3 bg-indigo-500/10 px-4 py-1 rounded-full border border-indigo-500/20 text-indigo-400 text-[9px] font-black tracking-[0.3em] mb-8 uppercase italic">insight fotográfico</div>
                        <h2 className="text-5xl md:text-[70px] font-black italic tracking-tighter mb-8 leading-[0.85] text-white uppercase text-glow">SOFTWARE <br /> <span className="text-indigo-600">ARTESANAL.</span></h2>
                        <div className="space-y-6">
                            <p className="text-slate-300 text-xl md:text-2xl font-medium italic leading-relaxed lowercase">
                                soy <span className="text-white font-black underline decoration-indigo-600 uppercase tracking-widest text-glow">fotógrafo</span> hoy, igual que tú.
                            </p>
                            <p className="text-slate-500 text-base italic leading-relaxed lowercase">
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
            </section >

            {/* FOOTER / CONTACTO */}
            < footer id="contacto" className="bg-[#05070a] border-t border-white/5 pt-40 pb-16 text-center px-8 relative overflow-hidden" >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-[90px] font-black italic tracking-tighter text-white mb-16 leading-[0.9] uppercase text-glow italic">
                        ¿HACEMOS <br /> <span className="text-indigo-500 underline decoration-white/10">HISTORIA?</span>
                    </h2>

                    <div className="flex justify-center mb-24">
                        <a href="https://wa.me/34650494728" className="inline-flex items-center gap-8 p-4 bg-white/5 border border-white/10 rounded-[40px] pr-16 hover:bg-white/10 transition-all hover:scale-105 group shadow-[0_0_50px_rgba(79,70,229,0.2)] hover:shadow-[0_0_60px_rgba(79,70,229,0.4)] relative">
                            {/* Indicador de "Clickeable" pulsante */}
                            <div className="absolute -top-3 -right-3 bg-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg animate-bounce border-2 border-[#05070a] uppercase tracking-widest">
                                ¡Escríbeme!
                            </div>

                            <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500 relative">
                                <MessageCircle size={36} />
                                <div className="absolute inset-0 bg-white rounded-[28px] animate-ping opacity-20"></div>
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 italic">habla conmigo ahora</p>
                                <p className="text-4xl font-black italic tracking-tighter text-white leading-none mb-2">WHATSAPP DIRECTO</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponible para soporte estratégico</p>
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

                    <div className="text-[12px] font-black text-white tracking-[0.8em] uppercase italic opacity-100 whitespace-nowrap">
                        © 2026 PUJALTE STUDIO · MURCIA · TECNOLOGÍA FOTOGRÁFICA
                    </div>
                </div>
            </footer >
        </div >
    );
};

export default Landing;
