// Resource hints for performance optimization

interface ResourceHintOptions {
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document'
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  priority?: 'high' | 'low' | 'auto'
}

class ResourceHintManager {
  private addedHints = new Set<string>()

  // DNS Prefetch - Resolve DNS early
  dnsPrefetch(origin: string) {
    if (this.addedHints.has(`dns-prefetch:${origin}`)) return
    
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = origin
    document.head.appendChild(link)
    this.addedHints.add(`dns-prefetch:${origin}`)
  }

  // Preconnect - Establish connection early (DNS + TCP + TLS)
  preconnect(origin: string, crossOrigin?: 'anonymous' | 'use-credentials') {
    if (this.addedHints.has(`preconnect:${origin}`)) return
    
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    if (crossOrigin) {
      link.crossOrigin = crossOrigin
    }
    document.head.appendChild(link)
    this.addedHints.add(`preconnect:${origin}`)
  }

  // Prefetch - Download resource for future navigation
  prefetch(url: string, options?: ResourceHintOptions) {
    if (this.addedHints.has(`prefetch:${url}`)) return
    
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    if (options?.as) {
      link.as = options.as
    }
    if (options?.type) {
      link.type = options.type
    }
    if (options?.crossOrigin) {
      link.crossOrigin = options.crossOrigin
    }
    document.head.appendChild(link)
    this.addedHints.add(`prefetch:${url}`)
  }

  // Preload - Download resource for current navigation
  preload(url: string, options: ResourceHintOptions) {
    if (this.addedHints.has(`preload:${url}`)) return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    if (options.as) {
      link.as = options.as
    }
    if (options.type) {
      link.type = options.type
    }
    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin
    }
    document.head.appendChild(link)
    this.addedHints.add(`preload:${url}`)
  }

  // Module Preload - Preload ES modules
  modulePreload(url: string) {
    if (this.addedHints.has(`modulepreload:${url}`)) return
    
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = url
    document.head.appendChild(link)
    this.addedHints.add(`modulepreload:${url}`)
  }

  // Prefetch on user interaction
  prefetchOnHover(element: HTMLElement, url: string, options?: ResourceHintOptions) {
    let prefetchTimer: NodeJS.Timeout | null = null
    
    const startPrefetch = () => {
      prefetchTimer = setTimeout(() => {
        this.prefetch(url, options)
      }, 100) // Small delay to avoid prefetching on accidental hover
    }
    
    const cancelPrefetch = () => {
      if (prefetchTimer) {
        clearTimeout(prefetchTimer)
        prefetchTimer = null
      }
    }
    
    element.addEventListener('mouseenter', startPrefetch)
    element.addEventListener('mouseleave', cancelPrefetch)
    element.addEventListener('touchstart', startPrefetch, { passive: true })
    
    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', startPrefetch)
      element.removeEventListener('mouseleave', cancelPrefetch)
      element.removeEventListener('touchstart', startPrefetch)
      cancelPrefetch()
    }
  }

  // Batch prefetch multiple resources
  batchPrefetch(urls: string[], options?: ResourceHintOptions) {
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        urls.forEach(url => this.prefetch(url, options))
      }, { timeout: 2000 })
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        urls.forEach(url => this.prefetch(url, options))
      }, 1000)
    }
  }

  // Smart prefetch based on connection type
  smartPrefetch(url: string, options?: ResourceHintOptions) {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      // Don't prefetch on slow connections or data saver mode
      if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return
      }
      
      // Prefetch immediately on fast connections
      if (connection.effectiveType === '4g') {
        this.prefetch(url, options)
        return
      }
    }
    
    // Default behavior - prefetch after a delay
    setTimeout(() => this.prefetch(url, options), 3000)
  }
}

// Singleton instance
let resourceHintManager: ResourceHintManager | null = null

export function getResourceHintManager(): ResourceHintManager {
  if (!resourceHintManager && typeof window !== 'undefined') {
    resourceHintManager = new ResourceHintManager()
  }
  return resourceHintManager || new ResourceHintManager()
}

// Utility functions for common use cases
export function setupCommonResourceHints() {
  if (typeof window === 'undefined') return
  
  const manager = getResourceHintManager()
  
  // Common third-party origins
  manager.dnsPrefetch('https://fonts.googleapis.com')
  manager.dnsPrefetch('https://accounts.google.com')
  manager.preconnect('https://fonts.gstatic.com', 'anonymous')
  
  // Prefetch next likely navigation targets
  const links = document.querySelectorAll('a[href^="/"]')
  links.forEach(link => {
    if (link instanceof HTMLAnchorElement) {
      const href = link.getAttribute('href')
      if (href && !href.includes('#') && !href.includes('?')) {
        manager.prefetchOnHover(link, href)
      }
    }
  })
}

// React hook for resource hints
export function useResourceHints() {
  const prefetch = (url: string, options?: ResourceHintOptions) => {
    if (typeof window !== 'undefined') {
      getResourceHintManager().prefetch(url, options)
    }
  }
  
  const preload = (url: string, options: ResourceHintOptions) => {
    if (typeof window !== 'undefined') {
      getResourceHintManager().preload(url, options)
    }
  }
  
  const preconnect = (origin: string, crossOrigin?: 'anonymous' | 'use-credentials') => {
    if (typeof window !== 'undefined') {
      getResourceHintManager().preconnect(origin, crossOrigin)
    }
  }
  
  return { prefetch, preload, preconnect }
}