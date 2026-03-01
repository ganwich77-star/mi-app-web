import React, { useState } from 'react';
import { Camera, Layers, Zap, Copy, Download, ArrowLeft, CheckCircle2, Binary, Settings2 } from 'lucide-react';

const CommandCenter = ({ graduates = [], staff = [], design = {}, groupName = "ORLA-GENERICA", onBack }) => {
    const [copiedStep1, setCopiedStep1] = useState(false);

    // PASO 01: STRING DE IDS PARA LIGHTROOM (Según informe técnico)
    // El informe dice: "Genera un String separado por comas con todos los IDs del grupo"
    const lrString = Array.isArray(graduates) ? graduates.map(g => g.id || g.studentName?.split(' ')[0]).filter(Boolean).join(',') : '';

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedStep1(true);
        setTimeout(() => setCopiedStep1(false), 2000);
    };

    // GENERADOR DE SCRIPTS EXTENDSCRIPT (.JSX) - Paso 02 y Paso 03 del informe
    const downloadScript = (type) => {
        let content = "";
        const timestamp = new Date().getTime();
        const filename = `${groupName}_${type}_${timestamp}.jsx`;

        if (type === 'CONSTRUCTOR') {
            content = `
/* COMMAND CENTER V2.6 - CONSTRUCTOR PSD */
/* Este script crea el lienzo A3@300dpi desde cero, carpetas de alumnos y placeholders */
app.preferences.rulerUnits = Units.PIXELS;
var doc = app.documents.add(${design.canvasW}, ${design.canvasH}, 300, "${groupName}", NewDocumentMode.RGB);

function createItem(name, id, x, y, w, h, fontSize, isStaff) {
    var group = doc.layerSets.add();
    group.name = id; // El informe dice: "Crea una carpeta por alumno nombrada con su ID"

    // Texto del Nombre
    var textLayer = group.artLayers.add();
    textLayer.kind = LayerKind.TEXT;
    var textItem = textLayer.textItem;
    textItem.contents = name.toUpperCase();
    textItem.size = fontSize;
    textItem.font = "${design.fontFamily}";
    textItem.justification = Justification.CENTER;
    textItem.position = [x + (w/2), y + h + (isStaff ? ${design.dTextOffset} : ${design.aTextOffset})];

    // Placeholder (Rectángulo Gris) - El informe dice: "dibuja un Placeholder de 35x45mm"
    doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
    var fillLayer = group.artLayers.add();
    fillLayer.name = "PLACEHOLDER";
    var color = new SolidColor();
    color.rgb.red = 240; color.rgb.green = 240; color.rgb.blue = 240;
    doc.selection.fill(color);
    doc.selection.deselect();
}

// Renderizar Staff
${Array.isArray(staff) ? staff.map((s, i) => {
                const space = (design.canvasW - (design.margin * 2)) / Math.max(staff.length, 1);
                const x = design.margin + (i * space) + (space / 2) - ((design.aW * design.dScale) / 2);
                // Para staff usamos 'staff_' + id para identificarlo en el paso 03
                return `createItem("${s.studentName}", "staff_${s.id}", ${x}, ${design.dY}, ${design.aW * design.dScale}, ${design.aH * design.dScale}, ${design.fontSizeDoc}, true);`;
            }).join('\n') : ''}

// Renderizar Alumnos
${Array.isArray(graduates) ? graduates.map((g, i) => {
                const col = i % design.aCols;
                const row = Math.floor(i / design.aCols);
                const x = design.margin + (col * (design.aW + (design.aGapX || 10)));
                const y = design.aStartY + (row * (design.aH + design.aGapY));
                return `createItem("${g.studentName}", "${g.id}", ${x}, ${y}, ${design.aW}, ${design.aH}, ${design.fontSizeAlu}, false);`;
            }).join('\n') : ''}
            `;
        } else {
            content = `
/* COMMAND CENTER V2.6 - RASTER FAST INJECTION */
/* Este script vuelca las fotos finales sobre la estructura del Paso 02 con Rasterización Pre-Pego */
var doc = app.activeDocument;
var inputFolder = Folder.selectDialog("Selecciona la carpeta con las fotos (Los nombres deben ser ID_ALUMNO.jpg)");

if (inputFolder != null) {
    var files = inputFolder.getFiles(/\.(jpg|jpeg|png|tif)$/i);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var id = file.name.split('.')[0];
        
        try {
            var targetGroup = doc.layerSets.getByName(id);
            app.open(file);
            var photoDoc = app.activeDocument;
            
            // Rasterización Pre-Pego: Calculamos escalas
            var isStaff = id.indexOf('staff_') !== -1;
            var targetW = isStaff ? ${design.aW * design.dScale} : ${design.aW};
            var targetH = isStaff ? ${design.aH * design.dScale} : ${design.aH};
            
            // Escalamos a 300dpi y tamaño exacto antes de copiar píxeles
            photoDoc.resizeImage(targetW, targetH, 300, ResampleMethod.BICUBICSHARPER);
            photoDoc.selection.selectAll();
            photoDoc.selection.copy();
            photoDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            doc.activeLayer = targetGroup.artLayers.getByName("PLACEHOLDER");
            doc.paste();
            doc.activeLayer.name = "FOTO_FINAL";
        } catch(e) {
            // Saltamos si el ID en el disco no tiene carpeta en el PSD
        }
    }
}
            `;
        }

        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-1" />

            <div className="max-w-5xl mx-auto space-y-12 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                                <span className="text-violet-500">Command</span> Center
                                <span className="text-[10px] bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full border border-violet-500/30 tracking-widest not-italic">V2.6 READY</span>
                            </h1>
                        </div>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] pl-12 flex items-center gap-2">
                            <Binary size={12} className="text-violet-500" /> Puente de Producción Directa (Antigravity Ready)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* PASO 01 */}
                    <div className="group bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500">
                        <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                            <Camera size={28} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black italic uppercase tracking-wider text-left">01. Puente Lightroom</h3>
                            <p className="text-white/40 text-xs leading-relaxed text-left">Filtra la biblioteca para exportar JPEGs de un solo clic.</p>
                        </div>
                        <button onClick={() => copyToClipboard(lrString)} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group/btn transition-all hover:bg-violet-500 hover:text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">Copiar IDs ({Array.isArray(graduates) ? graduates.length : 0})</span>
                            {copiedStep1 ? <CheckCircle2 size={16} /> : <Copy size={16} className="opacity-40 group-hover/btn:opacity-100" />}
                        </button>
                    </div>

                    {/* PASO 02 */}
                    <div className="group bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <Layers size={28} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black italic uppercase tracking-wider text-left">02. Constructor PSD</h3>
                            <p className="text-white/40 text-xs leading-relaxed text-left">Genera el lienzo, carpetas y tipografía en Photoshop.</p>
                        </div>
                        <button onClick={() => downloadScript('CONSTRUCTOR')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group/btn transition-all hover:bg-blue-500 hover:text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">Bajar Script Estructura</span>
                            <Download size={16} className="opacity-40 group-hover/btn:opacity-100" />
                        </button>
                    </div>

                    {/* PASO 03 */}
                    <div className="group bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                            <Zap size={28} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black italic uppercase tracking-wider text-left">03. Inyección Rápida</h3>
                            <p className="text-white/40 text-xs leading-relaxed text-left">Vuelca fotos finales con rasterización pre-pego optimizada.</p>
                        </div>
                        <button onClick={() => downloadScript('RASTER')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group/btn transition-all hover:bg-amber-500 hover:text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">Bajar Motor Raster</span>
                            <Download size={16} className="opacity-40 group-hover/btn:opacity-100" />
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-10 flex flex-wrap items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="space-y-1 text-left">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Grupo Activo</p>
                            <p className="text-sm font-black uppercase text-violet-400 truncate max-w-[200px]">{groupName}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="space-y-1 text-left">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Carga de Datos</p>
                            <p className="text-sm font-black uppercase text-white">{(Array.isArray(graduates) ? graduates.length : 0) + (Array.isArray(staff) ? staff.length : 0)} Protagonistas</p>
                        </div>
                    </div>
                    <div className="px-6 py-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <CheckCircle2 size={12} /> Status: Optimized for Firestore
                        </p>
                    </div>
                </div>

                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] text-center">Pujalte Creative Studio &copy; 2026 — High Speed Production Flow</p>
            </div>
        </div>
    );
};

export default CommandCenter;
