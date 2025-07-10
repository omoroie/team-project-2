package com.samsung.recipe.recipe.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class GcpStorageConfig {

    @Bean
    public Storage gcpStorage() {
        log.info("Initializing GCP Storage client");
        return StorageOptions.getDefaultInstance().getService();
    }
} 