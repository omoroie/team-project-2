package com.samsung.recipe.recipe.service;

import com.samsung.recipe.recipe.dto.RecipeRequestDto;
import com.samsung.recipe.recipe.dto.RecipeResponseDto;
import com.samsung.recipe.recipe.entity.Recipe;
import com.samsung.recipe.recipe.mapper.RecipeMapper;
import com.samsung.recipe.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecipeService {
    
    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UnsplashService unsplashService;
    
    private static final String RECIPE_CACHE_KEY = "recipe:";
    private static final String RECIPES_LIST_CACHE_KEY = "recipes:list";
    private static final long CACHE_TTL_HOURS = 12;
    
    @Transactional
    public RecipeResponseDto createRecipe(RecipeRequestDto recipeRequestDto) {
        log.info("Creating new recipe: {}", recipeRequestDto.getTitle());
        
        Recipe recipe = recipeMapper.toEntity(recipeRequestDto);
        
        // Generate image if not provided
        if (recipe.getImageUrl() == null || recipe.getImageUrl().isEmpty()) {
            String imageUrl = unsplashService.getRecipeImage(recipe.getTitle());
            recipe.setImageUrl(imageUrl);
        }
        
        Recipe savedRecipe = recipeRepository.save(recipe);
        
        // Cache the recipe
        cacheRecipe(savedRecipe);
        
        // Invalidate list cache
        evictListCache();
        
        log.info("Recipe created successfully: {}", savedRecipe.getId());
        return recipeMapper.toResponseDto(savedRecipe);
    }
    
    @Cacheable(value = "recipes", key = "#id")
    public RecipeResponseDto getRecipeById(Long id) {
        log.info("Fetching recipe by ID: {}", id);
        
        // Check cache first
        String cacheKey = RECIPE_CACHE_KEY + id;
        Recipe cachedRecipe = (Recipe) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedRecipe != null) {
            log.info("Recipe found in cache: {}", id);
            return recipeMapper.toResponseDto(cachedRecipe);
        }
        
        // Fetch from database
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        cacheRecipe(recipe);
        return recipeMapper.toResponseDto(recipe);
    }
    
    public List<RecipeResponseDto> getAllRecipes() {
        log.info("Fetching all recipes");
        
        // Check cache first
        @SuppressWarnings("unchecked")
        List<Recipe> cachedRecipes = (List<Recipe>) redisTemplate.opsForValue().get(RECIPES_LIST_CACHE_KEY);
        
        if (cachedRecipes != null) {
            log.info("Recipes found in cache");
            return cachedRecipes.stream()
                    .map(recipeMapper::toResponseDto)
                    .collect(Collectors.toList());
        }
        
        // Fetch from database
        List<Recipe> recipes = recipeRepository.findAll();
        
        // Cache the list
        redisTemplate.opsForValue().set(RECIPES_LIST_CACHE_KEY, recipes, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return recipes.stream()
                .map(recipeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getBestRecipes(int limit) {
        log.info("Fetching best recipes with limit: {}", limit);
        
        String cacheKey = "recipes:best:" + limit;
        
        // Check cache first
        @SuppressWarnings("unchecked")
        List<Recipe> cachedRecipes = (List<Recipe>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedRecipes != null) {
            log.info("Best recipes found in cache");
            return cachedRecipes.stream()
                    .map(recipeMapper::toResponseDto)
                    .collect(Collectors.toList());
        }
        
        // Fetch from database - order by rating and view count
        Pageable pageable = PageRequest.of(0, limit);
        List<Recipe> recipes = recipeRepository.findTopRecipes(pageable);
        
        // Cache the list
        redisTemplate.opsForValue().set(cacheKey, recipes, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        return recipes.stream()
                .map(recipeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getRecipesByAuthor(Long authorId) {
        log.info("Fetching recipes by author: {}", authorId);
        
        return recipeRepository.findByAuthorId(authorId)
                .stream()
                .map(recipeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> searchRecipes(String keyword) {
        log.info("Searching recipes with keyword: {}", keyword);
        
        return recipeRepository.findByTitleOrDescriptionContainingIgnoreCase(keyword)
                .stream()
                .map(recipeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getRecipesByDifficulty(String difficulty) {
        log.info("Fetching recipes by difficulty: {}", difficulty);
        
        return recipeRepository.findByDifficulty(difficulty)
                .stream()
                .map(recipeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getRecipesByCookingTime(Integer maxTime) {
        log.info("Fetching recipes with cooking time <= {}", maxTime);
        
        return recipeRepository.findByCookingTimeLessThanEqual(maxTime)
                .stream()
                .map(recipeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public Page<RecipeResponseDto> getRecentRecipes(int page, int size) {
        log.info("Fetching recent recipes: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Recipe> recipePage = recipeRepository.findAllOrderByCreatedAtDesc(pageable);
        
        return recipePage.map(recipeMapper::toResponseDto);
    }
    
    @Transactional
    @CacheEvict(value = "recipes", key = "#id")
    public RecipeResponseDto updateRecipe(Long id, RecipeRequestDto recipeRequestDto) {
        log.info("Updating recipe: {}", id);
        
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        // Update fields
        recipe.setTitle(recipeRequestDto.getTitle());
        recipe.setDescription(recipeRequestDto.getDescription());
        recipe.setInstructions(recipeRequestDto.getInstructions());
        recipe.setIngredients(recipeRequestDto.getIngredients());
        recipe.setCookingTime(recipeRequestDto.getCookingTime());
        recipe.setServings(recipeRequestDto.getServings());
        recipe.setDifficulty(recipeRequestDto.getDifficulty());
        
        if (recipeRequestDto.getImageUrl() != null && !recipeRequestDto.getImageUrl().isEmpty()) {
            recipe.setImageUrl(recipeRequestDto.getImageUrl());
        }
        
        Recipe updatedRecipe = recipeRepository.save(recipe);
        
        // Update cache
        cacheRecipe(updatedRecipe);
        evictListCache();
        
        log.info("Recipe updated successfully: {}", id);
        return recipeMapper.toResponseDto(updatedRecipe);
    }
    
    @Transactional
    @CacheEvict(value = "recipes", key = "#id")
    public void deleteRecipe(Long id) {
        log.info("Deleting recipe: {}", id);
        
        if (!recipeRepository.existsById(id)) {
            throw new RuntimeException("Recipe not found");
        }
        
        recipeRepository.deleteById(id);
        
        // Remove from cache
        evictRecipeFromCache(id);
        evictListCache();
        
        log.info("Recipe deleted successfully: {}", id);
    }
    
    public Long getRecipeCountByAuthor(Long authorId) {
        return recipeRepository.countByAuthorId(authorId);
    }
    
    private void cacheRecipe(Recipe recipe) {
        String cacheKey = RECIPE_CACHE_KEY + recipe.getId();
        redisTemplate.opsForValue().set(cacheKey, recipe, CACHE_TTL_HOURS, TimeUnit.HOURS);
        log.debug("Recipe cached: {}", recipe.getId());
    }
    
    private void evictRecipeFromCache(Long recipeId) {
        String cacheKey = RECIPE_CACHE_KEY + recipeId;
        redisTemplate.delete(cacheKey);
        log.debug("Recipe evicted from cache: {}", recipeId);
    }
    
    private void evictListCache() {
        redisTemplate.delete(RECIPES_LIST_CACHE_KEY);
        log.debug("Recipe list cache evicted");
    }
}