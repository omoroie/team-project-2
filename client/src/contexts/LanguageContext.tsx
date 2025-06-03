import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const translations = {
  ko: {
    // Navigation
    home: '홈',
    recipes: '레시피',
    ingredients: '식재료',
    board: '게시판',
    login: '로그인',
    register: '회원가입',
    logout: '로그아웃',
    
    // Home page
    heroTitle: '여러분의 요리 여정이 여기서 시작됩니다',
    heroSubtitle: '스마트한 요리로 매일을 새롭게',
    heroDescription: '스마트 특가 최대 50% 할인과 여러분의 사랑이 만나 해낼 수 있어요',
    exploreRecipes: '그래 해볼게요',
    
    // Recipe section
    featuredRecipes: '추천 레시피',
    viewAllRecipes: '모든 레시피 보기',
    cookingTime: '조리시간',
    servings: '인분',
    difficulty: '난이도',
    
    // Ingredient section
    freshIngredients: '신선한 식재료',
    viewAllIngredients: '모든 식재료 보기',
    addToCart: '장바구니 담기',
    
    // Auth
    username: '사용자명',
    email: '이메일',
    password: '비밀번호',
    corporateAccount: '기업 계정',
    
    // Board
    corporateBoard: '기업 게시판',
    createPost: '게시글 작성',
    
    // Common
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    save: '저장',
    cancel: '취소',
    edit: '편집',
    delete: '삭제',
  },
  en: {
    // Navigation
    home: 'Home',
    recipes: 'Recipes',
    ingredients: 'Ingredients',
    board: 'Board',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Home page
    heroTitle: 'Your culinary journey starts here',
    heroSubtitle: 'Smart cooking for a new everyday',
    heroDescription: 'Smart deals up to 50% off and your love come together to make it happen',
    exploreRecipes: 'Let\'s Do It',
    
    // Recipe section
    featuredRecipes: 'Featured Recipes',
    viewAllRecipes: 'View All Recipes',
    cookingTime: 'Cooking Time',
    servings: 'Servings',
    difficulty: 'Difficulty',
    
    // Ingredient section
    freshIngredients: 'Fresh Ingredients',
    viewAllIngredients: 'View All Ingredients',
    addToCart: 'Add to Cart',
    
    // Auth
    username: 'Username',
    email: 'Email',
    password: 'Password',
    corporateAccount: 'Corporate Account',
    
    // Board
    corporateBoard: 'Corporate Board',
    createPost: 'Create Post',
    
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ko', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ko']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
