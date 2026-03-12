import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutGrid, Maximize, MoveHorizontal, ArrowUpDown, MoveVertical,
    Baseline, ChevronsUpDown, AlignCenterHorizontal, UserSquare2,
    Box, Download, History, Search, Check, X, Maximize2, Minimize2,
    ChevronLeft, ChevronRight, Layers, Type, Trash2, Edit, ZoomIn, ZoomOut, Eye, Settings2, UserCheck,
    Type as TypeIcon, Ruler, Users, Grid, Square, List, AlignCenterVertical, MousePointer2,
    MoreVertical, Save, Trash, Minus, Plus, Shapes
} from 'lucide-react';

// ─── FORMAS DE PLACEHOLDER ─────────────────────────────────────────────────
const PHOTO_SHAPES = [
    {
        id: 'circle',
        label: 'Círculo Perfecto',
        preview: (w, h) => {
            const r = Math.min(w, h) * 0.46;
            return `<circle cx="${w/2}" cy="${h/2}" r="${r}" />`;
        },
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            return {
                borderRadius: '50%',
                width: size + 'px',
                height: size + 'px',
                aspectRatio: '1/1',
                objectFit: 'cover',
                margin: '0 auto'
            };
        },
    },
    {
        id: 'oval',
        label: 'Óvalo Clásico',
        preview: (w, h) => `<ellipse cx="${w/2}" cy="${h/2}" rx="${w*0.42}" ry="${h*0.46}" />`,
        getStyle: (w, h) => ({ 
            borderRadius: '50%',
            width: w + 'px',
            height: h + 'px',
            objectFit: 'cover'
        }),
    },
    {
        id: 'rect34',
        label: '3:4 Recto',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="2" />`,
        getStyle: () => ({ borderRadius: '2px' }),
    },
    {
        id: 'rect34r',
        label: '3:4 Redondeado',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="${w*0.12}" />`,
        getStyle: (w, h) => ({ borderRadius: `${w * 0.12}px` }),
    },
    {
        id: 'shield',
        label: 'Escudo Heráldico',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            return `<path d="M${ox + s*0.1},${oy + s*0.04} L${ox + s*0.9},${oy + s*0.04} L${ox + s*0.9},${oy + s*0.65} Q${ox + s*0.9},${oy + s*0.85} ${ox + s*0.5},${oy + s*0.96} Q${ox + s*0.1},${oy + s*0.85} ${ox + s*0.1},${oy + s*0.65} Z" />`;
        },
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            const ox = (w - size) / 2;
            const oy = (h - size) / 2;
            return {
                width: size + 'px',
                height: size + 'px',
                margin: '0 auto',
                clipPath: `path('M${size*0.1},${size*0.04} L${size*0.9},${size*0.04} L${size*0.9},${size*0.65} Q${size*0.9},${size*0.85} ${size*0.5},${size*0.96} Q${size*0.1},${size*0.85} ${size*0.1},${size*0.65} Z')`,
            };
        },
    },
    {
        id: 'arch',
        label: 'Arco Medio Punto',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            return `<path d="M${ox + s*0.1},${oy + s*0.96} L${ox + s*0.1},${oy + s*0.48} A${s*0.4},${s*0.48} 0 0,1 ${ox + s*0.9},${oy + s*0.48} L${ox + s*0.9},${oy + s*0.96} Z" />`;
        },
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            return {
                width: size + 'px',
                height: size + 'px',
                margin: '0 auto',
                clipPath: `path('M${size*0.1},${size*0.96} L${size*0.1},${size*0.48} A${size*0.4},${size*0.48} 0 0,1 ${size*0.9},${size*0.48} L${size*0.9},${size*0.96} Z')`,
            };
        },
    },
];

// Devuelve el style a aplicar al div placeholder según la forma
const getShapeStyle = (shapeId, w, h) => {
    const s = PHOTO_SHAPES.find(x => x.id === shapeId) || PHOTO_SHAPES[2]; // default rect34
    const base = s.getStyle(w, h);
    const extra = s.extraStyle ? s.extraStyle(w, h) : {};
    return { ...base, ...extra };
};

