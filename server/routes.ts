import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRecipeSchema, insertIngredientSchema, insertBoardPostSchema } from "@shared/schema";
import { z } from "zod";

// Session type for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { ...user, password: undefined } });
  });

  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/best", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      
      // 베스트 레시피 로직 - 실제로는 평점, 조회수, 좋아요 등을 기준으로 정렬
      // 현재는 샘플 데이터로 베스트 레시피 형태로 변환
      const bestRecipes = recipes.slice(0, 10).map((recipe, index) => ({
        ...recipe,
        ranking: index + 1,
        rating: 4.5 + Math.random() * 0.5, // 4.5-5.0 사이 평점
        reviewCount: Math.floor(Math.random() * 500) + 50,
        viewCount: Math.floor(Math.random() * 10000) + 1000,
        author: {
          name: `요리사${index + 1}`,
          avatar: `https://picsum.photos/32/32?random=${index + 10}`
        },
        isVideo: Math.random() > 0.7 // 30% 확률로 비디오
      }));

      res.json(bestRecipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch best recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const recipeData = insertRecipeSchema.parse({
        ...req.body,
        authorId: req.session.userId,
      });
      const recipe = await storage.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      res.status(400).json({ message: "Invalid recipe data" });
    }
  });

  // Ingredient routes
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredients" });
    }
  });

  app.post("/api/ingredients", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const ingredientData = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(ingredientData);
      res.status(201).json(ingredient);
    } catch (error) {
      res.status(400).json({ message: "Invalid ingredient data" });
    }
  });

  // Board routes (corporate users only)
  app.get("/api/board", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isCorporate) {
      return res.status(403).json({ message: "Corporate access required" });
    }

    try {
      const posts = await storage.getBoardPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch board posts" });
    }
  });

  app.post("/api/board", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isCorporate) {
      return res.status(403).json({ message: "Corporate access required" });
    }

    try {
      const postData = insertBoardPostSchema.parse({
        ...req.body,
        authorId: req.session.userId,
      });
      const post = await storage.createBoardPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
