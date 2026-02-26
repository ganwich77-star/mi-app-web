export default function StepIndicator({ step }) {
    const steps = [
        { n: 1, label: 'Datos' },
        { n: 2, label: 'Pack' },
        { n: 3, label: 'Pago' },
    ];

    return (
        <div className="flex items-center justify-center gap-0 px-2 mb-4">
            {steps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 step-number
              ${step === s.n ? 'step-active' : step > s.n ? 'bg-accent/20 text-accent' : 'bg-primary/5 text-secondary'}`}
                        >
                            {step > s.n ? '✓' : s.n}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300
              ${step === s.n ? 'text-accent' : 'text-secondary opacity-60'}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-10 h-0.5 mx-2 mb-6 rounded-full transition-all duration-700
              ${step > s.n ? 'bg-accent shadow-glow' : 'bg-primary/10'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
