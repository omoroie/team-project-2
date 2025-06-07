package com.samsung.recipe.board.service;

import com.samsung.recipe.board.repository.BoardPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ViewCountService {
    
    private final BoardPostRepository boardPostRepository;
    
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViewCount(Long boardPostId) {
        try {
            boardPostRepository.incrementViewCount(boardPostId);
            log.info("View count incremented for board post: {}", boardPostId);
        } catch (Exception e) {
            log.warn("Failed to increment view count for post {}: {}", boardPostId, e.getMessage());
        }
    }
}