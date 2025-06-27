package com.samsung.recipe.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequestDto {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Positive(message = "Cooking time must be positive")
    private Integer cookingTime;
    
    @Positive(message = "Servings must be positive")
    private Integer servings;
    
    private String difficulty;
    
    private String imageUrl;
    
    @NotBlank(message = "Writer ID is required")
    private String writerId;
    
    private Integer ingredientsCount;
    
    private String kind;
    
    private String situation;
    
    private String mainIngredient;
    
    private String cookingMethod;
    
    // 재료 정보
    private List<RecipeIngredientDto> ingredients;
    
    // 조리법 정보
    private List<RecipeStepDto> steps;
    
    // 태그 정보
    private List<TagDto> tags;
}