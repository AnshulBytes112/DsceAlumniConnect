package com.dsce.AlumniConnect.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);
        return objectMapper;

    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory,
            ObjectMapper redisObjectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper);

        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                .entryTtl(Duration.ofHours(1))
                .disableCachingNullValues();

        // Custom TTLs for different caches
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Volatile data: 5 minutes TTL
        cacheConfigurations.put("dashboardStats", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("userJobApps", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("announcements", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // Active entities: 1 hour TTL
        cacheConfigurations.put("jobs", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("activeJobs", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("events", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("allEvents", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("featuredEvents", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("posts", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("allPosts", defaultConfig.entryTtl(Duration.ofHours(1)));

        // Long-lived data: 24 hours TTL
        cacheConfigurations.put("alumni", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put("allAlumni", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigurations.put("fundings", defaultConfig.entryTtl(Duration.ofHours(24)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CustomCacheErrorHandler();
    }
}
