import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import type { Recipe } from '@shared/schema';
import { Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'wouter';

export default function RecipeDetail() {
  const { t } = useLanguage();
  const { id } = useParams();

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      if (!id) throw new Error('Recipe ID is required');
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('레시피를 찾을 수 없습니다');
      }
      const data = await response.json();
      // 백엔드 응답 구조에 따라 레시피 데이터 추출
      if (data.success && data.recipe) {
        return data.recipe;
      } else if (data.recipe) {
        return data.recipe;
      } else if (Array.isArray(data)) {
        return data[0];
      }
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h1>
          <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
          <Link href="/recipes">
            <Button>Back to Recipes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/recipes">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </Link>

        {/* Recipe Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="aspect-video overflow-hidden rounded-lg">
            <img
              src={recipe.imageUrl || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center'}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {recipe.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {recipe.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{recipe.cookingTime}분</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{recipe.servings}인분</span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                <ChefHat className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">{recipe.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>재료</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{ingredient}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">재료 정보가 없습니다.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>조리법</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
                    recipe.instructions.map((instruction: string, index: number) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">{instruction}</p>
                          </div>
                        </div>
                        {/* 조리법 단계별 이미지 */}
                        {recipe.instructionImages && recipe.instructionImages[index] && (
                          <div className="ml-12">
                            <img 
                              src={recipe.instructionImages[index]} 
                              alt={`조리 단계 ${index + 1}`}
                              className="rounded-lg shadow-md max-w-md w-full h-auto"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">조리법 정보가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* 해시태그 섹션 */}
            {recipe.hashtags && recipe.hashtags.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">태그</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recipe.hashtags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
