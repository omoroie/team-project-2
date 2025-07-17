import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RecipeCard } from '@/components/RecipeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@shared/schema';
import { Search, Plus, Filter, Clock, Users, ChefHat, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { recipeAPI } from '@/lib/apiClient';
import { useImagePreload } from '@/hooks/useImagePreload';

export default function Recipes() {
  const { t } = useLanguage();
  const { state } = useApp();
  const [location] = useLocation();
  
  // URL 파라미터에서 검색어 추출
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialSearch = urlParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDifficulty, setSelectedDifficulty] = useState(t('all'));
  const [selectedTime, setSelectedTime] = useState(t('all'));
  const [selectedIngredient, setSelectedIngredient] = useState(t('all'));
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20); // 페이지당 20개씩 로드
  
  // URL 검색어가 변경되면 상태 업데이트
  useEffect(() => {
    const newSearch = urlParams.get('search') || '';
    setSearchQuery(newSearch);
    setCurrentPage(0); // 검색어 변경시 첫 페이지로
  }, [location]);

  // 페이징된 레시피 데이터 로드
  const { data: recipeResponse, isLoading } = useQuery({
    queryKey: ['recipes', currentPage, pageSize, searchQuery, selectedDifficulty, selectedTime, selectedIngredient],
    queryFn: async () => {
      try {
        // 검색어가 있으면 검색 API 사용, 없으면 페이징된 전체 데이터 사용
        if (searchQuery.trim()) {
          const response = await recipeAPI.search(searchQuery);
          return {
            recipes: response.data.recipes || response.data.data || [],
            currentPage: 0,
            totalPages: 1,
            totalElements: (response.data.recipes || response.data.data || []).length,
            size: pageSize
          };
        } else {
          const response = await recipeAPI.getAllPaged({ 
            page: currentPage, 
            size: pageSize 
          });
          return {
            recipes: response.data.recipes || response.data.data || [],
            currentPage: response.data.currentPage || 0,
            totalPages: response.data.totalPages || 1,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || pageSize
          };
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return {
          recipes: [],
          currentPage: 0,
          totalPages: 1,
          totalElements: 0,
          size: pageSize
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });

  const recipes = recipeResponse?.recipes || [];
  const totalPages = recipeResponse?.totalPages || 1;
  const totalElements = recipeResponse?.totalElements || 0;

  // 이미지 프리로딩
  const imageUrls = useMemo(() => {
    return recipes
      .map(recipe => recipe.imageUrl)
      .filter(Boolean) as string[];
  }, [recipes]);

  const { isImageLoaded, isImageLoading } = useImagePreload(imageUrls);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터링된 레시피 (클라이언트 사이드 필터링은 최소화)
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // 난이도 필터링
    if (selectedDifficulty !== t('all')) {
      filtered = filtered.filter(recipe => {
        const difficultyMap: Record<string, string> = {
          [t('easy')]: 'EASY',
          [t('medium')]: 'MEDIUM', 
          [t('hard')]: 'HARD'
        };
        return recipe.difficulty === difficultyMap[selectedDifficulty];
      });
    }

    // 조리시간 필터링
    if (selectedTime !== t('all')) {
      filtered = filtered.filter(recipe => {
        const time = recipe.cookingTime;
        switch (selectedTime) {
          case '15분 이하':
          case 'Under 15 min':
            return time <= 15;
          case '30분 이하':
          case 'Under 30 min':
            return time <= 30;
          case '1시간 이하':
          case 'Under 1 hour':
            return time <= 60;
          case '1시간 이상':
          case 'Over 1 hour':
            return time > 60;
          default:
            return true;
        }
      });
    }

    // 재료별 필터링
    if (selectedIngredient !== t('all')) {
      filtered = filtered.filter(recipe => {
        return recipe.ingredients?.some(ingredient => 
          ingredient.ingredientName.toLowerCase().includes(selectedIngredient.toLowerCase())
        ) || 
        recipe.title.toLowerCase().includes(selectedIngredient.toLowerCase()) ||
        recipe.description.toLowerCase().includes(selectedIngredient.toLowerCase());
      });
    }

    return filtered;
  }, [recipes, selectedDifficulty, selectedTime, selectedIngredient, t]);

  // 필터 옵션들
  const difficultyOptions = [t('all'), t('easy'), t('medium'), t('hard')];
  const timeOptions = [
    t('all'), 
    '15분 이하', '30분 이하', '1시간 이하', '1시간 이상'
  ];
  const ingredientOptions = [
    t('all'), '소고기', '돼지고기', '닭고기', '생선', '두부', '버섯', '채소', '김치'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('recipes')}
            </h1>
            <p className="text-muted-foreground">
              맛있는 레시피를 찾아보세요
            </p>
          </div>
          
          {state.isAuthenticated && (
            <Link href="/recipes/create">
              <Button className="recipe-gradient text-white">
                <Plus className="mr-2 h-4 w-4" />
                레시피 등록
              </Button>
            </Link>
          )}
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          {/* 검색바 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t('searchRecipes')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 토글 버튼 */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('filter')}
          </Button>

          {/* 필터 옵션들 */}
          {showFilters && (
            <div className="space-y-4">
              {/* 난이도 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <ChefHat className="mr-2 h-4 w-4" />
                  {t('difficulty')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {difficultyOptions.map((difficulty) => (
                    <Badge
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                      className={`cursor-pointer hover:bg-primary/10 ${
                        selectedDifficulty === difficulty 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 조리시간 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {t('cookingTime')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map((time) => (
                    <Badge
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      className={`cursor-pointer hover:bg-primary/10 ${
                        selectedTime === time 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 재료별 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {t('ingredientFilter')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ingredientOptions.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant={selectedIngredient === ingredient ? 'default' : 'outline'}
                      className={`cursor-pointer hover:bg-primary/10 ${
                        selectedIngredient === ingredient 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setSelectedIngredient(ingredient)}
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 결과 카운트 */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            총 {totalElements}개의 레시피 중 {filteredRecipes.length}개 표시
            {searchQuery && ` "${searchQuery}" 검색 결과`}
          </p>
        </div>

        {/* 레시피 그리드 */}
        {filteredRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* 페이징 컨트롤 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('noResults')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '조건에 맞는 레시피가 없습니다.'}
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty(t('all'));
              setSelectedTime(t('all'));
              setSelectedIngredient(t('all'));
              setCurrentPage(0);
            }}>
              필터 초기화
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}