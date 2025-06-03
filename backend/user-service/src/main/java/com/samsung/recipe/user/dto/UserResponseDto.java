package com.samsung.recipe.user.dto;

import java.time.LocalDateTime;

public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private Boolean isCorporate;
    private LocalDateTime createdAt;

    // Constructors
    public UserResponseDto() {}

    public UserResponseDto(Long id, String username, String email, Boolean isCorporate, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.isCorporate = isCorporate;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getIsCorporate() { return isCorporate; }
    public void setIsCorporate(Boolean isCorporate) { this.isCorporate = isCorporate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}