package com.samsung.recipe.board.service;

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
public class GoogleTranslateService {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${google.translate.api.key:}")
    private String googleTranslateApiKey;
    
    @Value("${google.translate.api.url:https://translation.googleapis.com/language/translate/v2}")
    private String googleTranslateApiUrl;
    
    public String translateText(String text, String targetLanguage, String sourceLanguage) {
        if (googleTranslateApiKey == null || googleTranslateApiKey.isEmpty()) {
            log.warn("Google Translate API key not configured, returning original text");
            return text;
        }
        
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        if (targetLanguage.equals(sourceLanguage)) {
            return text;
        }
        
        try {
            log.info("Translating text from {} to {}", sourceLanguage, targetLanguage);
            
            WebClient webClient = webClientBuilder
                .baseUrl(googleTranslateApiUrl)
                .build();
            
            Map<String, Object> requestBody = Map.of(
                "q", text,
                "source", sourceLanguage,
                "target", targetLanguage,
                "key", googleTranslateApiKey
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                
                if (data.containsKey("translations")) {
                    @SuppressWarnings("unchecked")
                    var translations = (java.util.List<Map<String, Object>>) data.get("translations");
                    
                    if (!translations.isEmpty()) {
                        Map<String, Object> firstTranslation = translations.get(0);
                        String translatedText = (String) firstTranslation.get("translatedText");
                        
                        log.info("Translation successful: {} -> {}", sourceLanguage, targetLanguage);
                        return translatedText;
                    }
                }
            }
            
            log.warn("No translation found, returning original text");
            return text;
            
        } catch (WebClientResponseException e) {
            log.error("Error calling Google Translate API: {}", e.getMessage());
            return text;
        } catch (Exception e) {
            log.error("Unexpected error during translation: {}", e.getMessage());
            return text;
        }
    }
    
    public String translateKoreanToEnglish(String koreanText) {
        return translateText(koreanText, "en", "ko");
    }
    
    public String translateEnglishToKorean(String englishText) {
        return translateText(englishText, "ko", "en");
    }
}