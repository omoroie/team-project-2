package com.samsung.recipe.recipe.repository;

import com.samsung.recipe.recipe.entity.RecipeTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeTagRepository extends JpaRepository<RecipeTag, Long> {
    List<RecipeTag> findByRecipeId(Long recipeId);
    @Query("SELECT rt FROM RecipeTag rt JOIN rt.tag t WHERE rt.recipeId = :recipeId")
    List<RecipeTag> findByRecipeIdWithTag(@Param("recipeId") Long recipeId);
    void deleteByRecipeId(Long recipeId);
    void deleteByTagId(Long tagId);
} 