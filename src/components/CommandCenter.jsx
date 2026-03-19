import React, { useState } from 'react';
import { Camera, Layers, Zap, Copy, Download, ArrowLeft, CheckCircle2, Binary, X, FileCode, Star, Package, Tag, Users, UserCheck, Globe, Sun, Moon, Clipboard, CheckCircle, Info, ExternalLink, FileJson, Cloud, Search, Sparkles } from 'lucide-react';
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
            const extraVal = g.extras ? g.extras[id] : null;
            return extraVal > 0 || (typeof extraVal === 'object' && extraVal !== null && extraVal.quantity > 0);
        }
        return false;
    }).sort((a, b) => (a.studentName || '').localeCompare(b.studentName || '', 'es', { sensitivity: 'base' }));

    const filteredStaff = (activeFilter.type === 'role' && (activeFilter.id === 'ALL' || activeFilter.id === 'STAFF'))
        ? [...(staff || [])].sort((a, b) => (a.name || a.firstName || '').localeCompare(b.name || b.firstName || ''))
        : [];

    const graduateIds = filteredGraduates.map(g => (g.photo_file_number || g.photoFile || g.id || '').split('.')[0]).filter(Boolean);
    const staffIds = filteredStaff.map(s => (s.photo_file_number || s.photoFile || s.id || '').split('.')[0]).filter(Boolean);
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
        try {
            const cleanCenter = groupName.replace(/ORLA/gi, '').trim();
            const folderName = `ORLA ${cleanCenter} ${course} ${group}`.trim().toUpperCase();
            // Snippet para el diálogo de éxito profesional
        const successDialogSnippet = (customMsg = "ORLA GENERADA CON \u00C9XITO!") => `
    function showSuccess(msg) {
        var win = new Window("dialog", "Pujalte Creative Studio");
        win.orientation = "column"; win.alignChildren = "center"; win.spacing = 15; win.margins = 30;
        
        // Carga de Logo desde ruta estándar
        var logoFile = new File(Folder.myDocuments + "/pujalte_studio/logo.png");
        if (logoFile.exists) { win.add("image", undefined, logoFile); }

        var t1 = win.add("statictext", undefined, msg);
        t1.graphics.font = ScriptUI.newFont("Tahoma", "BOLD", 18);
        
        win.add("statictext", undefined, "--------------------------------------------------------------");
        
        var btn = win.add("button", undefined, "BRUTAL", {name: "ok"});
        btn.size = [140, 45];
        btn.onClick = function() { win.close(); };
        win.show();
    }
    showSuccess("${customMsg}");`;
            const timestamp = new Date().getTime();
            let filename = `${cleanCenter}_${type}_${timestamp}.jsx`.replace(/\s+/g, '_').toUpperCase();
            let content = '';

            const currentStaff = staff || [];
            const currentGrads = graduates || [];

            // Helper para escapear strings para Photoshop (ExtendScript)
            const esc = (t) => t ? JSON.stringify(t) : '""';

            // Helper global para construir URLs de fotos
            const buildUrl = (item) => {
                if (!item) return "";
                if (item.digitalPhotoUrl) return item.digitalPhotoUrl;
                let src = item.photo_file_number || item.photoFile || item.photoUrl || item.photoURL || item.photo_file_url || item.foto_url || item.photo || item.foto || item.src;
                if (src && typeof src === 'object') src = src.base64 || src.url || src.photoUrl || src.photoURL || src.photo || src;
                if (!src || src === "undefined" || src === "null") return "";
                if (typeof src === 'string' || typeof src === 'number') {
                    const s = String(src).trim();
                    if (s.toLowerCase().startsWith('http') || s.toLowerCase().startsWith('data:')) return s;
                    return `https://firebasestorage.googleapis.com/v0/b/foto-pujalte.appspot.com/o/orlas2026%2F${s}?alt=media`;
                }
                return `https://firebasestorage.googleapis.com/v0/b/foto-pujalte.appspot.com/o/orlas2026%2F${src}?alt=media`;
            };

            if (type === 'CONSTRUCTOR') {
                filename = `01_ORLA_CONSTRUCTOR_V3_0_${timestamp}.jsx`;
                console.log(">>> GENERANDO CONSTRUCTOR V3.0 - " + timestamp);
                const staffLines = (() => {
                    const totalDocentes = currentStaff.length;
                    if (totalDocentes === 0) return '';
                
                const aW = design.aW || 350;
                const aH = design.aH || 450;
                const dScale = design.dScale || 1.15; // Proporción áurea respecto a alumnos
                const dynamicW = aW * dScale;
                const dynamicH = aH * dScale;
                const dGapX = design.dGapX ?? 60; 
                const canvasW = design.canvasW || 4961;
                const fontSizePx = 65; // EXACTAMENTE IGUAL QUE ALUMNOS
                const roleFontSizePx = fontSizePx * 0.55; // Cargo más discreto
                const textOffset = 47; 
                const dY = (design.margin || 200) - 20; // Ajuste fino al borde de la guía
                const dOffsetX = design.dOffsetX || 0;

                const maxStaffScaled = (totalDocentes * dynamicW) + ((totalDocentes - 1) * dGapX);
                const startX_scaled = (canvasW / 2) - (maxStaffScaled / 2) + dOffsetX;

                return currentStaff.map((member, i) => {
                    const phX = startX_scaled + (i * (dynamicW + dGapX));
                    const phY = dY;
                    const nameParts = splitName(member.firstName || member.name || member.id);
                    const photoId = String(member.photoFile || member.photo_file_number || member.id || "").toLowerCase();
                    const url = buildUrl(member);

                    const nameY = phY + dynamicH + textOffset;
                    const fSize = 65; // Fuerza 65px
                    const surnameY = nameY + (fSize * 1.15); 
                    const roleY = (nameParts.apellidos ? surnameY : nameY) + (fSize * 1.05); // Cargo debajo de apellidos
                    
                    const cfg = member.photoConfig || {};
                    const zoom = cfg.zoom || 1;
                    const offX_p = cfg.x || 0;
                    const offY_p = cfg.y || 0;

                    return `    createItem(docentesGroup, ${esc(nameParts.nombre)}, ${esc(nameParts.apellidos)}, ${esc(member.role || 'DOCENTE')}, ${esc(photoId)}, ${phX.toFixed(2)}, ${phY.toFixed(2)}, ${dynamicW.toFixed(2)}, ${dynamicH.toFixed(2)}, ${nameY.toFixed(2)}, ${fSize.toFixed(2)}, ${roleY.toFixed(2)}, ${roleFontSizePx.toFixed(2)}, true, ${surnameY.toFixed(2)}, ${esc(url)}, ${zoom}, ${offX_p}, ${offY_p});`;
                }).join('\n');
            })();

            const aluLines = (() => {
                const totalAlus = (currentGrads || []).length;
                if (totalAlus === 0) return '';
                const aW = design.aW || 350;
                const aH = design.aH || 450;
                const aScale = design.aScale || 1.0;
                const dynamicW = aW * aScale;
                const dynamicH = aH * aScale;
                const aCols = parseInt(design.aCols) || 8;
                const aGapX = design.aGapX ?? 45;
                const aGapY = design.aGapY ?? 40; 
                const canvasW = design.canvasW || 4961;
                const aStartY = (design.aStartY || 1150); // Posición exacta del editor
                const aOffsetX = design.aOffsetX || 0;
                
                const fontSizePx = 65; // Tamaño base mucho más grande (Alumnos)
                const textOffset = 47; // 4mm exactos a 300dpi
                const rowGapExtra = (design.aGapY ?? 40) * aScale;

                // IMPORTANTE: Orden exacto del editor web
                const sortedAlus = [...currentGrads].sort((a, b) => {
                    const apA = splitName(a.studentName).apellidos || '';
                    const apB = splitName(b.studentName).apellidos || '';
                    return apA.localeCompare(apB, 'es', { sensitivity: 'base' });
                });



                return sortedAlus.map((g, i) => {
                    const row = Math.floor(i / aCols);
                    const totalRows = Math.ceil(totalAlus / aCols);
                    const itemsInThisRow = (row === totalRows - 1) ? (totalAlus % aCols || aCols) : aCols;
                    const rowWidthScaled = (itemsInThisRow * dynamicW) + ((itemsInThisRow - 1) * aGapX);
                    const rowStartX = (canvasW / 2) - (rowWidthScaled / 2) + aOffsetX;

                    const phX = rowStartX + ((i % aCols) * (dynamicW + aGapX));
                    
                    // SUBIR 5mm (59px) la segunda fila
                    const rowOffset = row > 0 ? (row * (dynamicH + textOffset + (fontSizePx * 2.2) + rowGapExtra)) - 59 : (row * (dynamicH + textOffset + (fontSizePx * 2.2) + rowGapExtra));
                    const phY = aStartY + rowOffset;
                    
                    const nameY = phY + dynamicH + textOffset;
                    const surnameY = nameY + (fontSizePx * 1.15); // Espacio controlado entre nombre y apellidos

                    const nameParts = splitName(g.studentName || 'ALUMNO');
                    const photoId = String(g.photo_file_number || g.photoFile || g.id || "").toLowerCase();
                    const url = buildUrl(g);
                    const esc = (val) => JSON.stringify(String(val || ""));
                    
                    const cfg = g.photoConfig || {};
                    const zoom = cfg.zoom || 1;
                    const offX_p = cfg.x || 0;
                    const offY_p = cfg.y || 0;

                    return `    createItem(alumnosGroup, ${esc(nameParts.nombre)}, ${esc(nameParts.apellidos)}, "", ${esc(photoId)}, ${phX.toFixed(2)}, ${phY.toFixed(2)}, ${dynamicW.toFixed(2)}, ${dynamicH.toFixed(2)}, ${nameY.toFixed(2)}, ${fontSizePx.toFixed(2)}, 0, 0, false, ${surnameY.toFixed(2)}, ${esc(url)}, ${zoom}, ${offX_p}, ${offY_p});`;
                }).join('\n');
            })();

            content = [
                '/* GENERADOR DE ORLA V3.0 - PUJALTE Studio */',
                '',
                'function main() {',
                '    app.displayDialogs = DialogModes.NO;',
                '    alert("MOTOR V3.0 INICIADO");',
                '    $.writeln(">>> INICIANDO MOTOR V3.0 <<<");',
                '    var savedRuler = app.preferences.rulerUnits;',
                '    var savedType = app.preferences.typeUnits;',
                '    var savedDialogs = app.displayDialogs;',
                '    app.preferences.rulerUnits = Units.PIXELS;',
                '    app.preferences.typeUnits = TypeUnits.PIXELS;',
                '    app.displayDialogs = DialogModes.NO;',
                '    ',
                '    var stats = { staff: 0, graduates: 0, errors: 0 };',
                '    ',
                '    try {',
                `        var docW = Number(${design.canvasW || 4961});`,
                `        var docH = Number(${design.canvasH || 3508});`,
                `        var docName = ${JSON.stringify(groupName || "Nueva Orla")};`,
                '        ',
                '        $.writeln("Creando documento: " + docW + "x" + docH + " px");',
                '        var doc = app.documents.add(docW, docH, 300, docName, NewDocumentMode.RGB, DocumentFill.WHITE);',
                '        try { doc.colorProfileName = "Adobe RGB (1998)"; } catch(e) {}',
                '',
                '        // HELPER: Aplicación segura de fuentes',
                '        function applyFontRobust(textItem, fontName) {',
                '            try {',
                '                textItem.font = fontName;',
                '            } catch (e) {',
                '                try {',
                '                    var cleanName = fontName.replace(/\\s/g, "");',
                '                    textItem.font = cleanName;',
                '                } catch (e2) {',
                '                    try { ',
                '                        if (fontName.indexOf("Bold") !== -1) textItem.font = "Arial-BoldMT";',
                '                        else textItem.font = "ArialMT"; ',
                '                    } catch (e3) { $.writeln("Fallo total fuente: " + fontName); }',
                '                }',
                '            }',
                '        }',
                '',
                '        function selectEllipse(top, left, bottom, right) {',
                '            var idsetd = charIDToTypeID( "setd" );',
                '            var desc1 = new ActionDescriptor();',
                '            var idnull = charIDToTypeID( "null" );',
                '            var ref1 = new ActionReference();',
                '            var idChnl = charIDToTypeID( "Chnl" );',
                '            var idfsel = charIDToTypeID( "fsel" );',
                '            ref1.putProperty( idChnl, idfsel );',
                '            desc1.putReference( idnull, ref1 );',
                '            var idT = charIDToTypeID( "T   " );',
                '            var desc2 = new ActionDescriptor();',
                '            var idTop = charIDToTypeID( "Top " );',
                '            var idPxl = charIDToTypeID( "#Pxl" );',
                '            desc2.putUnitDouble( idTop, idPxl, top );',
                '            var idLeft = charIDToTypeID( "Left" );',
                '            var idBtom = charIDToTypeID( "Btom" );',
                '            var idRght = charIDToTypeID( "Rght" );',
                '            desc2.putUnitDouble( idLeft, idPxl, left );',
                '            desc2.putUnitDouble( idBtom, idPxl, bottom );',
                '            desc2.putUnitDouble( idRght, idPxl, right );',
                '            var idElps = charIDToTypeID( "Elps" );',
                '            desc1.putObject( idT, idElps, desc2 );',
                '            var idAntA = charIDToTypeID( "AntA" );',
                '            desc1.putBoolean( idAntA, true );',
                '            executeAction( idsetd, desc1, DialogModes.NO );',
                '        }',
                '',
                '        function selectRoundedRect(top, left, bottom, right, radius) {',
                '            var idsetd = charIDToTypeID( "setd" );',
                '            var desc1 = new ActionDescriptor();',
                '            var idnull = charIDToTypeID( "null" );',
                '            var ref1 = new ActionReference();',
                '            ref1.putProperty( charIDToTypeID( "Chnl" ), charIDToTypeID( "fsel" ) );',
                '            desc1.putReference( idnull, ref1 );',
                '            var idT = charIDToTypeID( "T   " );',
                '            var desc2 = new ActionDescriptor();',
                '            desc2.putUnitDouble( charIDToTypeID( "Top " ), charIDToTypeID( "#Pxl" ), top );',
                '            desc2.putUnitDouble( charIDToTypeID( "Left" ), charIDToTypeID( "#Pxl" ), left );',
                '            desc2.putUnitDouble( charIDToTypeID( "Btom" ), charIDToTypeID( "#Pxl" ), bottom );',
                '            desc2.putUnitDouble( charIDToTypeID( "Rght" ), charIDToTypeID( "#Pxl" ), right );',
                '            desc2.putUnitDouble( charIDToTypeID( "Rds " ), charIDToTypeID( "#Pxl" ), radius || 0 );',
                '            desc1.putObject( idT, charIDToTypeID( "Rctn" ), desc2 );',
                '            executeAction( idsetd, desc1, DialogModes.NO );',
                '        }',
                '',
                '        function autoFitFontSize(layer, maxW) {',
                '            try {',
                '                if (!layer || layer.kind !== LayerKind.TEXT) return;',
                '                var currentW = layer.bounds[2] - layer.bounds[0];',
                '                if (currentW > maxW && currentW > 0) {',
                '                    var ratio = maxW / currentW;',
                '                    layer.textItem.size = Math.max(1, layer.textItem.size * ratio * 0.95);',
                '                }',
                '            } catch (e) {}',
                '        }',
                '',
                `        var currentShape = ${JSON.stringify(design.photoShape || 'circle')};`,
                `        var defaultFont = ${JSON.stringify(design.fontFamily || "MyriadPro-Bold")};`,
                '        var PX_TO_PT = 0.24;',
                '',
                '        var tempFolder = new Folder(Folder.temp + "/pujalte_studio_orla");',
                '        if (!tempFolder.exists) tempFolder.create();',
                '',
                '        function createItem(parentGroup, nombre, apellidos, cargo, id, phX, phY, phW, phH, nameY, nameSizePx, roleY, roleSizePx, isStaff, surnameY, photoUrl, zoom, extraX, extraY) {',
                '            try {',
                '                var group = parentGroup.layerSets.add();',
                '                group.name = id || "ITEM";',
                '',
                '                // PLACEHOLDER',
                '                var sW = Math.min(phW, phH); var sH = sW;',
                '                var sX = phX + (phW - sW) / 2; var sY = phY + (phH - sH) / 2;',
                '',
                '                if (currentShape === "circle") selectEllipse(sY, sX, sY + sH, sX + sW);',
                '                else if (currentShape === "oval") selectEllipse(phY, phX, phY + phH, phX + phW);',
                '                else if (currentShape === "rect34r") selectRoundedRect(phY, phX, phY + phH, phX + phW, 45);',
                '                else if (currentShape === "square") selectRoundedRect(sY, sX, sY + sH, sX + sW, 45);',
                '                else {',
                '                    if (currentShape === "rect") selectRoundedRect(phY, phX, phY + phH, phX + phW, 0);',
                '                    else doc.selection.select([[phX, phY], [phX + phW, phY], [phX + phW, phY + phH], [phX, phY + phH]]);',
                '                }',
                '',
                '                var placeholder = group.artLayers.add(); placeholder.name = "PLACEHOLDER";',
                '                var fillColor = new SolidColor(); fillColor.rgb.hexValue = "F0F0F0";',
                '                doc.selection.fill(fillColor); doc.selection.deselect();',
                '',
                '                // PHOTO CLOUD',
                '                if (photoUrl && photoUrl !== "") {',
                '                    try {',
                '                        var safeId = id.replace(/[^a-zA-Z0-9]/g, "_");',
                '                        var tempFile = new File(tempFolder + "/" + safeId + ".jpg");',
                '                        var curlCmd = "curl -k -L -s -o \\"" + tempFile.fsName + "\\" \\"" + photoUrl + "\\"";',
                '                        app.system(curlCmd);',
                '                        ',
                '                        if (tempFile.exists && tempFile.length > 0) {',
                '                            var photoDoc = app.open(tempFile);',
                '                            try { photoDoc.colorProfileName = "Adobe RGB (1998)"; } catch(e) {}',
                '                            photoDoc.selection.selectAll(); photoDoc.selection.copy();',
                '                            photoDoc.close(SaveOptions.DONOTSAVECHANGES);',
                '                            ',
                '                            app.activeDocument = doc;',
                '                            doc.activeLayer = placeholder;',
                '                            var pastedLayer = doc.paste();',
                '                            pastedLayer.name = "FOTO_" + id;',
                '',
                '                            var pb = placeholder.bounds;',
                '                            var curB = pastedLayer.bounds;',
                '                            var scale = Math.max((pb[2]-pb[0])/(curB[2]-curB[0]), (pb[3]-pb[1])/(curB[3]-curB[1])) * 100 * (zoom || 1);',
                '                            pastedLayer.resize(scale, scale, AnchorPosition.MIDDLECENTER);',
                                '                            var newB = pastedLayer.bounds;',
                            '                            var sW = newB[2] - newB[0]; var sH = newB[3] - newB[1];',
                            '                            var offX = pb[0] + (pb[2]-pb[0])/2 - (newB[0] + sW/2);',
                            '                            var offY = pb[1] + (pb[3]-pb[1])/2 - (newB[1] + sH/2);',
                            '                            var shiftX = (extraX / 100) * sW; var shiftY = (extraY / 100) * sH;',
                            '                            pastedLayer.translate(offX + shiftX, offY + shiftY);',
                '                            ',
                '                            pastedLayer.move(placeholder, ElementPlacement.PLACEBEFORE);',
                '                            pastedLayer.grouped = true;',
                '                        }',
                '                    } catch(e) { $.writeln("Error photo " + id + ": " + e); }',
                '                }',
                '',
                '                var centerX = phX + (phW / 2);',
                '                ',
                '                // NOMBRE',
                '                var nameLayer = group.artLayers.add(); nameLayer.kind = LayerKind.TEXT;',
                '                nameLayer.textItem.kind = TextType.POINTTEXT;',
                '                nameLayer.textItem.justification = Justification.CENTER;',
                '                applyFontRobust(nameLayer.textItem, defaultFont);',
                '                nameLayer.textItem.size = nameSizePx * PX_TO_PT;',
                '                nameLayer.textItem.contents = nombre.toUpperCase();',
                '                nameLayer.textItem.position = [centerX, nameY + (nameSizePx * 0.8)];',
                '                autoFitFontSize(nameLayer, phW);',
                '',
                '                // APELLIDOS',
                '                if (apellidos) {',
                '                    var surLayer = group.artLayers.add(); surLayer.kind = LayerKind.TEXT;',
                '                    surLayer.textItem.kind = TextType.POINTTEXT;',
                '                    surLayer.textItem.justification = Justification.CENTER;',
                '                    applyFontRobust(surLayer.textItem, defaultFont.replace("-Bold", "-Regular"));',
                '                    surLayer.textItem.size = (nameSizePx * 0.75) * PX_TO_PT;',
                '                    surLayer.textItem.contents = apellidos.toUpperCase();',
                '                    surLayer.textItem.position = [centerX, surnameY + (nameSizePx * 0.6)];',
                '                    autoFitFontSize(surLayer, phW);',
                '                }',
                '',
                '                // CARGO',
                '                if (isStaff && cargo) {',
                '                    var roleLayer = group.artLayers.add(); roleLayer.kind = LayerKind.TEXT;',
                '                    roleLayer.textItem.kind = TextType.POINTTEXT;',
                '                    roleLayer.textItem.justification = Justification.CENTER;',
                '                    applyFontRobust(roleLayer.textItem, defaultFont);',
                '                    roleLayer.textItem.size = roleSizePx * PX_TO_PT;',
                '                    roleLayer.textItem.contents = cargo.toUpperCase();',
                '                    roleLayer.textItem.position = [centerX, roleY + (roleSizePx * 0.8)];',
                '                    autoFitFontSize(roleLayer, phW);',
                '                }',
                '                if (isStaff) stats.staff++; else stats.graduates++;',
                '            } catch(e) { stats.errors++; $.writeln("Critical item error: " + e); }',
                '        }',
                '',
                '        var docentesGroup = doc.layerSets.add(); docentesGroup.name = "DOCENTES";',
                '        var alumnosGroup = doc.layerSets.add(); alumnosGroup.name = "ALUMNOS";',
                '',
                staffLines,
                aluLines,
                '',
                '        // FOOTER TEXTS',
                '        var footerGroup = doc.layerSets.add(); footerGroup.name = "PIE DE ORLA";',
                '        var cX = doc.width / 2;',
                `        var fY = Number(${design.canvasH || 3508}) - Number(${design.footerY || 100});`,
                '',
                `        if (!${!!design.hideSchool}) {`,
                '            var sL = footerGroup.artLayers.add(); sL.kind = LayerKind.TEXT;',
                `            sL.textItem.contents = ${JSON.stringify((groupName || "").toUpperCase())};`,
                `            sL.textItem.size = ${design.fontSizeSchool || 120} * PX_TO_PT;`,
                '            sL.textItem.justification = Justification.CENTER;',
                '            applyFontRobust(sL.textItem, defaultFont);',
                '            sL.textItem.position = [cX, fY - 180];',
                '        }',
                '',
                `        if (!${!!design.hidePromo}) {`,
                '            var pL = footerGroup.artLayers.add(); pL.kind = LayerKind.TEXT;',
                `            pL.textItem.contents = ${JSON.stringify((design.promoText || "PROMOCIÓN 2026").toUpperCase())};`,
                `            pL.textItem.size = ${design.fontSizePromo || 45} * PX_TO_PT;`,
                '            pL.textItem.tracking = 600;',
                '            pL.textItem.justification = Justification.CENTER;',
                '            applyFontRobust(pL.textItem, defaultFont);',
                '            pL.textItem.position = [cX, fY - 60];',
                '        }',
                '',
                `        if (!${!!design.hideCourse}) {`,
                '            var cL = footerGroup.artLayers.add(); cL.kind = LayerKind.TEXT;',
                `            cL.textItem.contents = ${JSON.stringify((design.courseText || (course + " " + group)).toUpperCase())};`,
                `            cL.textItem.size = ${design.fontSizeCourse || 35} * PX_TO_PT;`,
                '            cL.textItem.tracking = 150;',
                '            cL.textItem.justification = Justification.CENTER;',
                '            applyFontRobust(cL.textItem, defaultFont);',
                '            cL.textItem.position = [cX, fY];',
                '        }',
                '',
                '        // CONFIGURACIÓN FINAL DE GUÍAS Y RESTAURAR',
                '        app.preferences.rulerUnits = Units.MM;',
                `        doc.guides.add(Direction.VERTICAL,   ${(design.canvasW / (design.dpi || 300) * 25.4 / 2).toFixed(2)});`,
                `        doc.guides.add(Direction.HORIZONTAL, ${(design.canvasH / (design.dpi || 300) * 25.4 / 2).toFixed(2)});`,
                `        doc.guides.add(Direction.VERTICAL,   ${(design.margin / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `        doc.guides.add(Direction.VERTICAL,   ${((design.canvasW - design.margin) / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `        doc.guides.add(Direction.HORIZONTAL, ${(design.margin / (design.dpi || 300) * 25.4).toFixed(2)});`,
                `        doc.guides.add(Direction.HORIZONTAL, ${((design.canvasH - design.margin) / (design.dpi || 300) * 25.4).toFixed(2)});`,
                '        $.writeln("Construcción completada.");',
                '        // DIÁLOGO FINAL PREMIUM',
                '        var win = new Window("dialog", "Pujalte Creative Studio");',
                '        win.orientation = "column"; win.alignChildren = "center"; win.spacing = 20; win.margins = 40;',
                '        var logoFile = new File(Folder.myDocuments + "/pujalte_studio/logo.png");',
                '        if (logoFile.exists) { win.add("image", undefined, logoFile); }',
                '        var header = win.add("statictext", undefined, "¡ORLA CREADA CON \u00C9XITO!");',
                '        header.graphics.font = ScriptUI.newFont("Tahoma", "BOLD", 24);',
                '        var info = win.add("statictext", undefined, "Staff: " + stats.staff + " | Alumnos: " + stats.graduates + " | Errores: " + stats.errors);',
                '        info.graphics.font = ScriptUI.newFont("Tahoma", "REGULAR", 14);',
                '        var sep = win.add("statictext", undefined, "--------------------------------------------------------------");',
                '        sep.graphics.foregroundColor = win.graphics.newPen(win.graphics.PenType.SOLID_COLOR, [0.8, 0.8, 0.8, 1], 1);',
                '        var footer = win.add("statictext", undefined, "POWERED BY PUJALTE CREATIVE STUDIO");',
                '        footer.graphics.font = ScriptUI.newFont("Tahoma", "BOLD", 11);',
                '        var btn = win.add("button", undefined, "BRUTAL", {name: "ok"});',
                '        btn.size = [200, 55];',
                '        btn.onClick = function() { win.close(); };',
                '        win.show();',
                '',
                '    } catch (e) {',
                '        $.writeln("Error en la ejecución del script: " + e.message + " (Línea: " + e.line + ")");',
                '        alert("Ha ocurrido un error: " + e.message + " (Línea: " + e.line + ")");',
                '    } finally {',
                '        app.preferences.rulerUnits = savedRuler;',
                '        app.preferences.typeUnits = savedType;',
                '        app.displayDialogs = savedDialogs;',
                '        if (app.documents.length > 0) {',
                '            app.activeDocument = doc;',
                '        }',
                '    }',
                '}',
                '',
                'main();',
            ].join('\n');


        } else if (type === 'RASTER') {
            content = [
                '/* INYECCIÓN POR CARPETA V3.5 - Pujalte Studio */',
                'function main() {',
                '    var savedDialogs = app.displayDialogs;',
                '    app.displayDialogs = DialogModes.NO;',
                '    var doc = app.activeDocument;',
                '    var folder = Folder.selectDialog("Selecciona la CARPETA con las fotos de los protagonistas");',
                '    if (!folder) return;',
                '',
                '    var files = folder.getFiles(/\\.(jpg|jpeg|png|tif|tiff)$/i);',
                '    var fileMap = {};',
                '    for (var f = 0; f < files.length; f++) {',
                '        var fileName = decodeURI(files[f].name);',
                '        var baseName = fileName.replace(/\\.[^/.]+$/, "").toLowerCase();',
                '        fileMap[baseName] = files[f];',
                '    }',
                '',
                '    var savedRuler = app.preferences.rulerUnits;',
                '    app.preferences.rulerUnits = Units.PIXELS;',
                '',
                '    var count = 0;',
                '    var groups = ["ALUMNOS", "DOCENTES"];',
                '',
                '    for (var g = 0; g < groups.length; g++) {',
                '        var gContainer;',
                '        try { gContainer = doc.layerSets.getByName(groups[g]); } catch(e) { continue; }',
                '',
                '        for (var i = 0; i < gContainer.layerSets.length; i++) {',
                '            var itemGroup = gContainer.layerSets[i];',
                '            // Limpiar nombre del grupo para el matching (quitar extensiones si las hay)',
                '            var targetId = itemGroup.name.replace(/\\.[^/.]+$/, "").toLowerCase();',
                '            var file = fileMap[targetId];',
                '',
                '            if (file) {',
                '                try {',
                '                    var placeholder;',
                '                    try { placeholder = itemGroup.artLayers.getByName("PLACEHOLDER"); } catch(e) { continue; }',
                '',
                '                    app.activeDocument = doc;',
                '                    doc.activeLayer = placeholder;',
                '                    var pb = placeholder.bounds;',
                '                    var tw = pb[2] - pb[0];',
                '                    var th = pb[3] - pb[1];',
                '',
                '                    app.open(file);',
                '                    var photoDoc = app.activeDocument;',
                '                    try { photoDoc.colorProfileName = "Adobe RGB (1998)"; } catch(e) {}',
                '                    photoDoc.selection.selectAll(); photoDoc.selection.copy();',
                '                    photoDoc.close(SaveOptions.DONOTSAVECHANGES);',
                '',
                '                    app.activeDocument = doc;',
                '                    var pasted = doc.paste();',
                '                    pasted.name = "FOTO_" + targetId;',
                '',
                '                    // AJUSTE PRECISO',
                '                    var curB = pasted.bounds;',
                '                    var curW = curB[2] - curB[0];',
                '                    var curH = curB[3] - curB[1];',
                '                    var scale = Math.max(tw / curW, th / curH) * 100;',
                '                    pasted.resize(scale, scale, AnchorPosition.MIDDLECENTER);',
                '',
                '                    // CENTRADO',
                '                    var newB = pasted.bounds;',
                '                    var offX = pb[0] + (tw/2) - (newB[0] + (newB[2]-newB[0])/2);',
                '                    var offY = pb[1] + (th/2) - (newB[1] + (newB[3]-newB[1])/2);',
                '                    pasted.translate(offX, offY);',
                '',
                '                    pasted.move(placeholder, ElementPlacement.PLACEBEFORE);',
                '                    pasted.grouped = true;',
                '                    count++;',
                '                } catch(e) { }',
                '            }',
                '        }',
                '    }',
                '    app.preferences.rulerUnits = savedRuler;',
                '    app.displayDialogs = savedDialogs;',
                `    function showSuccess(message) {
        var dialog = new Window("dialog", "Pujalte Creative Studio");
        dialog.orientation = "column";
        dialog.alignChildren = "center";

        // Logo
        var logoPath = new File(Folder.myDocuments + '/pujalte_studio/logo.png');
        if (logoPath.exists) {
            var logoPanel = dialog.add("panel", undefined, "");
            logoPanel.graphics.backgroundColor = logoPanel.graphics.newBrush(logoPanel.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0]); // Transparent
            var logo = logoPanel.add("image", undefined, logoPath);
            logo.maximumSize.width = 150;
            logo.maximumSize.height = 150;
        }

        // Main message
        var messageText = dialog.add("statictext", undefined, message, { multiline: true });
        messageText.graphics.font = ScriptUI.newFont("Arial", "Bold", 18);
        messageText.justify = "center";

        // Separator
        var separator = dialog.add("statictext", undefined, "--------------------------------------------------------------");
        separator.graphics.font = ScriptUI.newFont("Arial", "Regular", 10);
        separator.justify = "center";


        // Button
        var okButton = dialog.add("button", undefined, "BRUTAL");
        okButton.onClick = function() {
            dialog.close();
        };

        dialog.center();
        dialog.show();
    }
    showSuccess("\u00A1FOTOS INYECTADAS CON \u00C9XITO!");`,
                '}',
                'main();',
            ].join('\n');
        } else if (type === 'CLOUD') {
            filename = `03_ORLA_INYECCION_CLOUD_${timestamp}.jsx`;
            const cloudItems = [
                ...currentGrads.map(o => ({
                    id: String(o.photo_file_number || o.id).toLowerCase(),
                    url: buildUrl(o),
                    group: "ALUMNOS",
                    name: o.studentName,
                    zoom: o.photoConfig?.zoom || 1,
                    x: o.photoConfig?.x || 0,
                    y: o.photoConfig?.y || 0
                })).filter(x => x.url),
                ...currentStaff.map(s => ({
                    id: String(s.photo_file_number || s.id).toLowerCase(),
                    url: buildUrl(s),
                    group: "DOCENTES",
                    name: s.firstName || s.name,
                    zoom: s.photoConfig?.zoom || 1,
                    x: s.photoConfig?.x || 0,
                    y: s.photoConfig?.y || 0
                })).filter(x => x.url)
            ];

            content = [
                '/* INYECCIÓN DIRECTA CLOUD - PUJALTE CREATIVE STUDIO */',
                '#target photoshop',
                'app.bringToFront();',
                '',
                'function main() {',
                '    var savedDialogs = app.displayDialogs;',
                '    app.displayDialogs = DialogModes.NO;',
                '    if (app.documents.length === 0) { alert("Abre la orla antes de ejecutar."); return; }',
                '    var doc = app.activeDocument;',
                '    var savedRuler = app.preferences.rulerUnits;',
                '    app.preferences.rulerUnits = Units.PIXELS;',
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
                '        var layerGroup = null;',
                '        for (var l = 0; l < parentGroup.layerSets.length; l++) {',
                '            if (parentGroup.layerSets[l].name.toLowerCase() === item.id.toLowerCase()) {',
                '                layerGroup = parentGroup.layerSets[l];',
                '                break;',
                '            }',
                '        }',
                '        if (!layerGroup) continue;',
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
                '            try { photoDoc.colorProfileName = "Adobe RGB (1998)"; } catch(e) {}',
                '            photoDoc.selection.selectAll(); photoDoc.selection.copy();',
                '            photoDoc.close(SaveOptions.DONOTSAVECHANGES);',
                '',
                '            app.activeDocument = doc;',
                '            var pastedLayer = doc.paste();',
                '            pastedLayer.name = "FOTO_" + item.id;',
                '',
                '            // ESCALADO BASE CON ZOOM',
                '            var curB = pastedLayer.bounds;',
                '            var curW = curB[2] - curB[0];',
                '            var curH = curB[3] - curB[1];',
                '            var scale = Math.max(targetW / curW, targetH / curH) * 100 * (item.zoom || 1);',
                '            pastedLayer.resize(scale, scale, AnchorPosition.MIDDLECENTER);',
                '',
                '            // CENTRADO Y RE-ENCUADRE (X, Y)',
                '            var newB = pastedLayer.bounds;',
                '            var offX = pBounds[0] + (targetW/2) - (newB[0] + (newB[2]-newB[0])/2) + (item.x || 0);',
                '            var offY = pBounds[1] + (targetH/2) - (newB[1] + (newB[3]-newB[1])/2) + (item.y || 0);',
                '            pastedLayer.translate(offX, offY);',
                '',
                '            pastedLayer.move(placeholder, ElementPlacement.PLACEBEFORE);',
                '            pastedLayer.grouped = true;',
                '            count++;',
                '        } catch(e) { }',
                '    }',
                '    app.preferences.rulerUnits = savedRuler;',
                `    function showSuccess(message) {
        var dialog = new Window("dialog", "Pujalte Creative Studio");
        dialog.orientation = "column";
        dialog.alignChildren = "center";

        // Logo
        var logoPath = new File(Folder.myDocuments + '/pujalte_studio/logo.png');
        if (logoPath.exists) {
            var logoPanel = dialog.add("panel", undefined, "");
            logoPanel.graphics.backgroundColor = logoPanel.graphics.newBrush(logoPanel.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0]); // Transparent
            var logo = logoPanel.add("image", undefined, logoPath);
            logo.maximumSize.width = 150;
            logo.maximumSize.height = 150;
        }

        // Main message
        var messageText = dialog.add("statictext", undefined, message, { multiline: true });
        messageText.graphics.font = ScriptUI.newFont("Arial", "Bold", 18);
        messageText.justify = "center";

        // Separator
        var separator = dialog.add("statictext", undefined, "--------------------------------------------------------------");
        separator.graphics.font = ScriptUI.newFont("Arial", "Regular", 10);
        separator.justify = "center";


        // Button
        var okButton = dialog.add("button", undefined, "BRUTAL");
        okButton.onClick = function() {
            dialog.close();
        };

        dialog.center();
        dialog.show();
    }
    showSuccess("¡INYECCIÓN CLOUD COMPLETADA!");`,
                '}',
                'main();',
            ].join('\n');
        }

        let alreadySaved = false;
        // 1. Intentar Guardado y Apertura en Local (Solo dev)
        if (!isHosting) {
            try {
                const r = await fetch(`${import.meta.env.BASE_URL}api/save-as`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, filename })
                });
                if (r.ok) {
                    const data = await r.json();
                    if (data.success) {
                        alreadySaved = true;
                        // AUTO REVELAR CARPETA
                        fetch(`${import.meta.env.BASE_URL}api/reveal-file`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: data.path })
                        }).catch(() => {});

                        setScriptModal({ content, filename: data.filename, copied: false, saved: true, savedPath: data.path });
                    }
                }
            } catch (e) { console.error("Error local save:", e); }
        }

        // 2. Método Universal: Descarga por bloque de datos (DISPONIBLE SIEMPRE O SI FALLA LOCAL)
        try {
            const blob = new Blob([content], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            
            // Solo auto-click si NO se guardó en local (para evitar doble ventana inicial)
            // Pero el botón manual siempre funcionará
            if (!alreadySaved) {
                a.click();
            }
            
            setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            setScriptModal({ content, filename, copied: false, saved: true, savedPath: alreadySaved ? 'Guardado en carpeta local' : 'Carpeta de Descargas' });
        } catch (error) {
            console.error('Fallo en descarga:', error);
            if (!alreadySaved) setScriptModal({ content, filename, copied: true, saved: false });
        }
        } catch (error) {
            console.error('Fallo crítico downloadScript:', error);
            setScriptModal({ content: 'Error generando script', filename: 'error.jsx', copied: false, saved: false, error: true });
        }
    };



    return (
        <>
            <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f8f9fa] text-slate-900'} p-4 md:p-8 animate-fade-in relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-600/10 rounded-full blur-[80px] md:blur-[120px] -z-1" />

                <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 relative z-10">
                    <div className={`flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} pb-6 md:pb-8`}>
                        <div className="space-y-4 md:space-y-2 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 md:gap-3">
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

                    <div className="space-y-4">
                        {/* 01. CONSTRUCTOR PSD - AHORA ARRIBA Y ANCHO COMPLETO */}
                        <div className={`group ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-6 md:p-8 space-y-4 hover:border-blue-500/30 transition-all duration-500 flex flex-col`}>
                            <div className={`flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} pb-4`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <Layers size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className={`text-lg md:text-xl font-black italic uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>01. Constructor PSD</h3>
                                        <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-[10px] uppercase font-bold tracking-widest`}>Generación de Lienzo Maestro en Photoshop 2026</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onBack}
                                    className={`flex items-center gap-2 py-2.5 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-white hover:border-blue-200'} active:scale-95`}
                                >
                                    <ArrowLeft size={14} />
                                    <span>Volver al Editor</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
                                <div className={`${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'} rounded-2xl border p-5 flex flex-col justify-center`}>
                                    <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-blue-900/40'} tracking-widest`}>Resolución</p>
                                    <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{design.dpi || 300} DPI</p>
                                </div>
                                <div className={`${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'} rounded-2xl border p-5 flex flex-col justify-center`}>
                                    <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-blue-900/40'} tracking-widest`}>Lienzo (W×H)</p>
                                    <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{design.canvasW}×{design.canvasH}px</p>
                                    <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">({(design.canvasW * 25.4 / (design.dpi || 300) / 10).toFixed(1)} × {(design.canvasH * 25.4 / (design.dpi || 300) / 10).toFixed(1)} cm)</p>
                                </div>
                                <div className={`${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'} rounded-2xl border p-5 flex flex-col justify-center`}>
                                    <p className={`text-[8px] uppercase font-black ${theme === 'dark' ? 'text-white/30' : 'text-blue-900/40'} tracking-widest`}>Margen Global</p>
                                    <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{(design.margin * 25.4 / (design.dpi || 300) / 10).toFixed(1)} cm</p>
                                    <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">({design.margin} px)</p>
                                </div>
                                <div className={`${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'} rounded-2xl border p-5 flex flex-col justify-center`}>
                                    <p className={`text-[8px] uppercase font-black tracking-widest ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Ready to PSD</p>
                                    <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Myriad Pro</p>
                                </div>
                            </div>

                            <button onClick={() => downloadScript('CONSTRUCTOR')} className="w-full flex items-center justify-between p-6 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 rounded-3xl border border-blue-500/30 transition-all shadow-xl active:scale-95 group/btn">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
                                        <Zap className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-xl tracking-tight">CONSTRUCTOR V3.0</div>
                                        <div className="text-sm opacity-60 font-medium">Generar PSD desde cero</div>
                                    </div>
                                </div>
                                <Download size={22} className="group-hover/btn:scale-125 transition-transform" />
                            </button>
                        </div>

                        {/* 02. PUENTE LIGHTROOM - AHORA DEBAJO */}
                        <div className={`group ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-6 md:p-8 space-y-6 hover:border-violet-500/30 transition-all duration-500`}>
                            <div className={`flex items-center gap-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} pb-4`}>
                                <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400">
                                    <Camera size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className={`text-lg md:text-xl font-black italic uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>02. Puente Lightroom</h3>
                                    <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-[10px] uppercase font-black tracking-[0.3em]`}>Filtros Inteligentes de Selección</p>
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
                                                    {(settings?.supplements || []).filter(s => s?.active).map(s => (
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
                                                <span 
                                                    onClick={() => {
                                                        const id = (s.photo_file_number || s.photoFile || s.id || '').split('.')[0];
                                                        copyToClipboard(id);
                                                    }}
                                                    className="text-[10px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg cursor-pointer hover:bg-amber-500 hover:text-white transition-all active:scale-95"
                                                    title="Clic para copiar ID"
                                                >
                                                    {(s.photo_file_number || s.photoFile || 'S/F').split('.')[0]}
                                                </span>
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
                                                                ((settings?.supplements || []).find(s => s.id === activeFilter.id)?.name || 'Suplemento') :
                                                                (g.pack && typeof g.pack === 'object' ? (g.pack.name || g.pack.label) : (PACKS.find(p => p.id === g.pack)?.name || g.pack || 'No Pack'))
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span 
                                                        onClick={() => {
                                                            const id = (g.photo_file_number || g.photoFile || g.id || '').split('.')[0];
                                                            copyToClipboard(id);
                                                        }}
                                                        className="text-[10px] font-mono font-black text-violet-400 bg-violet-400/10 px-2 py-1 rounded-lg cursor-pointer hover:bg-violet-400 hover:text-white transition-all active:scale-95 text-right"
                                                        title="Clic para copiar ID"
                                                    >
                                                        {(g.photo_file_number || g.photoFile || 'S/F').split('.')[0]}
                                                    </span>
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
                                        onClick={() => fetch(`${import.meta.env.BASE_URL}api/reveal-file`, {
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
