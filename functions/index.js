const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// ENTORNO DE PRUEBAS / PRODUCCIÓN
// Idealmente en Firebase config, pero lo definimos aquí temporalmente:
const MERCHANT_CODE = "999008881"; // Cambiar por el real de Pujalte Studio
const TERMINAL = "001";
const CLAVE_SECRETA_TEST = "sq7HjrUOBfKmC576ILgskD5srU870gJ7"; // Sustituir por la real una vez validado o en variables de entorno

/**
 * Función Auxiliar: Cifrar orden con 3DES
 */
function encrypt3DES(str, key) {
    const cipher = crypto.createCipheriv("des-ede3-cbc", key, Buffer.alloc(8, 0));
    cipher.setAutoPadding(false);

    // Rellenamos string hasta ser múltiplo de 8 para el bloque
    let paddedStr = str;
    if (paddedStr.length % 8 !== 0) {
        const padding = 8 - (paddedStr.length % 8);
        paddedStr += "\\0".repeat(padding);
    }

    let res = cipher.update(paddedStr, "utf8", "base64");
    res += cipher.final("base64");
    return Buffer.from(res, "base64");
}

/**
 * Función Auxiliar: Generar Firma SHA-256 (MAC)
 */
function createSignature(order, paramsBase64, claveSecreta) {
    // 1. Decodificar la clave secreta de B64
    const key = Buffer.from(claveSecreta, "base64");

    // 2. Cifrar el ID de pedido
    const keyOrder = encrypt3DES(order, key);

    // 3. Crear HMAC SHA-256 con ese ID cifrado y el payload
    const hmac = crypto.createHmac("sha256", keyOrder);
    hmac.update(paramsBase64, "utf8");
    return hmac.digest("base64");
}

/**
 * Endpoint Callable para generar el Intent desde el Cliente (Frontend)
 */
exports.createPaymentIntent = onCall(async (request) => {
    // Los parametros se reciben en request.data v2
    const { orderId, amount, studentName, payMethod } = request.data || {};

    if (!orderId || !amount) {
        throw new HttpsError("invalid-argument", "Faltan datos obligatorios (orderId, amount).");
    }

    try {
        // Formatear amount a céntimos (ej. 45.00 -> 4500)
        const amountInCents = Math.round(parseFloat(amount) * 100).toString();

        // Número de orden para Redsys: máximo 12 caracteres y normalmente requiere los primeros 4 dígitos numéricos
        // Usamos un identificador numérico de base temporal corto
        const redsysOrderId = String(Date.now()).slice(-10) + Math.floor(Math.random() * 10).toString();

        // Registramos provisionalmente la transacción en la BD para machearla con el webhook después
        await db.collection("pagos_redsys_intentos").doc(redsysOrderId).set({
            originalOrderId: orderId,
            studentName: studentName || "Desconocido",
            amount: amount,
            status: "pending",
            payMethod: payMethod || "tarjeta",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // NOTA: Esta URL será tu endpoint final del webhook! (Sustituye 'asistente-digital-comuniones' si es diferente)
        const merchantURL = "https://us-central1-asistente-digital-comuniones.cloudfunctions.net/handlePaymentNotification";

        const parameters = {
            "DS_MERCHANT_AMOUNT": amountInCents,
            "DS_MERCHANT_ORDER": redsysOrderId,
            "DS_MERCHANT_MERCHANTCODE": MERCHANT_CODE,
            "DS_MERCHANT_CURRENCY": "978", // EUR
            "DS_MERCHANT_TRANSACTIONTYPE": "0", // Autorización normal
            "DS_MERCHANT_TERMINAL": TERMINAL,
            "DS_MERCHANT_MERCHANTURL": merchantURL,
            // Requerimiento PSD2
            "DS_MERCHANT_EMV3DS": "{\"challengeInd\":\"04\"}"
        };

        // Si elige BIZUM explícitamente, forzamos la tab 'z'
        if (payMethod === "bizum") {
            parameters["DS_MERCHANT_PAYMETHODS"] = "z";
        } else {
            parameters["DS_MERCHANT_PAYMETHODS"] = "c"; // Obligar solo tarjeta
        }

        const paramsB64 = Buffer.from(JSON.stringify(parameters), "utf8").toString("base64");

        const signature = createSignature(redsysOrderId, paramsB64, CLAVE_SECRETA_TEST);

        return {
            signatureVersion: "HMAC_SHA256_V1",
            merchantParameters: paramsB64,
            signature: signature
        };
    } catch (error) {
        logger.error("Error generando PaymentIntent", error);
        throw new HttpsError("internal", "No se pudo generar el PaymentIntent.");
    }
});

/**
 * Webhook Asíncrono (Request standard) - Redsys llama a este POST cuando se aprueba (o deniega) el pago 
 */
exports.handlePaymentNotification = onRequest(async (req, res) => {
    // Redsys manda form-urlencoded mode post:
    const paramsBase64 = req.body.Ds_MerchantParameters;
    const receivedSignature = req.body.Ds_Signature;

    if (!paramsBase64 || !receivedSignature) {
        return res.status(400).send("Faltan parámetros");
    }

    try {
        const decodedParams = Buffer.from(paramsBase64, "base64").toString("utf-8");
        const dsParams = JSON.parse(decodedParams);

        // Campos retornados por el banco
        const dsResponse = dsParams.Ds_Response || dsParams.DS_RESPONSE;
        const dsOrder = dsParams.Ds_Order || dsParams.DS_ORDER;

        // Recalcular y validar firma
        const calculatedSignature = createSignature(dsOrder, paramsBase64, CLAVE_SECRETA_TEST);

        // Limpieza Safe Base64 de URLs (reemplazando + y / por precaución o si Redsys te los devuelve modificados) 
        const cSig = calculatedSignature.replace(/\\+/g, "-").replace(/\\/ / g, "_");
        const rSig = receivedSignature;

        if (cSig !== rSig && calculatedSignature !== receivedSignature) {
            logger.error(`Firma Inválida para ${dsOrder}`);
            return res.status(400).send("Invalid signature");
        }

        // Parsear Ds_Response para saber si fue aprobado
        const codeResponse = parseInt(dsResponse, 10);
        const aprobado = codeResponse >= 0 && codeResponse <= 99;

        // Localizar en Firestore
        const transRef = db.collection("pagos_redsys_intentos").doc(dsOrder);
        const transDoc = await transRef.get();

        if (transDoc.exists) {
            const transData = transDoc.data();

            if (aprobado) {
                logger.info(`Pago de pedido ${dsOrder} APROBADO.`);
                await transRef.update({ status: "paid", dsResponseCode: codeResponse });

                // VINCULACIÓN FINAL: Marcamos el alumno como pagado en la base de orlas
                // OJO: Usar la colección correspondiente a alumnos (podría ser "orlas2026_registros" o "comuniones_registros" según tu base)
                await db.collection("orlas_2026_registros").doc(transData.originalOrderId).update({
                    pagoConfirmado: true,
                    metodoPago: transData.payMethod === 'bizum' ? 'Bizum' : 'Tarjeta'
                });
            } else {
                logger.warn(`Pago de pedido ${dsOrder} RECHAZADO con código ${codeResponse}.`);
                await transRef.update({ status: "failed", dsResponseCode: codeResponse });
            }
        }

        res.status(200).send("OK"); // Imprescindible decirle 200 al banco
    } catch (error) {
        logger.error("Error procesando Webhook", error);
        res.status(500).send("Internal Error");
    }
});
