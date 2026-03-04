/*
 * SCRIPT: Eliminar Marca de Agua Notebook LM
 * DESCRIPCIÓN: Selecciona automáticamente la esquina inferior derecha y aplica "Content-Aware Fill".
 * AUTOR: Antigravity AI
 */

(function () {
    if (app.documents.length === 0) {
        alert("¡Error! No tienes ninguna imagen abierta en Photoshop.");
        return;
    }

    var doc = app.activeDocument;

    doc.suspendHistory("Eliminar Marca de Agua", "main()");

    function main() {
        var w = doc.width.as("px");
        var h = doc.height.as("px");

        // Área proporcional (18% ancho, 10% alto)
        var anchoSeleccion = w * 0.18;
        var altoSeleccion = h * 0.10;

        var x1 = w - anchoSeleccion;
        var y1 = h - altoSeleccion;
        var x2 = w;
        var y2 = h;

        var region = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2]
        ];
        doc.selection.select(region);

        try {
            var idfill = charIDToTypeID("fill");
            var desc = new ActionDescriptor();

            var idcontents = stringIDToTypeID("contents");
            var idfillContents = stringIDToTypeID("fillContents");
            var idcontentAware = stringIDToTypeID("contentAware");

            desc.putEnumerated(idcontents, idfillContents, idcontentAware);

            var idopacity = charIDToTypeID("opacity");
            var idpercentUnit = charIDToTypeID("#Prc");
            desc.putUnitDouble(idopacity, idpercentUnit, 100.0);

            var idmode = charIDToTypeID("mode");
            var idblendMode = charIDToTypeID("blendMode");
            var idnormal = charIDToTypeID("normal");
            desc.putEnumerated(idmode, idblendMode, idnormal);

            executeAction(idfill, desc, DialogModes.NO);
            doc.selection.deselect();

        } catch (e) {
            alert("No se pudo aplicar el autorrelleno. Asegúrate de que la capa no esté bloqueada.");
        }
    }
})();
