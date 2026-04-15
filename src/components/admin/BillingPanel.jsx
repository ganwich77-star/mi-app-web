import React, { useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FileText, Download, TrendingUp, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../firebase.js';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export default function BillingPanel({ settings, photographerId, sendAdminNotification, schoolsStats }) {
    const [invoices, setInvoices] = useState([]);

    React.useEffect(() => {
        // En lugar de facturas ficticias, escuchamos la colección real si existiera
        const invoicesRef = collection(db, 'orlas2026_photographers', photographerId, 'invoices');
        const q = query(invoicesRef, orderBy('date', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInvoices(docs);
        }, (error) => {
            console.error("Error cargando facturas:", error);
            setInvoices([]);
        });

        return () => unsubscribe();
    }, [photographerId]);

    const handleDownload = (invoice) => {
        const printWindow = window.open('', '_blank');
        const isIsland = ['Las Palmas', 'Santa Cruz de Tenerife', 'Ceuta', 'Melilla'].includes(settings.province);
        const ivaRate = isIsland ? 0 : 0.21;
        
        const iva = (parseFloat(invoice.amount) * ivaRate).toFixed(2);
        const subtotal = (parseFloat(invoice.amount)).toFixed(2);
        const total = (parseFloat(subtotal) + parseFloat(iva)).toFixed(2);
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        
        const currentDateFormatted = new Intl.DateTimeFormat('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(new Date());

        // Datos del emisor proporcionados por el usuario
        const emisor = {
            name: 'PUJALTE CREATIVE STUDIO',
            legalName: 'PujalteFotografía',
            cif: '48427310M',
            address: 'C/ CHILE nº 21, 30565, Las Torres de Cotillas, Murcia',
            email: 'hola@pujaltefotografia.es',
            web: 'www.pujalte.studio'
        };

        const bank = {
            titular: 'JOSE PUJALTE MOLINA',
            iban: 'ES75 0081 1117 1100 0113 4919',
            entidad: 'Banco Sabadell'
        };

        const color = '#4F46E5';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Factura PUJALTE STUDIO - ${invoice.id}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm;
                        }
                        body { 
                            font-family: 'Outfit', sans-serif;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            margin: 0;
                            padding: 0;
                        }
                        @media print {
                            .no-print { display: none !important; }
                            body { background-color: white !important; }
                            .invoice-card { 
                                box-shadow: none !important; 
                                border: 1px solid #e5e7eb !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                max-height: 285mm;
                            }
                        }
                        .premium-gradient {
                            background: linear-gradient(135deg, ${color} 0%, #312E81 100%);
                        }
                        .gradient-text {
                            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                    </style>
                </head>
                <body class="bg-white">
                    <div class="max-w-[210mm] mx-auto p-1 invoice-card">
                        <div class="h-2 w-full premium-gradient"></div>

                        <div class="p-4">
                            <!-- Header Superior -->
                            <div class="flex flex-col md:flex-row justify-between items-start mb-4">
                                <div class="w-full md:max-w-xl text-left">
                                    
                                     <div class="space-y-0 text-slate-500 text-left">
                                        <h1 class="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">
                                            ${emisor.name}
                                        </h1>
                                        <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center gap-4">
                                            <div class="space-y-0.5">
                                                <p class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-0.5">Datos Legales</p>
                                                <p class="font-bold text-slate-800 text-xs">${emisor.legalName}</p>
                                                <div class="flex items-center gap-2 text-xs font-medium">
                                                    <span class="text-slate-400 font-bold">NIF/CIF:</span>
                                                    <span class="text-slate-700 font-bold">${emisor.cif}</span>
                                                </div>
                                                <p class="text-xs text-slate-600 leading-tight max-w-xs">${emisor.address}</p>
                                            </div>
                                            <div class="flex-shrink-0">
                                                <img src="${import.meta.env.BASE_URL}logos/logo_negro.png" alt="Logo" class="w-32 h-auto" />
                                            </div>
                                        </div>
                                        <div class="pt-0.5 flex flex-col gap-0.5 text-[10px] font-bold text-indigo-600">
                                                <p>${emisor.email}</p>
                                                <p>${emisor.web}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-2 md:mt-0 text-right min-w-[200px] flex flex-col items-end">
                                    <div class="mb-3">
                                        <h2 class="text-4xl font-black text-slate-100 uppercase tracking-tighter leading-none select-none">FACTURA</h2>
                                        <p class="text-indigo-600 font-black text-[9px] tracking-[0.4em] uppercase -mt-1 pr-1">Documento Oficial</p>
                                    </div>

                                    <div class="space-y-1.5">
                                        <div class="border-r-4 border-indigo-600 pr-3 mr-1">
                                            <p class="text-[7px] text-slate-400 uppercase tracking-[0.2em] font-black">Nº Identificador</p>
                                            <p class="font-mono text-base font-black text-slate-900">${invoice.id}</p>
                                        </div>
                                        <div>
                                            <p class="text-[7px] text-slate-400 uppercase tracking-[0.2em] font-black">Fecha Emisión</p>
                                            <p class="font-bold text-slate-700 text-xs">${currentDateFormatted}</p>
                                        </div>
                                        <div class="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100 inline-block w-full">
                                            <p class="text-[7px] text-indigo-400 uppercase tracking-[0.2em] font-black">Campaña Activa</p>
                                            <p class="font-black text-indigo-700 text-[9px]">Graduaciones ESCOLARES ${currentYear}</p>
                                        </div>
                                    </div>
                                </div>
                             <!-- Cliente -->
                            <div class="grid md:grid-cols-2 gap-3 mb-3">
                                <div class="bg-slate-900 p-3 rounded-xl border border-white/5 relative overflow-hidden text-left">
                                    <p class="text-[7px] uppercase tracking-[0.3em] font-black text-indigo-400 mb-1">Información del Cliente</p>
                                    <h3 class="text-base font-black text-white mb-0.5 tracking-tighter capitalize">${settings.fiscalName || settings.brandName || settings.studioName || 'Cliente No Identificado'}</h3>
                                    <div class="text-[9px] text-slate-400 space-y-0.5 font-medium">
                                        <p class="flex items-center gap-1.5"><span class="w-1 h-1 bg-indigo-500 rounded-full"></span> CIF/NIF: ${settings.cif || '---'}</p>
                                        <p class="flex items-start gap-1.5 leading-tight"><span class="w-1 h-1 bg-indigo-500 rounded-full mt-1"></span> 
                                            ${settings.address || ''} 
                                            ${settings.addressNumber ? ' nº ' + settings.addressNumber : ''}
                                            ${settings.addressFloor ? ', ' + settings.addressFloor : ''}
                                            ${settings.addressLetter ? ' ' + settings.addressLetter : ''}
                                            ${!settings.address ? 'Pendiente de dirección' : ''}
                                        </p>
                                        <p class="flex items-center gap-1.5"><span class="w-1 h-1 bg-indigo-500 rounded-full"></span> ${settings.postalCode || ''} ${settings.city || ''} (${settings.province || ''})</p>
                                    </div>
                                </div>
                                
                                <div class="flex flex-col justify-center items-end text-right pr-4 space-y-1">
                                    <h4 class="text-base font-bold text-indigo-600 leading-tight">La tecnología al servicio de los recuerdos</h4>
                                    <p class="text-[9px] text-slate-400 font-medium max-w-xs leading-tight italic">Gracias por elegir a Pujalte Creative Studio.</p>
                                    <div class="pt-1 flex items-center gap-2">
                                        <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                                        <span class="text-[8px] font-black uppercase tracking-widest text-indigo-600">Servicio 24/7 Operativo</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabla de Items -->
                            <div class="mb-3 overflow-hidden rounded-lg border border-slate-100">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-slate-50 border-b border-slate-200 text-[7px] uppercase tracking-[0.2em] text-slate-400 font-black">
                                            <th class="py-1 px-2 text-left">Descripción del Servicio</th>
                                            <th class="py-1 px-2 text-center w-16">Cant.</th>
                                            <th class="py-1 px-2 text-right w-24">Precio</th>
                                            <th class="py-1 px-2 text-right w-24">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="border-b border-slate-50">
                                            <td class="py-1.5 px-2 text-left">
                                                <p class="font-bold text-slate-700 text-[10px]">Licencia App Orlas 2026 - Plan ${invoice.plan}</p>
                                            </td>
                                            <td class="py-1.5 px-2 text-center font-bold text-slate-700 text-[10px]">1</td>
                                            <td class="py-1.5 px-2 text-right font-mono text-slate-600 font-bold text-[10px]">
                                                ${subtotal}€
                                            </td>
                                            <td class="py-1.5 px-2 text-right font-black font-mono text-slate-900 text-[11px]">
                                                ${subtotal}€
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Resumen y Pago -->
                            <div class="flex flex-col md:flex-row justify-between items-stretch gap-3 pt-1">
                                <div class="flex-1 bg-slate-900 text-white p-2.5 rounded-lg border-l-4 text-left" style="border-color: ${color}">
                                    <p class="text-[7px] uppercase tracking-[0.2em] font-black text-indigo-400 mb-1 flex items-center gap-2">
                                        Información de Pago
                                    </p>
                                    <div class="grid grid-cols-2 gap-x-3 gap-y-1">
                                        <div class="border-b border-slate-800 pb-0.5 col-span-2">
                                            <p class="text-[6px] text-slate-500 uppercase tracking-wider font-bold">Titular</p>
                                            <p class="text-[9px] font-bold text-white leading-none">${bank.titular}</p>
                                        </div>
                                        <div class="border-b border-slate-800 pb-0.5">
                                            <p class="text-[6px] text-slate-500 uppercase tracking-wider font-bold">IBAN</p>
                                            <p class="text-[9px] font-mono font-black text-white leading-none">${bank.iban}</p>
                                        </div>
                                        <div class="border-b border-slate-800 pb-0.5">
                                            <p class="text-[6px] text-slate-500 uppercase tracking-wider font-bold">Entidad</p>
                                            <p class="text-[9px] font-bold text-slate-300 leading-none">${bank.entidad}</p>
                                        </div>
                                    </div>
                                    <p class="text-[6px] text-indigo-300/60 uppercase font-black tracking-widest mt-1.5 bg-indigo-500/10 p-1 rounded border border-indigo-500/20 inline-block">
                                        ⚠️ Incluir nº factura en concepto
                                    </p>
                                </div>

                                <div class="w-full md:w-48 space-y-0.5 px-2">
                                    <div class="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-widest text-right">
                                        <span>Base Neto</span>
                                        <span class="font-mono text-slate-900">${subtotal}€</span>
                                    </div>
                                    <div class="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-widest text-right">
                                        <span>IVA Incl.</span>
                                        <span class="font-mono text-slate-900">${iva}€</span>
                                    </div>
                                    <div 
                                        class="flex justify-between items-center pt-1 border-t-2 border-slate-900 mt-0.5 text-right"
                                        style="color: ${color}"
                                    >
                                        <span class="text-sm font-black uppercase tracking-tighter">TOTAL</span>
                                        <span class="text-xl font-black font-mono tracking-tighter">
                                            ${total}€
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer LOPD -->
                            <div class="mt-2 pt-2 border-t border-slate-100">
                                <div class="flex flex-col md:flex-row gap-4 items-start">
                                    <div class="flex-1 text-left">
                                        <p class="text-[6px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">RGPD / LOPD</p>
                                        <p class="text-[7px] text-slate-400 leading-tight">
                                            PujalteFotografía tratará sus datos para gestión administrativa y fiscal. Derechos: hola@pujaltefotografia.es.
                                        </p>
                                    </div>
                                    
                                    <div class="text-right shrink-0">
                                        <p class="text-[7px] font-black text-slate-800 uppercase tracking-widest">
                                            © ${currentYear} ${emisor.name}
                                        </p>
                                    </div>
                                </div>
                            </div>                            </div>

                            <div class="mt-8 text-center no-print">
                                <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-black transition-all shadow-lg uppercase tracking-widest text-[10px]">
                                    Imprimir o Guardar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSupportTicket = async () => {
        const { value: formValues } = await Swal.fire({
            title: '📩 Abrir Ticket de Ayuda',
            html: `
                <div style="text-align: left; margin-bottom: 5px;">
                    <label style="font-size: 11px; font-weight: 800; color: #4F46E5; text-transform: uppercase;">¿En qué podemos ayudarte?</label>
                    <select id="swal-subject" class="swal2-input" style="width: 100%; margin: 5px auto; font-size: 14px; border-radius: 12px;">
                        <option value="Problema con el pago">Problema con el pago</option>
                        <option value="Activación de Plan">Activación de Plan</option>
                        <option value="Error en la aplicación">Error en la aplicación</option>
                        <option value="Duda sobre Facturación">Duda sobre Facturación</option>
                        <option value="Sugerencia / Mejora">Sugerencia / Mejora</option>
                        <option value="Otros">Otros (Especificar en el mensaje)</option>
                    </select>
                </div>
                <div style="text-align: left; margin-top: 15px;">
                    <label style="font-size: 11px; font-weight: 800; color: #4F46E5; text-transform: uppercase;">Detalles del mensaje</label>
                    <textarea id="swal-message" class="swal2-textarea" style="width: 100%; margin: 5px auto; font-size: 14px; border-radius: 12px; min-height: 120px;" placeholder="Describe detalladamente tu consulta o incidencia..."></textarea>
                </div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 15px; font-style: italic; line-height: 1.2;">
                    Pulsando 'Enviar' aceptas que PujalteFotografía trate tus datos para gestionar esta consulta.
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const subject = document.getElementById('swal-subject').value;
                const message = document.getElementById('swal-message').value;
                if (!message) {
                    Swal.showValidationMessage('¡Por favor, describe tu problema!');
                    return false;
                }
                return { subject, message };
            },
            showCancelButton: true,
            confirmButtonText: 'Enviar Ticket',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4F46E5',
        });

        if (formValues) {
            Swal.fire({
                title: 'Enviando...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await sendAdminNotification('SOPORTE', {
                    brandName: settings.fiscalName || settings.brandName || settings.studioName || 'Estudio No Identificado',
                    email: settings.notificationEmail || settings.email || 'No registrado',
                    phone: settings.contactPhone || settings.phone || 'No registrado',
                    subject: formValues.subject,
                    message: formValues.message
                });

                Swal.fire({
                    icon: 'success',
                    title: '¡Recibido!',
                    text: 'Hemos enviado tu consulta. Te contactaremos pronto.',
                    confirmButtonColor: '#4F46E5'
                });
            } catch (error) {
                console.error("Error enviando soporte:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo enviar el ticket. Por favor, intenta de nuevo.'
                });
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Flex Plan Status & Liquidation Button */}
            {settings.plan === 'flex' && (
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group border border-white/10">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 bg-white/10 rounded-[30px] flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0">
                            <TrendingUp size={36} className="text-white" />
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Liquidación Plan Flexible</h3>
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">Activo</span>
                            </div>
                            <p className="text-indigo-100 text-sm font-bold max-w-2xl leading-relaxed">
                                Estás en modalidad de pago por alumno (2,00€/alumno). Cuando finalices la descarga de tus orlas, solicita la liquidación para que generemos tu factura final.
                            </p>
                        </div>

                        <button
                            onClick={async () => {
                                const result = await Swal.fire({
                                    title: '🚀 ¿Finalizar y Liquidar?',
                                    text: "Se enviará un aviso a administración para generar tu factura por los alumnos procesados hasta hoy.",
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#10b981',
                                    cancelButtonColor: '#6366f1',
                                    confirmButtonText: 'Sí, solicitar liquidación',
                                    cancelButtonText: 'Seguir trabajando',
                                    background: '#ffffff',
                                    customClass: {
                                        popup: 'rounded-[30px]',
                                        confirmButton: 'rounded-xl font-bold uppercase tracking-wider',
                                        cancelButton: 'rounded-xl font-bold uppercase tracking-wider'
                                    }
                                });

                                if (result.isConfirmed) {
                                    try {
                                        Swal.fire({ title: 'Enviando solicitud...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                                        const totalStudents = Object.values(schoolsStats || {}).reduce((acc, s) => acc + (s.totalStudents || 0), 0);
                                        const amount = (totalStudents * 2).toFixed(2) + '€';

                                        await sendAdminNotification('LIQUIDACION_FLEX', {
                                            brandName: settings.brandName || settings.studioName,
                                            photographerId: photographerId,
                                            email: settings.notificationEmail || settings.email,
                                            totalStudents: totalStudents,
                                            amount: amount,
                                            date: new Date().toLocaleString()
                                        });

                                        Swal.fire({
                                            icon: 'success',
                                            title: '¡Solicitud enviada!',
                                            text: 'Hemos recibido tu aviso. En las próximas 24h recibirás tu factura y los detalles de pago.',
                                            confirmButtonColor: '#10b981'
                                        });
                                    } catch (error) {
                                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo enviar la solicitud. Intenta de nuevo.' });
                                    }
                                }
                            }}
                            className="px-8 py-5 bg-white text-indigo-600 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0 border border-white group-hover:shadow-white/20"
                        >
                            Solicitar Factura
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-3xl border border-primary/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Invertido</p>
                            <p className="text-2xl font-black text-primary leading-none">
                                {invoices.reduce((acc, inv) => acc + parseFloat(inv.amount), 0).toFixed(2)}€
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-3xl border border-primary/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Método de Pago</p>
                            <p className="text-sm font-black text-primary leading-none uppercase tracking-tight">
                                {settings.plan === 'flex' ? 'Solicitud de Liquidación' : 'Pasarela (Tarjeta/Bizum)'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-3xl border border-primary/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ESTADO DE LICENCIA</p>
                            <p className="text-sm font-black text-primary leading-none uppercase">
                                Válida hasta {settings.licenseExpiry ? new Date(settings.licenseExpiry).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 Agosto 2026'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-card rounded-[40px] border border-primary/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-primary/5 bg-primary/2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-lg font-black text-primary uppercase tracking-tighter">Historial de Facturas</h3>
                        </div>
                        {!settings.fiscalName && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <AlertCircle size={14} className="text-amber-500" />
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Faltan datos fiscales</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-primary/5">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Factura</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-primary/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-primary tracking-tight">{invoice.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-bold text-secondary uppercase whitespace-nowrap">{invoice.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-black rounded-lg uppercase tracking-tight">
                                                {invoice.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-emerald-500">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{invoice.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-black text-primary">{(parseFloat(invoice.amount) * 1.21).toFixed(2)}€</span>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 whitespace-nowrap">IVA Inc.</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDownload(invoice)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <Download size={14} /> Descargar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Sin movimientos</p>
                                        <p className="text-[10px] font-bold opacity-60">No hay facturas emitidas por el momento.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10 space-y-2 text-center md:text-left">
                    <h4 className="text-xl font-black uppercase tracking-tight">¿Necesitas ayuda?</h4>
                    <p className="text-sm font-bold opacity-80 max-w-md">Nuestro departamento de administración está disponible de Lunes a Viernes para resolver cualquier duda.</p>
                </div>
                <button 
                    onClick={handleSupportTicket}
                    className="relative z-10 px-8 py-4 bg-white text-indigo-600 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    Ticket de Soporte
                </button>
            </div>
        </div>
    );
}
