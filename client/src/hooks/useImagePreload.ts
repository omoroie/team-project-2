import { useState, useEffect, useCallback } from 'react';

interface ImageCache {
  [key: string]: {
    status: 'loading' | 'loaded' | 'error';
    src: string;
  };
}

// 전역 이미지 캐시
const imageCache: ImageCache = {};

export function useImagePreload(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((url: string) => {
    if (imageCache[url]) {
      if (imageCache[url].status === 'loaded') {
        setLoadedImages(prev => new Set(prev).add(url));
      }
      return;
    }

    // 이미 로딩 중인 이미지는 건너뛰기
    if (loadingImages.has(url)) return;

    setLoadingImages(prev => new Set(prev).add(url));
    imageCache[url] = { status: 'loading', src: url };

    const img = new Image();
    
    img.onload = () => {
      imageCache[url].status = 'loaded';
      setLoadedImages(prev => new Set(prev).add(url));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    };

    img.onerror = () => {
      imageCache[url].status = 'error';
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    };

    img.src = url;
  }, [loadingImages]);

  useEffect(() => {
    // 화면에 보이는 이미지들만 프리로드
    const visibleImages = imageUrls.slice(0, 20); // 처음 20개만
    visibleImages.forEach(preloadImage);
  }, [imageUrls, preloadImage]);

  return {
    loadedImages,
    loadingImages,
    isImageLoaded: (url: string) => loadedImages.has(url),
    isImageLoading: (url: string) => loadingImages.has(url),
    preloadImage
  };
} 