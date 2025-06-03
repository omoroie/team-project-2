import { users, recipes, ingredients, boardPosts, type User, type InsertUser, type Recipe, type InsertRecipe, type Ingredient, type InsertIngredient, type BoardPost, type InsertBoardPost } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private ingredients: Map<number, Ingredient>;
  private boardPosts: Map<number, BoardPost>;
  private currentUserId: number;
  private currentRecipeId: number;
  private currentIngredientId: number;
  private currentBoardPostId: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.ingredients = new Map();
    this.boardPosts = new Map();
    this.currentUserId = 1;
    this.currentRecipeId = 1;
    this.currentIngredientId = 1;
    this.currentBoardPostId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample user first
    const sampleUser = await this.createUser({
      username: "admin",
      email: "admin@recipe.com",
      password: "admin123",
      isCorporate: false
    });

    // Create sample ingredients
    const sampleIngredients = [
      { name: "토마토", description: "신선한 토마토", price: 2000, unit: "개", imageUrl: "https://picsum.photos/400/300?random=1", inStock: true },
      { name: "양파", description: "국산 양파", price: 1500, unit: "개", imageUrl: "https://picsum.photos/400/300?random=2", inStock: true },
      { name: "마늘", description: "햇마늘", price: 3000, unit: "봉", imageUrl: "https://picsum.photos/400/300?random=3", inStock: true },
      { name: "쌀", description: "신동진쌀", price: 15000, unit: "kg", imageUrl: "https://picsum.photos/400/300?random=4", inStock: true },
    ];

    for (const ingredient of sampleIngredients) {
      await this.createIngredient(ingredient);
    }

    // Create sample recipes
    const sampleRecipes = [
      {
        title: "유명한 볶음밥 황금 레시피",
        description: "집에서 쉽게 만드는 맛있는 볶음밥",
        instructions: "1. 밥을 준비하고 2. 야채를 볶고 3. 밥과 함께 볶아주세요",
        ingredients: ["쌀", "양파", "마늘", "간장"],
        cookingTime: 15,
        servings: 2,
        difficulty: "초급",
        imageUrl: "https://picsum.photos/400/300?random=101",
        authorId: sampleUser.id,
        type: "한식",
        category: "밥류"
      },
      {
        title: "오징어 볶음, 한국 맛이 일품인 백종원 레시피",
        description: "매콤달콤한 오징어볶음",
        instructions: "1. 오징어를 손질하고 2. 양념을 만들어 3. 볶아주세요",
        ingredients: ["오징어", "양파", "당근", "고추장"],
        cookingTime: 20,
        servings: 3,
        difficulty: "중급",
        imageUrl: "https://picsum.photos/400/300?random=102",
        authorId: sampleUser.id,
        type: "한식",
        category: "반찬"
      },
      {
        title: "된장 라면, 소고기와 함께 만든 백종원 레시피",
        description: "진한 된장 국물의 라면",
        instructions: "1. 된장을 우리고 2. 소고기를 볶아 3. 라면을 끓여주세요",
        ingredients: ["라면", "된장", "소고기", "파"],
        cookingTime: 10,
        servings: 1,
        difficulty: "초급",
        imageUrl: "https://picsum.photos/400/300?random=103",
        authorId: sampleUser.id,
        type: "한식",
        category: "면류"
      },
      {
        title: "마지막 장에서, 소고기 미역국 만들기",
        description: "영양 만점 소고기 미역국",
        instructions: "1. 미역을 불리고 2. 소고기를 볶아 3. 국물을 끓여주세요",
        ingredients: ["미역", "소고기", "마늘", "참기름"],
        cookingTime: 30,
        servings: 4,
        difficulty: "중급",
        imageUrl: "https://picsum.photos/400/300?random=104",
        authorId: sampleUser.id,
        type: "한식",
        category: "국물"
      },
      {
        title: "백설 오이무침 새콤달콤 만들기",
        description: "아삭한 오이무침",
        instructions: "1. 오이를 썰고 2. 양념을 만들어 3. 버무려주세요",
        ingredients: ["오이", "식초", "설탕", "마늘"],
        cookingTime: 15,
        servings: 2,
        difficulty: "초급",
        imageUrl: "https://picsum.photos/400/300?random=105",
        authorId: sampleUser.id,
        type: "한식",
        category: "반찬"
      },
      {
        title: "두부조림 양념갈비 만드는 법",
        description: "부드러운 두부조림",
        instructions: "1. 두부를 자르고 2. 양념을 만들어 3. 조려주세요",
        ingredients: ["두부", "간장", "설탕", "파"],
        cookingTime: 25,
        servings: 3,
        difficulty: "초급",
        imageUrl: "https://picsum.photos/400/300?random=106",
        authorId: sampleUser.id,
        type: "한식",
        category: "반찬"
      },
      {
        title: "순두부찌개, 바지락과 함께하는 계절음식",
        description: "얼큰한 순두부찌개",
        instructions: "1. 바지락을 손질하고 2. 순두부를 넣어 3. 끓여주세요",
        ingredients: ["순두부", "바지락", "김치", "고춧가루"],
        cookingTime: 20,
        servings: 2,
        difficulty: "중급",
        imageUrl: "https://picsum.photos/400/300?random=107",
        authorId: sampleUser.id,
        type: "한식",
        category: "찌개"
      },
      {
        title: "마지막에 버릴뻔한 김치로 고기와 어울리는 비빔밥",
        description: "김치를 활용한 비빔밥",
        instructions: "1. 김치를 볶고 2. 나물을 준비하여 3. 비벼주세요",
        ingredients: ["김치", "고기", "나물", "고추장"],
        cookingTime: 25,
        servings: 2,
        difficulty: "중급",
        imageUrl: "https://picsum.photos/400/300?random=108",
        authorId: sampleUser.id,
        type: "한식",
        category: "밥류"
      },
      {
        title: "이모이가 실패없게 만들 수 있는",
        description: "간단한 김치찌개",
        instructions: "1. 김치를 볶고 2. 물을 넣어 3. 끓여주세요",
        ingredients: ["김치", "돼지고기", "두부", "파"],
        cookingTime: 30,
        servings: 3,
        difficulty: "초급",
        imageUrl: "https://picsum.photos/400/300?random=109",
        authorId: sampleUser.id,
        type: "한식",
        category: "찌개"
      },
      {
        title: "마지막으로 젓갈 맛치게 좋은 감자볶음",
        description: "바삭한 감자볶음",
        instructions: "1. 감자를 썰고 2. 기름에 볶아 3. 양념해주세요",
        ingredients: ["감자", "양파", "청양고추", "간장"],
        cookingTime: 20,
        servings: 2,
        difficulty: "초급",
        imageUrl: "https://picsum.photos/400/300?random=110",
        authorId: sampleUser.id,
        type: "한식",
        category: "반찬"
      }
    ];

    for (const recipe of sampleRecipes) {
      await this.createRecipe(recipe);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isCorporate: insertUser.isCorporate ?? false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Recipe methods
  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipesByAuthor(authorId: number): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.authorId === authorId);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const recipe: Recipe = {
      ...insertRecipe,
      id,
      imageUrl: insertRecipe.imageUrl ?? null,
      createdAt: new Date(),
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const id = this.currentIngredientId++;
    const ingredient: Ingredient = {
      ...insertIngredient,
      id,
      imageUrl: insertIngredient.imageUrl ?? null,
      inStock: insertIngredient.inStock ?? true,
      createdAt: new Date(),
    };
    this.ingredients.set(id, ingredient);
    return ingredient;
  }

  // Board post methods
  async getBoardPosts(): Promise<BoardPost[]> {
    return Array.from(this.boardPosts.values());
  }

  async getBoardPost(id: number): Promise<BoardPost | undefined> {
    return this.boardPosts.get(id);
  }

  async createBoardPost(insertBoardPost: InsertBoardPost): Promise<BoardPost> {
    const id = this.currentBoardPostId++;
    const post: BoardPost = {
      ...insertBoardPost,
      id,
      createdAt: new Date(),
    };
    this.boardPosts.set(id, post);
    return post;
  }
}

export const storage = new MemStorage();
