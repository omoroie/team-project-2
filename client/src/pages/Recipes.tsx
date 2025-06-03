import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RecipeCard } from '@/components/RecipeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@shared/schema';
import { Search, Plus, Filter } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function Recipes() {
  const { t } = useLanguage();
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');
  const [selectedTime, setSelectedTime] = useState('전체');
  const [selectedDifficulty, setSelectedDifficulty] = useState('전체');

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  // 카테고리 옵션들
  const categories = {
    '종류별': ['전체', '일반한식', '메인반찬', '국/찌개', '찌개', '디저트', '밑반찬', '볶음/구이', '양식', '샐러드', '스프', '볶음', '과자'],
    '상황별': ['전체', '일상', '초스피드', '술안주', '솔로간', '다이어트', '도시락', '영양식', '간식', '야식', '푸드스타일링', '해장', '병행', '아침식', '기타'],
    '재료별': ['전체', '소고기', '돼지고기', '닭고기', '육류', '채소류', '해물류', '달걀/유제품', '가공식품', '쌀', '밀가루', '건어물', '버섯', '과일류', '콩/견과류', '국수', '기타'],
    '방법별': ['전체', '볶음', '끓이기', '부침', '조림', '무침', '비빔', '절임', '튀김', '삶기', '굽기', '데치기', '회', '기타']
  };

  const timeOptions = ['전체', '5분이내', '10분이내', '15분이내', '20분이내', '30분이내', '60분이내', '90분이내', '2시간이내', '2시간이상'];
  const difficultyOptions = ['전체', '아무나', '초급', '중급', '고급'];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '전체' || selectedCategory === recipe.difficulty;
    
    const matchesType = selectedType === '전체';
      
    const matchesTime = selectedTime === '전체' || 
      (selectedTime === '5분이내' && recipe.cookingTime <= 5) ||
      (selectedTime === '10분이내' && recipe.cookingTime <= 10) ||
      (selectedTime === '15분이내' && recipe.cookingTime <= 15) ||
      (selectedTime === '20분이내' && recipe.cookingTime <= 20) ||
      (selectedTime === '30분이내' && recipe.cookingTime <= 30) ||
      (selectedTime === '60분이내' && recipe.cookingTime <= 60) ||
      (selectedTime === '90분이내' && recipe.cookingTime <= 90) ||
      (selectedTime === '2시간이내' && recipe.cookingTime <= 120) ||
      (selectedTime === '2시간이상' && recipe.cookingTime > 120);
      
    const matchesDifficulty = selectedDifficulty === '전체' || 
      recipe.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesType && matchesTime && matchesDifficulty;
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

        {/* 카테고리 필터 */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          {/* 종류별 */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
              종류별
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories['종류별'].map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer hover:bg-primary/10 ${
                    selectedCategory === category 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* 상황별 */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary mb-3">
              상황별
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories['상황별'].map((situation) => (
                <Badge
                  key={situation}
                  variant={selectedType === situation ? 'default' : 'outline'}
                  className={`cursor-pointer hover:bg-primary/10 ${
                    selectedType === situation 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setSelectedType(situation)}
                >
                  {situation}
                </Badge>
              ))}
            </div>
          </div>

          {/* 재료별 */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary mb-3">
              재료별
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories['재료별'].slice(0, 12).map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 text-foreground hover:text-primary"
                >
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          {/* 방법별 */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary mb-3">
              방법별
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories['방법별'].map((method) => (
                <Badge
                  key={method}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 text-foreground hover:text-primary"
                >
                  {method}
                </Badge>
              ))}
            </div>
          </div>

          {/* 타이밍 */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">
              타이밍
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
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="레시피 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 필터 요약 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총 <span className="text-primary font-semibold">{filteredRecipes.length.toLocaleString()}</span>개의 맛있는 레시피가 있습니다.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                정확순
              </Button>
              <Button variant="outline" size="sm">
                최신순
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                추천순
              </Button>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No recipes match "${searchQuery}". Try adjusting your search.`
                  : "No recipes have been shared yet. Be the first to share a recipe!"
                }
              </p>
              {state.isAuthenticated && (
                <Link href="/recipes/create">
                  <Button>Share Your Recipe</Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
