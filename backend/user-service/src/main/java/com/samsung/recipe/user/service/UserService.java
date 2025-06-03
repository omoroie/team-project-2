package com.samsung.recipe.user.service;

import com.samsung.recipe.user.dto.UserRequestDto;
import com.samsung.recipe.user.dto.UserResponseDto;
import com.samsung.recipe.user.entity.User;
import com.samsung.recipe.user.mapper.UserMapper;
import com.samsung.recipe.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Cacheable("users")
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto createUser(UserRequestDto requestDto) {
        if (userRepository.existsByUsername(requestDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = userMapper.toEntity(requestDto);
        user = userRepository.save(user);
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto updateUser(Long id, UserRequestDto requestDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userMapper.updateUserFromDto(requestDto, user);
        user = userRepository.save(user);
        return userMapper.toResponseDto(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<UserResponseDto> getCorporateUsers() {
        return userRepository.findByIsCorporate(true).stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}