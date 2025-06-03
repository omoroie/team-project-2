import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiRequest } from "./apiClient";

// apiRequest를 다시 export
export { apiRequest };

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await apiRequest('GET', queryKey[0] as string);
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
