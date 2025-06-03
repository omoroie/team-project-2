package com.samsung.recipe.recipe.mapper;

import com.samsung.recipe.recipe.dto.RecipeRequestDto;
import com.samsung.recipe.recipe.dto.RecipeResponseDto;
import com.samsung.recipe.recipe.entity.Recipe;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecipeMapper {
    
    @Autowired
    private ModelMapper modelMapper;
    
    public Recipe toEntity(RecipeRequestDto recipeRequestDto) {
        return modelMapper.map(recipeRequestDto, Recipe.class);
    }
    
    public RecipeResponseDto toResponseDto(Recipe recipe) {
        return modelMapper.map(recipe, RecipeResponseDto.class);
    }
}