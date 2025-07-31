'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  quality = 75,
  loading = 'lazy',
  unoptimized = false,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate blur placeholder for better UX
  const _generateBlurDataURL = (w: number, h: number) => {
    if (blurDataURL) return blurDataURL;

    // Create a simple base64 blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create gradient blur effect
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    return canvas.toDataURL('image/jpeg', 0.1);
  };

  const _handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const _handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Responsive sizes based on common breakpoints
  const _responsiveSizes =
    sizes ||
    (fill
      ? '100vw'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');

  // Error fallback
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
          <circle cx='9' cy='9' r='2' />
          <path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className='absolute inset-0 bg-gray-200 animate-pulse'
          style={{ width, height }}
        />
      )}

      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={responsiveSizes}
        priority={priority}
        quality={quality}
        loading={loading}
        unoptimized={unoptimized}
        placeholder={placeholder}
        blurDataURL={
          placeholder === 'blur' && width && height
            ? generateBlurDataURL(width, height)
            : undefined
        }
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}

// Avatar component with optimized loading
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: string;
}

export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback,
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials =
    fallback ||
    alt
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-blue-600 text-white font-medium rounded-full',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      quality={90}
      priority={size > 100}
      onError={() => setHasError(true)}
    />
  );
}

// Gallery component with lazy loading
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  imageClassName?: string;
  columns?: number;
}

export function ImageGallery({
  images,
  className,
  imageClassName,
  columns = 3,
}: ImageGalleryProps) {
  return (
    <div
      className={cn(
        `grid gap-4`,
        `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns}`,
        className
      )}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={image.width || 400}
          height={image.height || 300}
          className={cn('rounded-lg', imageClassName)}
          priority={index < 6} // Prioritize first 6 images
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
        />
      ))}
    </div>
  );
}

// Hero image component with optimized loading
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

export function HeroImage({
  src,
  alt,
  className,
  overlay = false,
  children,
}: HeroImageProps) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        quality={85}
        sizes='100vw'
        className='object-cover'
      />

      {overlay && <div className='absolute inset-0 bg-black bg-opacity-40' />}

      {children && (
        <div className='absolute inset-0 flex items-center justify-center'>
          {children}
        </div>
      )}
    </div>
  );
}
