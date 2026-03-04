export const CONTACT_PHONE = "650494728";
export const ADMIN_PIN = "2026";
export const DRIVE_CLIENT_ID = "218906577322-n8622bj8hrvg7iqpavmiodev14dh61gp.apps.googleusercontent.com";
export const DRIVE_API_KEY = "AIzaSyCRN41Guw-sSDjF-sEYwuFtQMG8YozBHqs";

export const DEMO_PACKS = [
    {
        id: 'basic',
        name: 'Pack Basic Print (Invitado)',
        subtitle: 'Cortesía de la casa',
        items: ['1 Orla 40x50', 'Lote 4 Fotos Carteras'],
        price: 0.00,
        cost: 0.00,
        popular: false,
    },
    {
        id: 'combo',
        name: 'Pack Digital Combo (Invitado)',
        subtitle: 'Versión Demo Completa',
        items: ['Pack Basic Print', 'Orla interactiva (App)', 'Lote 8 Fotos Carteras'],
        price: 0.00,
        cost: 0.00,
        popular: true,
    },
    {
        id: 'vip',
        name: 'Pack VIP Graduation (Invitado)',
        subtitle: 'Experiencia Premium Demo',
        items: ['Pack Digital Combo', 'Álbum Fotográfico 20p', 'Pin de Graduación'],
        price: 0.00,
        cost: 0.00,
        popular: false,
    },
];

export const DEMO_EXTRAS = [
    { id: 'orla_extra', name: 'Copia Orla 40x50 (Invitado)', price: 0.00, cost: 0.00, emoji: '📏' },
    { id: 'app_extra', name: 'Acceso Orla Interactiva (Invitado)', price: 0.00, cost: 0.00, emoji: '📱' },
    { id: 'lote_extra', name: 'Lote 4 Fotos Extra (Invitado)', price: 0.00, cost: 0.00, emoji: '📸' },
    { id: 'album_extra', name: 'Álbum Fotográfico 20p (Invitado)', price: 0.00, cost: 0.00, emoji: '📔' },
    { id: 'marco_madera', name: 'Marco de Madera (Roble) (Invitado)', price: 0.00, cost: 0.00, emoji: '🖼️' },
    { id: 'pin_extra', name: 'Pin de Graduación (Invitado)', price: 0.00, cost: 0.00, emoji: '🏅' },
];

export const DEMO_2026_PACKS = [
    {
        id: 'esencial_26',
        name: 'Pack Digital + Orla 2026',
        subtitle: 'El estándar de calidad',
        items: ['1 Orla A3+ Seda', 'Descarga Digital HD', '8 Fotos Carnet'],
        price: 26.00,
        cost: 6.50,
        popular: false,
    },
    {
        id: 'oro_26',
        name: 'Pack Oro Premium',
        subtitle: 'El recuerdo más completo',
        items: ['Pack Digital + Orla', '2 Copias Orla A4', '1 Retrato 15×20', 'Imán de nevera'],
        price: 36.00,
        cost: 9.33,
        popular: true,
    },
    {
        id: 'luxury_26',
        name: 'Pack Luxury Total',
        subtitle: 'Experiencia exclusiva',
        items: ['Pack Oro Premium', 'Cuadro Foam 20×25', 'Álbum Digital 10p'],
        price: 52.00,
        cost: 14.50,
        popular: false,
    }
];

export const DEMO_2026_EXTRAS = [
    { id: 'extra_orla_26', name: 'Copia Orla A3+ Extra', price: 10.00, cost: 2.50, emoji: '🖼️' },
    { id: 'extra_retrato_26', name: 'Retrato 15×20 Extra', price: 8.00, cost: 0.80, emoji: '🧑' },
    { id: 'extra_iman_26', name: 'Imán Flexible Extra', price: 5.00, cost: 0.50, emoji: '🧲' },
    { id: 'extra_foam_26', name: 'Cuadro Foam 20×25', price: 15.00, cost: 4.50, emoji: '🎨' },
    { id: 'extra_digital_26', name: 'Enlace Descarga Digital', price: 12.00, cost: 0.00, emoji: '📲' },
];

