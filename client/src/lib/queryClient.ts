import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Spring Boot 마이크로서비스 URL들
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081';
const RECIPE_SERVICE_URL = import.meta.env.VITE_RECIPE_SERVICE_URL || 'http://localhost:8082';
const INGREDIENT_SERVICE_URL = import.meta.env.VITE_INGREDIENT_SERVICE_URL || 'http://localhost:8083';
const BOARD_SERVICE_URL = import.meta.env.VITE_BOARD_SERVICE_URL || 'http://localhost:8084';

// API 경로별 서비스 매핑
function getServiceUrl(path: string): string {
  if (path.startsWith('/api/users')) {
    return USER_SERVICE_URL + path;
  } else if (path.startsWith('/api/recipes')) {
    return RECIPE_SERVICE_URL + path;
  } else if (path.startsWith('/api/ingredients')) {
    return INGREDIENT_SERVICE_URL + path;
  } else if (path.startsWith('/api/board')) {
    return BOARD_SERVICE_URL + path;
  }
  return path; // 기본값
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = getServiceUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = getServiceUrl(queryKey[0] as string);
    
    const res = await fetch(fullUrl, {
      headers: {
        "Accept": "application/json",
      },
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
