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
        RecipeResponseDto dto = modelMapper.map(recipe, RecipeResponseDto.class);
        // 수동으로 @Transient 필드들 매핑
        dto.setInstructions(recipe.getInstructions());
        dto.setIngredients(recipe.getIngredients());
        dto.setHashtags(recipe.getHashtags());
        dto.setInstructionImages(recipe.getInstructionImages());
        return dto;
    }
}