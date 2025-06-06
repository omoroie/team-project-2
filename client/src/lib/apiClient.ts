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
    withCredentials: true, // Spring Boot 세션 인증을 위해 활성화
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
        window.location.href = '/login';
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
  checkUsername: (username: string) => authApi.get(`/api/auth/check/username/${username}`),
  checkEmail: (email: string) => authApi.get(`/api/auth/check/email/${email}`),
  getCorporateCount: () => authApi.get('/api/auth/stats/corporate-count'),
};

export const recipeAPI = {
  getAll: (params?: { page?: number; size?: number; category?: string; difficulty?: string }) =>
    recipeApi.get('/api/recipes', { params }),
  getBest: (limit?: number) => 
    recipeApi.get('/api/recipes/best', { params: { limit } }),
  getById: (id: number) => recipeApi.get(`/api/recipes/${id}`),
  create: (data: any) => recipeApi.post('/api/recipes', data),
  update: (id: number, data: any) => recipeApi.put(`/api/recipes/${id}`, data),
  delete: (id: number) => recipeApi.delete(`/api/recipes/${id}`),
  getByAuthor: (authorId: number) => recipeApi.get(`/api/recipes/author/${authorId}`),
  search: (query: string, filters?: any) => 
    recipeApi.get('/api/recipes/search', { params: { q: query, ...filters } }),
  getByCategory: (category: string) => recipeApi.get(`/api/recipes/category/${category}`),
};

export const ingredientAPI = {
  getAll: (params?: { page?: number; size?: number; category?: string; inStock?: boolean }) =>
    ingredientApi.get('/api/ingredients', { params }),
  getById: (id: number) => ingredientApi.get(`/api/ingredients/${id}`),
  create: (data: any) => ingredientApi.post('/api/ingredients', data),
  update: (id: number, data: any) => ingredientApi.put(`/api/ingredients/${id}`, data),
  delete: (id: number) => ingredientApi.delete(`/api/ingredients/${id}`),
  search: (query: string) => 
    ingredientApi.get('/api/ingredients/search', { params: { q: query } }),
  getByCategory: (category: string) => ingredientApi.get(`/api/ingredients/category/${category}`),
  updateStock: (id: number, quantity: number) => 
    ingredientApi.patch(`/api/ingredients/${id}/stock`, { quantity }),
};

export const boardAPI = {
  getAll: (params?: { page?: number; size?: number; type?: string }) =>
    boardApi.get('/api/board', { params }),
  getById: (id: number) => boardApi.get(`/api/board/${id}`),
  create: (data: any) => boardApi.post('/api/board', data),
  update: (id: number, data: any) => boardApi.put(`/api/board/${id}`, data),
  delete: (id: number) => boardApi.delete(`/api/board/${id}`),
  getByAuthor: (authorId: number) => boardApi.get(`/api/board/author/${authorId}`),
  getCorporateOnly: () => boardApi.get('/api/board/corporate'),
  addComment: (postId: number, comment: any) => 
    boardApi.post(`/api/board/${postId}/comments`, comment),
  getComments: (postId: number) => boardApi.get(`/api/board/${postId}/comments`),
};