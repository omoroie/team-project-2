package com.samsung.recipe.board.repository;

import com.samsung.recipe.board.entity.BoardPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {
    
    List<BoardPost> findByAuthorId(Long authorId);
    
    @Query("SELECT b FROM BoardPost b WHERE b.title ILIKE %:keyword% OR b.content ILIKE %:keyword%")
    List<BoardPost> findByTitleOrContentContainingIgnoreCase(@Param("keyword") String keyword);
    
    @Query("SELECT b FROM BoardPost b WHERE b.isPinned = true ORDER BY b.createdAt DESC")
    List<BoardPost> findPinnedPosts();
    
    @Query("SELECT b FROM BoardPost b WHERE b.isCorporateOnly = :isCorporateOnly")
    List<BoardPost> findByCorporateOnly(@Param("isCorporateOnly") Boolean isCorporateOnly);
    
    @Query("SELECT b FROM BoardPost b ORDER BY b.isPinned DESC, b.createdAt DESC")
    Page<BoardPost> findAllOrderByPinnedAndCreatedAt(Pageable pageable);
    
    @Query("SELECT b FROM BoardPost b WHERE b.originalLanguage = :language")
    List<BoardPost> findByOriginalLanguage(@Param("language") String language);
    
    @Modifying
    @Query("UPDATE BoardPost b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);
    
    @Query("SELECT COUNT(b) FROM BoardPost b WHERE b.authorId = :authorId")
    Long countByAuthorId(@Param("authorId") Long authorId);
}