package com.samsung.recipe.recipe.mapper;

import com.samsung.recipe.recipe.dto.*;
import com.samsung.recipe.recipe.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RecipeMapper {

    // Request DTO → 엔티티 변환
    public Recipe toEntity(RecipeRequestDto dto) {
        Recipe recipe = Recipe.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .cookingTime(dto.getCookingTime())
                .servings(dto.getServings())
                .difficulty(dto.getDifficulty())
                .imageUrl(dto.getImageUrl())
                .ingredientsCount(dto.getIngredientsCount())
                .kind(dto.getKind())
                .situation(dto.getSituation())
                .mainIngredient(dto.getMainIngredient())
                .cookingMethod(dto.getCookingMethod())
                .writerId(dto.getWriterId())
                .build();
        return recipe;
    }

    public List<RecipeStep> toRecipeStepEntities(List<RecipeStepDto> dtos, Long recipeId) {
        if (dtos == null) return null;
        return dtos.stream()
                .map(dto -> RecipeStep.builder()
                        .recipeId(recipeId)
                        .stepIndex(dto.getStepIndex())
                        .description(dto.getDescription())
                        .imageUrl(dto.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    public List<RecipeIngredient> toRecipeIngredientEntities(List<RecipeIngredientDto> dtos, Long recipeId, List<Ingredient> ingredientEntities) {
        if (dtos == null) return null;
        return dtos.stream()
                .map(dto -> {
                    Ingredient ingredient = ingredientEntities.stream()
                            .filter(i -> i.getName().equals(dto.getIngredientName()))
                            .findFirst().orElse(null);
                    return RecipeIngredient.builder()
                            .recipeId(recipeId)
                            .ingredientId(ingredient != null ? ingredient.getId() : null)
                            .amount(dto.getAmount())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<RecipeTag> toRecipeTagEntities(List<TagDto> dtos, Long recipeId, List<Tag> tagEntities) {
        if (dtos == null) return null;
        return dtos.stream()
                .map(dto -> {
                    Tag tag = tagEntities.stream()
                            .filter(t -> t.getName().equals(dto.getName()))
                            .findFirst().orElse(null);
                    return RecipeTag.builder()
                            .recipeId(recipeId)
                            .tagId(tag != null ? tag.getId() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 엔티티 → Response DTO 변환
    public RecipeResponseDto toResponseDto(Recipe recipe, List<RecipeStep> steps, List<RecipeIngredient> recipeIngredients, List<Ingredient> ingredients, List<RecipeTag> recipeTags, List<Tag> tags) {
        return RecipeResponseDto.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .cookingTime(recipe.getCookingTime())
                .servings(recipe.getServings())
                .difficulty(recipe.getDifficulty())
                .imageUrl(recipe.getImageUrl())
                .ingredientsCount(recipe.getIngredientsCount())
                .kind(recipe.getKind())
                .situation(recipe.getSituation())
                .mainIngredient(recipe.getMainIngredient())
                .cookingMethod(recipe.getCookingMethod())
                .writerId(recipe.getWriterId())
                .viewCount(recipe.getViewCount())
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .steps(steps == null ? null : steps.stream().map(this::toStepDto).collect(Collectors.toList()))
                .ingredients(recipeIngredients == null ? null : recipeIngredients.stream().map(ri -> toIngredientDetailDto(ri, ingredients)).collect(Collectors.toList()))
                .tags(recipeTags == null ? null : recipeTags.stream().map(rt -> toTagDto(rt, tags)).collect(Collectors.toList()))
                .build();
    }

    public RecipeStepDto toStepDto(RecipeStep step) {
        return RecipeStepDto.builder()
                .stepIndex(step.getStepIndex())
                .description(step.getDescription())
                .imageUrl(step.getImageUrl())
                .build();
    }

    public RecipeIngredientDetailDto toIngredientDetailDto(RecipeIngredient ri, List<Ingredient> ingredients) {
        Ingredient ingredient = ingredients.stream()
                .filter(i -> i.getId().equals(ri.getIngredientId()))
                .findFirst().orElse(null);
        return RecipeIngredientDetailDto.builder()
                .ingredientId(ri.getIngredientId())
                .ingredientName(ingredient != null ? ingredient.getName() : null)
                .amount(ri.getAmount())
                .build();
    }

    public TagDto toTagDto(RecipeTag rt, List<Tag> tags) {
        Tag tag = tags.stream()
                .filter(t -> t.getId().equals(rt.getTagId()))
                .findFirst().orElse(null);
        return TagDto.builder()
                .name(tag != null ? tag.getName() : null)
                .build();
    }
}