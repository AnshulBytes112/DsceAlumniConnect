package com.dsce.AlumniConnect;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class AlumniConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlumniConnectApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository) {
		return args -> {
			String adminEmail = "admin@example.com";
			if (userRepository.findByEmail(adminEmail).isEmpty()) {
				User admin = new User(
						"Super",
						"Admin",
						adminEmail,
						new BCryptPasswordEncoder().encode("admin123"), // hashed password
						User.Role.ADMIN
				);
				userRepository.save(admin);
				System.out.println("Admin user created!");
			}
		};
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

}
