'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

// Shimmer effect for loading state
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  quality = 75,
  sizes,
  fill = false,
  style,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const _handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const _handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate blur data URL if not provided
  const _dataUrl =
    blurDataURL ||
    `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
      >
        <svg
          className='w-12 h-12 text-gray-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
          />
        </svg>
      </div>
    );
  }

  const imageProps = fill ? { fill: true } : { width, height };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={dataUrl}
        sizes={
          sizes ||
          `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
        }
        style={{
          objectFit,
          ...style,
        }}
        className={`duration-700 ease-in-out ${
          isLoading
            ? 'scale-110 blur-sm grayscale'
            : 'scale-100 blur-0 grayscale-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Preload critical images
export function preloadImage(src: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
}

// Lazy load images with Intersection Observer
export function useLazyLoadImages(threshold = 0.1) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    },
    {
      threshold,
    }
  );

  images.forEach(img => imageObserver.observe(img));
}
