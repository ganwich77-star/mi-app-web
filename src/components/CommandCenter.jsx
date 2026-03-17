import React, { useState } from 'react';
import { Camera, Layers, Zap, Copy, Download, ArrowLeft, CheckCircle2, Binary, X, FileCode, Star, Package, Tag, Users, UserCheck, Globe, Sun, Moon, Clipboard, CheckCircle, Info, ExternalLink, FileJson, Cloud, Search } from 'lucide-react';
import { PACKS, EXTRAS } from '../constants.js';

const CommandCenter = ({ graduates = [], staff = [], design = {}, groupName = "ORLA-GENERICA", course = "", group = "", onBack, theme, onToggleTheme, settings = {} }) => {
    const [copiedStep1, setCopiedStep1] = useState(false);
    const [scriptModal, setScriptModal] = useState(null);
    const [activeFilter, setActiveFilter] = useState({ type: 'role', id: 'ALL' });

    const isHosting = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

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
            if (id === 'esencial') return true; // Lógica inteligente: el pack esencial lo llevan todos
            const gPackId = typeof g.pack === 'object' ? g.pack.id : g.pack;
            return gPackId === id;
        }
        if (type === 'supplement') {
            return g.supplements && g.supplements[id] === true;
        }
        if (type === 'extra') {
            return g.extras && (g.extras[id] > 0 || (typeof g.extras[id] === 'object' && g.extras[id].quantity > 0));
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

    // Lógica para separar nombre y apellidos (réplica de DesignPanel)
    const splitName = (fullName) => {
        if (!fullName) return { nombre: '', apellidos: '' };
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return { nombre: parts[0], apellidos: '' };
        return { 
            nombre: parts[0], 
            apellidos: parts.slice(1).join(' ') 
        };
    };

    const downloadScript = async (type) => {
        const cleanCenter = groupName.replace(/ORLA/gi, '').trim();
        const folderName = `ORLA ${cleanCenter} ${course} ${group}`.trim().toUpperCase();
        const timestamp = new Date().getTime();
        let filename = `${cleanCenter}_${type}_${timestamp}.jsx`.replace(/\s+/g, '_').toUpperCase();
        let content = '';

        if (type === 'CONSTRUCTOR') {
            const staffLines = (() => {
                const isStaff = true;
                const totalDocentes = filteredStaff.length;
                if (totalDocentes === 0) return '';
                
                const aW = design.aW || 350;
                const aH = design.aH || 450;
                const dScale = design.dScale || 1.2;
                const dynamicW = aW * dScale;
                const dynamicH = aH * dScale;
                const dGapX = design.dGapX ?? 50; // Gap horizontal
                const canvasW = design.canvasW || 4961;
                const dY = design.dY || 0;
                const dOffsetX = design.dOffsetX || 0;
                
                // Usar valores reales del auto-ajuste
                const fontSizePx = design.fontSizeDocName || (design.fontSizeDoc || 10) * 0.55 * dScale;
                const roleFontSizePx = design.fontSizeDocRole || (design.fontSizeDoc || 10) * 0.4 * dScale;
                const textOffset = design.dTextOffset || (20 * dScale);

                const maxStaffScaled = (totalDocentes * dynamicW) + ((totalDocentes - 1) * dGapX);
                const startX_scaled = (canvasW / 2) - (maxStaffScaled / 2) + dOffsetX;

                return filteredStaff.map((member, i) => {
                    const phX = startX_scaled + (i * (dynamicW + dGapX));
                    const phY = dY;
                    
                    const nameY = phY + dynamicH + textOffset;
                    // Los apellidos irán un poco más abajo del nombre
                    const surnameY = nameY + fontSizePx;
                    const roleY = surnameY + (roleFontSizePx * 1.5); 

                    const nameParts = splitName(member.name || member.studentName || 'DOCENTE');
                    const photoId = member.photo_file_number || member.photoFile || member.id;
                    const esc = (val) => JSON.stringify(String(val || ""));
                    return `    createItem(docentesGroup, ${esc(nameParts.nombre)}, ${esc(nameParts.apellidos)}, ${esc(member.role || 'DOCENTE')}, ${esc(photoId)}, ${phX.toFixed(2)}, ${phY.toFixed(2)}, ${dynamicW.toFixed(2)}, ${dynamicH.toFixed(2)}, ${nameY.toFixed(2)}, ${fontSizePx.toFixed(2)}, ${roleY.toFixed(2)}, ${roleFontSizePx.toFixed(2)}, true, ${surnameY.toFixed(2)});`;
                }).join('\n');
            })();

            const aluLines = (() => {
                const totalAlus = graduates.length;
                if (totalAlus === 0) return '';

                const aW = design.aW || 350;
                const aH = design.aH || 450;
                const aScale = design.aScale || 1.0;
                const dynamicW = aW * aScale;
                const dynamicH = aH * aScale;
                const aCols = parseInt(design.aCols) || 8;
                const aGapX = design.aGapX ?? 40;
                const aGapY = design.aGapY ?? 650;
                const canvasW = design.canvasW || 4961;
                const aStartY = design.aStartY || 1350;
                const aOffsetX = design.aOffsetX || 0;
                
                const fontSizePx = design.fontSizeAluName || (design.fontSizeAlu || 10) * 0.55 * aScale;
                const textOffset = design.aTextOffset || (15 * aScale);

                const sortedAlus = [...graduates].sort((a, b) => {
                    const nameA = a.studentName || '';
                    const nameB = b.studentName || '';
                    return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
                });

                return sortedAlus.map((g, i) => {
                    const row = Math.floor(i / aCols);
                    const totalRows = Math.ceil(totalAlus / aCols);
                    const isLastRow = row === totalRows - 1;
                    const itemsInThisRow = isLastRow ? (totalAlus % aCols || aCols) : aCols;
                    const colInRow = i % aCols;

                    const rowWidthScaled = (itemsInThisRow * dynamicW) + ((itemsInThisRow - 1) * aGapX);
                    const rowStartX = (canvasW / 2) - (rowWidthScaled / 2) + aOffsetX;

                    const itemHeightStep = dynamicH + textOffset + (fontSizePx * 2.5) + aGapY;
                    const phY = aStartY + (row * itemHeightStep);
                    const phX = rowStartX + colInRow * (dynamicW + aGapX);
                    
                    // Espacio vertical para nombre + apellidos (aprox 2 líneas)
                    const nameY = phY + dynamicH + textOffset;
                    const fontSizeSur = fontSizePx * 0.75;
                    const surnameY = nameY + fontSizePx * 1.05;

                    const nameParts = splitName(g.studentName || 'ALUMNO');
                    const containerId = g.photo_file_number || g.photoFile || g.id;
                    const esc = (val) => JSON.stringify(String(val || ""));

                    return `    createItem(alumnosGroup, ${esc(nameParts.nombre)}, ${esc(nameParts.apellidos)}, "", ${esc(containerId)}, ${phX.toFixed(2)}, ${phY.toFixed(2)}, ${dynamicW.toFixed(2)}, ${dynamicH.toFixed(2)}, ${nameY.toFixed(2)}, ${fontSizePx.toFixed(2)}, 0, 0, false, ${surnameY.toFixed(2)});`;
                }).join('\n');
            })();

            content = [
                '/* FINALIZAR ORLA V13.1 - CONSTRUCTOR PSD */',
                '// 1. CONFIGURACIÓN INICIAL DE UNIDADES (CRÍTICO)',
                'var savedRuler = app.preferences.rulerUnits;',
                'var savedType = app.preferences.typeUnits;',
                'app.preferences.rulerUnits = Units.PIXELS;',
                'app.preferences.typeUnits = TypeUnits.PIXELS;',
                '',
                `var doc = app.documents.add(${design.canvasW}, ${design.canvasH}, 300, ${JSON.stringify(groupName)}, NewDocumentMode.RGB);`,
                '',
                '// Helper para mascaras circulares en ExtendScript',
                'function selectEllipse(top, left, bottom, right) {',
                '    var idsetd = charIDToTypeID( "setd" );',
                '    var desc1 = new ActionDescriptor();',
                '    var idnull = charIDToTypeID( "null" );',
                '    var ref1 = new ActionReference();',
                '    var idChnl = charIDToTypeID( "Chnl" );',
                '    var idfsel = charIDToTypeID( "fsel" );',
                '    ref1.putProperty( idChnl, idfsel );',
                '    desc1.putReference( idnull, ref1 );',
                '    var idT = charIDToTypeID( "T   " );',
                '    var desc2 = new ActionDescriptor();',
                '    var idTop = charIDToTypeID( "Top " );',
                '    var idPxl = charIDToTypeID( "#Pxl" );',
                '    desc2.putUnitDouble( idTop, idPxl, top );',
                '    var idLeft = charIDToTypeID( "Left" );',
                '    var idBtom = charIDToTypeID( "Btom" );',
                '    var idRght = charIDToTypeID( "Rght" );',
                '    desc2.putUnitDouble( idLeft, idPxl, left );',
                '    desc2.putUnitDouble( idBtom, idPxl, bottom );',
                '    desc2.putUnitDouble( idRght, idPxl, right );',
                '    var idElps = charIDToTypeID( "Elps" );',
                '    desc1.putObject( idT, idElps, desc2 );',
                '    var idAntA = charIDToTypeID( "AntA" );',
                '    desc1.putBoolean( idAntA, true );',
                '    executeAction( idsetd, desc1, DialogModes.NO );',
                '}',
                '',
                '// Función: crea item dentro del grupo padre dado',
                `var currentShape = ${JSON.stringify(design.photoShape || 'circle')};`,
                `var defaultFont = ${JSON.stringify(design.fontFamily || "MyriadPro-Bold")};`,
                '// Factor de corrección: En documentos de 300dpi, Photoshop interpreta mal el tamaño si se da en "px".',
                '// Usaremos Puntos (pt) calculando la equivalencia exacta: 1pt = 1/72 pulgada. 1px = 1/300 pulgada.',
                '// Ratio = 72 / 300 = 0.24',
                'var PX_TO_PT = 0.24;',
                '',
                'function createItem(parentGroup, nombre, apellidos, cargo, id, phX, phY, phW, phH, nameY, nameSizePx, roleY, roleSizePx, isStaff, surnameY) {',
                '    var group = parentGroup.layerSets.add();',
                '    group.name = id;',
                '',
                '    // 1. PLACEHOLDER',
                '    var sW = Math.min(phW, phH); var sH = sW;',
                '    var sX = phX + (phW - sW) / 2; var sY = phY + (phH - sH) / 2;',
                '',
                '    if (currentShape === "circle") selectEllipse(sY, sX, sY + sH, sX + sW);',
                '    else if (currentShape === "oval") selectEllipse(phY, phX, phY + phH, phX + phW);',
                '    else if (currentShape === "shield") {',
                '        var p = [[sX+sW*0.1, sY+sH*0.04],[sX+sW*0.9, sY+sH*0.04],[sX+sW*0.9, sY+sH*0.65]];',
                '        for(var t=0.1;t<=1;t+=0.1){',
                '            var mt=1-t; var bx=mt*mt*(sX+sW*0.9)+2*mt*t*(sX+sW*0.9)+t*t*(sX+sW*0.5);',
                '            var by=mt*mt*(sY+sH*0.65)+2*mt*t*(sY+sH*0.85)+t*t*(sY+sH*0.96); p.push([bx,by]);',
                '        }',
                '        for(var t=0.1;t<=1;t+=0.1){',
                '            var mt=1-t; var bx=mt*mt*(sX+sW*0.5)+2*mt*t*(sX+sW*0.1)+t*t*(sX+sW*0.1);',
                '            var by=mt*mt*(sY+sH*0.96)+2*mt*t*(sY+sH*0.85)+t*t*(sY+sH*0.65); p.push([bx,by]);',
                '        }',
                '        doc.selection.select(p);',
                '    } else if (currentShape === "rect34r") {',
                '        var r = phW * 0.12; var p = [];',
                '        for (var a=1.5*Math.PI; a<=2*Math.PI; a+=Math.PI/10) p.push([phX+phW-r+Math.cos(a)*r, phY+r+Math.sin(a)*r]);',
                '        for (var a=0; a<=0.5*Math.PI; a+=Math.PI/10) p.push([phX+phW-r+Math.cos(a)*r, phY+phH-r+Math.sin(a)*r]);',
                '        for (var a=0.5*Math.PI; a<=Math.PI; a+=Math.PI/10) p.push([phX+r+Math.cos(a)*r, phY+phH-r+Math.sin(a)*r]);',
                '        for (var a=Math.PI; a<=1.5*Math.PI; a+=Math.PI/10) p.push([phX+r+Math.cos(a)*r, phY+r+Math.sin(a)*r]);',
                '        doc.selection.select(p);',
                '    } else doc.selection.select([[phX, phY], [phX + phW, phY], [phX + phW, phY + phH], [phX, phY + phH]]);',
                '',
                '    var fillLayer = group.artLayers.add(); fillLayer.name = "PLACEHOLDER";',
                '    var fillColor = new SolidColor(); fillColor.rgb.hexValue = "F0F0F0";',
                '    doc.selection.fill(fillColor); doc.selection.deselect();',
                '',
                '    // 2. TEXTO NOMBRE (POINT TEXT - CENTRADO ABSOLUTO)',
                '    var centerX = phX + (phW / 2);',
                '    ',
                '    var nameLayer = group.artLayers.add(); nameLayer.kind = LayerKind.TEXT;',
                '    var nameItem = nameLayer.textItem;',
                '    nameItem.kind = TextType.POINTTEXT;',
                '    nameItem.font = defaultFont;',
                '    nameItem.size = nameSizePx * PX_TO_PT;',
                '    nameItem.justification = Justification.CENTER;',
                '    nameItem.contents = nombre.toUpperCase();',
                '    nameItem.position = [centerX, nameY];',
                '',
                '    // 3. APELLIDOS (CAPA SEPARADA PARA CONTROL TOTAL)',
                '    if (apellidos && apellidos.length > 0) {',
                '        var surLayer = group.artLayers.add(); surLayer.kind = LayerKind.TEXT;',
                '        var surItem = surLayer.textItem;',
                '        surItem.kind = TextType.POINTTEXT;',
                '        surItem.font = defaultFont;',
                '        surItem.size = (isStaff ? nameSizePx : (nameSizePx * 0.75)) * PX_TO_PT;',
                '        surItem.justification = Justification.CENTER;',
                '        surItem.contents = apellidos.toUpperCase();',
                '        surItem.position = [centerX, surnameY];',
                '    }',
                '',
                '    // 4. CARGO',
                '    if (isStaff && cargo) {',
                '        var roleLayer = group.artLayers.add(); roleLayer.kind = LayerKind.TEXT;',
                '        var roleItem = roleLayer.textItem;',
                '        roleItem.kind = TextType.POINTTEXT;',
                '        roleItem.font = defaultFont;',
                '        roleItem.size = roleSizePx * PX_TO_PT;',
                '        roleItem.justification = Justification.CENTER;',
                '        roleItem.contents = cargo.toUpperCase();',
                '        roleItem.position = [centerX, roleY];',
                '    }',
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
                // PIE DE ORLA (BASADO EN POSICIONAMIENTO DEL EDITOR)
                'app.activeDocument = doc;',
                'var footerGroup = doc.layerSets.add(); footerGroup.name = "PIE DE ORLA";',
                'var centerCanvasX = doc.width / 2;',
                `var footerBaseY = ${design.canvasH} - ${(design.footerY || 180)};`,
                `var marginPx = ${design.margin || 200};`,
                'app.refresh();',
                '',
                'function autoFitFontSize(layer, maxW) {',
                '  try {',
                '    if (!layer || layer.kind !== LayerKind.TEXT) return;',
                '    app.refresh();',
                '    var contents = layer.textItem.contents;',
                '    if (!contents || contents.replace(/\\s/g, "") === "") return;',
                '',
                '    var bounds = layer.bounds;',
                '    if (!bounds || bounds.length < 4) return;',
                '    var currentW = bounds[2] - bounds[0];',
                '',
                '    if (currentW > maxW && currentW > 0) {',
                '      var ratio = maxW / currentW;',
                '      var newSize = layer.textItem.size * ratio;',
                '      layer.textItem.size = Math.max(1, newSize);',
                '      app.refresh();',
                '    }',
                '  } catch (e) {',
                '    $.writeln("AutoFit error: " + e);',
                '  }',
                '}',
                '',
                // 1. ESCUELA
                !design.hideSchool ? [
                    'app.activeDocument = doc;',
                    'var schoolLayer = footerGroup.artLayers.add(); schoolLayer.kind = LayerKind.TEXT;',
                    'var schoolText = schoolLayer.textItem;',
                    'schoolText.kind = TextType.POINTTEXT;',
                    `schoolText.contents = ${JSON.stringify((groupName || "").toUpperCase())};`,
                    `schoolText.size = (${design.fontSizeSchool || 240}) * PX_TO_PT;`,
                    'schoolText.tracking = -50;',
                    `schoolText.font = defaultFont;`,
                    'schoolText.justification = Justification.CENTER;',
                    `schoolText.position = [centerCanvasX, footerBaseY - (${design.fontSizePromo || 90}) * 1.5 - (${design.fontSizeCourse || 60}) * 1.5];`,
                    `autoFitFontSize(schoolLayer, doc.width - marginPx * 4);`
                ].join('\n') : '',
                '',
                // 2. PROMOCIÓN
                !design.hidePromo ? [
                    'app.activeDocument = doc;',
                    'var promoLayer = footerGroup.artLayers.add(); promoLayer.kind = LayerKind.TEXT;',
                    'var promoText = promoLayer.textItem;',
                    'promoText.kind = TextType.POINTTEXT;',
                    `promoText.contents = ${JSON.stringify((design.promoText || "PROMOCIÓN 2026").toUpperCase())};`,
                    `promoText.size = (${design.fontSizePromo || 90}) * PX_TO_PT;`,
                    'promoText.tracking = 500;',
                    `promoText.font = defaultFont;`,
                    'promoText.justification = Justification.CENTER;',
                    `promoText.position = [centerCanvasX, footerBaseY - (${design.fontSizeCourse || 60}) * 1.3];`,
                    `autoFitFontSize(promoLayer, doc.width - marginPx * 3);`
                ].join('\n') : '',
                '',
                // 3. CURSO
                !design.hideCourse ? [
                    'app.activeDocument = doc;',
                    'var courseLayer = footerGroup.artLayers.add(); courseLayer.kind = LayerKind.TEXT;',
                    'var courseText = courseLayer.textItem;',
                    'courseText.kind = TextType.POINTTEXT;',
                    `courseText.contents = ${JSON.stringify((design.courseText || (course + " " + group)).toUpperCase())};`,
                    `courseText.size = (${design.fontSizeCourse || 60}) * PX_TO_PT;`,
                    'courseText.tracking = 100;',
                    `courseText.font = defaultFont;`,
                    'courseText.justification = Justification.CENTER;',
                    `courseText.position = [centerCanvasX, footerBaseY];`,
                    `autoFitFontSize(courseLayer, doc.width - marginPx * 3);`
                ].join('\n') : '',
                '',
                // CONFIGURACIÓN FINAL DE GUÍAS Y RESTAURAR
                'app.preferences.rulerUnits = Units.MM;',
                `doc.guides.add(Direction.VERTICAL,   ${(design.canvasW / (design.dpi || 300) * 25.4 / 2).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${(design.canvasH / (design.dpi || 300) * 25.4 / 2).toFixed(2)});`,
                `doc.guides.add(Direction.VERTICAL,   ${(design.margin / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.VERTICAL,   ${((design.canvasW - design.margin) / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${(design.margin / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `doc.guides.add(Direction.HORIZONTAL, ${((design.canvasH - design.margin) / (design.dpi || 300) * 25.4).toFixed(2)});`,
                'app.preferences.rulerUnits = savedRuler;',
                'app.preferences.typeUnits = savedType;',
                '',
                '// CUADRO DE DIÁLOGO PERSONALIZADO (TEXTO CENTRADO)',
                'var win = new Window("dialog", "Finalización de Orla");',
                'win.orientation = "column";',
                'win.alignChildren = ["center","center"];',
                'win.spacing = 15;',
                'win.margins = 40;',
                '',
                'var title = win.add("statictext", undefined, "Orla Generada Correctamente - Script V15");',
                'title.graphics.font = ScriptUI.newFont("Helvetica", "Bold", 16);',
                '',
                'var subtitle = win.add("statictext", undefined, "by PUJALTE CREATIVE STUDIO");',
                'subtitle.graphics.font = ScriptUI.newFont("Helvetica", "Regular", 12);',
                '',
                'var btn = win.add("button", undefined, "Aceptar", {name: "ok"});',
                'btn.size = [120, 40];',
                'btn.onClick = function() { win.close(); };',
                '',
                'win.center();',
                'win.show();',
            ].join('\n');


        } else if (type === 'RASTER') {
            content = [
                '/* INYECCIÓN POR CARPETA V3.0 - Pujalte Studio */',
                'function main() {',
                '    var doc = app.activeDocument;',
                '    var folder = Folder.selectDialog("Selecciona la CARPETA con las fotos de los protagonistas");',
                '    if (!folder) return;',
                '',
                '    // Escanear carpeta buscando formatos comunes',
                '    var files = folder.getFiles(/\\.(jpg|jpeg|png|tif|tiff)$/i);',
                '    var fileMap = {};',
                '    for (var f = 0; f < files.length; f++) {',
                '        var fileName = decodeURI(files[f].name);',
                '        var baseName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;',
                '        fileMap[baseName.toLowerCase()] = files[f];',
                '    }',
                '',
                '    var groups = ["ALUMNOS", "DOCENTES"];',
                '    var count = 0;',
                '',
                '    for (var g = 0; g < groups.length; g++) {',
                '        var parentGroup;',
                '        try { parentGroup = doc.layerSets.getByName(groups[g]); } catch(e) { continue; }',
                '',
                '        // Iteramos por subgrupos (cada ID de estudiante/docente)',
                '        for (var i = 0; i < parentGroup.layerSets.length; i++) {',
                '            var layerGroup = parentGroup.layerSets[i];',
                '            var layerName = layerGroup.name;',
                '            var targetId = (layerName.substring(0, layerName.lastIndexOf(".")) || layerName).toLowerCase();',
                '            var file = fileMap[targetId];',
                '',
                '            if (!file) continue;',
                '',
                '            var placeholder;',
                '            try { placeholder = layerGroup.artLayers.getByName("PLACEHOLDER"); } catch(e) { continue; }',
                '',
                '            try {',
                '                app.activeDocument = doc;',
                '                doc.activeLayer = placeholder;',
                '                var pBounds = placeholder.bounds;',
                '                var targetW = pBounds[2] - pBounds[0];',
                '                var targetH = pBounds[3] - pBounds[1];',
                '',
                '                app.open(file);',
                '                var photoDoc = app.activeDocument;',
                '                // Redimensionar con la resolución del diseño',
                `                photoDoc.resizeImage(targetW, targetH, ${design.dpi || 300}, ResampleMethod.BICUBICSHARPER);`,
                '                photoDoc.selection.selectAll();',
                '                photoDoc.selection.copy();',
                '                photoDoc.close(SaveOptions.DONOTSAVECHANGES);',
                '',
                '                app.activeDocument = doc;',
                '                doc.activeLayer = placeholder;',
                '                var pastedLayer = doc.paste();',
                '                pastedLayer.name = "FOTO_" + targetId;',
                '',
                '                // Alineación exacta con el placeholder',
                '                var deltaX = pBounds[0] - pastedLayer.bounds[0];',
                '                var deltaY = pBounds[1] - pastedLayer.bounds[1];',
                '                pastedLayer.translate(deltaX, deltaY);',
                '',
                '                // Mover encima del placeholder y crear máscara de recorte',
                '                pastedLayer.move(placeholder, ElementPlacement.PLACEBEFORE);',
                '                pastedLayer.grouped = true;',
                '                placeholder.visible = true;',
                '                count++;',
                '            } catch(e) { }',
                '        }',
                '    }',
                '    alert("Proceso finalizado.\\rby PUJALTE CREATIVE STUDIO\\r\\rFotos inyectadas AUTOMÁTICAMENTE: " + count);',
                '}',
                'main();',
            ].join('\n');
        } else if (type === 'CLOUD') {
            filename = `03_ORLA_INYECCION_CLOUD_${timestamp}.jsx`;
            const cloudItems = [
                ...graduates.map(o => ({
                    id: (o.photo_file_number || o.id).toLowerCase(),
                    url: o.digitalPhotoUrl || o.photoFile,
                    group: "ALUMNOS",
                    name: o.studentName
                })).filter(x => x.url),
                ...staff.map(s => ({
                    id: (s.photo_file_number || s.id).toLowerCase(),
                    url: s.digitalPhotoUrl || s.photoFile,
                    group: "DOCENTES",
                    name: s.firstName || s.name
                })).filter(x => x.url)
            ];

            content = [
                '/* INYECCIÓN DIRECTA CLOUD - PUJALTE CREATIVE STUDIO */',
                '#target photoshop',
                'app.bringToFront();',
                '',
                'function main() {',
                '    if (app.documents.length === 0) { alert("Abre la orla antes de ejecutar."); return; }',
                '    var doc = app.activeDocument;',
                '    var count = 0;',
                '    ',
                '    // Creamos carpeta temporal para descargas',
                '    var tempFolder = new Folder(Folder.temp + "/orla_photos");',
                '    if (!tempFolder.exists) tempFolder.create();',
                '',
                '    var items = ' + JSON.stringify(cloudItems, null, 4) + ';',
                '',
                '    for (var i = 0; i < items.length; i++) {',
                '        var item = items[i];',
                '        var tempFile = new File(tempFolder + "/" + item.id + ".jpg");',
                '        ',
                '        // Comando curl para descargar (Mac)',
                '        var curlCmd = "curl -L -o \\"" + tempFile.fsName + "\\" \\"" + item.url + "\\"";',
                '        app.system(curlCmd);',
                '',
                '        if (!tempFile.exists) continue;',
                '',
                '        var parentGroup;',
                '        try { parentGroup = doc.layerSets.getByName(item.group); } catch(e) { continue; }',
                '',
                '        var layerGroup;',
                '        try { layerGroup = parentGroup.layerSets.getByName(item.id.toUpperCase()); } catch(e) { ',
                '            try { layerGroup = parentGroup.layerSets.getByName(item.id); } catch(e2) { continue; }',
                '        }',
                '',
                '        var placeholder;',
                '        try { placeholder = layerGroup.artLayers.getByName("PLACEHOLDER"); } catch(e) { continue; }',
                '',
                '        try {',
                '            app.activeDocument = doc;',
                '            doc.activeLayer = placeholder;',
                '            var pBounds = placeholder.bounds;',
                '            var targetW = pBounds[2] - pBounds[0];',
                '            var targetH = pBounds[3] - pBounds[1];',
                '',
                '            app.open(tempFile);',
                '            var photoDoc = app.activeDocument;',
                `            photoDoc.resizeImage(targetW, targetH, ${design.dpi || 300}, ResampleMethod.BICUBICSHARPER);`,
                '            photoDoc.selection.selectAll(); photoDoc.selection.copy();',
                '            photoDoc.close(SaveOptions.DONOTSAVECHANGES);',
                '',
                '            app.activeDocument = doc;',
                '            var pastedLayer = doc.paste();',
                '            pastedLayer.name = "FOTO_" + item.id;',
                '            var deltaX = pBounds[0] - pastedLayer.bounds[0];',
                '            var deltaY = pBounds[1] - pastedLayer.bounds[1];',
                '            pastedLayer.translate(deltaX, deltaY);',
                '            pastedLayer.move(placeholder, ElementPlacement.PLACEBEFORE);',
                '            pastedLayer.grouped = true;',
                '            count++;',
                '        } catch(e) { }',
                '    }',
                '    alert("Inyección Cloud finalizada.\\rFotos procesadas: " + count);',
                '}',
                'main();',
            ].join('\n');
        }

        // 0. Intentar File System Access API (showSaveFilePicker) para navegadores modernos
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'Adobe ExtendScript File',
                        accept: { 'text/javascript': ['.jsx'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                
                setScriptModal({ 
                    content, 
                    filename, 
                    copied: false, 
                    saved: true, 
                    savedPath: handle.name 
                });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Error con showSaveFilePicker:', err);
            }
        }

        // 1. Fallback: Diálogo del servidor (Solo Local / macOS)
        if (!isHosting) {
            try {
                const r = await fetch('/graduaciones2026/api/save-as', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, filename })
                });
                
                if (r.ok) {
                    const data = await r.json();
                    if (data.success) {
                        setScriptModal({ content, filename: data.filename, copied: false, saved: true, savedPath: data.path });
                        fetch('/graduaciones2026/api/reveal-file', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: data.path })
                        }).catch(() => { });
                        return;
                    }
                }
            } catch (e) { }
        }

        // 2. Segundo Fallback: Descarga directa vía API o Browser
        fallbackDownload(content, filename, folderName);
    };

    const fallbackDownload = (content, filename, folderName) => {
        fetch('/graduaciones2026/api/download-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, filename, folderName })
        })
            .then(r => {
                if (!r.ok) throw new Error('API download-script no disponible');
                return r.json();
            })
            .then(data => {
                if (data.success) {
                    setScriptModal({ content, filename, copied: false, saved: true, savedPath: data.path });
                } else {
                    triggerBrowserDownload(content, filename);
                }
            })
            .catch(() => {
                triggerBrowserDownload(content, filename);
            });
    };

    const triggerBrowserDownload = (content, filename) => {
        try {
            const blob = new Blob([content], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // Necesario en algunos navegadores
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setScriptModal({ content, filename, copied: false, saved: true, savedPath: 'Carpeta de Descargas' });
        } catch (error) {
            navigator.clipboard.writeText(content).catch(() => { });
            setScriptModal({ content, filename, copied: true, saved: false });
        }
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
                                            <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} tracking-[0.3em] flex items-center gap-2`}>
                                                <Users size={14} className="text-[#f06418]" /> ROLES DISPONIBLES
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: 'ALL', label: 'Todo' },
                                                    { id: 'STUDENTS', label: 'Alumnos' },
                                                    { id: 'STAFF', label: 'Docentes' }
                                                ].map(f => (
                                                    <button key={f.id} onClick={() => setActiveFilter({ type: 'role', id: f.id })}
                                                        className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'role' && activeFilter.id === f.id ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-violet-600/10`}`}>
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} tracking-[0.3em] flex items-center gap-2`}>
                                                <Package size={14} className="text-[#f06418]" /> PACKS CONTRATADOS
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {PACKS.map(p => (
                                                    <button key={p.id} onClick={() => setActiveFilter({ type: 'pack', id: p.id })}
                                                        className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'pack' && activeFilter.id === p.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-indigo-600/10`}`}>
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {settings.supplements && settings.supplements.length > 0 && (
                                            <div className="space-y-3">
                                                <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} tracking-[0.3em] flex items-center gap-2`}>
                                                    <Sparkles size={14} className="text-[#f06418]" /> SUPLEMENTOS ACTIVOS
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {settings.supplements.filter(s => s.active).map(s => (
                                                        <button key={s.id} onClick={() => setActiveFilter({ type: 'supplement', id: s.id })}
                                                            className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'supplement' && activeFilter.id === s.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-emerald-600/10`}`}>
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <p className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} tracking-[0.3em] flex items-center gap-2`}>
                                                <Tag size={14} className="text-[#f06418]" /> EXTRAS Y COMPLEMENTOS
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {EXTRAS.map(e => (
                                                    <button key={e.id} onClick={() => setActiveFilter({ type: 'extra', id: e.id })}
                                                        className={`py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter.type === 'extra' && activeFilter.id === e.id ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20' : `${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-500'} hover:bg-amber-600/10`}`}>
                                                        {e.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* DERECHA: TABLA LISTADO */}
                                <div className="relative md:h-full min-h-[400px]">
                                    <div className={`${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-[24px] border flex flex-col md:absolute md:top-0 md:left-0 md:right-0 md:bottom-0 h-full`}>
                                        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} flex justify-between text-[8px] font-black uppercase ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} tracking-[0.3em] ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} shrink-0`}>
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
                                                            activeFilter.type === 'supplement' ?
                                                                (settings.supplements?.find(s => s.id === activeFilter.id)?.name || 'Suplemento') :
                                                                (g.pack && typeof g.pack === 'object' ? (g.pack.name || g.pack.label) : (PACKS.find(p => p.id === g.pack)?.name || g.pack || 'No Pack'))
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

                                <button onClick={() => downloadScript('CONSTRUCTOR')} className="w-full flex items-center justify-between p-4 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 transition-all shadow-lg active:scale-100">
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

                                <button onClick={() => downloadScript('RASTER')} className="w-full flex items-center justify-between p-4 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30 transition-all shadow-lg active:scale-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Bajar Motor de Vuelco</span>
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        {/* BOTÓN VOLVER ATRÁS CENTRADO */}
                        <div className="flex justify-center -mt-2">
                            <button 
                                onClick={onBack}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                                    theme === 'dark' 
                                    ? 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white' 
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 hover:text-slate-600'
                                }`}
                            >
                                <ArrowLeft size={16} />
                                Volver Atrás
                            </button>
                        </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-white border-slate-200 shadow-sm'} border rounded-[30px] md:rounded-[40px] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8`}>
                        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                            <div className="space-y-1 text-left flex-1 md:flex-none">
                                <p className={`text-[8px] md:text-[9px] font-black ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-[0.2em]`}>Grupo Activo</p>
                                <p className="text-xs md:text-sm font-black uppercase text-orange-500 truncate max-w-[150px] md:max-w-[200px]">{groupName}</p>
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
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setScriptModal(null)}>
                    <div className={`${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'} border rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in`} onClick={e => e.stopPropagation()}>
                        <div className="p-8 text-center space-y-6">
                            {/* Header Icon */}
                            <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center mx-auto border shadow-lg`}>
                                <FileCode size={32} />
                            </div>

                            {/* Title & Filename */}
                            <div className="space-y-1">
                                <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-black text-lg uppercase tracking-tighter`}>Script Preparado</p>
                                <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-[8px] font-mono break-all px-4 line-clamp-2`}>{scriptModal.filename}</p>
                            </div>

                            {/* Status Message */}
                            {scriptModal.saved ? (
                                <div className={`space-y-1 py-4 px-6 ${theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} border rounded-3xl`}>
                                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />
                                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Archivo guardado con éxito</p>
                                    <p className={`${theme === 'dark' ? 'text-emerald-300/30' : 'text-emerald-700/40'} text-[8px] font-mono italic truncate`}>
                                        {isHosting ? 'Descargas del Navegador' : scriptModal.savedPath}
                                    </p>
                                </div>
                            ) : (
                                <div className={`space-y-1 py-4 ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'} border rounded-3xl`}>
                                    <CheckCircle2 size={20} className="text-blue-500 mx-auto" />
                                    <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">Copiado al portapapeles</p>
                                </div>
                            )}

                            {/* Instructions Centered */}
                            <div className="space-y-4 py-2">
                                <p className={`${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} text-[8px] font-black uppercase tracking-[0.2em]`}>Siguientes pasos:</p>
                                <div className="space-y-3">
                                    {[
                                        'Descargas / Copia el archivo',
                                        'Abrir con Photoshop 2026',
                                        '¡La orla se generará sola!'
                                    ].map((txt, i) => (
                                        <div key={i} className="flex flex-col items-center gap-0.5">
                                            <span className="text-violet-500 text-[8px] font-black uppercase tracking-widest opacity-60">Paso {i + 1}</span>
                                            <span className={`${theme === 'dark' ? 'text-white/80' : 'text-slate-700'} text-[11px] font-bold`}>{txt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-2">
                                {scriptModal.saved && !isHosting && (
                                    <button
                                        onClick={() => fetch('/graduaciones2026/api/reveal-file', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ path: scriptModal.savedPath })
                                        })}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                                    >
                                        📁 Mostrar Carpeta
                                    </button>
                                )}
                                <button onClick={() => setScriptModal(null)}
                                    className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${
                                        theme === 'dark' 
                                        ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' 
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                    }`}>
                                    Cerrar y Continuar
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
