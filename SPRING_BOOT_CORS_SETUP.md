# Spring Boot 마이크로서비스 CORS 설정 가이드

## 각 서비스에 추가할 CORS 설정

### 1. User Service (포트: 8081)

```java
// UserServiceApplication.java 또는 별도 Configuration 클래스
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5000") // 프론트엔드 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 2. Recipe Service (포트: 8082)

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/recipes/**")
                .allowedOrigins("http://localhost:5000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 3. Ingredient Service (포트: 8083)

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/ingredients/**")
                .allowedOrigins("http://localhost:5000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 4. Board Service (포트: 8084)

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/board/**")
                .allowedOrigins("http://localhost:5000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## API 엔드포인트 구조

### User Service (8081)
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- GET /auth/me
- POST /auth/refresh

### Recipe Service (8082)
- GET /recipes
- GET /recipes/best
- GET /recipes/{id}
- POST /recipes
- PUT /recipes/{id}
- DELETE /recipes/{id}
- GET /recipes/author/{authorId}
- GET /recipes/search?q={query}
- GET /recipes/category/{category}

### Ingredient Service (8083)
- GET /ingredients
- GET /ingredients/{id}
- POST /ingredients
- PUT /ingredients/{id}
- DELETE /ingredients/{id}
- GET /ingredients/search?q={query}
- GET /ingredients/category/{category}
- PATCH /ingredients/{id}/stock

### Board Service (8084)
- GET /board
- GET /board/{id}
- POST /board
- PUT /board/{id}
- DELETE /board/{id}
- GET /board/author/{authorId}
- GET /board/corporate
- POST /board/{postId}/comments
- GET /board/{postId}/comments

## 세션 관리 설정

각 서비스에 Redis 세션 설정 추가:

```java
@Configuration
@EnableRedisHttpSession
public class SessionConfig {
    
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory("localhost", 6379);
    }
}
```

## application.yml 예시

```yaml
server:
  port: 8081 # 각 서비스별로 다른 포트
  
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/user_service
    username: postgres
    password: password
  
  redis:
    host: localhost
    port: 6379
    
  session:
    store-type: redis
    redis:
      namespace: spring:session:user-service
```

## 필수 의존성

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.session</groupId>
        <artifactId>spring-session-data-redis</artifactId>
    </dependency>
</dependencies>
```