import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutGrid, Maximize, MoveHorizontal, ArrowUpDown, MoveVertical,
    Baseline, ChevronsUpDown, AlignCenterHorizontal, UserSquare2,
    Box, Download, History, Search, Check, X, Maximize2, Minimize2,
    ChevronLeft, ChevronRight, Layers, Type, Edit, ZoomIn, ZoomOut, Eye, Settings2, UserCheck,
    Type as TypeIcon, Ruler, Users, Grid, Square, List, AlignCenterVertical, MousePointer2,
    MoreVertical, Save, Minus, Plus, Shapes, Wand2, GraduationCap, EyeOff, AlertCircle, ShieldCheck, ArrowRight, Wallet, Info, Shield, Star
} from 'lucide-react';
import { getCourseBase, getGroup } from '../../utils/formatters.js';
import Swal from 'sweetalert2';

// ─── TAMAÑOS DE LIENZO ─────────────────────────────────────────────────────
import { CANVAS_SIZES } from '../../constants.js';

// Icono personalizado de dos triángulos para FILAS y T. TODOS
const TwoTrianglesIcon = ({ size = 18, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 3L21 18H3L12 3Z" />
        <path d="M12 21L3 6H21L12 21Z" />
    </svg>
);

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
            objectFit: 'cover',
            clipPath: 'none'
        }),
    },
    {
        id: 'rect34',
        label: '3:4 Recto',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="2" />`,
        getStyle: () => ({ borderRadius: '2px', clipPath: 'none' }),
    },
    {
        id: 'rect34r',
        label: '3:4 Redondeado',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="${w*0.12}" />`,
        getStyle: (w, h) => ({ borderRadius: `${w * 0.12}px`, clipPath: 'none' }),
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
            return {
                width: w + 'px',
                height: h + 'px',
                margin: '0 auto',
                clipPath: `path('M${w*0.1},${h*0.04} L${w*0.9},${h*0.04} L${w*0.9},${h*0.65} Q${w*0.9},${h*0.85} ${w*0.5},${h*0.96} Q${w*0.1},${h*0.85} ${w*0.1},${h*0.65} Z')`,
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
            return {
                width: w + 'px',
                height: h + 'px',
                margin: '0 auto',
                clipPath: `path('M${w*0.1},${h*0.96} L${w*0.1},${h*0.48} A${w*0.4},${h*0.48} 0 0,1 ${w*0.9},${h*0.48} L${w*0.9},${h*0.96} Z')`,
            };
        },
    },
    {
        id: 'square',
        label: 'Cuadrado Redondeado',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            const rx = s * 0.12;
            return `<rect x="${ox + s*0.06}" y="${oy + s*0.06}" width="${s*0.88}" height="${s*0.88}" rx="${rx}" />`;
        },
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            return {
                borderRadius: '12%',
                width: size + 'px',
                height: size + 'px',
                margin: '0 auto',
                objectFit: 'cover',
            };
        },
    },
    {
        id: 'squarer',
        label: 'Cuadrado Recto',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            return `<rect x="${ox + s*0.06}" y="${oy + s*0.06}" width="${s*0.88}" height="${s*0.88}" rx="2" />`;
        },
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            return {
                borderRadius: '3px',
                width: size + 'px',
                height: size + 'px',
                margin: '0 auto',
                objectFit: 'cover',
            };
        },
    },
];

// Devuelve el style a aplicar al div placeholder según la forma
const getShapeStyle = (shapeId, w, h) => {
    const s = PHOTO_SHAPES.find(x => x.id === shapeId) || PHOTO_SHAPES[2]; // default rect34
    const base = s.getStyle(w, h);
    return { ...base, overflow: 'hidden', position: 'relative' };
};

const getPhotoSrc = (item) => {
    if (!item) return null;
    
    // 1. PRIORIDAD: digitalPhotoUrl
    if (item.digitalPhotoUrl) return item.digitalPhotoUrl;

    // 2. EXTRAER VALOR DEL CAMPO DE FOTO
    let src = item.photoFile || 
              item.photoUrl || 
              item.photoURL || 
              item.photo_file_url || 
              item.foto_url || 
              item.photo || 
              item.foto || 
              item.src || 
              item.photo_file_number;

    // Si el valor es un objeto, extraemos el valor real
    if (src && typeof src === 'object') {
        src = src.base64 || src.url || src.photoUrl || src.photoURL || src.photo || src;
    }

    if (typeof src === 'string') {
        const lowerSrc = src.trim().toLowerCase();
        
        // Filtrar valores basura
        const forbidden = ['undefined', 'null', 'digital', 'physical', 'fisico', 'físico', 'pendiente', '[object object]', ''];
        if (forbidden.includes(lowerSrc)) return null;
        
        // Si ya es una URL completa o base64
        if (lowerSrc.startsWith('http') || lowerSrc.startsWith('data:') || lowerSrc.startsWith('/')) {
            return src;
        }
        
        // Construir URL de Firebase Storage para IDs simples
        return `https://firebasestorage.googleapis.com/v0/b/foto-pujalte.appspot.com/o/orlas2026%2F${src}?alt=media`;
    } else if (typeof src === 'number') {
        // Soporte para números del Excel
        return `https://firebasestorage.googleapis.com/v0/b/foto-pujalte.appspot.com/o/orlas2026%2F${src}?alt=media`;
    }

    return null;
};

