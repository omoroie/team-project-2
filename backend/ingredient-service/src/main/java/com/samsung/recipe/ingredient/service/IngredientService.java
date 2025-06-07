package com.samsung.recipe.ingredient.service;

import com.samsung.recipe.ingredient.dto.IngredientRequestDto;
import com.samsung.recipe.ingredient.dto.IngredientResponseDto;
import com.samsung.recipe.ingredient.entity.Ingredient;
import com.samsung.recipe.ingredient.mapper.IngredientMapper;
import com.samsung.recipe.ingredient.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class IngredientService {
    
    private final IngredientRepository ingredientRepository;
    private final IngredientMapper ingredientMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String INGREDIENT_CACHE_KEY = "ingredient:";
    private static final String INGREDIENTS_LIST_CACHE_KEY = "ingredients:list";
    private static final long CACHE_TTL_HOURS = 6;
    
    @Transactional
    public IngredientResponseDto createIngredient(IngredientRequestDto ingredientRequestDto) {
        log.info("Creating new ingredient: {}", ingredientRequestDto.getName());
        
        Ingredient ingredient = ingredientMapper.toEntity(ingredientRequestDto);
        Ingredient savedIngredient = ingredientRepository.save(ingredient);
        
        cacheIngredient(savedIngredient);
        evictListCache();
        
        log.info("Ingredient created successfully: {}", savedIngredient.getId());
        return ingredientMapper.toResponseDto(savedIngredient);
    }
    
    @Cacheable(value = "ingredients", key = "#id")
    public IngredientResponseDto getIngredientById(Long id) {
        log.info("Fetching ingredient by ID: {}", id);
        
        String cacheKey = INGREDIENT_CACHE_KEY + id;
        Ingredient cachedIngredient = (Ingredient) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedIngredient != null) {
            log.info("Ingredient found in cache: {}", id);
            return ingredientMapper.toResponseDto(cachedIngredient);
        }
        
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        
        cacheIngredient(ingredient);
        return ingredientMapper.toResponseDto(ingredient);
    }
    
    public List<IngredientResponseDto> getAllIngredients() {
        log.info("Fetching all ingredients");
        
        try {
            @SuppressWarnings("unchecked")
            List<Ingredient> cachedIngredients = (List<Ingredient>) redisTemplate.opsForValue().get(INGREDIENTS_LIST_CACHE_KEY);
            
            if (cachedIngredients != null) {
                log.info("Ingredients found in cache");
                return cachedIngredients.stream()
                        .map(ingredientMapper::toResponseDto)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        
        List<Ingredient> ingredients = ingredientRepository.findAll();
        
        try {
            redisTemplate.opsForValue().set(INGREDIENTS_LIST_CACHE_KEY, ingredients, CACHE_TTL_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Failed to cache ingredients list: {}", e.getMessage());
        }
        
        return ingredients.stream()
                .map(ingredientMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<IngredientResponseDto> getIngredientsByCategory(String category) {
        log.info("Fetching ingredients by category: {}", category);
        
        return ingredientRepository.findByCategory(category)
                .stream()
                .map(ingredientMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<IngredientResponseDto> getInStockIngredients() {
        log.info("Fetching in-stock ingredients");
        
        return ingredientRepository.findByInStock(true)
                .stream()
                .map(ingredientMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<IngredientResponseDto> searchIngredients(String keyword) {
        log.info("Searching ingredients with keyword: {}", keyword);
        
        return ingredientRepository.findByNameOrDescriptionContainingIgnoreCase(keyword)
                .stream()
                .map(ingredientMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<IngredientResponseDto> getIngredientsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        log.info("Fetching ingredients by price range: {} - {}", minPrice, maxPrice);
        
        return ingredientRepository.findByPriceBetween(minPrice, maxPrice)
                .stream()
                .map(ingredientMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    @CacheEvict(value = "ingredients", key = "#id")
    public IngredientResponseDto updateIngredient(Long id, IngredientRequestDto ingredientRequestDto) {
        log.info("Updating ingredient: {}", id);
        
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        
        ingredient.setName(ingredientRequestDto.getName());
        ingredient.setDescription(ingredientRequestDto.getDescription());
        ingredient.setPrice(ingredientRequestDto.getPrice());
        ingredient.setUnit(ingredientRequestDto.getUnit());
        ingredient.setInStock(ingredientRequestDto.getInStock());
        ingredient.setStockQuantity(ingredientRequestDto.getStockQuantity());
        ingredient.setCategory(ingredientRequestDto.getCategory());
        ingredient.setSupplier(ingredientRequestDto.getSupplier());
        
        if (ingredientRequestDto.getImageUrl() != null && !ingredientRequestDto.getImageUrl().isEmpty()) {
            ingredient.setImageUrl(ingredientRequestDto.getImageUrl());
        }
        
        Ingredient updatedIngredient = ingredientRepository.save(ingredient);
        
        cacheIngredient(updatedIngredient);
        evictListCache();
        
        log.info("Ingredient updated successfully: {}", id);
        return ingredientMapper.toResponseDto(updatedIngredient);
    }
    
    @Transactional
    @CacheEvict(value = "ingredients", key = "#id")
    public void deleteIngredient(Long id) {
        log.info("Deleting ingredient: {}", id);
        
        if (!ingredientRepository.existsById(id)) {
            throw new RuntimeException("Ingredient not found");
        }
        
        ingredientRepository.deleteById(id);
        
        evictIngredientFromCache(id);
        evictListCache();
        
        log.info("Ingredient deleted successfully: {}", id);
    }
    
    public Long getInStockCount() {
        return ingredientRepository.countByInStock();
    }
    
    private void cacheIngredient(Ingredient ingredient) {
        String cacheKey = INGREDIENT_CACHE_KEY + ingredient.getId();
        redisTemplate.opsForValue().set(cacheKey, ingredient, CACHE_TTL_HOURS, TimeUnit.HOURS);
        log.debug("Ingredient cached: {}", ingredient.getId());
    }
    
    private void evictIngredientFromCache(Long ingredientId) {
        String cacheKey = INGREDIENT_CACHE_KEY + ingredientId;
        redisTemplate.delete(cacheKey);
        log.debug("Ingredient evicted from cache: {}", ingredientId);
    }
    
    private void evictListCache() {
        redisTemplate.delete(INGREDIENTS_LIST_CACHE_KEY);
        log.debug("Ingredient list cache evicted");
    }
}