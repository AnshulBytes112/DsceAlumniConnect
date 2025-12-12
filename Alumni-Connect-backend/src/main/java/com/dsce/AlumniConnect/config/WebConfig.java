package com.dsce.AlumniConnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from the profiles directory
        registry.addResourceHandler("/profiles/**")
                .addResourceLocations("file:///C:/Users/ANSHUL/ALUMNI-CONNECT/ALUMNI-CONNECT/profiles/");
        
        // Serve files from the resumes directory  
        registry.addResourceHandler("/resumes/**")
                .addResourceLocations("file:///C:/Users/ANSHUL/ALUMNI-CONNECT/ALUMNI-CONNECT/resumes/");
    }
}
