package com.samsung.recipe.recipe.repository;

import com.samsung.recipe.recipe.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    List<Recipe> findByAuthorId(Long authorId);
    
    @Query("SELECT r FROM Recipe r WHERE r.title ILIKE %:keyword% OR r.description ILIKE %:keyword%")
    List<Recipe> findByTitleOrDescriptionContainingIgnoreCase(@Param("keyword") String keyword);
    
    @Query("SELECT r FROM Recipe r WHERE r.difficulty = :difficulty")
    List<Recipe> findByDifficulty(@Param("difficulty") String difficulty);
    
    @Query("SELECT r FROM Recipe r WHERE r.cookingTime <= :maxTime")
    List<Recipe> findByCookingTimeLessThanEqual(@Param("maxTime") Integer maxTime);
    
    @Query("SELECT r FROM Recipe r WHERE r.servings >= :minServings AND r.servings <= :maxServings")
    List<Recipe> findByServingsBetween(@Param("minServings") Integer minServings, @Param("maxServings") Integer maxServings);
    
    @Query("SELECT r FROM Recipe r ORDER BY r.createdAt DESC")
    Page<Recipe> findAllOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT COUNT(r) FROM Recipe r WHERE r.authorId = :authorId")
    Long countByAuthorId(@Param("authorId") Long authorId);
    
    @Query("SELECT r FROM Recipe r ORDER BY r.rating DESC, r.viewCount DESC")
    List<Recipe> findTopRecipes(Pageable pageable);
}