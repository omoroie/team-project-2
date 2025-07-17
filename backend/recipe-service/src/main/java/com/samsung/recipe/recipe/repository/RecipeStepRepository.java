package com.samsung.recipe.recipe.repository;

import com.samsung.recipe.recipe.entity.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeStepRepository extends JpaRepository<RecipeStep, Long> {
    List<RecipeStep> findByRecipeIdOrderByStepIndex(Long recipeId);
    List<RecipeStep> findByRecipeIdInOrderByRecipeIdAscStepIndexAsc(List<Long> recipeIds);
} 