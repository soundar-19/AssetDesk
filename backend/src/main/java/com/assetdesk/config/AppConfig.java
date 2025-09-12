package com.assetdesk.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    
    @Value("${app.system-user-id:1}")
    private Long systemUserId;
    
    public Long getSystemUserId() {
        return systemUserId;
    }
}