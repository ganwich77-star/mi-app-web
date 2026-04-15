// 1. Primera letra de cada palabra en mayúscula, resto en minúscula
export const toTitleCase = (str) => {
    if (!str) return '';
    const cleanStr = str.trim().replace(/\s+/g, ' ');
    const lowers = ['de', 'la', 'los', 'las', 'del', 'y'];
    return cleanStr.toLowerCase().split(' ').map((word, index) => {
        if (index > 0 && lowers.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

// 2. Obtener el apellido (primera palabra de la segunda parte)
export const firstSurname = (name = '') => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts[1] || parts[0] || '';
};

export const getCourseBase = (name = '') => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length <= 1) return name;
    
    const last = parts[parts.length - 1].toUpperCase();
    // Detecta grupos: A, B, C... o 1ºA, 2ºB... o 1A, 2B...
    const isGroup = /^[0-9º]*[A-Z]$/.test(last) || (last.length === 1 && isNaN(last));
    
    return isGroup ? parts.slice(0, -1).join(' ') : name;
};

export const getGroup = (name = '') => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length <= 1) return '';
    
    const last = parts[parts.length - 1].toUpperCase();
    const isGroup = /^[0-9º]*[A-Z]$/.test(last) || (last.length === 1 && isNaN(last));
    
    return isGroup ? last : '';
};
// 5. Normalizar para comparaciones seguras
export const normalize = (str) => {
    if (!str) return '';
    return str.toString().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ')
        .trim();
};
