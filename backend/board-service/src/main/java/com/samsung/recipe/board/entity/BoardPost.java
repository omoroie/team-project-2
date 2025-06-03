package com.samsung.recipe.board.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "board_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class BoardPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "author_id", nullable = false)
    private Long authorId;
    
    @Column(name = "author_name")
    private String authorName;
    
    @Column(name = "original_language")
    private String originalLanguage = "ko";
    
    @Column(name = "translated_title_en", columnDefinition = "TEXT")
    private String translatedTitleEn;
    
    @Column(name = "translated_content_en", columnDefinition = "TEXT")
    private String translatedContentEn;
    
    @Column(name = "translated_title_ko", columnDefinition = "TEXT")
    private String translatedTitleKo;
    
    @Column(name = "translated_content_ko", columnDefinition = "TEXT")
    private String translatedContentKo;
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    @Column(name = "is_pinned")
    private Boolean isPinned = false;
    
    @Column(name = "is_corporate_only")
    private Boolean isCorporateOnly = true;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}