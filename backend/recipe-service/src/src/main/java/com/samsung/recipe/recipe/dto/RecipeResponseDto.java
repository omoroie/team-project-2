package com.samsung.recipe.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeResponseDto {
    private Long id;
    private String title;
    private String description;
    private List<RecipeStepDto> steps;
    private List<RecipeIngredientDetailDto> ingredients;
    private Integer cookingTime;
    private Integer servings;
    private String difficulty;
    private String imageUrl;
    private List<TagDto> tags;
    private Integer ingredientsCount;
    private String kind;
    private String situation;
    private String mainIngredient;
    private String cookingMethod;
    private String writerId;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}