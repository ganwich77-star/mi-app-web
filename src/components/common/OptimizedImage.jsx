import React from 'react';

/**
 * OptimizedImage Component
 * implements <picture> tag as requested in Fase A, Paso 2.
 * Supports WebP as primary source with fallback to original format.
 */
const OptimizedImage = ({
    src,
    alt = "Orla",
    className = "",
    width,
    height,
    loading = "lazy",
    objectFit = "cover"
}) => {
    // Si la imagen ya es webp, simplemente la mostramos
    const isWebP = src.toLowerCase().endsWith('.webp');
    const webpSrc = isWebP ? src : src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    return (
        <picture className={className}>
            {!isWebP && <source srcSet={webpSrc} type="image/webp" />}
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-${objectFit}`}
                width={width}
                height={height}
                loading={loading}
                onError={(e) => {
                    // Si falla la carga de la imagen (ej: webp inexistente no capturado por <source>)
                    // El navegador ya debería usar el fallback automático, pero podemos añadir logica aquí
                }}
            />
        </picture>
    );
};

export default OptimizedImage;
