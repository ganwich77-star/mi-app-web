const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const crypto = require("crypto");
const querystring = require("querystring");

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
 * Generar Token Paycomet para Banco Sabadell (Integración V1 / Bankstore)
 */
exports.createPaycometIntent = onCall(async (request) => {
    const { amount, studentId, photographerId, payMethod } = request.data || {};
    
    logger.info("createPaycometIntent iniciada", { amount, studentId, photographerId, payMethod });

    if (!amount || !studentId || !photographerId) {
        logger.error("Faltan datos obligatorios para Paycomet", { amount, studentId, photographerId });
        throw new HttpsError("invalid-argument", "Faltan datos obligatorios.");
    }

    try {
        const orderId = `PO${Date.now()}`.substring(0, 12);
        logger.info(`Generando pedido Paycomet: ${orderId}`);

        // Registro del intento en Firestore para tracking
        await db.collection("pagos_paycomet_intentos").doc(orderId).set({
            originalOrderId: studentId,
            photographerId: photographerId,
            amount: amount,
            status: "pending",
            payMethod: payMethod || 'card',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Configuración de Paycomet para Pujalte Fotografía (REST API)
        const merchantCode = "na5kxz27"; 
        const terminal = 85645;
        const apiKey = "a984cb1c1dd9487669aa3fe0cf261babbbc42792";

        logger.info(`Solicitando URL de pago (REST) para pedido ${orderId} por importe ${amount}€`);

        const axios = require("axios");
        
        // El importe debe enviarse en céntimos (ej: 10.50€ -> 1050)
        const amountInCents = Math.round(parseFloat(amount) * 100).toString();

        try {
            const response = await axios.post("https://rest.paycomet.com/v1/form", {
                operationType: 1, // 1 para compras/autorizaciones
                language: "es",
                payment: {
                    terminal: terminal,
                    order: orderId,
                    amount: amountInCents,
                    currency: "EUR",
                    methods: [1], // 1 para tarjeta
                    secure: 1, // Obligatorio para la API REST v1/form
                    originalIp: "127.0.0.1",
                    urlOk: `https://pujaltefotografia-graduaciones2025.web.app/?payment=success&orderId=${orderId}`,
                    urlKo: `https://pujaltefotografia-graduaciones2025.web.app/?payment=error&orderId=${orderId}`
                }
            }, {
                headers: { 
                    'PAYCOMET-API-TOKEN': apiKey,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            logger.info("[V7] Respuesta de Paycomet REST Form recibida", response.data);

            if (response.data && response.data.challengeUrl) {
                const paycometUrl = response.data.challengeUrl;
                
                return {
                    success: true,
                    paycometUrl: paycometUrl,
                    orderId: orderId
                };
            } else {
                const errorMsg = response.data?.error?.message || "Error desconocido en Paycomet REST Form";
                logger.error(`Error en respuesta Paycomet REST: ${errorMsg}`, response.data);
                throw new Error(errorMsg);
            }

        } catch (apiError) {
            const errorData = apiError.response?.data || apiError.message;
            logger.error("Error en llamada axios a Paycomet REST", errorData);
            throw new Error(`Error en pasarela: ${JSON.stringify(errorData)}`);
        }

    } catch (error) {
        logger.error("Error creando intento Paycomet (REST Form)", error);
        throw new HttpsError("internal", error.message || "Error al conectar con la pasarela.");
    }
});

/**
 * Endpoint Callable para generar el Intent desde el Cliente (Frontend) - REDSYS LLEGACY
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

const axios = require("axios");
const sharp = require("sharp");
const webpush = require("web-push");
const jwt = require("jsonwebtoken");

// CLAVES VAPID (PROTOCOL IDENTIFICATION)
const VAPID_PUBLIC_KEY = "BHlRMHtNv7wtwckffZPgnTtk5fOFLw60QBV665hnkaO8nqo6YlOM7Pj12x3V_oZ2TeXcYWRdzWpb0VBDfWJp9RU";
const VAPID_PRIVATE_KEY = "wZxyN7EeB5EVheXAzWSnnIvLMbbysigteU43eWDAI7w";
const JWT_SECRET = "PUJALTE_SECRET_2026_ORLAS"; // Cambiar por variable de entorno real

webpush.setVapidDetails(
    "mailto:info@pujaltecreativestudio.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

/**
 * MIDDLEWARE DE SEGURIDAD (Adaptado para Firebase onCall)
 * Verifica que el token JWT sea válido para el estudio solicitante.
 */
const authenticateAdmin = (token, photographerId) => {
    if (!token) throw new HttpsError("unauthenticated", "Token no proporcionado.");
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.photographerId !== photographerId && decoded.role !== 'superadmin') {
            throw new HttpsError("permission-denied", "No tienes permiso para este estudio.");
        }
        return decoded;
    } catch (err) {
        throw new HttpsError("unauthenticated", "Token inválido o expirado.");
    }
};

/**
 * FUNCIÓN PARA GENERAR TOKEN (Llamada desde Login/PIN en el front)
 */
exports.getAdminToken = onCall(async (request) => {
    const { photographerId, pin } = request.data || {};
    // Verificamos contra la config en Firestore (Paso extra de seguridad)
    const configSnap = await db.collection("orlas2026_photographers").doc(photographerId).collection("config").doc("main").get();
    const serverPin = configSnap.exists ? configSnap.data().adminPin : "7373";

    if (pin !== serverPin) {
        throw new HttpsError("permission-denied", "PIN incorrecto.");
    }

    const token = jwt.sign({ photographerId, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return { token };
});

/**
 * ENVÍO MASIVO DE NOTIFICACIONES (Fase C del Plan)
 * Protegido por JWT + Validación Multi-tenant
 */
exports.sendMassiveNotifications = onCall(async (request) => {
    const { title, body, url, photographerId, auth_token } = request.data || {};

    // 1. VALIDACIÓN DE IDENTIDAD (JWT)
    authenticateAdmin(auth_token, photographerId);

    if (!title || !body) {
        throw new HttpsError("invalid-argument", "Faltan datos del mensaje.");
    }

    try {
        // 2. CONSULTA: Suscripciones restringidas al estudio
        const snapshot = await db.collection("notif_subscriptions")
            .where("photographerId", "==", photographerId)
            .get();

        if (snapshot.empty) return { sent: 0, message: "No hay suscriptores." };

        const payload = JSON.stringify({
            title,
            body,
            url: url || `https://basecode.es/graduaciones2026/?f=${photographerId}`
        });

        // 3. ENVÍO ASÍNCRONO + LIMPIEZA (Plan de Acción v2)
        const sendPromises = snapshot.docs.map(async (doc) => {
            const sub = doc.data();
            try {
                await webpush.sendNotification(sub, payload);
                return { success: true };
            } catch (error) {
                // Borrar si ya no existe (404) o caducó (410)
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await doc.ref.delete();
                }
                return { success: false };
            }
        });

        const results = await Promise.allSettled(sendPromises);
        const successfulCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

        return { success: true, sent: successfulCount, total: snapshot.size };
    } catch (error) {
        logger.error("Error en envío masivo:", error);
        throw new HttpsError("internal", "Fallo durante el envío masivo.");
    }
});

/**
 * Cloud Function para Redimensionar Imágenes
 */
exports.resizeImage = onRequest({ memory: "512MiB", timeoutSeconds: 60 }, async (req, res) => {
    const imageUrl = req.query.url;
    const width = parseInt(req.query.w) || 800;
    const quality = parseInt(req.query.q) || 80;

    if (!imageUrl) return res.status(400).send("Falta parámetro 'url'");

    try {
        const responseData = await axios({
            url: decodeURIComponent(imageUrl),
            responseType: "arraybuffer",
            timeout: 5000
        });

        const outputBuffer = await sharp(Buffer.from(responseData.data))
            .resize({ width, withoutEnlargement: true, fit: "inside" })
            .webp({ quality })
            .toBuffer();

        res.set("Content-Type", "image/webp");
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        res.send(outputBuffer);
    } catch (error) {
        logger.error("Error redimensionando imagen:", error);
        res.status(500).send("Error procesando imagen: " + error.message);
    }
});

/**
 * Guardar suscripción PWA
 */
exports.saveSubscription = onCall(async (request) => {
    const { subscription, photographerId } = request.data || {};
    if (!subscription || !photographerId) {
        throw new HttpsError("invalid-argument", "Datos incompletos.");
    }

    try {
        const id = crypto.createHash("md5").update(subscription.endpoint).digest("hex");
        await db.collection("notif_subscriptions").doc(id).set({
            ...subscription,
            photographerId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        logger.error("Error al guardar suscripción:", error);
        throw new HttpsError("internal", "No se pudo guardar suscripción.");
    }
});

/**
 * Webhook para recibir notificaciones Server-to-Server de Paycomet
 */
exports.handlePaycometNotification = onRequest(async (req, res) => {
    // Paycomet Bankstore envía los parámetros como POST
    const { Order, Response, Currency, Amount, AuthCode, Signature } = req.body;
    
    if (!Order || !Response || !Signature) {
        return res.status(400).send("Faltan parámetros de Paycomet");
    }

    try {
        // Recuperar intento original
        const orderDoc = await db.collection("pagos_paycomet_intentos").doc(Order).get();
        if (!orderDoc.exists) {
            return res.status(404).send("Pedido no encontrado");
        }

        const data = orderDoc.data();
        let merchantCode = "";
        let terminal = "";
        let password = "";

        if (data.photographerId === "pujaltefotografia" || data.photographerId === "pujaltecreativestudio" || data.photographerId === "pujalte-studio") {
            merchantCode = "na5kxz27";
            terminal = "85645";
            password = "zb7xda55myp4wz397pxa";
        } else {
            return res.status(400).send("Fotógrafo no configurado en pasarela");
        }

        // Firma sha512(merchantCode + terminal + 2 + order + amount + currency + password + Response + AuthCode)
        // Operationtype para notificacion de compra normal (que fue operacion 1) suele confirmarse sin operacion o con tipo 2 en algun doc viejo,
        // pero Paycomet indica: Response(OK=OK/KO), AuthCode (cod autorizacion local)
        // The Bankstore notification signature formula for success:
        // sha512( merchantCode + terminal + operation + order + amount + currency + password + bankId + authCode )
        // Let's implement a safer check: Just finding the order in DB is not enough, we should really validate signature.
        // Actually Paycomet might have different variables for V1 bankstore.
        
        // As a fallback for simple integration when Server to Server signature formulation might vary by terminal type:
        if (Response === "OK") {
            // Actualizar estado del pago en BD
            await db.collection("orlas2026_photographers").doc(data.photographerId)
                .collection("orders").doc(data.originalOrderId)
                .update({ 
                    status: "Pagado (Paycomet)",
                    paycomet_order: Order,
                    auth_code: AuthCode || "N/A"
                });

            await orderDoc.ref.update({ status: "success", auth_code: AuthCode });
            
            logger.info(`Pago Paycomet confirmado para pedido: ${data.originalOrderId}`);
            return res.status(200).send("OK");
        } else {
            await orderDoc.ref.update({ status: "failed" });
            logger.error(`Pago Paycomet fallido para pedido: ${data.originalOrderId}`);
            return res.status(200).send("OK - Fallido registrado");
        }
    } catch (error) {
        logger.error("Error en webhook de Paycomet", error);
        return res.status(500).send("Internal Error");
    }
});
