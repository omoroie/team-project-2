package com.samsung.recipe.user.service;

import com.samsung.recipe.user.dto.LoginRequestDto;
import com.samsung.recipe.user.dto.UserRequestDto;
import com.samsung.recipe.user.dto.UserResponseDto;
import com.samsung.recipe.user.entity.User;
import com.samsung.recipe.user.mapper.UserMapper;
import com.samsung.recipe.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtService jwtService;
    
    private static final String USER_CACHE_KEY = "user:";
    private static final long CACHE_TTL_HOURS = 24;
    
    @Transactional
    public UserResponseDto registerUser(UserRequestDto userRequestDto) {
        log.info("Registering new user: {}", userRequestDto.getUsername());
        
        // Check if username or email already exists
        if (userRepository.existsByUsername(userRequestDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(userRequestDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Create user entity
        User user = userMapper.toEntity(userRequestDto);
        user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Try to cache user data, ignore if Redis fails
        try {
            cacheUser(savedUser);
        } catch (Exception e) {
            log.warn("Failed to cache user during registration, continuing without cache: {}", e.getMessage());
        }
        
        log.info("User registered successfully: {}", savedUser.getId());
        return userMapper.toResponseDto(savedUser);
    }
    
    public String authenticateUser(LoginRequestDto loginRequestDto) {
        log.info("Authenticating user: {}", loginRequestDto.getUsername());
        
        // Try cache first, fallback to database if Redis unavailable
        User user = null;
        try {
            String cacheKey = USER_CACHE_KEY + "username:" + loginRequestDto.getUsername();
            Object cachedObject = redisTemplate.opsForValue().get(cacheKey);
            
            if (cachedObject instanceof User) {
                user = (User) cachedObject;
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        
        if (user == null) {
            // Fetch from database
            user = userRepository.findByUsername(loginRequestDto.getUsername())
                    .orElseThrow(() -> new RuntimeException("Invalid username or password"));
            
            // Try to cache the user, ignore if Redis fails
            try {
                cacheUser(user);
            } catch (Exception e) {
                log.warn("Failed to cache user, continuing without cache: {}", e.getMessage());
            }
        }
        
        // Verify password
        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        log.info("User authenticated successfully: {}", user.getId());
        return token;
    }
    
    @Cacheable(value = "users", key = "#id")
    public UserResponseDto getUserById(Long id) {
        log.info("Fetching user by ID: {}", id);
        
        // Try cache first, fallback to database if Redis unavailable
        try {
            String cacheKey = USER_CACHE_KEY + "id:" + id;
            Object cachedObject = redisTemplate.opsForValue().get(cacheKey);
            
            if (cachedObject instanceof User) {
                User cachedUser = (User) cachedObject;
                log.info("User found in cache: {}", id);
                return userMapper.toResponseDto(cachedUser);
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        
        // Fetch from database
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            cacheUser(user);
        } catch (Exception e) {
            log.warn("Failed to cache user, continuing without cache: {}", e.getMessage());
        }
        return userMapper.toResponseDto(user);
    }
    
    public UserResponseDto getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        
        // Try cache first, fallback to database if Redis unavailable
        try {
            String cacheKey = USER_CACHE_KEY + "username:" + username;
            Object cachedObject = redisTemplate.opsForValue().get(cacheKey);
            
            if (cachedObject instanceof User) {
                User cachedUser = (User) cachedObject;
                log.info("User found in cache: {}", username);
                return userMapper.toResponseDto(cachedUser);
            }
        } catch (Exception e) {
            log.warn("Redis cache unavailable, fetching from database: {}", e.getMessage());
        }
        
        // Fetch from database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            cacheUser(user);
        } catch (Exception e) {
            log.warn("Failed to cache user, continuing without cache: {}", e.getMessage());
        }
        return userMapper.toResponseDto(user);
    }
    
    public List<UserResponseDto> getAllUsers() {
        log.info("Fetching all users");
        
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    public List<UserResponseDto> getCorporateUsers() {
        log.info("Fetching corporate users");
        
        return userRepository.findByIsCorporate(true)
                .stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public UserResponseDto updateUser(Long id, UserRequestDto userRequestDto) {
        log.info("Updating user: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update user fields
        user.setUsername(userRequestDto.getUsername());
        user.setEmail(userRequestDto.getEmail());
        user.setIsCorporate(userRequestDto.getIsCorporate());
        
        if (userRequestDto.getPassword() != null && !userRequestDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        
        // Update cache
        cacheUser(updatedUser);
        
        log.info("User updated successfully: {}", id);
        return userMapper.toResponseDto(updatedUser);
    }
    
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        log.info("Deleting user: {}", id);
        
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        
        userRepository.deleteById(id);
        
        // Remove from cache
        evictUserFromCache(id);
        
        log.info("User deleted successfully: {}", id);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public Long getCorporateUserCount() {
        return userRepository.countCorporateUsers();
    }
    
    private void cacheUser(User user) {
        String idKey = USER_CACHE_KEY + "id:" + user.getId();
        String usernameKey = USER_CACHE_KEY + "username:" + user.getUsername();
        String emailKey = USER_CACHE_KEY + "email:" + user.getEmail();
        
        redisTemplate.opsForValue().set(idKey, user, CACHE_TTL_HOURS, TimeUnit.HOURS);
        redisTemplate.opsForValue().set(usernameKey, user, CACHE_TTL_HOURS, TimeUnit.HOURS);
        redisTemplate.opsForValue().set(emailKey, user, CACHE_TTL_HOURS, TimeUnit.HOURS);
        
        log.debug("User cached: {}", user.getId());
    }
    
    private void evictUserFromCache(Long userId) {
        String pattern = USER_CACHE_KEY + "*:" + userId;
        redisTemplate.delete(redisTemplate.keys(pattern));
        log.debug("User evicted from cache: {}", userId);
    }
}