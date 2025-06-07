import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 마이크로서비스 베이스 URL 설정 (Vite proxy 사용)
const API_ENDPOINTS = {
  auth: '/api', // Auth API (모든 요청을 auth 경로로 통일)
  recipe: '/api', // Recipe Service (proxy를 통해 localhost:8082로 라우팅)
  ingredient: '/api', // Ingredient Service (proxy를 통해 localhost:8083로 라우팅)
  board: '/api', // Board Service (proxy를 통해 localhost:8084로 라우팅)
};

// 공통 axios 설정
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // 요청 인터셉터
  client.interceptors.request.use(
    (config) => {
      // 로그인 토큰이 있다면 헤더에 추가
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // 인증 오류시 로그인 페이지로 리다이렉트
        localStorage.removeItem('authToken');
        
        // Check if the response indicates login is required
        if (error.response?.data?.requiresLogin) {
          // Show toast notification if available
          if (typeof window !== 'undefined') {
            alert('로그인이 필요합니다');
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
export const ingredientApi = createApiClient(API_ENDPOINTS.ingredient);
export const boardApi = createApiClient(API_ENDPOINTS.board);

// API 요청 헬퍼 함수
export const apiRequest = async (
  client: AxiosInstance,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => {
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
  login: (credentials: { username: string; password: string }) =>
    authApi.post('/auth/login', credentials),
  register: (userData: any) => authApi.post('/auth/register', userData),
  logout: () => authApi.post('/auth/logout'),
  me: () => authApi.get('/auth/me'),
  refreshToken: () => authApi.post('/auth/refresh'),
  
  // 사용자 관리
  getById: (id: number) => authApi.get(`/auth/${id}`),
  getByUsername: (username: string) => authApi.get(`/auth/username/${username}`),
  getAll: () => authApi.get('/auth'),
  getCorporate: () => authApi.get('/auth/corporate'),
  update: (id: number, data: any) => authApi.put(`/auth/${id}`, data),
  delete: (id: number) => authApi.delete(`/auth/${id}`),
  checkUsername: (username: string) => authApi.get(`/auth/check/username/${username}`),
  checkEmail: (email: string) => authApi.get(`/auth/check/email/${email}`),
  getCorporateCount: () => authApi.get('/auth/stats/corporate-count'),
};

export const recipeAPI = {
  getAll: (params?: { page?: number; size?: number; category?: string; difficulty?: string }) =>
    recipeApi.get('/recipes', { params }),
  getBest: (limit?: number) => 
    recipeApi.get('/recipes/best', { params: { limit } }),
  getById: (id: number) => recipeApi.get(`/recipes/${id}`),
  create: (data: any) => recipeApi.post('/recipes', data),
  update: (id: number, data: any) => recipeApi.put(`/recipes/${id}`, data),
  delete: (id: number) => recipeApi.delete(`/recipes/${id}`),
  getByAuthor: (authorId: number) => recipeApi.get(`/recipes/author/${authorId}`),
  search: (query: string, filters?: any) => 
    recipeApi.get('/recipes/search', { params: { q: query, ...filters } }),
  getByCategory: (category: string) => recipeApi.get(`/recipes/category/${category}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return recipeApi.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const ingredientAPI = {
  getAll: (params?: { page?: number; size?: number; category?: string; inStock?: boolean }) =>
    ingredientApi.get('/ingredients', { params }),
  getById: (id: number) => ingredientApi.get(`/ingredients/${id}`),
  create: (data: any) => ingredientApi.post('/ingredients', data),
  update: (id: number, data: any) => ingredientApi.put(`/ingredients/${id}`, data),
  delete: (id: number) => ingredientApi.delete(`/ingredients/${id}`),
  search: (query: string) => 
    ingredientApi.get('/ingredients/search', { params: { q: query } }),
  getByCategory: (category: string) => ingredientApi.get(`/ingredients/category/${category}`),
  updateStock: (id: number, quantity: number) => 
    ingredientApi.patch(`/ingredients/${id}/stock`, { quantity }),
};

export const boardAPI = {
  getAll: (params?: { page?: number; size?: number; type?: string }) =>
    boardApi.get('/board', { params }),
  getById: (id: number) => boardApi.get(`/board/${id}`),
  create: (data: any) => boardApi.post('/board', data),
  update: (id: number, data: any) => boardApi.put(`/board/${id}`, data),
  delete: (id: number) => boardApi.delete(`/board/${id}`),
  getByAuthor: (authorId: number) => boardApi.get(`/board/author/${authorId}`),
  getCorporateOnly: () => boardApi.get('/board/corporate'),
  addComment: (postId: number, comment: any) => 
    boardApi.post(`/board/${postId}/comments`, comment),
  getComments: (postId: number) => boardApi.get(`/board/${postId}/comments`),
};