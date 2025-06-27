package com.samsung.recipe.recipe.repository;

import com.samsung.recipe.recipe.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    
    List<RecipeIngredient> findByRecipeId(Long recipeId);
    
    @Query("SELECT ri FROM RecipeIngredient ri JOIN ri.ingredient i WHERE ri.recipeId = :recipeId")
    List<RecipeIngredient> findByRecipeIdWithIngredient(@Param("recipeId") Long recipeId);
    
    void deleteByRecipeId(Long recipeId);
    
    void deleteByIngredientId(Long ingredientId);
} 