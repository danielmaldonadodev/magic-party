// components/ImageFallback.jsx
import React, { useState, useMemo } from 'react';

export default function ImageFallback({
  src,
  alt = '',
  fallback = '/placeholder-card.svg', // pon aquí tu fallback (o crea uno simple en /public)
  className,
  width,
  height,
  ...props
}) {
  const [error, setError] = useState(false);

  const finalSrc = useMemo(() => {
    if (!src || error) return fallback;
    return src;
  }, [src, error, fallback]);

  return (
    // usamos <img> estándar para evitar configuraciones extra
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
