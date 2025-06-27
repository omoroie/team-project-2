import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { BestRecipes } from '@/components/BestRecipes';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { recipeAPI } from '@/lib/apiClient';

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

export default function Home() {
  const { t } = useLanguage();

  const { data: bestRecipes = [], isLoading: bestRecipesLoading } = useQuery({
    queryKey: ['best-recipes'],
    queryFn: async () => {
      try {
        const response = await recipeAPI.getBest();
        console.log('Best recipes response:', response.data);
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        } else if (data && Array.isArray(data.recipes)) {
          return data.recipes;
        } else if (data && Array.isArray(data.data)) {
          return data.data;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch best recipes:', error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      try {
        const response = await recipeAPI.getAll();
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        } else if (data && Array.isArray(data.recipes)) {
          return data.recipes;
        } else if (data && Array.isArray(data.data)) {
          return data.data;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return [];
      }
    },
    retry: 1,
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

  return (
    <div>
      <Hero />
      
      {/* 베스트 레시피 섹션 */}
      {bestRecipesLoading ? (
        <div className="py-16 text-center">
          <div className="text-lg">베스트 레시피를 불러오는 중...</div>
        </div>
      ) : bestRecipes.length > 0 ? (
        <BestRecipes recipes={bestRecipes.map((recipe: any, index: number) => ({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description || '',
          imageUrl: recipe.imageUrl || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
          cookingTime: recipe.cookingTime || 30,
          servings: recipe.servings || 2,
          difficulty: recipe.difficulty || 'MEDIUM',
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 100) + 10,
          viewCount: recipe.viewCount || 0,
          author: {
            name: `요리사${recipe.writerId}`,
            avatar: undefined
          },
          ranking: index + 1,
          isVideo: false
        }))} />
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
        />
      )}
    </div>
  );
}
