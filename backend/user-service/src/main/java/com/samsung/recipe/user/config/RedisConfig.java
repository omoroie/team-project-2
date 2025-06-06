package com.samsung.recipe.user.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    // AppConfig에서 @Primary로 등록된 ObjectMapper(JavaTimeModule 포함)를 주입받는다
    private final ObjectMapper objectMapper;
    public RedisConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration standaloneConfig =
                new RedisStandaloneConfiguration(redisHost, redisPort);
        return new JedisConnectionFactory(standaloneConfig);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());

        // 키는 문자열 직렬화
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // 값은 Jackson JSON 직렬화 (ObjectMapper에 JavaTimeModule이 등록된 상태)
        GenericJackson2JsonRedisSerializer jacksonSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);
        template.setValueSerializer(jacksonSerializer);
        template.setHashValueSerializer(jacksonSerializer);

        template.setEnableTransactionSupport(true);
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Jackson 직렬화를 위한 Serializer 생성
        GenericJackson2JsonRedisSerializer jacksonSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        // RedisCacheConfiguration을 커스터마이징하여 값 직렬화에 jacksonSerializer를 사용
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(24)) // TTL 24시간
                .serializeKeysWith(
                    org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                    org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
                        .fromSerializer(jacksonSerializer)
                );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(cacheConfig)
                .build();
    }
}
