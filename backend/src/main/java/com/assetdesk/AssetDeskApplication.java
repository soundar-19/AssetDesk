package com.assetdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy
public class AssetDeskApplication {

	public static void main(String[] args) {
		SpringApplication.run(AssetDeskApplication.class, args);
	}

}