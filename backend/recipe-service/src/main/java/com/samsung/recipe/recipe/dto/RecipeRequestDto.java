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
    
    @NotNull(message = "Instructions are required")
    @Size(min = 1, message = "At least one instruction is required")
    private List<String> instructions;
    
    @NotNull(message = "Ingredients are required")
    @Size(min = 1, message = "At least one ingredient is required")
    private List<String> ingredients;
    
    @Positive(message = "Cooking time must be positive")
    private Integer cookingTime;
    
    @Positive(message = "Servings must be positive")
    private Integer servings;
    
    private String difficulty;
    
    private String imageUrl;
    
    private List<String> hashtags;
    
    private List<String> instructionImages;
    
    @NotNull(message = "Author ID is required")
    private Long authorId;
}