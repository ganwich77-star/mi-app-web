export const CONTACT_PHONE = "650494728";
export const ADMIN_PIN = "2026";
export const DRIVE_CLIENT_ID = "218906577322-n8622bj8hrvg7iqpavmiodev14dh61gp.apps.googleusercontent.com";
export const DRIVE_API_KEY = "AIzaSyCRN41Guw-sSDjF-sEYwuFtQMG8YozBHqs";

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
    { id: 'efectivo', label: '💶 Efectivo', enabled: true },
];

export const PACKS = [
    {
        id: 'esencial',
        name: 'Pack Esencial',
        subtitle: 'Lo esencial perfecto',
        items: ['1 Orla A3+', '1 Retrato 15×20', '8 Fotos de Carnet'],
        price: 15.00,
        cost: 4.73,
        popular: false,
    },
    {
        id: 'recuerdo',
        name: 'Pack Recuerdo',
        subtitle: 'El más elegido',
        items: ['Pack Esencial', '2 Orlas A4', '1 Retrato extra', 'Descarga Digital HD'],
        price: 25.00,
        cost: 9.33,
        popular: true,
    },
    {
        id: 'premium',
        name: 'Pack Premium',
        subtitle: 'Experiencia completa',
        items: ['Pack Recuerdo', 'Cuadro Foam 20×25', 'Imán de nevera'],
        price: 35.00,
        cost: 22.91,
        popular: false,
    },
];

export const EXTRAS = [
    { id: 'orla_a3_extra', name: 'Copia Orla A3+', price: 10.00, cost: 3.34, emoji: '🖼️' },
    { id: 'orla_a4_extra', name: 'Copia Orla A4', price: 6.00, cost: 1.84, emoji: '📄' },
    { id: 'retrato_extra', name: 'Retrato 15×20 Extra', price: 5.00, cost: 0.92, emoji: '🧑' },
    { id: 'carnet_extra', name: 'Pack 8 Fotos Carnet', price: 5.00, cost: 0.47, emoji: '💳' },
    { id: 'foam_extra', name: 'Cuadro Foam 20×25', price: 20.00, cost: 11.79, emoji: '🎨' },
    { id: 'iman_extra', name: 'Imán Brillante', price: 6.00, cost: 1.79, emoji: '🧲' },
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
