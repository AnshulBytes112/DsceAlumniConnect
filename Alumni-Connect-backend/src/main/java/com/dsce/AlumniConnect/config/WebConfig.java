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
                // Serve files from the profiles directory
                registry.addResourceHandler("/profiles/**")
                                .addResourceLocations(
                                                "file:/home/yash/Desktop/alum/DsceAlumniConnect/profiles/");

                // Serve files from the resumes directory
                registry.addResourceHandler("/resumes/**")
                                .addResourceLocations("file:/home/yash/Desktop/alum/DsceAlumniConnect/resumes/");

                // Serve uploaded images - point to the correct backend uploads directory
                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations(
                                                "file:/home/yash/Desktop/alum/DsceAlumniConnect/Alumni-Connect-backend/uploads/");
        }

        @Bean
        public ModelMapper modelMapper() {
                return new ModelMapper();
        }
}
