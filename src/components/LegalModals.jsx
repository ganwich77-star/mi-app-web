import React from 'react';
import { X, Shield, Lock, FileText, Scale } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, title, children, icon: Icon }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto pt-20 pb-10">
            <div className="w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-slide-up space-y-8 relative my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                    <X size={24} />
                </button>

                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-[20px] flex items-center justify-center mx-auto border border-indigo-500/20 text-indigo-400 mb-4 shadow-xl">
                        <Icon size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
                    <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
                </div>

                <div className="text-slate-400 text-sm leading-relaxed space-y-6 font-medium max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {children}
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                        Entendido, cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AvisoLegal = ({ isOpen, onClose }) => (
    <LegalModal isOpen={isOpen} onClose={onClose} title="Aviso Legal" icon={Scale}>
        <div className="space-y-6">
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">1. Información del Titular</h4>
                <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se exponen los datos identificativos del titular:</p>
                <ul className="mt-3 space-y-1 border-l-2 border-indigo-600/30 pl-4 py-1">
                    <li><strong className="text-white">Titular:</strong> JOSE PUJALTE MOLINA</li>
                    <li><strong className="text-white">NIF:</strong> 48427310M</li>
                    <li><strong className="text-white">Domicilio:</strong> C/ CHILE, 21, 30565 LAS TORRES DE COTILLAS (MURCIA)</li>
                    <li><strong className="text-white">Email:</strong> info@pujaltefotografia.es</li>
                </ul>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">2. Propiedad Intelectual</h4>
                <p>El código fuente, los diseños gráficos, las imágenes, las fotografías, los sonidos, las animaciones, el software, los textos, así como la información y los contenidos que se recogen en el presente sitio web están protegidos por la legislación española sobre los derechos de propiedad intelectual e industrial a favor de JOSE PUJALTE MOLINA.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">3. Condiciones de Uso</h4>
                <p>El usuario se compromete a utilizar el sitio web de conformidad con la ley y el presente Aviso Legal. El uso de la herramienta de gestión de orlas implica la aceptación de estas condiciones.</p>
            </section>
        </div>
    </LegalModal>
);

export const PoliticaPrivacidad = ({ isOpen, onClose }) => (
    <LegalModal isOpen={isOpen} onClose={onClose} title="Privacidad" icon={Shield}>
        <div className="space-y-6">
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">1. Responsable del Tratamiento</h4>
                <p>Responsable: JOSE PUJALTE MOLINA (48427310M). Finalidad: Gestionar su suscripción y prestación del servicio de orlas digitales.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">2. Datos Recogidos</h4>
                <p>Recogemos datos de contacto (nombre, email, teléfono) y datos fiscales necesarios para la facturación. En el caso de los colegios, se procesan imágenes de menores bajo el consentimiento explícito de sus tutores legales.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">3. Derechos del Usuario</h4>
                <p>Usted tiene derecho a acceder, rectificar y suprimir sus datos, así como otros derechos explicados en la normativa vigente, enviando un email a info@pujaltefotografia.es adjuntando copia de su DNI.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">4. Cookies</h4>
                <p>Este sitio utiliza cookies técnicas necesarias para el funcionamiento del servicio y la sesión de usuario.</p>
            </section>
        </div>
    </LegalModal>
);

export const CondicionesVenta = ({ isOpen, onClose }) => (
    <LegalModal isOpen={isOpen} onClose={onClose} title="Condiciones de Venta" icon={FileText}>
        <div className="space-y-6">
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">1. Objetos del Servicio</h4>
                <p>Orlas 2026 ofrece una plataforma SaaS (Software as a Service) para fotógrafos profesionales destinada a la gestión, captura y diseño de orlas escolares.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">2. Precios y Pagos</h4>
                <p>Los precios de los planes están publicados en la landing page. Para fotógrafos, los precios son base imponible (+21% IVA). El pago se realiza mediante tarjeta bancaria o transferencia bancaria según el plan elegido.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">3. Entrega del Servicio</h4>
                <p>Al tratarse de un servicio digital, la entrega se considera realizada en el momento de la habilitación de las credenciales de acceso al panel de control.</p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">4. Política de Devoluciones</h4>
                <p>Conforme al Artículo 103 m) del Real Decreto Legislativo 1/2007, el derecho de desistimiento no será aplicable al suministro de contenido digital que no se preste en un soporte material cuando la ejecución haya comenzado. <span className="text-indigo-400">Una vez activada la suscripción, no se admiten devoluciones por tratarse de un servicio de acceso inmediato.</span></p>
            </section>
            <section>
                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-3">5. Jurisdicción</h4>
                <p>Para cualquier controversia que pudiera surgir, ambas partes se someten a los Juzgados y Tribunales de la ciudad de Murcia, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.</p>
            </section>
        </div>
    </LegalModal>
);
