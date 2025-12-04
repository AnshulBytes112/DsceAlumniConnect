package com.dsce.AlumniConnect;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.session.SessionAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication(exclude = {SessionAutoConfiguration.class})
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
		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(new JavaTimeModule());
		mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		return mapper;
	}

}
