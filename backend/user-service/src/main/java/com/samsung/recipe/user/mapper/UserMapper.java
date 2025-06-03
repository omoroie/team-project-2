package com.samsung.recipe.user.mapper;

import com.samsung.recipe.user.dto.UserRequestDto;
import com.samsung.recipe.user.dto.UserResponseDto;
import com.samsung.recipe.user.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    public UserResponseDto toResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getIsCorporate(),
                user.getCreatedAt()
        );
    }

    public User toEntity(UserRequestDto requestDto) {
        User user = new User();
        user.setUsername(requestDto.getUsername());
        user.setEmail(requestDto.getEmail());
        user.setPassword(requestDto.getPassword()); // In real app, hash this
        user.setIsCorporate(requestDto.getIsCorporate());
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    public void updateUserFromDto(UserRequestDto requestDto, User user) {
        if (requestDto.getUsername() != null) {
            user.setUsername(requestDto.getUsername());
        }
        if (requestDto.getEmail() != null) {
            user.setEmail(requestDto.getEmail());
        }
        if (requestDto.getPassword() != null) {
            user.setPassword(requestDto.getPassword()); // In real app, hash this
        }
        if (requestDto.getIsCorporate() != null) {
            user.setIsCorporate(requestDto.getIsCorporate());
        }
    }
}