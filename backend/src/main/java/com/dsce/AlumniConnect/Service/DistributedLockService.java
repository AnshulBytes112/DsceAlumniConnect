package com.dsce.AlumniConnect.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class DistributedLockService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String LOCK_PREFIX = "lock:";

    /**
     * Attempts to acquire a distributed lock.
     * 
     * @param lockKey The unique key for the lock
     * @param timeout The duration for which the lock should be held
     * @return true if lock was acquired, false otherwise
     */
    public boolean acquireLock(String lockKey, Duration timeout) {
        String key = LOCK_PREFIX + lockKey;
        try {
            Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "LOCKED", timeout);
            return Boolean.TRUE.equals(success);
        } catch (Exception e) {
            log.warn("Failed to acquire lock for key {} due to Redis error: {}", key, e.getMessage());
            // Fallback: allow operation to proceed if Redis is down (or deny based on strictness requirements)
            return true; 
        }
    }

    /**
     * Releases a distributed lock.
     * 
     * @param lockKey The unique key for the lock
     */
    public void releaseLock(String lockKey) {
        String key = LOCK_PREFIX + lockKey;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Failed to release lock for key {} due to Redis error: {}", key, e.getMessage());
        }
    }
}
