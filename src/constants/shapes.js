import React from 'react';

export const PHOTO_SHAPES = [
    {
        id: 'circle',
        label: 'Círculo Perfecto',
        preview: (w, h) => {
            const r = Math.min(w, h) * 0.46;
            return `<circle cx="${w/2}" cy="${h/2}" r="${r}" />`;
        },
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            return {
                borderRadius: '50%',
                width: size + 'px',
                height: size + 'px',
                aspectRatio: '1/1',
                objectFit: 'cover',
                margin: '0 auto'
            };
        },
    },
    {
        id: 'oval',
        label: 'Óvalo Clásico',
        preview: (w, h) => `<ellipse cx="${w/2}" cy="${h/2}" rx="${w*0.42}" ry="${h*0.46}" />`,
        getStyle: (w, h) => ({ 
            borderRadius: '50%',
            width: w + 'px',
            height: h + 'px',
            objectFit: 'cover'
        }),
    },
    {
        id: 'rect34',
        label: '3:4 Recto',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="2" />`,
        getStyle: () => ({ borderRadius: '2px' }),
    },
    {
        id: 'rect34r',
        label: '3:4 Redondeado',
        preview: (w, h) => `<rect x="${w*0.08}" y="${h*0.04}" width="${w*0.84}" height="${h*0.92}" rx="${w*0.12}" />`,
        getStyle: (w, h) => ({ borderRadius: `${w * 0.12}px` }),
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
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            const ox = (w - size) / 2;
            const oy = (h - size) / 2;
            return {
                width: size + 'px',
                height: size + 'px',
                margin: '0 auto',
                clipPath: `path('M${size*0.1},${size*0.04} L${size*0.9},${size*0.04} L${size*0.9},${size*0.65} Q${size*0.9},${size*0.85} ${size*0.5},${size*0.96} Q${size*0.1},${size*0.85} ${size*0.1},${size*0.65} Z')`,
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
        getStyle: (w, h) => {
            const size = Math.min(w, h);
            return {
                width: size + 'px',
                height: size + 'px',
                margin: '0 auto',
                clipPath: `path('M${size*0.1},${size*0.96} L${size*0.1},${size*0.48} A${size*0.4},${size*0.48} 0 0,1 ${size*0.9},${size*0.48} L${size*0.9},${size*0.96} Z')`,
            };
        },
    },
];

export const getShapeStyle = (shapeId, w, h) => {
    const s = PHOTO_SHAPES.find(x => x.id === shapeId) || PHOTO_SHAPES[2]; // default rect34
    const base = s.getStyle(w, h);
    const extra = s.extraStyle ? s.extraStyle(w, h) : {};
    return { ...base, ...extra };
};
