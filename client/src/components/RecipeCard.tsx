import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Link } from 'wouter';
import { Recipe } from '@shared/schema';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // 레시피 ID를 기반으로 한 고유한 이미지 생성
  const getRecipeImage = (recipe: Recipe) => {
    if (recipe.imageUrl) return recipe.imageUrl;
    
    // 레시피 제목에 따른 적절한 음식 이미지
    const imageMap: { [key: string]: string } = {
      '김치찌개': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop',
      '불고기': 'https://images.unsplash.com/photo-1565895405229-71866c7d5bde?w=400&h=300&fit=crop',
      '삼겹살': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
      '된장찌개': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      '비빔밥': 'https://images.unsplash.com/photo-1575932444877-5106bee2a599?w=400&h=300&fit=crop',
      '갈비': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
      '치킨': 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop',
      '볶음밥': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'
    };
    
    // 제목에서 키워드 찾기
    for (const [keyword, imageUrl] of Object.entries(imageMap)) {
      if (recipe.title.includes(keyword)) {
        return imageUrl;
      }
    }
    
    // 기본 한식 이미지들을 순환 사용
    const defaultImages = [
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565895405229-71866c7d5bde?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1575932444877-5106bee2a599?w=400&h=300&fit=crop'
    ];
    
    return defaultImages[recipe.id % defaultImages.length];
  };

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="product-card overflow-hidden group cursor-pointer">
        <div className="aspect-video overflow-hidden">
          <img
            src={getRecipeImage(recipe)}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
