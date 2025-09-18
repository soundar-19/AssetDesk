package com.assetdesk.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SSEService {
    
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    
    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));
        
        return emitter;
    }
    
    public void sendUpdate(String eventType, Object data) {
        emitters.removeIf(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventType)
                    .data(data));
                return false;
            } catch (IOException e) {
                log.debug("SSE connection closed");
                return true;
            }
        });
    }
}