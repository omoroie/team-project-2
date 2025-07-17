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
import { recipeAPI } from '@/lib/apiClient';
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
    ingredients: [{ name: '', amount: '' }],
    instructions: [''],
    hashtags: [] as string[],
    instructionImages: [] as string[]
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedInstructionImages, setSelectedInstructionImages] = useState<(File | null)[]>([null]);
  
  const [newHashtag, setNewHashtag] = useState('');

  // Image upload function
  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Uploading image:', file.name, file.type, file.size + ' bytes');
      const response = await recipeAPI.uploadImage(file);
      console.log('Upload response:', response.data);
      
      // 백엔드 응답 구조에 맞춰 이미지 URL 추출
      const responseData = response.data;
      let imageUrl = null;
      
      if (responseData?.data?.imageUrl) {
        imageUrl = responseData.data.imageUrl;
      }
      
      if (imageUrl) {
        console.log('Image uploaded successfully:', imageUrl);
        return imageUrl;
      } else {
        console.error('Upload failed - no imageUrl in response:', responseData);
        throw new Error(responseData?.error || responseData?.message || 'Upload failed');
      }
    } catch (error: unknown) {
      console.error('Image upload error:', error);
      if ((error as any).response?.data) {
        console.error('Error details:', (error as any).response.data);
      }
      throw error;
    }
  };

  const createRecipeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!state.user) throw new Error('사용자 인증이 필요합니다');
      
      console.log('Creating recipe with user:', state.user);
      
      // Upload main image if selected
      let imageUrl = data.imageUrl;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      
      // Upload instruction images if selected
      let instructionImages: string[] = [];
      console.log('Debug - data.instructions.length:', data.instructions.length);
      console.log('Debug - selectedInstructionImages:', selectedInstructionImages);
      console.log('Debug - data.instructionImages:', data.instructionImages);
      
      for (let i = 0; i < data.instructions.length; i++) {
        // 파일이 선택된 경우 업로드, 아니면 직접 입력된 URL 사용
        if (selectedInstructionImages[i]) {
          console.log(`Uploading instruction image ${i + 1}:`, selectedInstructionImages[i]!.name);
          const uploadedUrl = await uploadImage(selectedInstructionImages[i]!);
          console.log(`Instruction image ${i + 1} uploaded:`, uploadedUrl);
          instructionImages[i] = uploadedUrl;
        } else if (data.instructionImages[i] && data.instructionImages[i].trim() !== '') {
          console.log(`Using direct URL for step ${i + 1}:`, data.instructionImages[i]);
          instructionImages[i] = data.instructionImages[i];
        } else {
          console.log(`No image for step ${i + 1}`);
          instructionImages[i] = '';
        }
      }
      
      console.log('Debug - Final instructionImages:', instructionImages);
      
      // Convert ingredients to RecipeIngredient format for backend
      const recipeIngredients = data.ingredients
        .filter((item: any) => item.name.trim() !== '' && item.amount.trim() !== '')
        .map((item: any) => ({
          ingredientName: item.name.trim(),
          amount: item.amount.trim()
        }));
      
      // Convert instructions to RecipeStep format for backend
      const recipeSteps = data.instructions
        .filter((item: string) => item.trim() !== '')
        .map((instruction: string, index: number) => ({
          stepIndex: index + 1,
          description: instruction.trim(),
          imageUrl: instructionImages[index] || null
        }));
      
      // Convert hashtags to Tag format for backend
      const recipeTags = data.hashtags
        .filter((tag: string) => tag.trim() !== '')
        .map((tag: string) => ({
          name: tag.trim()
        }));
      
      const recipeData = {
        title: data.title,
        description: data.description,
        cookingTime: parseInt(data.cookingTime),
        servings: parseInt(data.servings),
        difficulty: data.difficulty,
        imageUrl,
        writerId: state.user?.username || 'anonymous',
        ingredientsCount: recipeIngredients.length,
        kind: data.kind || '',
        situation: data.situation || '',
        mainIngredient: data.mainIngredient || '',
        cookingMethod: data.cookingMethod || '',
        ingredients: recipeIngredients,
        steps: recipeSteps,
        tags: recipeTags,
        instructions: data.instructions.filter((item: string) => item.trim() !== ''),
        instructionImages: instructionImages.filter((item: string) => item.trim() !== '')
      };
      
      console.log('Sending recipe data:', recipeData);
      
      try {
        const response = await recipeAPI.create(recipeData);
        console.log('Recipe creation response:', response);
        return response;
      } catch (error: any) {
        console.error('Recipe creation failed:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
      }
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

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleArrayChange = (field: 'instructions' | 'instructionImages', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'instructions' | 'instructionImages') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
    
    if (field === 'instructionImages') {
      setSelectedInstructionImages(prev => [...prev, null]);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '' }]
    }));
  };

  const removeArrayItem = (field: 'instructions' | 'instructionImages', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_: any, i: number) => i !== index)
      }));
      
      if (field === 'instructionImages') {
        setSelectedInstructionImages(prev => prev.filter((_, i) => i !== index));
      }
    }
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
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
              <Label>대표 이미지</Label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Selected main image:', file.name, file.type, file.size);
                        setSelectedImage(file);
                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="main-image-file"
                  />
                  <label 
                    htmlFor="main-image-file"
                    className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium text-green-700"
                  >
                    파일 선택
                  </label>
                </div>
                {selectedImage && (
                  <div className="text-sm text-gray-600">
                    선택된 파일: {selectedImage.name}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  또는 이미지 URL을 직접 입력하세요:
                </div>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleInputChange('imageUrl', e.target.value);
                    if (e.target.value) {
                      setSelectedImage(null);
                    }
                  }}
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
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="재료명 (예: 소고기)"
                      className="flex-1"
                    />
                    <Input
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      placeholder="양 (예: 500g)"
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={formData.ingredients.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
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
              <div className="space-y-3">
                {formData.instructionImages.map((image, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">단계 {index + 1} 이미지</span>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const newImages = [...selectedInstructionImages];
                              newImages[index] = file;
                              setSelectedInstructionImages(newImages);
                              handleArrayChange('instructionImages', index, '');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id={`instruction-file-${index}`}
                        />
                        <label 
                          htmlFor={`instruction-file-${index}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium text-blue-700"
                        >
                          파일 선택
                        </label>
                      </div>
                      {selectedInstructionImages[index] && (
                        <div className="text-sm text-gray-600">
                          선택된 파일: {selectedInstructionImages[index]?.name}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        또는 이미지 URL을 직접 입력하세요:
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={image}
                          onChange={(e) => {
                            handleArrayChange('instructionImages', index, e.target.value);
                            if (e.target.value) {
                              const newImages = [...selectedInstructionImages];
                              newImages[index] = null;
                              setSelectedInstructionImages(newImages);
                            }
                          }}
                          placeholder="https://example.com/step-image.jpg"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem('instructionImages', index)}
                          disabled={formData.instructionImages.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('instructionImages')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  조리 단계 이미지 추가
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