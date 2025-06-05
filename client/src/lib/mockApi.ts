// Mock API for development when backend services are not running
export const mockAPI = {
  auth: {
    login: async (credentials: { username: string; password: string }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.username === 'test' && credentials.password === 'test') {
        const mockUser = {
          id: 1,
          username: 'test',
          email: 'test@example.com',
          name: '테스트 사용자',
          userType: 'INDIVIDUAL'
        };
        localStorage.setItem('authToken', 'mock-token');
        return { data: { user: mockUser, token: 'mock-token' } };
      }
      throw new Error('Invalid credentials');
    },
    
    register: async (userData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = {
        id: 2,
        ...userData,
        userType: userData.userType || 'INDIVIDUAL'
      };
      return { data: { user: mockUser, message: 'Registration successful' } };
    },
    
    me: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      return {
        data: {
          id: 1,
          username: 'test',
          email: 'test@example.com',
          name: '테스트 사용자',
          userType: 'INDIVIDUAL'
        }
      };
    },
    
    logout: async () => {
      localStorage.removeItem('authToken');
      return { data: { message: 'Logged out successfully' } };
    }
  },
  
  recipes: {
    getBest: async (limit: number = 12) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockRecipes = Array.from({ length: limit }, (_, i) => ({
        id: i + 1,
        title: `맛있는 레시피 ${i + 1}`,
        description: `이것은 ${i + 1}번째 레시피의 설명입니다.`,
        imageUrl: `https://picsum.photos/400/300?random=${i + 1}`,
        cookingTime: 30 + (i * 5),
        servings: 2 + (i % 3),
        difficulty: ['쉬움', '보통', '어려움'][i % 3],
        rating: 4.0 + (Math.random() * 1),
        reviewCount: 10 + (i * 5),
        viewCount: 100 + (i * 20),
        author: {
          name: `요리사 ${i + 1}`,
          avatar: `https://picsum.photos/50/50?random=${i + 100}`
        },
        ranking: i + 1,
        isVideo: i % 4 === 0
      }));
      
      return { data: mockRecipes };
    },
    
    getAll: async (params: any = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAPI.recipes.getBest(20);
    }
  },
  
  ingredients: {
    getAll: async (params: any = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockIngredients = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `재료 ${i + 1}`,
        description: `신선한 재료 ${i + 1}의 설명입니다.`,
        imageUrl: `https://picsum.photos/300/200?random=${i + 200}`,
        price: 1000 + (i * 500),
        unit: '개',
        inStock: i % 3 !== 0,
        category: ['채소', '육류', '해산물', '양념'][i % 4]
      }));
      
      return { data: mockIngredients };
    }
  }
};