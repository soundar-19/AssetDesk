package com.assetdesk.aspect;

import com.assetdesk.service.SSEService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SSEAspect {
    
    private final SSEService sseService;
    
    @AfterReturning(
        pointcut = "execution(* com.assetdesk.controller.*.*(..)) && " +
                  "(@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
                  "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
                  "@annotation(org.springframework.web.bind.annotation.DeleteMapping))",
        returning = "result"
    )
    public void sendUpdateAfterModification(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String eventType = extractEventType(className, methodName);
            
            sseService.sendUpdate(eventType, result);
            log.debug("SSE update sent: {}", eventType);
        } catch (Exception e) {
            log.error("Error sending SSE update", e);
        }
    }
    
    private String extractEventType(String className, String methodName) {
        String entity = className.replace("Controller", "").toLowerCase();
        
        if (methodName.contains("create") || methodName.contains("add") || methodName.contains("save")) {
            return entity + "-created";
        } else if (methodName.contains("update") || methodName.contains("edit")) {
            return entity + "-updated";
        } else if (methodName.contains("delete") || methodName.contains("remove")) {
            return entity + "-deleted";
        }
        
        return entity + "-changed";
    }
}