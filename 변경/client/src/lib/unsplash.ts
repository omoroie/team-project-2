const UNSPLASH_ACCESS_KEY = process.env.VITE_UNSPLASH_ACCESS_KEY || 'your-unsplash-access-key';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
}

export async function searchUnsplashImages(query: string, count: number = 12): Promise<UnsplashImage[]> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
}

export function getPlaceholderImage(width: number = 400, height: number = 300): string {
  return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=${width}&h=${height}&fit=crop&crop=center`;
}
