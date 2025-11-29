package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.AuthResponse;
import com.dsce.AlumniConnect.DTO.ErrorResponse;

import com.dsce.AlumniConnect.DTO.GoogleSignUpRequest;
import com.dsce.AlumniConnect.DTO.LogInRequest;
import com.dsce.AlumniConnect.DTO.SignUpRequest;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.Service.AuthService;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.utils.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthService authService;

    private final ObjectMapper objectMapper;

    @Autowired
    private JwtUtils jwtUtil;

    @PostMapping(value = "signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> signup (@RequestPart("data") String signUpRequestJson,
                                     @RequestPart("profile") MultipartFile profilePicture,
    @RequestPart("resume") MultipartFile resume) {
        try {
            SignUpRequest signUpRequest = objectMapper.readValue(signUpRequestJson, SignUpRequest.class);
            log.info("Signup request received for email: {}", signUpRequest.getEmail());
            AuthResponse response = authService.signup(signUpRequest,resume,profilePicture);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Signup failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LogInRequest loginRequest) {
        try {
            log.info("Login request received for email: {}", loginRequest.getEmail());
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    @PostMapping("/google")
    private ResponseEntity<?> googleLogin(@RequestBody GoogleSignUpRequest googleSignUpRequest){
        return ResponseEntity.ok(authService.googleLogin(googleSignUpRequest));
    }
}
