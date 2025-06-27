package com.samsung.recipe.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeStepDto {
    private Integer stepIndex;
    private String description;
    private String imageUrl;
} 