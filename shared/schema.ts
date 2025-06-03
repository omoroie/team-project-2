import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isCorporate: boolean("is_corporate").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  ingredients: text("ingredients").array().notNull(),
  cookingTime: integer("cooking_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
  imageUrl: text("image_url"),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  unit: text("unit").notNull(),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const boardPosts = pgTable("board_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
});

export const insertBoardPostSchema = createInsertSchema(boardPosts).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertBoardPost = z.infer<typeof insertBoardPostSchema>;
export type BoardPost = typeof boardPosts.$inferSelect;
