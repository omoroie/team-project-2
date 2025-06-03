import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { recipeAPI, ingredientAPI, boardAPI, authAPI } from "./apiClient";
import axios from 'axios';

// 각 서비스별 API 함수들을 export
export { recipeAPI, ingredientAPI, boardAPI, authAPI };

// API 요청을 위한 기본 함수
export const apiRequest = async (method: string, url: string, data?: any) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

type UnauthorizedBehavior = "returnNull" | "throw";

// 기본 쿼리 함수 - 각 API별로 분기 처리
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const [path, ...params] = queryKey as [string, ...any[]];
      let response;

      // API 경로에 따라 적절한 서비스 호출
      if (path.includes('/recipes/best')) {
        response = await recipeAPI.getBest(params[0]);
      } else if (path.includes('/recipes')) {
        if (params[0]) {
          response = await recipeAPI.getById(params[0]);
        } else {
          response = await recipeAPI.getAll();
        }
      } else if (path.includes('/ingredients')) {
        if (params[0]) {
          response = await ingredientAPI.getById(params[0]);
        } else {
          response = await ingredientAPI.getAll();
        }
      } else if (path.includes('/board')) {
        if (params[0]) {
          response = await boardAPI.getById(params[0]);
        } else {
          response = await boardAPI.getAll();
        }
      } else if (path.includes('/auth/me')) {
        response = await authAPI.me();
      } else {
        throw new Error(`Unknown API path: ${path}`);
      }

      return response.data;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30초 캐시
      retry: (failureCount, error: any) => {
        if (error.response?.status === 401) return false;
        return failureCount < 1; // 재시도 횟수 줄임
      },
    },
    mutations: {
      retry: false,
    },
  },
});
