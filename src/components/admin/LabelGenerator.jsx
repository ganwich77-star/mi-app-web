import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Settings,
  Sliders,
  QrCode,
  Globe,
  Phone,
  Sparkles,
  EyeOff,
  Eye,
  Zap,
  ShieldCheck,
  School,
  Users,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  FileText,
  Crop,
  Award,
  CheckCircle2,
  Tag,
  Shield
} from 'lucide-react';

/**
 * GENERADOR DE ETIQUETAS PUJALTE STUDIO V31.0 - "BRANDING MASTER"
 * Rediseño: Configuración horizontal desplegable y etiquetas debajo.
 */
const LabelGenerator = () => {
  const SHEET = { w: 210, h: 297 };
  const LABEL = { w: 99.1, h: 57.2 };
  const LABELS_PER_SHEET = 10;
  
  // --- SELECTORES DE CONTROL ---
  const centers = ["CEIP MAESTRO JOAQUÍN CANTERO", "CEIP SAN JOSÉ", "CC SUSARTE"];
  
  // --- ESTADOS ---
  const [selectedCenter, setSelectedCenter] = useState(centers[0]);
  const [course, setCourse] = useState("6º Primaria");
  const [promo, setPromo] = useState("PROMOCIÓN 202“ — 2026");
  const [startLabel, setStartLabel] = useState(1);
  const [quantity, setQuantity] = useState(10);
  const [showQr, setShowQr] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // --- DERIVADOS ---
  const labelsToPrint = useMemo(() => {
    return Array.from({ length: quantity }, (_, i) => i + 1);
  }, [quantity]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-transparent animate-fade-in pb-20 no-print">
      {/* HEADER PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 shadow-lg shadow-indigo-500/10">
            <Tag size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">Generador de Etiquetas</h1>
            <p className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-[0.2em] opacity-60">System Branding V31.0 / Pujalte Studio</p>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group"
        >
          <Printer size={18} className="group-hover:animate-bounce" />
          Imprimir Pliego
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* PANEL DE CONFIGURACIÓN HORIZONTAL (ISLA) */}
        <div className="w-full">
            <div className={`bg-card/50 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 ${isConfigOpen ? 'max-h-[1000px]' : 'max-h-[85px]'}`}>
                {/* Cabecera Desplegable */}
                <button 
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                    className="w-full p-8 flex items-center justify-between hover:bg-primary/5 transition-colors group"
                >
                    <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Settings size={16} className="text-secondary group-hover:rotate-90 transition-transform duration-500" /> 
                        Configuración Visual del Pliego
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-6 mr-4">
                            <span className="text-[10px] font-bold uppercase text-primary/60">{selectedCenter}</span>
                            <span className="text-[10px] font-bold uppercase text-primary/60">{course}</span>
                            <span className="text-[10px] font-bold uppercase text-primary/60">{quantity} Etiquetas</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center transition-transform duration-500 ${isConfigOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={18} className="text-primary" />
                        </div>
                    </div>
                </button>

                {/* Contenido Configuración */}
                <div className="px-8 pb-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Selector de Centro */}
                        <div className="space-y-2 lg:col-span-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2 px-1">
                                <School size={12} /> Centro Educativo
                            </label>
                            <div className="relative">
                                <select 
                                    value={selectedCenter}
                                    onChange={(e) => setSelectedCenter(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-4 text-xs font-bold text-primary appearance-none focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                                >
                                    {centers.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-4 text-secondary pointer-events-none" />
                            </div>
                        </div>

                        {/* Curso y Lema */}
                        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-secondary px-1 text-center block">Curso</label>
                                <input 
                                    type="text" 
                                    value={course} 
                                    onChange={(e) => setCourse(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-secondary px-1 text-center block">Slogan</label>
                                <input 
                                    type="text" 
                                    value={promo} 
                                    onChange={(e) => setPromo(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none text-center"
                                />
                            </div>
                        </div>

                        {/* Cantidad y Punto Inicio */}
                        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-secondary px-1 text-center block">Cantidad</label>
                                <div className="flex items-center gap-1 bg-white/5 border border-primary/10 rounded-2xl p-1 h-12">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-colors"><ChevronLeft size={14}/></button>
                                    <span className="flex-1 text-center font-black text-primary text-xs">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(100, quantity + 1))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-colors"><ChevronRight size={14}/></button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-secondary px-1 text-center block">Inicio</label>
                                <select 
                                    value={startLabel}
                                    onChange={(e) => setStartLabel(Number(e.target.value))}
                                    className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-2 text-[10px] font-bold text-primary outline-none"
                                >
                                    {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-slate-900">Label {i+1}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Branding Toggles y Color */}
                        <div className="grid grid-cols-3 gap-3 lg:col-span-1">
                            <button 
                                onClick={() => setShowLogo(!showLogo)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all ${showLogo ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-primary/5 text-secondary opacity-50'}`}
                            >
                                <Eye size={14} />
                                <span className="text-[8px] font-black uppercase">Logo</span>
                            </button>
                            <button 
                                onClick={() => setShowQr(!showQr)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all ${showQr ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-primary/5 text-secondary opacity-50'}`}
                            >
                                <QrCode size={14} />
                                <span className="text-[8px] font-black uppercase">QR</span>
                            </button>
                            <div className="relative">
                                <input 
                                    type="color" 
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="w-full h-full rounded-2xl cursor-pointer bg-white/5 border border-primary/10 p-1"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-4 h-4 rounded-full border border-white/20" style={{backgroundColor: accentColor}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* NOTA DE IMPRESIÓN */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 flex items-center gap-6 max-w-4xl mx-auto w-full">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <ShieldCheck size={24} />
            </div>
            <div className="flex flex-col gap-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Nota de Impresión</h4>
                <p className="text-sm font-medium text-primary/60">
                    Asegúrese de configurar el tamaño de papel como <span className="text-primary font-bold">A4</span> y escala <span className="text-primary font-bold">100%</span> en los ajustes de su impresora.
                </p>
            </div>
        </div>

        {/* VISTA PREVIA ETIQUETAS */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[3rem] shadow-2xl p-8 overflow-hidden relative group max-w-[210mm] mx-auto origin-top transition-transform duration-700 hover:scale-[1.01]">
            <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-10">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em]">Ready to Output</span>
                 </div>
                 <div className="flex items-center gap-2 text-white/40">
                    <Crop size={12} />
                    <span className="text-[8px] font-bold uppercase">99.1 x 57.2 mm</span>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <Award size={14} className="text-amber-500" />
                 <span className="text-[9px] font-black text-white uppercase tracking-widest">Master Layout Pliego</span>
              </div>
            </div>

            <div 
              style={{ width: '210mm', minHeight: '297mm', background: '#fff' }}
              className="mt-16 p-[10mm] grid grid-cols-2 gap-[2.5mm]"
            >
              {[...Array(LABELS_PER_SHEET)].map((_, i) => {
                const index = i + 1;
                const isPrinting = index >= startLabel && index < startLabel + quantity;
                
                return (
                  <div 
                    key={i} 
                    style={{ 
                      width: '99.1mm', 
                      height: '57.2mm',
                      border: isPrinting ? `1.5px solid ${accentColor}20` : '1px dashed #e2e8f0',
                      background: isPrinting ? '#fff' : '#f8fafc',
                      opacity: isPrinting ? 1 : 0.3,
                      position: 'relative'
                    }}
                    className={`rounded-[1.5rem] transition-all duration-300 ${isPrinting ? 'shadow-[0_10px_30px_rgba(0,0,0,0.05)]' : ''}`}
                  >
                    {isPrinting ? (
                      <div className="w-full h-full p-6 flex flex-col justify-between overflow-hidden">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1 max-w-[70%]">
                              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight">
                                {selectedCenter}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 text-[8px] font-black px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-widest">
                                  {course}
                                </span>
                              </div>
                           </div>
                           
                           {showLogo && (
                             <div className="flex flex-col items-end gap-1">
                               <div className="text-[9px] font-black tracking-tighter text-slate-900 leading-none">pujalte</div>
                               <div className={`text-[6px] font-black uppercase tracking-[0.2em] leading-none`} style={{color: accentColor}}>creative studio</div>
                             </div>
                           )}
                        </div>

                        <div className="relative py-3">
                           <div className="text-[14px] font-black text-center uppercase tracking-[0.15em] leading-tight" style={{color: accentColor}}>
                              {promo}
                           </div>
                           <div className="flex items-center justify-center gap-1 mt-1">
                              <CheckCircle2 size={10} style={{color: accentColor}} />
                              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Producto Verificado</span>
                           </div>
                        </div>

                        <div className="flex items-end justify-between border-t pt-4 border-slate-100">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                 <GraduationCap size={16} className="text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Generation</span>
                                 <span className="text-[8px] font-black text-slate-900 uppercase">Class of 2026</span>
                              </div>
                           </div>

                           {showQr && (
                             <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <QrCode size={20} className="text-slate-900" />
                                <div className="flex flex-col">
                                   <span className="text-[5px] font-black uppercase text-slate-400 leading-none">Acceso</span>
                                   <span className="text-[6px] font-black text-slate-900 leading-none uppercase">Digital</span>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Posición {index}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-card/30 backdrop-blur-md rounded-[2rem] p-6 border border-primary/5 flex items-center gap-6">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Shield size={24} />
             </div>
             <div>
                <h4 className="text-sm font-black text-primary uppercase">Nota de Impresión</h4>
                <p className="text-xs font-medium text-secondary opacity-60">Asegúrese de configurar el tamaño de papel como A4 y escala 100% en los ajustes de su impresora.</p>
             </div>
          </div>
        </div>
      </div>

      {/* PLIEGO PARA IMPRESIÓN (OCULTO EN WEB) */}
      <div id="printable-pliego" className="hidden print:block bg-white">
          <div className="grid grid-cols-2 gap-[2.5mm]">
              {[...Array(LABELS_PER_SHEET)].map((_, i) => {
                  const index = i + 1;
                  const isPrinting = index >= startLabel && index < startLabel + quantity;
                  if (!isPrinting) return <div key={i} style={{ width: '99.1mm', height: '57.2mm' }} />;

                  return (
                      <div 
                        key={i} 
                        style={{ 
                          width: '99.1mm', 
                          height: '57.2mm',
                          background: '#fff',
                          border: '0.1px solid transparent'
                        }}
                        className="p-6 flex flex-col justify-between overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                           <div className="space-y-1 max-w-[70%]">
                              <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight">
                                {selectedCenter}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 text-[8px] font-bold px-2 py-0.5 rounded-full text-slate-500 uppercase tracking-widest">
                                  {course}
                                </span>
                              </div>
                           </div>
                           
                           {showLogo && (
                             <div className="flex flex-col items-end gap-1">
                               <div className="text-[9px] font-bold tracking-tighter text-slate-900 leading-none">pujalte</div>
                               <div className={`text-[6px] font-bold uppercase tracking-[0.2em] leading-none`} style={{color: accentColor}}>creative studio</div>
                             </div>
                           )}
                        </div>

                        <div className="relative py-3">
                           <div className="text-[14px] font-bold text-center uppercase tracking-[0.15em] leading-tight" style={{color: accentColor}}>
                              {promo}
                           </div>
                           <div className="flex items-center justify-center gap-1 mt-1">
                              <CheckCircle2 size={10} style={{color: accentColor}} />
                              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Producto Verificado</span>
                           </div>
                        </div>

                        <div className="flex items-end justify-between border-t pt-4 border-slate-100">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                 <GraduationCap size={16} className="text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Generation</span>
                                 <span className="text-[8px] font-bold text-slate-900 uppercase">Class of 2026</span>
                              </div>
                           </div>

                           {showQr && (
                             <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <QrCode size={20} className="text-slate-900" />
                                <div className="flex flex-col">
                                   <span className="text-[5px] font-bold uppercase text-slate-400 leading-none">Acceso</span>
                                   <span className="text-[6px] font-bold text-slate-900 leading-none uppercase">Digital</span>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                  );
              })}
          </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          #printable-pliego { 
            display: block !important;
            position: absolute; 
            left: 0; 
            top: 0; 
            margin: 0 !important; 
            padding: 10mm !important;
            width: 210mm !important;
            height: 297mm !important;
            visibility: visible !important;
          }
          body { background: white !important; }
          #printable-pliego * { visibility: visible !important; }
        }
      `}</style>
    </div>
  );
};

export default LabelGenerator;

