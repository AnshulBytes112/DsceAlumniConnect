package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.AuthResponse;
import com.dsce.AlumniConnect.DTO.GoogleSignUpRequest;
import com.dsce.AlumniConnect.DTO.LogInRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import com.dsce.AlumniConnect.DTO.SignUpRequest;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void forgotPassword(String email) {
        // ponytail: silent success — don't reveal whether email exists
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            // ponytail: always log reset URL — lets you test without SMTP configured
            log.info("=== PASSWORD RESET LINK (dev) === {}", resetUrl);

            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(email);
                msg.setSubject("DSCE Alumni Connect – Password Reset");
                msg.setText("Click the link below to reset your password (expires in 1 hour):\n\n"
                        + resetUrl
                        + "\n\nIf you did not request this, ignore this email.");
                mailSender.send(msg);
                log.info("Password reset email sent to {}", email);
            } catch (Exception mailEx) {
                // ponytail: mail failure must not bubble up as 500 — link is logged above for dev
                log.warn("Could not send reset email to {} — configure SMTP credentials. Error: {}", email, mailEx.getMessage());
            }
        });
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        if (user.getPasswordResetExpiry() == null || LocalDateTime.now().isAfter(user.getPasswordResetExpiry())) {
            throw new RuntimeException("Reset token has expired. Please request a new link.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
        log.info("Password reset successfully for {}", user.getEmail());
    }


    public AuthResponse login(LogInRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getAuthProvider() == User.AuthProvider.GOOGLE) {
                throw new RuntimeException("This account was registered with Google. Please use Google Sign-In.");
            }

            String token = jwtUtils.generateToken(user.getEmail());

            return new AuthResponse(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getProfilePicture(),
                    user.getResumeUrl(),
                    token,
                    user.getRole() != null ? user.getRole().toString() : "USER",
                    user.getProfileComplete() != null ? user.getProfileComplete() : false,
                    user.getVerificationStatus() != null ? user.getVerificationStatus().toString() : "PENDING");

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    public AuthResponse signup(SignUpRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create basic user account
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getGraduationBatch() != null) {
            user.setGraduationYear(request.getGraduationBatch());
        }

        if (request.getGraduationDepartment() != null && !request.getGraduationDepartment().isBlank()) {
            user.setDepartment(request.getGraduationDepartment().trim());
        }

        if (request.getUsn() != null && !request.getUsn().isBlank()) {
            user.setUsn(request.getUsn().trim().toUpperCase());
        }

        user.setRole(User.Role.USER);
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setProfileComplete(false); // Profile setup required after signup
        user.setVerificationStatus(User.VerificationStatus.PENDING);

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getResumeUrl(),
                token,
                user.getRole() != null ? user.getRole().toString() : "USER",
                false, // Profile not complete - redirect to setup
                user.getVerificationStatus() != null ? user.getVerificationStatus().toString() : "PENDING");
    }

    public AuthResponse googleLogin(GoogleSignUpRequest googleSignUpRequest) {

        try {
            GoogleIdToken.Payload payload = googleTokenVerifier.verify(googleSignUpRequest.getAccessToken());
            String email = payload.getEmail();
            String firstname = (String) payload.get("given_name");
            String lastname = (String) payload.get("family_name");
            String picture = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setFirstName(firstname);
                user.setLastName(lastname);
                user.setProfilePicture(picture);
                user.setAuthProvider(User.AuthProvider.GOOGLE); // mark as Google signup
                user.setPassword(null); // no password needed
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                user.setProfileComplete(false);
                user.setVerificationStatus(User.VerificationStatus.PENDING);
                userRepository.save(user);
            }

            String token = jwtUtils.generateToken(user.getEmail());

            return new AuthResponse(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getProfilePicture(),
                    user.getResumeUrl(),
                    token,
                    user.getRole() != null ? user.getRole().toString() : "USER",
                    user.getProfileComplete() != null ? user.getProfileComplete() : false,
                    user.getVerificationStatus() != null ? user.getVerificationStatus().toString() : "PENDING");

        } catch (Exception e) {
            throw new RuntimeException("Google login failed: " + e.getMessage());
        }
    }
}
