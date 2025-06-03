import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { BestRecipes } from '@/components/BestRecipes';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Recipe, Ingredient } from '@shared/schema';
import { recipeAPI } from '@/lib/apiClient';

export default function Home() {
  const { t } = useLanguage();

  const { data: bestRecipes = [], isLoading: bestRecipesLoading } = useQuery({
    queryKey: ['best-recipes'],
    queryFn: async () => {
      try {
        const response = await recipeAPI.getBest();
        console.log('Best recipes response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch best recipes:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
  });

  // Transform data for ProductGrid component
  const recipeProducts = recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
    type: 'recipe' as const,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
  }));

  const ingredientProducts = ingredients.map(ingredient => ({
    id: ingredient.id,
    title: ingredient.name,
    description: ingredient.description,
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
