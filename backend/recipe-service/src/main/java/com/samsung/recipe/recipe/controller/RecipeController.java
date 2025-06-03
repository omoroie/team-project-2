package com.samsung.recipe.recipe.controller;

import com.samsung.recipe.recipe.dto.RecipeRequestDto;
import com.samsung.recipe.recipe.dto.RecipeResponseDto;
import com.samsung.recipe.recipe.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RecipeController {
    
    private final RecipeService recipeService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRecipe(@Valid @RequestBody RecipeRequestDto recipeRequestDto) {
        try {
            RecipeResponseDto recipe = recipeService.createRecipe(recipeRequestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Recipe created successfully");
            response.put("recipe", recipe);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Recipe creation failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRecipeById(@PathVariable Long id) {
        try {
            RecipeResponseDto recipe = recipeService.getRecipeById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipe", recipe);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Recipe fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRecipes() {
        try {
            List<RecipeResponseDto> recipes = recipeService.getAllRecipes();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipes", recipes);
            response.put("count", recipes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Recipes fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch recipes");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/author/{authorId}")
    public ResponseEntity<Map<String, Object>> getRecipesByAuthor(@PathVariable Long authorId) {
        try {
            List<RecipeResponseDto> recipes = recipeService.getRecipesByAuthor(authorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipes", recipes);
            response.put("count", recipes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Author recipes fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch author recipes");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchRecipes(@RequestParam String keyword) {
        try {
            List<RecipeResponseDto> recipes = recipeService.searchRecipes(keyword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipes", recipes);
            response.put("count", recipes.size());
            response.put("keyword", keyword);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Recipe search failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to search recipes");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<Map<String, Object>> getRecipesByDifficulty(@PathVariable String difficulty) {
        try {
            List<RecipeResponseDto> recipes = recipeService.getRecipesByDifficulty(difficulty);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipes", recipes);
            response.put("count", recipes.size());
            response.put("difficulty", difficulty);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Difficulty recipes fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch recipes by difficulty");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/cooking-time/{maxTime}")
    public ResponseEntity<Map<String, Object>> getRecipesByCookingTime(@PathVariable Integer maxTime) {
        try {
            List<RecipeResponseDto> recipes = recipeService.getRecipesByCookingTime(maxTime);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipes", recipes);
            response.put("count", recipes.size());
            response.put("maxTime", maxTime);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Cooking time recipes fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch recipes by cooking time");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentRecipes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<RecipeResponseDto> recipePage = recipeService.getRecentRecipes(page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recipes", recipePage.getContent());
            response.put("currentPage", recipePage.getNumber());
            response.put("totalPages", recipePage.getTotalPages());
            response.put("totalElements", recipePage.getTotalElements());
            response.put("size", recipePage.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Recent recipes fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch recent recipes");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRecipe(@PathVariable Long id, @Valid @RequestBody RecipeRequestDto recipeRequestDto) {
        try {
            RecipeResponseDto updatedRecipe = recipeService.updateRecipe(id, recipeRequestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Recipe updated successfully");
            response.put("recipe", updatedRecipe);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Recipe update failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRecipe(@PathVariable Long id) {
        try {
            recipeService.deleteRecipe(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Recipe deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Recipe deletion failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    @GetMapping("/stats/count/author/{authorId}")
    public ResponseEntity<Map<String, Object>> getRecipeCountByAuthor(@PathVariable Long authorId) {
        Long count = recipeService.getRecipeCountByAuthor(authorId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("authorId", authorId);
        response.put("recipeCount", count);
        
        return ResponseEntity.ok(response);
    }
}