// Spring Boot 마이크로서비스 API 설정
export const API_CONFIG = {
  USER_SERVICE: 'http://localhost:8081',
  RECIPE_SERVICE: 'http://localhost:8082',
  INGREDIENT_SERVICE: 'http://localhost:8083',
  BOARD_SERVICE: 'http://localhost:8084',
};

// API 엔드포인트 매핑
export const API_ENDPOINTS = {
  // 사용자 서비스
  USERS: {
    REGISTER: `${API_CONFIG.USER_SERVICE}/api/users/register`,
    LOGIN: `${API_CONFIG.USER_SERVICE}/api/users/login`,
    ME: `${API_CONFIG.USER_SERVICE}/api/users/me`,
    BY_ID: (id: number) => `${API_CONFIG.USER_SERVICE}/api/users/${id}`,
    CORPORATE: `${API_CONFIG.USER_SERVICE}/api/users/corporate`,
  },
  
  // 레시피 서비스
  RECIPES: {
    BASE: `${API_CONFIG.RECIPE_SERVICE}/api/recipes`,
    BY_ID: (id: number) => `${API_CONFIG.RECIPE_SERVICE}/api/recipes/${id}`,
    BY_AUTHOR: (authorId: number) => `${API_CONFIG.RECIPE_SERVICE}/api/recipes/author/${authorId}`,
    SEARCH: (keyword: string) => `${API_CONFIG.RECIPE_SERVICE}/api/recipes/search?keyword=${keyword}`,
    RECENT: `${API_CONFIG.RECIPE_SERVICE}/api/recipes/recent`,
  },
  
  // 식재료 서비스
  INGREDIENTS: {
    BASE: `${API_CONFIG.INGREDIENT_SERVICE}/api/ingredients`,
    BY_ID: (id: number) => `${API_CONFIG.INGREDIENT_SERVICE}/api/ingredients/${id}`,
    BY_CATEGORY: (category: string) => `${API_CONFIG.INGREDIENT_SERVICE}/api/ingredients/category/${category}`,
  },
  
  // 게시판 서비스
  BOARD: {
    BASE: `${API_CONFIG.BOARD_SERVICE}/api/board`,
    BY_ID: (id: number) => `${API_CONFIG.BOARD_SERVICE}/api/board/${id}`,
    TRANSLATE: (id: number) => `${API_CONFIG.BOARD_SERVICE}/api/board/${id}/translate`,
  },
};