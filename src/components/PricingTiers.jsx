import React from 'react';
import { Check, Sparkles, Building, Zap, Crown, User } from 'lucide-react';

export default function PricingTiers(props) {
    const onSelectPlan = props.onSelectPlan;
    const currentPlan = props.currentPlan || '';

    // Lógica de Precios Dinámicos según Plan Actual
    const getPlanPrice = (planId) => {
        if (planId === 'pro' && currentPlan === 'starter') return '300 €';
        if (planId === 'pro' && currentPlan === 'flex') return 'Promo Especial';

        const basePrices = {
            flex: '2,50 €',
            starter: '149 €',
            pro: '449 €',
            custom: 'Desde 850 €'
        };
        return basePrices[planId];
    };

    const getBonusMessage = (planId) => {
        if (planId === 'pro' && currentPlan === 'starter') return 'Ahorra 149€ ya invertidos';
        if (planId === 'pro' && currentPlan === 'flex') return 'Cashback 100% uso previo';
        if (planId === 'pro' && (currentPlan === 'starter' || currentPlan === 'flex')) return 'BORRÓN Y CUENTA NUEVA';
        return null;
    };

    const plans = [
        {
            id: 'flex',
            name: 'FLEX',
            price: getPlanPrice('flex'),
            period: '/ alumno',
            description: 'Ideal para fotógrafos ocasionales o pruebas.',
            icon: User,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-500/30',
            features: ['Pago por uso real', 'Todas las funciones pro', 'Sin compromiso anual'],
            highlight: false
        },
        {
            id: 'starter',
            name: 'STARTER',
            price: getPlanPrice('starter'),
            period: '/ campaña',
            description: 'Pequeños estudios (hasta 100 alumnos).',
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-500/30',
            features: ['Hasta 100 alumnos', 'Ahorro: 1,49€ media/alumno', 'Soporte prioritario'],
            highlight: false
        },
        {
            id: 'pro',
            name: 'PRO',
            price: getPlanPrice('pro'),
            period: '/ campaña',
            description: 'Profesionales con volumen (Ilimitado).',
            icon: Crown,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-500/50',
            features: ['Alumnos ilimitados', 'Ahorro: 0,89€ media/alumno', 'Gestión multi-colegio avanzada'],
            highlight: true,
            badge: getBonusMessage('pro') || 'MÁS POPULAR'
        },
        {
            id: 'custom',
            name: 'CUSTOM',
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
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Elige tu Plan</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sin riesgo. Paga solo por lo que necesitas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {plans.map((plan) => (
                    <button
                        key={plan.id}
                        disabled={plan.id === currentPlan}
                        onClick={() => onSelectPlan(plan.id)}
                        className={`relative w-full text-left p-6 rounded-[30px] border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group overflow-hidden bg-slate-900/40 backdrop-blur-xl ${plan.id === currentPlan ? 'opacity-50 cursor-not-allowed border-indigo-500/50 bg-indigo-500/5' : plan.highlight ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-400' : 'border-white/5 hover:border-white/20'}`}
                    >
                        {/* Background Effects */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-all group-hover:blur-[60px] ${plan.bg}`} />

                        {plan.id === currentPlan ? (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-b-xl shadow-lg">
                                TU PLAN ACTUAL
                            </div>
                        ) : plan.badge ? (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-b-xl shadow-lg">
                                {plan.badge}
                            </div>
                        ) : null}

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${plan.bg} ${plan.color} ${plan.border}`}>
                                    <plan.icon size={24} />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${plan.bg} ${plan.color} ${plan.border}`}>
                                    {plan.name}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-3xl font-black text-white drop-shadow-md">
                                    {plan.price}
                                </p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {plan.period}
                                </p>
                            </div>

                            <p className="text-sm text-slate-300 font-semibold mb-6 h-10">
                                {plan.description}
                            </p>

                            <ul className="space-y-3">
                                {plan.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                                        <div className={`rounded-full p-1 ${plan.bg} ${plan.color}`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8 text-center p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-sm">
                <Sparkles size={20} className="text-indigo-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                    Si te interesa el <span className="text-white">White Label</span> propio (1.250€), selecciona el Plan Custom y te contactaremos.
                </p>
            </div>
        </div>
    );
}
