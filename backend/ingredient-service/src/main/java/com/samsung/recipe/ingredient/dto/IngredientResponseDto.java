package com.samsung.recipe.ingredient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String unit;
    private Boolean inStock;
    private Integer stockQuantity;
    private String imageUrl;
    private String category;
    private String supplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}