export const SCHOOLS = [
    { id: 'cantero', name: 'Maestro Joaquín Cantero', code: 'MJC' },
    { id: 'sanjose', name: 'San José', code: 'SJO' },
    { id: 'cervantes', name: 'Cervantes', code: 'CER' },
    { id: 'valentin', name: 'Valentín Buendía', code: 'VAB' },
    { id: 'salceda', name: 'E.I. Virgen Salceda', code: 'EIV' },
    { id: 'purisima', name: 'La Purísima', code: 'PUR' },
    { id: 'vistaalegre', name: 'Vista Alegre', code: 'VAL' },
    { id: 'susarte', name: 'Susarte', code: 'SUS' },
    { id: 'parque', name: 'El Parque', code: 'PAR' },
];

// Cursos clave donde se realizan orlas.
// `lines`: letras de clase disponibles. Vacío = no aplica línea.
export const COURSE_GROUPS = [
    {
        group: '🧸 Guardería — Mi Primera Graduación',
        courses: [
            { name: 'Guardería 2-3 años', lines: [] },
        ],
    },
    {
        group: '🌱 Ed. Infantil — Graduación 5 años',
        courses: [
            { name: '3º Infantil (5 años)', lines: ['A', 'B', 'C', 'D'] },
        ],
    },
    {
        group: '📚 Ed. Primaria — Fin de Etapa (6º)',
        courses: [
            { name: '6º Primaria', lines: ['A', 'B', 'C', 'D', 'E'] },
        ],
    },
    {
        group: '🎓 ESO — Fin de Etapa (4º)',
        courses: [
            { name: '4º ESO', lines: ['A', 'B', 'C', 'D', 'E'] },
        ],
    },
    {
        group: '🏛️ Bachillerato — Graduación (2º)',
        courses: [
            { name: '2º Bachillerato', lines: ['A', 'B', 'C', 'D'] },
        ],
    },
    {
        group: '🔧 FP — Fin de Ciclo (2º Curso)',
        courses: [
            { name: '2º Grado Medio', lines: [] },
            { name: '2º Grado Superior', lines: [] },
        ],
    },
    {
        group: '🎓 Universidad / Máster',
        courses: [
            { name: 'Grado — Último Curso', lines: [] },
            { name: 'Máster / Postgrado', lines: [] },
            { name: 'Doctorado', lines: [] },
        ],
    },
];

// Métodos de pago por defecto (guardados/editados desde Admin)
export const DEFAULT_PAYMENT_METHODS = [
    { id: 'bizum', label: '📲 Bizum', enabled: true },
    { id: 'card', label: '💳 Tarjeta / TPV', enabled: true },
    { id: 'efectivo', label: '💶 Efectivo', enabled: true },
];

export const PACKS = [
    {
        id: 'esencial',
        name: 'Pack Esencial',
        subtitle: 'Lo esencial perfecto',
        items: ['1 Orla A3+', '1 Retrato 15×20', '8 Fotos de Carnet'],
        price: 0.00,
        cost: 0.00,
        popular: false,
    },
    {
        id: 'recuerdo',
        name: 'Pack Recuerdo',
        subtitle: 'El más elegido',
        items: ['Pack Esencial', '2 Orlas A4', '1 Retrato extra', 'Descarga Digital HD'],
        price: 0.00,
        cost: 0.00,
        popular: true,
    },
    {
        id: 'premium',
        name: 'Pack Premium',
        subtitle: 'Experiencia completa',
        items: ['Pack Recuerdo', 'Cuadro Foam 20×25', 'Imán de nevera'],
        price: 0.00,
        cost: 0.00,
        popular: false,
    },
];

