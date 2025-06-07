package com.samsung.recipe.board.service;

import com.samsung.recipe.board.dto.BoardPostRequestDto;
import com.samsung.recipe.board.dto.BoardPostResponseDto;
import com.samsung.recipe.board.entity.BoardPost;
import com.samsung.recipe.board.mapper.BoardPostMapper;
import com.samsung.recipe.board.repository.BoardPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BoardPostService {
    
    private final BoardPostRepository boardPostRepository;
    private final BoardPostMapper boardPostMapper;
    private final GoogleTranslateService googleTranslateService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String BOARD_POST_CACHE_KEY = "board_post:";
    private static final String BOARD_POSTS_LIST_CACHE_KEY = "board_posts:list";
    private static final long CACHE_TTL_HOURS = 2;
    
    @Transactional
    public BoardPostResponseDto createBoardPost(BoardPostRequestDto boardPostRequestDto) {
        log.info("Creating new board post: {}", boardPostRequestDto.getTitle());
        
        var boardPost = boardPostMapper.toEntity(boardPostRequestDto);
        
        // Auto-translate content using more concise approach
        var isKorean = "ko".equals(boardPost.getOriginalLanguage());
        
        if (isKorean) {
            var titleEn = googleTranslateService.translateKoreanToEnglish(boardPost.getTitle());
            var contentEn = googleTranslateService.translateKoreanToEnglish(boardPost.getContent());
            
            boardPost.setTranslatedTitleEn(titleEn);
            boardPost.setTranslatedContentEn(contentEn);
            boardPost.setTranslatedTitleKo(boardPost.getTitle());
            boardPost.setTranslatedContentKo(boardPost.getContent());
        } else {
            var titleKo = googleTranslateService.translateEnglishToKorean(boardPost.getTitle());
            var contentKo = googleTranslateService.translateEnglishToKorean(boardPost.getContent());
            
            boardPost.setTranslatedTitleKo(titleKo);
            boardPost.setTranslatedContentKo(contentKo);
            boardPost.setTranslatedTitleEn(boardPost.getTitle());
            boardPost.setTranslatedContentEn(boardPost.getContent());
        }
        
        var savedBoardPost = boardPostRepository.save(boardPost);
        
        try {
            cacheBoardPost(savedBoardPost);
            evictListCache();
        } catch (Exception e) {
            log.warn("Failed to cache board post, continuing without cache: {}", e.getMessage());
        }
        
        log.info("Board post created successfully: {}", savedBoardPost.getId());
        return boardPostMapper.toResponseDto(savedBoardPost);
    }
    
    public BoardPostResponseDto getBoardPostById(Long id) {
        log.info("Fetching board post by ID: {}", id);
        
        // Try to get from cache first, but continue if cache fails
        try {
            var cacheKey = BOARD_POST_CACHE_KEY + id;
            var cachedBoardPost = (BoardPost) redisTemplate.opsForValue().get(cacheKey);
            
            if (cachedBoardPost != null) {
                log.info("Board post found in cache: {}", id);
                return boardPostMapper.toResponseDto(cachedBoardPost);
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        
        var boardPost = boardPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board post not found"));
        
        cacheBoardPost(boardPost);
        
        // Return response and increment view count separately
        var response = boardPostMapper.toResponseDto(boardPost);
        
        // Call increment method directly on repository
        try {
            boardPostRepository.incrementViewCount(id);
            log.info("View count incremented for board post: {}", id);
        } catch (Exception e) {
            log.warn("Failed to increment view count: {}", e.getMessage());
        }
        
        return response;
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViewCountAsync(Long id) {
        try {
            boardPostRepository.incrementViewCount(id);
            log.info("View count incremented for board post: {}", id);
        } catch (Exception e) {
            log.warn("Failed to increment view count for post {}: {}", id, e.getMessage());
        }
    }
    
    public List<BoardPostResponseDto> getAllBoardPosts() {
        log.info("Fetching all board posts");
        
        // Try to get from cache first, but continue if cache fails
        try {
            @SuppressWarnings("unchecked")
            List<BoardPost> cachedBoardPosts = (List<BoardPost>) redisTemplate.opsForValue().get(BOARD_POSTS_LIST_CACHE_KEY);
            
            if (cachedBoardPosts != null) {
                log.info("Board posts found in cache");
                return cachedBoardPosts.stream()
                    .map(boardPostMapper::toResponseDto)
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        
        List<BoardPost> boardPosts = boardPostRepository.findAll();
        
        // Try to cache the results, but continue if cache fails
        try {
            redisTemplate.opsForValue().set(BOARD_POSTS_LIST_CACHE_KEY, boardPosts, CACHE_TTL_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Failed to cache board posts list: {}", e.getMessage());
        }
        
        return boardPosts.stream()
            .map(boardPostMapper::toResponseDto)
            .collect(Collectors.toList());
    }
    
    public List<BoardPostResponseDto> getBoardPostsByAuthor(Long authorId) {
        log.info("Fetching board posts by author: {}", authorId);
        
        return boardPostRepository.findByAuthorId(authorId)
            .stream()
            .map(boardPostMapper::toResponseDto)
            .collect(Collectors.toList());
    }
    
    public List<BoardPostResponseDto> searchBoardPosts(String keyword) {
        log.info("Searching board posts with keyword: {}", keyword);
        
        return boardPostRepository.findByTitleOrContentContainingIgnoreCase(keyword)
            .stream()
            .map(boardPostMapper::toResponseDto)
            .collect(Collectors.toList());
    }
    
    public List<BoardPostResponseDto> getPinnedPosts() {
        log.info("Fetching pinned posts");
        
        return boardPostRepository.findPinnedPosts()
            .stream()
            .map(boardPostMapper::toResponseDto)
            .collect(Collectors.toList());
    }
    
    public Page<BoardPostResponseDto> getBoardPostsOrderedByPinned(int page, int size) {
        log.info("Fetching board posts ordered by pinned: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BoardPost> boardPostPage = boardPostRepository.findAllOrderByPinnedAndCreatedAt(pageable);
        
        return boardPostPage.map(boardPostMapper::toResponseDto);
    }
    
    @Transactional
    @CacheEvict(value = "board_posts", key = "#id")
    public BoardPostResponseDto updateBoardPost(Long id, BoardPostRequestDto boardPostRequestDto) {
        log.info("Updating board post: {}", id);
        
        BoardPost boardPost = boardPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board post not found"));
        
        boardPost.setTitle(boardPostRequestDto.getTitle());
        boardPost.setContent(boardPostRequestDto.getContent());
        boardPost.setIsPinned(boardPostRequestDto.getIsPinned());
        
        // Re-translate updated content
        if ("ko".equals(boardPost.getOriginalLanguage())) {
            String translatedTitleEn = googleTranslateService.translateKoreanToEnglish(boardPost.getTitle());
            String translatedContentEn = googleTranslateService.translateKoreanToEnglish(boardPost.getContent());
            
            boardPost.setTranslatedTitleEn(translatedTitleEn);
            boardPost.setTranslatedContentEn(translatedContentEn);
            boardPost.setTranslatedTitleKo(boardPost.getTitle());
            boardPost.setTranslatedContentKo(boardPost.getContent());
        } else {
            String translatedTitleKo = googleTranslateService.translateEnglishToKorean(boardPost.getTitle());
            String translatedContentKo = googleTranslateService.translateEnglishToKorean(boardPost.getContent());
            
            boardPost.setTranslatedTitleKo(translatedTitleKo);
            boardPost.setTranslatedContentKo(translatedContentKo);
            boardPost.setTranslatedTitleEn(boardPost.getTitle());
            boardPost.setTranslatedContentEn(boardPost.getContent());
        }
        
        BoardPost updatedBoardPost = boardPostRepository.save(boardPost);
        
        try {
            cacheBoardPost(updatedBoardPost);
            evictListCache();
        } catch (Exception e) {
            log.warn("Failed to cache updated board post, continuing without cache: {}", e.getMessage());
        }
        
        log.info("Board post updated successfully: {}", id);
        return boardPostMapper.toResponseDto(updatedBoardPost);
    }
    
    @Transactional
    @CacheEvict(value = "board_posts", key = "#id")
    public void deleteBoardPost(Long id) {
        log.info("Deleting board post: {}", id);
        
        if (!boardPostRepository.existsById(id)) {
            throw new RuntimeException("Board post not found");
        }
        
        boardPostRepository.deleteById(id);
        
        try {
            evictBoardPostFromCache(id);
            evictListCache();
        } catch (Exception e) {
            log.warn("Failed to evict deleted board post from cache, continuing: {}", e.getMessage());
        }
        
        log.info("Board post deleted successfully: {}", id);
    }
    
    public Long getBoardPostCountByAuthor(Long authorId) {
        return boardPostRepository.countByAuthorId(authorId);
    }
    
    private void cacheBoardPost(BoardPost boardPost) {
        try {
            String cacheKey = BOARD_POST_CACHE_KEY + boardPost.getId();
            redisTemplate.opsForValue().set(cacheKey, boardPost, CACHE_TTL_HOURS, TimeUnit.HOURS);
            log.debug("Board post cached: {}", boardPost.getId());
        } catch (Exception e) {
            log.warn("Failed to cache board post {}: {}", boardPost.getId(), e.getMessage());
        }
    }
    
    private void evictBoardPostFromCache(Long boardPostId) {
        try {
            String cacheKey = BOARD_POST_CACHE_KEY + boardPostId;
            redisTemplate.delete(cacheKey);
            log.debug("Board post evicted from cache: {}", boardPostId);
        } catch (Exception e) {
            log.warn("Failed to evict board post {} from cache: {}", boardPostId, e.getMessage());
        }
    }
    
    private void evictListCache() {
        try {
            redisTemplate.delete(BOARD_POSTS_LIST_CACHE_KEY);
            log.debug("Board post list cache evicted");
        } catch (Exception e) {
            log.warn("Failed to evict list cache: {}", e.getMessage());
        }
    }
}