import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecipeCard } from '@/components/RecipeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@shared/schema';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { recipeAPI } from '@/lib/apiClient';

export default function Ingredients() {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
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
  });

  // 쉼표 기준 키워드 추출
  const keywords = searchQuery
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  // 필터링된 레시피 (정규화된 재료 구조에 맞춰 수정)
  const filteredRecipes =
  keywords.length === 0
    ? []
    : recipes.filter((recipe) =>
        keywords.every((keyword) =>
          recipe.ingredients?.some((ingredient) => {
            const cleanIngredient = ingredient.ingredientName.toLowerCase();
            return cleanIngredient.includes(keyword);
          })
        )
      );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('ingredients')}</h1>
        </div>

        {/* Input + Button */}
        <div className="flex gap-4 mb-6 max-w-2xl mx-auto">
          <Input
            placeholder="예: 감자, 당근, 우유"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button onClick={() => setSearchQuery(searchInput)}>
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>


        {/* 레시피 카드 출력 */}
        {keywords.length >= 1 && (
          <>

            {isLoading ? (
              <p className="text-center text-gray-500">불러오는 중...</p>
            ) : filteredRecipes.length === 0 ? (
              <p className="text-center text-gray-500">일치하는 레시피가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
