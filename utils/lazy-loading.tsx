import { Loading } from '@/components/loading';
import React, { ComponentType, Suspense, lazy } from 'react';

// Lazy loading wrapper for screens
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallbackMessage?: string
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<Loading message={fallbackMessage || 'Đang tải...'} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Preload function for critical screens
export function preloadScreen(importFunc: () => Promise<any>) {
  return () => {
    // Preload the screen in the background
    setTimeout(() => {
      importFunc().catch(console.error);
    }, 1000); // Wait 1 second after app start
  };
}

// Screen preloader hook
export function useScreenPreloader() {
  React.useEffect(() => {
    // Preload critical screens
    const preloadCriticalScreens = () => {
      // Preload dashboard
      import('../app/(tabs)/index').catch(console.error);
      
      // Preload track screen
      import('../app/(tabs)/track').catch(console.error);
      
      // Preload suggestions screen
      import('../app/(tabs)/suggestions').catch(console.error);
    };

    // Preload after initial render
    const timer = setTimeout(preloadCriticalScreens, 2000);
    
    return () => clearTimeout(timer);
  }, []);
}
