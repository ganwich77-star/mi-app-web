import React, { useState } from 'react';
import { FileText, Download, TrendingUp, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BillingPanel({ settings, photographerId }) {
    const [invoices, setInvoices] = useState([
        {
            id: 'INV-2026-001',
            date: new Date().toLocaleDateString(),
            plan: settings.plan?.toUpperCase() || 'STARTER',
            amount: settings.plan === 'pro' ? '449.00€' : '149.00€',
            status: 'Pagado',
            method: 'Transferencia'
        }
    ]);

    const handleDownload = (invoice) => {
        const printWindow = window.open('', '_blank');
        const iva = (parseFloat(invoice.amount) * 0.21).toFixed(2);
        const base = (parseFloat(invoice.amount)).toFixed(2);
        const total = (parseFloat(base) + parseFloat(iva)).toFixed(2);
        const currentYear = new Date().getFullYear();
        const dateStr = new Intl.DateTimeFormat('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(new Date());

        const logoUrl = `${window.location.origin}${import.meta.env.BASE_URL}logos/logo_azul.png`;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Factura ${invoice.id}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { 
                            font-family: 'Inter', -apple-system, sans-serif; 
                            padding: 50px; 
                            color: #0f172a; 
                            line-height: 1.5;
                            background: white;
                        }
                        .invoice-container { max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px; }
                        .brand { text-align: left; }
                        .brand-logo { 
                            height: 120px; 
                            margin-bottom: 12px;
                        }
                        .brand h1 { font-weight: 900; font-size: 24px; color: #4F46E5; margin: 0; letter-spacing: -0.02em; }
                        .brand p { font-size: 10px; font-weight: 700; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; }
                        
                        .invoice-title { text-align: right; }
                        .invoice-title h2 { font-weight: 900; font-size: 32px; color: #020617; margin: 0; text-transform: uppercase; }
                        .invoice-title p { font-size: 14px; font-weight: 700; color: #64748b; margin: 4px 0 0 0; }
                        
                        .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 60px; margin-bottom: 60px; }
                        .detail-box h3 { font-size: 10px; font-weight: 900; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                        .detail-box p { font-size: 12px; margin: 4px 0; color: #334155; }
                        .detail-box strong { color: #0f172a; }
                        
                        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        .items-table th { text-align: left; padding: 15px; background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
                        .items-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #0f172a; }
                        .items-table td.amount { text-align: right; font-weight: 700; }
                        
                        .total-section { display: flex; justify-content: flex-end; }
                        .total-box { width: 250px; }
                        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #475569; }
                        .total-row.grand { border-top: 2px solid #4F46E5; margin-top: 15px; padding-top: 15px; color: #4F46E5; font-weight: 900; font-size: 20px; }
                        
                        .footer { margin-top: 100px; padding-top: 30px; border-top: 1px solid #e2e8f0; }
                        .payment-info { background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
                        .payment-info h4 { font-size: 11px; font-weight: 900; margin: 0 0 10px 0; color: #0f172a; text-transform: uppercase; }
                        .payment-info p { font-size: 11px; color: #64748b; margin: 4px 0; }
                        .payment-info strong { color: #0f172a; font-family: monospace; font-size: 13px; }
                        
                        .lopd { font-size: 9px; color: #94a3b8; text-align: justify; line-height: 1.4; }
                        
                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; }
                            .invoice-container { max-width: 100%; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-container">
                        <div class="header">
                            <div class="brand">
                                <img src="${logoUrl}" class="brand-logo" alt="Logo"/>
                                <h1>PUJALTE CREATIVE STUDIO</h1>
                                <p>La tecnología al servicio de los recuerdos</p>
                            </div>
                            <div class="invoice-title">
                                <h2>FACTURA</h2>
                                <p>Ref: ${invoice.id}</p>
                            </div>
                        </div>


                        <div class="details-grid">
                            <div class="detail-box">
                                <h3>EMISOR</h3>
                                <p><strong>JOSE PUJALTE MOLINA</strong></p>
                                <p>CIF: 48427310M</p>
                                <p>C/ Chile nº 21, 30565</p>
                                <p>Las Torres de Cotillas, Murcia</p>
                                <p>hola@pujaltefotografia.es</p>
                            </div>
                            <div class="detail-box">
                                <h3>RECEPTOR</h3>
                                <p><strong>${settings.fiscalName || settings.studioName || 'Cliente Profesinal'}</strong></p>
                                <p>CIF/NIF: ${settings.cif || '-'}</p>
                                <p>${settings.address || '-'}</p>
                                <p>${settings.postalCode || ''} ${settings.city || ''}</p>
                                <p>Fecha: ${dateStr}</p>
                            </div>
                        </div>

                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Descripción de los Servicios</th>
                                    <th style="text-align: right">Base Imponible</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>Licencia de Software Orlas 2026 - Plan ${invoice.plan}</strong><br/>
                                        <span style="font-size: 11px; color: #64748b;">Automatización integral de orlas y gestión de capturas campaña ${currentYear}</span>
                                    </td>
                                    <td class="amount">${base}€</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="total-section">
                            <div class="total-box">
                                <div class="total-row">
                                    <span>Base Imponible:</span>
                                    <span>${base}€</span>
                                </div>
                                <div class="total-row">
                                    <span>IVA (21%):</span>
                                    <span>${iva}€</span>
                                </div>
                                <div class="total-row grand">
                                    <span>TOTAL:</span>
                                    <span>${total}€</span>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <div class="payment-info">
                                <h4>Información de Pago</h4>
                                <p>Entidad: <strong>BANCO SABADELL</strong></p>
                                <p>IBAN: <strong>ES32 0081 0540 2100 0113 4567</strong></p>
                                <p>Beneficiario: <strong>JOSE PUJALTE MOLINA</strong></p>
                            </div>
                            <div class="lopd">
                                <strong>Cláusula LOPD:</strong> De conformidad con el RGPD (UE) 2016/679, le informamos que sus datos forman parte de un fichero responsabilidad de JOSE PUJALTE MOLINA con la finalidad de gestionar la relación comercial y administrativa establecida. Puede ejercer sus derechos de acceso, rectificación, supresión y otros enviando un email a hola@pujaltefotografia.es. Esta factura tiene validez legal como justificante de compra del servicio digital.
                            </div>
                            <div style="margin-top: 40px; text-align: center;" class="no-print">
                                <button onclick="window.print()" style="background: #4F46E5; color: white; border: none; padding: 16px 32px; border-radius: 14px; font-weight: 900; font-size: 12px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: transform 0.2s;">Imprimir o Guardar PDF</button>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 animate-fade-in">
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
                            <p className="text-sm font-black text-primary leading-none uppercase tracking-tight">Transferencia Bancaria</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-3xl border border-primary/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Próxima Renovación</p>
                            <p className="text-sm font-black text-primary leading-none uppercase">Julio 2026</p>
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
                            {invoices.map((invoice) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10 space-y-2 text-center md:text-left">
                    <h4 className="text-xl font-black uppercase tracking-tight">¿Necesitas soporte con tus pagos?</h4>
                    <p className="text-sm font-bold opacity-80 max-w-md">Nuestro departamento de administración está disponible de Lunes a Viernes para resolver cualquier duda.</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white text-indigo-600 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                    Ticket de Soporte
                </button>
            </div>
        </div>
    );
}
