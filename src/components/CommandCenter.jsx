import React, { useState } from 'react';
import { Camera, Layers, Zap, Copy, Download, ArrowLeft, CheckCircle2, Binary, X, FileCode } from 'lucide-react';

const CommandCenter = ({ graduates = [], staff = [], design = {}, groupName = "ORLA-GENERICA", course = "", group = "", onBack }) => {
    const [copiedStep1, setCopiedStep1] = useState(false);
    const [scriptModal, setScriptModal] = useState(null);

    // Construcción del nombre de la carpeta: ORLA + CENTRO + CURSO + GRUPO
    const folderName = `ORLA ${groupName} ${course} ${group}`.trim().toUpperCase();

    // Combinamos alumnos + profesores (solo los que tienen photoFile asignado)
    const graduateIds = Array.isArray(graduates)
        ? graduates.map(g => g.photoFile || g.id || g.studentName?.split(' ')[0]).filter(Boolean)
        : [];
    const staffIds = Array.isArray(staff)
        ? staff.map(s => s.photoFile || s.id).filter(Boolean)
        : [];
    // Unión sin duplicados
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
                const dGap = 150; // Match perfectly with React gap-[15px] (150px at real scale)
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
                const colWidth = (design.canvasW - (design.margin * 2)) / design.aCols;

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

                        // Centrado dentro de la columna del grid
                        const x = design.margin + (col * colWidth) + (colWidth / 2) - (design.aW / 2);
                        const y = design.aStartY + (row * (design.aH + design.aGapY));

                        const nameParts = g.studentName.trim().split(/\s+/);
                        const firstName = nameParts[0] || '';
                        const surnames = nameParts.slice(1).join(' ');
                        let psText = firstName;
                        if (surnames) psText += "\\r" + surnames;
                        const containerId = g.photoFile || g.id;

                        return `createItem(alumnosGroup, "${psText}", "${containerId}", ${x}, ${y}, ${design.aW}, ${design.aH}, ${design.fontSizeAlu}, false);`;
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
                '    // Se calibra la línea base al 68% del tamaño de fuente real en píxeles.',
                '    var fSizePx = fSize * (300 / 72); ',
                `    var textY = y + h + (isStaff ? ${design.dTextOffset} : ${design.aTextOffset}) + (fSizePx * 0.68);`,
                '    textItem.position = [x + (w/2), textY];',
                '}',
                '',
                '// Grupo DOCENTES',
                'var docentesGroup = doc.layerSets.add();',
                'docentesGroup.name = "DOCENTES";',
                staffLines,
                '',
                '// Grupo ALUMNOS',
                'var alumnosGroup = doc.layerSets.add();',
                'alumnosGroup.name = "ALUMNOS";',
                aluLines,
                '',
                '// CONFIGURACIÓN FINAL DE GUÍAS EN MM Y REGLAS',
                'app.preferences.rulerUnits = Units.MM;',
                'app.preferences.typeUnits = TypeUnits.POINTS;',
                `doc.guides.add(Direction.VERTICAL,   ${(design.canvasW / 300 * 25.4 / 2).toFixed(2)}); // Centro V`,
                `doc.guides.add(Direction.HORIZONTAL, ${(design.canvasH / 300 * 25.4 / 2).toFixed(2)}); // Centro H`,
                `doc.guides.add(Direction.VERTICAL,   ${(design.margin / 300 * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.VERTICAL,   ${((design.canvasW - design.margin) / 300 * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${(design.margin / 300 * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${((design.canvasH - design.margin) / 300 * 25.4).toFixed(2)});`,
                'alert("Estructura V2.9 Generada.\\rby PUJALTE CREATIVE STUDIO");',
            ].join('\n');


        } else {
            content = [
                '/* FINALIZAR ORLA V2.6 - RASTER FAST INJECTION */',
                'var doc = app.activeDocument;',
                'var inputFolder = Folder.selectDialog("Selecciona carpeta con fotos (nombre = ID_ALUMNO.jpg)");',
                'if (inputFolder != null) {',
                '    var files = inputFolder.getFiles(/\.(jpg|jpeg|png|tif)$/i);',
                '    var count = 0;',
                '    ',
                '    function findGroupRecursive(parent, name) {',
                '        try { return parent.layerSets.getByName(name); } catch(e) {',
                '            for (var j = 0; j < parent.layerSets.length; j++) {',
                '                var found = findGroupRecursive(parent.layerSets[j], name);',
                '                if (found) return found;',
                '            }',
                '        }',
                '        return null;',
                '    }',
                '',
                '    for (var i = 0; i < files.length; i++) {',
                '        var file = files[i];',
                '        var id = file.name.split(".")[0];',
                '        var targetGroup = findGroupRecursive(doc, id);',
                '        ',
                '        if (targetGroup) {',
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
                '                photoDoc.resizeImage(targetW, targetH, 300, ResampleMethod.BICUBICSHARPER);',
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

        // POST al endpoint Vite → escribe el .jsx directamente en ~/Downloads
        fetch('/graduaciones2026/api/download-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, filename, folderName })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Muestra modal de éxito con la ruta
                    setScriptModal({ content, filename, copied: false, saved: true, savedPath: data.path });
                } else {
                    // Fallback: copia al portapapeles
                    navigator.clipboard.writeText(content).catch(() => { });
                    setScriptModal({ content, filename, copied: true, saved: false });
                }
            })
            .catch(() => {
                // Sin endpoint (producción): copia al portapapeles
                navigator.clipboard.writeText(content).catch(() => { });
                setScriptModal({ content, filename, copied: true, saved: false });
            });
    };

    return (
        <>
            <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-600/10 rounded-full blur-[80px] md:blur-[120px] -z-1" />

                <div className="max-w-5xl mx-auto space-y-6 md:space-y-12 relative z-10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 md:pb-8">
                        <div className="space-y-4 md:space-y-2 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2 md:gap-4">
                                        <span className="text-violet-500">Finalizar</span> Orla
                                    </h1>
                                </div>
                                <div className="md:block">
                                    <span className="text-[9px] md:text-[10px] bg-violet-500/20 text-violet-400 px-3 py-1.5 md:py-1 rounded-full border border-violet-500/30 tracking-widest font-black uppercase inline-block">V2.6 READY</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] md:pl-12 flex items-center gap-2">
                                <Binary size={12} className="text-violet-500" /> Puente de Producción Directa
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {/* PASO 01 */}
                        <div className="group bg-white/[0.03] border border-white/10 rounded-[28px] md:rounded-[32px] p-6 md:p-8 space-y-4 md:space-y-6 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                <Camera size={24} className="md:size-[28px]" />
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <h3 className="text-base md:text-lg font-black italic uppercase tracking-wider text-left">01. Puente Lightroom</h3>
                                <p className="text-white/40 text-[11px] md:text-xs leading-relaxed text-left">Filtra la biblioteca para exportar JPEGs de un solo clic.</p>
                            </div>
                            <button onClick={() => copyToClipboard(lrString)} className="w-full flex items-center justify-between p-3.5 md:p-4 bg-white/5 rounded-2xl border border-white/10 group/btn transition-all hover:bg-violet-500 hover:text-white">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Copiar IDs ({allIds.length}) — {graduateIds.length} alu + {staffIds.length} doc</span>
                                {copiedStep1 ? <CheckCircle2 size={16} /> : <Copy size={16} className="opacity-40 group-hover/btn:opacity-100" />}
                            </button>
                        </div>

                        {/* PASO 02 */}
                        <div className="group bg-white/[0.03] border border-white/10 rounded-[28px] md:rounded-[32px] p-6 md:p-8 space-y-4 md:space-y-6 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Layers size={24} className="md:size-[28px]" />
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <h3 className="text-base md:text-lg font-black italic uppercase tracking-wider text-left">02. Constructor PSD</h3>
                                <p className="text-white/40 text-[11px] md:text-xs leading-relaxed text-left">Genera el lienzo, carpetas y tipografía en Photoshop.</p>
                            </div>
                            <button onClick={() => downloadScript('CONSTRUCTOR')} className="w-full flex items-center justify-between p-3.5 md:p-4 bg-white/5 rounded-2xl border border-white/10 group/btn transition-all hover:bg-blue-500 hover:text-white">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Bajar Script Estructura</span>
                                <Download size={16} className="opacity-40 group-hover/btn:opacity-100" />
                            </button>
                        </div>

                        {/* PASO 03 */}
                        <div className="group bg-white/[0.03] border border-white/10 rounded-[28px] md:rounded-[32px] p-6 md:p-8 space-y-4 md:space-y-6 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                <Zap size={24} className="md:size-[28px]" />
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <h3 className="text-base md:text-lg font-black italic uppercase tracking-wider text-left">03. Inyección Rápida</h3>
                                <p className="text-white/40 text-[11px] md:text-xs leading-relaxed text-left">Vuelca fotos finales con rasterización pre-pego optimizada.</p>
                            </div>
                            <button onClick={() => downloadScript('RASTER')} className="w-full flex items-center justify-between p-3.5 md:p-4 bg-white/5 rounded-2xl border border-white/10 group/btn transition-all hover:bg-amber-500 hover:text-white">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Bajar Motor Raster</span>
                                <Download size={16} className="opacity-40 group-hover/btn:opacity-100" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-[30px] md:rounded-[40px] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                            <div className="space-y-1 text-left flex-1 md:flex-none">
                                <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Grupo Activo</p>
                                <p className="text-xs md:text-sm font-black uppercase text-violet-400 truncate max-w-[150px] md:max-w-[200px]">{groupName}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="space-y-1 text-left flex-1 md:flex-none">
                                <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Carga de Datos</p>
                                <p className="text-xs md:text-sm font-black uppercase text-white">
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

                    <p className="text-[8px] md:text-[10px] font-black text-white/10 uppercase tracking-[0.3em] md:tracking-[0.5em] text-center px-4">
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
                                        <p className="text-green-400 text-xs font-black uppercase tracking-wider">✅ Archivo guardado en Descargas</p>
                                        <p className="text-green-300/60 text-[10px] font-mono mt-1">~/Downloads/{scriptModal.filename}</p>
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
                                        'Ve a la carpeta Descargas en el Finder',
                                        `Busca el archivo: "${scriptModal.filename}"`,
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
                            <div className="flex flex-col gap-2">
                                {scriptModal.saved && (
                                    <button
                                        onClick={() => fetch('/graduaciones2026/api/reveal-file', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ path: scriptModal.savedPath })
                                        })}
                                        className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10"
                                    >
                                        📁 Mostrar en carpeta
                                    </button>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={() => { navigator.clipboard.writeText(scriptModal.content); }}
                                        className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <Copy size={14} /> Copiar Script
                                    </button>
                                    <button onClick={() => setScriptModal(null)}
                                        className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommandCenter;
