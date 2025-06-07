package com.samsung.recipe.board.controller;

import com.samsung.recipe.board.dto.BoardPostRequestDto;
import com.samsung.recipe.board.dto.BoardPostResponseDto;
import com.samsung.recipe.board.service.BoardPostService;
import com.samsung.recipe.board.service.ViewCountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/board")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class BoardPostController {
    
    private final BoardPostService boardPostService;
    private final ViewCountService viewCountService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBoardPost(
            @Valid @RequestBody BoardPostRequestDto boardPostRequestDto,
            HttpServletRequest request) {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "로그인이 필요합니다");
                response.put("requiresLogin", true);
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // 요청 DTO에 사용자 ID 설정
            boardPostRequestDto.setAuthorId(userId);
            
            BoardPostResponseDto boardPost = boardPostService.createBoardPost(boardPostRequestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Board post created successfully");
            response.put("post", boardPost);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Board post creation failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BoardPostResponseDto> getBoardPostById(@PathVariable Long id) {
        try {
            BoardPostResponseDto boardPost = boardPostService.getBoardPostById(id);
            return ResponseEntity.ok(boardPost);
            
        } catch (RuntimeException e) {
            log.error("Board post fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<Map<String, Object>> incrementViewCount(@PathVariable Long id) {
        try {
            viewCountService.incrementViewCount(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "View count incremented");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<BoardPostResponseDto>> getAllBoardPosts() {
        try {
            List<BoardPostResponseDto> boardPosts = boardPostService.getAllBoardPosts();
            return ResponseEntity.ok(boardPosts);
            
        } catch (Exception e) {
            log.error("Board posts fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<BoardPostResponseDto>> getBoardPostsByAuthor(@PathVariable Long authorId) {
        try {
            List<BoardPostResponseDto> boardPosts = boardPostService.getBoardPostsByAuthor(authorId);
            return ResponseEntity.ok(boardPosts);
            
        } catch (Exception e) {
            log.error("Author board posts fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<BoardPostResponseDto>> searchBoardPosts(@RequestParam String keyword) {
        try {
            List<BoardPostResponseDto> boardPosts = boardPostService.searchBoardPosts(keyword);
            return ResponseEntity.ok(boardPosts);
            
        } catch (Exception e) {
            log.error("Board post search failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/pinned")
    public ResponseEntity<List<BoardPostResponseDto>> getPinnedPosts() {
        try {
            List<BoardPostResponseDto> pinnedPosts = boardPostService.getPinnedPosts();
            return ResponseEntity.ok(pinnedPosts);
            
        } catch (Exception e) {
            log.error("Pinned posts fetch failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/ordered")
    public ResponseEntity<Map<String, Object>> getBoardPostsOrderedByPinned(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<BoardPostResponseDto> boardPostPage = boardPostService.getBoardPostsOrderedByPinned(page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("posts", boardPostPage.getContent());
            response.put("currentPage", boardPostPage.getNumber());
            response.put("totalPages", boardPostPage.getTotalPages());
            response.put("totalElements", boardPostPage.getTotalElements());
            response.put("size", boardPostPage.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Ordered board posts fetch failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch ordered board posts");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBoardPost(
            @PathVariable Long id, 
            @Valid @RequestBody BoardPostRequestDto boardPostRequestDto,
            HttpServletRequest request) {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "로그인이 필요합니다");
                response.put("requiresLogin", true);
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // 게시글 작성자 확인
            BoardPostResponseDto existingPost = boardPostService.getBoardPostById(id);
            if (!existingPost.getAuthorId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "본인이 작성한 게시글만 수정할 수 있습니다");
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            boardPostRequestDto.setAuthorId(userId);
            BoardPostResponseDto updatedBoardPost = boardPostService.updateBoardPost(id, boardPostRequestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Board post updated successfully");
            response.put("post", updatedBoardPost);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Board post update failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBoardPost(@PathVariable Long id, HttpServletRequest request) {
        try {
            // JWT 토큰에서 사용자 ID 추출
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "로그인이 필요합니다");
                response.put("requiresLogin", true);
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // 게시글 작성자 확인
            BoardPostResponseDto existingPost = boardPostService.getBoardPostById(id);
            if (!existingPost.getAuthorId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "본인이 작성한 게시글만 삭제할 수 있습니다");
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            boardPostService.deleteBoardPost(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Board post deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Board post deletion failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    @GetMapping("/stats/count/author/{authorId}")
    public ResponseEntity<Map<String, Object>> getBoardPostCountByAuthor(@PathVariable Long authorId) {
        Long count = boardPostService.getBoardPostCountByAuthor(authorId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("authorId", authorId);
        response.put("postCount", count);
        
        return ResponseEntity.ok(response);
    }
}