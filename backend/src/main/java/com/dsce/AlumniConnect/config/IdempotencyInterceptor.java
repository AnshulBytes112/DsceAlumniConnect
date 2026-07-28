package com.dsce.AlumniConnect.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate stringRedisTemplate;
    private static final String IDEMPOTENCY_HEADER = "X-Idempotency-Key";
    private static final String IDEMPOTENCY_PREFIX = "idemp:";
    private static final long EXPIRATION_HOURS = 24;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();

        // Only enforce idempotency on state-mutating requests
        if (HttpMethod.POST.name().equalsIgnoreCase(method) ||
            HttpMethod.PUT.name().equalsIgnoreCase(method) ||
            HttpMethod.DELETE.name().equalsIgnoreCase(method) ||
            HttpMethod.PATCH.name().equalsIgnoreCase(method)) {

            String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);

            if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
                String redisKey = IDEMPOTENCY_PREFIX + idempotencyKey;

                // Try to set the key. If it's already there, this request is a duplicate.
                Boolean success = stringRedisTemplate.opsForValue()
                        .setIfAbsent(redisKey, "PROCESSED", EXPIRATION_HOURS, TimeUnit.HOURS);

                if (Boolean.FALSE.equals(success)) {
                    log.warn("Duplicate request detected with Idempotency-Key: {}", idempotencyKey);
                    response.setStatus(HttpStatus.CONFLICT.value());
                    response.getWriter().write("{\"error\": \"Duplicate request. Please try again later.\"}");
                    response.setContentType("application/json");
                    return false; // Stop the request
                }
            }
        }

        return true; // Proceed with the request
    }
}
