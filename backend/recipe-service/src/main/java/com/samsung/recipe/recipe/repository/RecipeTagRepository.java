package com.samsung.recipe.recipe.repository;

import com.samsung.recipe.recipe.entity.RecipeTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeTagRepository extends JpaRepository<RecipeTag, Long> {
    List<RecipeTag> findByRecipeId(Long recipeId);
    List<RecipeTag> findByRecipeIdIn(List<Long> recipeIds);
} 