const getPhotoTransform = (config) => {
    if (!config || (config.zoom === 1 && config.x === 0 && config.y === 0 && !config.rotation)) return { transform: 'scale(1) translate(0%, 0%)' };
    return {
        transform: `scale(${config.zoom || 1}) translate(${config.x || 0}%, ${config.y || 0}%) rotate(${config.rotation || 0}deg)`,
        transformOrigin: 'center center'
    };
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
    updateStaffMember,
    onBack,
    sendAdminNotification
}) => {
    // ESTADO PARA PESTAÑAS DEL EDITOR
    const [activeTab, setActiveTab] = useState('GENERAL');
    const [hoveredTool, setHoveredTool] = useState(null); // Para mostrar descripción en el dock
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const isDark = theme === 'dark';

    const [showPaymentBlockedModal, setShowPaymentBlockedModal] = useState(false);
    const [requestingPayment, setRequestingPayment] = useState(false);

    const isStarter = settings?.plan === 'starter';
    const isFlex = settings?.plan === 'flex';
    const isPaid = settings?.isPaid;
    const isBlocked = (isStarter || isFlex) && !isPaid;

    const handleFinalizeClick = () => {
        if (isBlocked) {
            setShowPaymentBlockedModal(true);
        } else {
            setView('command');
        }
    };

    const handleRequestPayment = async () => {
        const result = await Swal.fire({
            title: '¿SOLICITAR LIQUIDACIÓN?',
            text: 'Se enviará una notificación a administración para revisar tu cuenta y habilitar la descarga final.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'SÍ, SOLICITAR',
            cancelButtonText: 'CANCELAR',
            background: isDark ? '#1e293b' : '#fff',
            color: isDark ? '#fff' : '#000'
        });

        if (result.isConfirmed) {
            setRequestingPayment(true);
            
            // Lógica de notificación al admin
            if (sendAdminNotification) {
                // Aseguramos que usamos los campos correctos del objeto settings
                const contactEmail = settings?.notificationEmail || settings?.email || settings?.contactEmail || 'No especificado';
                
                await sendAdminNotification('LIQUIDACION', {
                    brandName: settings?.brandName || 'Fotógrafo Desconocido',
                    email: contactEmail,
                    plan: settings?.plan || 'Starter',
                    photographerId: settings?.id || 'ID Desconocido'
                });
            }

            await new Promise(resolve => setTimeout(resolve, 800));
            setRequestingPayment(false);
            setShowPaymentBlockedModal(false);
            
            Swal.fire({
                title: 'SOLICITUD ENVIADA',
                text: 'Administración revisará tu cuenta en menos de 24h.',
                icon: 'success',
                confirmButtonColor: '#10b981',
                background: isDark ? '#1e293b' : '#fff',
                color: isDark ? '#fff' : '#000'
            });
        }
    };

    // Conversiones Internas Robustas para Orla A3 (420mm -> 4961px)
    const factor = 4961 / 420; // 11.8119
    const safeMmToPx = (mm) => (mm || 0) * factor;
    const safePxToMm = (px) => (px || 0) / factor;

    // Función para obtener la etiqueta del formato actual
    const getFormatLabel = () => {
        const w = configOrla.canvasW || 4961;
        const h = configOrla.canvasH || 3508;
        const mmW = Math.round(safePxToMm(w));
        const mmH = Math.round(safePxToMm(h));
        const matchedSize = CANVAS_SIZES.find(s => !s.custom && s.w === mmW && s.h === mmH);
        if (matchedSize) return matchedSize.label;
        if (configOrla.canvasSize && configOrla.canvasSize !== 'custom') {
            const sizeById = CANVAS_SIZES.find(s => s.id === configOrla.canvasSize);
            if (sizeById) return sizeById.label;
        }
        return `${(mmW/10).toFixed(1)}x${(mmH/10).toFixed(1)} cm`;
    };

    // Función para auto-ajustar la distribución de alumnos
    const normalize = (str) => {
        if (!str) return '';
        return str.toString().toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, ' ')
            .trim();
    };

    const splitName = (fullName) => {
        if (!fullName) return { nombre: '', apellidos: '' };
        
        // Soporte para formato "Apellidos, Nombre"
        if (fullName.includes(',')) {
            const [apellidos, nombre] = fullName.split(',').map(s => s.trim());
            return { nombre: nombre || '', apellidos: apellidos || '' };
        }

        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return { nombre: parts[0], apellidos: '' };
        
        // Si hay más de una palabra, asumimos que la primera es el nombre
        // y el resto los apellidos (comportamiento estándar previo)
        return { nombre: parts[0], apellidos: parts.slice(1).join(' ') };
    };

    const getStaffAssignments = (m) => {
        if (m.assignments && m.assignments.length > 0) return m.assignments;
        if (m.course) return [{ course: m.course, group: m.group || '' }];
        return [];
    };

    const filteredStaff = (staff || []).filter(m => {
        const { apellidos } = splitName(m.name || `${m.firstName || ''} ${m.lastName || ''}`);
        // Filtrado preventivo solicitado por el usuario: ocultar si no tiene apellidos ni foto (registro roto)
        if (!apellidos && !getPhotoSrc(m)) return false;

        const asgs = getStaffAssignments(m);
        if (!designFilter.course) return true;
        return asgs.some(a => {
            const staffCourseNormal = normalize(getCourseBase(a.course));
            const filterCourseNormal = normalize(designFilter.course);
            const courseMatch = staffCourseNormal === filterCourseNormal;
            if (!designFilter.group) return courseMatch;
            const groupNormal = normalize(a.group);
            const filterGroupNormal = normalize(designFilter.group);
            return courseMatch && (!groupNormal || groupNormal === filterGroupNormal);
        });
    }).sort((a, b) => {
        const idxA = a.manual_sort_index !== undefined ? a.manual_sort_index : 9999999;
        const idxB = b.manual_sort_index !== undefined ? b.manual_sort_index : 9999999;
        if (idxA !== idxB) return idxA - idxB;

        const nameA = (a.firstName || a.name || '').trim();
        const nameB = (b.firstName || b.name || '').trim();
        return nameA.localeCompare(nameB, 'es', { numeric: true, sensitivity: 'base' });
    });

    const filteredOrders = (orders || [])
        .filter(o => {
            const { apellidos } = splitName(o.studentName);
            // Filtrado preventivo solicitado por el usuario: ocultar si no tiene apellidos ni foto (registro roto)
            if (!apellidos && !getPhotoSrc(o)) return false;

            const courseNormal = normalize(getCourseBase(o.course));
            const filterCourseNormal = normalize(designFilter.course);
            const matchesCourse = !designFilter.course || courseNormal === filterCourseNormal;

            const groupNormal = normalize(getGroup(o.course));
            const filterGroupNormal = normalize(designFilter.group);
            const matchesGroup = !designFilter.group || groupNormal === filterGroupNormal;

            return matchesCourse && matchesGroup;
        })
        .sort((a, b) => {
            const idxA = a.manual_sort_index !== undefined ? a.manual_sort_index : 9999999;
            const idxB = b.manual_sort_index !== undefined ? b.manual_sort_index : 9999999;
            if (idxA !== idxB) return idxA - idxB;

            const apellidosA = splitName(a.studentName).apellidos;
            const apellidosB = splitName(b.studentName).apellidos;
            return apellidosA.localeCompare(apellidosB, 'es', { numeric: true, sensitivity: 'base' });
        });

    const autoDetectedCourse = (() => {
        if (designFilter.course) {
            const base = getCourseBase(designFilter.course);
            const group = designFilter.group || '';
            return group ? `${base} ${group}` : base;
        }
        const courseCount = {};
        filteredOrders.forEach(o => {
            if (!o.course) return;
            const base = getCourseBase(o.course) || '';
            const grp = getGroup(o.course) || '';
            const label = grp ? `${base} ${grp}` : base;
            if (label) courseCount[label] = (courseCount[label] || 0) + 1;
        });
        const sorted = Object.entries(courseCount).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : '';
    })();

    const saveLayoutConfig = () => {
        if (!adminSchool?.id) return;
        localStorage.setItem(`orla_layout_config_${adminSchool.id}`, JSON.stringify(configOrla));
        Swal.fire({ title: 'Diseño Guardado', text: 'Tus ajustes de diseño están guardados localmente para este colegio.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, customClass: { popup: 'rounded-xl', title: 'font-black' } });
    };

    const loadLayoutConfig = () => {
        if (!adminSchool?.id) return;
        const saved = localStorage.getItem(`orla_layout_config_${adminSchool.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfigOrla(parsed);
                Swal.fire({ title: 'Diseño Restaurado', text: 'Planos y medidas aplicadas correctamente.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, customClass: { popup: 'rounded-xl', title: 'font-black' } });
            } catch (e) {
                console.error(e);
            }
        } else {
            Swal.fire({ title: 'Aviso', text: 'No hay ningún diseño previo guardado en memoria para este colegio.', icon: 'info', customClass: { popup: 'rounded-xl', title: 'font-black' } });
        }
    };

    // Funci\u00f3n para distribuir alumnos con control de equilibrio (Top/Bottom)
    const distributeOrders = (items, cols, balance = 'bottom') => {
        if (!items || items.length === 0) return [];
        const n = items.length;
        if (n <= cols) return [items];

        const rows = [];
        let currentIndex = 0;

        if (balance === 'top') {
            // Fila incompleta ARRIBA (Pir\u00e1mide)
            const remainder = n % cols;
            const firstRowSize = remainder === 0 ? cols : remainder;
            rows.push(items.slice(0, firstRowSize));
            currentIndex = firstRowSize;
            while (currentIndex < n) {
                rows.push(items.slice(currentIndex, currentIndex + cols));
                currentIndex += cols;
            }
        } else {
            // Fila incompleta ABAJO (Pir\u00e1mide Invertida / Est\u00e1ndar)
            while (currentIndex < n) {
                let size = Math.min(cols, n - currentIndex);
                rows.push(items.slice(currentIndex, currentIndex + size));
                currentIndex += size;
            }
        }
        return rows;
    };

    const orderedRows = distributeOrders(filteredOrders, Math.round(configOrla.aCols || 8), configOrla.studentRowBalance);

    const autoAdjustLayout = (passedConfig = null) => {
        const configToUse = (passedConfig && passedConfig.nativeEvent) ? {} : (passedConfig || {});
        const cfg = { ...configOrla, ...configToUse };
        const cw = cfg.canvasW || 4961;
        const ch = cfg.canvasH || 3508;
        const scale = cw / 4961; 

        const numDocs = filteredStaff.length;
        const numAlus = filteredOrders.length;
        if (numAlus === 0 && numDocs === 0) return;

        const updates = {};
        const margin = safeMmToPx(5);
        updates.margin = margin;
        const availableWidth = cw - (margin * 2);

        // 1. Footer (Sección inferior)
        updates.fontSizeSchool = Math.round(115 * scale);
        updates.fontSizePromo = Math.round(65 * scale);
        updates.fontSizeCourse = Math.round(55 * scale);
        const footerHeight = (updates.fontSizeSchool + updates.fontSizePromo + updates.fontSizeCourse) * 1.25 + (60 * scale); 
        const bottomLimit = ch - margin - footerHeight;

        // 2. Bases y Sincronización de Fuentes (Valores Base @ 300dpi)
        const fSizeName_base  = 36;
        const fSizeSur_base   = 28;
        const fSizeRole_base  = 28;
        const photoW_base     = 350;
        const photoH_base     = 450;
        const gapY_base       = 118; // 10mm absoluto (fixed)
        const gapX_base       = 45;
        const textOffset_base = safeMmToPx(10);
        
        // Área vertical de texto base (bajo la foto)
        const textAreaH_base = (fSizeName_base * 2.5);

        // Parámetros internos para el bucle de ajuste: estimaciones iniciales agresivas
        let dScale = numDocs > 10 ? 0.8 : numDocs > 5 ? 1.0 : 1.3; 
        let aScale = 2.5; 
        let found = false;

        for (let iter = 0; iter < 150; iter++) {
            const realDocH = ((photoH_base * dScale) + (textAreaH_base * dScale)) * scale;
            const sectionGap = safeMmToPx(15); 
            const currentTopLimit = margin + (20 * scale) + realDocH + sectionGap;
            const currentAvailH = bottomLimit - currentTopLimit;

            const rowH = ((photoH_base + textAreaH_base) * aScale * scale) + (gapY_base * scale);
            const totalH = rows * rowH;
            const totalW = (cols * photoW_base * aScale * scale) + ((cols - 1) * gapX_base * scale);

            if (totalH <= currentAvailH && totalW <= availableWidth) {
                found = true;
                updates.dScale = Number((dScale * scale).toFixed(4));
                updates.aScale = Number((aScale * scale).toFixed(4));
                updates.aStartY = Math.round(currentTopLimit + (currentAvailH - totalH) / 2);
                break;
            }

            if (aScale > 0.45) aScale -= 0.02;
            else if (dScale > 0.45) { dScale -= 0.02; aScale -= 0.005; }
            else aScale -= 0.01;
            
            if (dScale < 0.1 || aScale < 0.05) break; 
        }

        if (!found) {
            updates.dScale = Number((dScale * scale).toFixed(4));
            updates.aScale = Number((aScale * scale).toFixed(4));
            const realDocH = ((photoH_base * dScale) + (textAreaH_base * dScale)) * scale;
            updates.aStartY = Math.round(margin + (20 * scale) + realDocH + safeMmToPx(15));
        }

        updates.aW = photoW_base;
        updates.aH = photoH_base;
        updates.aGapX = Math.round(gapX_base * scale); 
        updates.aGapY = gapY_base; // 1cm absoluto
        updates.aTextOffset = Math.round(textOffset_base * updates.aScale);
        updates.dTextOffset = updates.aTextOffset; // PARIDAD TOTAL
        
        // Almacenamos el tamaño BASE. El renderizador aplica el escalado (aScale o dScale).
        // El usuario solicitó paridad visual total entre docentes y alumnos.
        // El usuario solicitó paridad visual total entre docentes y alumnos.
        updates.fontSizeAluName = fSizeName_base; 
        updates.fontSizeAluSur = fSizeSur_base;
        // Sincronizamos también las variables de docentes por si acaso, aunque el renderizador usará las de alumnos
        updates.fontSizeDocName = fSizeName_base;
        updates.fontSizeDocSur = fSizeSur_base;
        updates.fontSizeDocRole = fSizeRole_base;

        setConfigOrla(prev => ({ ...prev, ...updates }));
    };

    // Función para escalar todo proporcionalmente
    const scaleEverythingProportionally = (newW, newH) => {
        const currentW = configOrla.canvasW || 4961;
        const currentH = configOrla.canvasH || 3508;
        
        // Calculamos factores de escala para ancho y alto
        const scaleFactorW = newW / currentW;
        const scaleFactorH = newH / currentH;
        
        // Usamos el factor más restrictivo para evitar desbordamientos
        const scaleFactor = Math.min(scaleFactorW, scaleFactorH);

        if (scaleFactorW === 1 && scaleFactorH === 1) return;

        const updates = {};
        
        // Parámetros a escalar
        const paramsToScale = [
            'margin', 'dY', 'dGapX', 'dOffsetX', 'fontSizeDocName', 'fontSizeDocRole', 'dTextOffset',
            'aStartY', 'aGapX', 'aGapY', 'aOffsetX', 'fontSizeAluName', 'fontSizeAluSur', 'aTextOffset',
            'aW', 'aH', 'fontSizeSchool', 'fontSizePromo', 'fontSizeCourse', 'footerY'
        ];

        paramsToScale.forEach(key => {
            let val = configOrla[key];
            if (val === undefined) {
                // Asignamos valores base si no existen para que se escalen
                if (key === 'aW') val = 350;
                if (key === 'aH') val = 450;
                if (key === 'fontSizeSchool') val = 200;
                if (key === 'fontSizePromo') val = 80;
                if (key === 'fontSizeAluName') val = 100;
                if (key === 'fontSizeAluSur') val = 70;
                if (key === 'fontSizeDocName') val = 120;
                if (key === 'fontSizeDocRole') val = 84;
                if (key === 'fontSizeCourse') val = 60;
                if (key === 'footerY') val = 0; // Valor inicial relativo al margen (0mm)
            }
            if (val !== undefined) {
                updates[key] = val * scaleFactor;
            }
        });

        // Aplicar el nuevo tamaño de lienzo y los parámetros escalados
        const newConfig = {
            ...configOrla,
            ...updates,
            canvasW: newW,
            canvasH: newH
        };
        
        // Actualizamos configuración
        setConfigOrla(newConfig);

        // Disparamos el ajuste inteligente de forma diferida para que use el nuevo canvasH
        setTimeout(() => {
            autoAdjustLayout(newConfig);
        }, 50);
    };

    // CONFIGURACIÓN DE HERRAMIENTAS POR PESTAÑA
    const TOOLBAR_CONFIG = {
        'GENERAL': {
            label: 'GENERAL',
            icon: Ruler,
            tools: [
                { 
                    icon: Wand2, 
                    label: 'AJUSTE INTELIGENTE', 
                    onClick: () => autoAdjustLayout(),
                    isImmediate: true,
                    description: 'Calcula automáticamente la mejor distribución para las fotos actuales',
                    className: "bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white"
                },
                { icon: Ruler, label: 'MARGENES', key: 'margin', min: safeMmToPx(0), max: safeMmToPx(150), unit: 'MM', description: 'Ajusta el margen de seguridad exterior de la orla' },
                { icon: Eye, label: 'GUÍA MARGEN', key: 'showMarginGuide', isToggle: true, description: 'Muestra u oculta la línea guía del margen de seguridad' },
                { icon: Maximize, label: 'TAMAÑO', key: 'canvasSize', isSizeSelector: true, description: 'Cambia el formato de impresión (A3, A4, 40x30, etc.)' },
                { icon: Layers, label: 'ANCHO', key: 'canvasW', min: 2000, max: 10000, unit: 'PX', description: 'Ajuste manual del ancho del lienzo en píxeles' },
                { icon: Layers, label: 'ALTO', key: 'canvasH', min: 2000, max: 10000, unit: 'PX', description: 'Ajuste manual del alto del lienzo en píxeles' },
                { icon: Grid, label: 'GUIAS', key: 'showGuides', isToggle: true, description: 'Muestra u oculta la rejilla de alineación' },
                { icon: Shapes, label: 'FORMA', key: 'photoShape', isShapeSelector: true, description: 'Cambia el recorte de todas las fotos (C\u00edrculo, \u00d3valo, Escudo...)' },
                { 
                    icon: MoveVertical, 
                    label: 'MOVER TODO', 
                    key: 'globalMoveY', 
                    min: safeMmToPx(-100), 
                    max: safeMmToPx(100), 
                    unit: 'MM', 
                    description: 'Mueve todos los elementos a la vez (excepto el pie de orla)',
                    className: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white"
                },
            ]
        },
        'PIE': {
            label: 'PIE DE ORLA',
            icon: Baseline,
            tools: [
                { icon: MoveVertical, label: 'EJE Y', key: 'footerY', min: safeMmToPx(0), max: safeMmToPx(500), unit: 'MM', description: 'Posición vertical del bloque de texto inferior' },
                { icon: Type, label: 'CENTRO', key: 'fontSizeSchool', min: 10, max: 800, step: 10, unit: 'PT', toggleKey: 'hideSchool', description: 'Tamaño del nombre del colegio' },
                { icon: TypeIcon, label: 'PROMO', key: 'fontSizePromo', min: 10, max: 500, step: 5, unit: 'PT', toggleKey: 'hidePromo', description: 'Tamaño del texto de la promoción' },
                { icon: TypeIcon, label: 'CURSO', key: 'fontSizeCourse', min: 10, max: 500, step: 5, unit: 'PT', toggleKey: 'hideCourse', description: 'Tamaño del texto del curso y grupo' },
                { 
                    icon: TypeIcon, 
                    label: 'TODOS', 
                    key: 'fontSizeAllFooter', 
                    min: 10, 
                    max: 800, 
                    step: 10, 
                    unit: 'PT', 
                    description: 'Ajuste simultáneo de los tres textos del pie' 
                },
            ]
        },
        'ALUMNOS': {
            label: 'ALUMNOS',
            icon: LayoutGrid,
            tools: [
                { icon: LayoutGrid, label: 'ALUMNOS POR FILA', key: 'aCols', min: 1, max: 20, step: 1, unit: 'ALUMNOS', description: 'Número de columnas en la cuadrícula de alumnos' },
                { icon: Maximize, label: 'ESCALA', key: 'aScale', min: 0.2, max: 4.0, step: 0.05, unit: 'x', description: 'Tamaño general de las fotos de los alumnos' },
                { icon: MoveVertical, label: 'EJE Y', key: 'aStartY', min: safeMmToPx(0), max: safeMmToPx(350), unit: 'MM', description: 'Margen superior donde empieza el bloque de alumnos' },
                { icon: TypeIcon, label: 'T. NOMBRES', key: 'fontSizeAluName', min: 10, max: 1000, step: 5, unit: 'PX', description: 'Tamaño de fuente para los nombres de alumnos' },
                { icon: TypeIcon, label: 'T. APELLIDOS', key: 'fontSizeAluSur', min: 10, max: 800, step: 5, unit: 'PX', toggleKey: 'hideApellidosAlu', description: 'Tamaño de fuente para los apellidos (u ocultarlos)' },
                { icon: Baseline, label: 'SEP. TEXTO', key: 'aTextOffset', min: 0, max: 100, step: 1, unit: 'PT', description: 'Distancia entre la foto y el nombre del alumno' },
                { icon: MoveHorizontal, label: 'SEP. HORIZ', key: 'aGapX', min: safeMmToPx(0), max: safeMmToPx(300), unit: 'MM', description: 'Espacio horizontal entre fotos de alumnos' },
                { icon: ArrowUpDown, label: 'SEP. VERT', key: 'aGapY', min: safeMmToPx(0), max: safeMmToPx(500), unit: 'MM', description: 'Espacio vertical entre filas de alumnos' },
                { 
                    icon: TwoTrianglesIcon, 
                    label: 'FILAS', 
                    key: 'studentRowBalance', 
                    isToggle: true, 
                    description: 'Alterna entre pirámide normal o invertida para alumnos impares',
                    onClick: () => {
                        const current = configOrla.studentRowBalance || 'bottom';
                        updateConfig('studentRowBalance', current === 'bottom' ? 'top' : 'bottom');
                    }
                },
            ]
        },
        'DOCENTES': {
            label: 'DOCENTES',
            icon: UserSquare2,
            tools: [
                { icon: UserSquare2, label: 'ESCALA', key: 'dScale', min: 0.2, max: 5.0, step: 0.05, unit: 'x', description: 'Ajusta el tamaño de las fotos de los docentes' },
                { icon: MoveVertical, label: 'EJE Y', key: 'dY', min: safeMmToPx(0), max: safeMmToPx(350), unit: 'MM', description: 'Posición vertical de la fila de docentes' },
                { icon: TypeIcon, label: 'T. NOMBRES', key: 'fontSizeAluName', min: 10, max: 1000, step: 5, unit: 'PX', description: 'Tamaño de fuente para los nombres (compartido con alumnos)' },
                { icon: TypeIcon, label: 'T. APELLIDOS', key: 'fontSizeAluSur', min: 10, max: 800, step: 5, unit: 'PX', toggleKey: 'hideApellidosDoc', description: 'Tamaño de fuente para los apellidos (compartido con alumnos)' },
                { icon: TypeIcon, label: 'T. CARGO', key: 'fontSizeAluSur', min: 10, max: 800, step: 5, unit: 'PX', toggleKey: 'hideCargoDoc', description: 'Tamaño de fuente para los cargos (usa tamaño de apellidos de alumnos)' },
                { icon: Baseline, label: 'SEP. TEXTO', key: 'dTextOffset', min: 0, max: 100, step: 1, unit: 'PT', description: 'Distancia entre la foto y el texto del docente' },
                { icon: MoveHorizontal, label: 'SEPARACIÓN', key: 'dGapX', min: safeMmToPx(0), max: safeMmToPx(500), unit: 'MM', description: 'Espacio horizontal entre los docentes' },
            ]
        },
    };

    // Efecto para sincronizar el parámetro activo al cambiar de pestaña
    useEffect(() => {
        if (isFullScreenDesign) {
            // Reset de sub-menús específicos al cambiar de pestaña para evitar solapamientos
            setShowSizeSelector(false);
            setShowShapeSelector(false);

            const firstTool = TOOLBAR_CONFIG[activeTab].tools[0];
            // No activamos automáticamente si es un selector o toggle inmediato
            if (firstTool && !firstTool.isImmediate && !firstTool.isToggle && !firstTool.isShapeSelector && !firstTool.isSizeSelector && !firstTool.onClick) {
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
    const [showSizeSelector, setShowSizeSelector] = useState(false);
    const currentShape = configOrla.photoShape || 'circle';

    // Auto-ajuste de zoom al entrar en el editor
    useEffect(() => {
        if (isFullScreenDesign) {
            const canvasW = configOrla.canvasW || 4961;
            const canvasH = configOrla.canvasH || 3508;
            
            // Espacio disponible (restando dock inferior y dejando aire alrededor)
            const availableW = window.innerWidth - 200;
            const availableH = window.innerHeight - 400;
            
            const scaleW = availableW / canvasW;
            const scaleH = availableH / canvasH;
            
            // Usamos un factor de escala para que se vea como en la captura (con aire alrededor)
            const fitZoom = Math.min(scaleW, scaleH) * 0.85; 
            
            setZoom(fitZoom);
            // El offset Y en -100 sube el canva para que el dock no lo tape y quede visualmente centrado en el espacio libre
            setOffset({ x: 0, y: -100 }); 

            // Activar por defecto la herramienta de MARGENES (ahora la segunda)
            if (TOOLBAR_CONFIG['GENERAL'] && TOOLBAR_CONFIG['GENERAL'].tools[1]) {
                setActiveDesignParam(TOOLBAR_CONFIG['GENERAL'].tools[1]);
            }
        }
    }, [isFullScreenDesign, configOrla.canvasW, configOrla.canvasH]);



    // Calcular escala para la vista previa pequeña
    const [previewScale, setPreviewScale] = useState(0.1);
    useEffect(() => {
        if (!isFullScreenDesign && canvasContainerRef.current) {
            const container = canvasContainerRef.current;
            const canvasW = configOrla.canvasW || 4961;
            const canvasH = configOrla.canvasH || 3508;
            
            const scaleW = (container.clientWidth - 40) / canvasW;
            const scaleH = (container.clientHeight - 40) / canvasH;
            setPreviewScale(Math.min(scaleW, scaleH));
        }
    }, [isFullScreenDesign, configOrla.canvasW, configOrla.canvasH, orders.length, staff.length]);

    // Auto-selección del curso en el selector cuando no hay filtro manual
    useEffect(() => {
        // Solo actúa si el usuario no ha seleccionado un curso
        if (designFilter.course) return;

        // Extrae los cursos únicos de los pedidos del centro activo
        const uniqueCourses = [...new Set(
            (orders || [])
                .filter(o => o.course)
                .map(o => getCourseBase(o.course))
                .filter(Boolean)
        )];

        // Si solo hay un curso, lo selecciona automáticamente
        if (uniqueCourses.length === 1) {
            setDesignFilter(prev => ({ ...prev, course: uniqueCourses[0], group: '' }));
        }
    }, [orders, adminSchool]);

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
        // Ignorar si el clic viene de un elemento interactivo del dock
        const tag = e.target.tagName.toLowerCase();
        const interactive = ['button', 'input', 'select', 'textarea', 'label', 'a'];
        if (interactive.includes(tag)) return;
        if (e.target.closest('button, input, select, [role="button"]')) return;
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
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                    <p className="text-white/60 text-[9px] uppercase tracking-[0.4em] font-black flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Sistema de Renderizado Vectorial
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto mr-2">

                            <button
                                onClick={handleFinalizeClick}
                                className={`flex-1 md:flex-none h-12 px-8 ${isBlocked ? 'bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-2xl flex items-center justify-center gap-3 transition-all shadow-glow-emerald text-[10px] font-black uppercase tracking-widest active:scale-95 border border-white/20 hover:border-white/40`}
                            >
                                <LayoutGrid size={18} />
                                {isBlocked ? <Shield size={16} className="text-amber-500" /> : null}
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
                                        width: (configOrla.canvasW || 4961) + 'px',
                                        height: (configOrla.canvasH || 3508) + 'px',
                                        backgroundImage: `
                                                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                                                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                                                `,
                                        backgroundSize: '100px 100px',
                                        transform: `scale(${previewScale})`,
                                        transformOrigin: 'center center',
                                    }}>

                                    {/* El indicador se ha movido al dock inferior */}

                                    {/* Márgenes (Guía de Seguridad) */}
                                    {configOrla.showMarginGuide && (
                                        <div className="absolute border-[4px] border-red-600 border-dashed pointer-events-none z-[100] opacity-100"
                                            style={{ 
                                                inset: (configOrla.margin || 0) + 'px',
                                                boxSizing: 'border-box'
                                            }} />
                                    )}

                                    {/* Contenido Orla */}
                                    <div className="absolute top-0 w-full flex flex-wrap justify-center z-20 pointer-events-auto"
                                        style={{
                                            top: (configOrla.dY || 0) + 'px',
                                            padding: `0 ${(configOrla.margin || 20)}px`,
                                            gap: `${configOrla.dGapY ?? 100}px ${configOrla.dGapX ?? 0}px`,
                                            transform: `translateX(${(configOrla.dOffsetX || 0)}px)`
                                        }}>
                                        {filteredStaff.map((member) => {
                                            const { nombre, apellidos } = splitName(member.name);
                                            const baseScale = configOrla.dScale || 1.2;
                                            const w = (configOrla.aW || 350);
                                            const h = (configOrla.aH || 450);
                                            return (
                                                <div key={member.id}
                                                    className="relative flex flex-col items-center text-center group/member overflow-visible"
                                                    style={{ width: (w * baseScale) + 'px' }}
                                                >
                                                    <div className="relative flex flex-col items-center">
                                                        <div className="overflow-hidden" style={{
                                                            width: Math.round(w * baseScale) + 'px',
                                                            height: Math.round(h * baseScale) + 'px',
                                                            ...getShapeStyle(currentShape, Math.round(w * baseScale), Math.round(h * baseScale)),
                                                            margin: '0 auto'
                                                        }}>
                                                            {getPhotoSrc(member) ? (
                                                                <img 
                                                                    src={getPhotoSrc(member)} 
                                                                    className="w-full h-full object-cover transition-transform duration-300" 
                                                                    style={getPhotoTransform(member.photoConfig)}
                                                                    alt={member.name}
                                                                    onDragStart={(e) => e.preventDefault()}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                                    <div className="text-slate-300 font-black" style={{ fontSize: (w * baseScale * 0.12) + 'px' }}>DOCENTE</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-center w-full" style={{
                                                            marginTop: (configOrla.aTextOffset ?? 0) + 'px',
                                                            padding: '0'
                                                        }}>
                                                            <div
                                                                contentEditable={true}
                                                                suppressContentEditableWarning={true}
                                                                className="font-normal uppercase text-black leading-tight outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-2 transition-all duration-200 group-hover/member:text-accent focus:shadow-lg w-full text-center"
                                                                style={{ 
                                                                    fontSize: ((configOrla.fontSizeAluName || 36) * (configOrla.aScale || 1)) + 'px', 
                                                                    textAlign: 'center'
                                                                }}
                                                                onBlur={(e) => {
                                                                    const newName = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
                                                                <div className="leading-[1.1] text-wrap">{nombre}</div>
                                                                <div
                                                                    className="leading-[1.1] text-wrap cursor-pointer hover:text-accent"
                                                                    style={{ 
                                                                        display: configOrla.hideApellidosDoc ? 'none' : 'block',
                                                                        fontSize: ((configOrla.fontSizeAluSur || 28) * (configOrla.aScale || 1)) + 'px'
                                                                    }}
                                                                >
                                                                    {apellidos}
                                                                </div>
                                                            </div>
                                                            <p
                                                                contentEditable={true}
                                                                suppressContentEditableWarning={true}
                                                                className="font-normal uppercase text-black leading-tight mt-0.5 outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-1 transition-all duration-200 hover:text-accent focus:shadow-lg"
                                                                style={{
                                                                    fontSize: ((configOrla.fontSizeAluSur || 28) * (configOrla.aScale || 1)) + 'px',
                                                                    display: configOrla.hideCargoDoc ? 'none' : 'block',
                                                                    textAlign: 'center',
                                                                    width: '100%',
                                                                    padding: '0 10px'
                                                                }}
                                                                onBlur={(e) => {
                                                                    const newRole = e.target.innerText.trim();
                                                                    if (newRole && newRole !== member.role) {
                                                                        updateStaffMember(member.id, { role: newRole });
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        e.target.blur();
                                                                    }
                                                                }}
                                                            >{member.role || 'DOCENTE'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="absolute w-full z-10 pointer-events-auto"
                                        style={{
                                            top: (configOrla.aStartY || 1350) + 'px',
                                            padding: `0 ${(configOrla.margin || 20)}px`,
                                            transform: `translateX(${(configOrla.aOffsetX || 0)}px)`
                                        }}>
                                        <div className="flex flex-col items-center"
                                            style={{
                                                gap: '118px' // Forzado a 1cm (10mm) exacto entre filas
                                            }}>
                                            {orderedRows.map((rowItems, rowIndex) => (
                                                <div key={rowIndex} className="flex justify-center" style={{ gap: (configOrla.aGapX ?? 0) + 'px' }}>
                                                    {rowItems.map((o) => {
                                                        const { nombre, apellidos } = splitName(o.studentName);
                                                        const baseScale = configOrla.aScale || 1;
                                                        const w = (configOrla.aW || 350);
                                                        const h = (configOrla.aH || 450);
                                                        return (
                                                            <div key={o.id}
                                                                className="flex flex-col items-center text-center group/alu overflow-visible"
                                                                style={{ width: (w * baseScale) + 'px' }}
                                                            >
                                                                <div className="relative flex flex-col items-center">
                                                                    <div className="overflow-hidden" style={{
                                                                        width: Math.round(w * baseScale) + 'px',
                                                                        height: Math.round(h * baseScale) + 'px',
                                                                        ...getShapeStyle(currentShape, Math.round(w * baseScale), Math.round(h * baseScale)),
                                                                        margin: '0 auto'
                                                                    }}>
                                                                        {getPhotoSrc(o) ? (
                                                                            <img 
                                                                                src={getPhotoSrc(o)} 
                                                                                className="w-full h-full object-cover transition-transform duration-300" 
                                                                                style={getPhotoTransform(o.photoConfig)}
                                                                                alt={o.studentName}
                                                                                onDragStart={(e) => e.preventDefault()}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                                                <div className="text-slate-300 font-black" style={{ fontSize: (w * baseScale * 0.15) + 'px' }}>{o.photo_file_number || '?'}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col items-center w-full" style={{
                                                                        marginTop: (configOrla.aTextOffset ?? 0) + 'px',
                                                                        padding: '0'
                                                                    }}>
                                                                        <div
                                                                            contentEditable={true}
                                                                            suppressContentEditableWarning={true}
                                                                            className="font-normal uppercase text-black leading-tight outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-2 transition-all duration-200 group-hover/alu:text-accent focus:shadow-lg w-full text-center"
                                                                            style={{ 
                                                                                fontSize: ((configOrla.fontSizeAluName || 36) * baseScale) + 'px', 
                                                                                textAlign: 'center'
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                const newName = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                                                                                if (newName && newName !== nombre) {
                                                                                    updateOrder(o.id, { studentName: `${newName} ${apellidos}`.trim() });
                                                                                }
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    e.target.blur();
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className="leading-[1.1] text-wrap">{nombre}</div>
                                                                        </div>
                                                                        <div
                                                                            contentEditable={true}
                                                                            suppressContentEditableWarning={true}
                                                                            className="font-normal uppercase text-black leading-tight mt-0.5 outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-1 transition-all duration-200 group-hover/alu:text-accent focus:shadow-lg"
                                                                            style={{ 
                                                                                fontSize: ((configOrla.fontSizeAluSur || 28) * baseScale) + 'px', 
                                                                                display: configOrla.hideApellidosAlu ? 'none' : 'block',
                                                                                textAlign: 'center'
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                const newSur = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                                                                                if (newSur !== apellidos) {
                                                                                    updateOrder(o.id, { studentName: `${nombre} ${newSur}`.trim() });
                                                                                }
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    e.target.blur();
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className="leading-[1.1] text-wrap">{apellidos}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pie de Orla */}
                                    <div className="absolute bottom-0 w-full text-center pointer-events-auto" style={{ bottom: ((configOrla.margin || 0) + (configOrla.footerY || 0)) + 'px' }}>
                                        {!configOrla.hideSchool && (
                                            <h2
                                                contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                className="font-normal text-black uppercase tracking-tighter outline-none cursor-text hover:text-accent hover:bg-accent/5 focus:bg-white focus:ring-8 focus:ring-accent/10 transition-all duration-300 focus:shadow-2xl inline-block px-4 rounded whitespace-nowrap mx-auto"
                                                style={{ fontSize: (configOrla.fontSizeSchool || 200) + 'px' }}
                                                onBlur={(e) => {
                                                    const newName = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
                                            >{currentSchool.name}</h2>
                                        )}
                                        <div className="clear-both"></div>
                                        {!configOrla.hidePromo && (
                                            <p
                                                contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                className="font-normal text-black tracking-[0.5em] mt-1 outline-none cursor-text hover:text-accent hover:bg-accent/5 focus:bg-white focus:ring-2 focus:ring-accent/30 transition-all duration-200 inline-block px-2 rounded ml-[0.5em]"
                                                style={{ fontSize: (configOrla.fontSizePromo || 80) + 'px' }}
                                                onBlur={(e) => {
                                                    const newText = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
                                            >{configOrla.promoText || "PROMOCIÓN 2026"}</p>
                                        )}
                                        <div className="clear-both"></div>
                                        {!configOrla.hideCourse && (
                                            <p
                                                contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                className="font-black text-black uppercase mt-1 outline-none cursor-text hover:text-accent hover:bg-accent/5 focus:bg-white focus:ring-2 focus:ring-accent/30 transition-all duration-200 inline-block px-2 rounded"
                                                style={{
                                                    fontSize: (configOrla.fontSizeCourse || 60) + 'px',
                                                    letterSpacing: '0.2em'
                                                }}
                                                onBlur={(e) => {
                                                    const newText = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                                                    if (newText && newText !== (configOrla.courseText || `${designFilter.course || ''} ${designFilter.group || ''}`)) {
                                                        updateConfig('courseText', newText);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        e.target.blur();
                                                    }
                                                }}
                                            >
                                                {(configOrla.courseText && configOrla.courseText.trim().length > 0) 
                                                    ? configOrla.courseText 
                                                    : autoDetectedCourse 
                                                        ? autoDetectedCourse 
                                                        : "AÑADIR CURSO AQUÍ"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Selectores de Centro / Curso */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-[5fr_2.5fr_2.5fr] gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-black tracking-widest uppercase ml-1">CENTRO EDUCATIVO</label>
                                <select value={adminSchool} onChange={e => setAdminSchool(e.target.value)} className="input-dark text-black cursor-pointer">{schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-black tracking-widest uppercase ml-1">CURSO</label>
                                <select value={designFilter.course} onChange={e => setDesignFilter(p => ({ ...p, course: e.target.value, group: '' }))} className="input-dark text-black cursor-pointer">
                                    <option value="">TODOS</option>
                                    {[...new Set(orders.map(o => getCourseBase(o.course)))].filter(Boolean).sort().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-black tracking-widest uppercase ml-1">GRUPOS</label>
                                <select value={designFilter.group} onChange={e => setDesignFilter(p => ({ ...p, group: e.target.value }))} className="input-dark !px-4 text-black cursor-pointer">
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
                        <div className={`relative shadow-[0_0_100px_rgba(0,0,0,0.3)] transition-colors duration-500 ${isDark ? 'bg-slate-200' : 'bg-white'} [*]:box-border`}
                            style={{
                                width: (configOrla.canvasW || 4961) + 'px',
                                height: (configOrla.canvasH || 3508) + 'px'
                            }}>

                            {/* El indicador se ha movido al dock inferior */}

                            {/* Grid de diseño (visible solo en editor) */}
                            {showGuides && (
                                <div className={`absolute inset-0 opacity-[0.2] transition-colors duration-500`}
                                    style={{ backgroundImage: `linear-gradient(${isDark ? '#cbd5e1' : '#e2e8f0'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#cbd5e1' : '#e2e8f0'} 1px, transparent 1px)`, backgroundSize: '50px 50px' }}
                                />
                            )}

                            {/* Márgenes (Guía de Seguridad) */}
                            {configOrla.showMarginGuide && (
                                <div className="absolute border-[4px] border-red-600 border-dashed pointer-events-none z-[100] opacity-100"
                                    style={{ 
                                        inset: (configOrla.margin || 0) + 'px',
                                        boxSizing: 'border-box'
                                    }} />
                            )}

                            {/* Guías de Centrado dinámicas */}
                            {showGuides && (
                                <>
                                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-400/40 z-50 pointer-events-none shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                                    <div className="absolute left-0 right-0 top-1/2 h-px bg-red-400/40 z-50 pointer-events-none shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                                </>
                            )}

                            {/* Contenido Completo del Canvas */}
                            <div className="absolute top-0 w-full flex flex-wrap justify-center z-20 pointer-events-auto"
                                style={{
                                    top: (configOrla.dY || 0) + 'px',
                                    padding: `0 ${(configOrla.margin || 20)}px`,
                                    gap: `${configOrla.dGapY ?? 100}px ${configOrla.dGapX ?? 0}px`,
                                    transform: `translateX(${(configOrla.dOffsetX || 0)}px)`
                                }}>
                                {filteredStaff.map((member) => {
                                    const { nombre, apellidos } = splitName(member.name);
                                    const baseSize = configOrla.fontSizeDoc || 120;
                                    const baseScale = configOrla.dScale || 1.2;
                                    const w = (configOrla.aW || 350);
                                    const h = (configOrla.aH || 450);
                                    return (
                                        <div key={member.id}
                                            className="relative flex flex-col items-center text-center group/member overflow-visible"
                                            style={{ width: (w * baseScale) + 'px' }}
                                        >
                                            <div className="relative flex flex-col items-center">
                                                {/* Foto docente: dimensiones directas sin transform scale */}
                                                <div className="overflow-hidden" style={{
                                                    width: Math.round(w * baseScale) + 'px',
                                                    height: Math.round(h * baseScale) + 'px',
                                                    ...getShapeStyle(currentShape, Math.round(w * baseScale), Math.round(h * baseScale)),
                                                    margin: '0 auto'
                                                }}>
                                                        {getPhotoSrc(member) ? (
                                                            <img 
                                                                src={getPhotoSrc(member)} 
                                                                className="w-full h-full object-cover transition-transform duration-300" 
                                                                style={getPhotoTransform(member.photoConfig)}
                                                                alt={member.name}
                                                                onDragStart={(e) => e.preventDefault()}
                                                            />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            <div className="text-slate-300 font-black" style={{ fontSize: (w * baseScale * 0.12) + 'px' }}>DOCENTE</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center w-full" style={{
                                                    marginTop: (configOrla.aTextOffset ?? 0) + 'px',
                                                    padding: '0'
                                                }}>
                                                    <div
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveTab('DOCENTES');
                                                            setActiveDesignParam(TOOLBAR_CONFIG['DOCENTES'].tools[2]); // T. NOMBRES (ahora apunta a fontSizeAluName)
                                                        }}
                                                        className="font-normal uppercase text-black leading-tight outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-2 transition-all duration-200 group-hover/member:text-accent focus:shadow-lg w-full text-center"
                                                        style={{ 
                                                            fontSize: ((configOrla.fontSizeAluName || 36) * (configOrla.aScale || 1)) + 'px', 
                                                            textAlign: 'center'
                                                        }}
                                                        onBlur={(e) => {
                                                            const newName = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
                                                        <div className="leading-[1.1] text-wrap">{nombre}</div>
                                                        <div 
                                                            className="leading-[1.1] text-wrap cursor-pointer hover:text-accent" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveTab('DOCENTES');
                                                                setActiveDesignParam(TOOLBAR_CONFIG['DOCENTES'].tools[3]); // T. APELLIDOS (ahora apunta a fontSizeAluSur)
                                                            }}
                                                            style={{ 
                                                                display: configOrla.hideApellidosDoc ? 'none' : 'block',
                                                                fontSize: ((configOrla.fontSizeAluSur || 28) * (configOrla.aScale || 1)) + 'px'
                                                            }}
                                                        >
                                                            {apellidos}
                                                        </div>
                                                    </div>
                                                    <p
                                                        contentEditable={true}
                                                        suppressContentEditableWarning={true}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveTab('DOCENTES');
                                                            setActiveDesignParam(TOOLBAR_CONFIG['DOCENTES'].tools[4]); // T. CARGO (ahora apunta a fontSizeAluSur)
                                                        }}
                                                        className="font-normal uppercase text-black leading-tight mt-0.5 outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-1 transition-all duration-200 hover:text-accent focus:shadow-lg"
                                                        style={{
                                                            fontSize: ((configOrla.fontSizeAluSur || 28) * (configOrla.aScale || 1)) + 'px',
                                                            display: configOrla.hideCargoDoc ? 'none' : 'block',
                                                            textAlign: 'center',
                                                            width: '100%',
                                                            padding: '0 10px'
                                                        }}
                                                        onBlur={(e) => {
                                                            const newRole = e.target.innerText.trim();
                                                            if (newRole && newRole !== member.role) {
                                                                updateStaffMember(member.id, { role: newRole });
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                e.target.blur();
                                                            }
                                                        }}
                                                    >{member.role || 'DOCENTE'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute w-full z-10 pointer-events-auto"
                                style={{
                                    top: (configOrla.aStartY || 1350) + 'px',
                                    padding: `0 ${(configOrla.margin || 20)}px`,
                                    transform: `translateX(${(configOrla.aOffsetX || 0)}px)`
                                }}>
                                <div className="flex flex-col justify-center"
                                    style={{
                                        gap: '118.11px' // Exactamente 1cm (10mm @ 300dpi eq) entre filas de alumnos
                                    }}>
                                    {orderedRows.map((rowItems, rowIndex) => (
                                        <div key={`row-${rowIndex}`} className="flex justify-center"
                                            style={{
                                                gap: (configOrla.aGapX ?? 0) + 'px'
                                            }}>
                                            {rowItems.map((o) => {
                                                const { nombre, apellidos } = splitName(o.studentName);
                                                const baseSize = configOrla.fontSizeAlu || 100;
                                                const baseScale = configOrla.aScale || 1;
                                                const w = (configOrla.aW || 350);
                                                const h = (configOrla.aH || 450);
                                                return (
                                                    <div key={o.id}
                                                        className="flex flex-col items-center text-center group/alu overflow-visible"
                                                        style={{ width: (w * baseScale) + 'px' }}
                                                    >
                                                        <div className="relative flex flex-col items-center">
                                                            {/* Foto alumno: dimensiones directas sin transform scale */}
                                                            <div className="overflow-hidden" style={{
                                                                width: Math.round(w * baseScale) + 'px',
                                                                height: Math.round(h * baseScale) + 'px',
                                                                ...getShapeStyle(currentShape, Math.round(w * baseScale), Math.round(h * baseScale)),
                                                                margin: '0 auto'
                                                            }}>
                                                                {getPhotoSrc(o) ? (
                                                                    <img 
                                                                        src={getPhotoSrc(o)} 
                                                                        className="w-full h-full object-cover transition-transform duration-300" 
                                                                        style={getPhotoTransform(o.photoConfig)}
                                                                        alt={o.studentName}
                                                                        onDragStart={(e) => e.preventDefault()}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                                        <div className="text-slate-300 font-black" style={{ fontSize: (w * baseScale * 0.15) + 'px' }}>{o.photo_file_number || '?'}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center w-full" style={{
                                                                marginTop: (configOrla.aTextOffset ?? 0) + 'px',
                                                                padding: '0'
                                                            }}>
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveTab('ALUMNOS');
                                                                        setActiveDesignParam(TOOLBAR_CONFIG['ALUMNOS'].tools[2]); // T. NOMBRES
                                                                    }}
                                                                    className="flex items-center justify-center gap-1.5 font-normal uppercase text-black leading-tight hover:bg-accent/5 rounded px-2 transition-all duration-200 group-hover/alu:text-accent w-full text-center"
                                                                    style={{ 
                                                                        fontSize: ((configOrla.fontSizeAluName || 36) * baseScale) + 'px', 
                                                                        textAlign: 'center'
                                                                    }}
                                                                >
                                                                    <div 
                                                                        contentEditable={true}
                                                                        suppressContentEditableWarning={true}
                                                                        className="leading-[1.1] text-wrap outline-none focus:bg-white focus:ring-4 focus:ring-accent/20 px-1"
                                                                        onBlur={(e) => {
                                                                            const newName = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                                                                            if (newName && newName !== nombre) {
                                                                                updateOrder(o.id, { studentName: `${newName} ${apellidos}`.trim() });
                                                                            }
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                e.target.blur();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {nombre}
                                                                    </div>
                                                                </div>
                                                                <div
                                                            contentEditable={true}
                                                            suppressContentEditableWarning={true}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveTab('ALUMNOS');
                                                                setActiveDesignParam(TOOLBAR_CONFIG['ALUMNOS'].tools[3]); // T. APELLIDOS
                                                            }}
                                                            className="font-normal uppercase text-black leading-tight mt-0.5 outline-none cursor-text hover:bg-accent/5 focus:bg-white focus:ring-4 focus:ring-accent/20 rounded px-1 transition-all duration-200 group-hover/alu:text-accent focus:shadow-lg"
                                                            style={{ 
                                                                fontSize: ((configOrla.fontSizeAluSur || 28) * baseScale) + 'px', 
                                                                display: configOrla.hideApellidosAlu ? 'none' : 'block',
                                                                textAlign: 'center'
                                                            }}
                                                            onBlur={(e) => {
                                                                // Nota: Esto actualiza el nombre completo combinándolo
                                                                const newSur = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                                                                if (newSur !== apellidos) {
                                                                    updateOrder(o.id, { studentName: `${nombre} ${newSur}`.trim() });
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    e.target.blur();
                                                                }
                                                            }}
                                                        >
                                                            <div className="leading-[1.1] text-wrap">{apellidos}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute bottom-0 w-full text-center pointer-events-auto" style={{ bottom: ((configOrla.margin || 0) + (configOrla.footerY || 0)) + 'px' }}>
                                {!configOrla.hideSchool && (
                                    <h2
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTab('PIE');
                                            setActiveDesignParam(TOOLBAR_CONFIG['PIE'].tools[1]); // T. COLEGIO
                                        }}
                                        className="font-normal text-black uppercase tracking-tighter outline-none cursor-text hover:text-accent hover:bg-accent/5 focus:bg-white focus:ring-8 focus:ring-accent/10 transition-all duration-300 focus:shadow-2xl inline-block px-4 rounded whitespace-nowrap mx-auto"
                                        style={{ fontSize: (configOrla.fontSizeSchool || 200) + 'px' }}
                                        onBlur={(e) => {
                                            const newName = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
                                )}
                                <div className="clear-both"></div>
                                {!configOrla.hidePromo && (
                                    <p
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTab('PIE');
                                            setActiveDesignParam(TOOLBAR_CONFIG['PIE'].tools[2]); // T. PROMO
                                        }}
                                        className="font-normal text-black tracking-[0.5em] mt-1 outline-none cursor-text hover:text-accent hover:bg-accent/5 focus:bg-white focus:ring-8 focus:ring-accent/10 transition-all duration-300 focus:shadow-2xl inline-block px-2 rounded ml-[0.5em] max-w-[95%]"
                                        style={{ fontSize: (configOrla.fontSizePromo || 80) + 'px' }}
                                        onBlur={(e) => {
                                            const newText = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
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
                                )}
                                <div className="clear-both"></div>
                                {!configOrla.hideCourse && (
                                    <p
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTab('PIE');
                                            setActiveDesignParam(TOOLBAR_CONFIG['PIE'].tools[3]); // T. CURSO
                                        }}
                                        className="font-semibold text-gray-500 uppercase tracking-widest mt-0.5 outline-none cursor-text hover:text-accent hover:bg-accent/5 focus:bg-white focus:ring-8 focus:ring-accent/10 transition-all duration-300 focus:shadow-2xl inline-block px-2 rounded max-w-[95%]"
                                        style={{ fontSize: (configOrla.fontSizeCourse || 60) + 'px' }}
                                        onBlur={(e) => {
                                            const newText = e.target.innerText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                                            if (newText && newText !== (configOrla.courseText || (getCourseBase(designFilter?.course) + " " + getGroup(designFilter?.group)).trim() || "AÑADIR CURSO AQUÍ")) {
                                                updateConfig('courseText', newText);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.target.blur();
                                            }
                                        }}
                                    >
                                        {configOrla.courseText && configOrla.courseText.trim().length > 0 
                                            ? configOrla.courseText 
                                            : autoDetectedCourse 
                                                ? autoDetectedCourse 
                                                : "AÑADIR CURSO AQUÍ"}
                                    </p>
                                )}
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
                            {['GENERAL', 'PIE', 'ALUMNOS', 'DOCENTES'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 text-[9px] font-black tracking-[0.2em] transition-all border-b-2 ${activeTab === tab
                                        ? 'border-accent text-accent bg-accent/5'
                                        : `${isDark ? 'border-transparent text-white/40 hover:text-white hover:bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-900 hover:bg-black/5'}`}`}
                                >
                                    {TOOLBAR_CONFIG[tab].label}
                                </button>
                            ))}
                        </div>

                        {/* 2. Dock de Herramientas Principal */}
                        <div className="p-2 flex items-center justify-between gap-1 overflow-visible">
                            <div className="flex items-center gap-1 flex-grow overflow-visible py-0.5">
                                {(() => {
                                    const isCustom = !CANVAS_SIZES.some(s => !s.custom && Math.round(safePxToMm(configOrla.canvasW || 4961)) === s.w && Math.round(safePxToMm(configOrla.canvasH || 3508)) === s.h);
                                    
                                    return TOOLBAR_CONFIG[activeTab].tools
                                        .filter(tool => {
                                            if (activeTab === 'GENERAL' && (tool.key === 'canvasW' || tool.key === 'canvasH')) {
                                                return isCustom;
                                            }
                                            return true;
                                        })
                                        .map(tool => {
                                            if (tool.isShapeSelector) {
                                                return (
                                                    <button
                                                        key="forma-selector"
                                                        onClick={() => { 
                                                            setShowShapeSelector(v => !v); 
                                                            setShowSizeSelector(false);
                                                            setActiveDesignParam(null); 
                                                        }}
                                                        onMouseEnter={() => setHoveredTool({ label: 'FORMA', description: 'Cambia el estilo de recorte de las fotograf\u00edas' })}
                                                        onMouseLeave={() => setHoveredTool(null)}
                                                        className={`flex flex-col items-center justify-center gap-1 p-1 min-w-[60px] rounded-2xl transition-all active:scale-95 border ${
                                                            showShapeSelector
                                                                ? 'bg-accent text-white shadow-glow-indigo border-white/20'
                                                                : isDark
                                                                    ? 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                                                                    : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <Shapes size={14} />
                                                        <span className="text-[7px] font-black uppercase tracking-tighter text-center leading-none">FORMA</span>
                                                    </button>
                                                );
                                            }
                                            if (tool.isSizeSelector) {
                                                return (
                                                    <button
                                                        key="tamaño-selector"
                                                        onClick={() => { 
                                                            setShowSizeSelector(v => !v); 
                                                            setShowShapeSelector(false);
                                                            setActiveDesignParam(null); 
                                                        }}
                                                        onMouseEnter={() => setHoveredTool({ label: 'TAMAÑO', description: 'Cambia las dimensiones físicas del lienzo de la orla' })}
                                                        onMouseLeave={() => setHoveredTool(null)}
                                                        className={`flex flex-col items-center justify-center gap-1 p-1 min-w-[60px] rounded-2xl transition-all active:scale-95 border ${
                                                            showSizeSelector
                                                                ? 'bg-accent text-white shadow-glow-indigo border-white/20'
                                                                : isDark
                                                                    ? 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                                                                    : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <tool.icon size={14} />
                                                        <span className="text-[7px] font-black uppercase tracking-tighter text-center leading-none">TAMAÑO</span>
                                                    </button>
                                                );
                                            }
                                            return (
                                                <button
                                                    key={tool.label}
                                                    onClick={() => {
                                                        if (tool.onClick) {
                                                            tool.onClick();
                                                        } else if (tool.isImmediate) {
                                                            updateConfig(tool.key, 0);
                                                            setActiveDesignParam(null);
                                                        } else if (tool.isToggle) {
                                                            if (tool.key === 'showGuides') {
                                                                setShowGuides(v => !v);
                                                            } else {
                                                                updateConfig(tool.key, !configOrla[tool.key]);
                                                            }
                                                            setShowShapeSelector(false);
                                                        } else {
                                                            setShowShapeSelector(false);
                                                            setShowSizeSelector(false);
                                                            setActiveDesignParam(tool);
                                                        }
                                                    }}
                                                    onMouseEnter={() => setHoveredTool({ label: tool.label, description: tool.description || `Ajustar el parámetro ${tool.label.toLowerCase()}` })}
                                                    onMouseLeave={() => setHoveredTool(null)}
                                                    className={`flex flex-col items-center justify-center gap-1 p-1 min-w-[60px] rounded-2xl transition-all active:scale-95 border ${
                                                        (tool.onClick && tool.key !== 'studentRowBalance')
                                                            ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent hover:text-white'
                                                            // Toggles: Iluminar con Accent cuando est\u00e1n ACTIVOS
                                                            : (
                                                                (tool.key === 'showMarginGuide' && configOrla.showMarginGuide) || 
                                                                (tool.isToggle && tool.key === 'showGuides' && showGuides) || 
                                                                (tool.key === 'studentRowBalance' && configOrla.studentRowBalance === 'top') ||
                                                                (tool.isToggle && tool.key !== 'showGuides' && tool.key !== 'showMarginGuide' && tool.key !== 'studentRowBalance' && configOrla[tool.key])
                                                              )
                                                                ? 'bg-accent text-white shadow-glow-indigo border-accent/20'
                                                                : activeDesignParam?.key === tool.key
                                                                    ? 'bg-accent text-white shadow-glow-indigo border-white/20'
                                                                    : isDark
                                                                        ? 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                                                                        : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <tool.icon size={14} />
                                                    <span className="text-[7px] font-black uppercase tracking-tighter text-center leading-none">
                                                        {tool.label}
                                                    </span>
                                                </button>
                                            );
                                        })
                                })()}
                            </div>

                            <div className="flex-none flex items-center gap-2 px-2 min-h-[44px]">
                                
                                {hoveredTool && (
                                    <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                        <span className={`text-[8px] font-black tracking-widest uppercase ${isDark ? 'text-accent' : 'text-accent'}`}>{hoveredTool.label}</span>
                                        <span className={`text-[10px] font-bold uppercase truncate max-w-[200px] lg:max-w-[400px] ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{hoveredTool.description}</span>
                                    </div>
                                )}
                            </div>


                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={loadLayoutConfig}
                                    className={`px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl shadow-sm border border-slate-200 active:scale-95 flex flex-col items-center gap-1 transition-all`}
                                    title="Recuperar Diseño"
                                >
                                    <History size={18} />
                                    <span className="text-[8px] font-black uppercase tracking-wider">CARGAR</span>
                                </button>
                                <button
                                    onClick={saveLayoutConfig}
                                    className={`px-4 py-3 bg-indigo-600 outline-none text-white rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 flex flex-col items-center gap-1 transition-all`}
                                    title="Guardar Diseño"
                                >
                                    <Save size={18} />
                                    <span className="text-[8px] font-black uppercase tracking-wider">GUARDAR</span>
                                </button>
                                <button
                                    onClick={handleFinalizeClick}
                                    className={`px-5 py-3 ${isBlocked ? 'bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 flex flex-col items-center gap-1 transition-all`}
                                >
                                    <LayoutGrid size={18} />
                                    {isBlocked && <Shield size={16} className="text-amber-500" />}
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
                            
                            if (!isFullScreenDesign && !activeDesignParam && !hasWarnings && !showShapeSelector && !showSizeSelector) return null;

                            return (
                                <div className={`px-8 py-5 border-t animate-slide-up min-h-[85px] flex items-center ${isDark ? 'bg-accent border-white/30 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]' : 'bg-slate-50 border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}>
                                    
                                    {showShapeSelector ? (
                                        <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide py-1">
                                            {PHOTO_SHAPES.map(shape => (
                                                <ShapePill
                                                    key={shape.id}
                                                    shape={shape}
                                                    active={currentShape === shape.id}
                                                    onClick={() => {
                                                        setConfirmModal({
                                                            show: true,
                                                            title: 'CAMBIAR FORMA',
                                                            message: `¿Deseas aplicar la forma "${shape.label}" a todas las fotos de la orla?`,
                                                            onConfirm: () => {
                                                                updateConfig('photoShape', shape.id);
                                                            }
                                                        });
                                                    }}
                                                    isDark={isDark}
                                                />
                                            ))}
                                        </div>
                                    ) : showSizeSelector ? (
                                        <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                                            {CANVAS_SIZES.map(size => {
                                                const isActive = size.custom 
                                                    ? !CANVAS_SIZES.some(s => !s.custom && Math.round(safePxToMm(configOrla.canvasW)) === s.w && Math.round(safePxToMm(configOrla.canvasH)) === s.h)
                                                    : Math.round(safePxToMm(configOrla.canvasW)) === size.w && Math.round(safePxToMm(configOrla.canvasH)) === size.h;
                                                
                                                return (
                                                    <button
                                                        key={size.id}
                                                        onClick={() => {
                                                            if (!size.custom) {
                                                                scaleEverythingProportionally(safeMmToPx(size.w), safeMmToPx(size.h));
                                                            } else {
                                                                setActiveDesignParam(TOOLBAR_CONFIG['GENERAL'].tools.find(t => t.key === 'canvasW'));
                                                                setShowSizeSelector(false);
                                                            }
                                                        }}
                                                        className={`px-6 py-3 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all active:scale-95 ${
                                                            isActive
                                                                ? 'bg-accent border-accent text-white shadow-glow-indigo'
                                                                : isDark
                                                                    ? 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {size.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : activeDesignParam ? (
                                        <div className="flex-1 flex items-center gap-8">
                                            <div className="flex-shrink-0 min-w-[120px] relative">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] block leading-none ${isDark ? 'text-white/70' : 'text-slate-400'}`}>{activeDesignParam.label}</span>
                                                    {activeDesignParam.isToggle && (
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                                            (activeDesignParam.key === 'showGuides' ? showGuides : configOrla[activeDesignParam.key]) 
                                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' 
                                                                : 'bg-slate-500/20 border-slate-500/50 text-slate-500'
                                                        }`}>
                                                            {(activeDesignParam.key === 'showGuides' ? showGuides : configOrla[activeDesignParam.key]) ? 'ACTIVADO' : 'DESACTIVADO'}
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
                                                        if (activeDesignParam.unit === 'PT') return (val ?? 0);
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
                                                        onClick={() => {
                                                            if (activeDesignParam.key === 'showGuides') {
                                                                setShowGuides(!showGuides);
                                                            } else {
                                                                updateConfig(activeDesignParam.key, !configOrla[activeDesignParam.key]);
                                                            }
                                                        }}
                                                        className={`flex-1 h-12 rounded-2xl border-2 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                                            (activeDesignParam.key === 'showGuides' ? showGuides : configOrla[activeDesignParam.key])
                                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-glow-emerald'
                                                                : 'bg-transparent border-slate-500/30 text-slate-500'
                                                        }`}
                                                    >
                                                        {activeDesignParam.icon && <activeDesignParam.icon size={20} />}
                                                        {(activeDesignParam.key === 'showGuides' ? showGuides : configOrla[activeDesignParam.key]) 
                                                            ? `OCULTAR ${activeDesignParam.label}` 
                                                            : `MOSTRAR ${activeDesignParam.label}`}
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
                                                        {/* Toggle de visibilidad integrado (ahora a la izquierda) */}
                                                        {activeDesignParam.toggleKey && (
                                                            <button
                                                                onClick={() => updateConfig(activeDesignParam.toggleKey, !configOrla[activeDesignParam.toggleKey])}
                                                                className={`w-12 h-10 mr-2 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
                                                                    configOrla[activeDesignParam.toggleKey]
                                                                        ? 'bg-red-500 border-red-500 text-white shadow-glow-red'
                                                                        : 'bg-emerald-500 border-emerald-500 text-white shadow-glow-emerald'
                                                                }`}
                                                                title={configOrla[activeDesignParam.toggleKey] ? 'Mostrar' : 'Ocultar'}
                                                            >
                                                                {configOrla[activeDesignParam.toggleKey] ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </button>
                                                        )}
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
                                                                value={configOrla[activeDesignParam.key] !== undefined ? configOrla[activeDesignParam.key] : (activeDesignParam.key === 'aCols' ? 8 : activeDesignParam.key.startsWith('fontSize') ? 50 : activeDesignParam.key === 'dScale' ? 1.2 : activeDesignParam.key === 'aScale' ? 1 : 0)}
                                                                onChange={(e) => updateConfig(activeDesignParam.key, activeDesignParam.key === 'aCols' ? parseInt(e.target.value, 10) : parseFloat(e.target.value))}
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
                                                onClick={() => {
                                                    setActiveDesignParam(null);
                                                    setShowShapeSelector(false);
                                                    setShowSizeSelector(false);
                                                }}
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isDark ? 'bg-white text-accent' : 'bg-accent text-white'}`}
                                            >
                                                <Check size={28} className="stroke-[4]" />
                                            </button>

                                            <div className="ml-auto flex items-center gap-3">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>LIENZO</span>
                                                    <span className={`text-sm font-black uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-accent'}`}>
                                                        {getFormatLabel(configOrla.canvasW || 4961, configOrla.canvasH || 3508)}
                                                    </span>
                                                </div>
                                                <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
                                            </div>
                                        </div>
                                    ) : (
                                        // Siempre mostrar el formato si el sub-dock está "vacío"
                                        <div className="flex-1 flex items-center justify-end gap-3">
                                             <div className="flex flex-col items-end">
                                                <span className={`text-[7px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>LIENZO</span>
                                                <span className={`text-sm font-black uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-accent'}`}>
                                                    {getFormatLabel(configOrla.canvasW || 4961, configOrla.canvasH || 3508)}
                                                </span>
                                            </div>
                                            <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Premium */}
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ${confirmModal.show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div 
                    className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-500 ${confirmModal.show ? 'bg-slate-900/60 opacity-100' : 'bg-slate-900/0 opacity-0'}`} 
                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} 
                />
                <div className={`relative w-full max-w-[340px] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 transform ${confirmModal.show ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-12 opacity-0'} ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-black/5'}`}>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse-slow ${isDark ? 'bg-accent/20 text-accent ring-8 ring-accent/5' : 'bg-accent/10 text-accent ring-8 ring-accent/5'}`}>
                            <Wand2 size={38} className="drop-shadow-glow" />
                        </div>
                        <h3 className={`text-xl font-black uppercase tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{confirmModal.title}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wide leading-relaxed px-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{confirmModal.message}</p>
                    </div>
                    <div className={`flex p-3 gap-2 items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        <button 
                            onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                            className={`flex-1 py-4 px-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] transition-all active:scale-95 ${isDark ? 'bg-white/5 text-white/30 hover:bg-white/10' : 'bg-white/40 text-slate-400 hover:bg-white/60'}`}
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={() => {
                                if (confirmModal.onConfirm) confirmModal.onConfirm();
                                setConfirmModal(prev => ({ ...prev, show: false }));
                            }}
                            className="flex-1 py-4 px-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] bg-accent text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95 transition-all"
                        >
                            ACEPTAR
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL BLOQUEO PAGO STARTER */}
            {showPaymentBlockedModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
                    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-scale-in text-left">
                        <div className="relative p-10 flex flex-col items-center text-center">
                            {/* Botón cerrar */}
                            <button onClick={() => setShowPaymentBlockedModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all"><X size={20} /></button>

                            <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center border-2 border-amber-100 mb-8 shadow-xl shadow-amber-500/10">
                                <Wallet size={48} className="text-amber-500" />
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/50 border border-amber-200 rounded-full">
                                    <Shield size={12} className="text-amber-600" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Acción Requerida</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                    Liquidación Pendiente
                                </h2>
                                <p className="text-slate-500 font-bold text-sm leading-relaxed px-4">
                                    {isFlex ? (
                                        <>Para acceder al paso final y generar los scripts en el <span className="text-indigo-600">Plan Flex</span>, es necesario solicitar el pago de los alumnos trabajados.</>
                                    ) : (
                                        <>Para generar los scripts finales en el <span className="text-emerald-600">Plan Starter</span>, es necesario regularizar el pago de la campaña.</>
                                    )}
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                <button
                                    onClick={handleRequestPayment}
                                    disabled={requestingPayment}
                                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {requestingPayment ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando Solicitud...
                                        </span>
                                    ) : (
                                        <>Solicitar Liquidación <ArrowRight size={18} /></>
                                    )}
                                </button>
                                
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 text-left">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                        <Info size={16} className="text-indigo-500" />
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                        Una vez solicitado, verificaremos tu cuenta y habilitaremos la descarga en menos de 24h.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignPanel;
