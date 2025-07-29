/**
 * Resource optimization utilities for critical path performance
 */

// Critical resource preloading
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return

  const head = document.head

  // Preload critical fonts
  const preloadFont = (href: string, type = 'font/woff2') => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'font'
    link.type = type
    link.crossOrigin = 'anonymous'
    head.appendChild(link)
  }

  // Preload critical CSS
  const preloadCSS = (href: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'style'
    head.appendChild(link)
  }

  // Preload critical JavaScript
  const preloadJS = (href: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = 'script'
    head.appendChild(link)
  }

  // DNS prefetch for external domains
  const dnsPrefetch = (href: string) => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = href
    head.appendChild(link)
  }

  // Preconnect for critical external resources
  const preconnect = (href: string, crossorigin = false) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    if (crossorigin) link.crossOrigin = 'anonymous'
    head.appendChild(link)
  }

  // Critical external resources
  preconnect('https://accounts.google.com')
  preconnect('https://www.googleapis.com')
  preconnect('https://oauth2.googleapis.com')
  preconnect('https://fonts.googleapis.com')
  preconnect('https://fonts.gstatic.com', true)

  // DNS prefetch for additional domains
  dnsPrefetch('https://lh3.googleusercontent.com')
  dnsPrefetch('https://ssl.gstatic.com')
}

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    })

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, refresh
            if (confirm('New version available. Refresh to update?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    console.log('Service Worker registered successfully')
    return true
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return false
  }
}

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  if (typeof window === 'undefined') return

  // Critical CSS for above-the-fold content
  const criticalCSS = `
    /* Critical styles for initial render */
    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .critical-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .critical-header {
      height: 64px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .critical-content {
      flex: 1;
      padding: 1rem;
    }
  `

  const style = document.createElement('style')
  style.textContent = criticalCSS
  document.head.insertBefore(style, document.head.firstChild)
}

// Resource loading optimization
export class ResourceOptimizer {
  private static instance: ResourceOptimizer
  private loadedResources = new Set<string>()
  private loadingPromises = new Map<string, Promise<void>>()

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer()
    }
    return ResourceOptimizer.instance
  }

  // Lazy load images with intersection observer
  lazyLoadImages(selector = 'img[data-src]'): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const images = document.querySelectorAll(selector)
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px'
    })

    images.forEach(img => imageObserver.observe(img))
  }

  // Progressive image loading
  async loadImageProgressive(src: string, placeholder?: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => resolve(img)
      img.onerror = reject
      
      // Load placeholder first if provided
      if (placeholder) {
        const placeholderImg = new Image()
        placeholderImg.onload = () => {
          // Start loading main image
          img.src = src
        }
        placeholderImg.src = placeholder
      } else {
        img.src = src
      }
    })
  }

  // Batch resource loading
  async loadResourcesBatch(resources: string[]): Promise<void[]> {
    const batchSize = 3 // Load 3 resources at a time
    const results: Promise<void>[] = []

    for (let i = 0; i < resources.length; i += batchSize) {
      const batch = resources.slice(i, i + batchSize)
      const batchPromises = batch.map(resource => this.loadResource(resource))
      results.push(...batchPromises)
      
      // Wait for current batch before starting next
      await Promise.allSettled(batchPromises)
    }

    return Promise.all(results)
  }

  // Load individual resource with caching
  async loadResource(url: string): Promise<void> {
    if (this.loadedResources.has(url)) {
      return Promise.resolve()
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      if (url.endsWith('.js')) {
        this.loadScript(url).then(resolve).catch(reject)
      } else if (url.endsWith('.css')) {
        this.loadStylesheet(url).then(resolve).catch(reject)
      } else {
        // Assume it's an image or other resource
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      }
    })

    this.loadingPromises.set(url, loadPromise)
    
    try {
      await loadPromise
      this.loadedResources.add(url)
    } finally {
      this.loadingPromises.delete(url)
    }

    return loadPromise
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  private loadStylesheet(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    })
  }
}

