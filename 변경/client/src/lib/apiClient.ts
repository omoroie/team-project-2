import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 마이크로서비스 베이스 URL 설정 (Nginx를 통해 직접 라우팅)
const API_ENDPOINTS = {
  auth: '/auth', // Auth API (Nginx를 통해 user-service:8081로 라우팅)
  recipe: '/recipes', // Recipe Service (Nginx를 통해 recipe-service:8082로 라우팅)
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