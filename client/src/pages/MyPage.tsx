import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { authAPI, recipeAPI } from '@/lib/apiClient';
import { Recipe, User } from '@shared/schema';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  ChefHat, 
  Eye, 
  Clock, 
  Users,
  Settings,
  Edit3,
  Trash2
} from 'lucide-react';
import { Link } from 'wouter';

export default function MyPage() {
  const { state } = useApp();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: state.user?.username || '',
    email: state.user?.email || ''
  });

  // 내가 작성한 레시피 조회
  const { data: myRecipes, isLoading: recipesLoading } = useQuery({
    queryKey: ['/api/recipes/my'],
    queryFn: () => recipeAPI.getMyRecipes(),
    enabled: !!state.user
  });

  // 프로필 업데이트
  const updateProfileMutation = useMutation({
    mutationFn: (data: { username: string; email: string }) => 
      authAPI.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다."
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "오류",
        description: "프로필 업데이트에 실패했습니다."
      });
    }
  });

  // 레시피 삭제
  const deleteRecipeMutation = useMutation({
    mutationFn: (recipeId: number) => recipeAPI.delete(recipeId),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "레시피가 삭제되었습니다."
      });
      // 목록 새로고침
      window.location.reload();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "오류",
        description: "레시피 삭제에 실패했습니다."
      });
    }
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleDeleteRecipe = (recipeId: number) => {
    if (confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
      deleteRecipeMutation.mutate(recipeId);
    }
  };

  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground">로그인이 필요합니다.</p>
            <Button asChild className="mt-4">
              <Link href="/login">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalRecipes: myRecipes?.recipes?.length || 0,
    totalViews: myRecipes?.recipes?.reduce((sum: number, recipe: Recipe) => sum + recipe.viewCount, 0) || 0,
    avgCookingTime: myRecipes?.recipes?.length > 0 
      ? Math.round(myRecipes.recipes.reduce((sum: number, recipe: Recipe) => sum + recipe.cookingTime, 0) / myRecipes.recipes.length)
      : 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 프로필 헤더 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {state.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{state.user.username}</h1>
                    <p className="text-muted-foreground">{state.user.email}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>가입일: {new Date(state.user.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                      {state.user.isCorporate && (
                        <Badge variant="secondary">기업 회원</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? '취소' : '편집'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 프로필 편집 폼 */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>프로필 편집</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? '저장중...' : '저장'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalRecipes}</p>
                  <p className="text-sm text-muted-foreground">작성한 레시피</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-sm text-muted-foreground">총 조회수</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgCookingTime}분</p>
                  <p className="text-sm text-muted-foreground">평균 조리시간</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipes">내 레시피</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>내가 작성한 레시피</CardTitle>
              </CardHeader>
              <CardContent>
                {recipesLoading ? (
                  <div className="text-center py-8">
                    <p>레시피를 불러오는 중...</p>
                  </div>
                ) : myRecipes?.recipes?.length === 0 ? (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">아직 작성한 레시피가 없습니다.</p>
                    <Button asChild>
                      <Link href="/create-recipe">첫 번째 레시피 만들기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRecipes?.recipes?.map((recipe: Recipe) => (
                      <div key={recipe.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                          {recipe.imageUrl && (
                            <img 
                              src={recipe.imageUrl} 
                              alt={recipe.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{recipe.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {recipe.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{recipe.cookingTime}분</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings}인분</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{recipe.viewCount}회</span>
                            </div>
                            <Badge 
                              variant={
                                recipe.difficulty === 'EASY' ? 'default' :
                                recipe.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                              }
                            >
                              {recipe.difficulty === 'EASY' ? '쉬움' :
                               recipe.difficulty === 'MEDIUM' ? '보통' : '어려움'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/recipes/${recipe.id}`}>보기</Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/edit-recipe/${recipe.id}`}>수정</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            disabled={deleteRecipeMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>계정 유형</Label>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{state.user.isCorporate ? '기업 회원' : '개인 회원'}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>계정 정보</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>이메일: {state.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>가입일: {new Date(state.user.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>최종 수정: {new Date(state.user.updatedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>계정 관리</Label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      비밀번호 변경
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      계정 삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}