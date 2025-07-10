package com.samsung.recipe.recipe.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.storage")
@Getter
@Setter
public class StorageConfig {
    /**
     * GCP Storage 설정
     */
    private Gcp gcp = new Gcp();

    @Getter
    @Setter
    public static class Gcp {
        private String bucketName = "dev-recipe-assets";
        private String projectId = "team-project-464904";
        private String folderName = "images";  // 이미지 저장 폴더명
    }
} 