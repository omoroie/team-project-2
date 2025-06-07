import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, Heart, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';

interface BestRecipe {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  servings: number;
  difficulty: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  author: {
    name: string;
    avatar?: string;
  };
  ranking: number;
  isVideo?: boolean;
}

interface BestRecipesProps {
  recipes: BestRecipe[];
}

export function BestRecipes({ recipes }: BestRecipesProps) {
  const { t } = useLanguage();

  // 레시피별 적절한 이미지 생성
  const getRecipeImage = (recipe: BestRecipe) => {
    if (recipe.imageUrl) return recipe.imageUrl;
    
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
    
    for (const [keyword, imageUrl] of Object.entries(imageMap)) {
      if (recipe.title.includes(keyword)) {
        return imageUrl;
      }
    }
    
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
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">베스트 레시피</h2>
            <p className="text-muted-foreground">가장 사랑받는 레시피를 만나보세요</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/recipes">더보기</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="relative">
                <img
                  src={getRecipeImage(recipe)}
                  alt={recipe.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* 랭킹 배지 */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant={recipe.ranking <= 3 ? "default" : "secondary"}
                    className={`
                      font-bold text-lg px-3 py-1
                      ${recipe.ranking === 1 ? 'bg-yellow-500 text-white' :
                        recipe.ranking === 2 ? 'bg-gray-400 text-white' :
                        recipe.ranking === 3 ? 'bg-orange-400 text-white' :
                        'bg-gray-200 text-gray-700'}
                    `}
                  >
                    {recipe.ranking}
                  </Badge>
                </div>

                {/* 비디오 아이콘 */}
                {recipe.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-800 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                )}

                {/* 좋아요 버튼 */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <CardContent className="p-4">
                <Link href={`/recipes/${recipe.id}`} className="block">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {recipe.title}
                  </h3>
                </Link>

                {/* 작성자 정보 */}
                <div className="flex items-center gap-2 mb-3">
                  {recipe.author.avatar ? (
                    <img 
                      src={recipe.author.avatar} 
                      alt={recipe.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {recipe.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">{recipe.author.name}</span>
                </div>

                {/* 레시피 정보 */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{recipe.cookingTime}분</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{recipe.servings}인분</span>
                  </div>
                </div>

                {/* 평점 및 조회수 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(recipe.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium">({recipe.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{recipe.viewCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* 난이도 배지 */}
                <div className="mt-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      recipe.difficulty === '초급' ? 'border-green-300 text-green-700' :
                      recipe.difficulty === '중급' ? 'border-yellow-300 text-yellow-700' :
                      'border-red-300 text-red-700'
                    }`}
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}