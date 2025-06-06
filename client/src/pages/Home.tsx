import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { BestRecipes } from '@/components/BestRecipes';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { recipeAPI, ingredientAPI } from '@/lib/apiClient';

// 타입 정의
interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
}

interface Ingredient {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  unit?: string;
  inStock?: boolean;
}

export default function Home() {
  const { t } = useLanguage();

  const { data: bestRecipes = [], isLoading: bestRecipesLoading } = useQuery({
    queryKey: ['best-recipes'],
    queryFn: async () => {
      return []; // 백엔드 연결 전까지 빈 배열 반환
    },
    enabled: false, // 백엔드가 준비될 때까지 비활성화
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      return []; // 백엔드 연결 전까지 빈 배열 반환
    },
    enabled: false, // 백엔드가 준비될 때까지 비활성화
  });

  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
    queryFn: async () => {
      return []; // 백엔드 연결 전까지 빈 배열 반환
    },
    enabled: false, // 백엔드가 준비될 때까지 비활성화
  });

  // Transform data for ProductGrid component
  const recipeProducts = recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description || 'No description available',
    imageUrl: recipe.imageUrl || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
    type: 'recipe' as const,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
  }));

  const ingredientProducts = ingredients.map(ingredient => ({
    id: ingredient.id,
    title: ingredient.name,
    description: ingredient.description || 'No description available',
    imageUrl: ingredient.imageUrl || 'https://picsum.photos/400/300?random=' + ingredient.id,
    type: 'ingredient' as const,
    price: ingredient.price,
    unit: ingredient.unit,
    inStock: ingredient.inStock ?? true,
  }));

  return (
    <div>
      <Hero />
      
      {/* 베스트 레시피 섹션 */}
      {bestRecipesLoading ? (
        <div className="py-16 text-center">
          <div className="text-lg">베스트 레시피를 불러오는 중...</div>
        </div>
      ) : bestRecipes.length > 0 ? (
        <BestRecipes recipes={bestRecipes} />
      ) : (
        <div className="py-16 text-center">
          <div className="text-lg">베스트 레시피를 준비 중입니다.</div>
        </div>
      )}
      
      {recipes.length > 0 && (
        <ProductGrid
          title={t('featuredRecipes')}
          products={recipeProducts}
          viewAllHref="/recipes"
          showPrice={false}
        />
      )}

      {ingredients.length > 0 && (
        <ProductGrid
          title={t('freshIngredients')}
          products={ingredientProducts}
          viewAllHref="/ingredients"
          showPrice={true}
        />
      )}
    </div>
  );
}
