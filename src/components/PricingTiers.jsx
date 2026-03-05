import React from 'react';
import { Check, Sparkles, Building, Zap, Crown, User } from 'lucide-react';

export default function PricingTiers(props) {
    const onSelectPlan = props.onSelectPlan;
    const currentPlan = props.currentPlan || '';

    // Lógica de Precios Dinámicos según Plan Actual
    const getPlanPrice = (id) => {
        if (id === 'pro') {
            if (currentPlan === 'starter') {
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm line-through opacity-40">449€</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20">-149€ STARTER</span>
                        </div>
                        <span className="text-4xl font-black">300 €</span>
                    </div>
                );
            }
            if (currentPlan === 'flex') {
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm line-through opacity-40">449€</span>
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20">CASHBACK 100%</span>
                        </div>
                        <span className="text-4xl font-black">449 €*</span>
                        <span className="text-[9px] opacity-60 font-medium italic mt-1">*Se descontará lo ya pagado en Flex</span>
                    </div>
                );
            }
            return '449 € + IVA';
        }

        const basePrices = {
            flex: '2,00 €',
            starter: '149 € + IVA',
            custom: (
                <div className="flex flex-col">
                    <span className="text-2xl font-black">Desde 850 € + IVA</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase mt-1 tracking-tighter">White Label: 1.250 € + IVA</span>
                </div>
            )
        };
        return basePrices[id];
    };

    const getPlanName = (id) => {
        if (id === 'pro' && (currentPlan === 'starter' || currentPlan === 'flex')) return 'Promo Especial';
        return id.toUpperCase();
    };

    const getBonusMessage = (planId) => {
        if (planId === 'pro' && currentPlan === 'starter') return 'UPGRADE PREFERENTE';
        if (planId === 'pro' && currentPlan === 'flex') return 'RECUPERA TU INVERSIÓN';
        return null;
    };

    const plans = [
        {
            id: 'flex',
            name: getPlanName('flex'),
            price: getPlanPrice('flex'),
            period: '/ alumno',
            description: 'Ideal para fotógrafos ocasionales o pruebas.',
            icon: User,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-500/30',
            features: ['Soporte Estándar (Email)', 'Todas las funciones pro', 'Sin permanencia'],
            highlight: false
        },
        {
            id: 'starter',
            name: getPlanName('starter'),
            price: getPlanPrice('starter'),
            period: '/ campaña',
            description: 'Pequeños estudios (hasta 100 alumnos).',
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-500/30',
            features: ['Máximo 100 Alumnos', 'Máximo 2 Colegios/Centros', 'Soporte Prioritario WhatsApp'],
            highlight: false
        },
        {
            id: 'pro',
            name: getPlanName('pro'),
            price: getPlanPrice('pro'),
            period: '/ campaña',
            description: 'Profesionales con volumen (Ilimitado).',
            icon: Crown,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-500/50',
            features: ['Alumnos Ilimitados', 'Colegios Ilimitados', 'Gestión Multicolegio Avanzada'],
            highlight: true,
            badge: getBonusMessage('pro') || 'MÁS POPULAR'
        },
        {
            id: 'custom',
            name: getPlanName('custom'),
            price: getPlanPrice('custom'),
            period: '',
            description: 'Estudios con flujos especiales y Agencias.',
            icon: Building,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-500/30',
            features: ['White Label disponible', 'Desarrollo a medida', 'Soporte técnico dedicado'],
            highlight: false
        }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Elige tu Plan</h2>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Sin riesgo. Paga solo por lo que necesitas.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {plans.map((plan) => (
                    <button
                        key={plan.id}
                        disabled={plan.id === currentPlan}
                        onClick={() => onSelectPlan(plan.id)}
                        className={`relative w-full text-left p-3 sm:p-5 rounded-2xl sm:rounded-[30px] border-2 transition-all duration-300 active:scale-95 sm:hover:scale-105 group overflow-hidden bg-slate-900/40 backdrop-blur-xl ${plan.id === currentPlan ? 'opacity-50 cursor-not-allowed border-indigo-500/50 bg-indigo-500/5' : plan.highlight ? 'border-blue-500/50 shadow-lg hover:border-blue-400' : 'border-white/5 hover:border-white/10'}`}
                    >
                        {/* Status Badge */}
                        {plan.id === currentPlan ? (
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                                ACTUAL
                            </div>
                        ) : plan.badge ? (
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                                {plan.badge === 'MÁS POPULAR' ? 'POPULAR' : plan.badge}
                            </div>
                        ) : null}

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${plan.bg} ${plan.color} ${plan.border}`}>
                                    <plan.icon size={20} />
                                </div>
                                <span className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${plan.color}`}>
                                    {plan.name}
                                </span>
                            </div>

                            <div>
                                <div className="text-lg sm:text-2xl font-black text-white leading-none">
                                    {plan.price}
                                </div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">
                                    {plan.period} {plan.id !== 'custom' && '+ IVA'}
                                </div>
                            </div>

                            <p className="text-[9px] sm:text-xs text-slate-400 font-medium leading-tight h-6 sm:h-8 overflow-hidden line-clamp-2">
                                {plan.description}
                            </p>

                            <ul className="space-y-1 sm:space-y-2 pt-1">
                                {plan.features.slice(0, 3).map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-[8px] sm:text-[10px] font-bold text-slate-300 leading-none">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.bg} ${plan.color}`}>
                                            <Check size={6} strokeWidth={5} />
                                        </div>
                                        <span className="line-clamp-1">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </button>
                ))}
            </div>

        </div>
    );
}
