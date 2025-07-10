package com.samsung.recipe.recipe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // GCP Storage만 지원. 정적 리소스 핸들러 없음.
}