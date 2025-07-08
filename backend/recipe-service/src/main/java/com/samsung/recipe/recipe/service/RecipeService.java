package com.samsung.recipe.recipe.service;

import com.samsung.recipe.recipe.dto.RecipeRequestDto;
import com.samsung.recipe.recipe.dto.RecipeResponseDto;
import com.samsung.recipe.recipe.entity.Recipe;
import com.samsung.recipe.recipe.entity.RecipeStep;
import com.samsung.recipe.recipe.entity.RecipeIngredient;
import com.samsung.recipe.recipe.entity.Ingredient;
import com.samsung.recipe.recipe.entity.RecipeTag;
import com.samsung.recipe.recipe.entity.Tag;
import com.samsung.recipe.recipe.mapper.RecipeMapper;
import com.samsung.recipe.recipe.repository.RecipeRepository;
import com.samsung.recipe.recipe.repository.RecipeStepRepository;
import com.samsung.recipe.recipe.repository.RecipeIngredientRepository;
import com.samsung.recipe.recipe.repository.IngredientRepository;
import com.samsung.recipe.recipe.repository.RecipeTagRepository;
import com.samsung.recipe.recipe.repository.TagRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecipeService {
    
    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UnsplashService unsplashService;
    private final RecipeStepRepository recipeStepRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientRepository ingredientRepository;
    private final TagRepository tagRepository;
    private final RecipeTagRepository recipeTagRepository;
    
    private static final String RECIPE_CACHE_KEY = "recipe:";
    private static final String RECIPES_LIST_CACHE_KEY = "recipes:list";
    private static final long CACHE_TTL_HOURS = 12;
    
    @Transactional
    public RecipeResponseDto createRecipe(RecipeRequestDto recipeRequestDto) {
        log.info("Creating new recipe: {}", recipeRequestDto.getTitle());
        
        // 1. Recipe 저장 (기본 정보)
        Recipe recipe = recipeMapper.toEntity(recipeRequestDto);
        Recipe savedRecipe = recipeRepository.save(recipe);

        Long recipeId = savedRecipe.getId();

        // 2. 재료 저장 및 연결
        if (recipeRequestDto.getIngredients() != null && !recipeRequestDto.getIngredients().isEmpty()) {
            List<Ingredient> ingredientEntities = recipeRequestDto.getIngredients().stream()
                    .map(dto -> ingredientRepository.findByName(dto.getIngredientName())
                            .orElseGet(() -> ingredientRepository.save(Ingredient.builder().name(dto.getIngredientName()).build())))
                    .collect(Collectors.toList());
            
            List<RecipeIngredient> recipeIngredients = recipeRequestDto.getIngredients().stream()
                    .map(dto -> {
                        Ingredient ingredient = ingredientEntities.stream()
                                .filter(ing -> ing.getName().equals(dto.getIngredientName()))
                                .findFirst()
                                .orElse(null);
                        return RecipeIngredient.builder()
                                .recipeId(recipeId)
                                .ingredientId(ingredient.getId())
                                .amount(dto.getAmount())
                                .build();
                    })
                    .collect(Collectors.toList());
            
            recipeIngredientRepository.saveAll(recipeIngredients);
        }

        // 3. 조리법 저장 (instructions 필드를 steps로 변환)
        List<RecipeStep> steps = new ArrayList<>();
        
        // steps 필드가 있으면 사용
        if (recipeRequestDto.getSteps() != null && !recipeRequestDto.getSteps().isEmpty()) {
            steps = recipeRequestDto.getSteps().stream()
                    .map(dto -> RecipeStep.builder()
                            .recipeId(recipeId)
                            .stepIndex(dto.getStepIndex())
                            .description(dto.getDescription())
                            .imageUrl(dto.getImageUrl())
                            .build())
                    .collect(Collectors.toList());
        }
        // instructions 필드가 있으면 steps로 변환
        else if (recipeRequestDto.getInstructions() != null && !recipeRequestDto.getInstructions().isEmpty()) {
            List<String> instructionImages = recipeRequestDto.getInstructionImages();
            steps = IntStream.range(0, recipeRequestDto.getInstructions().size())
                    .mapToObj(index -> {
                        String instruction = recipeRequestDto.getInstructions().get(index);
                        String imageUrl = instructionImages != null && index < instructionImages.size() ? instructionImages.get(index) : null;
                        return RecipeStep.builder()
                                .recipeId(recipeId)
                                .stepIndex(index + 1)
                                .description(instruction)
                                .imageUrl(imageUrl)
                                .build();
                    })
                    .collect(Collectors.toList());
        }
        
        if (!steps.isEmpty()) {
            recipeStepRepository.saveAll(steps);
        }

        // 4. 태그 저장 및 연결
        if (recipeRequestDto.getTags() != null && !recipeRequestDto.getTags().isEmpty()) {
            List<Tag> tagEntities = recipeRequestDto.getTags().stream()
                    .map(dto -> tagRepository.findByName(dto.getName())
                            .orElseGet(() -> tagRepository.save(Tag.builder().name(dto.getName()).build())))
                    .collect(Collectors.toList());
            
            List<RecipeTag> recipeTags = recipeRequestDto.getTags().stream()
                    .map(dto -> {
                        Tag tag = tagEntities.stream()
                                .filter(t -> t.getName().equals(dto.getName()))
                                .findFirst()
                                .orElse(null);
                        return RecipeTag.builder()
                                .recipeId(recipeId)
                                .tagId(tag.getId())
                                .build();
                    })
                    .collect(Collectors.toList());
            
            recipeTagRepository.saveAll(recipeTags);
        }

        // 5. 이미지 자동 생성 (옵션)
        if (savedRecipe.getImageUrl() == null || savedRecipe.getImageUrl().isEmpty()) {
            String imageUrl = unsplashService.getRecipeImage(savedRecipe.getTitle());
            savedRecipe.setImageUrl(imageUrl);
            recipeRepository.save(savedRecipe);
        }

        // 6. 응답용 데이터 조회 및 매핑
        List<RecipeStep> savedSteps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipeId);
        List<RecipeIngredient> savedRecipeIngredients = recipeIngredientRepository.findByRecipeId(recipeId);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<RecipeTag> savedRecipeTags = recipeTagRepository.findByRecipeId(recipeId);
        List<Tag> allTags = tagRepository.findAll();

        return recipeMapper.toResponseDto(savedRecipe, savedSteps, savedRecipeIngredients, allIngredients, savedRecipeTags, allTags);
    }
    
    public RecipeResponseDto getRecipeById(Long id) {
        log.info("Fetching recipe by ID: {}", id);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(id);
        List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(id);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(id);
        List<Tag> allTags = tagRepository.findAll();
        return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
    }
    
    public List<RecipeResponseDto> getAllRecipes() {
        log.info("Fetching all recipes");
        
        List<Recipe> recipes = recipeRepository.findAll();
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Tag> allTags = tagRepository.findAll();
        
        return recipes.stream()
                .map(recipe -> {
                    List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
                    List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
                    return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
                })
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getBestRecipes(int limit) {
        log.info("Fetching best recipes with limit: {}", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Recipe> recipes = recipeRepository.findTopRecipes(pageable);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Tag> allTags = tagRepository.findAll();
        
        return recipes.stream()
                .map(recipe -> {
                    List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
                    List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
                    return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
                })
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getRecipesByWriter(String writerId) {
        log.info("Fetching recipes by writer: {}", writerId);
        
        return recipeRepository.findByWriterId(writerId)
                .stream()
                .map(recipe -> {
                    List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
                    List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    List<Ingredient> allIngredients = ingredientRepository.findAll();
                    List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
                    List<Tag> allTags = tagRepository.findAll();
                    return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
                })
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> searchRecipes(String keyword) {
        log.info("Searching recipes with keyword: {}", keyword);
        
        List<Recipe> recipes = recipeRepository.findByTitleOrDescriptionContainingIgnoreCase(keyword);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Tag> allTags = tagRepository.findAll();
        
        return recipes.stream()
                .map(recipe -> {
                    List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
                    List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
                    return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
                })
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getRecipesByDifficulty(String difficulty) {
        log.info("Fetching recipes by difficulty: {}", difficulty);
        
        List<Recipe> recipes = recipeRepository.findByDifficulty(difficulty);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Tag> allTags = tagRepository.findAll();
        
        return recipes.stream()
                .map(recipe -> {
                    List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
                    List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
                    return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
                })
                .collect(Collectors.toList());
    }
    
    public List<RecipeResponseDto> getRecipesByCookingTime(Integer maxTime) {
        log.info("Fetching recipes with cooking time <= {}", maxTime);
        
        List<Recipe> recipes = recipeRepository.findByCookingTimeLessThanEqual(maxTime);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Tag> allTags = tagRepository.findAll();
        
        return recipes.stream()
                .map(recipe -> {
                    List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
                    List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
                    return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
                })
                .collect(Collectors.toList());
    }
    
    public Page<RecipeResponseDto> getRecentRecipes(int page, int size) {
        log.info("Fetching recent recipes: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Recipe> recipePage = recipeRepository.findAllOrderByCreatedAtDesc(pageable);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Tag> allTags = tagRepository.findAll();
        
        return recipePage.map(recipe -> {
            List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(recipe.getId());
            List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
            List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(recipe.getId());
            return recipeMapper.toResponseDto(recipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
        });
    }
    
    @Transactional
    @CacheEvict(value = "recipes", key = "#id")
    public RecipeResponseDto updateRecipe(Long id, RecipeRequestDto recipeRequestDto) {
        log.info("Updating recipe: {}", id);
        
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        // Update basic fields
        recipe.setTitle(recipeRequestDto.getTitle());
        recipe.setDescription(recipeRequestDto.getDescription());
        recipe.setCookingTime(recipeRequestDto.getCookingTime());
        recipe.setServings(recipeRequestDto.getServings());
        recipe.setDifficulty(recipeRequestDto.getDifficulty());
        recipe.setImageUrl(recipeRequestDto.getImageUrl());
        recipe.setIngredientsCount(recipeRequestDto.getIngredientsCount());
        recipe.setKind(recipeRequestDto.getKind());
        recipe.setSituation(recipeRequestDto.getSituation());
        recipe.setMainIngredient(recipeRequestDto.getMainIngredient());
        recipe.setCookingMethod(recipeRequestDto.getCookingMethod());
        
        Recipe updatedRecipe = recipeRepository.save(recipe);
        
        // Update related entities (steps, ingredients, tags)
        // This would require more complex logic to handle updates
        // For now, we'll return the updated recipe with existing related data
        
        List<RecipeStep> steps = recipeStepRepository.findByRecipeIdOrderByStepIndex(id);
        List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(id);
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<RecipeTag> recipeTags = recipeTagRepository.findByRecipeId(id);
        List<Tag> allTags = tagRepository.findAll();
        
        log.info("Recipe updated successfully: {}", id);
        return recipeMapper.toResponseDto(updatedRecipe, steps, recipeIngredients, allIngredients, recipeTags, allTags);
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
    
    public Long getRecipeCountByWriter(String writerId) {
        return recipeRepository.countByWriterId(writerId);
    }
    
    private void cacheRecipe(Recipe recipe) {
        try {
            String cacheKey = RECIPE_CACHE_KEY + recipe.getId();
            redisTemplate.opsForValue().set(cacheKey, recipe, CACHE_TTL_HOURS, TimeUnit.HOURS);
            log.debug("Recipe cached: {}", recipe.getId());
        } catch (Exception e) {
            log.warn("Failed to cache recipe {}: {}", recipe.getId(), e.getMessage());
        }
    }
    
    private void evictRecipeFromCache(Long recipeId) {
        try {
            String cacheKey = RECIPE_CACHE_KEY + recipeId;
            redisTemplate.delete(cacheKey);
            log.debug("Recipe evicted from cache: {}", recipeId);
        } catch (Exception e) {
            log.warn("Failed to evict recipe {} from cache: {}", recipeId, e.getMessage());
        }
    }
    
    private void evictListCache() {
        try {
            redisTemplate.delete(RECIPES_LIST_CACHE_KEY);
            log.debug("Recipe list cache evicted");
        } catch (Exception e) {
            log.warn("Failed to evict recipe list cache: {}", e.getMessage());
        }
    }
}