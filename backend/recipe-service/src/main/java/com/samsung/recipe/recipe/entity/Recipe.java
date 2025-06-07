package com.samsung.recipe.recipe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "recipes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Recipe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructionsRaw;
    
    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredientsRaw;
    
    @Transient
    private List<String> instructions;
    
    @Transient
    private List<String> ingredients;
    
    @Column(name = "cooking_time")
    private Integer cookingTime;
    
    private Integer servings;
    
    private String difficulty;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "author_id", nullable = false)
    private Long authorId;
    
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PostLoad
    private void parseData() {
        this.ingredients = parsePostgreSQLArray(this.ingredientsRaw);
        this.instructions = parseInstructions(this.instructionsRaw);
    }
    
    private List<String> parsePostgreSQLArray(String arrayStr) {
        if (arrayStr == null || arrayStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // PostgreSQL 배열 형태: {"item1","item2","item3"}
        if (arrayStr.startsWith("{") && arrayStr.endsWith("}")) {
            String content = arrayStr.substring(1, arrayStr.length() - 1);
            if (content.trim().isEmpty()) {
                return new ArrayList<>();
            }
            
            List<String> result = new ArrayList<>();
            String[] items = content.split(",");
            for (String item : items) {
                String cleaned = item.trim();
                // 따옴표 제거
                if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
                    cleaned = cleaned.substring(1, cleaned.length() - 1);
                }
                if (!cleaned.isEmpty()) {
                    result.add(cleaned);
                }
            }
            return result;
        }
        
        return new ArrayList<>();
    }
    
    private List<String> parseInstructions(String instructionsStr) {
        if (instructionsStr == null || instructionsStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // 파이프로 구분된 형태: "step1|step2|step3"
        return Arrays.asList(instructionsStr.split("\\|"));
    }
}