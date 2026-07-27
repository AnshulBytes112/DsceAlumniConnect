package com.dsce.AlumniConnect.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String IDEMPOTENCY_PREFIX = "idempotency:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(24);

    /**
     * Checks if a request with the given idempotency key has already been processed.
     * If not, marks it as processing.
     * 
     * @param key The idempotency key (usually passed in header)
     * @return true if this is a new request, false if it's a duplicate
     */
    public boolean isNewRequest(String key) {
        if (key == null || key.trim().isEmpty()) {
            return true; // If no key provided, treat as new (or could throw exception based on strictness)
        }
        
        String redisKey = IDEMPOTENCY_PREFIX + key;
        try {
            // setIfAbsent returns true if the key was set (meaning it didn't exist)
            Boolean success = redisTemplate.opsForValue().setIfAbsent(redisKey, "PROCESSING", DEFAULT_TTL);
            return Boolean.TRUE.equals(success);
        } catch (Exception e) {
            log.warn("Redis error during idempotency check for key {}: {}", key, e.getMessage());
            // Fallback: allow request if Redis is down
            return true;
        }
    }
    
    /**
     * Optional: Mark request as completed with a specific result to return to subsequent identical requests
     */
    public void markCompleted(String key, String result) {
        if (key == null || key.trim().isEmpty()) return;
        
        String redisKey = IDEMPOTENCY_PREFIX + key;
        try {
            redisTemplate.opsForValue().set(redisKey, result, DEFAULT_TTL);
        } catch (Exception e) {
            log.warn("Redis error while marking idempotency key {} as completed: {}", key, e.getMessage());
        }
    }
}
