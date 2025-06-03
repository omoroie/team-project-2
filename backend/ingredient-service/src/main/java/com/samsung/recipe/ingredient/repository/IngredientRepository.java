package com.samsung.recipe.ingredient.repository;

import com.samsung.recipe.ingredient.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    
    List<Ingredient> findByCategory(String category);
    
    List<Ingredient> findByInStock(Boolean inStock);
    
    @Query("SELECT i FROM Ingredient i WHERE i.name ILIKE %:keyword% OR i.description ILIKE %:keyword%")
    List<Ingredient> findByNameOrDescriptionContainingIgnoreCase(@Param("keyword") String keyword);
    
    @Query("SELECT i FROM Ingredient i WHERE i.price BETWEEN :minPrice AND :maxPrice")
    List<Ingredient> findByPriceBetween(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT i FROM Ingredient i WHERE i.supplier = :supplier")
    List<Ingredient> findBySupplier(@Param("supplier") String supplier);
    
    @Query("SELECT COUNT(i) FROM Ingredient i WHERE i.inStock = true")
    Long countByInStock();
}