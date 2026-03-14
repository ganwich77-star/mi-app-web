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
const LabelGenerator = ({ orders = [], adminSchool, ordersFilters, schools = [], settings, updateSettings }) => {
  const selectedSchoolObj = schools.find(s => s.id === adminSchool);
  
  // --- ESTADOS ---
  const [selectedCenter, setSelectedCenter] = useState(selectedSchoolObj?.name || "");
  const [course, setCourse] = useState(ordersFilters?.course || "");
  const [promo, setPromo] = useState("PROMOCIÓN 202“ — 2026");
  const [startLabel, setStartLabel] = useState(1);
  const [showQr, setShowQr] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- CARGAR AJUSTES GUARDADOS ---
  React.useEffect(() => {
    if (settings?.labelConfig) {
      const config = settings.labelConfig;
      if (config.promo) setPromo(config.promo);
      if (config.accentColor) setAccentColor(config.accentColor);
      if (config.templateId) setActiveTemplate(config.templateId);
      if (config.paperW) setPaperW(config.paperW);
      if (config.paperH) setPaperH(config.paperH);
      if (config.gridCols) setGridCols(config.gridCols);
      if (config.gridRows) setGridRows(config.gridRows);
      if (config.showQr !== undefined) setShowQr(config.showQr);
      if (config.showLogo !== undefined) setShowLogo(config.showLogo);
    }
  }, [settings?.labelConfig]);

  // --- PLANTILLAS ---
  const TEMPLATES = [
    { id: 'a4_10', name: 'A4 - 10 Etiquetas (99x57mm)', paperW: 210, paperH: 297, cols: 2, rows: 5 },
    { id: 'a4_24', name: 'A4 - 24 Etiquetas (70x37mm)', paperW: 210, paperH: 297, cols: 3, rows: 8 },
    { id: 'a4_14', name: 'A4 - 14 Etiquetas (105x42mm)', paperW: 210, paperH: 297, cols: 2, rows: 7 },
    { id: 'custom', name: 'Personalizado...', paperW: 210, paperH: 297, cols: 2, rows: 5 }
  ];

  const [activeTemplate, setActiveTemplate] = useState('a4_10');
  const [paperW, setPaperW] = useState(210);
  const [paperH, setPaperH] = useState(297);
  const [gridCols, setGridCols] = useState(2);
  const [gridRows, setGridRows] = useState(5);

  const handleTemplateChange = (templateId) => {
    setActiveTemplate(templateId);
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template && templateId !== 'custom') {
      setPaperW(template.paperW);
      setPaperH(template.paperH);
      setGridCols(template.cols);
      setGridRows(template.rows);
    }
  };

  // Extraer centros únicos
  const centers = useMemo(() => {
    const fromSchools = schools.map(s => s.name).filter(Boolean);
    const fromOrders = orders.map(o => o.schoolName).filter(Boolean);
    const uniqueCenters = [...new Set([...fromSchools, ...fromOrders])].sort();
    return uniqueCenters.length > 0 ? uniqueCenters : ["SIN CENTROS"];
  }, [orders, schools]);

  // Extraer cursos únicos del centro seleccionado
  const availableCourses = useMemo(() => {
    if (!selectedCenter) return [];
    const courses = orders
      .filter(o => o.schoolName === selectedCenter)
      .map(o => o.course)
      .filter(Boolean);
    return [...new Set(courses)].sort();
  }, [orders, selectedCenter]);

  // Sincronizar centro y curso cuando cambien en el panel principal
  React.useEffect(() => {
    if (selectedSchoolObj?.name) {
      setSelectedCenter(selectedSchoolObj.name);
    }
  }, [adminSchool, schools]);

  React.useEffect(() => {
    if (ordersFilters?.course !== undefined) {
      setCourse(ordersFilters.course);
    }
  }, [ordersFilters?.course]);

  // --- DERIVADOS ---
  // Filtrar alumnos por centro y curso (Sincronizado con el Panel de Pedidos)
  const filteredStudents = useMemo(() => {
    return orders
      .filter(o => o.schoolName === selectedCenter && (!course || o.course === course))
      .sort((a, b) => (a.studentName || '').localeCompare(b.studentName || ''));
  }, [orders, selectedCenter, course]);

  // Cantidad se ajusta automáticamente al número de alumnos filtrados
  const quantity = filteredStudents.length;

  const handlePrint = () => {
    window.print();
  };

  const getQRUrl = (id) => {
    const baseUrl = "https://asistente-digital-comuniones.web.app/";
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(baseUrl + "?view=download&id=" + id)}`;
  };

  const handleSaveSettings = async () => {
    if (!updateSettings) return;
    setIsSaving(true);
    try {
      await updateSettings({
        labelConfig: {
          promo,
          accentColor,
          templateId: activeTemplate,
          paperW,
          paperH,
          gridCols,
          gridRows,
          showQr,
          showLogo
        }
      });
      // Feedback visual rápido
      const { default: Swal } = await import('sweetalert2');
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Configuración de etiquetas actualizada correctamente.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent animate-fade-in pb-20 font-sans">
      {/* HEADER PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 shadow-lg shadow-indigo-500/10">
            <Tag size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">Generador de Etiquetas</h1>
            <p className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-[0.2em] opacity-60">System Branding V32.0 / Pujalte Studio</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex items-center justify-center gap-3 px-6 py-4 bg-white border border-primary/10 text-primary rounded-2xl font-black uppercase text-xs transition-all shadow-xl hover:bg-slate-50 active:scale-95 group ${isSaving ? 'opacity-50' : ''}`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShieldCheck size={18} className="text-indigo-600" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar Ajustes'}
          </button>

          <button 
            onClick={handlePrint}
            disabled={quantity === 0}
            className={`flex items-center justify-center gap-3 px-8 py-4 ${quantity === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-2xl font-black uppercase text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group`}
          >
            <Printer size={18} className="group-hover:animate-bounce" />
            Imprimir {quantity} Etiquetas
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* PANEL DE CONFIGURACIÓN HORIZONTAL (ISLA) */}
        <div className="w-full no-print">
            <div className={`bg-card/50 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 ${isConfigOpen ? 'max-h-[1000px]' : 'max-h-[85px]'}`}>
                {/* Cabecera Desplegable */}
                <div 
                    className="w-full p-8 flex items-center justify-between hover:bg-primary/5 transition-colors group cursor-pointer"
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                >
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-secondary">
                            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">
                                Configuración del Pliego Reales
                            </h2>
                            <ChevronDown size={14} className={`text-secondary transition-transform duration-300 ${isConfigOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-3 mr-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-full">
                                <School size={12} className="text-indigo-500" />
                                <span className="text-[10px] font-black uppercase text-indigo-500 whitespace-nowrap">{selectedCenter || "Sin Centro"}</span>
                            </div>
                            {course && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/5 border border-secondary/10 rounded-full">
                                    <GraduationCap size={12} className="text-secondary" />
                                    <span className="text-[10px] font-black uppercase text-secondary whitespace-nowrap">{course}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                                <Users size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-emerald-500 whitespace-nowrap">{quantity} Alumnos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido Configuración */}
                <div className="px-8 pb-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
                        {/* Selector de Centro */}
                        <div className="space-y-2 lg:col-span-3">
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

                        {/* Curso */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2 px-1">
                                <GraduationCap size={12} /> Curso
                            </label>
                            <div className="relative">
                                <select 
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-4 text-xs font-bold text-primary appearance-none focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                                >
                                    <option value="" className="bg-slate-900">TODOS</option>
                                    {availableCourses.map(c => (
                                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-4 text-secondary pointer-events-none" />
                            </div>
                        </div>

                        {/* Lema */}
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2 px-1">
                                <Sparkles size={12} /> Lema
                            </label>
                            <input 
                                type="text"
                                value={promo}
                                onChange={(e) => setPromo(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>

                        {/* Etiqueta Inicial */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2 px-1 whitespace-nowrap">
                                <FileText size={12} /> Etiqueta inicial
                            </label>
                            <input 
                                type="number"
                                min="1"
                                max="10"
                                value={startLabel}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setStartLabel(val === '' ? '' : parseInt(val));
                                }}
                                className="w-full h-12 bg-white/5 border border-primary/10 rounded-2xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>

                        {/* Visualización */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2 px-1">
                                <Eye size={12} /> Visualización
                            </label>
                            <div className="flex bg-white/5 border border-primary/10 rounded-2xl p-1 h-12 gap-2">
                                <button 
                                    onClick={() => setShowQr(!showQr)}
                                    className={`flex-1 flex items-center justify-center rounded-xl transition-all ${showQr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-secondary hover:bg-white/5'}`}
                                >
                                    <QrCode size={16} />
                                </button>
                                <button 
                                    onClick={() => setShowLogo(!showLogo)}
                                    className={`flex-1 flex items-center justify-center rounded-xl transition-all ${showLogo ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-secondary hover:bg-white/5'}`}
                                >
                                    <Award size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Selector de Plantilla */}
                        <div className="space-y-2 lg:col-span-12 mt-4 pt-6 border-t border-primary/5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2 px-1 mb-2">
                                <Award size={14} /> Seleccionar Plantilla de Etiquetas
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTemplateChange(t.id)}
                                        className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                                            activeTemplate === t.id 
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                                            : 'bg-white/5 border-primary/10 hover:bg-white/10 hover:border-primary/20'
                                        }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${activeTemplate === t.id ? 'text-white' : 'text-primary'}`}>
                                            {t.name}
                                        </span>
                                        <span className="text-[9px] font-bold text-secondary opacity-60">
                                            {t.cols}x{t.rows} • {t.paperW}x{t.paperH}mm
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MAQUETACIÓN AVANZADA */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-primary/5 mt-4">
                            {/* Tamaño Papel */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <label className="min-w-[180px] text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2">
                                    <Crop size={14} className="text-indigo-400" /> Dimensiones Papel
                                </label>
                                <div className="flex-1 flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="text-[8px] font-black text-secondary/50 uppercase ml-2">Ancho (mm)</span>
                                        <input 
                                            type="number"
                                            value={paperW}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPaperW(val === '' ? '' : parseInt(val));
                                                setActiveTemplate('custom');
                                            }}
                                            className="w-full h-11 bg-white/5 border border-primary/10 rounded-xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="text-[8px] font-black text-secondary/50 uppercase ml-2">Alto (mm)</span>
                                        <input 
                                            type="number"
                                            value={paperH}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPaperH(val === '' ? '' : parseInt(val));
                                                setActiveTemplate('custom');
                                            }}
                                            className="w-full h-11 bg-white/5 border border-primary/10 rounded-xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Malla del Pliego */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <label className="min-w-[180px] text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-2">
                                    <Tag size={14} className="text-indigo-400" /> Distribución Malla
                                </label>
                                <div className="flex-1 flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="text-[8px] font-black text-secondary/50 uppercase ml-2">Columnas</span>
                                        <input 
                                            type="number"
                                            value={gridCols}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGridCols(val === '' ? '' : parseInt(val));
                                                setActiveTemplate('custom');
                                            }}
                                            className="w-full h-11 bg-white/5 border border-primary/10 rounded-xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="text-[8px] font-black text-secondary/50 uppercase ml-2">Filas</span>
                                        <input 
                                            type="number"
                                            value={gridRows}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGridRows(val === '' ? '' : parseInt(val));
                                                setActiveTemplate('custom');
                                            }}
                                            className="w-full h-11 bg-white/5 border border-primary/10 rounded-xl px-4 text-xs font-bold text-primary focus:ring-2 ring-indigo-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ÁREA DE PREVISUALIZACIÓN */}
        <div className="w-full bg-card/30 rounded-[3rem] border border-primary/5 p-4 md:p-12 min-h-[600px] flex justify-center overflow-x-auto custom-scrollbar">
            {/* EL PLIEGO REAL */}
            <div className="print-sheet bg-white shadow-2xl origin-top transition-transform duration-500 relative"
                 style={{ 
                    width: `${paperW}mm`, 
                    height: `${paperH}mm`, 
                    padding: '6mm 5mm',
                    color: '#1e293b'
                 }}>
                
                {/* Cuadrícula de Etiquetas */}
                <div className="grid h-full" style={{ 
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                    columnGap: '4mm',
                    rowGap: '2mm'
                }}>
                    {/* Espacios vacíos si empieza en etiqueta > 1 */}
                    {Array.from({ length: startLabel - 1 }).map((_, i) => (
                        <div key={`empty-${i}`} className="border border-dashed border-slate-100 print:border-none"></div>
                    ))}
                    
                    {/* Las etiquetas reales */}
                    {filteredStudents.map((student, index) => (
                        <div 
                            key={student.id} 
                            className="p-6 flex flex-col justify-between relative overflow-hidden group"
                            style={{ border: '0.1mm solid #f1f5f9' }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }}></div>

                            {/* Logo de Fondo (Watermark) */}
                            <div className="absolute inset-4 flex items-center justify-center opacity-[0.05] pointer-events-none select-none z-0">
                                <img 
                                    src={settings?.logoUrl || "https://pujaltecreative.com/wp-content/uploads/2026/01/logo_negro.png"} 
                                    className="w-[80%] h-auto grayscale object-contain" 
                                    alt="Watermark" 
                                />
                            </div>
                            
                            {/* Header Etiqueta */}
                            <div className="flex justify-between items-start z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
                                            <GraduationCap size={14} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{promo}</span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none mt-2 text-slate-800">{student.studentName}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{course}</p>
                                </div>
                                
                                {showLogo && (
                                    <img 
                                      src={settings?.logoUrl || "https://pujaltecreative.com/wp-content/uploads/2026/01/logo_negro.png"} 
                                      className="h-10 object-contain opacity-90" 
                                      alt="Logo" 
                                    />
                                )}
                            </div>

                            {/* Footer Etiqueta */}
                            <div className="flex justify-between items-end z-10">
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Centro Educativo</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{selectedCenter}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Globe size={10} style={{ color: accentColor }} />
                                            </div>
                                            <span className="text-[9px] font-black tracking-tight text-slate-500 uppercase">
                                                {settings?.notificationEmail || 'soporte@tuapp.com'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Phone size={10} style={{ color: accentColor }} />
                                            </div>
                                            <span className="text-[9px] font-black tracking-tight text-slate-500 uppercase">
                                                {settings?.contactPhone || '965 120 120'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {showQr && (
                                    <div className="relative group">
                                        <div className="absolute -inset-2 bg-slate-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative p-1 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col items-center">
                                            <img 
                                              src={getQRUrl(student.id)} 
                                              className="w-14 h-14" 
                                              alt="QR Descarga" 
                                            />
                                            <span className="text-[5px] font-black uppercase tracking-widest text-slate-300 mt-0.5 leading-none">Download</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Elementos Decorativos de Fondo */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ backgroundColor: accentColor }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ESTILOS DE IMPRESIÓN */}
        <style dangerouslySetInnerHTML={{ __html: `
            @media print {
                html, body {
                    height: 100%;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden;
                    background: white;
                }
                body * { visibility: hidden; }
                .print-sheet, .print-sheet * { visibility: visible; }
                .print-sheet {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: ${paperW}mm !important;
                    height: ${paperH}mm !important;
                    margin: 0 !important;
                    padding: 6mm 5mm !important;
                    box-shadow: none !important;
                    transform: none !important;
                    z-index: 9999;
                    background: white !important;
                }
                .no-print { display: none !important; }
                @page {
                    size: ${paperW}mm ${paperH}mm;
                    margin: 0;
                }
            }
        `}} />
      </div>
    </div>
  );
};

export default LabelGenerator;
