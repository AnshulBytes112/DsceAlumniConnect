package com.dsce.AlumniConnect.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Aspect
@Component
@Slf4j
public class PerformanceProfilingInterceptor {

    public static final ConcurrentHashMap<String, AtomicLong> methodExecutionTimes = new ConcurrentHashMap<>();
    public static final ConcurrentHashMap<String, AtomicLong> methodExecutionCounts = new ConcurrentHashMap<>();

    // Profile all controllers
    @Around("execution(* com.dsce.AlumniConnect.Controller..*(..))")
    public Object profileControllers(ProceedingJoinPoint joinPoint) throws Throwable {
        return profile(joinPoint, "CONTROLLER");
    }

    // Profile all services
    @Around("execution(* com.dsce.AlumniConnect.Service..*(..))")
    public Object profileServices(ProceedingJoinPoint joinPoint) throws Throwable {
        return profile(joinPoint, "SERVICE");
    }

    // Profile all repositories
    @Around("execution(* com.dsce.AlumniConnect.Repository..*(..))")
    public Object profileRepositories(ProceedingJoinPoint joinPoint) throws Throwable {
        return profile(joinPoint, "REPOSITORY");
    }

    private Object profile(ProceedingJoinPoint joinPoint, String layer) throws Throwable {
        long start = System.currentTimeMillis();
        Object proceed = null;
        try {
            proceed = joinPoint.proceed();
        } finally {
            long executionTime = System.currentTimeMillis() - start;
            String signature = joinPoint.getSignature().toShortString();
            
            methodExecutionTimes.computeIfAbsent(signature, k -> new AtomicLong(0)).addAndGet(executionTime);
            methodExecutionCounts.computeIfAbsent(signature, k -> new AtomicLong(0)).incrementAndGet();
            
            if (executionTime > 50) { // Log slow methods immediately
                log.info("[PROFILER] {} - {} executed in {} ms", layer, signature, executionTime);
            }
        }
        return proceed;
    }
}