// Icono SVG miniatura para cada forma
const ShapePill = ({ shape, active, onClick, isDark }) => {
    const w = 48, h = 64; // Proporción base 3:4 para la miniatura
    return (
        <button
            onClick={onClick}
            title={shape.label}
            className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all active:scale-95 border ${
                active
                    ? 'bg-accent text-white border-white/30 shadow-glow-indigo'
                    : isDark
                        ? 'bg-white/5 border-transparent text-white/50 hover:text-white hover:bg-white/10'
                        : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'
            }`}
        >
            <div className="w-12 h-16 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}
                    className={`transition-colors drop-shadow-sm ${ active ? 'fill-white/80 stroke-white' : isDark ? 'fill-white/10 stroke-white/50' : 'fill-slate-300 stroke-slate-500' }`}
                    strokeWidth="1.5" fill="none" preserveAspectRatio="xMidYMid meet"
                >
                    <g dangerouslySetInnerHTML={{ __html: shape.preview(w, h) }} />
                </svg>
            </div>
            <span className="text-[7.5px] font-black uppercase tracking-tight text-center leading-none max-w-[56px] opacity-80">{shape.label}</span>
        </button>
    );
};
import { getCourseBase, getGroup } from '../../utils/formatters.js';

const DesignPanel = ({
    isFullScreenDesign,
    setIsFullScreenDesign,
    theme,
    configOrla = {},
    setConfigOrla,
    updateConfig,
    activeDesignParam,
    setActiveDesignParam,
    schools = [],
    adminSchool,
    orders = [],
    settings = {},
    designFilter = { course: '', group: '' },
    setDesignFilter,
    staff = [],
    selectedStaffIds = [],
    setSelectedStaffIds,
    setAdminSchool,
    setView,
    canvasContainerRef,
    COURSE_GROUPS = [],
    updateSchool,
    updateOrder,
    updateStaffMember
}) => {
    // ESTADO PARA PESTAÑAS DEL EDITOR
    const [activeTab, setActiveTab] = useState('ALUMNOS');
    const isDark = theme === 'dark';

    // Conversiones Internas Robustas para Orla A3 (420mm -> 4961px)
    const factor = 4961 / 420; // 11.8119
    const safeMmToPx = (mm) => (mm || 0) * factor;
    const safePxToMm = (px) => (px || 0) / factor;

    // CONFIGURACIÓN DE HERRAMIENTAS POR PESTAÑA
    const TOOLBAR_CONFIG = {
        'ALUMNOS': [
            { icon: LayoutGrid, label: 'ALUMNOS POR FILA', key: 'aCols', min: 1, max: 20, step: 1, unit: 'ALUMNOS' },
            { icon: Maximize, label: 'ESCALA', key: 'aScale', min: 0.2, max: 4.0, step: 0.05, unit: 'x' },
            { icon: TypeIcon, label: 'TEXTO', key: 'fontSizeAlu', min: 4, max: 80, step: 0.5, unit: 'PT' },
            { icon: Baseline, label: 'SEP. TEXTO', key: 'aTextOffset', min: 0, max: 100, step: 1, unit: 'PT' },
            { icon: Type, label: 'APELLIDOS', key: 'hideApellidosAlu', isToggle: true },
            { icon: MoveHorizontal, label: 'SEP. HORIZ', key: 'aGapX', min: safeMmToPx(0), max: safeMmToPx(300), unit: 'MM' },
            { icon: ArrowUpDown, label: 'SEP. VERT', key: 'aGapY', min: safeMmToPx(0), max: safeMmToPx(500), unit: 'MM' },
            { icon: MoveVertical, label: 'EJE Y', key: 'aStartY', min: safeMmToPx(0), max: safeMmToPx(350), unit: 'MM' },
            { icon: AlignCenterHorizontal, label: 'EJE X', key: 'aOffsetX', isImmediate: true },
        ],
        'DOCENTES': [
            { icon: UserSquare2, label: 'ESCALA', key: 'dScale', min: 0.2, max: 5.0, step: 0.05, unit: 'x' },
            { icon: TypeIcon, label: 'TEXTO', key: 'fontSizeDoc', min: 4, max: 80, step: 0.5, unit: 'PT' },
            { icon: Baseline, label: 'SEP. TEXTO', key: 'dTextOffset', min: 0, max: 100, step: 1, unit: 'PT' },
            { icon: Type, label: 'APELLIDOS', key: 'hideApellidosDoc', isToggle: true },
            { icon: UserCheck, label: 'CARGO', key: 'hideCargoDoc', isToggle: true },
            { icon: MoveHorizontal, label: 'SEPARACIÓN', key: 'dGapX', min: safeMmToPx(0), max: safeMmToPx(500), unit: 'MM' },
            { icon: MoveVertical, label: 'EJE Y', key: 'dY', min: safeMmToPx(0), max: safeMmToPx(350), unit: 'MM' },
            { icon: AlignCenterHorizontal, label: 'EJE X', key: 'dOffsetX', isImmediate: true },
        ],
        'GENERAL': [
            { icon: Ruler, label: 'MARGENES', key: 'margin', min: safeMmToPx(0), max: safeMmToPx(150) },
            { icon: Layers, label: 'ANCHO', key: 'canvasW', min: 2000, max: 10000, unit: 'PX' },
            { icon: Layers, label: 'ALTO', key: 'canvasH', min: 2000, max: 10000, unit: 'PX' },
            { icon: Grid, label: 'GUIAS', key: 'showGuides', isToggle: true },
            { icon: Shapes, label: 'FORMA', key: 'photoShape', isShapeSelector: true },
        ]
    };

    // Efecto para sincronizar el parámetro activo al cambiar de pestaña
    useEffect(() => {
        if (isFullScreenDesign) {
            const firstTool = TOOLBAR_CONFIG[activeTab][0];
            if (firstTool && !firstTool.isImmediate && !firstTool.isToggle && !firstTool.isShapeSelector) {
                setActiveDesignParam(firstTool);
            } else {
                setActiveDesignParam(null);
            }
        }
    }, [activeTab, isFullScreenDesign]);

    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [showGuides, setShowGuides] = useState(false);
    const [showShapeSelector, setShowShapeSelector] = useState(false);
    const currentShape = configOrla.photoShape || 'circle';

    const handleWheel = (e) => {
        if (!isFullScreenDesign) return;
        e.preventDefault();
        const zoomSpeed = 0.001;
        const delta = -e.deltaY;
        const newZoom = Math.min(Math.max(zoom + delta * zoomSpeed, 0.1), 5);
        setZoom(newZoom);
    };

    const handleMouseDown = (e) => {
        if (!isFullScreenDesign) return;
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !isFullScreenDesign) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Soporte para gestos táctiles (Pinch & Pan)
    const lastTouchDistance = useRef(null);
    const handleTouchMove = (e) => {
        if (!isFullScreenDesign) return;
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            if (lastTouchDistance.current !== null) {
                const delta = dist - lastTouchDistance.current;
                setZoom(prev => Math.min(Math.max(prev + delta * 0.01, 0.1), 5));
            }
            lastTouchDistance.current = dist;
        } else if (e.touches.length === 1 && isDragging) {
            const touch = e.touches[0];
            const dx = touch.clientX - lastMousePos.x;
            const dy = touch.clientY - lastMousePos.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchStart = (e) => {
        if (!isFullScreenDesign) return;
        if (e.touches.length === 1) {
            setIsDragging(true);
            setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        } else if (e.touches.length === 2) {
            lastTouchDistance.current = null;
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        lastTouchDistance.current = null;
    };

    const currentSchool = schools.find(s => s.id === adminSchool) || { name: 'NOMBRE DEL CENTRO' };

    // Filtrado automático de docentes por centro, curso y grupo
    const getStaffAssignments = (m) => {
        if (m.assignments && m.assignments.length > 0) return m.assignments;
        if (m.course) return [{ course: m.course, group: m.group || '' }];
        return [];
    };

    const filteredStaff = (staff || []).filter(m => {
        const asgs = getStaffAssignments(m);

        // Si no hay filtro de curso en la orla, mostramos todos los del centro
        if (!designFilter.course) return true;

        // Comprobamos si el docente está asignado a ese curso (normalizado)
        return asgs.some(a => {
            const normalize = (str) => {
                if (!str) return '';
                return str.toString().toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            const staffCourseNormal = normalize(getCourseBase(a.course));
            const filterCourseNormal = normalize(designFilter.course);

            const courseMatch = staffCourseNormal === filterCourseNormal;

            // Si el filtro de grupo está vacío (Todos los grupos), mostramos a todos los docentes de ese curso
            if (!designFilter.group) return courseMatch;

            // Si hay un grupo específico seleccionado, comprobamos si el docente es de ese grupo o de curso general
            const groupNormal = normalize(a.group);
            const filterGroupNormal = normalize(designFilter.group);
            const groupMatch = !groupNormal || groupNormal === filterGroupNormal;

            return courseMatch && groupMatch;
        });
    });

    const splitName = (fullName) => {
        if (!fullName) return { nombre: '', apellidos: '' };
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return { nombre: parts[0], apellidos: '' };
        return { nombre: parts[0], apellidos: parts.slice(1).join(' ') };
    };

    const filteredOrders = orders
        .filter(o =>
            (!designFilter.course || getCourseBase(o.course) === designFilter.course) &&
            (!designFilter.group || getGroup(o.course) === designFilter.group)
        )
        .sort((a, b) => {
            const apellidosA = splitName(a.studentName).apellidos;
            const apellidosB = splitName(b.studentName).apellidos;
            return apellidosA.localeCompare(apellidosB);
        });

    return (
        <div className={`animate-fade-in ${isFullScreenDesign ? 'fixed inset-0 z-[600] bg-slate-950 p-0 overflow-hidden' : 'max-w-7xl mx-auto space-y-12 pb-32'}`}>

            {/* ═══ 1. CARD DE PREVISUALIZACIÓN TÉCNICA (MODO NORMAL) ═══ */}
            {!isFullScreenDesign && (
                <div className="main-card overflow-hidden animate-slide-up shadow-2xl shadow-indigo-900/10">
                    {/* Header Púrpura Premium */}
                    <div className="bg-accent p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full -ml-20 -mb-20 pointer-events-none" />

                        <div className="flex items-center gap-7 relative z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-2xl transform hover:rotate-3 transition-transform">
                                <Eye size={36} className="drop-shadow-lg" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                                    PREVISUALIZACIÓN ORLA
                                </h3>
                                <p className="text-white/60 text-[9px] uppercase tracking-[0.4em] font-black mt-1 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Sistema de Renderizado Vectorial
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto mr-2">
                            <button
                                onClick={() => setView('command')}
                                className="flex-1 md:flex-none h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 transition-all shadow-glow-emerald text-[10px] font-black uppercase tracking-widest active:scale-95 border border-white/20 hover:border-white/40"
                            >
                                <LayoutGrid size={18} />
                                FINALIZAR
                            </button>
                            <button
                                onClick={() => setIsFullScreenDesign(true)}
                                className="flex-1 md:flex-none h-12 px-8 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl flex items-center justify-center gap-3 transition-all shadow-glow-indigo text-[10px] font-black uppercase tracking-widest active:scale-95 border border-white/20 hover:border-white/40"
                            >
                                <Maximize2 size={18} />
                                EDITAR ORLA
                            </button>
                        </div>
                    </div>

                    {/* Canvas de Previsualización */}
                    <div className="p-10">
                        <div className="bg-slate-950/20 rounded-[3rem] border border-primary/10 relative overflow-hidden h-[550px] flex items-center justify-center shadow-inner group">
                            <div
                                ref={canvasContainerRef}
                                className="w-full h-full flex items-center justify-center overflow-hidden"
                            >
                                        <div className="relative bg-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] rounded-sm overflow-hidden flex-shrink-0"
                                            style={{
                                                width: (configOrla.canvasW || 4961) / 10 + 'px',
                                                height: (configOrla.canvasH || 3508) / 10 + 'px',
                                                backgroundImage: `
                                                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                                                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                                                `,
                                                backgroundSize: '20px 20px',
                                                transform: `scale(1.0)`, // Eliminamos el escalado arbitrario de 1.35
                                                transformOrigin: 'center center',
                                            }}>

                                    {/* Márgenes */}
                                    <div className="absolute border border-red-500/40 border-dashed pointer-events-none z-50"
                                        style={{ inset: (configOrla.margin || 20) / 10 + 'px' }} />

                                    {/* Contenido Orla */}
                                    <div className="absolute top-0 w-full flex justify-center z-20"
                                        style={{
                                            top: (configOrla.dY || 0) / 10 + 'px',
                                            gap: (configOrla.dGapX ?? 0) / 10 + 'px',
                                            transform: `translateX(${(configOrla.dOffsetX || 0) / 10}px)`
                                        }}>
                                        {filteredStaff.length === 0 ? (
                                            <div className="flex flex-col items-center opacity-20 mt-4">
                                                <Users size={40} className="text-slate-400" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Sin docentes asignados</p>
                                            </div>
                                        ) : (
                                            filteredStaff.map((member) => {
                                                const { nombre, apellidos } = splitName(member.name);
                                                const baseSize = configOrla.fontSizeDoc || 10;
                                                const baseScale = configOrla.dScale || 1.2;
                                                const w = (configOrla.aW || 350) / 10;
                                                const h = (configOrla.aH || 450) / 10;
                                                return (
                                                    <div key={member.id}
                                                        className="relative flex flex-col items-center text-center"
                                                        style={{ width: (w * baseScale) + 'px' }}
                                                    >
                                                        <div className="relative">
                                                            <div className="bg-slate-200" style={{ 
                                                                width: w + 'px', 
                                                                height: h + 'px', 
                                                                ...getShapeStyle(currentShape, w, h),
                                                                transform: `scale(${baseScale})`,
                                                                transformOrigin: 'top center'
                                                            }} />
                                                            <div className="flex flex-col items-center px-1" style={{ 
                                                                marginTop: (h * (baseScale - 1)) + (configOrla.dTextOffset || 0) / 10 + 'px' 
                                                            }}>
                                                                <div className="font-normal uppercase text-black leading-tight" style={{ fontSize: (baseSize * 0.45) + 'px' }}>
                                                                    <div className="whitespace-nowrap">{nombre}</div>
                                                                    <div className="whitespace-nowrap" style={{ display: configOrla.hideApellidosDoc ? 'none' : 'block' }}>{apellidos}</div>
                                                                </div>
                                                                <p className="font-normal uppercase text-black leading-tight mt-0.5" style={{ 
                                                                    fontSize: (baseSize * 0.45) + 'px',
                                                                    display: configOrla.hideCargoDoc ? 'none' : 'block'
                                                                }}>{member.role || 'DOCENTE'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="absolute w-full z-10"
                                        style={{
                                            top: (configOrla.aStartY || 1350) / 10 + 'px',
                                            padding: `0 ${(configOrla.margin || 20) / 10}px`,
                                            transform: `translateX(${(configOrla.aOffsetX || 0) / 10}px)`
                                        }}>
                                        <div className="grid justify-center"
                                            style={{
                                                gridTemplateColumns: `repeat(${configOrla.aCols || 8}, auto)`,
                                                columnGap: (configOrla.aGapX ?? 0) / 10 + 'px',
                                                rowGap: (configOrla.aGapY ?? 650) / 10 + 'px'
                                            }}>
                                            {filteredOrders.map((o) => {
                                                const { nombre, apellidos } = splitName(o.studentName);
                                                const baseSize = configOrla.fontSizeAlu || 10;
                                                const baseScale = configOrla.aScale || 1;
                                                const w = (configOrla.aW || 350) / 10;
                                                const h = (configOrla.aH || 450) / 10;
                                                return (
                                                    <div key={o.id}
                                                        className="flex flex-col items-center text-center"
                                                        style={{ width: (w * baseScale) + 'px' }}
                                                    >
                                                        <div className="relative">
                                                            <div className="bg-slate-100" style={{ 
                                                                width: w + 'px', 
                                                                height: h + 'px', 
                                                                ...getShapeStyle(currentShape, w, h),
                                                                transform: `scale(${baseScale})`,
                                                                transformOrigin: 'top center'
                                                            }} />
                                                            <div className="flex flex-col items-center px-1" style={{ 
                                                                marginTop: (h * (baseScale - 1)) + (configOrla.aTextOffset || 0) / 10 + 'px' 
                                                            }}>
                                                                <div className="font-normal uppercase text-black leading-tight" style={{ fontSize: (baseSize * 0.45) + 'px' }}>
                                                                    <div className="whitespace-nowrap">{nombre}</div>
                                                                    <div className="whitespace-nowrap" style={{ display: configOrla.hideApellidosAlu ? 'none' : 'block' }}>{apellidos}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Pie de Orla */}
                                    <div className="absolute bottom-[20px] w-full text-center" style={{ bottom: (configOrla.margin || 20) / 10 + 'px' }}>
                                        <h2 className="text-[20px] font-normal text-black tracking-tighter uppercase">{currentSchool.name}</h2>
                                        <p className="text-[8px] font-normal text-black tracking-[0.5em] mt-1 ml-[0.5em]">{configOrla.promoText || "PROMOCIÓN 2026"}</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Selectores de Centro / Curso */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-[2.5fr_1.5fr_0.8fr] gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-secondary tracking-widest uppercase ml-1">CENTRO EDUCATIVO</label>
                                <select value={adminSchool} onChange={e => setAdminSchool(e.target.value)} className="input-dark">{schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-secondary tracking-widest uppercase ml-1">CURSO BASE</label>
                                <select value={designFilter.course} onChange={e => setDesignFilter(p => ({ ...p, course: e.target.value, group: '' }))} className="input-dark">
                                    <option value="">TODOS LOS CURSOS</option>
                                    {[...new Set(orders.map(o => getCourseBase(o.course)))].filter(Boolean).sort().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-secondary tracking-widest uppercase ml-1">GRUPOS</label>
                                <select value={designFilter.group} onChange={e => setDesignFilter(p => ({ ...p, group: e.target.value }))} disabled={!designFilter.course} className="input-dark !px-4">
                                    <option value="">TODOS</option>
                                    {(() => {
                                        if (!designFilter.course) return null;

                                        // 1. Grupos definidos en constantes para este curso
                                        let definedLines = [];
                                        COURSE_GROUPS.forEach(g => {
                                            const courseData = g.courses.find(c => c.name === designFilter.course);
                                            if (courseData && courseData.lines) {
                                                definedLines = [...definedLines, ...courseData.lines];
                                            }
                                        });

                                        // 2. Grupos detectados en pedidos reales
                                        const detectedGroups = orders
                                            .filter(o => getCourseBase(o.course) === designFilter.course)
                                            .map(o => getGroup(o.course))
                                            .filter(Boolean);

                                        // Combinar, limpiar duplicados y ordenar
                                        return [...new Set([...definedLines, ...detectedGroups])]
                                            .sort()
                                            .map(g => <option key={g} value={g}>{g}</option>);
                                    })()}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ 2. EDITOR EN PANTALLA COMPLETA ═══ */}
            {isFullScreenDesign && (
                <div
                    className={`absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none transition-colors duration-500 ${isDark ? 'bg-slate-950 cursor-grab' : 'bg-slate-100 cursor-grab'} ${isDragging ? 'cursor-grabbing' : ''}`}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Background Grid Layer - Adaptive */}
                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}
                        style={{ backgroundImage: `radial-gradient(circle, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '100px 100px' }}
                    />

                    <div className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-75 ease-out pointer-events-none"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        }}
                    >
                        {/* Canvas Principal (Gris seda en modo oscuro para evitar fatiga visual) */}
                        <div className={`relative shadow-[0_0_100px_rgba(0,0,0,0.3)] transition-colors duration-500 ${isDark ? 'bg-slate-200' : 'bg-white'}`}
                            style={{
                                width: (configOrla.canvasW || 4961) / 10 + 'px',
                                height: (configOrla.canvasH || 3508) / 10 + 'px'
                            }}>

                            {/* Grid de diseño (visible solo en editor) */}
                            <div className={`absolute inset-0 opacity-[0.2] transition-colors duration-500`}
                                style={{ backgroundImage: `linear-gradient(${isDark ? '#cbd5e1' : '#e2e8f0'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#cbd5e1' : '#e2e8f0'} 1px, transparent 1px)`, backgroundSize: '50px 50px' }}
                            />

                            {/* Márgenes */}
                            <div className="absolute border border-red-500/30 border-dashed pointer-events-none z-50"
                                style={{ inset: (configOrla.margin || 20) / 10 + 'px' }} />

                            {/* Guías de Centrado dinámicas */}
                            {showGuides && (
                                <>
                                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-400/40 z-50 pointer-events-none shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                                    <div className="absolute left-0 right-0 top-1/2 h-px bg-red-400/40 z-50 pointer-events-none shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                                </>
                            )}

                            {/* Contenido Completo del Canvas */}
                            <div className="absolute top-0 w-full flex justify-center z-20 pointer-events-auto"
                                style={{
                                    top: (configOrla.dY || 0) / 10 + 'px',
                                    gap: (configOrla.dGapX ?? 0) / 10 + 'px',
                                    transform: `translateX(${(configOrla.dOffsetX || 0) / 10}px)`
                                }}>
                                {filteredStaff.map((member) => {
                                    const { nombre, apellidos } = splitName(member.name);
                                    const baseSize = configOrla.fontSizeDoc || 10;
                                    const baseScale = configOrla.dScale || 1.2;
                                    const w = (configOrla.aW || 350) / 10;
                                    const h = (configOrla.aH || 450) / 10;
                                    return (
                                        <div key={member.id}
                                            className="relative flex flex-col items-center text-center group/member overflow-visible"
                                            style={{ width: (w * baseScale) + 'px' }}
                                        >
                                            <div className="relative">
                                                <div className="bg-slate-100" style={{ 
                                                    width: w + 'px', 
                                                    height: h + 'px', 
                                                    ...getShapeStyle(currentShape, w, h),
                                                    transform: `scale(${baseScale})`,
                                                    transformOrigin: 'top center'
                                                }} />
                                                <div className="flex flex-col items-center px-1" style={{ 
                                                    marginTop: (h * (baseScale - 1)) + (configOrla.dTextOffset || 0) / 10 + 'px' 
                                                }}>
                                                    <div
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        className="font-normal uppercase text-black leading-tight outline-none cursor-text hover:bg-black/5 rounded px-1 transition-colors group-hover/member:text-accent focus:bg-white focus:shadow-sm"
                                                        style={{ fontSize: (baseSize * 0.45) + 'px', minWidth: '40px', width: 'max-content' }}
                                                        onBlur={(e) => {
                                                            const newName = e.target.innerText.trim();
                                                            if (newName && newName !== member.name) {
                                                                updateStaffMember(member.id, { name: newName });
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                e.target.blur();
                                                            }
                                                        }}
                                                    >
                                                        <div className="whitespace-nowrap">{nombre}</div>
                                                        <div className="whitespace-nowrap" style={{ display: configOrla.hideApellidosDoc ? 'none' : 'block' }}>{apellidos}</div>
                                                    </div>
                                                    <p className="font-normal uppercase text-black leading-tight mt-0.5 pointer-events-none" style={{ 
                                                        fontSize: (baseSize * 0.45) + 'px',
                                                        display: configOrla.hideCargoDoc ? 'none' : 'block'
                                                    }}>{member.role || 'DOCENTE'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute w-full z-10 pointer-events-auto"
                                style={{
                                    top: (configOrla.aStartY || 1350) / 10 + 'px',
                                    padding: `0 ${(configOrla.margin || 20) / 10}px`,
                                    transform: `translateX(${(configOrla.aOffsetX || 0) / 10}px)`
                                }}>
                                <div className="grid justify-center"
                                    style={{
                                        gridTemplateColumns: `repeat(${configOrla.aCols || 8}, ${( (configOrla.aW || 350) / 10 ) * (configOrla.aScale || 1)}px)`,
                                        columnGap: (configOrla.aGapX ?? 0) / 10 + 'px',
                                        rowGap: (configOrla.aGapY ?? 650) / 10 + 'px'
                                    }}>
                                    {filteredOrders.map((o) => {
                                        const { nombre, apellidos } = splitName(o.studentName);
                                        const baseSize = configOrla.fontSizeAlu || 10;
                                        const baseScale = configOrla.aScale || 1;
                                        const w = (configOrla.aW || 350) / 10;
                                        const h = (configOrla.aH || 450) / 10;
                                        return (
                                            <div key={o.id}
                                                className="flex flex-col items-center text-center group/alu overflow-visible"
                                                style={{ width: (w * baseScale) + 'px' }}
                                            >
                                                <div className="relative">
                                                    <div className="bg-slate-100" style={{ 
                                                        width: w + 'px', 
                                                        height: h + 'px', 
                                                        ...getShapeStyle(currentShape, w, h),
                                                        transform: `scale(${baseScale})`,
                                                        transformOrigin: 'top center'
                                                    }} />
                                                    <div className="flex flex-col items-center px-1" style={{ 
                                                        marginTop: (h * (baseScale - 1)) + (configOrla.aTextOffset || 0) / 10 + 'px' 
                                                    }}>
                                                        <div
                                                            contentEditable={true}
                                                            suppressContentEditableWarning={true}
                                                            className="font-normal uppercase text-black leading-tight outline-none cursor-text hover:bg-black/5 rounded px-1 transition-colors group-hover/alu:text-accent focus:bg-white focus:shadow-sm"
                                                            style={{ fontSize: (baseSize * 0.45) + 'px', minWidth: '30px', width: 'max-content' }}
                                                            onBlur={(e) => {
                                                                const newName = e.target.innerText.trim();
                                                                if (newName && newName !== o.studentName) {
                                                                    updateOrder(o.id, { studentName: newName });
                                                                }
                                                            }
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    e.target.blur();
                                                                }
                                                            }}
                                                        >
                                                            <div className="whitespace-nowrap">{nombre}</div>
                                                            <div className="whitespace-nowrap" style={{ display: configOrla.hideApellidosAlu ? 'none' : 'block' }}>{apellidos}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="absolute bottom-[20px] w-full text-center" style={{ bottom: (configOrla.margin || 20) / 10 + 'px' }}>
                                <h2
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    className="text-[20px] font-normal text-black uppercase tracking-tighter outline-none cursor-text hover:text-accent transition-colors focus:bg-white focus:shadow-sm inline-block px-4 rounded"
                                    onBlur={(e) => {
                                        const newName = e.target.innerText.trim();
                                        if (newName && newName !== currentSchool.name) {
                                            updateSchool(currentSchool.id, { name: newName });
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.target.blur();
                                        }
                                    }}
                                >
                                    {currentSchool.name}
                                </h2>
                                <div className="clear-both"></div>
                                <p
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    className="text-[8px] font-normal text-black tracking-[0.5em] mt-1 outline-none cursor-text hover:text-accent transition-colors focus:bg-white focus:shadow-sm inline-block px-2 rounded ml-[0.5em]"
                                    onBlur={(e) => {
                                        const newText = e.target.innerText.trim();
                                        if (newText && newText !== (configOrla.promoText || "PROMOCIÓN 2026")) {
                                            updateConfig('promoText', newText);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.target.blur();
                                        }
                                    }}
                                >
                                    {configOrla.promoText || "PROMOCIÓN 2026"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ 3. DOCK DINÁMICO DEL EDITOR (ADAPTATIVO) ═══ */}
            {isFullScreenDesign && (
                <div className="fixed bottom-0 left-0 right-0 z-[700] p-8 animate-slide-up pointer-events-none flex flex-col items-center gap-4">
                    <div className={`w-full max-w-[calc(100%-4rem)] overflow-hidden pointer-events-auto rounded-[32px] transition-all duration-500 shadow-2xl ${isDark ? 'bg-slate-900/40 backdrop-blur-3xl border border-white/20 shadow-black' : 'bg-white/80 backdrop-blur-3xl border border-black/5 shadow-slate-200'}`}>

                        {/* 1. Navegación Minimalista */}
                        <div className={`flex backdrop-blur-md ${isDark ? 'bg-black/20' : 'bg-slate-100/50'}`}>
                            {['ALUMNOS', 'DOCENTES', 'GENERAL'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-[9px] font-black tracking-[0.2em] transition-all border-b-2 ${activeTab === tab
                                        ? 'border-accent text-accent bg-accent/5'
                                        : `${isDark ? 'border-transparent text-white/40 hover:text-white hover:bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-900 hover:bg-black/5'}`}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* 2. Dock de Herramientas Principal */}
                        <div className="p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 py-1">
                                {TOOLBAR_CONFIG[activeTab].map(tool =>
                                    tool.isShapeSelector ? (
                                        <button
                                            key={tool.label}
                                            onClick={() => { setShowShapeSelector(v => !v); setActiveDesignParam(null); }}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 min-w-[85px] rounded-2xl transition-all active:scale-95 border ${
                                                showShapeSelector
                                                    ? 'bg-accent text-white shadow-glow-indigo border-white/20'
                                                    : isDark
                                                        ? 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                                                        : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                            }`}
                                        >
                                            <Shapes size={18} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">FORMA</span>
                                        </button>
                                    ) : (
                                    <button
                                        key={tool.label}
                                        onClick={() => {
                                            if (tool.isImmediate) {
                                                updateConfig(tool.key, 0);
                                                setActiveDesignParam(null);
                                            } else if (tool.isToggle) {
                                                if (tool.key === 'showGuides') {
                                                    setShowGuides(v => !v);
                                                } else {
                                                    updateConfig(tool.key, !configOrla[tool.key]);
                                                }
                                                setShowShapeSelector(false);
                                                // Mantenemos el activeDesignParam actual para evitar saltos en la interfaz
                                            } else {
                                                setShowShapeSelector(false);
                                                setActiveDesignParam(tool);
                                            }
                                        }}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 min-w-[85px] rounded-2xl transition-all active:scale-95 border ${
                                            ((tool.isToggle && tool.key === 'showGuides' && showGuides) || (tool.isToggle && tool.key !== 'showGuides' && configOrla[tool.key]))
                                                ? 'bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] border-red-400'
                                                : activeDesignParam?.key === tool.key
                                                    ? 'bg-accent text-white shadow-glow-indigo border-white/20'
                                                    : isDark
                                                        ? 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                                                        : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                        }`}
                                    >
                                        <tool.icon size={18} />
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">
                                            {tool.label}
                                        </span>
                                    </button>
                                    )
                                )}
                            </div>

                            <div className={`w-px h-10 mx-2 shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setView('command')}
                                    className="px-5 py-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 flex flex-col items-center gap-1"
                                >
                                    <LayoutGrid size={18} />
                                    <span className="text-[8px] font-black uppercase tracking-wider">FINALIZAR</span>
                                </button>
                                <button
                                    onClick={() => setIsFullScreenDesign(false)}
                                    className={`p-3 rounded-2xl border transition-all active:scale-95 ${isDark ? 'bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-white/40 border-white/10' : 'bg-slate-100 hover:bg-red-50 text-red-500 text-slate-400 border-slate-200'}`}
                                    title="Cerrar Editor"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* 3. Slider de Ajuste Adaptive y Mensajes de Visibilidad */}
                        {(() => {
                            const hasWarnings = (configOrla.hideApellidosAlu && activeTab === 'ALUMNOS') || 
                                              ((configOrla.hideApellidosDoc || configOrla.hideCargoDoc) && activeTab === 'DOCENTES');
                            const isEjeX = activeDesignParam?.key === 'aOffsetX' || activeDesignParam?.key === 'dOffsetX';
                            
                            if (!activeDesignParam && !hasWarnings) return null;

                            return (
                                <div className={`px-8 py-5 border-t animate-slide-up min-h-[85px] flex items-center ${isDark ? 'bg-accent border-white/30 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]' : 'bg-slate-50 border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}>
                                    


                                    {activeDesignParam && (
                                        <div className="flex items-center gap-8">
                                            <div className="flex-shrink-0 min-w-[120px] relative">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] block leading-none ${isDark ? 'text-white/70' : 'text-slate-400'}`}>{activeDesignParam.label}</span>
                                                    {activeDesignParam.isToggle && (
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${showGuides ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-slate-500/20 border-slate-500/50 text-slate-500'}`}>
                                                            {showGuides ? 'ACTIVADAS' : 'DESACTIVADAS'}
                                                        </span>
                                                    )}
                                                    {(activeDesignParam.key === 'aOffsetX' || activeDesignParam.key === 'dOffsetX') && (
                                                        <button
                                                            onClick={() => updateConfig(activeDesignParam.key, 0)}
                                                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all active:scale-90 ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-200 border-black/5 text-slate-900 hover:bg-slate-300'}`}
                                                        >
                                                            CENTRAR
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={`text-3xl font-black tabular-nums leading-none flex items-baseline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {(() => {
                                                        const val = configOrla[activeDesignParam.key];
                                                        if (activeDesignParam.key.includes('Scale')) return (val || (activeDesignParam.key === 'dScale' ? 1.2 : 1)).toFixed(2);
                                                        if (activeDesignParam.key === 'aCols') return (val || 8);
                                                        if (activeDesignParam.unit === 'PT') return (val || 10);
                                                        if (activeDesignParam.unit === 'PX') return Math.round(val || 0);
                                                        return Math.round(safePxToMm(val || 0));
                                                    })()}
                                                    <span className={`text-xs ml-1.5 font-black ${isDark ? 'text-white/60' : 'text-slate-400'}`}>
                                                        {activeDesignParam.key === 'aCols' ? 'ALUMNOS' : (activeDesignParam.unit || 'MM')}
                                                    </span>
                                                </div>
                                            </div>
                                             <div className="flex-1 flex items-center gap-4">
                                                {activeDesignParam.isToggle ? (
                                                    <button
                                                        onClick={() => setShowGuides(!showGuides)}
                                                        className={`flex-1 h-12 rounded-2xl border-2 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 flex items-center justify-center gap-3 ${showGuides
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-glow-emerald'
                                                            : 'bg-transparent border-slate-500/30 text-slate-500'
                                                            }`}
                                                    >
                                                        <Grid size={20} />
                                                        {showGuides ? 'Ocultar Guías de Diseño' : 'Mostrar Guías de Diseño'}
                                                    </button>
                                                ) : isEjeX ? (
                                                    <div className={`flex-1 h-12 rounded-2xl border-2 border-accent/20 bg-accent/5 flex items-center justify-center gap-3`}>
                                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                                        <span className="text-sm font-black text-accent uppercase tracking-widest italic">
                                                            Imágenes ajustadas al centro
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                const currentVal = configOrla[activeDesignParam.key] !== undefined ? configOrla[activeDesignParam.key] : (activeDesignParam.key === 'aCols' ? 8 : activeDesignParam.key === 'fontSizeAlu' || activeDesignParam.key === 'fontSizeDoc' ? 10 : activeDesignParam.key === 'dScale' ? 1.2 : activeDesignParam.key === 'aScale' ? 1 : 0);
                                                                updateConfig(activeDesignParam.key, Math.max(activeDesignParam.min, currentVal - (activeDesignParam.step || 1)));
                                                            }}
                                                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'bg-black/40 hover:bg-black/60 border-white/10 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm'}`}
                                                        >
                                                            <Minus size={20} strokeWidth={3} />
                                                        </button>
                                                        <div className="flex-1 relative flex items-center h-8">
                                                            <div className={`absolute inset-x-0 h-2 rounded-full border shadow-inner ${isDark ? 'bg-black/60 border-white/5' : 'bg-slate-200 border-black/5'}`} />
                                                            <input
                                                                type="range"
                                                                min={activeDesignParam.min}
                                                                max={activeDesignParam.max}
                                                                step={activeDesignParam.step || 1}
                                                                value={configOrla[activeDesignParam.key] !== undefined ? configOrla[activeDesignParam.key] : (activeDesignParam.key === 'aCols' ? 8 : activeDesignParam.key === 'fontSizeAlu' || activeDesignParam.key === 'fontSizeDoc' ? 10 : activeDesignParam.key === 'dScale' ? 1.2 : activeDesignParam.key === 'aScale' ? 1 : 0)}
                                                                onChange={(e) => updateConfig(activeDesignParam.key, parseFloat(e.target.value))}
                                                                className={`relative z-10 w-full bg-transparent appearance-none cursor-pointer ${isDark ? 'accent-white' : 'accent-accent'}`}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const currentVal = configOrla[activeDesignParam.key] !== undefined ? configOrla[activeDesignParam.key] : (activeDesignParam.key === 'aCols' ? 8 : activeDesignParam.key === 'fontSizeAlu' || activeDesignParam.key === 'fontSizeDoc' ? 10 : activeDesignParam.key === 'dScale' ? 1.2 : activeDesignParam.key === 'aScale' ? 1 : 0);
                                                                updateConfig(activeDesignParam.key, Math.min(activeDesignParam.max, currentVal + (activeDesignParam.step || 1)));
                                                            }}
                                                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'bg-black/40 hover:bg-black/60 border-white/10 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm'}`}
                                                        >
                                                            <Plus size={20} strokeWidth={3} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Mensajes de Visibilidad Integrados a la derecha */}
                                            {hasWarnings && (
                                                <div className="flex flex-col gap-1.5 pl-8 border-l border-black/10 dark:border-white/10 min-w-[200px]">
                                                    {configOrla.hideApellidosAlu && activeTab === 'ALUMNOS' && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider italic leading-tight">
                                                                Los apellidos ya no son visibles
                                                            </span>
                                                        </div>
                                                    )}
                                                    {configOrla.hideApellidosDoc && activeTab === 'DOCENTES' && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider italic leading-tight">
                                                                Los apellidos ya no son visibles
                                                            </span>
                                                        </div>
                                                    )}
                                                    {configOrla.hideCargoDoc && activeTab === 'DOCENTES' && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider italic leading-tight">
                                                                Los cargos ya no son visibles
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setActiveDesignParam(null)}
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isDark ? 'bg-white text-accent' : 'bg-accent text-white'}`}
                                            >
                                                <Check size={28} className="stroke-[4]" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignPanel;
