import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 마이크로서비스 베이스 URL 설정
const API_ENDPOINTS = {
  user: 'http://localhost:8081',
  recipe: 'http://localhost:8082', 
  ingredient: 'http://localhost:8083',
  board: 'http://localhost:8084',
  gateway: 'http://localhost:5000' // 현재 Express.js 서버 (임시)
};

// 공통 axios 설정
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // 세션 쿠키 포함
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
  // URL을 기반으로 적절한 클라이언트 선택
  let client = gatewayApi; // 기본값은 게이트웨이

  if (url.startsWith('/api/users') || url.startsWith('/api/auth')) {
    client = userApi;
    url = url.replace('/api', ''); // 마이크로서비스에서는 /api 제거
  } else if (url.startsWith('/api/recipes')) {
    client = recipeApi;
    url = url.replace('/api', '');
  } else if (url.startsWith('/api/ingredients')) {
    client = ingredientApi;
    url = url.replace('/api', '');
  } else if (url.startsWith('/api/board')) {
    client = boardApi;
    url = url.replace('/api', '');
  }

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
};

export const recipeAPI = {
  getAll: () => recipeApi.get('/recipes'),
  getById: (id: number) => recipeApi.get(`/recipes/${id}`),
  create: (data: any) => recipeApi.post('/recipes', data),
  update: (id: number, data: any) => recipeApi.put(`/recipes/${id}`, data),
  delete: (id: number) => recipeApi.delete(`/recipes/${id}`),
  getByAuthor: (authorId: number) => recipeApi.get(`/recipes/author/${authorId}`),
};

export const ingredientAPI = {
  getAll: () => ingredientApi.get('/ingredients'),
  getById: (id: number) => ingredientApi.get(`/ingredients/${id}`),
  create: (data: any) => ingredientApi.post('/ingredients', data),
  update: (id: number, data: any) => ingredientApi.put(`/ingredients/${id}`, data),
  delete: (id: number) => ingredientApi.delete(`/ingredients/${id}`),
};

export const boardAPI = {
  getAll: () => boardApi.get('/board'),
  getById: (id: number) => boardApi.get(`/board/${id}`),
  create: (data: any) => boardApi.post('/board', data),
  update: (id: number, data: any) => boardApi.put(`/board/${id}`, data),
  delete: (id: number) => boardApi.delete(`/board/${id}`),
  getByAuthor: (authorId: number) => boardApi.get(`/board/author/${authorId}`),
};