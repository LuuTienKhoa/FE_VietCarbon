import { useEffect, useRef } from 'react';

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Log slow operations
      if (duration > 100) {
        console.warn(`🐌 Slow operation: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getMetrics(label?: string): Record<string, any> {
    if (label) {
      const values = this.metrics.get(label) || [];
      return {
        [label]: {
          count: values.length,
          average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
          min: values.length > 0 ? Math.min(...values) : 0,
          max: values.length > 0 ? Math.max(...values) : 0,
        },
      };
    }

    const result: Record<string, any> = {};
    this.metrics.forEach((values, key) => {
      result[key] = {
        count: values.length,
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
      };
    });
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(label: string) {
  const monitor = PerformanceMonitor.getInstance();
  const timingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    timingRef.current = monitor.startTiming(label);
    
    return () => {
      if (timingRef.current) {
        timingRef.current();
      }
    };
  }, [label, monitor]);

  return {
    endTiming: () => {
      if (timingRef.current) {
        timingRef.current();
        timingRef.current = null;
      }
    },
  };
}

// Component render performance hook
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }
    
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
}

// Memory usage monitoring
export function useMemoryMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMB = memory.totalJSHeapSize / 1024 / 1024;
        
        if (usedMB > 50) { // More than 50MB
          console.warn(`🧠 High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);
}

// Bundle size analyzer (for development)
export function analyzeBundleSize() {
  if (__DEV__) {
    const modules = Object.keys(require.cache);
    const moduleSizes = modules.map(module => ({
      name: module,
      size: module.length, // Approximate size
    })).sort((a, b) => b.size - a.size);

    console.log('📦 Largest modules:', moduleSizes.slice(0, 10));
  }
}
