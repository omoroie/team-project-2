package com.samsung.recipe.user.dto;

public class UserRequestDto {
    private String username;
    private String email;
    private String password;
    private Boolean isCorporate;

    // Constructors
    public UserRequestDto() {}

    public UserRequestDto(String username, String email, String password, Boolean isCorporate) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isCorporate = isCorporate;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getIsCorporate() { return isCorporate; }
    public void setIsCorporate(Boolean isCorporate) { this.isCorporate = isCorporate; }
}