package com.samsung.recipe.board.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleTranslateService {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${google.translate.api.key:}")
    private String apiKey;
    
    @Value("${google.translate.api.url}")
    private String apiUrl;
    
    public String translateKoreanToEnglish(String text) {
        if (apiKey.isEmpty()) {
            log.warn("Google Translate API key not configured, returning original text");
            return text;
        }
        
        return translate(text, "ko", "en");
    }
    
    public String translateEnglishToKorean(String text) {
        if (apiKey.isEmpty()) {
            log.warn("Google Translate API key not configured, returning original text");
            return text;
        }
        
        return translate(text, "en", "ko");
    }
    
    private String translate(String text, String sourceLang, String targetLang) {
        try {
            WebClient webClient = webClientBuilder.build();
            
            Map<String, Object> response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .bodyValue(Map.of(
                    "q", text,
                    "source", sourceLang,
                    "target", targetLang
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            if (response != null && response.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data.containsKey("translations")) {
                    java.util.List<Map<String, Object>> translations = 
                        (java.util.List<Map<String, Object>>) data.get("translations");
                    if (!translations.isEmpty()) {
                        return (String) translations.get(0).get("translatedText");
                    }
                }
            }
            
            log.warn("Translation failed, returning original text");
            return text;
            
        } catch (Exception e) {
            log.error("Translation error: {}", e.getMessage());
            return text;
        }
    }
}