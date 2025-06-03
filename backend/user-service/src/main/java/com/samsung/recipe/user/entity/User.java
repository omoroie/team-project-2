package com.samsung.recipe.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "is_corporate")
    private Boolean isCorporate = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public User() {}

    public User(String username, String email, String password, Boolean isCorporate) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isCorporate = isCorporate;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getIsCorporate() { return isCorporate; }
    public void setIsCorporate(Boolean isCorporate) { this.isCorporate = isCorporate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}