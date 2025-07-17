import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Link } from 'wouter';
import { Recipe } from '@shared/schema';
import { useState } from 'react';
import { getImageUrlBySize } from '@/utils/imageOptimization';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center';
  const originalImageUrl = imageError ? fallbackImage : (recipe.imageUrl || fallbackImage);
  const imageUrl = getImageUrlBySize(originalImageUrl, 'card');

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="product-card overflow-hidden group cursor-pointer">
        <div className="aspect-video overflow-hidden relative bg-gray-100">
          {/* Skeleton Loading */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Image */}
          <img
            src={imageUrl}
            alt={recipe.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
            {recipe.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 cooking-time-badge">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookingTime}분</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-accent" />
              <span>{recipe.servings}인분</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChefHat className="h-4 w-4 text-primary" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
