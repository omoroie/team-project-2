import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { User, Recipe, LoginRequest, RegisterRequest, CreateRecipeRequest } from '@shared/schema';

// 마이크로서비스 베이스 URL 설정 (환경에 따라 동적 설정)
const getBaseUrl = () => {
  // 개발 환경에서는 상대 경로 사용 (Vite proxy 사용)
  if (import.meta.env.DEV) {
    return '';
  }
  // 프로덕션 환경에서는 현재 도메인 사용
  return window.location.origin;
};

const API_ENDPOINTS = {
  auth: getBaseUrl(), // Auth API (Nginx를 통해 user-service:8081로 라우팅)
  // auth: "http://user-service.samsung-recipe.svc.cluster.local:8081",
  recipe: getBaseUrl(), // Recipe Service (Nginx를 통해 recipe-service:8082로 라우팅)
  // recipe: "http://recipe-service.samsung-recipe.svc.cluster.local:8082",
};

// API 응답 타입 정의 - 백엔드 실제 응답 구조에 맞춤
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  recipes?: T[];
  user?: T;
  recipe?: T;
}

interface LoginResponse {
  user: User;
  token?: string;
}

// 공통 axios 설정
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30초로 증가
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // 응답 인터셉터
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // 인증 오류시 로그인 페이지로 리다이렉트
        localStorage.removeItem('currentUser');
        
        // Check if the response indicates login is required
        if (error.response?.data?.requiresLogin) {
          // Show toast notification if available
          if (typeof window !== 'undefined') {
            // alert 대신 console.warn 사용
            console.warn('로그인이 필요합니다');
          }
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// 각 마이크로서비스별 클라이언트 생성
export const authApi = createApiClient(API_ENDPOINTS.auth);
export const recipeApi = createApiClient(API_ENDPOINTS.recipe);

// API 요청 헬퍼 함수
export const apiRequest = async <T>(
  client: AxiosInstance,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    const response = await client.request({
      method,
      url,
      data,
      ...config,
    });
    return response;
  } catch (error) {
    console.error(`API request failed: ${method} ${url}`, error);
    throw error;
  }
};

// Auth API - 모든 사용자/인증 관련 요청 통합
export const authAPI = {
  // 인증 관련
  login: (credentials: LoginRequest) =>
    authApi.post<ApiResponse<LoginResponse>>('/auth/login', credentials),
  register: (userData: RegisterRequest) => 
    authApi.post<ApiResponse<LoginResponse>>('/auth/register', userData),
  logout: () => authApi.post<ApiResponse<void>>('/auth/logout'),
  me: () => authApi.get<ApiResponse<User>>('/auth/me'),
  refreshToken: () => authApi.post<ApiResponse<{ token: string }>>('/auth/refresh'),
  
  // 사용자 관리
  getById: (id: number) => authApi.get<ApiResponse<User>>(`/auth/${id}`),
  getByUsername: (username: string) => authApi.get<ApiResponse<User>>(`/auth/username/${username}`),
  getAll: () => authApi.get<ApiResponse<User[]>>('/auth'),
  getCorporate: () => authApi.get<ApiResponse<User[]>>('/auth/corporate'),
  update: (id: number, data: Partial<User>) => authApi.put<ApiResponse<User>>(`/auth/${id}`, data),
  delete: (id: number) => authApi.delete<ApiResponse<void>>(`/auth/${id}`),
  checkUsername: (username: string) => authApi.get<ApiResponse<{ available: boolean }>>(`/auth/check/username/${username}`),
  checkEmail: (email: string) => authApi.get<ApiResponse<{ available: boolean }>>(`/auth/check/email/${email}`),
  getCorporateCount: () => authApi.get<ApiResponse<{ count: number }>>('/auth/stats/corporate-count'),
};

export const recipeAPI = {
  getAll: (params?: { page?: number; size?: number; category?: string; difficulty?: string }) =>
    recipeApi.get<ApiResponse<Recipe[]>>('/recipes', { params }),
  getAllPaged: (params?: { page?: number; size?: number }) =>
    recipeApi.get<ApiResponse<Recipe[]>>('/recipes/paged', { params }),
  getBest: (limit?: number) => 
    recipeApi.get<ApiResponse<Recipe[]>>('/recipes/best', { params: { limit } }),
  getById: (id: number) => recipeApi.get<ApiResponse<Recipe>>(`/recipes/${id}`),
  create: (data: CreateRecipeRequest) => recipeApi.post<ApiResponse<Recipe>>('/recipes', data),
  update: (id: number, data: Partial<CreateRecipeRequest>) => recipeApi.put<ApiResponse<Recipe>>(`/recipes/${id}`, data),
  delete: (id: number) => recipeApi.delete<ApiResponse<void>>(`/recipes/${id}`),
  getByAuthor: (authorId: number) => recipeApi.get<ApiResponse<Recipe[]>>(`/recipes/author/${authorId}`),
  search: (query: string, filters?: Record<string, unknown>) => 
    recipeApi.get<ApiResponse<Recipe[]>>('/recipes/search', { params: { q: query, ...filters } }),
  getByCategory: (category: string) => recipeApi.get<ApiResponse<Recipe[]>>(`/recipes/category/${category}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return recipeApi.post<ApiResponse<{ imageUrl: string }>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (imageUrl: string) => 
    recipeApi.delete<ApiResponse<void>>('/images/delete', { params: { imageUrl } }),
};
