const colorMap = {
    indigo: { bg: 'bg-accent/10', border: 'border-accent/20', icon: 'text-accent', val: 'text-primary' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', val: 'text-primary' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', val: 'text-emerald-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400', val: 'text-amber-500' },
};

export default function StatCard({ icon, label, value, color = 'indigo' }) {
    const c = colorMap[color] || colorMap.indigo;
    return (
        <div className="card p-5 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.icon}`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-60">{label}</p>
                <p className={`text-2xl font-black mt-0.5 ${c.val}`}>{value}</p>
            </div>
        </div>
    );
}
