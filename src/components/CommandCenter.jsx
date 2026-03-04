import React, { useState } from 'react';
import { Camera, Layers, Zap, Copy, Download, ArrowLeft, CheckCircle2, Binary, X, FileCode, Star, Package, Tag, Users, UserCheck, Globe, GraduationCap, Sun, Moon } from 'lucide-react';
import { PACKS, EXTRAS } from '../constants.js';

const CommandCenter = ({ graduates = [], staff = [], design = {}, groupName = "ORLA-GENERICA", course = "", group = "", onBack, theme, onToggleTheme }) => {
    const [copiedStep1, setCopiedStep1] = useState(false);
    const [scriptModal, setScriptModal] = useState(null);
    const [activeFilter, setActiveFilter] = useState({ type: 'role', id: 'ALL' });

    // Construcción del nombre de la carpeta: ORLA + CENTRO + CURSO + GRUPO
    const folderName = `ORLA ${groupName} ${course} ${group}`.trim().toUpperCase();

    // Lógica de filtrado combinada y ordenada
    const filteredGraduates = graduates.filter(g => {
        const { type, id } = activeFilter;
        if (type === 'role') {
            if (id === 'ALL' || id === 'STUDENTS') return true;
            return false;
        }
        if (type === 'pack') {
            const gPackId = typeof g.pack === 'object' ? g.pack.id : g.pack;
            return gPackId === id;
        }
        if (type === 'extra') {
            return g.extras && (g.extras[id] > 0 || Object.values(g.extras).some(e => e.id === id));
        }
        return false;
    }).sort((a, b) => (a.studentName || '').localeCompare(b.studentName || '', 'es', { sensitivity: 'base' }));

    const filteredStaff = (activeFilter.type === 'role' && (activeFilter.id === 'ALL' || activeFilter.id === 'STAFF'))
        ? staff.sort((a, b) => a.name.localeCompare(b.name))
        : [];

    const graduateIds = filteredGraduates.map(g => g.photoFile || g.id).filter(Boolean);
    const staffIds = filteredStaff.map(s => s.photoFile || s.id).filter(Boolean);
    const allIds = [...new Set([...graduateIds, ...staffIds])];
    const lrString = allIds.join(',');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedStep1(true);
        setTimeout(() => setCopiedStep1(false), 2000);
    };

    const downloadScript = (type) => {
        const cleanCenter = groupName.replace(/ORLA/gi, '').trim();
        const folderName = `ORLA ${cleanCenter} ${course} ${group}`.trim().toUpperCase();
        const timestamp = new Date().getTime();
        const filename = `${cleanCenter}_${type}_${timestamp}.jsx`.replace(/\s+/g, '_').toUpperCase();
        let content = '';

        if (type === 'CONSTRUCTOR') {
            const staffLines = Array.isArray(staff) && staff.length > 0 ? (() => {
                const docW = (design.aW * design.dScale);
                const dGap = design.dGapX || 150;
                const totalStaffWidth = (staff.length * docW) + ((staff.length - 1) * dGap);
                const startX = (design.canvasW / 2) - (totalStaffWidth / 2);

                return staff.map((s, i) => {
                    const x = startX + i * (docW + dGap);
                    const nameParts = (s.name || s.studentName || 'DOCENTE').trim().split(/\s+/);
                    const firstName = nameParts[0] || '';
                    const surnames = nameParts.slice(1).join(' ');
                    const role = s.role || '';
                    let psText = firstName;
                    if (surnames) psText += "\\r" + surnames;
                    if (role) psText += "\\r" + role;
                    const containerId = s.photoFile || s.id;
                    return `createItem(docentesGroup, "${psText}", "${containerId}", ${x}, ${design.dY}, ${docW}, ${design.aH * design.dScale}, ${design.fontSizeDoc}, true);`;
                }).join('\n');
            })() : '// Sin docentes';


            const aluLines = Array.isArray(graduates) ? (() => {
                return graduates
                    .filter(o => o.schoolId === graduates[0]?.schoolId)
                    .sort((a, b) => {
                        const partsA = a.studentName.trim().split(/\s+/);
                        const partsB = b.studentName.trim().split(/\s+/);
                        const surA = partsA[1] || partsA[0] || '';
                        const surB = partsB[1] || partsB[0] || '';
                        return surA.localeCompare(surB, 'es', { sensitivity: 'base' });
                    })
                    .map((g, i) => {
                        const col = i % design.aCols;
                        const row = Math.floor(i / design.aCols);
                        const dynamicW = design.aW * (design.aScale || 1.0);
                        const dynamicH = design.aH * (design.aScale || 1.0);

                        // Posición absoluta basada en margin (aStartX) y gaps
                        const x = design.aStartX + (col * (dynamicW + design.aGapX));
                        const y = design.aStartY + (row * (dynamicH + design.aGapY));

                        const nameParts = g.studentName.trim().split(/\s+/);
                        const firstName = nameParts[0] || '';
                        const surnames = nameParts.slice(1).join(' ');
                        let psText = firstName;
                        if (surnames) psText += "\\r" + surnames;
                        const containerId = g.photoFile || g.id;

                        return `createItem(alumnosGroup, "${psText}", "${containerId}", ${x}, ${y}, ${dynamicW}, ${dynamicH}, ${design.fontSizeAlu}, false);`;
                    }).join('\n');
            })() : '';

            content = [
                '/* FINALIZAR ORLA V2.9 - CONSTRUCTOR PSD */',
                'app.preferences.rulerUnits = Units.PIXELS;',
                'app.preferences.typeUnits = TypeUnits.POINTS;',
                `var doc = app.documents.add(${design.canvasW}, ${design.canvasH}, 300, "${groupName}", NewDocumentMode.RGB);`,
                '',
                '// Función: crea item dentro del grupo padre dado',
                'function createItem(parentGroup, name, id, x, y, w, h, fontSize, isStaff) {',
                '    var group = parentGroup.layerSets.add();',
                '    group.name = id;',
                '',
                '    // 1. Crear el placeholder primero para que quede debajo',
                '    doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);',
                '    var fillLayer = group.artLayers.add();',
                '    fillLayer.name = "PLACEHOLDER";',
                '    var fillColor = new SolidColor();',
                '    fillColor.rgb.hexValue = "F0F0F0";',
                '    doc.selection.fill(fillColor);',
                '    doc.selection.deselect();',
                '',
                '    // 2. Crear el texto después para que quede encima',
                '    var textLayer = group.artLayers.add();',
                '    textLayer.kind = LayerKind.TEXT;',
                '    var textItem = textLayer.textItem;',
                '    textItem.contents = name.toUpperCase();',
                '',
                '    // Ajuste de tamaño para fidelidad absoluta (El navegador renderiza más grande)',
                '    var fSize = (fontSize || 10) * 1.65;',
                '    textItem.size = new UnitValue(fSize, "pt");',
                '    textItem.leading = new UnitValue(fSize * 1.3, "pt");',
                '    textItem.antiAliasMethod = AntiAlias.STRONG;',
                '',
                '    var psFont = "MyriadPro-Regular";',
                `    var reactFont = "${design.fontFamily}";`,
                '    // Forced for testing Myriad Pro',
                '    try { textItem.font = psFont; } catch(e) {',
                '        try { textItem.font = "Myriad Pro"; } catch(e2) { textItem.font = "ArialMT"; }',
                '    }',
                '',
                '    textItem.justification = Justification.CENTER;',
                '',
                '    var textColor = new SolidColor();',
                '    textColor.rgb.hexValue = "000000";',
                '    textItem.color = textColor;',
                '',
                '    // Posición del texto (centro del ancho, debajo del alto + offset)',
                '    var textY = y + h + (isStaff ? fontSize * 1.2 : fontSize * 1.5);',
                '    textItem.position = [x + w/2, textY];',
                '}',
                '',
                '// CREAR GRUPOS PRINCIPALES',
                'var docentesGroup = doc.layerSets.add(); docentesGroup.name = "DOCENTES";',
                'var alumnosGroup = doc.layerSets.add(); alumnosGroup.name = "ALUMNOS";',
                '',
                staffLines,
                '',
                aluLines,
                '',
                '// PIE DE ORLA',
                'var footerGroup = doc.layerSets.add();',
                'footerGroup.name = "PIE DE ORLA";',
                'var schoolLayer = footerGroup.artLayers.add();',
                'schoolLayer.kind = LayerKind.TEXT;',
                'var schoolText = schoolLayer.textItem;',
                `schoolText.contents = "${groupName.toUpperCase()}";`,
                'schoolText.size = 36;',
                `schoolText.font = "${design.fontFamily}";`,
                'schoolText.justification = Justification.CENTER;',
                `schoolText.position = [${design.canvasW / 2}, ${design.canvasH - design.margin - 40}];`,
                '',
                'var promoLayer = footerGroup.artLayers.add();',
                'promoLayer.kind = LayerKind.TEXT;',
                'var promoText = promoLayer.textItem;',
                'promoText.contents = "PROMOCIÓN 2026";',
                'promoText.size = 20;',
                `promoText.font = "${design.fontFamily}";`,
                'promoText.justification = Justification.CENTER;',
                `promoText.position = [${design.canvasW / 2}, ${design.canvasH - design.margin}];`,
                '',
                '// CONFIGURACIÓN FINAL DE GUÍAS EN MM Y REGLAS',
                'app.preferences.rulerUnits = Units.MM;',
                'app.preferences.typeUnits = TypeUnits.POINTS;',
                `doc.guides.add(Direction.VERTICAL,   ${(design.canvasW / (design.dpi || 300) * 25.4 / 2).toFixed(2)}); // Centro V`,
                `doc.guides.add(Direction.HORIZONTAL, ${(design.canvasH / (design.dpi || 300) * 25.4 / 2).toFixed(2)}); // Centro H`,
                `doc.guides.add(Direction.VERTICAL,   ${(design.margin / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.VERTICAL,   ${((design.canvasW - design.margin) / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${(design.margin / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${((design.canvasH - design.margin) / (design.dpi || 300) * 25.4).toFixed(2)});`,
                'alert("Estructura V3.0 Generada.\\rby PUJALTE CREATIVE STUDIO");',
            ].join('\n');


        } else if (type === 'RASTER') {
            const idsList = allIds.join('","'); // Use allIds for raster injection
            content = [
                '/* INYECCIÓN RÁPIDA V2.0 - Pujalte Studio */',
                'var fileIds = ["' + idsList + '"];',
                'function main() {',
                '    var doc = app.activeDocument;',
                '    var alumnosGroup = doc.layerSets.getByName("ALUMNOS");',
                '    var count = 0;',
                '    for(var i=0; i<fileIds.length; i++) {',
                '        var targetId = fileIds[i];',
                '        var layerGroup;',
                '        try { layerGroup = alumnosGroup.layerSets.getByName(targetId); } catch(e) { continue; }',
                '        ',
                '        var placeholder;',
                '        try { placeholder = layerGroup.artLayers.getByName("PLACEHOLDER"); } catch(e) { continue; }',
                '        ',
                '        var file = File.openDialog("Selecciona FOTO para: " + targetId);',
                '        if(file) {',
                '            try {',
                '                var isStaff = id.indexOf("staff_") !== -1;',
                '                var placeholder = targetGroup.artLayers.getByName("PLACEHOLDER");',
                '                ',
                '                // Tomamos dimensiones y POSICIÓN del placeholder ANTES de abrir la foto',
                '                app.activeDocument = doc;',
                '                doc.activeLayer = placeholder;',
                '                var pBounds = placeholder.bounds;',
                '                var targetW = pBounds[2] - pBounds[0];',
                '                var targetH = pBounds[3] - pBounds[1];',
                '                ',
                '                app.open(file);',
                '                var photoDoc = app.activeDocument;',
                '                photoDoc.resizeImage(targetW, targetH, (design.dpi || 300), ResampleMethod.BICUBICSHARPER);',
                '                photoDoc.selection.selectAll();',
                '                photoDoc.selection.copy();',
                '                photoDoc.close(SaveOptions.DONOTSAVECHANGES);',
                '                ',
                '                app.activeDocument = doc;',
                '                doc.activeLayer = placeholder;',
                '                var pastedLayer = doc.paste();',
                '                pastedLayer.name = "FOTO_FINAL";',
                '                ',
                '                // ALINEACIÓN EXACTA',
                '                var deltaX = pBounds[0] - pastedLayer.bounds[0];',
                '                var deltaY = pBounds[1] - pastedLayer.bounds[1];',
                '                pastedLayer.translate(deltaX, deltaY);',
                '                ',
                '                pastedLayer.move(placeholder, ElementPlacement.PLACEBEFORE);',
                '                ',
                '                // CREAR MÁSCARA DE RECORTE (Clipping Mask)',
                '                pastedLayer.grouped = true;',
                '                placeholder.visible = true;',
                '                count++;',
                '            } catch(e) { }',
                '        }',
                '    }',
                '    alert("Proceso finalizado.\\rby PUJALTE CREATIVE STUDIO\\r\\rFotos inyectadas: " + count);',
                '}',
            ].join('\n');
        }

        // Intentar usar el diálogo de guardado nativo del servidor (macOS Only + Local Dev)
        // Esto permite que el usuario elija cualquier carpeta y nosotros sepamos cuál es para el botón "Mostrar en carpeta"
        fetch('/graduaciones2026/api/save-as', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, filename })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Si el servidor pudo abrir el diálogo y guardar, tenemos la ruta real completa
                    setScriptModal({ content, filename: data.filename, copied: false, saved: true, savedPath: data.path });
                } else if (data.cancelled) {
                    // El usuario canceló el diálogo, no hacemos nada
                    return;
                } else {
                    // Si falló el endpoint nativo (ej. en producción), ir al fallback tradicional del navegador
                    fallbackDownload(content, filename, folderName);
                }
            })
            .catch(() => {
                // Si el endpoint no existe o falla, ir al fallback tradicional
                fallbackDownload(content, filename, folderName);
            });
    };

    const fallbackDownload = (content, filename, folderName) => {
        // Opción 1: POST al endpoint Vite → escribe el .jsx directamente en ~/Downloads (si existe la API de backup)
        fetch('/graduaciones2026/api/download-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, filename, folderName })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setScriptModal({ content, filename, copied: false, saved: true, savedPath: data.path });
                } else {
                    // Opción 2: Fallback navegador estándar (descarga a carpeta Downloads por defecto de Chrome/Safari)
                    const blob = new Blob([content], { type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                    setScriptModal({ content, filename, copied: false, saved: true, savedPath: 'Carpeta de Descargas' });
                }
            })
            .catch(() => {
                // Opción 3: Copia al portapapeles si todo lo anterior falla (entorno web puro sin APIs de servidor)
                navigator.clipboard.writeText(content).catch(() => { });
                setScriptModal({ content, filename, copied: true, saved: false });
            });
    };

    return (
        <>
            <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f8f9fa] text-slate-900'} p-4 md:p-8 animate-fade-in relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-600/10 rounded-full blur-[80px] md:blur-[120px] -z-1" />

                <div className="max-w-5xl mx-auto space-y-6 md:space-y-12 relative z-10">
                    <div className={`flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} pb-6 md:pb-8`}>
                        <div className="space-y-4 md:space-y-2 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button onClick={onBack} className={`p-2 ${theme === 'dark' ? 'hover:bg-white/5 text-white/40' : 'hover:bg-black/5 text-slate-400'} rounded-xl transition-colors hover:text-violet-500`}>
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h1 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2 md:gap-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        <span className="text-violet-500">Finalizar</span> Orla
                                    </h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] md:text-[10px] bg-violet-500/20 text-violet-400 px-3 py-1.5 md:py-1 rounded-full border border-violet-500/30 tracking-widest font-black uppercase inline-block">V2.6 READY</span>
                                    <button
                                        onClick={onToggleTheme}
                                        className={`p-2 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/50' : 'bg-black/5 border-black/5 text-slate-500'} hover:scale-110 rounded-xl border transition-all hover:text-violet-500`}
                                    >
                                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                                    </button>
                                </div>
                            </div>
                            <p className={`${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] md:pl-12 flex items-center gap-2`}>
                                <Binary size={12} className="text-violet-500" /> Puente de Producción Directa
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* 01. PUENTE LIGHTROOM - ANCHO COMPLETO */}
                        <div className={`group ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-6 md:p-8 space-y-6 hover:border-violet-500/30 transition-all duration-500`}>
                            <div className={`flex items-center gap-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} pb-4`}>
                                <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400">
                                    <Camera size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className={`text-lg md:text-xl font-black italic uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>01. Puente Lightroom</h3>
                                    <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-[10px] uppercase font-black tracking-[0.3em]`}>Filtros Inteligentes y Control de Pedidos</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* IZQUIERDA: CONTROLES Y COPIADO */}
                                <div className="space-y-6">
                                    <button onClick={() => copyToClipboard(lrString)} className={`w-full flex items-center justify-between p-5 ${theme === 'dark' ? 'bg-violet-600/10 border-violet-500/20' : 'bg-violet-50 border-violet-200'} rounded-2xl border group/btn transition-all hover:bg-violet-600 hover:text-white shadow-xl shadow-violet-900/10 ${theme === 'dark' ? 'text-white' : 'text-violet-900'}`}>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[11px] font-black uppercase tracking-widest">Copiar IDs de Fotos ({allIds.length})</span>
                                            <span className="text-[8px] opacity-60 uppercase font-black tracking-tighter italic">Filtro Activo: {activeFilter.id}</span>
                                        </div>
                                        {copiedStep1 ? <CheckCircle2 size={20} /> : <Copy size={20} className="opacity-40 group-hover/btn:opacity-100" />}
                                    </button>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} tracking-[0.3em] flex items-center gap-2`}><Users size={12} /> Roles Disponibles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: 'ALL', label: 'Todo' },
                                                    { id: 'STUDENTS', label: 'Alumnos' },
                                                    { id: 'STAFF', label: 'Docentes' }
                                                ].map(f => (
                                                    <button key={f.id} onClick={() => setActiveFilter({ type: 'role', id: f.id })}
                                                        className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'role' && activeFilter.id === f.id ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-violet-600/10`}`}>
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} tracking-[0.3em] flex items-center gap-2`}><Package size={12} /> Packs Contratados</p>
                                            <div className="flex flex-wrap gap-2">
                                                {PACKS.map(p => (
                                                    <button key={p.id} onClick={() => setActiveFilter({ type: 'pack', id: p.id })}
                                                        className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'pack' && activeFilter.id === p.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-blue-600/10`}`}>
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} tracking-[0.3em] flex items-center gap-2`}><Tag size={12} /> Extras y Complementos</p>
                                            <div className="flex flex-wrap gap-2">
                                                {EXTRAS.map(e => (
                                                    <button key={e.id} onClick={() => setActiveFilter({ type: 'extra', id: e.id })}
                                                        className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'extra' && activeFilter.id === e.id ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-amber-600/10`}`}>
                                                        {e.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DERECHA: TABLA LISTADO */}
                                <div className={`${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-[24px] border flex flex-col h-[350px] md:h-full min-h-[400px]`}>
                                    <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} flex justify-between text-[8px] font-black uppercase ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} tracking-[0.3em] ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                                        <span>Detalle del Protagonista</span>
                                        <span>Referencia Foto</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                        {filteredStaff.map(s => (
                                            <div key={s.id} className={`flex items-center justify-between py-3 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} px-2 hover:bg-white/[0.03] transition-colors rounded-xl mx-1`}>
                                                <div className="flex flex-col">
                                                    <span className={`text-[11px] font-black uppercase italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.name}</span>
                                                    <span className={`text-[8px] opacity-70 uppercase font-black text-violet-500 tracking-widest`}>{s.role}</span>
                                                </div>
                                                <span className="text-[11px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">{s.photoFile || 'S/F'}</span>
                                            </div>
                                        ))}
                                        {filteredGraduates.length > 0 ? filteredGraduates.map(g => (
                                            <div key={g.id} className={`flex items-center justify-between py-3 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} px-2 hover:bg-white/[0.03] transition-colors rounded-xl mx-1`}>
                                                <div className="flex flex-col">
                                                    <span className={`text-[11px] font-black uppercase italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{g.studentName}</span>
                                                    <span className={`text-[8px] uppercase font-black tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                                                        {activeFilter.type === 'extra' ?
                                                            (EXTRAS.find(ex => ex.id === activeFilter.id)?.name || 'Extra') :
                                                            (typeof g.pack === 'object' ? (g.pack.name || g.pack.label) : (PACKS.find(p => p.id === g.pack)?.name || g.pack || 'No Pack'))
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[11px] font-mono font-black text-violet-400 bg-violet-400/10 px-2 py-1 rounded-lg">{g.photoFile || 'S/F'}</span>
                                                    {activeFilter.type !== 'extra' && g.extras && Object.keys(g.extras).length > 0 &&
                                                        <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                            +{Object.keys(g.extras).length} EXTRAS
                                                        </span>
                                                    }
                                                </div>
                                            </div>
                                        )) : activeFilter.id !== 'STAFF' && activeFilter.id !== 'ALL' && (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                                <Search size={32} className="mb-2" />
                                                <p className="text-[9px] font-black uppercase tracking-widest">Sin resultados</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FILA INFERIOR: 02 Y 03 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 02. CONSTRUCTOR PSD */}
                            <div className={`group ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-6 space-y-4 hover:border-blue-500/30 transition-all duration-500 flex flex-col`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <Layers size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className={`text-base font-black italic uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>02. Constructor PSD</h3>
                                        <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-[9px] uppercase font-bold tracking-widest`}>Generación de Lienzo Maestro</p>
                                    </div>
                                </div>

                                <div className={`${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'} rounded-2xl border p-5 grid grid-cols-2 gap-4 flex-1`}>
                                    <div className="space-y-1">
                                        <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-blue-900/40'} tracking-widest`}>Resolución</p>
                                        <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{design.dpi || 300} DPI</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-blue-900/40'} tracking-widest`}>Lienzo (W×H)</p>
                                        <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{design.canvasW}×{design.canvasH}px</p>
                                        <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">({(design.canvasW * 25.4 / (design.dpi || 300) / 10).toFixed(1)} × {(design.canvasH * 25.4 / (design.dpi || 300) / 10).toFixed(1)} cm)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-blue-900/40'} tracking-widest`}>Margen Global</p>
                                        <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{(design.margin * 25.4 / (design.dpi || 300) / 10).toFixed(1)} cm</p>
                                        <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">({design.margin} px)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-[8px] uppercase font-black tracking-widest ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Ready to PSD</p>
                                        <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Myriad Pro</p>
                                    </div>
                                </div>

                                <button onClick={() => downloadScript('CONSTRUCTOR')} className="w-full flex items-center justify-between p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30 group/btn transition-all hover:bg-blue-600 text-white shadow-lg">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Descargar Script Estructura</span>
                                    <Download size={18} />
                                </button>
                            </div>

                            {/* 03. INYECCIÓN RÁPIDA */}
                            <div className={`group ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-6 space-y-4 hover:border-amber-500/30 transition-all duration-500 flex flex-col`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                                        <Zap size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className={`text-base font-black italic uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>03. Inyección Rápida</h3>
                                        <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-[9px] uppercase font-bold tracking-widest`}>Motor de Vuelcado Masivo</p>
                                    </div>
                                </div>

                                <div className={`${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-100'} rounded-2xl border p-5 grid grid-cols-2 gap-4 flex-1`}>
                                    <div className="space-y-1">
                                        <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-amber-900/40'} tracking-widest`}>Alumnos</p>
                                        <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>{graduates.length}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-amber-900/40'} tracking-widest`}>Docentes</p>
                                        <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>{staff.length}</p>
                                    </div>
                                    <div className={`col-span-2 pt-2 border-t ${theme === 'dark' ? 'border-amber-500/10' : 'border-amber-200'} flex items-center justify-between`}>
                                        <span className={`text-[8px] ${theme === 'dark' ? 'text-white/30' : 'text-amber-900/40'} font-black uppercase tracking-widest`}>Estado</span>
                                        <span className={`text-[8px] font-black uppercase text-green-500 animate-pulse tracking-widest`}>Firestore Sincronizado</span>
                                    </div>
                                </div>

                                <button onClick={() => downloadScript('RASTER')} className="w-full flex items-center justify-between p-4 bg-amber-600/20 rounded-2xl border border-amber-500/30 group/btn transition-all hover:bg-amber-600 text-white shadow-lg">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Bajar Motor de Vuelco</span>
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-white border-slate-200 shadow-sm'} border rounded-[30px] md:rounded-[40px] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8`}>
                        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                            <div className="space-y-1 text-left flex-1 md:flex-none">
                                <p className={`text-[8px] md:text-[9px] font-black ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-[0.2em]`}>Grupo Activo</p>
                                <p className="text-xs md:text-sm font-black uppercase text-violet-500 truncate max-w-[150px] md:max-w-[200px]">{groupName}</p>
                            </div>
                            <div className={`w-px h-10 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
                            <div className="space-y-1 text-left flex-1 md:flex-none">
                                <p className={`text-[8px] md:text-[9px] font-black ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-[0.2em]`}>Carga de Datos</p>
                                <p className={`text-xs md:text-sm font-black uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {(Array.isArray(graduates) ? graduates.length : 0) + (Array.isArray(staff) ? staff.length : 0)} Protagonistas
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto px-6 py-3 bg-green-500/10 rounded-2xl border border-green-500/20 flex justify-center">
                            <p className="text-[9px] md:text-[10px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <CheckCircle2 size={12} /> Status: Firestore Ready
                            </p>
                        </div>
                    </div>

                    <p className={`text-[8px] md:text-[10px] font-black ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-[0.3em] md:tracking-[0.5em] text-center px-4`}>
                        Pujalte Creative Studio &copy; 2026 — High Speed Production Flow
                    </p>
                </div>
            </div>

            {/* MODAL: Fallback portapapeles (solo si el endpoint falla) */}
            {scriptModal && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setScriptModal(null)}>
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <FileCode size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm uppercase tracking-wider">Script Generado</p>
                                    <p className="text-white/40 text-[10px] font-mono truncate max-w-[300px]">{scriptModal.filename}</p>
                                </div>
                            </div>
                            <button onClick={() => setScriptModal(null)} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {scriptModal.saved ? (
                                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                                    <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-400 text-xs font-black uppercase tracking-wider">✅ Archivo guardado correctamente</p>
                                        <p className="text-green-300/60 text-[10px] font-mono mt-1 italic opacity-80 break-all">{scriptModal.savedPath.includes('/') || scriptModal.savedPath.includes('\\') ? scriptModal.savedPath : `Ubicación seleccionada / ${scriptModal.filename}`}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                                    <p className="text-green-400 text-xs font-black uppercase tracking-wider">Script copiado al portapapeles</p>
                                </div>
                            )}
                            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                                <p className="text-white/60 text-[11px] font-black uppercase tracking-widest">Cómo ejecutarlo:</p>
                                <ol className="space-y-3">
                                    {[
                                        'Localiza el archivo en la ubicación seleccionada',
                                        `Archivo: "${scriptModal.filename}"`,
                                        'Haz clic derecho → Abrir con → Otra app...',
                                        'Selecciona Adobe Photoshop y marca "Usar siempre esta aplicación" → Abrir',
                                    ].map((txt, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-violet-500/30 rounded-lg flex items-center justify-center text-violet-400 text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                                            <span className="text-white/70 text-xs leading-relaxed">{txt}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div className="flex flex-col gap-3">
                                {scriptModal.saved && (
                                    <button
                                        onClick={() => fetch('/graduaciones2026/api/reveal-file', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ path: scriptModal.savedPath })
                                        })}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                                    >
                                        📁 MOSTRAR EN CARPETA
                                    </button>
                                )}
                                <button onClick={() => setScriptModal(null)}
                                    className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10">
                                    CERRAR VENTANA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommandCenter;
