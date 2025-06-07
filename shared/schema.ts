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

export interface Recipe {
  id: number;
  title: string;
  description: string;
  instructions: string[];
  ingredients: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  hashtags?: string[];
  authorId: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  price?: number;
  unit?: string;
  category?: string;
  imageUrl?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPost {
  id: number;
  title: string;
  content: string;
  type: 'NOTICE' | 'QNA' | 'REVIEW' | 'GENERAL';
  authorId: number;
  viewCount: number;
  corporateOnly: boolean;
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
  instructions: string[];
  ingredients: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
}