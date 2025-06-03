package com.samsung.recipe.ingredient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class IngredientServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(IngredientServiceApplication.class, args);
    }
}