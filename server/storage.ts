import { users, recipes, ingredients, boardPosts, type User, type InsertUser, type Recipe, type InsertRecipe, type Ingredient, type InsertIngredient, type BoardPost, type InsertBoardPost } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe methods
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  getRecipesByAuthor(authorId: number): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  
  // Ingredient methods
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  
  // Board post methods
  getBoardPosts(): Promise<BoardPost[]>;
  getBoardPost(id: number): Promise<BoardPost | undefined>;
  createBoardPost(post: InsertBoardPost): Promise<BoardPost>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
    
    // Initialize with sample data if tables are empty
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if data already exists
      const existingRecipes = await this.db.select().from(recipes).limit(1);
      const existingIngredients = await this.db.select().from(ingredients).limit(1);
      
      if (existingRecipes.length > 0 || existingIngredients.length > 0) {
        return; // Data already exists
      }

      console.log("Initializing sample data...");

      // Create sample users first
      const sampleUsers = [
        { username: "chef_korea", email: "chef@korea.com", password: "hashedPassword1", isCorporate: false },
        { username: "samsung_chef", email: "chef@samsung.com", password: "hashedPassword2", isCorporate: true },
        { username: "home_cook", email: "home@cook.com", password: "hashedPassword3", isCorporate: false },
        { username: "pro_chef", email: "pro@chef.com", password: "hashedPassword4", isCorporate: false },
        { username: "culinary_expert", email: "expert@culinary.com", password: "hashedPassword5", isCorporate: false }
      ];

      for (const user of sampleUsers) {
        await this.db.insert(users).values(user);
      }

      // Create 50 sample ingredients
      const sampleIngredients = [
        { name: "토마토", description: "신선한 토마토", price: 2000, unit: "개", imageUrl: "https://images.unsplash.com/photo-1546470427-e4cf2b19e1d4?w=400", inStock: true },
        { name: "양파", description: "국산 양파", price: 1500, unit: "개", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", inStock: true },
        { name: "마늘", description: "햇마늘", price: 3000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "쌀", description: "신동진쌀", price: 15000, unit: "kg", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", inStock: true },
        { name: "당근", description: "유기농 당근", price: 1800, unit: "개", imageUrl: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400", inStock: true },
        { name: "감자", description: "수미 감자", price: 2500, unit: "개", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", inStock: true },
        { name: "대파", description: "국산 대파", price: 1200, unit: "단", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "생강", description: "신선한 생강", price: 2800, unit: "개", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "고추", description: "청양고추", price: 2200, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1583487162692-a25330b79de7?w=400", inStock: true },
        { name: "배추", description: "절임용 배추", price: 3500, unit: "포기", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", inStock: true },
        { name: "무", description: "국산 무", price: 2000, unit: "개", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", inStock: true },
        { name: "시금치", description: "유기농 시금치", price: 2500, unit: "단", imageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400", inStock: true },
        { name: "상추", description: "포장 상추", price: 2000, unit: "팩", imageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400", inStock: true },
        { name: "브로콜리", description: "신선한 브로콜리", price: 3000, unit: "개", imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400", inStock: true },
        { name: "콩나물", description: "국산 콩나물", price: 1800, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "숙주나물", description: "신선한 숙주나물", price: 1500, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "버섯", description: "팽이버섯", price: 2200, unit: "팩", imageUrl: "https://images.unsplash.com/photo-1600627428268-b8bf5b48eb86?w=400", inStock: true },
        { name: "김치", description: "김치", price: 5000, unit: "포기", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "계란", description: "신선한 계란", price: 3500, unit: "판", imageUrl: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400", inStock: true },
        { name: "우유", description: "저지방 우유", price: 2800, unit: "팩", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400", inStock: true },
        { name: "치즈", description: "모짜렐라 치즈", price: 4500, unit: "팩", imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32b?w=400", inStock: true },
        { name: "소고기", description: "한우 등심", price: 15000, unit: "g", imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400", inStock: true },
        { name: "돼지고기", description: "국산 삼겹살", price: 8000, unit: "g", imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400", inStock: true },
        { name: "닭고기", description: "닭가슴살", price: 3500, unit: "g", imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400", inStock: true },
        { name: "연어", description: "노르웨이 연어", price: 12000, unit: "g", imageUrl: "https://images.unsplash.com/photo-1485703587411-83405405b4fd?w=400", inStock: true },
        { name: "새우", description: "냉동 새우", price: 8500, unit: "g", imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400", inStock: true },
        { name: "오징어", description: "신선한 오징어", price: 6000, unit: "마리", imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400", inStock: true },
        { name: "두부", description: "연두부", price: 2000, unit: "모", imageUrl: "https://images.unsplash.com/photo-1595622524582-c6e0e41aac22?w=400", inStock: true },
        { name: "된장", description: "전통 된장", price: 4000, unit: "통", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "고추장", description: "매운 고추장", price: 3500, unit: "통", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "간장", description: "진간장", price: 3000, unit: "병", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "식초", description: "현미식초", price: 2500, unit: "병", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "설탕", description: "백설탕", price: 2000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "소금", description: "천일염", price: 1800, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "참기름", description: "순참기름", price: 8000, unit: "병", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "들기름", description: "들기름", price: 7000, unit: "병", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "올리브오일", description: "엑스트라 버진", price: 12000, unit: "병", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "밀가루", description: "중력분", price: 2500, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1574323347407-f178e1e81ced?w=400", inStock: true },
        { name: "라면", description: "신라면", price: 1000, unit: "개", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", inStock: true },
        { name: "스파게티면", description: "듀럼밀 파스타", price: 3000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400", inStock: true },
        { name: "우동면", description: "생우동면", price: 2500, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", inStock: true },
        { name: "메밀면", description: "냉메밀면", price: 3500, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", inStock: true },
        { name: "김", description: "구운김", price: 3000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "미역", description: "건미역", price: 4000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "다시마", description: "국물용 다시마", price: 2800, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "멸치", description: "국물용 멸치", price: 3500, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "고춧가루", description: "고운 고춧가루", price: 5000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1583487162692-a25330b79de7?w=400", inStock: true },
        { name: "깨", description: "볶은 깨", price: 4500, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "마요네즈", description: "마요네즈", price: 3000, unit: "통", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
        { name: "케찹", description: "토마토 케찹", price: 2500, unit: "병", imageUrl: "https://images.unsplash.com/photo-1546470427-e4cf2b19e1d4?w=400", inStock: true },
        { name: "머스타드", description: "디종 머스타드", price: 4000, unit: "병", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true }
      ];

      for (const ingredient of sampleIngredients) {
        await this.db.insert(ingredients).values(ingredient);
      }

      // Create 50 sample recipes
      const sampleRecipes = [
        {
          title: "김치찌개",
          description: "매콤하고 시원한 김치찌개",
          instructions: "1. 김치를 기름에 볶는다\n2. 물을 넣고 끓인다\n3. 두부와 돼지고기를 넣는다\n4. 간을 맞춘다",
          ingredients: ["김치", "돼지고기", "두부", "대파"],
          cookingTime: 30,
          servings: 4,
          difficulty: "쉬움",
          imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
          authorId: 1
        },
        {
          title: "불고기",
          description: "달콤한 한국식 불고기",
          instructions: "1. 소고기를 얇게 썬다\n2. 양념장을 만든다\n3. 고기에 양념을 재운다\n4. 팬에 구워낸다",
          ingredients: ["소고기", "양파", "당근", "간장", "설탕"],
          cookingTime: 25,
          servings: 3,
          difficulty: "보통",
          imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
          authorId: 1
        },
        {
          title: "된장찌개",
          description: "구수한 된장찌개",
          instructions: "1. 멸치 다시마로 육수를 낸다\n2. 된장을 푼다\n3. 두부와 야채를 넣는다\n4. 끓여서 완성",
          ingredients: ["된장", "두부", "대파", "양파", "멸치"],
          cookingTime: 20,
          servings: 4,
          difficulty: "쉬움",
          imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
          authorId: 2
        },
        {
          title: "계란볶음밥",
          description: "간단한 계란볶음밥",
          instructions: "1. 계란을 스크램블한다\n2. 밥을 넣고 볶는다\n3. 간장으로 간을 한다\n4. 파를 넣어 마무리",
          ingredients: ["쌀", "계란", "대파", "간장", "참기름"],
          cookingTime: 15,
          servings: 2,
          difficulty: "쉬움",
          imageUrl: "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400",
          authorId: 2
        },
        {
          title: "연어구이",
          description: "고급스러운 연어구이",
          instructions: "1. 연어에 소금 후추를 한다\n2. 팬에 기름을 두른다\n3. 연어를 굽는다\n4. 레몬과 함께 서빙",
          ingredients: ["연어", "올리브오일", "소금", "후추"],
          cookingTime: 20,
          servings: 2,
          difficulty: "보통",
          imageUrl: "https://images.unsplash.com/photo-1485703587411-83405405b4fd?w=400",
          authorId: 3
        },
        {
          title: "새우볶음",
          description: "마늘향 가득한 새우볶음",
          instructions: "1. 새우를 손질한다\n2. 마늘을 볶는다\n3. 새우를 넣고 볶는다\n4. 파슬리로 장식",
          ingredients: ["새우", "마늘", "올리브오일", "소금"],
          cookingTime: 10,
          servings: 2,
          difficulty: "쉬움",
          imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400",
          authorId: 3
        },
        {
          title: "스파게티 카르보나라",
          description: "크리미한 이탈리아 파스타",
          instructions: "1. 파스타를 삶는다\n2. 베이컨을 볶는다\n3. 계란과 치즈를 섞는다\n4. 모든 재료를 합친다",
          ingredients: ["스파게티면", "계란", "치즈", "올리브오일"],
          cookingTime: 25,
          servings: 2,
          difficulty: "보통",
          imageUrl: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400",
          authorId: 4
        },
        {
          title: "치킨 샐러드",
          description: "건강한 치킨 샐러드",
          instructions: "1. 닭가슴살을 굽는다\n2. 야채를 썬다\n3. 드레싱을 만든다\n4. 모든 재료를 섞는다",
          ingredients: ["닭고기", "상추", "토마토", "올리브오일"],
          cookingTime: 20,
          servings: 2,
          difficulty: "쉬움",
          imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
          authorId: 4
        },
        {
          title: "미역국",
          description: "산후조리 필수 미역국",
          instructions: "1. 미역을 불린다\n2. 참기름에 볶는다\n3. 물을 넣고 끓인다\n4. 간을 맞춘다",
          ingredients: ["미역", "소고기", "참기름", "간장"],
          cookingTime: 30,
          servings: 4,
          difficulty: "쉬움",
          imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
          authorId: 5
        },
        {
          title: "제육볶음",
          description: "매콤달콤한 제육볶음",
          instructions: "1. 돼지고기를 양념한다\n2. 야채를 썬다\n3. 강한 불에 볶는다\n4. 대파를 넣어 마무리",
          ingredients: ["돼지고기", "양파", "고추장", "대파"],
          cookingTime: 20,
          servings: 3,
          difficulty: "보통",
          imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
          authorId: 5
        }
      ];

      for (const recipe of sampleRecipes) {
        await this.db.insert(recipes).values(recipe);
      }

      console.log("Sample data initialization completed");
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // Recipe methods
  async getRecipes(): Promise<Recipe[]> {
    return await this.db.select().from(recipes);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const result = await this.db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
    return result[0];
  }

  async getRecipesByAuthor(authorId: number): Promise<Recipe[]> {
    return await this.db.select().from(recipes).where(eq(recipes.authorId, authorId));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const result = await this.db.insert(recipes).values(recipe).returning();
    return result[0];
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return await this.db.select().from(ingredients);
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    const result = await this.db.select().from(ingredients).where(eq(ingredients.id, id)).limit(1);
    return result[0];
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const result = await this.db.insert(ingredients).values(ingredient).returning();
    return result[0];
  }

  // Board post methods
  async getBoardPosts(): Promise<BoardPost[]> {
    return await this.db.select().from(boardPosts);
  }

  async getBoardPost(id: number): Promise<BoardPost | undefined> {
    const result = await this.db.select().from(boardPosts).where(eq(boardPosts.id, id)).limit(1);
    return result[0];
  }

  async createBoardPost(post: InsertBoardPost): Promise<BoardPost> {
    const result = await this.db.insert(boardPosts).values(post).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // Recipe methods
  async getRecipes(): Promise<Recipe[]> {
    return await this.db.select().from(recipes);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const result = await this.db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
    return result[0];
  }

  async getRecipesByAuthor(authorId: number): Promise<Recipe[]> {
    return await this.db.select().from(recipes).where(eq(recipes.authorId, authorId));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const result = await this.db.insert(recipes).values(recipe).returning();
    return result[0];
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return await this.db.select().from(ingredients);
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    const result = await this.db.select().from(ingredients).where(eq(ingredients.id, id)).limit(1);
    return result[0];
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const result = await this.db.insert(ingredients).values(ingredient).returning();
    return result[0];
  }

  // Board post methods
  async getBoardPosts(): Promise<BoardPost[]> {
    return await this.db.select().from(boardPosts);
  }

  async getBoardPost(id: number): Promise<BoardPost | undefined> {
    const result = await this.db.select().from(boardPosts).where(eq(boardPosts.id, id)).limit(1);
    return result[0];
  }

  async createBoardPost(post: InsertBoardPost): Promise<BoardPost> {
    const result = await this.db.insert(boardPosts).values(post).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();