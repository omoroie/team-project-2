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
    // Create sample ingredients
    const sampleIngredients = [
      { name: "토마토", description: "신선한 토마토", price: 2000, unit: "개", imageUrl: "https://images.unsplash.com/photo-1546470427-e4cf2b19e1d4?w=400", inStock: true },
      { name: "양파", description: "국산 양파", price: 1500, unit: "개", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", inStock: true },
      { name: "마늘", description: "햇마늘", price: 3000, unit: "봉", imageUrl: "https://images.unsplash.com/photo-1553978297-833d09932d37?w=400", inStock: true },
      { name: "쌀", description: "신동진쌀", price: 15000, unit: "kg", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", inStock: true },
    ];

    for (const ingredient of sampleIngredients) {
      await this.createIngredient(ingredient);
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
