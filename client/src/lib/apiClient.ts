import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 마이크로서비스 베이스 URL 설정 - CORS 회피를 위해 프록시 경로 사용
const API_ENDPOINTS = {
  user: '/api/user', // User Service proxy
  recipe: '/api/recipe', // Recipe Service proxy
  ingredient: '/api/ingredient', // Ingredient Service proxy
  board: '/api/board', // Board Service proxy
};

// 공통 axios 설정
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
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
export const userApi = createApiClient(API_ENDPOINTS.user);
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

// 서비스별 API 호출 함수들
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    userApi.post('/auth/login', credentials),
  register: (userData: any) => userApi.post('/auth/register', userData),
  logout: () => userApi.post('/auth/logout'),
  me: () => userApi.get('/auth/me'),
  refreshToken: () => userApi.post('/auth/refresh'),
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