export const EXTRAS = [
    { id: 'orla_a3_extra', name: 'Copia Orla A3+', price: 0.00, cost: 0.00, emoji: '🖼️' },
    { id: 'orla_a4_extra', name: 'Copia Orla A4', price: 0.00, cost: 0.00, emoji: '📄' },
    { id: 'retrato_extra', name: 'Retrato 15×20 Extra', price: 0.00, cost: 0.00, emoji: '🧑' },
    { id: 'carnet_extra', name: 'Pack 8 Fotos Carnet', price: 0.00, cost: 0.00, emoji: '💳' },
    { id: 'foam_extra', name: 'Cuadro Foam 20×25', price: 0.00, cost: 0.00, emoji: '🎨' },
    { id: 'iman_extra', name: 'Imán Brillante', price: 0.00, cost: 0.00, emoji: '🧲' },
];
// Packs con precios inventados para nuevos registros
export const NEW_PHOTOGRAPHER_PACKS = [
    {
        id: 'esencial_2026',
        name: 'Pack Digital + Orla',
        subtitle: 'Configura tu precio',
        items: ['1 Orla A3+ Premium', 'Descarga Digital HD', '8 Fotos de Carnet'],
        price: 0.00,
        cost: 0.00,
        popular: false,
    },
    {
        id: 'recuerdo_2026',
        name: 'Pack Recuerdo Oro',
        subtitle: 'Configura tu precio',
        items: ['Pack Digital + Orla', '2 Copias Orla A4', '1 Retrato 15×20', 'Imán de nevera'],
        price: 0.00,
        cost: 0.00,
        popular: true,
    },
    {
        id: 'premium_2026',
        name: 'Pack Luxury Total',
        subtitle: 'Configura tu precio',
        items: ['Pack Recuerdo Oro', 'Cuadro Foam 20×25', 'Álbum Digital 10p'],
        price: 0.00,
        cost: 0.00,
        popular: false,
    },
];

export const NEW_PHOTOGRAPHER_EXTRAS = [
    { id: 'extra_orla', name: 'Copia Orla A3+ Extra', price: 0.00, cost: 0.00, emoji: '🖼️' },
    { id: 'extra_retrato', name: 'Retrato 15×20 Extra', price: 0.00, cost: 0.00, emoji: '🧑' },
    { id: 'extra_iman', name: 'Imán Flexible Extra', price: 0.00, cost: 0.00, emoji: '🧲' },
    { id: 'extra_foam', name: 'Cuadro Foam 20×25', price: 0.00, cost: 0.00, emoji: '🎨' },
    { id: 'extra_digital', name: 'Enlace Descarga Digital', price: 0.00, cost: 0.00, emoji: '📲' },
];

// Puestos del personal docente y de gestión (LOMLOE, centros públicos España)
export const STAFF_ROLES = [
    {
        group: '🏛️ Equipo Directivo',
        roles: ['Director/a', 'Jefe/a de Estudios', 'Secretario/a'],
    },
    {
        group: '📋 Coordinación',
        roles: [
            'Coordinador/a de Ciclo',
            'Jefe/a de Departamento',
            'Coordinador/a de Orientación',
            'Coordinador/a TIC',
            'Coordinador/a de Bienestar',
            'Coordinador/a de Formación',
            'CCP — Comisión de Coord. Pedagógica',
        ],
    },
    {
        group: '👨‍🏫 Docentes y Especialistas',
        roles: ['Tutor/a', 'Maestro/a', 'Profesor/a', 'Especialista PT', 'Especialista AL', 'Orientador/a', 'Educador/a Infantil'],
    },
    {
        group: '📚 Asignaturas — Primaria',
        roles: [
            'Conocimiento del Medio Natural, Social y Cultural',
            'Educación Artística — Plástica',
            'Educación Artística — Música',
            'Educación Física',
            'Lengua Castellana y Literatura',
            'Lengua Extranjera — Inglés',
            'Lengua Extranjera — Francés',
            'Matemáticas',
            'Educación en Valores Cívicos y Éticos',
            'Religión',
        ],
    },
    {
        group: '📖 Asignaturas — ESO',
        roles: [
            'Lengua Castellana y Literatura',
            'Matemáticas',
            'Geografía e Historia',
            'Biología y Geología',
            'Física y Química',
            'Educación Física',
            'Lengua Extranjera — Inglés',
            'Música',
            'Educación Plástica y Visual',
            'Tecnología',
            'Digitalización',
            'Economía',
            'Latín',
            'Segunda Lengua Extranjera',
        ],
    },
    {
        group: '🎓 Asignaturas — Bachillerato',
        roles: [
            'Filosofía',
            'Historia de España',
            'Lengua Castellana y Literatura',
            'Lengua Extranjera',
            'Matemáticas II',
            'Física',
            'Química',
            'Dibujo Técnico',
            'Latín',
            'Economía de la Empresa',
            'Literatura Universal',
            'Análisis Musical',
            'Historia del Arte',
        ],
    },
];
