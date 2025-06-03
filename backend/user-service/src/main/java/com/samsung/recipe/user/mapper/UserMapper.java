package com.samsung.recipe.user.mapper;

import com.samsung.recipe.user.dto.UserRequestDto;
import com.samsung.recipe.user.dto.UserResponseDto;
import com.samsung.recipe.user.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    @Autowired
    private ModelMapper modelMapper;
    
    public User toEntity(UserRequestDto userRequestDto) {
        return modelMapper.map(userRequestDto, User.class);
    }
    
    public UserResponseDto toResponseDto(User user) {
        return modelMapper.map(user, UserResponseDto.class);
    }
}