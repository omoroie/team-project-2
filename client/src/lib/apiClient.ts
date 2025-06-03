import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 마이크로서비스 베이스 URL 설정
// 현재는 Express.js 게이트웨이를 통해 모든 API 호출
const API_ENDPOINTS = {
  user: '', // 상대 경로 사용으로 CORS 회피
  recipe: '', 
  ingredient: '',
  board: '',
  gateway: '' 
};

// 공통 axios 설정
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false, // 세션 쿠키 비활성화로 CORS 문제 해결
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
export const gatewayApi = createApiClient(API_ENDPOINTS.gateway); // 임시 사용

// API 요청 헬퍼 함수
export const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => {
  // 현재는 모든 요청을 Express.js 게이트웨이로 전송
  const client = gatewayApi;

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
    gatewayApi.post('/api/auth/login', credentials),
  register: (userData: any) => gatewayApi.post('/api/auth/register', userData),
  logout: () => gatewayApi.post('/api/auth/logout'),
  me: () => gatewayApi.get('/api/auth/me'),
};

export const recipeAPI = {
  getAll: () => gatewayApi.get('/api/recipes'),
  getBest: () => gatewayApi.get('/api/recipes/best'),
  getById: (id: number) => gatewayApi.get(`/api/recipes/${id}`),
  create: (data: any) => gatewayApi.post('/api/recipes', data),
  update: (id: number, data: any) => gatewayApi.put(`/api/recipes/${id}`, data),
  delete: (id: number) => gatewayApi.delete(`/api/recipes/${id}`),
  getByAuthor: (authorId: number) => gatewayApi.get(`/api/recipes/author/${authorId}`),
};

export const ingredientAPI = {
  getAll: () => gatewayApi.get('/api/ingredients'),
  getById: (id: number) => gatewayApi.get(`/api/ingredients/${id}`),
  create: (data: any) => gatewayApi.post('/api/ingredients', data),
  update: (id: number, data: any) => gatewayApi.put(`/api/ingredients/${id}`, data),
  delete: (id: number) => gatewayApi.delete(`/api/ingredients/${id}`),
};

export const boardAPI = {
  getAll: () => gatewayApi.get('/api/board'),
  getById: (id: number) => gatewayApi.get(`/api/board/${id}`),
  create: (data: any) => gatewayApi.post('/api/board', data),
  update: (id: number, data: any) => gatewayApi.put(`/api/board/${id}`, data),
  delete: (id: number) => gatewayApi.delete(`/api/board/${id}`),
  getByAuthor: (authorId: number) => gatewayApi.get(`/api/board/author/${authorId}`),
};