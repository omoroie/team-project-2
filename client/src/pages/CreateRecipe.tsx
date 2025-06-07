import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useApp } from '@/contexts/AppContext';

export default function CreateRecipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { state } = useApp();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookingTime: '',
    servings: '',
    difficulty: '',
    imageUrl: '',
    ingredients: [''],
    instructions: [''],
    hashtags: [] as string[],
    instructionImages: ['']
  });
  
  const [newHashtag, setNewHashtag] = useState('');

  const createRecipeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!state.user) throw new Error('사용자 인증이 필요합니다');
      
      const recipeData = {
        ...data,
        authorId: state.user.id,
        cookingTime: parseInt(data.cookingTime),
        servings: parseInt(data.servings),
        ingredients: data.ingredients.filter((item: string) => item.trim() !== ''),
        instructions: data.instructions.filter((item: string) => item.trim() !== ''),
        instructionImages: data.instructionImages.filter((item: string) => item.trim() !== '')
      };
      
      return await apiRequest('POST', '/recipes', recipeData);
    },
    onSuccess: (data: any) => {
      toast({
        title: '성공',
        description: '레시피가 성공적으로 등록되었습니다.'
      });
      queryClient.invalidateQueries({ queryKey: ['/recipes'] });
      setLocation(`/recipes/${data.data?.id || ''}`);
    },
    onError: (error: any) => {
      toast({
        title: '오류',
        description: error.message || '레시피 등록에 실패했습니다.',
        variant: 'destructive'
      });
    }
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'ingredients' | 'instructions' | 'instructionImages', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions' | 'instructionImages') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'ingredients' | 'instructions' | 'instructionImages', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_: any, i: number) => i !== index)
      }));
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !formData.hashtags.includes(newHashtag.trim())) {
      const tag = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag]
      }));
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) {
      toast({
        title: '오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive'
      });
      return;
    }
    createRecipeMutation.mutate(formData);
  };

  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-4">레시피를 등록하려면 먼저 로그인해주세요.</p>
            <Button onClick={() => setLocation('/login')}>로그인</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">새 레시피 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">레시피 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cookingTime">조리시간 (분) *</Label>
                <Input
                  id="cookingTime"
                  type="number"
                  value={formData.cookingTime}
                  onChange={(e) => handleInputChange('cookingTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="servings">인분 *</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="difficulty">난이도 *</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">쉬움</SelectItem>
                    <SelectItem value="MEDIUM">보통</SelectItem>
                    <SelectItem value="HARD">어려움</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 재료 */}
            <div>
              <Label>재료 *</Label>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                      placeholder="예: 소고기 500g"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('ingredients', index)}
                      disabled={formData.ingredients.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('ingredients')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  재료 추가
                </Button>
              </div>
            </div>

            {/* 조리법 */}
            <div>
              <Label>조리법 *</Label>
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                      {index + 1}
                    </div>
                    <Textarea
                      value={instruction}
                      onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                      placeholder="조리 단계를 입력하세요"
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('instructions', index)}
                      disabled={formData.instructions.length === 1}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('instructions')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  조리 단계 추가
                </Button>
              </div>
            </div>

            {/* 조리법 이미지 */}
            <div>
              <Label>조리 단계별 이미지 (선택사항)</Label>
              <div className="space-y-2">
                {formData.instructionImages.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                      {index + 1}
                    </div>
                    <Input
                      value={image}
                      onChange={(e) => handleArrayChange('instructionImages', index, e.target.value)}
                      placeholder="단계별 이미지 URL (선택사항)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('instructionImages', index)}
                      disabled={formData.instructionImages.length === 1}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('instructionImages')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  이미지 URL 추가
                </Button>
              </div>
            </div>

            {/* 해시태그 */}
            <div>
              <Label>해시태그</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    placeholder="해시태그 입력 (예: 한식, 간단요리)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <Button type="button" onClick={addHashtag}>
                    추가
                  </Button>
                </div>
                {formData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeHashtag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={createRecipeMutation.isPending}
                className="flex-1"
              >
                {createRecipeMutation.isPending ? '등록 중...' : '레시피 등록'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/recipes')}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}