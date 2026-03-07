import React, { useState } from 'react';
import {
    LayoutGrid, Maximize, MoveHorizontal, ArrowUpDown, MoveVertical,
    Baseline, ChevronsUpDown, AlignCenterHorizontal, UserSquare2,
    Box, Download, History, Search, Check, X, Maximize2, Minimize2,
    ChevronLeft, ChevronRight, Layers, Type, Trash2, Edit, ZoomIn, ZoomOut, Eye, Settings2, UserCheck,
    Type as TypeIcon, Ruler, Users, Grid, Square, List, AlignCenterVertical, MousePointer2
} from 'lucide-react';
import { getCourseBase, getGroup } from '../../utils/formatters.js';

const DesignPanel = ({
    isFullScreenDesign,
    setIsFullScreenDesign,
    theme,
    configOrla,
    setConfigOrla,
    updateConfig,
    activeDesignParam,
    setActiveDesignParam,
    canvasZoom,
    setCanvasZoom,
    panOffset,
    setPanOffset,
    mmToPx,
    pxToMm,
    schools,
    adminSchool,
    orders,
    allPacks,
    settings,
    previewMode = 'full',
    designFilter,
    setDesignFilter,
    staff,
    selectedStaffIds,
    setSelectedStaffIds,
    setAdminSchool,
    setView,
    isDraggingCanvasRef,
    canvasContainerRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel
}) => {
    const [showZoomBar, setShowZoomBar] = useState(false);
    const [activeToolGroup, setActiveToolGroup] = useState(null);

    const isDark = theme === 'dark';
    const barBg = isDark ? 'bg-black/95 border-white/10' : 'bg-white/98 border-black/8';
    const textMuted = isDark ? 'text-white/30' : 'text-black/40';
    const textLabel = isDark ? 'text-white/40' : 'text-black/50';
    const dividerColor = isDark ? 'border-white/5' : 'border-black/5';

    const TOOLS = [
        // ALUMNOS
        { icon: LayoutGrid, label: 'Columnas', key: 'aCols', min: 1, max: 15, step: 1, unit: 'UD', group: 'Alumnos' },
        { icon: Maximize, label: 'Escala Fotos', key: 'aScale', min: 0.2, max: 3.0, step: 0.05, unit: 'x', group: 'Alumnos' },
        { icon: MoveVertical, label: 'Inicio (Y)', key: 'aStartY', min: mmToPx(0), max: mmToPx(300), group: 'Alumnos' },
        { icon: ArrowUpDown, label: 'Separación (Y)', key: 'aGapY', min: mmToPx(0), max: mmToPx(150), group: 'Alumnos' },
        { icon: TypeIcon, label: 'Tamaño Texto', key: 'fontSizeAlu', min: 4, max: 24, step: 0.5, unit: 'PT', group: 'Alumnos' },

        // DOCENTES
        { icon: UserSquare2, label: 'Escala Docentes', key: 'dScale', min: 0.2, max: 3.0, step: 0.05, unit: 'x', group: 'Docentes' },
        { icon: MoveVertical, label: 'Altura (Y)', key: 'dY', min: mmToPx(0), max: mmToPx(200), group: 'Docentes' },
        { icon: TypeIcon, label: 'Tamaño Texto', key: 'fontSizeDoc', min: 4, max: 24, step: 0.5, unit: 'PT', group: 'Docentes' },
        { icon: Users, label: 'Gestionar Equipo', action: () => setActiveToolGroup('DocentesList'), group: 'Docentes' },

        // GENERAL / ESTRUCTURA
        { icon: Ruler, label: 'Margen Global', key: 'margin', min: mmToPx(0), max: mmToPx(100), group: 'General' },
        { icon: Grid, label: 'Ancho Canvas', key: 'canvasW', min: 1000, max: 8000, group: 'General', unit: 'PX' },
        { icon: Grid, label: 'Alto Canvas', key: 'canvasH', min: 1000, max: 8000, group: 'General', unit: 'PX' },
        { icon: MousePointer2, label: 'Reset Vista', action: () => { setCanvasZoom(1); setPanOffset({ x: 0, y: 0 }); }, group: 'General' }
    ];

    const TOOL_GROUPS = [
        { id: 'Alumnos', label: 'Alumnos', icon: LayoutGrid },
        { id: 'Docentes', label: 'Docentes', icon: UserSquare2 },
        { id: 'General', label: 'Lienzo', icon: Ruler }
    ];

    return (
        <div className={`animate-fade-in max-w-7xl mx-auto ${isFullScreenDesign ? 'fixed inset-0 z-[600] bg-card p-0 flex flex-col overflow-hidden' : 'space-y-6 pb-20'}`}>
            <div className={`flex-1 flex flex-col relative ${isFullScreenDesign ? 'h-full overflow-hidden' : ''}`}>
                {/* ═══ SNAPSEED BOTTOM BAR ═══ */}
                {isFullScreenDesign && (
                    <div
                        className={`fixed bottom-0 left-0 right-0 z-[700] backdrop-blur-xl border-t select-none ${barBg}`}
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                    >
                        {/* SLIDER AREA */}
                        {activeDesignParam && activeDesignParam.key && (
                            <div className="px-5 pt-4 pb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${textLabel}`}>{activeDesignParam.label}</span>
                                    <span className="text-[13px] font-black text-violet-400 tabular-nums">
                                        {
                                            activeDesignParam.key.includes('Scale') || activeDesignParam.unit === 'UD' || activeDesignParam.key.includes('fontSize') || activeDesignParam.key.includes('Cols')
                                                ? (activeDesignParam.key.includes('Scale') ? (configOrla[activeDesignParam.key] || 1).toFixed(2) : Math.round(configOrla[activeDesignParam.key] || 0))
                                                : Math.round(pxToMm(configOrla[activeDesignParam.key] || 0))
                                        }
                                        <span className="text-[9px] text-violet-300 ml-0.5">{activeDesignParam.unit || 'MM'}</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={activeDesignParam.min}
                                    max={activeDesignParam.max}
                                    step={activeDesignParam.step || 1}
                                    value={configOrla[activeDesignParam.key] || activeDesignParam.min}
                                    onChange={(e) => updateConfig(activeDesignParam.key, parseFloat(e.target.value))}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-violet-500/20"
                                    style={{ accentColor: '#7c3aed' }}
                                />
                            </div>
                        )}

                        <div className="flex items-center w-full max-w-7xl mx-auto">
                            <button
                                onClick={() => {
                                    try { localStorage.setItem('configOrla_backup', JSON.stringify(configOrla)); } catch (e) { }
                                    const btn = document.getElementById('btn-guardar-orla-snapseed');
                                    if (btn) { btn.classList.add('text-green-400'); setTimeout(() => btn.classList.remove('text-green-400'), 1500); }
                                }}
                                id="btn-guardar-orla-snapseed"
                                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 active:scale-90 transition-all border-r ${textMuted} ${dividerColor}`}
                            >
                                <Check size={18} />
                                <span className="text-[7px] font-black uppercase tracking-widest">Guardar</span>
                            </button>

                            <div className="flex-1 flex items-center overflow-hidden">
                                {activeToolGroup !== 'DocentesList' && (
                                    <div className="flex items-center ml-2 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                const nextState = !showZoomBar;
                                                setShowZoomBar(nextState);
                                                if (nextState) {
                                                    setActiveToolGroup(null);
                                                    setActiveDesignParam(null);
                                                }
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all active:scale-90 z-10 ${showZoomBar ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : isDark ? 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10' : 'bg-black/5 text-black/50 border border-black/5 hover:bg-black/10'}`}
                                        >
                                            <Search size={20} />
                                            <span className="text-[7px] font-black uppercase tracking-tighter">{Math.round(canvasZoom * 100)}%</span>
                                        </button>

                                        <div className={`flex items-center gap-4 transition-all duration-500 ease-out overflow-hidden h-14 ${showZoomBar ? 'max-w-[300px] opacity-100 ml-3 px-4 bg-violet-500/5 rounded-2xl border border-violet-500/10' : 'max-w-0 opacity-0 ml-0 pointer-events-none'}`}>
                                            <button onClick={() => { setCanvasZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="text-[8px] font-black uppercase text-violet-500 flex-shrink-0">RESET</button>
                                            <input type="range" min="10" max="300" value={Math.round(canvasZoom * 100)} onChange={e => setCanvasZoom(parseInt(e.target.value) / 100)} className="w-32 h-1.5 bg-violet-500/20 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                                        </div>
                                    </div>
                                )}

                                <div className="h-14 flex-1 flex items-center overflow-x-auto scrollbar-hide px-3 scroll-smooth">
                                    <div className="flex items-center gap-1.5 min-w-max">
                                        {activeToolGroup === 'DocentesList' ? (
                                            <div className="flex items-center gap-3 animate-slide-up px-2">
                                                <button onClick={() => setActiveToolGroup('Docentes')} className={`flex items-center justify-center w-8 h-8 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}><ChevronLeft size={16} /></button>
                                                <div className="flex items-center gap-2 max-w-[500px] overflow-x-auto scrollbar-hide">
                                                    {staff.map(member => (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => {
                                                                const newSelected = selectedStaffIds.includes(member.id)
                                                                    ? selectedStaffIds.filter(id => id !== member.id)
                                                                    : [...selectedStaffIds, member.id];
                                                                setSelectedStaffIds(newSelected);
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[9px] font-black uppercase truncate max-w-[150px] ${selectedStaffIds.includes(member.id) ? 'bg-violet-500 border-violet-500 text-white' : isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-black/5 border-black/10 text-black/50'}`}
                                                        >
                                                            {member.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : activeToolGroup ? (
                                            <div className="flex items-center gap-1.5 animate-slide-right">
                                                <button onClick={() => { setActiveToolGroup(null); setActiveDesignParam(null); }} className={`flex items-center justify-center w-10 h-10 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}><ChevronLeft size={16} /></button>
                                                <div className={`h-8 w-[1px] ${dividerColor} mx-1`} />
                                                {TOOLS.filter(t => t.group === activeToolGroup).map(tool => (
                                                    <button
                                                        key={tool.key || tool.label}
                                                        onClick={() => tool.action ? tool.action() : setActiveDesignParam(tool)}
                                                        className={`flex flex-col items-center justify-center gap-0.5 px-3 h-14 min-w-[56px] transition-all relative ${activeDesignParam?.key === tool.key ? 'text-violet-500' : textMuted}`}
                                                    >
                                                        <tool.icon size={18} strokeWidth={activeDesignParam?.key === tool.key ? 2.5 : 2} />
                                                        <span className="text-[7px] font-black uppercase tracking-tight">{tool.label}</span>
                                                        {activeDesignParam?.key === tool.key && <div className="absolute bottom-1 w-1 h-1 bg-violet-500 rounded-full" />}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 animate-slide-left">
                                                {TOOL_GROUPS.map(group => (
                                                    <button
                                                        key={group.id}
                                                        onClick={() => { setActiveToolGroup(group.id); setShowZoomBar(false); }}
                                                        className={`flex flex-col items-center justify-center gap-1 px-4 h-14 min-w-[70px] hover:bg-violet-500/5 transition-all outline-none ${textMuted}`}
                                                    >
                                                        <group.icon size={20} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">{group.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsFullScreenDesign(false)}
                                className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 active:scale-90 transition-all border-l ${textMuted} ${dividerColor}`}
                            >
                                <X size={20} />
                                <span className="text-[7px] font-black uppercase tracking-widest">Cerrar</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Visualizador de Orla */}
                <div className={`flex-1 bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-white/5 relative overflow-hidden group shadow-2xl ${isFullScreenDesign ? 'm-2 rounded-2xl' : ''}`}>
                    <div className="absolute top-6 right-6 z-10 flex gap-2">
                        <button
                            onClick={() => setIsFullScreenDesign(!isFullScreenDesign)}
                            className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
                        >
                            {isFullScreenDesign ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                    </div>

                    <div
                        ref={canvasContainerRef}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        className={`relative select-none overflow-hidden touch-none h-full w-full flex items-center justify-center ${isFullScreenDesign ? 'p-4' : 'p-8'} cursor-grab active:cursor-grabbing`}
                    >
                        {/* Preview del Canvas */}
                        <div className="relative bg-white shadow-2xl rounded-sm overflow-hidden flex-shrink-0"
                            style={{
                                width: (configOrla.canvasW || 4961) / 10 + 'px',
                                height: (configOrla.canvasH || 3508) / 10 + 'px',
                                backgroundImage: `
                                    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
                                    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px',
                                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${(isFullScreenDesign ? canvasZoom * 1.5 : (canvasZoom * 0.8)) || 1})`,
                                transformOrigin: 'center center',
                                transition: isDraggingCanvasRef.current ? 'none' : 'transform 0.1s ease-out',
                            }}>

                            {/* Margen */}
                            <div className="absolute border border-red-500/30 border-dashed pointer-events-none z-50"
                                style={{
                                    inset: (configOrla.margin || 20) / 10 + 'px'
                                }} />

                            {/* Docentes */}
                            <div className="absolute top-0 w-full flex justify-center gap-[15px] z-20" style={{ top: (configOrla.dY || 0) / 10 + 'px' }}>
                                {staff.filter(m => selectedStaffIds.includes(m.id)).map((member, i) => (
                                    <div key={member.id} className="relative flex flex-col items-center">
                                        <div className="bg-slate-200 border border-slate-300 rounded-sm relative flex items-center justify-center overflow-hidden"
                                            style={{
                                                width: ((configOrla.aW || 350) * (configOrla.dScale || 1.2)) / 10 + 'px',
                                                height: ((configOrla.aH || 450) * (configOrla.dScale || 1.2)) / 10 + 'px'
                                            }}>
                                            {member.photoFile ? (
                                                <div className="w-full h-full bg-slate-400 flex items-center justify-center text-[8px] font-black text-white/50">{member.photoFile}</div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-40 text-slate-400"><UserCheck size={(configOrla.dScale || 1.2) * 12} /></div>
                                            )}
                                        </div>
                                        <div className="mt-[4px] text-center" style={{ width: ((configOrla.aW || 350) * (configOrla.dScale || 1.2)) / 10 + 'px' }}>
                                            <p className="font-black leading-none uppercase truncate text-slate-900" style={{
                                                fontFamily: configOrla.fontFamily || 'sans-serif',
                                                fontSize: ((configOrla.fontSizeDoc || 10) / 2) + 'px',
                                                fontWeight: configOrla.isBold ? '900' : 'normal',
                                                fontStyle: configOrla.isItalic ? 'italic' : 'normal'
                                            }}>{member.name}</p>
                                            <p className="text-[5px] mt-[1px] opacity-40 font-bold uppercase truncate text-slate-900">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Alumnos Grid */}
                            <div className="absolute w-full px-[20px] z-10" style={{ top: (configOrla.aStartY || 1350) / 10 + 'px', padding: `0 ${(configOrla.margin || 20) / 10}px` }}>
                                <div className="grid justify-items-center" style={{
                                    gridTemplateColumns: `repeat(${configOrla.aCols || 8}, 1fr)`,
                                    rowGap: (configOrla.aGapY || 650) / 10 + 'px'
                                }}>
                                    {orders.filter(o =>
                                        (!designFilter.course || getCourseBase(o.course) === designFilter.course) &&
                                        (!designFilter.group || getGroup(o.course) === designFilter.group)
                                    ).sort((a, b) => (a.studentName || '').localeCompare(b.studentName || '')).map((order, i) => (
                                        <div key={order.id} className="flex flex-col items-center">
                                            <div className="bg-slate-50 border border-slate-100 rounded-sm relative flex items-center justify-center overflow-hidden"
                                                style={{ width: (configOrla.aW || 350) / 10 + 'px', height: (configOrla.aH || 450) / 10 + 'px' }}>
                                                {order.photoFile ? (
                                                    <span className="text-[6px] font-mono font-bold opacity-30 text-slate-900">{order.photoFile}</span>
                                                ) : (
                                                    <span className="text-[6px] font-black opacity-[0.05] text-slate-900">{i + 1}</span>
                                                )}
                                            </div>
                                            <div className="mt-[3px] text-center" style={{ width: (configOrla.aW || 350) / 10 + 'px' }}>
                                                <p className="font-black leading-tight uppercase truncate text-slate-900" style={{
                                                    fontFamily: configOrla.fontFamily || 'sans-serif',
                                                    fontSize: ((configOrla.fontSizeAlu || 10) / 2) + 'px',
                                                    fontWeight: configOrla.isBold ? '900' : 'normal',
                                                    fontStyle: configOrla.isItalic ? 'italic' : 'normal'
                                                }}>{order.studentName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isFullScreenDesign && (
                        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-md">
                                <select
                                    value={designFilter.course}
                                    onChange={e => setDesignFilter(p => ({ ...p, course: e.target.value, group: '' }))}
                                    className="bg-transparent text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 outline-none cursor-pointer hover:text-violet-400 transition-colors"
                                >
                                    <option value="" className="bg-slate-900">— CURSO —</option>
                                    {[...new Set(orders.map(o => getCourseBase(o.course)))].filter(Boolean).sort().map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                </select>
                                <div className="w-px h-4 bg-white/10" />
                                <select
                                    value={designFilter.group}
                                    onChange={e => setDesignFilter(p => ({ ...p, group: e.target.value }))}
                                    disabled={!designFilter.course}
                                    className="bg-transparent text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 outline-none cursor-pointer disabled:opacity-30 hover:text-violet-400 transition-colors"
                                >
                                    <option value="" className="bg-slate-900">G</option>
                                    {(designFilter.course ? [...new Set(orders.filter(o => getCourseBase(o.course) === designFilter.course).map(o => getGroup(o.course)))].filter(Boolean).sort() : []).map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
                                </select>
                            </div>
                            <p className="hidden md:block text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] italic">Vista Técnica Activa • {orders.filter(o => (!designFilter.course || getCourseBase(o.course) === designFilter.course) && (!designFilter.group || getGroup(o.course) === designFilter.group)).length} Alumnos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignPanel;
