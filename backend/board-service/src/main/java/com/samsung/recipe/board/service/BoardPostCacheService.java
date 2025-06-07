package com.samsung.recipe.board.service;

import com.samsung.recipe.board.entity.BoardPost;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class BoardPostCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public BoardPostCacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static final String BOARD_POST_KEY_PREFIX = "board_post:";
    private static final long CACHE_TTL = 3600; // 1 hour

    public void cacheBoardPost(BoardPost boardPost) {
        try {
            String key = BOARD_POST_KEY_PREFIX + boardPost.getId();
            redisTemplate.opsForValue().set(key, boardPost, CACHE_TTL, TimeUnit.SECONDS);
            log.debug("Cached board post: {}", boardPost.getId());
        } catch (Exception e) {
            log.warn("Failed to cache board post, continuing without cache: {}", e.getMessage());
        }
    }

    public BoardPost getCachedBoardPost(Long id) {
        try {
            String key = BOARD_POST_KEY_PREFIX + id;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached instanceof BoardPost) {
                log.debug("Retrieved board post from cache: {}", id);
                return (BoardPost) cached;
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        return null;
    }

    public void evictBoardPost(Long id) {
        try {
            String key = BOARD_POST_KEY_PREFIX + id;
            redisTemplate.delete(key);
            log.debug("Evicted board post from cache: {}", id);
        } catch (Exception e) {
            log.warn("Failed to evict board post from cache: {}", e.getMessage());
        }
    }
}