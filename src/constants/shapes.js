import React from 'react';

export const PHOTO_SHAPES = [
    {
        id: 'circle',
        label: 'Círculo Perfecto',
        preview: (w, h) => {
            const r = Math.min(w, h) * 0.46;
            return `<circle cx="${w/2}" cy="${h/2}" r="${r}" />`;
        },
        getStyle: () => ({
            borderRadius: '50%',
            objectFit: 'cover',
            width: '100%',
            height: '100%'
        }),
    },
    {
        id: 'oval',
        label: 'Óvalo Clásico',
        preview: (w, h) => `<ellipse cx="${w/2}" cy="${h/2}" rx="${w*0.42}" ry="${h*0.46}" />`,
        getStyle: () => ({ 
            borderRadius: '50%',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        }),
    },
    {
        id: 'rect34',
        label: '3:4 Recto',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="2" />`,
        getStyle: () => ({ 
            borderRadius: '4px',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        }),
    },
    {
        id: 'rect34r',
        label: '3:4 Redondeado',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="${w*0.12}" />`,
        getStyle: () => ({ 
            borderRadius: '12%',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        }),
    },
    {
        id: 'shield',
        label: 'Escudo Heráldico',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            return `<path d="M${ox + s*0.1},${oy + s*0.04} L${ox + s*0.9},${oy + s*0.04} L${ox + s*0.9},${oy + s*0.65} Q${ox + s*0.9},${oy + s*0.85} ${ox + s*0.5},${oy + s*0.96} Q${ox + s*0.1},${oy + s*0.85} ${ox + s*0.1},${oy + s*0.65} Z" />`;
        },
        getStyle: () => {
            const svgPath = "M10,4 L90,4 L90,65 Q90,85 50,96 Q10,85 10,65 Z";
            const mask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='${svgPath}' fill='black'/%3E%3C/svg%3E")`;
            return {
                width: '100%',
                height: '100%',
                WebkitMaskImage: mask,
                maskImage: mask,
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                objectFit: 'cover'
            };
        },
    },
    {
        id: 'arch',
        label: 'Arco Medio Punto',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            return `<path d="M${ox + s*0.1},${oy + s*0.96} L${ox + s*0.1},${oy + s*0.48} A${s*0.4},${s*0.48} 0 0,1 ${ox + s*0.9},${oy + s*0.48} L${ox + s*0.9},${oy + s*0.96} Z" />`;
        },
        getStyle: () => {
            // Path normalized for 100x100
            const svgPath = "M10,96 L10,48 A40,48 0 0,1 90,48 L90,96 Z";
            const mask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='${svgPath}' fill='black'/%3E%3C/svg%3E")`;
            return {
                width: '100%',
                height: '100%',
                WebkitMaskImage: mask,
                maskImage: mask,
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                objectFit: 'cover'
            };
        },
    },
    {
        id: 'square',
        label: 'Cuadrado Redondeado',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            const rx = s * 0.12;
            return `<rect x="${ox + s*0.06}" y="${oy + s*0.06}" width="${s*0.88}" height="${s*0.88}" rx="${rx}" />`;
        },
        getStyle: () => ({
            borderRadius: '12%',
            objectFit: 'cover',
            width: '100%',
            height: '100%'
        }),
    },
    {
        id: 'squarer',
        label: 'Cuadrado Recto',
        preview: (w, h) => {
            const s = Math.min(w, h);
            const ox = (w - s) / 2;
            const oy = (h - s) / 2;
            return `<rect x="${ox + s*0.06}" y="${oy + s*0.06}" width="${s*0.88}" height="${s*0.88}" rx="2" />`;
        },
        getStyle: () => ({
            borderRadius: '3px',
            objectFit: 'cover',
            width: '100%',
            height: '100%'
        }),
    },
];

export const getShapeStyle = (shapeId, w, h) => {
    const s = PHOTO_SHAPES.find(x => x.id === shapeId) || PHOTO_SHAPES[0];
    return s.getStyle(w, h);
};
