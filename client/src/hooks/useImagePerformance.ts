import { useState, useEffect, useCallback } from 'react';

interface ImagePerformanceMetrics {
  loadTime: number;
  size: number;
  url: string;
  timestamp: number;
}

interface UseImagePerformanceReturn {
  metrics: ImagePerformanceMetrics[];
  averageLoadTime: number;
  slowImages: ImagePerformanceMetrics[];
  trackImageLoad: (url: string) => void;
  clearMetrics: () => void;
}

export function useImagePerformance(): UseImagePerformanceReturn {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics[]>([]);

  const trackImageLoad = useCallback((url: string) => {
    const startTime = performance.now();
    
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      
      // 이미지 크기 추정 (실제로는 Content-Length 헤더가 필요하지만 여기서는 추정)
      const estimatedSize = 100 * 1024; // 100KB 추정
      
      const metric: ImagePerformanceMetrics = {
        loadTime,
        size: estimatedSize,
        url,
        timestamp: Date.now()
      };
      
      setMetrics(prev => [...prev, metric]);
      
      // 성능 로그
      if (loadTime > 2000) {
        console.warn(`Slow image load detected: ${url} took ${loadTime.toFixed(2)}ms`);
      }
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
    };
    
    img.src = url;
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  const averageLoadTime = metrics.length > 0 
    ? metrics.reduce((sum, metric) => sum + metric.loadTime, 0) / metrics.length 
    : 0;

  const slowImages = metrics.filter(metric => metric.loadTime > 2000);

  // 성능 메트릭 로깅
  useEffect(() => {
    if (metrics.length > 0 && metrics.length % 10 === 0) {
      console.log(`Image Performance Report (${metrics.length} images):`, {
        averageLoadTime: averageLoadTime.toFixed(2) + 'ms',
        slowImagesCount: slowImages.length,
        totalImages: metrics.length
      });
    }
  }, [metrics.length, averageLoadTime, slowImages.length]);

  return {
    metrics,
    averageLoadTime,
    slowImages,
    trackImageLoad,
    clearMetrics
  };
} 