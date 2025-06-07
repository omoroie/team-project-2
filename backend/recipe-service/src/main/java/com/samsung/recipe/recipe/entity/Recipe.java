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
    
    @Column(name = "hashtags", columnDefinition = "TEXT")
    private String hashtagsRaw;
    
    @Transient
    private List<String> hashtags;
    
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
        this.hashtags = parsePostgreSQLArray(this.hashtagsRaw);
    }
    
    private List<String> parsePostgreSQLArray(String arrayStr) {
        if (arrayStr == null || arrayStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // 중복 배열 형태 처리: {"['item1', 'item2']"}
        if (arrayStr.contains("['") && arrayStr.contains("']")) {
            // 내부 배열 부분 추출
            int start = arrayStr.indexOf("['");
            int end = arrayStr.lastIndexOf("']") + 2;
            if (start >= 0 && end > start) {
                String innerArray = arrayStr.substring(start, end);
                // Python 리스트 형태를 파싱
                innerArray = innerArray.replace("['", "").replace("']", "");
                String[] items = innerArray.split("',\\s*'");
                
                List<String> result = new ArrayList<>();
                for (String item : items) {
                    String cleaned = item.trim().replace("'", "");
                    if (!cleaned.isEmpty() && !cleaned.equals("||")) {
                        // "재료명 || 수량" 형태에서 재료명만 추출
                        String[] parts = cleaned.split("\\s*\\|\\|\\s*");
                        if (parts.length > 0 && !parts[0].trim().isEmpty()) {
                            result.add(parts[0].trim());
                        }
                    }
                }
                return result;
            }
        }
        
        // 표준 PostgreSQL 배열 형태: {"item1","item2","item3"}
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
        
        // Python 리스트 형태 처리: ['step1', 'step2', 'step3']
        if (instructionsStr.contains("['") && instructionsStr.contains("']")) {
            // 내부 배열 부분 추출
            int start = instructionsStr.indexOf("['");
            int end = instructionsStr.lastIndexOf("']") + 2;
            if (start >= 0 && end > start) {
                String innerArray = instructionsStr.substring(start, end);
                // Python 리스트 형태를 파싱
                innerArray = innerArray.replace("['", "").replace("']", "");
                String[] items = innerArray.split("',\\s*'");
                
                List<String> result = new ArrayList<>();
                for (String item : items) {
                    String cleaned = item.trim().replace("'", "");
                    if (!cleaned.isEmpty()) {
                        // 불필요한 문자 제거 및 정리
                        cleaned = cleaned.replaceAll("\\\\n", " ");
                        cleaned = cleaned.replaceAll("\\s+", " ");
                        result.add(cleaned.trim());
                    }
                }
                return result;
            }
        }
        
        // 파이프로 구분된 형태: "step1|step2|step3"
        return Arrays.asList(instructionsStr.split("\\|"));
    }
}