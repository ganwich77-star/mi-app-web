import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Sparkles, 
  PartyPopper, 
  Star, 
  ChevronRight, 
  Image as ImageIcon,
  AlertTriangle,
  Heart,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import { db } from '../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

const DownloadPortal = ({ orderId, allExtras = [] }) => {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [showExtras, setShowExtras] = useState(true);
    const [finished, setFinished] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("No se ha encontrado el registro del alumno.");
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Error de conexión con el servidor.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleDownload = () => {
        const url = order?.digitalPhotoUrl || order?.photoFile;
        if (url) {
            window.open(url, '_blank');
        }
        setFinished(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Accediendo al Portal Digital...</p>
            </div>
        );
    }

    if (error || !orderId) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20 mb-6">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Acceso No Válido</h1>
                <p className="text-slate-400 font-bold text-sm max-w-xs">{error || "ID de descarga no proporcionado."}</p>
                <button onClick={() => window.location.href = '/'} className="mt-8 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest">Volver al Inicio</button>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-white text-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-[2.5rem] flex items-center justify-center border border-indigo-500/30 mb-8 relative">
                    <Heart size={48} className="text-indigo-400 animate-pulse" />
                    <Sparkles className="absolute -top-2 -right-2 text-amber-500" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">¡Muchas Gracias!</h1>
                <p className="text-slate-400 font-bold max-w-xs leading-relaxed">
                    Esperamos que disfrutes de tu recuerdo escolar. <br/>
                    Pujalte Creative Studio © 2026
                </p>
                <button onClick={() => window.location.href = '/'} className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">Salir del Portal</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
                {/* Header branding */}
                <header className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40">pujalte</span>
                        <span className="text-xs font-black uppercase tracking-[0.1em]">Creative Studio</span>
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                         <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Class of 2026</span>
                    </div>
                </header>

                <main className="flex-1 px-6 pb-20 flex flex-col">
                    {showExtras ? (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-8 duration-700">
                            {/* Warning Message */}
                            <div className="mt-4 mb-8 text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                                    <Sparkles size={12} className="text-amber-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Oferta Exclusiva Pack Físico</span>
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                                    ¡No dejes escapar esta oportunidad!
                                </h2>
                                <p className="text-slate-400 font-bold text-sm px-6">
                                    Tu recuerdo digital es valioso, pero nada supera la calidad de un pack impreso profesionalmente.
                                </p>
                            </div>

                            {/* Extras List */}
                            <div className="grid grid-cols-1 gap-3 mb-10">
                                {allExtras.length > 0 ? allExtras.map(extra => (
                                    <div key={extra.id} className="group bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform">
                                            {extra.emoji || '🎁'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black uppercase tracking-tight">{extra.name}</h4>
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mt-1">Desde {extra.price.toFixed(2)}€</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center opacity-20 font-black uppercase tracking-widest">No hay extras disponibles</div>
                                )}
                            </div>

                            {/* Decision Buttons */}
                            <div className="mt-auto space-y-4">
                                <button 
                                    onClick={() => window.location.href = `/?f=${order.photographerId || ''}`}
                                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart size={18} /> SÍ, QUIERO APROVECHARLO
                                </button>
                                
                                <button 
                                    onClick={() => setShowExtras(false)}
                                    className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                                >
                                    CONTINUAR SIN EXTRAS
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
                             {(order.digitalPhotoUrl || order.photoFile || order.photo_file_number) && (order.pack?.isDigital !== false) ? (
                                <>
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 mb-8 shadow-2xl shadow-emerald-500/10 relative">
                                        <ImageIcon size={48} className="text-emerald-500" />
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#020617]">
                                            <Download size={14} className="text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">¡Tu foto está lista!</h2>
                                    <p className="text-slate-400 font-bold mb-12 max-w-xs text-sm">
                                        Gracias por confiar en nosotros. Haz clic debajo para descargar tu recuerdo en alta definición.
                                    </p>
                                    
                                    <button 
                                        onClick={handleDownload}
                                        className="w-full py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-emerald-600/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <Download size={24} /> DESCARGAR AHORA
                                    </button>

                                    <button 
                                        onClick={() => setFinished(true)}
                                        className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white/60 transition-colors"
                                    >
                                        Finalizar sin descargar
                                    </button>
                                </>
                             ) : (
                                <>
                                    <div className="w-24 h-24 bg-slate-500/10 rounded-[2.5rem] flex items-center justify-center border border-slate-500/20 mb-8">
                                        <AlertTriangle size={48} className="text-slate-500" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Recuerdo Digital<br/><span className="text-slate-500">No Disponible</span></h2>
                                    <p className="text-slate-400 font-bold mb-12 max-w-xs text-sm">
                                        Aún no se ha subido tu fotografía o tu pedido no incluye la descarga digital en este momento.
                                    </p>
                                    
                                    <button 
                                        onClick={() => setFinished(true)}
                                        className="w-full py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 border border-white/10"
                                    >
                                        QUIERO PERDER ESTA OPORTUNIDAD
                                    </button>
                                </>
                             )}
                             
                             <div className="mt-12 pt-8 border-t border-white/5 w-full">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">{order.studentName}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{order.schoolName} — {order.course}</p>
                             </div>
                        </div>
                    )}
                </main>

                {/* Footer simple */}
                <footer className="p-8 text-center">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Pujalte Studio Secure Link</p>
                </footer>
            </div>
        </div>
    );
};

export default DownloadPortal;