// Web Vitals optimization
export const optimizeWebVitals = () => {
  if (typeof window === 'undefined') return

  // Optimize LCP (Largest Contentful Paint)
  const optimizeLCP = () => {
    // Preload LCP image
    const hero = document.querySelector('[data-lcp]') as HTMLImageElement
    if (hero && hero.src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = hero.src
      document.head.appendChild(link)
    }

    // Remove render-blocking resources
    const deferCSS = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = 'style'
      link.onload = () => {
        link.rel = 'stylesheet'
      }
      document.head.appendChild(link)
    }

    // Defer non-critical CSS
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]')
    nonCriticalCSS.forEach(link => {
      const href = (link as HTMLLinkElement).href
      link.remove()
      deferCSS(href)
    })
  }

  // Optimize CLS (Cumulative Layout Shift)
  const optimizeCLS = () => {
    // Add size attributes to images
    const images = document.querySelectorAll('img:not([width]):not([height])')
    images.forEach(img => {
      const element = img as HTMLImageElement
      if (element.naturalWidth && element.naturalHeight) {
        element.width = element.naturalWidth
        element.height = element.naturalHeight
      }
    })

    // Reserve space for dynamic content
    const reserveSpace = (selector: string, height: number) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        (el as HTMLElement).style.minHeight = `${height}px`
      })
    }

    reserveSpace('[data-dynamic]', 200)
  }

  // Optimize FID (First Input Delay)
  const optimizeFID = () => {
    // Break up long tasks
    const breakUpLongTasks = (tasks: Function[]) => {
      const runTask = (index: number) => {
        if (index >= tasks.length) return
        
        tasks[index]()
        
        if (index < tasks.length - 1) {
          setTimeout(() => runTask(index + 1), 0)
        }
      }
      
      runTask(0)
    }

    // Use scheduler if available
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      const scheduler = (window as any).scheduler
      
      const scheduleTask = (task: Function, priority = 'user-blocking') => {
        scheduler.postTask(task, { priority })
      }
      
      // Export for use in components
      ;(window as any).scheduleTask = scheduleTask
    }
  }

  // Run optimizations
  optimizeLCP()
  optimizeCLS()
  optimizeFID()
}

// Initialize all optimizations
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return

  // Run immediately
  preloadCriticalResources()
  inlineCriticalCSS()
  optimizeWebVitals()

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const optimizer = ResourceOptimizer.getInstance()
      optimizer.lazyLoadImages()
    })
  } else {
    const optimizer = ResourceOptimizer.getInstance()
    optimizer.lazyLoadImages()
  }

  // Register service worker
  if (document.readyState === 'complete') {
    registerServiceWorker()
  } else {
    window.addEventListener('load', registerServiceWorker)
  }
}

// Performance budget monitoring
export const monitorPerformanceBudget = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  const budgets = {
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    fcp: 1800, // 1.8s
    ttfb: 600  // 600ms
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      let metric: keyof typeof budgets | null = null
      let value: number = 0

      switch (entry.entryType) {
        case 'largest-contentful-paint':
          metric = 'lcp'
          value = entry.startTime
          break
        case 'first-input':
          metric = 'fid'
          value = (entry as PerformanceEventTiming).processingStart - entry.startTime
          break
        case 'layout-shift':
          const clsEntry = entry as any
          if (!clsEntry.hadRecentInput) {
            metric = 'cls'
            value = clsEntry.value
          }
          break
        case 'paint':
          if (entry.name === 'first-contentful-paint') {
            metric = 'fcp'
            value = entry.startTime
          }
          break
        case 'navigation':
          const navEntry = entry as PerformanceNavigationTiming
          metric = 'ttfb'
          value = navEntry.responseStart - navEntry.requestStart
          break
      }

      if (metric && budgets[metric] && value > budgets[metric]) {
        console.warn(`Performance budget exceeded: ${metric} = ${value}, budget = ${budgets[metric]}`)
        
        // Report to monitoring
        if ((window as any).metricsCollector) {
          (window as any).metricsCollector.increment('performance_budget_exceeded', 1, {
            metric,
            value: value.toString(),
            budget: budgets[metric].toString()
          })
        }
      }
    }
  })

  observer.observe({ 
    entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] 
  })
}