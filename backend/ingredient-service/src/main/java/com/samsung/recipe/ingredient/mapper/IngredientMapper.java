package com.samsung.recipe.ingredient.mapper;

import com.samsung.recipe.ingredient.dto.IngredientRequestDto;
import com.samsung.recipe.ingredient.dto.IngredientResponseDto;
import com.samsung.recipe.ingredient.entity.Ingredient;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class IngredientMapper {
    
    @Autowired
    private ModelMapper modelMapper;
    
    public Ingredient toEntity(IngredientRequestDto ingredientRequestDto) {
        return modelMapper.map(ingredientRequestDto, Ingredient.class);
    }
    
    public IngredientResponseDto toResponseDto(Ingredient ingredient) {
        return modelMapper.map(ingredient, IngredientResponseDto.class);
    }
}