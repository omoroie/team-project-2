package com.samsung.recipe.board.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardPostResponseDto {
    
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private String originalLanguage;
    private String translatedTitleEn;
    private String translatedContentEn;
    private String translatedTitleKo;
    private String translatedContentKo;
    private Long viewCount;
    private Boolean isPinned;
    private Boolean isCorporateOnly;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}