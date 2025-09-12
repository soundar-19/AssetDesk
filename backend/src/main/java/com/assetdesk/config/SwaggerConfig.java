package com.assetdesk.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "AssetDesk API",
        version = "1.0.0",
        description = "Asset Management System API for tracking and managing organizational assets."
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local server"),
        @Server(url = "https://assetdesk-api.com", description = "Production server")
    }
)
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new io.swagger.v3.oas.models.info.Info()
                .title("AssetDesk Management API")
                .version("1.0")
                .description("Complete API for asset management, user management, issue tracking, and notifications")
                .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")))
            .externalDocs(new ExternalDocumentation()
                .description("AssetDesk Documentation")
                .url("https://github.com/assetdesk/docs"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}