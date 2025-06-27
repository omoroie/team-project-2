package com.samsung.recipe.recipe.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnsplashService {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${unsplash.access.key:}")
    private String unsplashAccessKey;
    
    @Value("${unsplash.api.url:https://api.unsplash.com}")
    private String unsplashApiUrl;
    
    public String getRecipeImage(String recipeName) {
        if (unsplashAccessKey == null || unsplashAccessKey.isEmpty()) {
            log.warn("Unsplash access key not configured, using placeholder image");
            return getPlaceholderImage();
        }
        
        try {
            log.info("Fetching image for recipe: {}", recipeName);
            
            WebClient webClient = webClientBuilder
                .baseUrl(unsplashApiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Client-ID " + unsplashAccessKey)
                .build();
            
            String searchQuery = recipeName + " food recipe";
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/search/photos")
                    .queryParam("query", searchQuery)
                    .queryParam("per_page", 1)
                    .queryParam("orientation", "landscape")
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            if (response != null && response.containsKey("results")) {
                @SuppressWarnings("unchecked")
                var results = (java.util.List<Map<String, Object>>) response.get("results");
                
                if (!results.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> firstResult = results.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, String> urls = (Map<String, String>) firstResult.get("urls");
                    
                    String imageUrl = urls.get("regular");
                    log.info("Found image for recipe: {} -> {}", recipeName, imageUrl);
                    return imageUrl;
                }
            }
            
            log.warn("No images found for recipe: {}", recipeName);
            return getPlaceholderImage();
            
        } catch (WebClientResponseException e) {
            log.error("Error fetching image from Unsplash: {}", e.getMessage());
            return getPlaceholderImage();
        } catch (Exception e) {
            log.error("Unexpected error fetching image: {}", e.getMessage());
            return getPlaceholderImage();
        }
    }
    
    private String getPlaceholderImage() {
        return "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&h=300&fit=crop";
    }
}