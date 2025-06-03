package com.samsung.recipe.ingredient.controller;

import com.samsung.recipe.ingredient.dto.IngredientRequestDto;
import com.samsung.recipe.ingredient.dto.IngredientResponseDto;
import com.samsung.recipe.ingredient.service.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ingredients")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class IngredientController {
    
    private final IngredientService ingredientService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createIngredient(@Valid @RequestBody IngredientRequestDto ingredientRequestDto) {
        try {
            IngredientResponseDto ingredient = ingredientService.createIngredient(ingredientRequestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ingredient created successfully");
            response.put("ingredient", ingredient);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Ingredient creation failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IngredientResponseDto> getIngredientById(@PathVariable Long id) {
        try {
            IngredientResponseDto ingredient = ingredientService.getIngredientById(id);
            return ResponseEntity.ok(ingredient);
            
        } catch (RuntimeException e) {
            log.error("Ingredient fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<IngredientResponseDto>> getAllIngredients() {
        try {
            List<IngredientResponseDto> ingredients = ingredientService.getAllIngredients();
            return ResponseEntity.ok(ingredients);
            
        } catch (Exception e) {
            log.error("Ingredients fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<IngredientResponseDto>> getIngredientsByCategory(@PathVariable String category) {
        try {
            List<IngredientResponseDto> ingredients = ingredientService.getIngredientsByCategory(category);
            return ResponseEntity.ok(ingredients);
            
        } catch (Exception e) {
            log.error("Category ingredients fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/in-stock")
    public ResponseEntity<List<IngredientResponseDto>> getInStockIngredients() {
        try {
            List<IngredientResponseDto> ingredients = ingredientService.getInStockIngredients();
            return ResponseEntity.ok(ingredients);
            
        } catch (Exception e) {
            log.error("In-stock ingredients fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<IngredientResponseDto>> searchIngredients(@RequestParam String keyword) {
        try {
            List<IngredientResponseDto> ingredients = ingredientService.searchIngredients(keyword);
            return ResponseEntity.ok(ingredients);
            
        } catch (Exception e) {
            log.error("Ingredient search failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/price-range")
    public ResponseEntity<List<IngredientResponseDto>> getIngredientsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        try {
            List<IngredientResponseDto> ingredients = ingredientService.getIngredientsByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(ingredients);
            
        } catch (Exception e) {
            log.error("Price range ingredients fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateIngredient(@PathVariable Long id, @Valid @RequestBody IngredientRequestDto ingredientRequestDto) {
        try {
            IngredientResponseDto updatedIngredient = ingredientService.updateIngredient(id, ingredientRequestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ingredient updated successfully");
            response.put("ingredient", updatedIngredient);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Ingredient update failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteIngredient(@PathVariable Long id) {
        try {
            ingredientService.deleteIngredient(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ingredient deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Ingredient deletion failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    @GetMapping("/stats/in-stock-count")
    public ResponseEntity<Map<String, Object>> getInStockCount() {
        Long count = ingredientService.getInStockCount();
        
        Map<String, Object> response = new HashMap<>();
        response.put("inStockCount", count);
        
        return ResponseEntity.ok(response);
    }
}