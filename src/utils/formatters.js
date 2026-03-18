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

// 3. Obtener la base del curso (sin el grupo A, B, C...)
export const getCourseBase = (name = '') => {
    if (!name) return '';
    const parts = name.split(' ');
    const last = parts[parts.length - 1];
    const isGroupChar = last.length === 1 && last === last.toUpperCase() && isNaN(last);
    return isGroupChar ? parts.slice(0, -1).join(' ') : name;
};

// 4. Obtener la letra del grupo (A, B, C...)
export const getGroup = (name = '') => {
    if (!name) return '';
    const parts = name.split(' ');
    const last = parts[parts.length - 1];
    return (last.length === 1 && last === last.toUpperCase() && isNaN(last)) ? last : '';
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
