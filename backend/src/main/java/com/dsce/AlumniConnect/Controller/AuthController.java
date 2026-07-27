package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.AuthResponse;
import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.ForgotPasswordRequest;
import com.dsce.AlumniConnect.DTO.ResetPasswordRequest;
import com.dsce.AlumniConnect.DTO.GoogleSignUpRequest;
import com.dsce.AlumniConnect.DTO.LogInRequest;
import com.dsce.AlumniConnect.DTO.SignUpRequest;
import com.dsce.AlumniConnect.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({ "/api/auth", "/auth" })
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            log.info("Signup request received for email: {}", signUpRequest.getEmail());
            AuthResponse response = authService.signup(signUpRequest);
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
    // ponytail: always returns 200 — don't leak whether email exists
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(java.util.Map.of("message", "If the email exists, a reset link has been sent."));
        } catch (Exception e) {
            log.error("Forgot password failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            authService.resetPassword(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully."));
        } catch (Exception e) {
            log.error("Reset password failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@jakarta.validation.Valid @RequestBody GoogleSignUpRequest googleSignUpRequest) {
        try {
            log.info("Google login request received");
            AuthResponse response = authService.googleLogin(googleSignUpRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Google login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}
