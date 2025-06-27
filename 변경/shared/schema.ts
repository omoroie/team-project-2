// 레시피 플랫폼 공통 타입 정의

export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  isCorporate: boolean;
  createdAt: string;
  updatedAt: string;
}

// 정규화된 레시피 관련 인터페이스들
export interface RecipeStep {
  stepIndex: number;
  description: string;
  imageUrl?: string;
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  ingredientName: string;
  amount: string;
}

export interface RecipeIngredientDetail {
  ingredientId: number;
  ingredientName: string;
  amount: string;
}

export interface Tag {
  name: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  steps: RecipeStep[];
  ingredients: RecipeIngredientDetail[];
  instructions: string[];
  instructionImages?: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  tags: Tag[];
  ingredientsCount: number;
  kind?: string;
  situation?: string;
  mainIngredient?: string;
  cookingMethod?: string;
  writerId: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 로그인/회원가입 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  isCorporate?: boolean;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  cookingTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  tags?: Tag[];
  ingredientsCount?: number;
  kind?: string;
  situation?: string;
  mainIngredient?: string;
  cookingMethod?: string;
  writerId?: string;
  instructions: string[];
  instructionImages?: string[];
}