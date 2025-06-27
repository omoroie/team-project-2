package com.samsung.recipe.recipe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RecipeServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecipeServiceApplication.class, args);
    }
}