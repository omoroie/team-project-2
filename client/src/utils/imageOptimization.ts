// 이미지 최적화 유틸리티 함수들

/**
 * 이미지 URL을 최적화된 형태로 변환
 * @param originalUrl 원본 이미지 URL
 * @param width 원하는 너비
 * @param height 원하는 높이
 * @param quality 품질 (1-100)
 * @returns 최적화된 이미지 URL
 */
export function optimizeImageUrl(
  originalUrl: string, 
  width?: number, 
  height?: number, 
  quality: number = 80
): string {
  if (!originalUrl) return '';
  
  // 외부 이미지 URL인 경우
  if (originalUrl.includes('recipe1.ezmember.co.kr')) {
    // 이미지 크기 최적화를 위한 파라미터 추가
    const url = new URL(originalUrl);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    
    return url.toString();
  }
  
  return originalUrl;
}

/**
 * 이미지 프리로딩을 위한 URL 생성
 * @param url 원본 URL
 * @returns 프리로딩용 URL
 */
export function getPreloadUrl(url: string): string {
  return optimizeImageUrl(url, 400, 300, 60); // 낮은 품질로 빠른 로딩
}

/**
 * 썸네일용 이미지 URL 생성
 * @param url 원본 URL
 * @returns 썸네일 URL
 */
export function getThumbnailUrl(url: string): string {
  return optimizeImageUrl(url, 200, 150, 70);
}

/**
 * 고화질 이미지 URL 생성
 * @param url 원본 URL
 * @returns 고화질 URL
 */
export function getHighQualityUrl(url: string): string {
  return optimizeImageUrl(url, 800, 600, 90);
}

/**
 * 이미지 로딩 우선순위 결정
 * @param index 이미지 인덱스
 * @param total 총 이미지 개수
 * @returns 우선순위 (true: 높음, false: 낮음)
 */
export function shouldPrioritizeImage(index: number, total: number): boolean {
  // 첫 8개 이미지는 우선순위 높음
  return index < 8;
}

/**
 * 이미지 크기별 URL 매핑
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 150, quality: 70 },
  card: { width: 400, height: 300, quality: 80 },
  detail: { width: 800, height: 600, quality: 90 },
  full: { width: 1200, height: 900, quality: 95 }
} as const;

/**
 * 이미지 크기별 URL 생성
 * @param originalUrl 원본 URL
 * @param size 이미지 크기 타입
 * @returns 최적화된 URL
 */
export function getImageUrlBySize(
  originalUrl: string, 
  size: keyof typeof IMAGE_SIZES
): string {
  const config = IMAGE_SIZES[size];
  return optimizeImageUrl(originalUrl, config.width, config.height, config.quality);
} 