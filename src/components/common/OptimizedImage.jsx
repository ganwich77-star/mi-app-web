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
    // Si la imagen es externa (contiene http) o ya es webp, no intentamos forzar webp local
    // También evitamos URLs con parámetros de consulta (?q=...) que rompen la sustitución simple
    const isExternal = src.startsWith('http');
    const isWebP = src.toLowerCase().includes('.webp');
    const hasSearchParams = src.includes('?');
    
    // Solo intentamos generar ruta webp si es local y no tiene parámetros especiales
    const webpSrc = (!isExternal && !isWebP && !hasSearchParams) 
        ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        : src;

    return (
        <picture className={className}>
            {(!isExternal && !isWebP && !hasSearchParams) && <source srcSet={webpSrc} type="image/webp" />}
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
