import React, { useState } from 'react';
import { Calculator, TrendingUp, Clock, Euro, Sparkles } from 'lucide-react';

export default function PricingCalculator() {
    // Usamos el valor del slider (0-100) para crear una curva no lineal
    const [sliderValue, setSliderValue] = useState(70); // 70% equivale a aprox 500 alumnos

    // Transformación cuadrática: más precisión en números bajos, avanza más rápido al final
    const ratio = Math.pow(sliderValue / 100, 2);
    const rawStudents = 10 + (1000 - 10) * ratio;
    const students = Math.max(10, Math.min(1000, Math.round(rawStudents / 5) * 5));


    // Cálculos de ejemplo (se ajustarán con los planes reales)
    const averageTicket = 35; // 35 euros de ticket medio estimado
    const totalRevenue = students * averageTicket;

    // Calcular la inversión óptima basada en los nuevos planes
    let platformCost = 0;
    let recommendedPlan = "";
    let planColor = "";
    let sliderGradientStart = "";
    let sliderGradientEnd = "";

    if (students < 60) {
        recommendedPlan = "PLAN FLEX";
        platformCost = students * 2.00;
        planColor = "text-emerald-400";
        sliderGradientStart = "#10b981";
        sliderGradientEnd = "#34d399";
    } else if (students <= 100) {
        recommendedPlan = "PLAN STARTER";
        platformCost = 149;
        planColor = "text-amber-400";
        sliderGradientStart = "#f59e0b";
        sliderGradientEnd = "#fbbf24";
    } else if (students < 180) {
        recommendedPlan = "PLAN FLEX";
        platformCost = students * 2.00;
        planColor = "text-emerald-400";
        sliderGradientStart = "#10b981";
        sliderGradientEnd = "#34d399";
    } else {
        recommendedPlan = "PLAN PRO";
        platformCost = 449;
        planColor = "text-blue-400";
        sliderGradientStart = "#3b82f6";
        sliderGradientEnd = "#60a5fa";
    }

    // Ahorro de horas estimado (ej. 5 min de gestión por alumno = 5/60 horas)
    const hoursSaved = Math.round(students * (5 / 60));

    return (
        <div className="w-full max-w-lg mx-auto mt-12 mb-12 p-8 bg-gradient-to-br from-[#0a0f1c] to-[#1a1528] rounded-[40px] border border-indigo-500/30 shadow-2xl relative overflow-hidden text-white animate-fade-in">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-600/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-4 mb-8 relative z-10 w-full">
                <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Calculator size={28} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black tracking-tight leading-none text-white">Calculadora ROI</h3>
                        <span className="px-2 py-1 bg-white/10 rounded-md text-[8px] font-black tracking-widest uppercase border border-white/10 text-white/70">
                            Modo Demo
                        </span>
                    </div>
                    <p className="text-xs font-bold text-indigo-300 mt-1 uppercase tracking-widest">Descubre tu potencial de ahorro</p>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {/* Slider */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-sm font-bold text-slate-300">Número de alumnos / año</label>
                        <span className="text-3xl font-black text-white">{students}</span>
                    </div>
                    <div className="relative pt-1">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(Number(e.target.value))}
                            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer border border-white/5"
                            style={{
                                accentColor: sliderGradientEnd,
                                background: `linear-gradient(to right, ${sliderGradientStart} 0%, ${sliderGradientEnd} ${sliderValue}%, #1e293b ${sliderValue}%, #1e293b 100%)`
                            }}
                        />
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-[24px]">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <TrendingUp size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ingresos Aprox.</span>
                        </div>
                        <p className="text-2xl font-black">{totalRevenue.toLocaleString()}€</p>
                        <p className="text-[10px] text-white/40 font-bold mt-1">Ticket medio 35€</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-[24px]">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ahorro Tiempo</span>
                        </div>
                        <p className="text-2xl font-black">{hoursSaved} <span className="text-sm text-indigo-200">h</span></p>
                        <p className="text-[10px] text-white/40 font-bold mt-1">Gesti&oacute;n automatizada</p>
                    </div>

                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-accent/20 p-6 rounded-[24px] col-span-2 flex items-center justify-between group">
                        <div>
                            <div className="flex items-center gap-2 text-accent mb-1">
                                <Sparkles size={16} className="animate-pulse" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${planColor}`}>{recommendedPlan}</span>
                            </div>
                            <p className="text-xs text-white/80 font-bold max-w-[180px] leading-tight mt-1">Inversi&oacute;n en Plataforma</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-white drop-shadow-lg">{platformCost.toLocaleString('es-ES', { minimumFractionDigits: recommendedPlan === 'PLAN FLEX' ? 2 : 0 })}€ <span className="text-sm text-white/40 font-normal">/{recommendedPlan === 'PLAN FLEX' ? 'total' : 'campaña'}</span></p>
                            <p className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase mt-1">Sale a {(platformCost / students).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ por alumno</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
