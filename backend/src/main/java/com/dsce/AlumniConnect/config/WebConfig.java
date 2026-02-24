package com.dsce.AlumniConnect.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Get the current working directory (project root)
                String projectPath = System.getProperty("user.dir");

                // Serve files from the profiles directory
                registry.addResourceHandler("/profiles/**")
                                .addResourceLocations("file:" + projectPath + "/profiles/");

                // Serve files from the resumes directory
                registry.addResourceHandler("/resumes/**")
                                .addResourceLocations("file:" + projectPath + "/resumes/");

                // Serve uploaded images - point to the correct backend uploads directory
                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations("file:" + projectPath + "/uploads/");
        }

        @Bean
        public ModelMapper modelMapper() {
                return new ModelMapper();
        }
}
