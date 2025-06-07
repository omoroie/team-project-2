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
    private List<String> instructions;
    private List<String> ingredients;
    private Integer cookingTime;
    private Integer servings;
    private String difficulty;
    private String imageUrl;
    private List<String> hashtags;
    private Long authorId;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}